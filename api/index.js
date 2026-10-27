import { createApp, finishApp } from '../server/app.js'
import { redisConfig, redisStore } from '../server/store/redis.js'

// Vercel serverless function: vercel.json sends /api/* and /uploads/* here.
// Data and photos live in Upstash Redis because the function's own disk doesn't persist.
let app
export default function handler(req, res) {
  if (!redisConfig()) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Storage is not connected. In Vercel, add an Upstash Redis database to this project (Storage tab) and redeploy.' }))
  }
  app ??= finishApp(createApp(redisStore()))
  return app(req, res)
}
