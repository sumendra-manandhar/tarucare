import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, Globe, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'
import { useSiteData } from '../SiteData'
import { Ingredient } from './Illustrations'
import { Reveal, SectionHeader } from './ui'

const empty = { name: '', email: '', subject: '', message: '', website: '' }

function validate(v) {
  const e = {}
  if (!v.name.trim()) e.name = 'Please tell us your name'
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email'
  if (!v.subject.trim()) e.subject = 'Add a subject'
  if (v.message.trim().length < 10) e.message = 'Message should be at least 10 characters'
  return e
}

function Field({ label, name, value, error, onChange, textarea, type = 'text' }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-moss">{label}</span>
      <Tag
        name={name}
        type={textarea ? undefined : type}
        rows={textarea ? 5 : undefined}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        className={`w-full resize-none rounded-2xl border bg-cream px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-moss focus:ring-4 focus:ring-moss/10 focus-visible:ring-4 focus-visible:ring-moss/20 ${error ? 'border-red-400' : 'border-ink/15'}`}
      />
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs text-red-600">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}

const socials = [
  { key: 'facebook', label: 'Facebook', path: 'M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z' },
  { key: 'instagram', label: 'Instagram', path: 'M12 7.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5zm0 7.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6zM17 5.8a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3zm2.8 13.5a2.8 2.8 0 0 1-2.8 2.8h-9a2.8 2.8 0 0 1-2.8-2.8v-9a2.8 2.8 0 0 1 2.8-2.8h9a2.8 2.8 0 0 1 2.8 2.8z' },
]

export default function Contact() {
  const { settings: contact } = useSiteData()
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined, form: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('sending')
    try {
      await api.post('/inquiries', { ...values, type: 'general' })
      setStatus('sent')
      setValues(empty)
    } catch (err) {
      setErrors({ form: err.message })
      setStatus('idle')
    }
  }

  const info = [
    { icon: Phone, label: 'Call us', value: contact.phone, href: contact.phoneHref },
    { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    { icon: Globe, label: 'Website', value: contact.website, href: `https://${contact.website}` },
    { icon: MapPin, label: 'Origin', value: 'Made in Nepal 🇳🇵' },
  ]

  return (
    <section id="contact" className="scroll-mt-28 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader eyebrow="Connect With Us" title={<>Let’s talk <em className="text-amber-dark">natural care.</em></>}>
          Orders, wholesale, export or a question about which bar suits your skin — we’d love to hear from you.
        </SectionHeader>

        <Reveal className="mt-12 grid overflow-hidden rounded-[2rem] border border-ink/10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grain relative overflow-hidden bg-moss p-7 text-cream sm:p-10">
            <div className="absolute -bottom-6 -right-6 w-44 rotate-12 opacity-80" aria-hidden="true">
              <Ingredient name="titepati" className="w-full" />
            </div>
            <h3 className="relative font-serif text-2xl">Get in touch</h3>
            <p className="relative mt-1 text-sm text-cream/65">We usually reply within a day.</p>
            <ul className="relative mt-8 space-y-2">
              {info.map(({ icon: Icon, label, value, href }) => {
                const Tag = href ? 'a' : 'div'
                const external = href?.startsWith('https')
                return (
                  <li key={label}>
                    <Tag
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noreferrer' : undefined}
                      className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-cream/5"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream/10 text-amber">
                        <Icon size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-cream/50">{label}</span>
                        <span className="block truncate font-medium">{value}</span>
                      </span>
                      {href && <ArrowUpRight size={16} className="text-cream/40 transition group-hover:text-amber" />}
                    </Tag>
                  </li>
                )
              })}
            </ul>
            <div className="relative mt-8 flex items-center gap-3 border-t border-cream/10 pt-6">
              {socials.map((s) => (
                <a key={s.key} href={contact[s.key]} target="_blank" rel="noreferrer" aria-label={s.label} className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 transition hover:bg-cream hover:text-moss">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
                </a>
              ))}
              <span className="font-medium text-cream/80">@tarucare</span>
            </div>
          </div>

          <div className="paper relative bg-sand p-7 sm:p-10">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle2 size={60} className="text-moss" />
                  </motion.div>
                  <h3 className="mt-5 font-serif text-3xl text-moss">Thank you!</h3>
                  <p className="mt-2 max-w-sm text-ink/70">Your message has reached our team. We usually reply within a day.</p>
                  <button onClick={() => setStatus('idle')} className="mt-6 text-sm font-semibold text-moss underline underline-offset-4">Send another message</button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative grid gap-5 sm:grid-cols-2">
                  <Field label="Name" name="name" value={values.name} error={errors.name} onChange={onChange} />
                  <Field label="Email" name="email" type="email" value={values.email} error={errors.email} onChange={onChange} />
                  <div className="sm:col-span-2">
                    <Field label="Subject" name="subject" value={values.subject} error={errors.subject} onChange={onChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Message" name="message" textarea value={values.message} error={errors.message} onChange={onChange} />
                  </div>
                  <input name="website" value={values.website} onChange={onChange} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                  {errors.form && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{errors.form}</p>}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-moss px-8 py-4 font-semibold text-cream transition hover:bg-forest-light disabled:opacity-70 sm:col-span-2 sm:justify-self-start"
                  >
                    {status === 'sending' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="transition-transform group-hover:-rotate-12 group-hover:translate-x-1" />}
                    {status === 'sending' ? 'Sending…' : 'Send Message'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
