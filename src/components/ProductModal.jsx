import { motion } from 'framer-motion'
import { Check, CheckCircle2, Leaf, Loader2, ShieldCheck, ShoppingBag, Truck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ingredients } from '../data'
import { api } from '../lib/api'
import { useCart } from '../Cart'
import { useSiteData } from '../SiteData'
import { formatPrice, Stepper } from './Cart'
import Gallery from './Gallery'
import { Ingredient, ProductVisual } from './Illustrations'

export { formatPrice }

function OrderForm({ p, onDone }) {
  const [v, setV] = useState({ name: '', email: '', phone: '', quantity: 1, message: '', website: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const set = (e) => setV((x) => ({ ...x, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!v.name.trim() || !/^\S+@\S+\.\S+$/.test(v.email)) return setError('Please enter your name and a valid email.')
    setStatus('sending')
    setError('')
    try {
      await api.post('/inquiries', { ...v, type: 'order', productId: p.id })
      setStatus('sent')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 rounded-2xl bg-sage/25 p-6 text-center">
        <CheckCircle2 className="mx-auto text-moss" size={40} />
        <p className="mt-3 font-serif text-xl text-moss">Order request received!</p>
        <p className="mt-1 text-sm text-ink/70">We’ll contact you shortly to confirm your order.</p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-moss underline underline-offset-4">Close</button>
      </motion.div>
    )
  }

  const input = 'w-full rounded-xl border border-moss/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/10 focus-visible:ring-4 focus-visible:ring-moss/20'
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} noValidate className="mt-8 grid grid-cols-2 gap-3">
      <input name="name" placeholder="Your name *" value={v.name} onChange={set} className={`${input} col-span-2`} />
      <input name="email" type="email" placeholder="Email *" value={v.email} onChange={set} className={`${input} col-span-2 sm:col-span-1`} />
      <input name="phone" type="tel" placeholder="Phone" value={v.phone} onChange={set} className={`${input} col-span-2 sm:col-span-1`} />
      <label className="col-span-2 flex items-center gap-3 text-sm text-moss">
        Quantity
        <input name="quantity" type="number" min="1" value={v.quantity} onChange={set} className={`${input} w-24`} />
      </label>
      <textarea name="message" rows={2} placeholder="Delivery address or notes" value={v.message} onChange={set} className={`${input} col-span-2 resize-none`} />
      <input name="website" value={v.website} onChange={set} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
      <button disabled={status === 'sending'} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 font-semibold text-cream transition hover:bg-forest-light disabled:opacity-70">
        {status === 'sending' ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
        Send Order Request
      </button>
    </motion.form>
  )
}

const ingredientName = (key) =>
  ingredients.find((i) => i.key === key)?.name ?? { milk: 'Goat Milk', charcoal: 'Active Charcoal' }[key]


function BuyBox({ p, onClose }) {
  const { add, qtyOf, maxFor, setOpen } = useCart()
  const { settings } = useSiteData()
  const max = maxFor(p)
  const [qty, setQty] = useState(1)
  const inCart = qtyOf(p.id)
  return (
    <div className="mt-8 rounded-[1.75rem] bg-sand/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stepper value={qty} max={Math.max(1, max - inCart)} onChange={(n) => setQty(Math.max(1, n))} label={`${p.name} quantity`} />
        <p className="font-serif text-2xl tabular-nums text-ink">{formatPrice(p.price * qty)}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => add(p, qty)}
          disabled={inCart >= max}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-moss/30 bg-cream px-4 py-3.5 text-sm font-semibold text-moss transition hover:border-moss disabled:opacity-50"
        >
          <ShoppingBag size={16} /> Add to cart
        </button>
        <button
          onClick={() => {
            add(p, qty)
            onClose()
            setOpen(true)
          }}
          disabled={inCart >= max}
          className="rounded-full bg-moss px-4 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-light disabled:opacity-50"
        >
          Buy now
        </button>
      </div>
      {inCart > 0 && <p className="mt-3 text-center text-xs font-semibold text-forest-light">{inCart} already in your cart</p>}
      {p.stock != null && p.stock <= 10 && <p className="mt-3 text-center text-xs font-semibold text-amber-dark">Only {p.stock} left in this batch</p>}
      <ul className="mt-4 grid gap-1.5 border-t border-ink/10 pt-4 text-xs text-ink/60">
        <li className="flex items-center gap-2"><Truck size={14} className="text-forest-light" /> {settings.deliveryNote}</li>
        <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-forest-light" /> Cash on delivery available</li>
        {settings.freeDeliveryOver > 0 && <li className="flex items-center gap-2"><Leaf size={14} className="text-forest-light" /> Free delivery over {formatPrice(settings.freeDeliveryOver)}</li>}
      </ul>
    </div>
  )
}

export default function ProductModal({ p, onClose }) {
  const [ordering, setOrdering] = useState(false)
  const { canBuy } = useCart()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem] md:grid-cols-2"
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-moss transition hover:rotate-90 hover:bg-white">
          <X size={20} />
        </button>
        {p.photos?.length ? (
          <Gallery photos={p.photos} name={p.name} tint={`${p.bar.light}40`} className="h-[22rem] sm:h-[28rem] md:h-auto md:min-h-[34rem]" />
        ) : (
          <div className="relative flex min-h-72 items-center justify-center p-10" style={{ background: `radial-gradient(circle at 50% 50%, ${p.bar.light}88, ${p.bar.base}33 55%, #f3ece0)` }}>
            <motion.div animate={{ y: [0, -12, 0], rotate: [0, -2, 0] }} transition={{ duration: 5, repeat: Infinity }} className="w-full max-w-sm">
              <ProductVisual p={p} className="drop-shadow-2xl" />
            </motion.div>
          </div>
        )}
        <div className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-dark">{p.tagline}</p>
          <h3 id="product-title" className="mt-2 font-serif text-3xl text-moss sm:text-4xl">{p.name}</h3>
          {p.price != null && <p className="mt-1 font-serif text-2xl text-amber-dark">{formatPrice(p.price)}</p>}
          <p className="mt-4 leading-relaxed text-ink/75">{p.description}</p>

          <h4 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">Key Benefits</h4>
          <ul className="mt-3 space-y-2.5">
            {p.benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-ink">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-moss/10 text-moss"><Check size={14} strokeWidth={3} /></span>
                {b}
              </li>
            ))}
          </ul>

          <h4 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">Hero Ingredients</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.ingredients.map((k) => (
              <span key={k} className="inline-flex items-center gap-2 rounded-full border border-moss/15 bg-white py-1 pl-1 pr-3 text-sm text-moss">
                <Ingredient name={k} className="h-7 w-7" />
                {ingredientName(k)}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full border border-moss/15 bg-white px-3 py-1 text-sm text-moss">Natural Oils</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-forest-light">
            {['Paraben-free', 'Sulphate-free', 'Cruelty-free', 'All skin types'].map((t) => (
              <span key={t} className="rounded-full bg-sage/30 px-3 py-1">{t}</span>
            ))}
          </div>

          {canBuy(p) ? (
            <BuyBox p={p} onClose={onClose} />
          ) : p.stock === 0 ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/70 p-5 text-center text-sm text-ink/70">
              This batch has sold out. <a href="#contact" onClick={onClose} className="font-semibold text-moss underline underline-offset-4">Ask us</a> when the next one is ready.
            </p>
          ) : ordering ? (
            <OrderForm p={p} onDone={onClose} />
          ) : (
            <button
              onClick={() => setOrdering(true)}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-forest-light"
            >
              <ShoppingBag size={18} /> Order This Soap
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

