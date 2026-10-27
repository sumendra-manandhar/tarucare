import { AnimatePresence, motion } from 'framer-motion'
import { Check, LogOut, Package, Save, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { loadGoogleScript, useAccount } from '../Account'
import { api } from '../lib/api'
import { formatPrice } from './Cart'

// Customer-facing names for order statuses.
const STEPS = [
  ['pending', 'Received'],
  ['confirmed', 'Confirmed'],
  ['shipped', 'On the way'],
  ['delivered', 'Delivered'],
]

function GoogleButton({ onError }) {
  const ref = useRef(null)
  const { config, signInWithGoogle } = useAccount()
  useEffect(() => {
    let alive = true
    loadGoogleScript()
      .then((google) => {
        if (!alive || !ref.current) return
        google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: ({ credential }) => signInWithGoogle(credential).catch((e) => onError(e.message)),
        })
        google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 300 })
      })
      .catch((e) => onError(e.message))
    return () => {
      alive = false
    }
  }, [config.googleClientId, signInWithGoogle, onError])
  return <div ref={ref} className="flex min-h-11 justify-center" />
}

export function SignInCard({ title = 'Sign in to continue', text }) {
  const { config, signInDemo } = useAccount()
  const [error, setError] = useState('')
  return (
    <div className="rounded-[1.75rem] bg-sand/70 p-6 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream text-moss"><User size={22} /></span>
      <p className="mt-4 font-serif text-2xl text-moss">{title}</p>
      {text && <p className="mt-1 text-sm text-ink/60">{text}</p>}
      <div className="mt-5">
        {config.googleClientId ? (
          <GoogleButton onError={setError} />
        ) : (
          <button onClick={() => signInDemo().catch((e) => setError(e.message))} className="rounded-full bg-moss px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-light">
            Continue as demo customer
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-4 text-xs text-ink/45">We only use your name and email for your orders.</p>
    </div>
  )
}

export function AccountButton() {
  const { customer, canSignIn, setOpen } = useAccount()
  if (!canSignIn) return null
  return (
    <button onClick={() => setOpen(true)} aria-label={customer ? `My account, ${customer.name}` : 'Sign in'} className="grid h-10 w-10 place-items-center overflow-hidden rounded-full text-moss transition hover:bg-ink/5">
      {customer?.picture ? (
        <img src={customer.picture} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover ring-2 ring-sage" />
      ) : customer ? (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-moss text-sm font-semibold text-cream">{customer.name[0]}</span>
      ) : (
        <User size={20} />
      )}
    </button>
  )
}

function OrderCard({ o }) {
  const step = STEPS.findIndex(([k]) => k === o.status)
  return (
    <li className="rounded-[1.5rem] border border-ink/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg text-moss">{o.id}</p>
          <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.payment}</p>
        </div>
        <p className="font-semibold tabular-nums text-ink">{formatPrice(o.total)}</p>
      </div>
      {o.status === 'cancelled' ? (
        <p className="mt-3 rounded-full bg-red-50 px-3 py-1.5 text-center text-xs font-semibold text-red-700">Cancelled</p>
      ) : (
        <ol className="mt-4 grid grid-cols-4 gap-1" aria-label={`Status: ${STEPS[step]?.[1]}`}>
          {STEPS.map(([k, label], i) => (
            <li key={k} className="text-center">
              <span className={`mx-auto mb-1 grid h-5 w-5 place-items-center rounded-full ${i <= step ? 'bg-moss text-cream' : 'bg-ink/10 text-transparent'}`}>
                <Check size={11} strokeWidth={3} />
              </span>
              <span className={`text-[10px] ${i <= step ? 'font-semibold text-moss' : 'text-ink/40'}`}>{label}</span>
            </li>
          ))}
        </ol>
      )}
      <ul className="mt-3 space-y-0.5 border-t border-ink/10 pt-3 text-sm text-ink/70">
        {o.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-2"><span className="truncate">{i.qty} × {i.name}</span><span className="tabular-nums">{formatPrice(i.qty * i.price)}</span></li>
        ))}
      </ul>
    </li>
  )
}

function Profile() {
  const { customer, update } = useAccount()
  const [f, setF] = useState({ name: customer.name, phone: customer.phone ?? '', address: customer.address ?? '', city: customer.city ?? '' })
  const [state, setState] = useState({ busy: false, msg: '', error: '' })
  const dirty = ['name', 'phone', 'address', 'city'].some((k) => f[k] !== (customer[k] ?? ''))
  const input = 'w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/10'
  const save = async (e) => {
    e.preventDefault()
    setState({ busy: true, msg: '', error: '' })
    try {
      await update(f)
      setState({ busy: false, msg: 'Saved', error: '' })
    } catch (err) {
      setState({ busy: false, msg: '', error: err.message })
    }
  }
  const field = (k, label, props = {}) => (
    <label htmlFor={`acc-${k}`} className={`block ${props.wide ? 'col-span-2' : ''}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-forest-light">{label}</span>
      <input id={`acc-${k}`} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={input} {...props.input} />
    </label>
  )
  return (
    <form onSubmit={save} className="grid grid-cols-2 gap-3">
      {field('name', 'Name', { wide: true, input: { autoComplete: 'name' } })}
      {field('phone', 'Phone', { input: { type: 'tel', autoComplete: 'tel' } })}
      {field('city', 'City', { input: { autoComplete: 'address-level2' } })}
      {field('address', 'Delivery address', { wide: true, input: { autoComplete: 'street-address' } })}
      <div className="col-span-2 flex items-center gap-3">
        <button disabled={!dirty || state.busy} className="inline-flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-light disabled:opacity-50">
          <Save size={15} /> Save details
        </button>
        {state.msg && <span className="text-sm font-semibold text-forest-light">{state.msg}</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  )
}

export function AccountDrawer() {
  const { customer, open, setOpen, signOut } = useAccount()
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    if (!open || !customer) return
    setOrders(null)
    api.get('/customer/orders').then(setOrders).catch(() => setOrders([]))
  }, [open, customer])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex justify-end bg-slate/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="My account"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-cream shadow-2xl sm:rounded-l-[2rem]"
          >
            <header className="flex items-center gap-2 border-b border-ink/10 px-5 py-4 sm:px-6">
              <h2 className="font-serif text-2xl text-moss">My account</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="ml-auto grid h-10 w-10 place-items-center rounded-full text-moss transition hover:rotate-90 hover:bg-ink/5"><X size={20} /></button>
            </header>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              {!customer ? (
                <SignInCard title="Welcome to TARU CARE" text="Sign in to check out faster and follow your orders." />
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    {customer.picture ? (
                      <img src={customer.picture} alt="" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-moss font-serif text-2xl text-cream">{customer.name[0]}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-xl text-moss">{customer.name}</p>
                      <p className="truncate text-sm text-ink/55">{customer.email}</p>
                    </div>
                    <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-moss hover:border-moss">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>

                  <section>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-forest-light">Your orders</p>
                    {orders === null ? (
                      <p className="text-sm text-ink/50">Loading…</p>
                    ) : orders.length ? (
                      <ul className="space-y-3">{orders.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
                    ) : (
                      <div className="rounded-[1.5rem] border border-dashed border-ink/20 p-6 text-center">
                        <Package className="mx-auto text-ink/30" />
                        <p className="mt-2 text-sm text-ink/60">No orders yet.</p>
                        <a href="#shop" onClick={() => setOpen(false)} className="mt-3 inline-block text-sm font-semibold text-moss underline underline-offset-4">Find your soap</a>
                      </div>
                    )}
                  </section>

                  <section>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-forest-light">Delivery details</p>
                    <Profile key={customer.id} />
                  </section>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
