import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, HandHeart, Leaf, Mountain, Rabbit } from 'lucide-react'
import { useEffect, useState } from 'react'
import { barFromBase } from '../lib/color'
import { useSiteData } from '../SiteData'
import { openShop } from './Finder'
import { Ingredient, Mountains, ProductVisual, SoapBox } from './Illustrations'
import { ArrowPair, HandUnderline, pad2 } from './ui'

const SLIDE_MS = 6500
const ease = [0.22, 1, 0.36, 1]
const brandBox = { id: 'brand', name: 'Ayurvedic Soap', ingredients: ['turmeric', 'tulsi'], bar: barFromBase('#8db35f') }

// Themed slides — each one is a skin story that opens the shop pre-filtered.
const SLIDES = [
  {
    key: 'brand',
    tint: '#a9c97c',
    label: 'TARU CARE',
    eyebrow: 'Inspired by Nepal · Rooted in Ayurveda',
    title: ['Handcrafted by Nature,', 'Loved by All'],
    text: 'Pure. Natural. Nourishing. For every skin — herbal soaps slow-crafted in small batches from Himalayan botanicals.',
    herbs: ['turmeric', 'tulsi', 'honey'],
    need: 'All',
    cta: 'Find your soap',
  },
  {
    key: 'glow',
    tint: '#f3b25f',
    label: 'Brightening',
    eyebrow: 'For dull, uneven skin',
    title: ['Glow,', 'naturally.'],
    text: 'Turmeric, beetroot and sandalwood bars that even out tone and bring back your natural radiance.',
    herbs: ['turmeric', 'beetroot', 'sandalwood'],
    need: 'Brightening',
    cta: 'Shop brightening',
  },
  {
    key: 'clean',
    tint: '#9fb8a4',
    label: 'Deep cleansing',
    eyebrow: 'For oily, congested skin',
    title: ['A deeper,', 'purer clean.'],
    text: 'Active charcoal and Himalayan titepati draw out impurities, control excess oil and unclog pores.',
    herbs: ['charcoal', 'titepati', 'tulsi'],
    need: 'Deep Cleansing',
    cta: 'Shop deep cleansing',
  },
  {
    key: 'gentle',
    tint: '#eaa8b2',
    label: 'Sensitive skin',
    eyebrow: 'For delicate, easily irritated skin',
    title: ['Gentle on', 'sensitive skin.'],
    text: 'Goat milk, tulsi and raw honey soothe, nourish and keep skin soft — without a hint of harshness.',
    herbs: ['milk', 'tulsi', 'honey'],
    need: 'Sensitive Skin',
    cta: 'Shop sensitive skin',
  },
]

const USPS = [
  { icon: Leaf, title: '100% Natural', text: 'Herbs, oils, nothing synthetic' },
  { icon: HandHeart, title: 'Handmade in small batches', text: 'Cold-crafted by hand' },
  { icon: Mountain, title: 'Made in Nepal', text: 'Himalayan botanicals' },
  { icon: Rabbit, title: 'Cruelty-free', text: 'No parabens or sulphates' },
]

const herbSpots = ['left-[2%] top-[14%] w-[17%]', 'right-[0%] top-[30%] w-[15%]', 'left-[12%] bottom-[8%] w-[14%]']

export default function Hero() {
  const { products, settings } = useSiteData()
  const reduce = useReducedMotion()
  // Each themed slide shows the soap chosen in Admin → Settings; slides whose soap is gone or hidden drop out.
  const slides = SLIDES.map((s) => ({
    ...s,
    product: s.key === 'brand' ? brandBox : products.find((p) => p.id === settings.heroSlides?.[s.need]),
  })).filter((s) => s.product)
  const [index, setIndex] = useState(0)
  // Auto-advances continuously; only pauses while the browser tab is in the background.
  const [hidden, setHidden] = useState(false)
  const slide = slides[index % slides.length]
  const tint = slide.tint

  useEffect(() => {
    if (hidden || slides.length < 2) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearTimeout(id)
  }, [index, hidden, slides.length])

  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const go = (i) => setIndex(((i % slides.length) + slides.length) % slides.length)

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="TARU CARE highlights"
      className="relative overflow-hidden bg-sand pt-28 sm:pt-32"
    >
      {/* colour wash that follows the slide */}
      <motion.div
        className="absolute inset-0"
        animate={{ background: `radial-gradient(ellipse 70% 60% at 75% 45%, ${tint}55, transparent 70%), radial-gradient(ellipse 50% 50% at 0% 100%, ${tint}22, transparent 70%)` }}
        transition={{ duration: 1 }}
        aria-hidden="true"
      />
      <div className="paper absolute inset-0" aria-hidden="true" />
      <Mountains color="#1f3d2b" className="absolute inset-x-0 bottom-[72px] h-40 w-full opacity-40 sm:h-56" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 sm:px-6 lg:min-h-[600px] lg:grid-cols-[1fr_1.05fr] lg:gap-10">
        {/* copy */}
        <div aria-live="polite" className="min-h-[360px] lg:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={slide.key} exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-forest-light"
              >
                <span className="h-px w-6 bg-forest-light" /> {slide.eyebrow}
              </motion.p>
              <h1 className="mt-5 font-serif text-5xl leading-[1.03] tracking-tight text-moss sm:text-6xl lg:text-7xl">
                <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease }}>
                  {slide.title[0]}
                </motion.span>
                <motion.span className="relative inline-block italic text-amber-dark" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease }}>
                  {slide.title[1]}
                  <HandUnderline className="absolute -bottom-3 left-0 h-4 w-full text-amber/70" delay={0.6} />
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
                {slide.text}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-9 flex flex-wrap gap-3">
                <button onClick={() => openShop(slide.need)} className="group inline-flex items-center gap-2 rounded-full bg-moss px-7 py-4 font-semibold text-cream transition-colors hover:bg-forest-light">
                  {slide.cta}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <a href="#story" className="inline-flex items-center rounded-full px-5 py-4 font-semibold text-moss underline-offset-4 hover:underline">
                  Our story
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* visual: morphing blob, floating box, herbs — no frame */}
        <div className="relative mx-auto aspect-square w-full max-w-[540px]">
          <motion.div
            className="absolute inset-[8%] animate-blob"
            animate={{ backgroundColor: `${tint}55` }}
            transition={{ duration: 1 }}
            aria-hidden="true"
          />
          <div className="absolute bottom-[14%] left-1/2 h-[6%] w-[50%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-xl" aria-hidden="true" />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={slide.key}
              className="absolute inset-x-[14%] top-[22%]"
              initial={{ opacity: 0, y: 60, rotate: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: -4, scale: 1 }}
              exit={{ opacity: 0, y: -40, rotate: -12, scale: 0.9 }}
              transition={{ duration: 0.8, ease }}
            >
              <motion.div animate={reduce ? undefined : { y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                {slide.product === brandBox ? (
                  <SoapBox product={brandBox} className="w-full drop-shadow-[0_30px_30px_rgba(46,34,25,.35)]" />
                ) : (
                  <ProductVisual p={slide.product} className="drop-shadow-[0_30px_30px_rgba(46,34,25,.35)]" />
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {slide.herbs.map((h, i) => (
              <motion.div
                key={`${slide.key}-${h}`}
                className={`absolute z-10 ${herbSpots[i]}`}
                initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 160, damping: 13 }}
                aria-hidden="true"
              >
                <motion.div animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, 8, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}>
                  <Ingredient name={h} className="w-full drop-shadow-lg" />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* slide indicators */}
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
        <div className="flex items-end gap-4">
          <ol className="grid flex-1 auto-cols-fr grid-flow-col gap-3 sm:gap-6" role="tablist" aria-label="Choose a highlight">
            {slides.map((s, i) => (
              <li key={s.key}>
                <button role="tab" aria-selected={i === index} onClick={() => go(i)} className="group block w-full text-left">
                  <span className={`block text-xs font-semibold transition-colors ${i === index ? 'text-moss' : 'text-ink/45 group-hover:text-ink/70'}`}>
                    <span className="font-serif italic">{pad2(i + 1)}</span>
                    <span className="ml-2 hidden sm:inline">{s.label}</span>
                  </span>
                  <span className="mt-2 block h-0.5 overflow-hidden rounded-full bg-ink/15">
                    {i === index && (
                      <motion.span
                        key={`${s.key}-${index}`}
                        className="block h-full origin-left bg-moss"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hidden sm:block">
            <ArrowPair onPrev={() => go(index - 1)} onNext={() => go(index + 1)} label="highlight" />
          </div>
        </div>
      </div>

      {/* product-site USP strip */}
      <div className="relative border-t border-ink/10 bg-cream">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {USPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className={`flex items-center gap-3 py-5 sm:gap-4 sm:py-6 ${i % 2 ? 'pl-4 sm:pl-6' : 'pr-4 sm:pr-6'} ${i > 1 ? 'border-t border-ink/10 lg:border-t-0' : ''} ${i ? 'lg:border-l lg:border-ink/10 lg:pl-6' : ''}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-moss/10 text-moss"><Icon size={20} strokeWidth={1.7} /></span>
              <span>
                <span className="block text-sm font-semibold text-moss">{title}</span>
                <span className="block text-xs text-ink/55">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
