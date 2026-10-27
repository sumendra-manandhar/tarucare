import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSiteData } from './SiteData'

const CartContext = createContext(null)
const KEY = 'taru:cart'

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode: the cart just won't survive a reload */
  }
}

export const ADDED_EVENT = 'taru:added'

// Cart lines are { id, qty }; prices and names always come from live product data.
export function CartProvider({ children }) {
  const { products, settings } = useSiteData()
  const [lines, setLines] = useState(() => read(KEY, []))
  const [open, setOpen] = useState(false)

  useEffect(() => write(KEY, lines), [lines])

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products])
  const canBuy = useCallback((p) => !!settings.cartEnabled && p?.price != null && p.stock !== 0, [settings.cartEnabled])
  const maxFor = useCallback(
    (p) => Math.max(0, Math.min(settings.maxQtyPerItem || 10, p?.stock ?? Infinity)),
    [settings.maxQtyPerItem],
  )

  const items = lines
    .map((l) => ({ ...l, product: byId[l.id] }))
    .filter((l) => l.product && l.product.price != null)
    .map((l) => ({ ...l, qty: Math.min(l.qty, maxFor(l.product)) }))
    .filter((l) => l.qty > 0)
  const count = items.reduce((n, l) => n + l.qty, 0)
  const subtotal = items.reduce((s, l) => s + l.qty * l.product.price, 0)
  const free = settings.freeDeliveryOver > 0 && subtotal >= settings.freeDeliveryOver
  const delivery = !subtotal || free ? 0 : settings.deliveryFee || 0

  const add = (p, qty = 1) => {
    const max = maxFor(p)
    const current = lines.find((l) => l.id === p.id)?.qty ?? 0
    const next = Math.min(max, current + qty)
    if (next > current) setLines((ls) => (ls.some((l) => l.id === p.id) ? ls.map((l) => (l.id === p.id ? { ...l, qty: next } : l)) : [...ls, { id: p.id, qty: next }]))
    window.dispatchEvent(new CustomEvent(ADDED_EVENT, { detail: { product: p, added: next - current, qty: next } }))
    return next
  }
  const setQty = (id, qty) => setLines((ls) => (qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, maxFor(byId[id])) } : l))))
  const qtyOf = (id) => items.find((l) => l.id === id)?.qty ?? 0
  const clear = () => setLines([])

  const value = { items, count, subtotal, delivery, total: subtotal + delivery, free, open, setOpen, add, setQty, qtyOf, clear, canBuy, maxFor }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)

// Returning customers shouldn't retype their address.
export const savedCustomer = () => read('taru:customer', null)
export const saveCustomer = (c) => write('taru:customer', c)
