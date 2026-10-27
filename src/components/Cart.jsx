import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, CheckCircle2, Leaf, Loader2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ADDED_EVENT, saveCustomer, savedCustomer, useCart } from '../Cart'
import { api } from '../lib/api'
import { useSiteData } from '../SiteData'
import { ProductVisual } from './Illustrations'

export const formatPrice = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`

export function Thumb({ p, className = '' }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl ${className}`} style={{ background: `linear-gradient(160deg, ${p.bar.light}55, ${p.bar.base}30)` }}>
      {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <ProductVisual p={p} className="w-[86%]" />}
    </span>
  )
}

export function Stepper({ value, onChange, max, size = 'md', label = 'quantity' }) {
  const s = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
  return (
    <div className="inline-flex items-center rounded-full border border-ink/15 bg-cream">
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`} className={`grid ${s} place-items-center rounded-full text-moss transition hover:bg-ink/5`}>
        <Minus size={size === 'sm' ? 13 : 16} />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-ink" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label}`} className={`grid ${s} place-items-center rounded-full text-moss transition hover:bg-ink/5 disabled:opacity-30`}>
        <Plus size={size === 'sm' ? 13 : 16} />
      </button>
    </div>
  )
}

// Becomes a stepper once the soap is in the cart, so shoppers can adjust without opening the cart.
export function AddToCart({ p, className = '', full = false }) {
  const { canBuy, add, qtyOf, setQty, maxFor } = useCart()
  const qty = qtyOf(p.id)
  if (p.stock === 0) {
    return <span className={`inline-flex items-center justify-center rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/45 ${className}`}>Sold out</span>
  }
  if (!canBuy(p)) return null
  if (qty > 0) {
    return (
      <div className={`flex items-center justify-between gap-2 rounded-full bg-sage/30 p-1 pl-4 ${className}`}>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss"><Check size={15} strokeWidth={3} /> In cart</span>
        <Stepper size="sm" value={qty} max={maxFor(p)} onChange={(n) => setQty(p.id, n)} label={`${p.name} quantity`} />
      </div>
    )
  }
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={(e) => {
        e.stopPropagation()
        add(p)
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-moss px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-light ${className}`}
    >
      <ShoppingBag size={15} /> {full ? `Add to cart · ${formatPrice(p.price)}` : 'Add to cart'}
    </motion.button>
  )
}

export function CartButton() {
  const { count, setOpen } = useCart()
  const { settings } = useSiteData()
  if (!settings.cartEnabled) return null
  return (
    <button onClick={() => setOpen(true)} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`} className="relative grid h-10 w-10 place-items-center rounded-full text-moss transition hover:bg-ink/5">
      <ShoppingBag size={20} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.3 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1 text-[11px] font-bold text-moss"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function AddedToast() {
  const { setOpen, count, subtotal } = useCart()
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let t
    const on = (e) => {
      setMsg(e.detail)
      clearTimeout(t)
      t = setTimeout(() => setMsg(null), 3200)
    }
    window.addEventListener(ADDED_EVENT, on)
    return () => {
      window.removeEventListener(ADDED_EVENT, on)
      clearTimeout(t)
    }
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[65] flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[1.5rem] bg-moss p-3 pr-4 text-cream shadow-[0_18px_40px_-14px_rgba(31,61,43,.7)]"
          >
            <Thumb p={msg.product} className="h-14 w-14" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{msg.added > 0 ? 'Added to your cart' : 'That’s all we have in stock'}</p>
              <p className="truncate text-xs text-cream/65">{msg.product.name} · {count} item{count === 1 ? '' : 's'} · {formatPrice(subtotal)}</p>
            </div>
            <button onClick={() => { setMsg(null); setOpen(true) }} className="rounded-full bg-cream px-3.5 py-2 text-xs font-semibold text-moss transition hover:bg-amber">
              View cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const field = 'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-4 focus:ring-moss/10'

function Input({ id, label, error, className = '', ...rest }) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-forest-light">{label}</span>
      <input id={id} {...rest} className={`${field} ${error ? 'border-red-400' : 'border-ink/15'}`} aria-invalid={!!error} />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function Trust({ note }) {
  return (
    <ul className="space-y-1.5 text-xs text-ink/60">
      <li className="flex items-center gap-2"><Truck size={14} className="text-forest-light" /> {note}</li>
      <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-forest-light" /> Pay when it arrives, or with eSewa / Khalti</li>
      <li className="flex items-center gap-2"><Leaf size={14} className="text-forest-light" /> Handmade in small batches in Nepal</li>
    </ul>
  )
}

const EMPTY = { phone: '', name: '', address: '', city: '', email: '' }

export function CartDrawer() {
  const { products, settings, refresh } = useSiteData()
  const cart = useCart()
  const { items, count, subtotal, delivery, total, free, open, setOpen, setQty, maxFor, add, clear, canBuy } = cart
  const [step, setStep] = useState('cart')
  const [form, setForm] = useState(() => ({ ...EMPTY, ...savedCustomer() }))
  const [notes, setNotes] = useState('')
  const methods = settings.paymentMethods?.length ? settings.paymentMethods : ['Cash on Delivery']
  const [payment, setPayment] = useState(methods[0])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  const [placed, setPlaced] = useState(null)

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

  const close = () => {
    setOpen(false)
    if (step !== 'cart') setTimeout(() => setStep('cart'), 350)
  }

  // Suggest soaps for the same skin needs that aren't in the cart yet.
  const inCart = new Set(items.map((l) => l.id))
  const needs = new Set(items.flatMap((l) => l.product.categories))
  const pairs = products.filter((p) => !inCart.has(p.id) && canBuy(p) && p.categories.some((c) => needs.has(c))).slice(0, 2)
  const toFree = settings.freeDeliveryOver > 0 ? Math.max(0, settings.freeDeliveryOver - subtotal) : 0
  const pay = methods.includes(payment) ? payment : methods[0]

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) errs.phone = 'Enter a phone number we can call'
    if (!form.name.trim()) errs.name = 'Enter your name'
    if (!form.address.trim()) errs.address = 'Where should we deliver?'
    if (!form.city.trim()) errs.city = 'Enter your city'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'That email looks wrong'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setFailure('')
    try {
      const order = await api.post('/orders', { customer: form, payment: pay, notes, items: items.map((l) => ({ id: l.id, qty: l.qty })) })
      saveCustomer(form)
      setPlaced({ ...order, name: form.name.split(' ')[0], phone: form.phone })
      setNotes('')
      clear()
      setStep('done')
      refresh()
    } catch (err) {
      setFailure(err.status ? err.message : `We couldn’t reach the shop just now. Please try again, or call ${settings.phone} to order.`)
    } finally {
      setBusy(false)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex justify-end bg-slate/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-cream shadow-2xl sm:rounded-l-[2rem]"
          >
            <header className="flex items-center gap-2 border-b border-ink/10 px-5 py-4 sm:px-6">
              {step === 'checkout' && (
                <button onClick={() => setStep('cart')} aria-label="Back to cart" className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-moss hover:bg-ink/5"><ArrowLeft size={20} /></button>
              )}
              <h2 className="font-serif text-2xl text-moss">{step === 'checkout' ? 'Checkout' : step === 'done' ? 'Thank you' : 'Your cart'}</h2>
              {step === 'cart' && count > 0 && <span className="font-serif text-sm italic text-ink/50">{count} item{count === 1 ? '' : 's'}</span>}
              <button onClick={close} aria-label="Close cart" className="ml-auto grid h-10 w-10 place-items-center rounded-full text-moss transition hover:rotate-90 hover:bg-ink/5"><X size={20} /></button>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              {step === 'cart' && (
                <motion.div key="cart" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                  {items.length ? (
                    <>
                      {settings.freeDeliveryOver > 0 && (
                        <div className="px-5 pt-4 sm:px-6">
                          <p className="text-sm text-ink/70">
                            {free ? <span className="font-semibold text-moss">You’ve unlocked free delivery 🌿</span> : <>You’re <b className="text-moss">{formatPrice(toFree)}</b> away from free delivery</>}
                          </p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                            <motion.div className="h-full rounded-full bg-amber" initial={false} animate={{ width: `${Math.min(100, (subtotal / settings.freeDeliveryOver) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                        <ul className="divide-y divide-ink/10">
                          <AnimatePresence initial={false}>
                            {items.map((l) => (
                              <motion.li key={l.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 py-4">
                                <Thumb p={l.product} className="h-20 w-20" />
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-serif text-lg leading-tight text-moss">{l.product.name}</p>
                                    <button onClick={() => setQty(l.id, 0)} aria-label={`Remove ${l.product.name}`} className="rounded-full p-1 text-ink/35 transition hover:text-red-600"><Trash2 size={16} /></button>
                                  </div>
                                  <p className="text-xs text-ink/50">{formatPrice(l.product.price)} each</p>
                                  <div className="mt-auto flex items-center justify-between pt-2">
                                    <Stepper size="sm" value={l.qty} max={maxFor(l.product)} onChange={(n) => setQty(l.id, n)} label={`${l.product.name} quantity`} />
                                    <span className="font-semibold tabular-nums text-ink">{formatPrice(l.qty * l.product.price)}</span>
                                  </div>
                                  {l.product.stock != null && l.qty >= l.product.stock && <p className="mt-1 text-[11px] font-semibold text-amber-dark">Only {l.product.stock} left</p>}
                                </div>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </ul>

                        {pairs.length > 0 && (
                          <div className="mt-4 rounded-[1.5rem] bg-sand/70 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-light">Pairs well with</p>
                            <ul className="mt-3 space-y-3">
                              {pairs.map((p) => (
                                <li key={p.id} className="flex items-center gap-3">
                                  <Thumb p={p} className="h-12 w-12 rounded-xl" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-moss">{p.name}</p>
                                    <p className="text-xs text-ink/55">{formatPrice(p.price)} · {p.tagline}</p>
                                  </div>
                                  <button onClick={() => add(p)} aria-label={`Add ${p.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-moss/30 text-moss transition hover:bg-moss hover:text-cream"><Plus size={16} /></button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 border-t border-ink/10 bg-white/60 px-5 py-5 sm:px-6">
                        <div className="flex justify-between text-sm text-ink/70"><span>Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
                        <div className="flex justify-between text-sm text-ink/70"><span>Delivery</span><span className="tabular-nums">{delivery ? formatPrice(delivery) : 'Free'}</span></div>
                        <div className="flex items-baseline justify-between pt-1"><span className="font-serif text-xl text-moss">Total</span><span className="font-serif text-2xl tabular-nums text-ink">{formatPrice(total)}</span></div>
                        <button onClick={() => setStep('checkout')} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-6 py-4 font-semibold text-cream transition hover:bg-forest-light">
                          Checkout · {formatPrice(total)}
                        </button>
                        <div className="pt-2"><Trust note={settings.deliveryNote} /></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-sand text-moss"><ShoppingBag size={26} /></span>
                      <p className="mt-5 font-serif text-2xl text-moss">Your cart is empty</p>
                      <p className="mt-1 text-sm text-ink/60">Find the bar your skin is asking for.</p>
                      <a href="#shop" onClick={close} className="mt-6 rounded-full bg-moss px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-light">Shop by skin need</a>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'checkout' && (
                <motion.form key="checkout" onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                    <p className="text-sm text-ink/60">We’ll call to confirm before we deliver. No account needed.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input id="co-phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={set('phone')} error={errors.phone} className="col-span-2" />
                      <Input id="co-name" label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} className="col-span-2" />
                      <Input id="co-address" label="Delivery address" autoComplete="street-address" placeholder="Street, tole, ward, landmark" value={form.address} onChange={set('address')} error={errors.address} className="col-span-2" />
                      <Input id="co-city" label="City" autoComplete="address-level2" placeholder="Kathmandu" value={form.city} onChange={set('city')} error={errors.city} />
                      <Input id="co-email" label="Email (optional)" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
                    </div>
                    <fieldset>
                      <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-forest-light">Payment</legend>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup">
                        {methods.map((m) => (
                          <button type="button" role="radio" aria-checked={pay === m} key={m} onClick={() => setPayment(m)} className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${pay === m ? 'border-moss bg-moss text-cream' : 'border-ink/15 bg-white text-ink/70 hover:border-moss/40'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                      {pay !== 'Cash on Delivery' && <p className="mt-2 text-xs text-ink/55">We’ll share payment details when we call to confirm.</p>}
                    </fieldset>
                    <label htmlFor="co-notes" className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-forest-light">Notes (optional)</span>
                      <textarea id="co-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gift wrap, best time to call…" className={`${field} resize-none border-ink/15`} />
                    </label>
                    <div className="rounded-[1.5rem] bg-sand/70 p-4 text-sm">
                      {items.map((l) => (
                        <div key={l.id} className="flex justify-between gap-3 py-0.5 text-ink/70"><span className="truncate">{l.qty} × {l.product.name}</span><span className="tabular-nums">{formatPrice(l.qty * l.product.price)}</span></div>
                      ))}
                      <div className="flex justify-between py-0.5 text-ink/70"><span>Delivery</span><span className="tabular-nums">{delivery ? formatPrice(delivery) : 'Free'}</span></div>
                    </div>
                    {failure && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{failure}</p>}
                  </div>
                  <div className="border-t border-ink/10 bg-white/60 px-5 py-5 sm:px-6">
                    <button disabled={busy || !items.length} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-6 py-4 font-semibold text-cream transition hover:bg-forest-light disabled:opacity-60">
                      {busy && <Loader2 size={18} className="animate-spin" />}
                      {busy ? 'Placing your order…' : `Place order · ${formatPrice(total)}`}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 'done' && placed && (
                <motion.div key="done" className="flex flex-1 flex-col items-center justify-center px-8 text-center" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="grid h-20 w-20 place-items-center rounded-full bg-sage/30 text-moss">
                    <CheckCircle2 size={40} />
                  </motion.span>
                  <p className="mt-6 font-serif text-3xl text-moss">Dhanyabad, {placed.name}!</p>
                  <p className="mt-2 text-ink/65">
                    Order <b className="text-moss">{placed.id}</b> is in. We’ll call <b className="text-ink">{placed.phone}</b> shortly to confirm delivery.
                  </p>
                  <div className="mt-6 w-full rounded-[1.5rem] bg-sand/70 p-4 text-left text-sm">
                    {placed.items.map((i) => (
                      <div key={i.id} className="flex justify-between py-0.5 text-ink/70"><span>{i.qty} × {i.name}</span><span className="tabular-nums">{formatPrice(i.qty * i.price)}</span></div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-semibold text-moss"><span>{placed.payment}</span><span className="tabular-nums">{formatPrice(placed.total)}</span></div>
                  </div>
                  <button onClick={close} className="mt-6 rounded-full bg-moss px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-light">Continue browsing</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
