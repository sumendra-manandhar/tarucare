import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, DEFAULT_INQUIRIES, DEFAULT_ORDERS } from './data'
import { deletePhotos } from './photos'

const StoreContext = createContext(null)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`taru:${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function usePersisted(key, fallback, normalize = (v) => v) {
  const [value, setValue] = useState(() => normalize(load(key, fallback)))
  useEffect(() => {
    try {
      localStorage.setItem(`taru:${key}`, JSON.stringify(value))
    } catch {
      /* storage unavailable: keep in memory only */
    }
  }, [key, value])
  return [value, setValue]
}

const normalizeProducts = (list) => list.map((p) => ({ photos: [], ...p }))
const normalizeSettings = (s) => ({ ...DEFAULT_SETTINGS, ...s })

export function cartTotals(cart, products, settings) {
  const lines = cart
    .map((c) => ({ ...c, product: products.find((p) => p.id === c.id) }))
    .filter((l) => l.product && l.product.active)
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0)
  const delivery = !subtotal || (settings.freeDeliveryOver && subtotal >= settings.freeDeliveryOver) ? 0 : Number(settings.deliveryFee) || 0
  const count = lines.reduce((s, l) => s + l.qty, 0)
  return { lines, subtotal, delivery, total: subtotal + delivery, count }
}

const adjustStock = (products, items, sign) =>
  products.map((p) => {
    const line = items.find((i) => i.id === p.id)
    return line ? { ...p, stock: Math.max(0, p.stock + sign * line.qty) } : p
  })

export function StoreProvider({ children }) {
  const [products, setProducts] = usePersisted('products', DEFAULT_PRODUCTS, normalizeProducts)
  const [inquiries, setInquiries] = usePersisted('inquiries', DEFAULT_INQUIRIES)
  const [settings, setSettings] = usePersisted('settings', DEFAULT_SETTINGS, normalizeSettings)
  const [orders, setOrders] = usePersisted('orders', DEFAULT_ORDERS)
  const [cart, setCart] = usePersisted('cart', [])
  const [cartOpen, setCartOpen] = useState(false)

  const maxFor = (id) => {
    const p = products.find((x) => x.id === id)
    return p ? Math.min(p.stock, Number(settings.maxQtyPerItem) || Infinity) : 0
  }

  const api = {
    products,
    inquiries,
    settings,
    orders,
    cart,
    cartOpen,
    setCartOpen,
    maxFor,

    saveProduct(p) {
      setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]))
    },
    deleteProduct(id) {
      const p = products.find((x) => x.id === id)
      if (p?.photos?.length) deletePhotos(p.photos.map((ph) => ph.id))
      setProducts((list) => list.filter((x) => x.id !== id))
      setCart((c) => c.filter((x) => x.id !== id))
    },

    /** Adds to the cart, capped by stock and the per-item limit. Returns the quantity actually in the cart. */
    addToCart(id, qty = 1) {
      const max = maxFor(id)
      const existing = cart.find((c) => c.id === id)
      const next = Math.min(max, (existing?.qty || 0) + qty)
      if (next <= 0) return 0
      setCart((c) => (c.some((x) => x.id === id) ? c.map((x) => (x.id === id ? { ...x, qty: next } : x)) : [...c, { id, qty: next }]))
      return next
    },
    setCartQty(id, qty) {
      const q = Math.min(maxFor(id), qty)
      setCart((c) => (q <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty: q } : x))))
    },
    removeFromCart(id) {
      setCart((c) => c.filter((x) => x.id !== id))
    },
    clearCart() {
      setCart([])
    },

    /** Turns the cart into an order and reserves stock. */
    placeOrder({ customer, payment, notes }) {
      const { lines, subtotal, delivery, total } = cartTotals(cart, products, settings)
      const items = lines.map((l) => ({ id: l.id, name: l.product.name, price: l.product.price, qty: Math.min(l.qty, l.product.stock) })).filter((i) => i.qty > 0)
      if (!items.length) return null
      const next = Math.max(1000, ...orders.map((o) => Number(o.id.replace(/\D/g, '')) || 0)) + 1
      const order = { id: `TC-${next}`, date: Date.now(), status: 'pending', customer, payment, notes, items, subtotal, delivery, total }
      setOrders((o) => [order, ...o])
      setProducts((list) => adjustStock(list, items, -1))
      setCart([])
      return order
    },
    setOrderStatus(id, status) {
      const order = orders.find((o) => o.id === id)
      if (!order || order.status === status) return
      // Cancelling returns the items to stock; reviving a cancelled order takes them again.
      if (status === 'cancelled') setProducts((list) => adjustStock(list, order.items, +1))
      else if (order.status === 'cancelled') setProducts((list) => adjustStock(list, order.items, -1))
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)))
    },
    deleteOrder(id) {
      setOrders((list) => list.filter((o) => o.id !== id))
    },

    addInquiry(data) {
      setInquiries((list) => [{ ...data, id: `i${Date.now()}`, date: Date.now(), status: 'new' }, ...list])
    },
    updateInquiry(id, patch) {
      setInquiries((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    },
    deleteInquiry(id) {
      setInquiries((list) => list.filter((x) => x.id !== id))
    },
    setSettings,
    resetAll() {
      deletePhotos(products.flatMap((p) => (p.photos || []).map((ph) => ph.id)))
      setProducts(normalizeProducts(DEFAULT_PRODUCTS))
      setInquiries(DEFAULT_INQUIRIES)
      setSettings(DEFAULT_SETTINGS)
      setOrders(DEFAULT_ORDERS)
      setCart([])
    },
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
