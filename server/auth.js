import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'taru_admin'
const TTL_MS = 1000 * 60 * 60 * 12 // 12h

// Read lazily so a missing variable gives a clear error instead of crashing the server.
// SESSION_SECRET is optional: without it, sessions are signed with a key derived from the
// password, so changing the password also signs everyone out.
const password = () => process.env.ADMIN_PASSWORD ?? ''
const secret = () => process.env.SESSION_SECRET || createHash('sha256').update(`taru-session:${password()}`).digest('hex')
export const adminConfigured = () => password().length > 0

const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url')

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export function checkPassword(input) {
  return adminConfigured() && safeEqual(input ?? '', password())
}

// Stateless session: "<expiry>.<hmac(expiry)>" in an httpOnly cookie.
export function issueSession(res) {
  const exp = String(Date.now() + TTL_MS)
  res.cookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TTL_MS,
    path: '/',
  })
}

export function clearSession(res) {
  res.clearCookie(COOKIE, { path: '/' })
}

export function isAuthed(req) {
  const [exp, sig] = String(req.cookies?.[COOKIE] ?? '').split('.')
  return adminConfigured() && !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now()
}

export function requireAdmin(req, res, next) {
  if (isAuthed(req)) return next()
  res.status(401).json({ error: 'Not signed in' })
}

// Fixed-window limiter keyed by route + IP, counted in the store so it holds across
// serverless instances. Enough to slow down password guessing and form spam.
export function rateLimit(store, { name, windowMs, max }) {
  return async (req, res, next) => {
    try {
      if ((await store.hit(`${name}:${req.ip}`, windowMs)) > max) return res.status(429).json({ error: 'Too many requests, please try again later.' })
    } catch {
      /* never block a customer because the counter is unavailable */
    }
    next()
  }
}
