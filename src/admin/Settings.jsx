import { Plus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, isDemo } from '../lib/api'
import { defaultHeroSlides } from '../data'
import { Button, Field, inputClass, Toggle, useToast } from './ui'

const fields = [
  ['phone', 'Phone', '+977 984-1234567'],
  ['email', 'Email', 'tarucare.herbalsoap@gmail.com'],
  ['website', 'Website', 'www.tarucare.com.np'],
  ['facebook', 'Facebook URL', 'https://facebook.com/tarucare'],
  ['instagram', 'Instagram URL', 'https://instagram.com/tarucare'],
]

function PaymentMethods({ value, onChange }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const m = draft.trim()
    if (m && !value.includes(m)) onChange([...value, m])
    setDraft('')
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map((m) => (
        <span key={m} className="inline-flex items-center gap-1 rounded-full border border-forest/15 bg-white py-1 pl-3 pr-1 text-sm text-forest">
          {m}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== m))} aria-label={`Remove ${m}`} className="rounded-full p-1 text-slate/40 hover:bg-red-50 hover:text-red-600">
            <X size={13} />
          </button>
        </span>
      ))}
      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-forest/30 bg-white py-1 pl-3 pr-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Add method"
          aria-label="New payment method"
          className="w-28 bg-transparent text-sm outline-none"
        />
        <button type="button" onClick={add} aria-label="Add payment method" className="rounded-full bg-forest p-1 text-cream"><Plus size={13} /></button>
      </span>
    </div>
  )
}

export default function Settings({ data, setData }) {
  const toast = useToast()
  const [s, setS] = useState(data.settings)
  const [saving, setSaving] = useState(false)
  const [googleReady, setGoogleReady] = useState(null)
  useEffect(() => {
    api.get('/config').then((c) => setGoogleReady(!!c.googleClientId || !!c.demo)).catch(() => setGoogleReady(false))
  }, [])
  const dirty = JSON.stringify(s) !== JSON.stringify(data.settings)
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = await api.put('/settings', s)
      setData((d) => ({ ...d, settings: saved }))
      setS(saved)
      toast('Settings saved')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-forest">Settings</h1>
          <p className="mt-1 text-slate/60">Contact details and content shown on the website.</p>
        </div>
        <Button type="submit" icon={Save} loading={saving} disabled={!dirty}>Save changes</Button>
      </div>

      <section className="mt-8 rounded-2xl border border-forest/10 bg-white p-6">
        <h2 className="font-serif text-xl text-forest">Contact information</h2>
        <p className="text-sm text-slate/60">Shown in the Contact section and footer.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map(([k, label, ph]) => (
            <Field key={k} label={label}>
              <input className={inputClass} value={s[k] ?? ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} />
            </Field>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-forest">Shop &amp; checkout</h2>
            <p className="text-sm text-slate/60">How the cart, delivery charges and payment options work on the website.</p>
          </div>
          <Toggle checked={!!s.cartEnabled} onChange={(v) => set('cartEnabled', v)} label={s.cartEnabled ? 'Online ordering on' : 'Online ordering paused'} />
        </div>
        {!s.cartEnabled && (
          <p className="mt-4 rounded-xl bg-amber/15 px-4 py-3 text-sm text-amber-dark">
            The cart is hidden while ordering is paused. Visitors can still send an order request from each soap.
          </p>
        )}
        <div className="mt-5 rounded-xl bg-sand/50 p-4">
          <Toggle checked={!!s.requireLogin} onChange={(v) => set('requireLogin', v)} label="Require Google sign-in to order" />
          <p className="mt-1.5 text-xs text-slate/60">
            {googleReady === false
              ? 'Google sign-in isn’t set up on the server yet (GOOGLE_CLIENT_ID), so shoppers can order without signing in for now.'
              : 'Shoppers sign in with Google at checkout. Their orders appear in their account and under Customers.'}
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Delivery fee (Rs.)">
            <input type="number" min="0" className={inputClass} value={s.deliveryFee ?? 0} onChange={(e) => set('deliveryFee', e.target.value)} />
          </Field>
          <Field label="Free delivery over (Rs.)" hint="0 turns free delivery off">
            <input type="number" min="0" className={inputClass} value={s.freeDeliveryOver ?? 0} onChange={(e) => set('freeDeliveryOver', e.target.value)} />
          </Field>
          <Field label="Max bars per soap" hint="Per order">
            <input type="number" min="1" max="99" className={inputClass} value={s.maxQtyPerItem ?? 10} onChange={(e) => set('maxQtyPerItem', e.target.value)} />
          </Field>
          <Field label="Delivery promise" hint="Shown in the cart and on each soap" className="sm:col-span-3">
            <input className={inputClass} value={s.deliveryNote ?? ''} onChange={(e) => set('deliveryNote', e.target.value)} />
          </Field>
          <div className="sm:col-span-3">
            <p className="mb-1.5 text-sm font-medium text-forest">Payment methods at checkout</p>
            <PaymentMethods value={s.paymentMethods ?? []} onChange={(v) => set('paymentMethods', v)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-6">
        <h2 className="font-serif text-xl text-forest">Hero slides</h2>
        <p className="text-sm text-slate/60">Pick the soap shown on each themed slide of the homepage carousel. Hidden soaps are skipped.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {Object.keys(defaultHeroSlides).map((need) => (
            <Field key={need} label={need}>
              <select
                className={inputClass}
                value={s.heroSlides?.[need] ?? ''}
                onChange={(e) => set('heroSlides', { ...defaultHeroSlides, ...s.heroSlides, [need]: e.target.value })}
              >
                {data.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}{p.published ? '' : ' (hidden)'}</option>
                ))}
              </select>
            </Field>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-6">
        <h2 className="font-serif text-xl text-forest">“Future Variants” card</h2>
        <p className="text-sm text-slate/60">The coming-soon teaser at the end of the product collection.</p>
        <div className="mt-5 space-y-4">
          <Toggle checked={!!s.showTeaser} onChange={(v) => set('showTeaser', v)} label={s.showTeaser ? 'Shown on website' : 'Hidden'} />
          <Field label="Teaser text">
            <textarea rows={2} className={`${inputClass} resize-none`} value={s.teaserText ?? ''} onChange={(e) => set('teaserText', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-6">
        <h2 className="font-serif text-xl text-forest">Admin password</h2>
        {isDemo() ? (
          <p className="mt-1 text-sm text-slate/60">
            This is a browser-only demo: changes are saved in this browser and nobody else sees them. On the live site, the password is set in the server’s <code className="rounded bg-sand px-1.5 py-0.5 text-xs">.env</code> file.
          </p>
        ) : (
        <p className="mt-1 text-sm text-slate/60">
          The password is set by <code className="rounded bg-sand px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code> in the server’s <code className="rounded bg-sand px-1.5 py-0.5 text-xs">.env</code> file. Change it there and restart the server.
        </p>
        )}
      </section>
    </form>
  )
}
