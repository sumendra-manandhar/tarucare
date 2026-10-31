import { createApp, finishApp } from '../server/app.js'
import { pickStore } from '../server/store/index.js'

// Vercel serverless function: vercel.json sends /api/* and /uploads/* here.
// Data and photos live in Supabase (or Upstash) because the function's own disk doesn't persist.
let app
export default function handler(req, res) {
  if (!app) {
    const store = pickStore({ allowFile: false })
    if (!store) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Storage is not connected. Add SUPABASE_URL and SUPABASE_SECRET_KEY to the Vercel project and redeploy.' }))
    }
    app = finishApp(createApp(store))
  }
  return app(req, res)
}
