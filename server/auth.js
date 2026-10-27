import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { PERMISSIONS } from '../src/data.js'

const ADMIN_COOKIE = 'taru_admin'
const CUSTOMER_COOKIE = 'taru_customer'
const ADMIN_TTL = 1000 * 60 * 60 * 12 // 12h
const CUSTOMER_TTL = 1000 * 60 * 60 * 24 * 30 // 30 days
export const ALL_PERMISSIONS = PERMISSIONS.map((p) => p.key)

// Read lazily so a missing variable gives a clear error instead of crashing the server.
// SESSION_SECRET is optional: without it, sessions are signed with a key derived from the
// owner password, so changing the password also signs everyone out.
const password = () => process.env.ADMIN_PASSWORD ?? ''
const secret = () => process.env.SESSION_SECRET || (password() && createHash('sha256').update(`taru-session:${password()}`).digest('hex'))
export const adminConfigured = () => password().length > 0
export const sessionsConfigured = () => !!secret()
export const googleClientId = () => process.env.GOOGLE_CLIENT_ID ?? ''

const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url')

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

// ---------- signed cookies: "<base64 json>.<hmac>" ----------
function issue(res, name, data, ttl, sameSite) {
  const body = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + ttl })).toString('base64url')
  res.cookie(name, `${body}.${sign(`${name}.${body}`)}`, {
    httpOnly: true,
    sameSite,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ttl,
    path: '/',
  })
}

function read(req, name) {
  if (!sessionsConfigured()) return null
  const [body, sig] = String(req.cookies?.[name] ?? '').split('.')
  if (!body || !sig || !safeEqual(sig, sign(`${name}.${body}`))) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString())
    return data.exp > Date.now() ? data : null
  } catch {
    return null
  }
}

// ---------- passwords ----------
export function hashPassword(pw) {
  const salt = randomBytes(16).toString('base64url')
  return `scrypt$${salt}$${scryptSync(pw, salt, 64).toString('base64url')}`
}

export function verifyPassword(pw, stored) {
  const [, salt, hash] = String(stored ?? '').split('$')
  if (!salt || !hash) return false
  return safeEqual(scryptSync(String(pw ?? ''), salt, 64).toString('base64url'), hash)
}

export const checkOwnerPassword = (input) => adminConfigured() && safeEqual(input ?? '', password())

// ---------- admin & staff sessions ----------
export function issueAdminSession(res, who, version = 0) {
  issue(res, ADMIN_COOKIE, { who, v: version }, ADMIN_TTL, 'strict')
}
export const clearAdminSession = (res) => res.clearCookie(ADMIN_COOKIE, { path: '/' })

// Looks the signed-in person up on every request, so role changes, password resets and
// deactivated accounts take effect immediately.
export function adminUser(req, db) {
  const s = read(req, ADMIN_COOKIE)
  if (!s) return null
  if (s.who === 'owner') {
    return adminConfigured() ? { id: 'owner', name: 'Owner', email: '', owner: true, role: 'Owner', permissions: ALL_PERMISSIONS } : null
  }
  const staff = db.staff.find((x) => x.id === s.who)
  if (!staff || !staff.active || s.v !== (staff.sessionVersion ?? 0)) return null
  const role = db.roles.find((r) => r.id === staff.roleId)
  return { id: staff.id, name: staff.name, email: staff.email, owner: false, role: role?.name ?? 'No role', permissions: role?.permissions ?? [] }
}

// ---------- customer sessions (Google sign-in) ----------
export const issueCustomerSession = (res, id) => issue(res, CUSTOMER_COOKIE, { cid: id }, CUSTOMER_TTL, 'lax')
export const clearCustomerSession = (res) => res.clearCookie(CUSTOMER_COOKIE, { path: '/' })
export const customerId = (req) => read(req, CUSTOMER_COOKIE)?.cid ?? null

let googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
// Tests swap in their own signing keys.
export const setGoogleKeys = (keys) => (googleKeys = keys)

// Verifies the ID token from Google's "Sign in with Google" button and returns the person.
export async function verifyGoogleCredential(credential) {
  const { payload } = await jwtVerify(String(credential ?? ''), googleKeys, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: googleClientId(),
  })
  if (!payload.email || payload.email_verified === false) throw new Error('Google account email is not verified')
  return { sub: payload.sub, email: String(payload.email).toLowerCase(), name: payload.name ?? payload.email, picture: payload.picture ?? '' }
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
