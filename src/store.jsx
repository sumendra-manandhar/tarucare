import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, DEFAULT_INQUIRIES } from './data'

const StoreContext = createContext(null)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`taru:${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function usePersisted(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(`taru:${key}`, JSON.stringify(value))
    } catch {
      /* storage unavailable: keep in memory only */
    }
  }, [key, value])
  return [value, setValue]
}

export function StoreProvider({ children }) {
  const [products, setProducts] = usePersisted('products', DEFAULT_PRODUCTS)
  const [inquiries, setInquiries] = usePersisted('inquiries', DEFAULT_INQUIRIES)
  const [settings, setSettings] = usePersisted('settings', DEFAULT_SETTINGS)

  const api = {
    products,
    inquiries,
    settings,
    saveProduct(p) {
      setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]))
    },
    deleteProduct(id) {
      setProducts((list) => list.filter((x) => x.id !== id))
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
      setProducts(DEFAULT_PRODUCTS)
      setInquiries(DEFAULT_INQUIRIES)
      setSettings(DEFAULT_SETTINGS)
    },
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
