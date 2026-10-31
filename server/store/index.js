import { fileStore } from './file.js'
import { redisConfig, redisStore } from './redis.js'
import { supabaseConfig, supabaseStore } from './supabase.js'

// Where the shop's data lives, in order of preference:
// Supabase (SUPABASE_URL + secret key) → Upstash Redis → server/db.json (local only).
export function pickStore({ allowFile = true } = {}) {
  if (supabaseConfig()) return supabaseStore()
  if (redisConfig()) return redisStore()
  return allowFile ? fileStore() : null
}
