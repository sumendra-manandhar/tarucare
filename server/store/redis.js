import { Redis } from '@upstash/redis'
import { randomUUID } from 'node:crypto'
import { migrate, seed } from '../seed.js'

const DB_KEY = 'taru:db'
const LOCK_KEY = 'taru:lock'
const photoKey = (name) => `taru:photo:${name}`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Vercel's Upstash integration exposes either KV_* or UPSTASH_REDIS_* variables.
export function redisConfig(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN
  return url && token ? { url, token } : null
}

// Serverless storage: the whole database is one JSON value, photos are stored per key.
// Every request reads fresh data because each function instance has its own memory.
export function redisStore(redis = new Redis(redisConfig())) {
  async function load() {
    const db = (await redis.get(DB_KEY)) ?? seed()
    migrate(db)
    return db
  }

  // A short-lived lock stops two orders landing at once from overwriting each other's stock changes.
  async function withLock(fn) {
    const token = randomUUID()
    for (let i = 0; ; i++) {
      if (await redis.set(LOCK_KEY, token, { nx: true, px: 10_000 })) break
      if (i > 60) throw new Error('The shop is busy, please try again in a moment.')
      await sleep(100)
    }
    try {
      return await fn()
    } finally {
      if ((await redis.get(LOCK_KEY)) === token) await redis.del(LOCK_KEY)
    }
  }

  return {
    name: 'redis',
    read: load,
    write: (fn) =>
      withLock(async () => {
        const draft = await load()
        const result = await fn(draft)
        await redis.set(DB_KEY, draft)
        return result
      }),
    async putPhoto(name, buffer, type) {
      await redis.set(photoKey(name), { type, data: buffer.toString('base64') })
    },
    async getPhoto(name) {
      const v = await redis.get(photoKey(name))
      return v ? { body: Buffer.from(v.data, 'base64'), type: v.type } : null
    },
    async deletePhoto(name) {
      await redis.del(photoKey(name))
    },
    async hit(key, windowMs) {
      const n = await redis.incr(`taru:rate:${key}`)
      if (n === 1) await redis.pexpire(`taru:rate:${key}`, windowMs)
      return n
    },
  }
}
