import { motion } from 'framer-motion'
import { Check, CreditCard, Download, MapPin, Phone, Search, ShoppingCart, StickyNote, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { SoapBox } from '../components/Illustrations'
import { api } from '../lib/api'
import { Button, Chip, Drawer, EmptyState, Field, inputClass, ORDER_STATUS, OrderBadge, rs, timeAgo, useConfirm, useToast } from './ui'

const FLOW = ['pending', 'confirmed', 'shipped', 'delivered']
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

function exportCsv(rows) {
  const head = ['id', 'createdAt', 'status', 'name', 'phone', 'email', 'address', 'city', 'items', 'subtotal', 'delivery', 'total', 'payment', 'notes']
  const body = rows.map((o) =>
    [o.id, o.createdAt, o.status, o.customer.name, o.customer.phone, o.customer.email, o.customer.address, o.customer.city, o.items.map((i) => `${i.qty} x ${i.name}`).join('; '), o.subtotal, o.delivery, o.total, o.payment, o.notes]
      .map(csvCell)
      .join(','),
  )
  const url = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `tarucare-orders-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

function Steps({ status }) {
  const at = FLOW.indexOf(status)
  return (
    <ol className="grid grid-cols-4">
      {FLOW.map((s, i) => {
        const done = status !== 'cancelled' && i <= at
        return (
          <li key={s} className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done ? 'bg-forest' : 'bg-forest/10'}`} />
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-forest text-cream' : 'border-2 border-forest/15 text-slate/40'}`}>
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`h-0.5 flex-1 ${i === FLOW.length - 1 ? 'invisible' : status !== 'cancelled' && i < at ? 'bg-forest' : 'bg-forest/10'}`} />
            </div>
            <span className={`text-[11px] ${done ? 'font-semibold text-forest' : 'text-slate/50'}`}>{ORDER_STATUS[s].label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Detail({ o, products, onUpdate, onDelete, onClose }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [notes, setNotes] = useState(o.adminNotes ?? '')
  const [saving, setSaving] = useState(false)
  const next = FLOW[FLOW.indexOf(o.status) + 1]

  const patch = async (body, msg) => {
    setSaving(true)
    try {
      onUpdate(await api.patch(`/orders/${o.id}`, body))
      if (msg) toast(msg)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const cancel = async () => {
    const ok = await confirm({ title: `Cancel ${o.id}?`, message: 'The soaps in this order go back into stock. You can restore the order later.', confirmLabel: 'Cancel order' })
    if (ok) patch({ status: 'cancelled' }, `${o.id} cancelled, stock returned`)
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={`Order ${o.id}`}
      footer={
        <>
          <Button variant="ghost" icon={Trash2} onClick={onDelete} className="mr-auto text-red-600 hover:bg-red-50">Delete</Button>
          <a href={`tel:${o.customer.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream hover:bg-forest-light">
            <Phone size={16} /> Call customer
          </a>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <OrderBadge status={o.status} />
          <span className="text-xs text-slate/50">Placed {new Date(o.createdAt).toLocaleString()}</span>
        </div>

        <div className="rounded-2xl bg-white p-5">
          {o.status === 'cancelled' ? (
            <p className="text-sm text-slate/70">This order was cancelled and its soaps were returned to stock.</p>
          ) : (
            <Steps status={o.status} />
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {o.status !== 'cancelled' && next && (
              <Button loading={saving} onClick={() => patch({ status: next }, `Marked as ${ORDER_STATUS[next].label.toLowerCase()}`)}>Mark as {ORDER_STATUS[next].label.toLowerCase()}</Button>
            )}
            {o.status !== 'cancelled' && o.status !== 'delivered' && (
              <Button variant="secondary" onClick={cancel} className="text-red-600">Cancel order</Button>
            )}
            {o.status === 'cancelled' && (
              <Button variant="secondary" loading={saving} onClick={() => patch({ status: 'pending' }, 'Order restored')}>Restore order</Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 text-sm">
            <p className="font-serif text-xl text-forest">{o.customer.name}</p>
            <p className="mt-3 flex items-center gap-2 text-forest"><Phone size={14} /> {o.customer.phone}</p>
            {o.customer.email && <p className="mt-1 truncate pl-6 text-slate/70">{o.customer.email}</p>}
            <p className="mt-2 flex items-start gap-2 text-slate/80"><MapPin size={14} className="mt-0.5 shrink-0 text-forest" /> {o.customer.address}, {o.customer.city}</p>
          </div>
          <div className="space-y-2 rounded-2xl bg-white p-5 text-sm">
            <p className="flex items-center gap-2 text-slate/80"><CreditCard size={14} className="text-forest" /> {o.payment}</p>
            <p className="flex items-start gap-2 text-slate/80"><StickyNote size={14} className="mt-0.5 shrink-0 text-forest" /> {o.notes || <em className="text-slate/40">No note from the customer</em>}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <ul className="divide-y divide-forest/5">
            {o.items.map((i) => {
              const p = products.find((x) => x.id === i.id)
              return (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <div className="w-14 shrink-0">
                    {p?.image ? <img src={p.image} alt="" className="aspect-square w-full rounded-lg object-cover" /> : p ? <SoapBox product={p} className="w-full" /> : <span className="block aspect-square rounded-lg bg-forest/5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest">{i.name}</p>
                    <p className="text-xs text-slate/60">{i.qty} × {rs(i.price)}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-forest">{rs(i.qty * i.price)}</span>
                </li>
              )
            })}
          </ul>
          <div className="mt-2 space-y-1 border-t border-forest/10 pt-3 text-sm">
            <div className="flex justify-between text-slate/70"><span>Subtotal</span><span className="tabular-nums">{rs(o.subtotal)}</span></div>
            <div className="flex justify-between text-slate/70"><span>Delivery</span><span className="tabular-nums">{o.delivery ? rs(o.delivery) : 'Free'}</span></div>
            <div className="flex justify-between font-serif text-lg text-forest"><span>Total</span><span className="tabular-nums">{rs(o.total)}</span></div>
          </div>
        </div>

        <Field label="Internal notes" hint="Only visible to admins">
          <textarea rows={3} className={`${inputClass} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Rider assigned, delivering Friday" />
        </Field>
        <Button variant="secondary" loading={saving} disabled={notes === (o.adminNotes ?? '')} onClick={() => patch({ adminNotes: notes }, 'Notes saved')}>Save notes</Button>
      </div>
    </Drawer>
  )
}

export default function Orders({ data, setData }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  const all = data.orders
  const counts = Object.fromEntries(Object.keys(ORDER_STATUS).map((k) => [k, all.filter((o) => o.status === k).length]))
  const q = query.toLowerCase()
  const rows = all
    .filter((o) => status === 'all' || o.status === status)
    .filter((o) => `${o.id} ${o.customer.name} ${o.customer.phone} ${o.customer.city} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(q))
  const open = all.find((o) => o.id === openId)

  // The server returns fresh products too, since status changes can move stock.
  const update = ({ order, products }) => setData((d) => ({ ...d, products, orders: d.orders.map((x) => (x.id === order.id ? order : x)) }))

  const remove = async (o) => {
    const ok = await confirm({ title: `Delete order ${o.id}?`, message: 'The order record is removed permanently. Stock is not changed, so cancel the order first if the soaps should go back on the shelf.' })
    if (!ok) return
    try {
      await api.del(`/orders/${o.id}`)
      setData((d) => ({ ...d, orders: d.orders.filter((x) => x.id !== o.id) }))
      setOpenId(null)
      toast('Order deleted')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-forest">Orders</h1>
          <p className="mt-1 text-slate/60">{counts.pending} new · {counts.confirmed + counts.shipped} on the way · {all.length} total</p>
        </div>
        <Button variant="secondary" icon={Download} onClick={() => exportCsv(rows)} disabled={!rows.length}>Export CSV</Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by order, name, phone, city or soap…" className={`${inputClass} pl-10`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={status === 'all'} onClick={() => setStatus('all')}>All</Chip>
          {Object.entries(ORDER_STATUS).map(([k, s]) => (
            <Chip key={k} active={status === k} onClick={() => setStatus(k)}>{s.label} ({counts[k]})</Chip>
          ))}
        </div>
      </div>

      {rows.length ? (
        <motion.ul layout className="mt-6 divide-y divide-forest/5 overflow-hidden rounded-2xl border border-forest/10 bg-white">
          {rows.map((o) => (
            <motion.li layout key={o.id}>
              <button onClick={() => setOpenId(o.id)} className={`flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-sand/40 ${o.status === 'pending' ? 'bg-amber/5' : ''}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/20 text-amber-dark"><ShoppingCart size={17} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">
                    {o.id} · {o.customer.name}
                  </p>
                  <p className="truncate text-xs text-slate/60">
                    {o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')} · {o.customer.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-forest">{rs(o.total)}</p>
                  <p className="text-[11px] text-slate/40">{timeAgo(o.createdAt)}</p>
                </div>
                <div className="hidden w-28 justify-end sm:flex"><OrderBadge status={o.status} /></div>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <div className="mt-6">
          <EmptyState icon={ShoppingCart} title={all.length ? 'No orders match' : 'No orders yet'}>
            {all.length ? 'Try a different search or status.' : 'Orders placed through the website cart will appear here.'}
          </EmptyState>
        </div>
      )}

      {open && <Detail key={open.id} o={open} products={data.products} onUpdate={update} onDelete={() => remove(open)} onClose={() => setOpenId(null)} />}
    </div>
  )
}
