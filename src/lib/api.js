import { demoApi, startDemoSession } from './demoApi'

async function request(path, { method = 'GET', body, form } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

// Static preview builds have no server at all.
export const DEMO_BUILD = !!import.meta.env.VITE_DEMO

// Visitors can also try the admin on the live site in demo mode: requests then go to an
// in-browser copy of the API with sample data, so the real shop is never touched.
const DEMO_KEY = 'taru:demo-mode'
const session = (fn) => {
  try {
    return fn(sessionStorage)
  } catch {
    return null
  }
}
export const isDemo = () => DEMO_BUILD || session((s) => s.getItem(DEMO_KEY)) === '1'
export function enterDemo() {
  session((s) => s.setItem(DEMO_KEY, '1'))
  startDemoSession()
}
export function exitDemo() {
  session((s) => s.removeItem(DEMO_KEY))
  demoApi.post('/auth/logout').catch(() => {})
}

const serverApi = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  upload: (file) => {
    const form = new FormData()
    form.append('image', file)
    return request('/uploads', { method: 'POST', form })
  },
}

const pick = () => (isDemo() ? demoApi : serverApi)
export const api = {
  get: (p) => pick().get(p),
  post: (p, body) => pick().post(p, body),
  put: (p, body) => pick().put(p, body),
  patch: (p, body) => pick().patch(p, body),
  del: (p) => pick().del(p),
  upload: (file) => pick().upload(file),
}
