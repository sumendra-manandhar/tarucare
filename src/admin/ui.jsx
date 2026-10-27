import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCheck } from 'lucide-react'
import { cn } from '../components/ui'

export const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
export const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 60) return `${Math.max(m, 1)}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

/* -------------------------------- Building blocks ------------------------------ */

export function Card({ className = '', children }) {
  return <div className={cn('rounded-2xl border border-forest/10 p-5 shadow-sm', !/\bbg-/.test(className) && 'bg-white', className)}>{children}</div>
}

export function Stat({ icon: Icon, label, value, hint, tone = 'forest', delay = 0 }) {
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

export function Toggle({ on, onChange, label }) {
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

export function StatusBadge({ status }) {
  const map = {
    new: 'bg-amber/20 text-amber-600',
    read: 'bg-slate-400/15 text-slate-500',
    replied: 'bg-forest-100 text-forest-500',
    pending: 'bg-amber/20 text-amber-600',
    confirmed: 'bg-sky-100 text-sky-700',
    shipped: 'bg-violet-100 text-violet-700',
    delivered: 'bg-forest-100 text-forest-500',
    cancelled: 'bg-red-100 text-red-600',
  }
  return <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', map[status])}>{status}</span>
}

export function Confirm({ open, title, text, onCancel, onConfirm }) {
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

export function Toast({ message }) {
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

export const rs = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`
