import { Loader2, Mail, MapPin, Phone, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Drawer, EmptyState, inputClass, OrderBadge, rs, timeAgo, useToast } from './ui'

function Avatar({ c, size = 'h-10 w-10' }) {
  return c.picture ? (
    <img src={c.picture} alt="" referrerPolicy="no-referrer" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-forest/10 font-semibold text-forest`}>{c.name[0]}</span>
  )
}

function Detail({ id, onClose, go, can }) {
  const toast = useToast()
  const [c, setC] = useState(null)
  useEffect(() => {
    api.get(`/customers/${id}`).then(setC).catch((err) => toast(err.message, 'error'))
  }, [id, toast])

  return (
    <Drawer open onClose={onClose} title={c?.name ?? 'Customer'}>
      {!c ? (
        <div className="grid h-40 place-items-center text-forest/50"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5">
            <Avatar c={c} size="h-14 w-14" />
            <div className="min-w-0 text-sm">
              <p className="font-serif text-xl text-forest">{c.name}</p>
              <p className="mt-1 flex items-center gap-2 text-slate/70"><Mail size={14} /> {c.email}</p>
              {c.phone && <p className="mt-1 flex items-center gap-2 text-slate/70"><Phone size={14} /> {c.phone}</p>}
              {(c.address || c.city) && <p className="mt-1 flex items-start gap-2 text-slate/70"><MapPin size={14} className="mt-0.5 shrink-0" /> {[c.address, c.city].filter(Boolean).join(', ')}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Orders', c.orderCount],
              ['Spent', rs(c.spent)],
              ['Joined', new Date(c.createdAt).toLocaleDateString()],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-white p-4">
                <p className="text-xs text-slate/50">{l}</p>
                <p className="mt-1 font-serif text-lg text-forest">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-forest">Order history</p>
            {c.orders.length ? (
              <ul className="divide-y divide-forest/5 rounded-2xl bg-white">
                {c.orders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-forest">{o.id} · {rs(o.total)}</p>
                      <p className="truncate text-xs text-slate/60">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <OrderBadge status={o.status} />
                      <p className="mt-1 text-[11px] text-slate/40">{timeAgo(o.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-white p-5 text-sm text-slate/60">No orders yet.</p>
            )}
            {can('orders') && c.orders.length > 0 && (
              <button onClick={() => go('orders')} className="mt-3 text-sm font-semibold text-forest hover:underline">Manage these in Orders →</button>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}

export default function Customers({ go, can }) {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    api.get('/customers').then(setList).catch((err) => {
      setList([])
      toast(err.message, 'error')
    })
  }, [toast])

  const q = query.toLowerCase()
  const rows = (list ?? []).filter((c) => `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(q))

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest">Customers</h1>
      <p className="mt-1 text-slate/60">{list ? `${list.length} shopper${list.length === 1 ? '' : 's'} signed in with Google` : 'Loading…'}</p>

      <div className="relative mt-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, phone or city…" className={`${inputClass} pl-10`} />
      </div>

      {list === null ? (
        <div className="grid h-40 place-items-center text-forest/50"><Loader2 className="animate-spin" /></div>
      ) : rows.length ? (
        <ul className="mt-6 divide-y divide-forest/5 overflow-hidden rounded-2xl border border-forest/10 bg-white">
          {rows.map((c) => (
            <li key={c.id}>
              <button onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-sand/40">
                <Avatar c={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">{c.name}</p>
                  <p className="truncate text-xs text-slate/60">{c.email}{c.city ? ` · ${c.city}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-forest">{rs(c.spent)}</p>
                  <p className="text-[11px] text-slate/50">{c.orderCount} order{c.orderCount === 1 ? '' : 's'}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Users} title={list.length ? 'No customers match' : 'No customers yet'}>
            {list.length ? 'Try a different search.' : 'Shoppers appear here after they sign in with Google to order.'}
          </EmptyState>
        </div>
      )}

      {openId && <Detail id={openId} onClose={() => setOpenId(null)} go={go} can={can} />}
    </div>
  )
}
