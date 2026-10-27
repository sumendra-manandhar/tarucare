import { demoApi } from './demoApi'

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

export const DEMO = !!import.meta.env.VITE_DEMO

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

// Static previews have no server, so they run against an in-browser copy of the API.
export const api = DEMO ? demoApi : serverApi
