import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Inbox, LayoutDashboard, Loader2, Lock, LogOut, Menu, Package, Settings as SettingsIcon, ShoppingCart, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Logo } from '../components/Illustrations'
import { api, DEMO } from '../lib/api'
import { DEMO_PASSWORD } from '../lib/demoApi'
import Dashboard from './Dashboard'
import Inquiries from './Inquiries'
import Orders from './Orders'
import Products from './Products'
import Settings from './Settings'
import { Button, inputClass, OverlayProvider, useToast } from './ui'

const pages = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, component: Dashboard },
  orders: { label: 'Orders', icon: ShoppingCart, component: Orders },
  products: { label: 'Products', icon: Package, component: Products },
  inquiries: { label: 'Inquiries', icon: Inbox, component: Inquiries },
  settings: { label: 'Settings', icon: SettingsIcon, component: Settings },
}

// Static previews keep the admin under #admin, so pages there are #admin-orders etc.
const SITE_URL = DEMO ? '#top' : '/'
const hashFor = (key) => (DEMO ? (key === 'dashboard' ? '#admin' : `#admin-${key}`) : `/${key}`)
const pageFromHash = () => {
  const key = window.location.hash.replace(DEMO ? /^#admin-?/ : '#/', '')
  return pages[key] ? key : 'dashboard'
}

function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/login', { password })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grain relative grid min-h-screen place-items-center bg-forest p-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-3xl bg-cream p-8 shadow-2xl"
      >
        <Logo className="mx-auto" />
        <h1 className="mt-6 text-center font-serif text-2xl text-forest">Admin Panel</h1>
        <p className="mt-1 text-center text-sm text-slate/60">Sign in to manage your store</p>
        <label className="mt-8 block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-forest">
            <Lock size={14} /> Password
          </span>
          <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="mt-6 w-full py-3">Sign in</Button>
        {DEMO && (
          <p className="mt-4 rounded-xl bg-sand px-3 py-2 text-center text-xs text-slate/70">
            Demo password: <span className="font-mono font-semibold text-forest">{DEMO_PASSWORD}</span>
          </p>
        )}
        <a href={SITE_URL} className="mt-4 block text-center text-xs text-slate/50 hover:text-forest">← Back to website</a>
      </motion.form>
    </div>
  )
}

function Shell({ onLogout }) {
  const toast = useToast()
  const [page, setPage] = useState(pageFromHash)
  const [navOpen, setNavOpen] = useState(false)
  const [data, setData] = useState(null)

  const reload = useCallback(async () => {
    try {
      const [products, inquiries, settings, orders] = await Promise.all([api.get('/products?all=1'), api.get('/inquiries'), api.get('/settings'), api.get('/orders')])
      setData({ products, inquiries, settings, orders })
    } catch (err) {
      if (err.status === 401) return onLogout()
      toast(err.message, 'error')
    }
  }, [onLogout, toast])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (key) => {
    window.location.hash = hashFor(key)
    setNavOpen(false)
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    onLogout()
  }

  const badges = {
    inquiries: data?.inquiries.filter((q) => q.status === 'new').length ?? 0,
    orders: data?.orders.filter((o) => o.status === 'pending').length ?? 0,
  }
  const Page = pages[page].component

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="px-6 pb-8 pt-6">
        <Logo light compact className="items-start" />
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream/50">Admin</p>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {Object.entries(pages).map(([key, { label, icon: Icon }]) => (
          <li key={key}>
            <button
              onClick={() => go(key)}
              aria-current={page === key ? 'page' : undefined}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${page === key ? 'text-forest' : 'text-cream/75 hover:bg-cream/5 hover:text-cream'}`}
            >
              {page === key && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-cream" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <Icon size={18} className="relative" />
              <span className="relative flex-1 text-left">{label}</span>
              {badges[key] > 0 && (
                <span className="relative rounded-full bg-amber px-2 py-0.5 text-[11px] font-bold text-forest">{badges[key]}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-cream/10 p-3">
        <a href={SITE_URL} {...(DEMO ? {} : { target: '_blank', rel: 'noreferrer' })} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/75 hover:bg-cream/5 hover:text-cream">
          <ExternalLink size={18} /> View website
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/75 hover:bg-cream/5 hover:text-cream">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-sand/40">
      <aside className="grain fixed inset-y-0 left-0 hidden w-64 bg-forest lg:block">{nav}</aside>

      <AnimatePresence>
        {navOpen && (
          <motion.div className="fixed inset-0 z-40 bg-slate/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNavOpen(false)}>
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="grain relative h-full w-64 bg-forest"
            >
              <button onClick={() => setNavOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 p-2 text-cream">
                <X size={20} />
              </button>
              {nav}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-forest/10 bg-cream/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setNavOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-forest">
            <Menu size={22} />
          </button>
          <span className="font-serif text-lg text-forest">{pages[page].label}</span>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          {data ? (
            <AnimatePresence mode="wait">
              <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <Page data={data} setData={setData} reload={reload} go={go} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="grid h-64 place-items-center text-forest/60">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(null)

  useEffect(() => {
    document.title = 'Admin – TARU CARE'
    api.get('/auth/me').then((r) => setAuthed(r.authed)).catch(() => setAuthed(false))
  }, [])

  const onLogout = useCallback(() => setAuthed(false), [])

  if (authed === null) return <div className="min-h-screen bg-forest" />
  return (
    <OverlayProvider>
      {authed ? <Shell onLogout={onLogout} /> : <Login onSuccess={() => setAuthed(true)} />}
    </OverlayProvider>
  )
}
