import { AlertTriangle, ArrowRight, Eye, EyeOff, Inbox, ShoppingBag, ShoppingCart, Wallet } from 'lucide-react'
import { SoapBox } from '../components/Illustrations'
import { EmptyState, OrderBadge, rs, StatusBadge, timeAgo } from './ui'

function Stat({ icon: Icon, label, value, sub, onClick }) {
  return (
    <button onClick={onClick} className="group rounded-2xl border border-forest/10 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest/5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate/60">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest/5 text-forest transition group-hover:bg-forest group-hover:text-amber">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-serif text-4xl text-forest">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate/50">{sub}</p>}
    </button>
  )
}

export default function Dashboard({ data, go, user, can }) {
  const { products, inquiries, orders } = data
  const fresh = inquiries.filter((q) => q.status === 'new').length
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const monthOrders = orders.filter((o) => o.status !== 'cancelled' && new Date(o.createdAt) >= monthStart)
  const sales = monthOrders.reduce((n, o) => n + o.total, 0)
  const toProcess = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed')
  const low = products.filter((p) => p.published && p.stock != null && p.stock <= 10)
  const recent = inquiries.slice(0, 5)
  const recentOrders = orders.slice(0, 6)

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest">Namaste{user.owner ? '' : `, ${user.name.split(' ')[0]}`} 🙏</h1>
      <p className="mt-1 text-slate/60">Here’s what’s happening with TARU CARE.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {can('orders') && <Stat icon={ShoppingCart} label="Orders to process" value={toProcess.length} sub={`${orders.filter((o) => o.status === 'pending').length} new, waiting for a call`} onClick={() => go('orders')} />}
        {can('orders') && <Stat icon={Wallet} label="Sales this month" value={rs(sales)} sub={`${monthOrders.length} order${monthOrders.length === 1 ? '' : 's'}, cancelled excluded`} onClick={() => go('orders')} />}
        {can('inquiries') && <Stat icon={Inbox} label="New inquiries" value={fresh} sub="Waiting for a reply" onClick={() => go('inquiries')} />}
        {can('products') && <Stat icon={AlertTriangle} label="Low stock" value={low.length} sub={low.length ? low.map((p) => p.name.replace(' Soap', '')).join(', ') : 'Every live soap has 10+ bars'} onClick={() => go('products')} />}
      </div>

      {can('orders') && (
      <section className="mt-8 rounded-2xl border border-forest/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest">Recent orders</h2>
          <button onClick={() => go('orders')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {recentOrders.length ? (
          <ul className="mt-4 divide-y divide-forest/5">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber/20 text-amber-dark"><ShoppingCart size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">{o.id} · {o.customer.name}</p>
                  <p className="truncate text-xs text-slate/60">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</p>
                </div>
                <span className="hidden text-sm font-semibold tabular-nums text-forest sm:block">{rs(o.total)}</span>
                <div className="text-right">
                  <OrderBadge status={o.status} />
                  <p className="mt-1 text-[11px] text-slate/40">{timeAgo(o.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState icon={ShoppingCart} title="No orders yet">Orders placed through the website cart will appear here.</EmptyState>
          </div>
        )}
      </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {can('inquiries') && (
        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-forest">Recent inquiries</h2>
            <button onClick={() => go('inquiries')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recent.length ? (
            <ul className="mt-4 divide-y divide-forest/5">
              {recent.map((q) => (
                <li key={q.id} className="flex items-center gap-3 py-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${q.type === 'order' ? 'bg-amber/20 text-amber-dark' : 'bg-forest/5 text-forest'}`}>
                    {q.type === 'order' ? <ShoppingBag size={16} /> : <Inbox size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest">{q.name}</p>
                    <p className="truncate text-xs text-slate/60">{q.type === 'order' ? `${q.quantity} × ${q.productName}` : q.subject}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <StatusBadge status={q.status} />
                    <p className="mt-1 text-[11px] text-slate/40">{timeAgo(q.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState icon={Inbox} title="No inquiries yet">Messages and order requests from the website will appear here.</EmptyState>
            </div>
          )}
        </section>
        )}

        {can('products') && (
        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-forest">Products</h2>
            <button onClick={() => go('products')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
              Manage <ArrowRight size={14} />
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {products.slice(0, 7).map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="w-14 shrink-0">
                  {p.image ? <img src={p.image} alt="" className="aspect-square w-full rounded-lg object-cover" /> : <SoapBox product={p} className="w-full" />}
                </div>
                <span className="flex-1 truncate text-sm text-forest">{p.name}</span>
                {p.stock != null && <span className={`text-xs font-semibold tabular-nums ${p.stock <= 10 ? 'text-amber-dark' : 'text-slate/50'}`}>{p.stock}</span>}
                {p.published ? <Eye size={15} className="text-emerald-700" aria-label="Live" /> : <EyeOff size={15} className="text-slate/40" aria-label="Hidden" />}
              </li>
            ))}
          </ul>
        </section>
        )}
      </div>
    </div>
  )
}
