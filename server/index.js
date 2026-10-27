import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp, finishApp } from './app.js'
import { adminConfigured } from './auth.js'
import { fileStore } from './store/file.js'
import { redisConfig, redisStore } from './store/redis.js'

// Local / self-hosted server. Uses Upstash Redis when its variables are set (same data as
// the Vercel deployment), otherwise server/db.json and server/uploads/.
const store = redisConfig() ? redisStore() : fileStore()
const app = createApp(store)

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(join(DIST, 'index.html')))
}
finishApp(app)

if (!adminConfigured()) console.warn('ADMIN_PASSWORD is not set: the admin panel will refuse to sign in.')
const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => console.log(`TARU CARE server on http://localhost:${PORT} (${store.name} storage)`))
