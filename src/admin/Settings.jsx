import { Save } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'
import { defaultHeroSlides } from '../data'
import { Button, Field, inputClass, Toggle, useToast } from './ui'

const fields = [
  ['phone', 'Phone', '+977 984-1234567'],
  ['email', 'Email', 'tarucare.herbalsoap@gmail.com'],
  ['website', 'Website', 'www.tarucare.com.np'],
  ['facebook', 'Facebook URL', 'https://facebook.com/tarucare'],
  ['instagram', 'Instagram URL', 'https://instagram.com/tarucare'],
]

export default function Settings({ data, setData }) {
  const toast = useToast()
  const [s, setS] = useState(data.settings)
  const [saving, setSaving] = useState(false)
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
        <p className="mt-1 text-sm text-slate/60">
          The password is set by <code className="rounded bg-sand px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code> in the server’s <code className="rounded bg-sand px-1.5 py-0.5 text-xs">.env</code> file. Change it there and restart the server.
        </p>
      </section>
    </form>
  )
}
