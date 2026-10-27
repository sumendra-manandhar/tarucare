import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight, Inbox, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { SoapBar } from '../components/Art'
import { cn } from '../components/ui'
import { useStore } from '../store'
import { Card, StatusBadge, Stat, ago, rs } from './ui'

export function Dashboard({ go }) {
  const { products, inquiries, orders } = useStore()
  const live = orders.filter((o) => o.status !== 'cancelled')
  const weekAgo = Date.now() - 7 * 86400000
  const revenue7 = live.filter((o) => o.date >= weekAgo).reduce((s, o) => s + o.total, 0)
  const toProcess = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed')
  const sold = {}
  live.forEach((o) => o.items.forEach((i) => (sold[i.id] = (sold[i.id] || 0) + i.qty)))
  const best = products.filter((p) => sold[p.id]).sort((a, b) => sold[b.id] - sold[a.id]).slice(0, 3)
  const active = products.filter((p) => p.active)
  const stockUnits = products.reduce((s, p) => s + Number(p.stock), 0)
  const stockValue = products.reduce((s, p) => s + p.stock * p.price, 0)
  const newCount = inquiries.filter((i) => i.status === 'new').length
  const low = products.filter((p) => p.stock < 15)
  const maxStock = Math.max(...products.map((p) => p.stock), 1)

  const days = useMemo(() => {
    const out = []
    for (let d = 6; d >= 0; d--) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - d)
      const end = start.getTime() + 86400000
      const dayOrders = live.filter((o) => o.date >= start.getTime() && o.date < end)
      out.push({ label: start.toLocaleDateString('en-GB', { weekday: 'short' }), count: dayOrders.length, total: dayOrders.reduce((s, o) => s + o.total, 0) })
    }
    return out
  }, [live])
  const maxDay = Math.max(...days.map((d) => d.total), 1)


  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Wallet} label="Sales · last 7 days" value={rs(revenue7)} hint={`${live.filter((o) => o.date >= weekAgo).length} orders, cancelled excluded`} />
        <Stat icon={ShoppingCart} label="Orders to process" value={toProcess.length} hint={`${orders.filter((o) => o.status === 'pending').length} pending · ${orders.filter((o) => o.status === 'confirmed').length} confirmed`} tone="sage" delay={0.05} />
        <Stat icon={Inbox} label="New inquiries" value={newCount} hint={`${inquiries.length} total messages`} tone="amber" delay={0.1} />
        <Stat icon={AlertTriangle} label="Low stock" value={low.length} hint="Below 15 units" tone={low.length ? 'red' : 'sage'} delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-forest">Inventory by variant</h3>
              <p className="text-xs text-slate-400">{stockUnits} units on hand · {rs(stockValue)} at retail · {active.length}/{products.length} products live</p>
            </div>
            <button onClick={() => go('products')} className="text-xs font-semibold text-forest-500 hover:underline">Manage</button>
          </div>
          <div className="mt-6 space-y-3">
            {products.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <SoapBar base={p.base} accent={p.accent} label="" className="h-8 w-11 shrink-0" />
                <span className="w-36 shrink-0 truncate text-sm text-slate-500">{p.name.replace(' Soap', '')}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                  <motion.div
                    className={cn('h-full rounded-full', p.stock < 15 ? 'bg-red-400' : 'bg-forest-400')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.stock / maxStock) * 100}%` }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.8 }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold tabular-nums text-forest">{p.stock}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-serif text-xl text-forest">Sales this week</h3>
          <p className="text-xs text-slate-400">Order value per day (Rs.)</p>
          <div className="mt-6 flex h-40 items-end gap-2">
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-semibold tabular-nums text-forest" title={`${d.count} orders`}>{d.total ? `${(d.total / 1000).toFixed(1)}k` : ''}</span>
                <motion.div
                  className="w-full rounded-t-lg bg-amber"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.total / maxDay) * 100}px` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                  style={{ minHeight: 4 }}
                />
                <span className="text-[11px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-forest/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Best sellers</p>
            <div className="mt-3 space-y-2">
              {best.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{p.name}</span>
                  <span className="font-semibold tabular-nums text-forest">{sold[p.id]} sold</span>
                </div>
              ))}
              {!best.length && <p className="text-sm text-slate-400">No sales yet.</p>}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-forest">Recent orders</h3>
            <button onClick={() => go('orders')} className="flex items-center text-xs font-semibold text-forest-500 hover:underline">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="mt-4 divide-y divide-forest/5">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-sm font-semibold text-forest">{o.customer.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">{o.id} · {o.customer.name}</p>
                  <p className="truncate text-xs text-slate-400">{o.items.reduce((n, i) => n + i.qty, 0)} items · {o.customer.city} · {ago(o.date)}</p>
                </div>
                <span className="hidden text-sm font-semibold tabular-nums text-forest sm:block">{rs(o.total)}</span>
                <StatusBadge status={o.status} />
              </li>
            ))}
            {!orders.length && <li className="py-6 text-center text-sm text-slate-400">No orders yet.</li>}
          </ul>
        </Card>
        <Card className="bg-forest text-cream">
          <div className="flex items-center gap-2 text-amber">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Needs attention</span>
          </div>
          {low.length ? (
            <ul className="mt-4 space-y-3">
              {low.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-cream/5 p-3">
                  <SoapBar base={p.base} accent={p.accent} label="" className="h-8 w-11" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-cream/60">{p.stock === 0 ? 'Out of stock' : `Only ${p.stock} units left`}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-cream/70">All variants are well stocked. 🌿</p>
          )}
        </Card>
      </div>
    </div>
  )
}
