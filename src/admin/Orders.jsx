import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CreditCard, MapPin, Phone, ShoppingCart, StickyNote, Trash2, User } from 'lucide-react'
import { cn } from '../components/ui'
import { ORDER_STATUSES } from '../data'
import { useStore } from '../store'
import { ProductThumb } from '../site/Cart'
import { Card, Confirm, StatusBadge, ago, rs } from './ui'

const FLOW = ['pending', 'confirmed', 'shipped', 'delivered']

function OrderDetail({ order, toast, onDelete }) {
  const { products, setOrderStatus } = useStore()
  const step = FLOW.indexOf(order.status)
  const cancelled = order.status === 'cancelled'
  const next = FLOW[step + 1]
  const change = (status) => {
    setOrderStatus(order.id, status)
    toast(status === 'cancelled' ? `${order.id} cancelled, items returned to stock` : `${order.id} marked ${status}`)
  }

  return (
    <motion.div key={order.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <StatusBadge status={order.status} />
          <h3 className="mt-2 font-serif text-2xl text-forest">Order {order.id}</h3>
          <p className="text-sm text-slate-400">{new Date(order.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <button onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Delete order">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* progress */}
      <ol className="mt-6 grid grid-cols-4 gap-1">
        {FLOW.map((s, i) => {
          const done = !cancelled && i <= step
          return (
            <li key={s} className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex w-full items-center">
                <span className={cn('h-0.5 flex-1', i === 0 ? 'opacity-0' : done ? 'bg-forest-400' : 'bg-forest/10')} />
                <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold', done ? 'border-forest-400 bg-forest-400 text-white' : 'border-forest/15 text-slate-400')}>
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn('h-0.5 flex-1', i === FLOW.length - 1 ? 'opacity-0' : !cancelled && i < step ? 'bg-forest-400' : 'bg-forest/10')} />
              </div>
              <span className={cn('text-[11px] capitalize', done ? 'font-semibold text-forest' : 'text-slate-400')}>{s}</span>
            </li>
          )
        })}
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        {!cancelled && next && (
          <button onClick={() => change(next)} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold capitalize text-cream hover:bg-forest-500">
            Mark {next}
          </button>
        )}
        {!cancelled && order.status !== 'delivered' && (
          <button onClick={() => change('cancelled')} className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
            Cancel order
          </button>
        )}
        {cancelled && (
          <button onClick={() => change('pending')} className="rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5">
            Restore order
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          Set status
          <select
            id={`status-${order.id}`}
            value={order.status}
            onChange={(e) => change(e.target.value)}
            className="rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-sm capitalize text-forest outline-none focus:border-forest-400"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl bg-cream p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-forest"><User className="h-4 w-4 text-forest-400" /> {order.customer.name}</p>
          <p className="flex items-center gap-2 text-slate-500"><Phone className="h-4 w-4 text-forest-400" /> {order.customer.phone}</p>
          {order.customer.email && <p className="truncate pl-6 text-slate-500">{order.customer.email}</p>}
          <p className="flex items-start gap-2 text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" /> {order.customer.address}, {order.customer.city}</p>
        </div>
        <div className="space-y-2 rounded-2xl bg-cream p-4 text-sm">
          <p className="flex items-center gap-2 text-slate-500"><CreditCard className="h-4 w-4 text-forest-400" /> {order.payment}</p>
          <p className="flex items-start gap-2 text-slate-500"><StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" /> {order.notes || <span className="italic text-slate-400">No notes</span>}</p>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-forest/5 rounded-2xl border border-forest/10">
        {order.items.map((i) => {
          const p = products.find((x) => x.id === i.id)
          return (
            <li key={i.id} className="flex items-center gap-3 p-3">
              {p ? <ProductThumb product={p} className="h-12 w-12 shrink-0" /> : <span className="h-12 w-12 shrink-0 rounded-xl bg-forest/5" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest">{i.name}</p>
                <p className="text-xs text-slate-400">{i.qty} × {rs(i.price)}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-forest">{rs(i.qty * i.price)}</span>
            </li>
          )
        })}
        <li className="space-y-1 p-3 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="tabular-nums">{rs(order.subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Delivery</span><span className="tabular-nums">{order.delivery ? rs(order.delivery) : 'Free'}</span></div>
          <div className="flex justify-between pt-1 font-serif text-lg text-forest"><span>Total</span><span className="tabular-nums">{rs(order.total)}</span></div>
        </li>
      </ul>
    </motion.div>
  )
}

export function Orders({ query, toast }) {
  const { orders, deleteOrder } = useStore()
  const [filter, setFilter] = useState('all')
  const [selId, setSelId] = useState(null)
  const [del, setDel] = useState(null)
  const q = query.toLowerCase()
  const list = orders.filter(
    (o) =>
      (filter === 'all' || o.status === filter) &&
      `${o.id} ${o.customer.name} ${o.customer.phone} ${o.customer.city} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(q),
  )
  const sel = orders.find((o) => o.id === selId)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <Card className="p-0">
        <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-forest/10 p-3">
          {['all', ...ORDER_STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn('relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm capitalize', filter === s ? 'text-cream' : 'text-slate-400 hover:text-forest')}>
              {filter === s && <motion.span layoutId="order-filter" className="absolute inset-0 rounded-full bg-forest" />}
              <span className="relative">
                {s} {s !== 'all' && <span className="opacity-60">({orders.filter((o) => o.status === s).length})</span>}
              </span>
            </button>
          ))}
        </div>
        <ul className="scrollbar-thin max-h-[65vh] divide-y divide-forest/5 overflow-y-auto">
          {list.map((o) => (
            <li key={o.id}>
              <button onClick={() => setSelId(o.id)} className={cn('flex w-full items-center gap-3 px-4 py-3.5 text-left transition', selId === o.id ? 'bg-forest/5' : 'hover:bg-cream')}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-forest">{o.id} · {o.customer.name}</p>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-forest">{rs(o.total)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-400">
                      {o.items.reduce((n, i) => n + i.qty, 0)} items · {o.customer.city} · {ago(o.date)}
                    </p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              </button>
            </li>
          ))}
          {!list.length && <li className="p-10 text-center text-sm text-slate-400">No orders here.</li>}
        </ul>
      </Card>

      <Card className="min-h-[320px]">
        <AnimatePresence mode="wait">
          {sel ? (
            <OrderDetail key={sel.id} order={sel} toast={toast} onDelete={() => setDel(sel)} />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-slate-400">
              <ShoppingCart className="h-10 w-10 text-forest-200" />
              <p className="mt-3 text-sm">Select an order to see its details</p>
              <p className="mt-1 text-xs">{orders.filter((o) => Date.now() - o.date < 86400000).length} placed in the last 24 hours</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Confirm
        open={!!del}
        title={`Delete order ${del?.id}?`}
        text="The order record is removed permanently. Stock is not changed; cancel the order first to return its items to stock."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          deleteOrder(del.id)
          setSelId(null)
          setDel(null)
          toast('Order deleted')
        }}
      />
    </div>
  )
}
