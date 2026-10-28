// The real server and built site, set up for end-to-end tests. Never used in production.
// - Data lives in a throwaway file and is reset with POST /test/reset before each test.
// - Google sign-in is checked against a key made here instead of Google's, and
//   GET /test/google-token issues a signed sign-in for any test shopper.
// - Rate limits are off so tests can sign in as often as they need.
import express from 'express'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import { createApp, finishApp } from '../../server/app.js'
import { setGoogleKeys } from '../../server/auth.js'
import { seed } from '../../server/seed.js'
import { fileStore } from '../../server/store/file.js'

export const OWNER_PASSWORD = 'owner-test-pass'
const CLIENT_ID = 'e2e-tests.apps.googleusercontent.com'
const PORT = 4310

process.env.ADMIN_PASSWORD = OWNER_PASSWORD
process.env.SESSION_SECRET = 'e2e-session-secret-not-for-production'
process.env.GOOGLE_CLIENT_ID = CLIENT_ID

const { publicKey, privateKey } = await generateKeyPair('RS256')
setGoogleKeys(createLocalJWKSet({ keys: [{ ...(await exportJWK(publicKey)), kid: 'e2e', alg: 'RS256' }] }))

const dir = mkdtempSync(join(tmpdir(), 'taru-e2e-'))
const store = { ...fileStore({ dbFile: join(dir, 'db.json'), uploads: join(dir, 'uploads') }), hit: async () => 0 }
const app = createApp(store)

app.post('/test/reset', async (req, res) => {
  await store.write((db) => Object.assign(db, seed()))
  res.json({ ok: true })
})

app.get('/test/google-token', async (req, res) => {
  const { email = 'asha@gmail.com', name = 'Asha Karki' } = req.query
  const token = await new SignJWT({ email, email_verified: true, name })
    .setProtectedHeader({ alg: 'RS256', kid: 'e2e' })
    .setSubject(`google-${email}`)
    .setIssuer('https://accounts.google.com')
    .setAudience(CLIENT_ID)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey)
  res.send(token)
})

const dist = join(process.cwd(), 'dist')
app.use(express.static(dist))
app.get(/^\/(?!api|uploads|test).*/, (req, res) => res.sendFile(join(dist, 'index.html')))
finishApp(app).listen(PORT, () => console.log(`E2E test shop on http://localhost:${PORT}`))
