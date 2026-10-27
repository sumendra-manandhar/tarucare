import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate, seed } from '../seed.js'

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..')
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

// Local storage: a JSON file plus an uploads folder. Used by `npm run dev` / `npm start`.
export function fileStore({ dbFile = process.env.DB_FILE || join(SERVER, 'db.json'), uploads = join(SERVER, 'uploads') } = {}) {
  mkdirSync(uploads, { recursive: true })
  let db = existsSync(dbFile) ? JSON.parse(readFileSync(dbFile, 'utf8')) : seed()
  const migrated = migrate(db) || !existsSync(dbFile)

  // Writes are chained so concurrent requests can't interleave, and go through a temp file +
  // rename so a crash mid-write never leaves a half-written database.
  let queue = Promise.resolve()
  const persist = async () => {
    const tmp = `${dbFile}.tmp`
    await writeFile(tmp, JSON.stringify(db, null, 2))
    await rename(tmp, dbFile)
  }
  if (migrated) queue = queue.then(persist)
  const hits = new Map()

  return {
    name: 'file',
    async read() {
      return structuredClone(db)
    },
    // Runs fn on the latest data; whatever fn leaves in `draft` is saved if it doesn't throw.
    write(fn) {
      const run = queue.then(async () => {
        const draft = structuredClone(db)
        const result = await fn(draft)
        db = draft
        await persist()
        return result
      })
      queue = run.catch(() => {})
      return run
    },
    async putPhoto(name, buffer) {
      await writeFile(join(uploads, name), buffer)
    },
    async getPhoto(name) {
      try {
        return { body: await readFile(join(uploads, name)), type: TYPES[name.slice(name.lastIndexOf('.'))] ?? 'application/octet-stream' }
      } catch {
        return null
      }
    },
    async deletePhoto(name) {
      await unlink(join(uploads, name)).catch(() => {})
    },
    async hit(key, windowMs) {
      const now = Date.now()
      const e = hits.get(key)
      if (!e || e.reset < now) {
        hits.set(key, { count: 1, reset: now + windowMs })
        return 1
      }
      return ++e.count
    },
  }
}
