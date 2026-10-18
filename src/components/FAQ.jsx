import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Phone, Plus } from 'lucide-react'
import { useState } from 'react'
import { filters } from '../data'
import { useSiteData } from '../SiteData'
import { openShop } from './Finder'
import { Reveal, SectionHeader } from './ui'

const short = (name) => name.replace(/\s+soap$/i, '')

function Item({ q, a, open, onToggle, id }) {
  return (
    <li className="border-b border-ink/10">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-${id}`}
          className="flex w-full items-center justify-between gap-6 py-5 text-left font-serif text-lg text-moss transition-colors hover:text-forest-light sm:text-xl"
        >
          {q}
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.25 }}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${open ? 'border-moss bg-moss text-cream' : 'border-ink/15 text-moss'}`}
          >
            <Plus size={16} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-12 leading-relaxed text-ink/70">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function FAQ() {
  const { products, settings } = useSiteData()
  const [open, setOpen] = useState(0)

  // Built from live product data, so it stays right when products change in the admin.
  const byNeed = filters
    .filter((f) => f !== 'All')
    .map((need) => [need, products.filter((p) => p.categories.includes(need)).map((p) => short(p.name))])
    .filter(([, names]) => names.length)

  const faqs = [
    {
      q: 'Which soap is right for my skin?',
      a: (
        <>
          <ul className="space-y-1.5">
            {byNeed.map(([need, names]) => (
              <li key={need}>
                <span className="font-semibold text-moss">{need}:</span> {names.join(', ')}
              </li>
            ))}
          </ul>
          <button onClick={() => openShop('All')} className="mt-3 font-semibold text-moss underline underline-offset-4">
            Compare them in Shop by skin need →
          </button>
        </>
      ),
    },
    {
      q: 'Are TARU CARE soaps safe for sensitive skin?',
      a: 'Every bar is formulated to be gentle and safe for all skin types, and is free from parabens, sulphates and silicones. If your skin is very sensitive, start with Goat Milk & Tulsi or Honey, and patch-test first if you have known allergies.',
    },
    {
      q: 'What goes into each bar?',
      a: 'Time-honoured Ayurvedic herbs — turmeric, beetroot, sandalwood, titepati, tulsi and honey, plus goat milk and active charcoal — blended with natural oils using traditional techniques. Nothing synthetic to hide.',
    },
    {
      q: 'Are your soaps cruelty-free?',
      a: 'Yes. TARU CARE soaps are cruelty-free, and our packaging is recyclable.',
    },
    {
      q: 'Where are they made?',
      a: 'Every bar is handcrafted in small batches in Nepal, inspired by the country’s natural heritage and made to export-quality standards.',
    },
    {
      q: 'How do I order?',
      a: (
        <>
          Tap <span className="font-semibold text-moss">Order</span> on any soap and send the short form — we’ll contact you to confirm and arrange delivery.
          {settings.phone && (
            <> You can also call us on <a href={settings.phoneHref} className="font-semibold text-moss underline underline-offset-4">{settings.phone}</a>.</>
          )}
        </>
      ),
    },
    {
      q: 'Do you offer wholesale or export?',
      a: 'Yes — our bars are made to export-quality standards. Send us a message through the contact form with your requirements and we’ll get back to you.',
    },
    {
      q: 'How can I make my bar last longer?',
      a: 'Keep it dry between uses: store it on a draining soap dish, away from running water. A dry bar stays firm and lasts noticeably longer.',
    },
  ]

  return (
    <section id="faq" className="scroll-mt-28 bg-sand/60 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader eyebrow="FAQ" title={<>Good <em className="text-amber-dark">questions.</em></>}>
            Everything you might want to know before choosing your bar.
          </SectionHeader>
          <Reveal i={3} className="mt-8 rounded-[1.75rem] bg-moss p-6 text-cream">
            <p className="font-serif text-xl">Still unsure which bar to pick?</p>
            <p className="mt-1 text-sm text-cream/70">Tell us about your skin — we’ll recommend one.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm font-semibold text-moss transition-colors hover:bg-amber">
                <MessageCircle size={15} /> Ask us
              </a>
              {settings.phone && (
                <a href={settings.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-cream/10">
                  <Phone size={15} /> Call
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal i={1}>
          <ul className="border-t border-ink/10">
            {faqs.map((f, i) => (
              <Item key={f.q} id={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
