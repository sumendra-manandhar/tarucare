import { createHmac, timingSafeEqual } from 'node:crypto'

const SECRET = process.env.SESSION_SECRET
const PASSWORD = process.env.ADMIN_PASSWORD
const COOKIE = 'taru_admin'
const TTL_MS = 1000 * 60 * 60 * 12 // 12h

if (!SECRET || !PASSWORD) {
  console.error('ADMIN_PASSWORD and SESSION_SECRET must be set (see .env.example).')
  process.exit(1)
}

const sign = (payload) => createHmac('sha256', SECRET).update(payload).digest('base64url')

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export function checkPassword(input) {
  return safeEqual(input ?? '', PASSWORD)
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
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now()
}

export function requireAdmin(req, res, next) {
  if (isAuthed(req)) return next()
  res.status(401).json({ error: 'Not signed in' })
}

// Tiny fixed-window limiter keyed by IP — enough to slow down brute force and form spam.
export function rateLimit({ windowMs, max }) {
  const hits = new Map()
  return (req, res, next) => {
    const now = Date.now()
    const key = req.ip
    const entry = hits.get(key)
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs })
      return next()
    }
    if (++entry.count > max) return res.status(429).json({ error: 'Too many requests, please try again later.' })
    next()
  }
}
