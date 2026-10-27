import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { SoapBar } from '../components/Art'
import { Photo } from '../components/Gallery'
import { cn } from '../components/ui'
import { cartTotals, useStore } from '../store'

const rs = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`

/** Small thumbnail: the product's cover photo, or its illustrated bar. */
export function ProductThumb({ product, className = '' }) {
  const cover = product.photos?.[0]
  return (
    <div className={cn('grid place-items-center overflow-hidden rounded-xl', className)} style={{ background: `${product.base}22` }}>
      {cover ? <Photo id={cover.id} alt={product.name} className="h-full w-full object-cover" /> : <SoapBar base={product.base} accent={product.accent} label="" className="w-[80%]" />}
    </div>
  )
}

/** Adds to the cart and shows the "added" toast. */
export function useAddToCart() {
  const { addToCart, products } = useStore()
  return (id, qty = 1) => {
    const n = addToCart(id, qty)
    const p = products.find((x) => x.id === id)
    window.dispatchEvent(new CustomEvent('taru:added', { detail: { product: p, ok: n > 0 } }))
    return n
  }
}

export function CartButton({ className = '' }) {
  const { cart, products, settings, setCartOpen } = useStore()
  const { count } = cartTotals(cart, products, settings)
  if (!settings.cartEnabled) return null
  return (
    <button onClick={() => setCartOpen(true)} className={cn('relative grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-white/70 text-forest transition hover:bg-white', className)} aria-label={`Open cart, ${count} items`}>
      <ShoppingBag className="h-[18px] w-[18px]" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1 text-[11px] font-bold text-forest-900"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function CartToast() {
  const { setCartOpen } = useStore()
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let t
    const on = (e) => {
      setMsg(e.detail)
      clearTimeout(t)
      t = setTimeout(() => setMsg(null), 2600)
    }
    window.addEventListener('taru:added', on)
    return () => {
      window.removeEventListener('taru:added', on)
      clearTimeout(t)
    }
  }, [])
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 z-[85] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl bg-forest p-3 pr-4 text-cream shadow-2xl"
          style={{ x: '-50%', left: '50%' }}
        >
          {msg.product && <ProductThumb product={msg.product} className="h-12 w-12 shrink-0" />}
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{msg.ok ? 'Added to cart' : 'No more stock available'}</p>
            <p className="truncate text-cream/60">{msg.product?.name}</p>
          </div>
          {msg.ok && (
            <button
              onClick={() => {
                setMsg(null)
                setCartOpen(true)
              }}
              className="rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-forest-900"
            >
              View cart
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function QtyStepper({ value, max, onChange }) {
  return (
    <div className="flex items-center rounded-full border border-forest/15 bg-white">
      <button onClick={() => onChange(value - 1)} className="grid h-8 w-8 place-items-center text-forest" aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} className="grid h-8 w-8 place-items-center text-forest disabled:opacity-30" aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

const EMPTY = { name: '', phone: '', email: '', address: '', city: '', notes: '' }

export function CartDrawer() {
  const store = useStore()
  const { cart, products, settings, cartOpen, setCartOpen, setCartQty, removeFromCart, placeOrder, maxFor } = store
  const { lines, subtotal, delivery, total, count } = cartTotals(cart, products, settings)
  const [step, setStep] = useState('cart')
  const [form, setForm] = useState(EMPTY)
  const methods = settings.paymentMethods.length ? settings.paymentMethods : ['Cash on Delivery']
  const [chosenPayment, setPayment] = useState(methods[0])
  const payment = methods.includes(chosenPayment) ? chosenPayment : methods[0]
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!cartOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [cartOpen, setCartOpen])

  const close = () => {
    setCartOpen(false)
    if (step === 'done') setTimeout(() => setStep('cart'), 400)
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Enter your name'
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.address.trim()) errs.address = 'Enter a delivery address'
    if (!form.city.trim()) errs.city = 'Enter your city'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setTimeout(() => {
      const { notes, ...customer } = form
      const o = placeOrder({ customer, payment, notes })
      setBusy(false)
      if (o) {
        setOrder(o)
        setForm(EMPTY)
        setStep('done')
      }
    }, 900)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const field = (k, label, props = {}) => (
    <label className={cn('block', props.wide && 'col-span-2')}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-forest">{label}</span>
      <input
        id={`checkout-${k}`}
        value={form[k]}
        onChange={set(k)}
        placeholder={props.placeholder}
        type={props.type || 'text'}
        className={cn('w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-4', errors[k] ? 'border-red-400 focus:ring-red-100' : 'border-forest/15 focus:border-forest-400 focus:ring-forest/10')}
      />
      {errors[k] && <span className="mt-1 block text-xs text-red-500">{errors[k]}</span>}
    </label>
  )

  const freeLeft = settings.freeDeliveryOver ? Math.max(0, settings.freeDeliveryOver - subtotal) : 0

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-[75] flex justify-end bg-forest-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <header className="flex items-center gap-3 border-b border-forest/10 px-5 py-4">
              {step === 'checkout' && (
                <button onClick={() => setStep('cart')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest/5" aria-label="Back to cart">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="font-serif text-2xl text-forest">{step === 'checkout' ? 'Checkout' : step === 'done' ? 'Order placed' : 'Your cart'}</h2>
              {step === 'cart' && count > 0 && <span className="rounded-full bg-forest/5 px-2.5 py-0.5 text-xs font-semibold text-forest">{count} items</span>}
              <button onClick={close} className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-forest/5" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              {step === 'cart' && (
                <motion.div key="cart" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {lines.length ? (
                    <>
                      {settings.freeDeliveryOver > 0 && (
                        <div className="border-b border-forest/10 px-5 py-3">
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Truck className="h-4 w-4 text-forest-400" />
                            {freeLeft > 0 ? (
                              <span>
                                Add <b className="text-forest">{rs(freeLeft)}</b> more for free delivery
                              </span>
                            ) : (
                              <span className="font-semibold text-forest">You've unlocked free delivery 🌿</span>
                            )}
                          </p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest/10">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-forest-400 to-amber" animate={{ width: `${Math.min(100, (subtotal / settings.freeDeliveryOver) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      <ul className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-5">
                        <AnimatePresence initial={false}>
                          {lines.map((l) => (
                            <motion.li key={l.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }} className="flex gap-3 rounded-2xl border border-forest/10 bg-white p-3">
                              <ProductThumb product={l.product} className="h-20 w-20 shrink-0" />
                              <div className="flex min-w-0 flex-1 flex-col">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-serif text-base leading-tight text-forest">{l.product.name}</p>
                                  <button onClick={() => removeFromCart(l.id)} className="text-slate-400 hover:text-red-500" aria-label={`Remove ${l.product.name}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-400">{rs(l.product.price)} each · {l.product.weight}</p>
                                <div className="mt-auto flex items-center justify-between pt-2">
                                  <QtyStepper value={l.qty} max={maxFor(l.id)} onChange={(q) => setCartQty(l.id, q)} />
                                  <span className="font-semibold tabular-nums text-forest">{rs(l.product.price * l.qty)}</span>
                                </div>
                                {l.qty >= l.product.stock && <p className="mt-1 text-[11px] text-amber-600">Only {l.product.stock} in stock</p>}
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      <div className="space-y-2 border-t border-forest/10 bg-white p-5">
                        <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span className="tabular-nums">{rs(subtotal)}</span></div>
                        <div className="flex justify-between text-sm text-slate-500"><span>Delivery</span><span className="tabular-nums">{delivery ? rs(delivery) : 'Free'}</span></div>
                        <div className="flex justify-between pt-1 font-serif text-xl text-forest"><span>Total</span><span className="tabular-nums">{rs(total)}</span></div>
                        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep('checkout')} className="mt-2 w-full rounded-full bg-forest py-3.5 text-sm font-semibold text-cream hover:bg-forest-500">
                          Checkout
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-32">
                        <SoapBar base="#d9b38c" accent="#8a5a32" />
                      </motion.div>
                      <p className="mt-6 font-serif text-2xl text-forest">Your cart is empty</p>
                      <p className="mt-1 text-sm text-slate-400">Find a bar that suits your skin.</p>
                      <a href="#collection" onClick={close} className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream">
                        Browse the collection
                      </a>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'checkout' && (
                <motion.form key="checkout" onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-5">
                    <div className="grid grid-cols-2 gap-3">
                      {field('name', 'Full name', { wide: true, placeholder: 'Your name' })}
                      {field('phone', 'Phone', { type: 'tel', placeholder: '98XXXXXXXX' })}
                      {field('email', 'Email (optional)', { type: 'email', placeholder: 'you@example.com' })}
                      {field('address', 'Delivery address', { wide: true, placeholder: 'Street, ward, landmark' })}
                      {field('city', 'City', { wide: true, placeholder: 'Kathmandu' })}
                    </div>
                    <fieldset>
                      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-forest">Payment</legend>
                      <div className="grid grid-cols-2 gap-2">
                        {methods.map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setPayment(m)}
                            className={cn('rounded-xl border px-3 py-2.5 text-left text-sm transition', payment === m ? 'border-forest bg-forest text-cream' : 'border-forest/15 bg-white text-slate-500 hover:border-forest/40')}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-forest">Order notes (optional)</span>
                      <textarea id="checkout-notes" rows={2} value={form.notes} onChange={set('notes')} placeholder="Gift wrap, delivery time…" className="w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest/10" />
                    </label>
                    <div className="rounded-2xl border border-forest/10 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order summary</p>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {lines.map((l) => (
                          <li key={l.id} className="flex justify-between gap-2 text-slate-500">
                            <span className="truncate">{l.qty} × {l.product.name}</span>
                            <span className="tabular-nums">{rs(l.qty * l.product.price)}</span>
                          </li>
                        ))}
                        <li className="flex justify-between text-slate-500"><span>Delivery</span><span className="tabular-nums">{delivery ? rs(delivery) : 'Free'}</span></li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-forest/10 bg-white p-5">
                    <button disabled={busy || !lines.length} className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-semibold text-cream hover:bg-forest-500 disabled:opacity-60">
                      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                      {busy ? 'Placing order…' : `Place order · ${rs(total)}`}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 'done' && order && (
                <motion.div key="done" className="flex flex-1 flex-col items-center justify-center p-8 text-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                  <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <CheckCircle2 className="h-20 w-20 text-forest-400" />
                  </motion.div>
                  <h3 className="mt-5 font-serif text-3xl text-forest">Thank you, {order.customer.name.split(' ')[0]}!</h3>
                  <p className="mt-2 text-slate-400">
                    Your order <b className="text-forest">{order.id}</b> has been received. We'll call {order.customer.phone} to confirm delivery.
                  </p>
                  <div className="mt-6 w-full rounded-2xl border border-forest/10 bg-white p-4 text-left text-sm">
                    {order.items.map((i) => (
                      <div key={i.id} className="flex justify-between py-1 text-slate-500">
                        <span>{i.qty} × {i.name}</span>
                        <span className="tabular-nums">{rs(i.qty * i.price)}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-forest/10 pt-2 font-semibold text-forest">
                      <span>Total · {order.payment}</span>
                      <span className="tabular-nums">{rs(order.total)}</span>
                    </div>
                  </div>
                  <button onClick={close} className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream">
                    Continue shopping
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
