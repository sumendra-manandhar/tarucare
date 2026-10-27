import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, CheckCircle2, Facebook, Globe, Instagram, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { Ingredient, Logo } from '../components/Art'
import { Reveal, SectionHeading } from '../components/ui'
import { useStore } from '../store'

const EMPTY = { name: '', email: '', subject: '', message: '' }

function Field({ label, error, textarea, ...props }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest">{label}</span>
      <Tag
        {...props}
        className={`w-full rounded-xl border bg-cream/60 px-4 py-3 text-sm text-slate outline-none transition placeholder:text-slate-400/60 focus:bg-white focus:ring-4 ${
          error ? 'border-red-400 focus:ring-red-100' : 'border-forest/15 focus:border-forest-400 focus:ring-forest/10'
        } ${textarea ? 'min-h-[140px] resize-y' : ''}`}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  )
}

export function Contact() {
  const { settings, addInquiry } = useStore()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle')

  useEffect(() => {
    const onInquire = (e) => setForm((f) => ({ ...f, subject: e.detail }))
    window.addEventListener('taru:inquire', onInquire)
    return () => window.removeEventListener('taru:inquire', onInquire)
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.subject.trim()) errs.subject = 'Add a subject'
    if (form.message.trim().length < 10) errs.message = 'Message should be at least 10 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setState('sending')
    setTimeout(() => {
      addInquiry(form)
      setForm(EMPTY)
      setState('sent')
      setTimeout(() => setState('idle'), 4000)
    }, 900)
  }

  const contacts = [
    { icon: Phone, label: 'Call us', value: settings.phone, href: `tel:${settings.phone.replace(/[^+\d]/g, '')}` },
    { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
    { icon: Globe, label: 'Website', value: settings.website, href: `https://${settings.website}` },
    { icon: MapPin, label: 'Origin', value: 'Made in Nepal 🇳🇵' },
  ]

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Get in touch" title="Let's talk" accent="naturally" subtitle="Orders, wholesale, gifting or a question about your skin. We read every message." />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl bg-forest p-8 text-cream sm:p-10">
              <motion.div className="absolute -bottom-10 -right-10 h-48 w-48 text-forest-500" animate={{ rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }}>
                <Ingredient name="leaf" className="h-full w-full" />
              </motion.div>
              <h3 className="font-serif text-3xl">Contact information</h3>
              <p className="mt-2 text-cream/60">We usually reply within 24 hours.</p>
              <ul className="mt-8 space-y-4">
                {contacts.map(({ icon: Icon, label, value, href }) => {
                  const inner = (
                    <>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream/10 text-amber transition group-hover:bg-amber group-hover:text-forest">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-xs uppercase tracking-wider text-cream/50">{label}</span>
                        <span className="block break-all font-medium">{value}</span>
                      </span>
                    </>
                  )
                  return (
                    <li key={label}>
                      {href ? (
                        <a href={href} target={label === 'Website' ? '_blank' : undefined} rel="noreferrer" className="group flex items-center gap-4">{inner}</a>
                      ) : (
                        <div className="group flex items-center gap-4">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="relative mt-10 flex gap-3">
                <a href={`https://facebook.com/${settings.facebook}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-sm transition hover:bg-cream hover:text-forest">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-sm transition hover:bg-cream hover:text-forest">
                  <Instagram className="h-4 w-4" /> @{settings.instagram}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={submit} noValidate className="relative h-full rounded-3xl border border-forest/10 bg-white p-7 shadow-xl shadow-forest/5 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" placeholder="Your full name" value={form.name} onChange={set('name')} error={errors.name} />
                <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              </div>
              <div className="mt-5">
                <Field label="Subject" placeholder="Order, wholesale, question…" value={form.subject} onChange={set('subject')} error={errors.subject} />
              </div>
              <div className="mt-5">
                <Field textarea label="Message" placeholder="Tell us how we can help" value={form.message} onChange={set('message')} error={errors.message} />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={state === 'sending'}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-500 disabled:opacity-70 sm:w-auto"
              >
                {state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {state === 'sending' ? 'Sending…' : 'Send message'}
              </motion.button>
              <AnimatePresence>
                {state === 'sent' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/95 p-8 text-center backdrop-blur">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                      <CheckCircle2 className="h-16 w-16 text-forest-400" />
                    </motion.div>
                    <h4 className="mt-4 font-serif text-2xl text-forest">Thank you! 🌿</h4>
                    <p className="mt-2 text-slate-400">Your message is on its way. We'll be in touch soon.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { settings } = useStore()
  return (
    <footer className="relative overflow-hidden bg-forest-900 pt-20 text-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 border-b border-cream/10 pb-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">Inspired by Nepal's Nature, Rooted in Ayurveda. Pure, natural soaps handcrafted for every skin.</p>
          </div>
          {[
            ['Explore', [['Our Story', '#about'], ['Collection', '#collection'], ['Ingredients', '#ingredients'], ['Benefits', '#benefits']]],
            ['Collection', [['Turmeric', '#collection'], ['Sandalwood', '#collection'], ['Titepati', '#collection'], ['Active Charcoal', '#collection']]],
            ['Connect', [[settings.phone, `tel:${settings.phone.replace(/[^+\d]/g, '')}`], ['Email us', `mailto:${settings.email}`], ['Facebook', `https://facebook.com/${settings.facebook}`], ['Instagram', `https://instagram.com/${settings.instagram}`]]],
          ].map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map(([l, h]) => (
                  <li key={l}>
                    <a href={h} className="text-sm text-cream/70 transition hover:text-amber">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="select-none py-6 text-center font-serif text-[18vw] font-bold leading-none tracking-tight text-cream/[0.04] md:text-[11rem]">TARU CARE</div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-cream/10 py-6 text-xs text-cream/50 sm:flex-row">
          <span>© {new Date().getFullYear()} TARU CARE Herbal Soap · Made with 🌿 in Nepal 🇳🇵</span>
          <div className="flex items-center gap-4">
            <a href="#admin" className="hover:text-amber">Admin</a>
            <a href="#top" className="inline-flex items-center gap-1 hover:text-amber">Back to top <ArrowUp className="h-3 w-3" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
