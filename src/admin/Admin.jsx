import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Inbox, LayoutDashboard, Lock, LogOut, Menu, Package, Search, Settings, ShoppingCart, User } from 'lucide-react'
import { Logo } from '../components/Art'
import { Aurora, cn } from '../components/ui'
import { useStore } from '../store'
import { Toast } from './ui'
import { Dashboard } from './Dashboard'
import { Products } from './Products'
import { Orders } from './Orders'
import { Inquiries } from './Inquiries'
import { SettingsPage } from './Settings'

const DEMO = { user: 'admin', pass: 'taru@123' }
const SESSION_KEY = 'taru:admin-session'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function useAdminRoute() {
  const read = () => window.location.hash.replace(/^#\/?admin[-/]?/, '') || 'dashboard'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return [route, (r) => (window.location.hash = r === 'dashboard' ? '#admin' : `#admin-${r}`)]
}

/* ---------------------------------- Login --------------------------------- */

function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (user.trim() === DEMO.user && pass === DEMO.pass) onLogin()
    else setError('Invalid username or password')
  }
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-forest-900 px-4">
      <Aurora colors={['#2d6a4f', '#d4a373', '#1b4332']} className="opacity-70" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm rounded-3xl border border-cream/10 bg-cream/[0.06] p-8 text-cream shadow-2xl backdrop-blur-xl"
      >
        <Logo light />
        <h1 className="mt-8 font-serif text-3xl">Admin sign in</h1>
        <p className="mt-1 text-sm text-cream/60">Manage products, inquiries and store settings.</p>
        <label className="mt-7 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-cream/60">Username</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-cream/15 bg-forest-900/50 px-3 focus-within:border-amber">
            <User className="h-4 w-4 text-cream/40" />
            <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="admin" autoFocus />
          </div>
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-cream/60">Password</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-cream/15 bg-forest-900/50 px-3 focus-within:border-amber">
            <Lock className="h-4 w-4 text-cream/40" />
            <input type={show ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="••••••••" />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-cream/40 hover:text-cream" aria-label="Toggle password visibility">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 text-sm text-red-300">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <button className="mt-6 w-full rounded-full bg-amber py-3 text-sm font-semibold text-forest-900 transition hover:bg-amber-300">Sign in</button>
        <p className="mt-5 rounded-xl bg-forest-900/50 px-3 py-2 text-center text-xs text-cream/50">
          Demo login: <span className="font-mono text-amber">admin</span> / <span className="font-mono text-amber">taru@123</span>
        </p>
        <a href="#top" className="mt-5 flex items-center justify-center gap-1 text-xs text-cream/50 hover:text-amber">
          <ArrowLeft className="h-3 w-3" /> Back to website
        </a>
      </motion.form>
    </div>
  )
}

/* ---------------------------------- Shell ---------------------------------- */

export default function Admin() {
  const { inquiries, orders } = useStore()
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  })
  const [route, go] = useAdminRoute()
  const [query, setQuery] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(''), 2200)
    return () => clearTimeout(t)
  }, [toastMsg])

  useEffect(() => setQuery(''), [route])

  const login = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    setAuthed(true)
  }
  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    setAuthed(false)
  }

  if (!authed) return <Login onLogin={login} />

  const current = NAV.find((n) => n.id === route) || NAV[0]
  const badges = {
    inquiries: inquiries.filter((i) => i.status === 'new').length,
    orders: orders.filter((o) => o.status === 'pending').length,
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-forest-900 p-5 text-cream">
      <Logo light />
      <p className="mt-2 pl-11 text-[10px] uppercase tracking-[0.3em] text-amber/70">Admin</p>
      <nav className="mt-10 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              go(id)
              setMobileNav(false)
            }}
            className={cn('relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', current.id === id ? 'text-forest-900' : 'text-cream/70 hover:bg-cream/5 hover:text-cream')}
          >
            {current.id === id && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-amber" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <Icon className="relative h-4 w-4" />
            <span className="relative font-medium">{label}</span>
            {badges[id] > 0 && (
              <span className={cn('relative ml-auto rounded-full px-2 text-[11px] font-bold', current.id === id ? 'bg-forest-900 text-amber' : 'bg-amber text-forest-900')}>{badges[id]}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-2">
        <a href="#top" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/70 hover:bg-cream/5 hover:text-cream">
          <Eye className="h-4 w-4" /> View website
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/70 hover:bg-cream/5 hover:text-cream">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-100/60 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      <AnimatePresence>
        {mobileNav && (
          <motion.div className="fixed inset-0 z-50 bg-forest-900/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)}>
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30 }} className="h-full w-64" onClick={(e) => e.stopPropagation()}>
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-forest/10 bg-cream/80 px-4 py-3 backdrop-blur-xl sm:px-8">
        <button onClick={() => setMobileNav(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-cream lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Admin / {current.label}</p>
          <h1 className="truncate font-serif text-2xl text-forest">{current.label}</h1>
        </div>
        {['products', 'orders', 'inquiries'].includes(current.id) && (
          <div className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-forest/10 bg-white px-4 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${current.label.toLowerCase()}…`} className="w-full bg-transparent text-sm outline-none" />
          </div>
        )}
      </header>

      <main className="p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {current.id === 'dashboard' && <Dashboard go={go} />}
            {current.id === 'orders' && <Orders query={query} toast={setToastMsg} />}
            {current.id === 'products' && <Products query={query} toast={setToastMsg} />}
            {current.id === 'inquiries' && <Inquiries query={query} toast={setToastMsg} />}
            {current.id === 'settings' && <SettingsPage toast={setToastMsg} logout={logout} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toast message={toastMsg} />
    </div>
  )
}
