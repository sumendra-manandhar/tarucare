import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './lib/api'

const AccountContext = createContext(null)

// The signed-in shopper (Google account), their saved delivery details and order history.
export function AccountProvider({ children }) {
  const [config, setConfig] = useState({ googleClientId: null })
  const [customer, setCustomer] = useState(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/config').catch(() => ({})), api.get('/customer/me').catch(() => null)]).then(([cfg, me]) => {
      setConfig({ googleClientId: null, ...cfg })
      setCustomer(me)
      setReady(true)
    })
  }, [])

  const signInWithGoogle = useCallback(async (credential) => setCustomer(await api.post('/customer/google', { credential })), [])
  const signInDemo = useCallback(async () => setCustomer(await api.post('/customer/demo')), [])
  const signOut = useCallback(async () => {
    await api.post('/customer/logout').catch(() => {})
    window.google?.accounts?.id?.disableAutoSelect?.()
    setCustomer(null)
  }, [])
  const update = useCallback(async (patch) => setCustomer(await api.put('/customer/me', patch)), [])
  const refresh = useCallback(() => api.get('/customer/me').then(setCustomer).catch(() => {}), [])

  // Sign-in is possible with real Google sign-in, or with the demo customer in demo mode.
  const canSignIn = !!config.googleClientId || !!config.demo

  const value = { config, customer, ready, canSignIn, open, setOpen, signInWithGoogle, signInDemo, signOut, update, refresh }
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export const useAccount = () => useContext(AccountContext)

// Loads Google's sign-in script once, on first use.
let gsi
export function loadGoogleScript() {
  gsi ??= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google)
    const s = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true, defer: true })
    const fail = () => {
      gsi = null
      reject(new Error('Google sign-in could not load. Check your connection and try again.'))
    }
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google) : fail())
    s.onerror = fail
    document.head.appendChild(s)
  })
  return gsi
}
