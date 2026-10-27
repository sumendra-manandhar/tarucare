import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Ban, CheckCircle2, Clock, Inbox, Loader2, PackageCheck, Truck, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// ---------- buttons & inputs ----------
const variants = {
  primary: 'bg-forest text-cream hover:bg-forest-light',
  secondary: 'border border-forest/15 bg-white text-forest hover:border-forest/40',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-forest hover:bg-forest/5',
}

export function Button({ variant = 'primary', loading, icon: Icon, children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

export const inputClass =
  'w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm text-slate outline-none transition placeholder:text-slate/40 focus:border-forest focus:ring-4 focus:ring-forest/10 focus-visible:ring-4 focus-visible:ring-forest/20'

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-forest">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate/50">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm font-medium text-forest"
    >
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-forest' : 'bg-slate/20'}`}>
        <motion.span layout className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-forest bg-forest text-cream' : 'border-forest/15 bg-white text-forest/70 hover:border-forest/40'}`}
    >
      {children}
    </button>
  )
}

// ---------- inquiry status ----------
export const STATUS = {
  new: { label: 'New', icon: Inbox, cls: 'bg-amber/20 text-amber-dark ring-amber/40' },
  in_progress: { label: 'In progress', icon: Clock, cls: 'bg-sky-100 text-sky-800 ring-sky-300' },
  resolved: { label: 'Resolved', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300' },
}

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.new
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.cls}`}>
      <s.icon size={12} />
      {s.label}
    </span>
  )
}

// ---------- order status ----------
export const ORDER_STATUS = {
  pending: { label: 'Pending', icon: Inbox, cls: 'bg-amber/20 text-amber-dark ring-amber/40' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, cls: 'bg-sky-100 text-sky-800 ring-sky-300' },
  shipped: { label: 'Shipped', icon: Truck, cls: 'bg-violet-100 text-violet-800 ring-violet-300' },
  delivered: { label: 'Delivered', icon: PackageCheck, cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300' },
  cancelled: { label: 'Cancelled', icon: Ban, cls: 'bg-red-100 text-red-700 ring-red-300' },
}

export function OrderBadge({ status }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.pending
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.cls}`}>
      <s.icon size={12} />
      {s.label}
    </span>
  )
}

export const rs = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`

// ---------- overlays ----------
function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
}

export function Drawer({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && <DrawerPanel onClose={onClose} title={title} footer={footer}>{children}</DrawerPanel>}
    </AnimatePresence>
  )
}

function DrawerPanel({ onClose, title, children, footer }) {
  useEscape(onClose)
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col bg-cream shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-forest/10 px-6 py-4">
          <h2 className="font-serif text-xl text-forest">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-forest hover:bg-forest/5">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-forest/10 bg-white/60 px-6 py-4">{footer}</footer>}
      </motion.aside>
    </motion.div>
  )
}

const ConfirmContext = createContext(null)
const ToastContext = createContext(null)

export function OverlayProvider({ children }) {
  const [confirm, setConfirm] = useState(null)
  const [toasts, setToasts] = useState([])

  const ask = useCallback((opts) => new Promise((resolve) => setConfirm({ ...opts, resolve })), [])
  const toast = useCallback((message, type = 'success') => {
    const id = Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const close = (v) => {
    confirm.resolve(v)
    setConfirm(null)
  }

  return (
    <ConfirmContext.Provider value={ask}>
      <ToastContext.Provider value={toast}>
        {children}
        <AnimatePresence>
          {confirm && (
            <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-slate/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => close(false)}>
              <motion.div
                role="alertdialog"
                aria-modal="true"
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle size={20} />
                </span>
                <h3 className="mt-4 font-serif text-xl text-forest">{confirm.title}</h3>
                <p className="mt-1 text-sm text-slate/70">{confirm.message}</p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => close(false)} autoFocus>Cancel</Button>
                  <Button variant="danger" onClick={() => close(true)}>{confirm.confirmLabel ?? 'Delete'}</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col gap-2" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-forest text-cream'}`}
              >
                {t.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ToastContext.Provider>
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
export const useToast = () => useContext(ToastContext)

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-forest/20 bg-white/50 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-forest/5 text-forest/60">
        <Icon size={22} />
      </span>
      <p className="mt-3 font-semibold text-forest">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-slate/60">{children}</p>}
    </div>
  )
}

export const timeAgo = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}
