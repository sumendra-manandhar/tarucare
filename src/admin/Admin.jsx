import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, ArrowLeft, Boxes, CheckCheck, ChevronRight, Eye, EyeOff, Inbox, LayoutDashboard, Lock, LogOut, Mail, Menu, Package,
  Pencil, Plus, RotateCcw, Save, Search, Settings, Star, Trash2, TrendingUp, User, X,
} from 'lucide-react'
import { Logo, SoapBar } from '../components/Art'
import { Aurora, cn } from '../components/ui'
import { CATEGORIES } from '../data'
import { useStore } from '../store'

const DEMO = { user: 'admin', pass: 'taru@123' }
const SESSION_KEY = 'taru:admin-session'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 60) return `${Math.max(m, 1)}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

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

/* -------------------------------- Building blocks ------------------------------ */

function Card({ className = '', children }) {
  return <div className={cn('rounded-2xl border border-forest/10 p-5 shadow-sm', !/\bbg-/.test(className) && 'bg-white', className)}>{children}</div>
}

function Stat({ icon: Icon, label, value, hint, tone = 'forest', delay = 0 }) {
  const tones = {
    forest: 'bg-forest text-amber',
    amber: 'bg-amber text-forest-900',
    red: 'bg-red-500 text-white',
    sage: 'bg-forest-100 text-forest',
  }
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-2 font-serif text-3xl text-forest">{value}</p>
          </div>
          <span className={cn('grid h-11 w-11 place-items-center rounded-xl', tones[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        {hint && <p className="mt-3 text-xs text-slate-400">{hint}</p>}
      </Card>
    </motion.div>
  )
}

function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-forest-400' : 'bg-slate-400/30')}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow', on ? 'right-1' : 'left-1')} />
    </button>
  )
}

function StatusBadge({ status }) {
  const map = {
    new: 'bg-amber/20 text-amber-600',
    read: 'bg-slate-400/15 text-slate-500',
    replied: 'bg-forest-100 text-forest-500',
  }
  return <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', map[status])}>{status}</span>
}

function Confirm({ open, title, text, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-forest-900/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-serif text-xl text-forest">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{text}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={onCancel} className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-cream-100">Cancel</button>
              <button onClick={onConfirm} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm text-cream shadow-2xl"
        >
          <CheckCheck className="h-4 w-4 text-amber" /> {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------- Dashboard -------------------------------- */

function Dashboard({ go }) {
  const { products, inquiries } = useStore()
  const active = products.filter((p) => p.active)
  const stockUnits = products.reduce((s, p) => s + Number(p.stock), 0)
  const stockValue = products.reduce((s, p) => s + p.stock * p.price, 0)
  const newCount = inquiries.filter((i) => i.status === 'new').length
  const low = products.filter((p) => p.stock < 15)
  const maxStock = Math.max(...products.map((p) => p.stock), 1)

  const days = useMemo(() => {
    const out = []
    for (let d = 6; d >= 0; d--) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - d)
      const end = start.getTime() + 86400000
      out.push({ label: start.toLocaleDateString('en-GB', { weekday: 'short' }), count: inquiries.filter((i) => i.date >= start.getTime() && i.date < end).length })
    }
    return out
  }, [inquiries])
  const maxDay = Math.max(...days.map((d) => d.count), 1)

  const byCat = CATEGORIES.map((c) => ({ c, n: active.filter((p) => p.categories.includes(c)).length }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Package} label="Active products" value={`${active.length}/${products.length}`} hint="Visible on the website" />
        <Stat icon={Boxes} label="Units in stock" value={stockUnits} hint={`Rs. ${stockValue.toLocaleString('en-IN')} inventory value`} tone="sage" delay={0.05} />
        <Stat icon={Inbox} label="New inquiries" value={newCount} hint={`${inquiries.length} total messages`} tone="amber" delay={0.1} />
        <Stat icon={AlertTriangle} label="Low stock" value={low.length} hint="Below 15 units" tone={low.length ? 'red' : 'sage'} delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-forest">Inventory by variant</h3>
              <p className="text-xs text-slate-400">Units on hand for each soap</p>
            </div>
            <button onClick={() => go('products')} className="text-xs font-semibold text-forest-500 hover:underline">Manage</button>
          </div>
          <div className="mt-6 space-y-3">
            {products.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <SoapBar base={p.base} accent={p.accent} label="" className="h-8 w-11 shrink-0" />
                <span className="w-36 shrink-0 truncate text-sm text-slate-500">{p.name.replace(' Soap', '')}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                  <motion.div
                    className={cn('h-full rounded-full', p.stock < 15 ? 'bg-red-400' : 'bg-forest-400')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.stock / maxStock) * 100}%` }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.8 }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold tabular-nums text-forest">{p.stock}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-serif text-xl text-forest">Inquiries this week</h3>
          <p className="text-xs text-slate-400">Messages received per day</p>
          <div className="mt-6 flex h-40 items-end gap-2">
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-forest">{d.count || ''}</span>
                <motion.div
                  className="w-full rounded-t-lg bg-amber"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxDay) * 100}px` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                  style={{ minHeight: 4 }}
                />
                <span className="text-[11px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-forest/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active products by concern</p>
            <div className="mt-3 space-y-2">
              {byCat.map(({ c, n }) => (
                <div key={c} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{c}</span>
                  <span className="font-semibold text-forest">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-forest">Recent inquiries</h3>
            <button onClick={() => go('inquiries')} className="flex items-center text-xs font-semibold text-forest-500 hover:underline">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="mt-4 divide-y divide-forest/5">
            {inquiries.slice(0, 5).map((q) => (
              <li key={q.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-sm font-semibold text-forest">{q.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">{q.subject}</p>
                  <p className="truncate text-xs text-slate-400">{q.name} · {ago(q.date)}</p>
                </div>
                <StatusBadge status={q.status} />
              </li>
            ))}
            {!inquiries.length && <li className="py-6 text-center text-sm text-slate-400">No inquiries yet.</li>}
          </ul>
        </Card>
        <Card className="bg-forest text-cream">
          <div className="flex items-center gap-2 text-amber">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Needs attention</span>
          </div>
          {low.length ? (
            <ul className="mt-4 space-y-3">
              {low.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-cream/5 p-3">
                  <SoapBar base={p.base} accent={p.accent} label="" className="h-8 w-11" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-cream/60">{p.stock === 0 ? 'Out of stock' : `Only ${p.stock} units left`}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-cream/70">All variants are well stocked. 🌿</p>
          )}
        </Card>
      </div>
    </div>
  )
}

/* --------------------------------- Products -------------------------------- */

const BLANK = {
  id: '', name: '', nepali: '', tagline: '', description: '', longDescription: '', ingredients: [], benefits: [], categories: [],
  price: 350, stock: 50, weight: '100g', base: '#c9a26b', accent: '#6b4a24', active: true, featured: false,
}

function ProductEditor({ product, onClose, onSave }) {
  const [f, setF] = useState(() => ({ ...product, ingredientsText: product.ingredients.join(', '), benefitsText: product.benefits.join(', ') }))
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const isNew = !product.id

  const save = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Name is required')
    if (!f.categories.length) return setErr('Pick at least one category')
    const split = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)
    const { ingredientsText, benefitsText, ...rest } = f
    onSave({
      ...rest,
      id: rest.id || rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36).slice(-4),
      ingredients: split(ingredientsText),
      benefits: split(benefitsText),
      stock: Math.max(0, Number(rest.stock) || 0),
      price: Math.max(0, Number(rest.price) || 0),
    })
  }

  const input = 'w-full rounded-xl border border-forest/15 bg-cream/50 px-3 py-2.5 text-sm outline-none transition focus:border-forest-400 focus:bg-white focus:ring-4 focus:ring-forest/10'
  const lbl = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400'

  return (
    <motion.div className="fixed inset-0 z-[80] flex justify-end bg-forest-900/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="scrollbar-thin flex h-full w-full max-w-xl flex-col overflow-y-auto bg-cream"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-forest/10 bg-cream/90 px-6 py-4 backdrop-blur">
          <h2 className="font-serif text-2xl text-forest">{isNew ? 'New product' : 'Edit product'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-5 rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${f.base}33, ${f.base}0d)` }}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-36 shrink-0">
              <SoapBar base={f.base} accent={f.accent} className="w-full" />
            </motion.div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <label>
                <span className={lbl}>Bar color</span>
                <input type="color" value={f.base} onChange={set('base')} className="h-10 w-full cursor-pointer rounded-lg border border-forest/15 bg-white" />
              </label>
              <label>
                <span className={lbl}>Herb flecks</span>
                <input type="color" value={f.accent} onChange={set('accent')} className="h-10 w-full cursor-pointer rounded-lg border border-forest/15 bg-white" />
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={lbl}>Name</span><input className={input} value={f.name} onChange={set('name')} placeholder="e.g. Neem Soap" /></label>
            <label><span className={lbl}>Nepali name</span><input className={input} value={f.nepali} onChange={set('nepali')} /></label>
            <label><span className={lbl}>Tagline</span><input className={input} value={f.tagline} onChange={set('tagline')} /></label>
            <label><span className={lbl}>Price (Rs.)</span><input type="number" min="0" className={input} value={f.price} onChange={set('price')} /></label>
            <label><span className={lbl}>Stock (units)</span><input type="number" min="0" className={input} value={f.stock} onChange={set('stock')} /></label>
            <label><span className={lbl}>Weight</span><input className={input} value={f.weight} onChange={set('weight')} /></label>
          </div>

          <label className="block"><span className={lbl}>Short description</span><textarea rows={2} className={input} value={f.description} onChange={set('description')} /></label>
          <label className="block"><span className={lbl}>Full description</span><textarea rows={3} className={input} value={f.longDescription} onChange={set('longDescription')} /></label>
          <label className="block"><span className={lbl}>Ingredients (comma separated)</span><input className={input} value={f.ingredientsText} onChange={set('ingredientsText')} /></label>
          <label className="block"><span className={lbl}>Benefits (comma separated)</span><input className={input} value={f.benefitsText} onChange={set('benefitsText')} /></label>

          <div>
            <span className={lbl}>Categories</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = f.categories.includes(c)
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setF((x) => ({ ...x, categories: on ? x.categories.filter((y) => y !== c) : [...x.categories, c] }))}
                    className={cn('rounded-full border px-3.5 py-1.5 text-sm transition', on ? 'border-forest bg-forest text-cream' : 'border-forest/15 bg-white text-slate-500 hover:border-forest/40')}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-2xl border border-forest/10 bg-white p-4">
            <label className="flex items-center gap-3 text-sm text-slate-500"><Toggle on={f.active} onChange={(v) => setF((x) => ({ ...x, active: v }))} label="Visible on site" /> Visible on site</label>
            <label className="flex items-center gap-3 text-sm text-slate-500"><Toggle on={f.featured} onChange={(v) => setF((x) => ({ ...x, featured: v }))} label="Bestseller badge" /> Bestseller badge</label>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>

        <div className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t border-forest/10 bg-cream/90 px-6 py-4 backdrop-blur">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-forest/5">Cancel</button>
          <button className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500">
            <Save className="h-4 w-4" /> {isNew ? 'Create product' : 'Save changes'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function Products({ query, toast }) {
  const { products, saveProduct, deleteProduct } = useStore()
  const [editing, setEditing] = useState(null)
  const [del, setDel] = useState(null)
  const [cat, setCat] = useState('All')
  const list = products.filter(
    (p) => (cat === 'All' || p.categories.includes(cat)) && `${p.name} ${p.ingredients.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-forest/10 bg-white p-1">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm', cat === c ? 'text-cream' : 'text-slate-400 hover:text-forest')}>
              {cat === c && <motion.span layoutId="admin-cat" className="absolute inset-0 rounded-full bg-forest" />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setEditing(BLANK)} className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-amber-300">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className={cn('group h-full transition hover:shadow-lg', !p.active && 'opacity-60')}>
                <div className="flex gap-4">
                  <div className="grid h-20 w-24 shrink-0 place-items-center rounded-xl" style={{ background: `${p.base}22` }}>
                    <SoapBar base={p.base} accent={p.accent} label="" className="w-20 transition group-hover:-rotate-6 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-serif text-lg text-forest">{p.name}</h3>
                      {p.featured && <Star className="h-4 w-4 shrink-0 fill-amber text-amber" />}
                    </div>
                    <p className="text-xs text-slate-400">{p.categories.join(' · ')}</p>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span className="font-semibold text-forest">Rs. {p.price}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock < 15 ? 'bg-amber/20 text-amber-600' : 'bg-forest-100 text-forest-500')}>
                        {p.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-forest/5 pt-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <Toggle
                      on={p.active}
                      label="Visible"
                      onChange={(v) => {
                        saveProduct({ ...p, active: v })
                        toast(v ? `${p.name} is now visible` : `${p.name} hidden from site`)
                      }}
                    />
                    {p.active ? 'Visible' : 'Hidden'}
                  </label>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-forest/5 hover:text-forest" aria-label={`Edit ${p.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDel(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Delete ${p.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!list.length && <p className="py-16 text-center text-slate-400">No products match.</p>}

      <AnimatePresence>
        {editing && (
          <ProductEditor
            product={editing}
            onClose={() => setEditing(null)}
            onSave={(p) => {
              saveProduct(p)
              setEditing(null)
              toast(editing.id ? 'Product updated' : 'Product created')
            }}
          />
        )}
      </AnimatePresence>
      <Confirm
        open={!!del}
        title={`Delete ${del?.name}?`}
        text="This removes the product from the store and website. This can't be undone."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          deleteProduct(del.id)
          toast('Product deleted')
          setDel(null)
        }}
      />
    </div>
  )
}

/* -------------------------------- Inquiries -------------------------------- */

function Inquiries({ query, toast }) {
  const { inquiries, updateInquiry, deleteInquiry } = useStore()
  const [filter, setFilter] = useState('all')
  const [selId, setSelId] = useState(null)
  const [del, setDel] = useState(null)
  const list = inquiries.filter(
    (q) => (filter === 'all' || q.status === filter) && `${q.name} ${q.email} ${q.subject} ${q.message}`.toLowerCase().includes(query.toLowerCase()),
  )
  const sel = inquiries.find((q) => q.id === selId)

  const open = (q) => {
    setSelId(q.id)
    if (q.status === 'new') updateInquiry(q.id, { status: 'read' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card className="p-0">
        <div className="flex gap-1 overflow-x-auto border-b border-forest/10 p-3">
          {['all', 'new', 'read', 'replied'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn('relative rounded-full px-3.5 py-1.5 text-sm capitalize', filter === s ? 'text-cream' : 'text-slate-400 hover:text-forest')}>
              {filter === s && <motion.span layoutId="inq-filter" className="absolute inset-0 rounded-full bg-forest" />}
              <span className="relative">
                {s} {s !== 'all' && <span className="opacity-60">({inquiries.filter((q) => q.status === s).length})</span>}
              </span>
            </button>
          ))}
        </div>
        <ul className="scrollbar-thin max-h-[60vh] divide-y divide-forest/5 overflow-y-auto">
          {list.map((q) => (
            <li key={q.id}>
              <button onClick={() => open(q)} className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left transition', selId === q.id ? 'bg-forest/5' : 'hover:bg-cream')}>
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-sm font-semibold text-forest">
                  {q.name[0]}
                  {q.status === 'new' && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('truncate text-sm', q.status === 'new' ? 'font-bold text-forest' : 'font-medium text-slate-500')}>{q.name}</p>
                    <span className="shrink-0 text-[11px] text-slate-400">{ago(q.date)}</span>
                  </div>
                  <p className="truncate text-sm text-forest">{q.subject}</p>
                  <p className="truncate text-xs text-slate-400">{q.message}</p>
                </div>
              </button>
            </li>
          ))}
          {!list.length && <li className="p-10 text-center text-sm text-slate-400">No inquiries here.</li>}
        </ul>
      </Card>

      <Card className="min-h-[320px]">
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.div key={sel.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <StatusBadge status={sel.status} />
                  <h3 className="mt-2 font-serif text-2xl text-forest">{sel.subject}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {sel.name} · <a className="text-forest-500 hover:underline" href={`mailto:${sel.email}`}>{sel.email}</a> · {fmtDate(sel.date)}
                  </p>
                </div>
                <button onClick={() => setDel(sel)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Delete inquiry">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-6 whitespace-pre-wrap rounded-2xl bg-cream p-5 leading-relaxed text-slate-500">{sel.message}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={`mailto:${sel.email}?subject=${encodeURIComponent('Re: ' + sel.subject)}`}
                  onClick={() => updateInquiry(sel.id, { status: 'replied' })}
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500"
                >
                  <Mail className="h-4 w-4" /> Reply by email
                </a>
                {sel.status !== 'replied' && (
                  <button
                    onClick={() => {
                      updateInquiry(sel.id, { status: 'replied' })
                      toast('Marked as replied')
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5"
                  >
                    <CheckCheck className="h-4 w-4" /> Mark replied
                  </button>
                )}
                {sel.status !== 'new' && (
                  <button onClick={() => updateInquiry(sel.id, { status: 'new' })} className="rounded-full px-4 py-2.5 text-sm text-slate-400 hover:bg-forest/5">
                    Mark unread
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-slate-400">
              <Inbox className="h-10 w-10 text-forest-200" />
              <p className="mt-3 text-sm">Select an inquiry to read it</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      <Confirm
        open={!!del}
        title="Delete this inquiry?"
        text={`The message from ${del?.name} will be removed permanently.`}
        onCancel={() => setDel(null)}
        onConfirm={() => {
          deleteInquiry(del.id)
          setSelId(null)
          setDel(null)
          toast('Inquiry deleted')
        }}
      />
    </div>
  )
}

/* --------------------------------- Settings -------------------------------- */

function SettingsPage({ toast, logout }) {
  const { settings, setSettings, resetAll } = useStore()
  const [f, setF] = useState(settings)
  const [confirmReset, setConfirmReset] = useState(false)
  const input = 'w-full rounded-xl border border-forest/15 bg-cream/50 px-3 py-2.5 text-sm outline-none transition focus:border-forest-400 focus:bg-white focus:ring-4 focus:ring-forest/10'
  const fields = [
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['website', 'Website'],
    ['facebook', 'Facebook handle'],
    ['instagram', 'Instagram handle'],
  ]
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Card>
        <h3 className="font-serif text-xl text-forest">Store details</h3>
        <p className="text-xs text-slate-400">Shown in the website's contact section and footer.</p>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            setSettings(f)
            toast('Settings saved')
          }}
        >
          {fields.map(([k, l]) => (
            <label key={k}>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l}</span>
              <input className={input} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Announcement bar (leave empty to hide)</span>
            <input className={input} value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} />
          </label>
          <div className="sm:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500">
              <Save className="h-4 w-4" /> Save settings
            </button>
          </div>
        </form>
      </Card>
      <div className="space-y-6">
        <Card>
          <h3 className="font-serif text-xl text-forest">Demo data</h3>
          <p className="mt-1 text-sm text-slate-400">Data is stored in this browser. Reset to restore the original 7 soaps, sample inquiries and contact details.</p>
          <button onClick={() => setConfirmReset(true)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
            <RotateCcw className="h-4 w-4" /> Reset all data
          </button>
        </Card>
        <Card>
          <h3 className="font-serif text-xl text-forest">Session</h3>
          <p className="mt-1 text-sm text-slate-400">Signed in as <span className="font-semibold text-forest">admin</span></p>
          <button onClick={logout} className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </Card>
      </div>
      <Confirm
        open={confirmReset}
        title="Reset all data?"
        text="Products, inquiries and settings will return to their defaults."
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
          window.location.reload()
        }}
      />
    </div>
  )
}

/* ---------------------------------- Shell ---------------------------------- */

export default function Admin() {
  const { inquiries } = useStore()
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
  const newCount = inquiries.filter((i) => i.status === 'new').length

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
            {id === 'inquiries' && newCount > 0 && (
              <span className={cn('relative ml-auto rounded-full px-2 text-[11px] font-bold', current.id === id ? 'bg-forest-900 text-amber' : 'bg-amber text-forest-900')}>{newCount}</span>
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
        {(current.id === 'products' || current.id === 'inquiries') && (
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
