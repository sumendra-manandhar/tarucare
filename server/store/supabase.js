import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { migrate, seed } from '../seed.js'

const BUCKET = 'product-photos'
const LOCK = 'shop'
const PAGE = 1000 // Supabase returns at most 1,000 rows per request
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Each list in the app's data lives in its own table (see supabase/migrations).
// Small, hand-ordered lists keep their order in `position`; growing lists are ordered by date.
const TABLES = {
  products: { by: 'position' },
  roles: { by: 'position' },
  staff: { by: 'position' },
  customers: { by: 'created_at' },
  orders: { by: 'created_at', newestFirst: true },
  inquiries: { by: 'created_at', newestFirst: true },
}

// The secret (service role) key stays on the server; it is never sent to the browser.
export function supabaseConfig(env = process.env) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? { url, key } : null
}

export function supabaseStore(config = supabaseConfig()) {
  const sb = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } })
  const check = ({ data, error }) => {
    if (error) throw new Error(`Supabase: ${error.message}`)
    return data
  }

  async function selectAll(table, { by, newestFirst }) {
    const rows = []
    for (let from = 0; ; from += PAGE) {
      const page = check(
        await sb.from(table).select('data').order(by, { ascending: !newestFirst }).order('id', { ascending: !newestFirst }).range(from, from + PAGE - 1),
      )
      rows.push(...page.map((r) => r.data))
      if (page.length < PAGE) return rows
    }
  }

  // The whole shop as the app sees it, or null when the database is still empty.
  async function load() {
    const [settings, ...lists] = await Promise.all([
      sb.from('settings').select('data').eq('id', 1).maybeSingle().then(check),
      ...Object.entries(TABLES).map(([table, opts]) => selectAll(table, opts)),
    ])
    if (!settings) return null
    const db = { settings: settings.data, ...Object.fromEntries(Object.keys(TABLES).map((t, i) => [t, lists[i]])) }
    migrate(db)
    return db
  }

  // A row's fingerprint: its contents, plus its place for position-ordered tables.
  const signature = (table, row, i) => JSON.stringify(row) + (TABLES[table].by === 'position' ? `#${i}` : '')
  const fingerprints = (db) =>
    Object.fromEntries(Object.keys(TABLES).map((t) => [t, new Map((db?.[t] ?? []).map((r, i) => [r.id, signature(t, r, i)]))]))

  // Only rows that changed are sent, and taru_save writes them in one transaction.
  function changesBetween(before, beforeSettings, draft) {
    const changes = {}
    const now = new Date().toISOString()
    for (const [t, { by }] of Object.entries(TABLES)) {
      const rows = draft[t] ?? []
      const ids = new Set(rows.map((r) => r.id))
      const upsert = rows
        .map((r, i) => [r, i])
        .filter(([r, i]) => before[t].get(r.id) !== signature(t, r, i))
        .map(([r, i]) => (by === 'position' ? { id: r.id, data: r, position: i } : { id: r.id, data: r, created_at: r.createdAt ?? now }))
      const remove = [...before[t].keys()].filter((id) => !ids.has(id))
      if (upsert.length || remove.length) changes[t] = { upsert, delete: remove }
    }
    if (JSON.stringify(draft.settings) !== beforeSettings) changes.settings = draft.settings
    return changes
  }

  // A short-lived lock in the database stops two orders landing at once from both taking the last stock.
  async function withLock(fn) {
    const token = randomUUID()
    for (let i = 0; ; i++) {
      if (check(await sb.rpc('taru_try_lock', { p_name: LOCK, p_token: token, p_ttl_ms: 15_000 }))) break
      if (i > 60) throw new Error('The shop is busy, please try again in a moment.')
      await sleep(100)
    }
    try {
      return await fn()
    } finally {
      await sb.rpc('taru_unlock', { p_name: LOCK, p_token: token })
    }
  }

  const write = (fn) =>
    withLock(async () => {
      const current = await load()
      const draft = current ?? seed() // an empty database starts from the seed products and settings
      const before = fingerprints(current)
      const beforeSettings = JSON.stringify(current?.settings ?? null)
      const result = await fn(draft)
      const changes = changesBetween(before, beforeSettings, draft)
      if (Object.keys(changes).length) check(await sb.rpc('taru_save', { p_changes: changes }))
      return result
    })

  return {
    name: 'supabase',
    async read() {
      const db = await load()
      if (db) return db
      await write(() => {}) // first visit: save the seed so the tables aren't empty
      return load()
    },
    write,
    async putPhoto(name, buffer, type) {
      check(await sb.storage.from(BUCKET).upload(name, buffer, { contentType: type, cacheControl: '31536000', upsert: false }))
    },
    // Photos are served by Supabase's CDN; /uploads/<name> just points there.
    async getPhoto(name) {
      return { redirect: sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl }
    },
    async deletePhoto(name) {
      check(await sb.storage.from(BUCKET).remove([name]))
    },
    async hit(key, windowMs) {
      return check(await sb.rpc('taru_hit', { p_key: key, p_window_ms: windowMs }))
    },
  }
}
