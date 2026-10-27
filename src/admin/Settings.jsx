import { useState } from 'react'
import { LogOut, Plus, RotateCcw, Save, ShoppingBag, X } from 'lucide-react'
import { useStore } from '../store'
import { Card, Confirm, Toggle, rs } from './ui'

const input = 'w-full rounded-xl border border-forest/15 bg-cream/50 px-3 py-2.5 text-sm outline-none transition focus:border-forest-400 focus:bg-white focus:ring-4 focus:ring-forest/10'
const lbl = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400'

function ShopSettings({ toast }) {
  const { settings, setSettings } = useStore()
  const [f, setF] = useState(settings)
  const [method, setMethod] = useState('')
  const num = (k) => (e) => setF({ ...f, [k]: Math.max(0, Number(e.target.value) || 0) })
  const addMethod = () => {
    const m = method.trim()
    if (m && !f.paymentMethods.includes(m)) setF({ ...f, paymentMethods: [...f.paymentMethods, m] })
    setMethod('')
  }
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-xl text-forest"><ShoppingBag className="h-5 w-5 text-amber-500" /> Shop &amp; cart</h3>
          <p className="text-xs text-slate-400">Controls the cart, delivery charges and checkout on the website.</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-forest">
          <Toggle on={f.cartEnabled} onChange={(v) => setF({ ...f, cartEnabled: v })} label="Online ordering" />
          {f.cartEnabled ? 'Cart on' : 'Cart off'}
        </label>
      </div>
      {!f.cartEnabled && (
        <p className="mt-4 rounded-xl bg-amber/15 px-3 py-2 text-xs text-amber-600">
          With the cart off, the site hides "Add to cart" and customers order by sending a message instead.
        </p>
      )}
      <form
        className="mt-6 grid gap-4 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!f.paymentMethods.length) return toast('Add at least one payment method')
          setSettings((s) => ({ ...s, cartEnabled: f.cartEnabled, deliveryFee: f.deliveryFee, freeDeliveryOver: f.freeDeliveryOver, maxQtyPerItem: f.maxQtyPerItem, paymentMethods: f.paymentMethods }))
          toast('Shop settings saved')
        }}
      >
        <label>
          <span className={lbl}>Delivery fee (Rs.)</span>
          <input id="delivery-fee" type="number" min="0" className={input} value={f.deliveryFee} onChange={num('deliveryFee')} />
        </label>
        <label>
          <span className={lbl}>Free delivery over (Rs.)</span>
          <input id="free-delivery" type="number" min="0" className={input} value={f.freeDeliveryOver} onChange={num('freeDeliveryOver')} />
        </label>
        <label>
          <span className={lbl}>Max qty per soap</span>
          <input id="max-qty" type="number" min="1" className={input} value={f.maxQtyPerItem} onChange={num('maxQtyPerItem')} />
        </label>
        <p className="text-xs text-slate-400 sm:col-span-3">
          {f.freeDeliveryOver ? `Orders under ${rs(f.freeDeliveryOver)} pay ${rs(f.deliveryFee)} delivery.` : `Every order pays ${rs(f.deliveryFee)} delivery.`} Set "Free delivery over" to 0 to turn free delivery off.
        </p>
        <div className="sm:col-span-3">
          <span className={lbl}>Payment methods at checkout</span>
          <div className="flex flex-wrap gap-2">
            {f.paymentMethods.map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white py-1.5 pl-3 pr-1.5 text-sm text-forest">
                {m}
                <button type="button" onClick={() => setF({ ...f, paymentMethods: f.paymentMethods.filter((x) => x !== m) })} className="grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Remove ${m}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-forest/25 bg-white py-1 pl-3 pr-1">
              <input
                id="new-payment"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addMethod()
                  }
                }}
                placeholder="Add method"
                className="w-28 bg-transparent text-sm outline-none"
              />
              <button type="button" onClick={addMethod} className="grid h-6 w-6 place-items-center rounded-full bg-forest text-cream" aria-label="Add payment method">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        </div>
        <div className="sm:col-span-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500">
            <Save className="h-4 w-4" /> Save shop settings
          </button>
        </div>
      </form>
    </Card>
  )
}

export function SettingsPage({ toast, logout }) {
  const { settings, setSettings, resetAll } = useStore()
  const [f, setF] = useState(settings)
  const [confirmReset, setConfirmReset] = useState(false)
  const fields = [
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['website', 'Website'],
    ['facebook', 'Facebook handle'],
    ['instagram', 'Instagram handle'],
  ]
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
      <ShopSettings toast={toast} />
      <Card>
        <h3 className="font-serif text-xl text-forest">Store details</h3>
        <p className="text-xs text-slate-400">Shown in the website's contact section and footer.</p>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            setSettings((s) => ({ ...s, ...Object.fromEntries(fields.map(([k]) => [k, f[k]])), announcement: f.announcement }))
            toast('Settings saved')
          }}
        >
          {fields.map(([k, l]) => (
            <label key={k}>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l}</span>
              <input className={input} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Announcement bar (leave empty to hide)</span>
            <input className={input} value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} />
          </label>
          <div className="sm:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500">
              <Save className="h-4 w-4" /> Save settings
            </button>
          </div>
        </form>
      </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <h3 className="font-serif text-xl text-forest">Demo data</h3>
          <p className="mt-1 text-sm text-slate-400">Data is stored in this browser. Reset to restore the original 7 soaps, sample orders and inquiries, and contact details. Uploaded photos are deleted.</p>
          <button onClick={() => setConfirmReset(true)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
            <RotateCcw className="h-4 w-4" /> Reset all data
          </button>
        </Card>
        <Card>
          <h3 className="font-serif text-xl text-forest">Session</h3>
          <p className="mt-1 text-sm text-slate-400">Signed in as <span className="font-semibold text-forest">admin</span></p>
          <button onClick={logout} className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </Card>
      </div>
      <Confirm
        open={confirmReset}
        title="Reset all data?"
        text="Products, inquiries and settings will return to their defaults."
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
          window.location.reload()
        }}
      />
    </div>
  )
}
