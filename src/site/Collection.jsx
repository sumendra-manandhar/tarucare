import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Images, Leaf, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react'
import { Ingredient, SoapBar, productIngredient } from '../components/Art'
import { Reveal, SectionHeading, SpotlightCard, Tilt } from '../components/ui'
import { Photo, ProductGallery } from '../components/Gallery'
import { useAddToCart } from './Cart'
import { CATEGORIES } from '../data'
import { useStore } from '../store'

const TABS = ['All', ...CATEGORIES]

export function inquireAbout(subject) {
  window.dispatchEvent(new CustomEvent('taru:inquire', { detail: subject }))
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
}

function CardMedia({ p }) {
  const [a, b] = p.photos || []
  if (a) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-forest/5">
        <Photo id={a.id} alt={a.caption || p.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        {b && <Photo id={b.id} alt={b.caption || p.name} className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />}
        {p.photos.length > 1 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-forest-900/60 px-2.5 py-1 text-[11px] font-semibold text-cream backdrop-blur">
            <Images className="h-3 w-3" /> {p.photos.length} photos
          </span>
        )}
      </div>
    )
  }
  return (
    <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: `linear-gradient(145deg, ${p.base}22, ${p.base}0a)` }}>
      <div className="absolute -bottom-4 -left-4 h-24 w-24 opacity-30 transition-all duration-500 group-hover:-rotate-12 group-hover:opacity-90">
        <Ingredient name={productIngredient[p.id] || 'leaf'} className="h-full w-full text-forest-400" />
      </div>
      <Tilt className="relative mx-auto w-[85%]">
        <motion.div className="transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105">
          <SoapBar base={p.base} accent={p.accent} className="w-full" />
        </motion.div>
      </Tilt>
    </div>
  )
}

function ProductCard({ p, onOpen }) {
  const { settings } = useStore()
  const add = useAddToCart()
  const low = p.stock > 0 && p.stock < 15
  return (
    <SpotlightCard
      color={`${p.base}33`}
      className="flex h-full cursor-pointer flex-col rounded-3xl border border-forest/10 bg-white p-5 transition-shadow duration-500 hover:shadow-2xl hover:shadow-forest/10"
      onClick={() => onOpen(p)}
    >
      <div className="relative">
        <CardMedia p={p} />
        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
          {p.featured && <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber">Bestseller</span>}
          {low && <span className="rounded-full bg-amber px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-forest-800">Only {p.stock} left</span>}
          {p.stock === 0 && <span className="rounded-full bg-slate px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">Sold out</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-1 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-forest">{p.name}</h3>
            <p className="text-xs text-slate-400">{p.nepali} · {p.weight}</p>
          </div>
          <span className="whitespace-nowrap font-serif text-lg text-amber-600">Rs. {p.price}</span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{p.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.categories.map((c) => (
            <span key={c} className="rounded-full bg-forest/5 px-2.5 py-1 text-[11px] font-medium text-forest-500">{c}</span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-forest/10 pt-4 text-sm font-semibold text-forest">
          <span className="inline-flex items-center gap-2">
            View details
            <span className="grid h-8 w-8 place-items-center rounded-full bg-forest/5 transition-all duration-300 group-hover:rotate-45 group-hover:bg-forest group-hover:text-amber">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </span>
          {settings.cartEnabled && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              disabled={p.stock === 0}
              onClick={(e) => {
                e.stopPropagation()
                add(p.id)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream transition hover:bg-forest-500 disabled:cursor-not-allowed disabled:bg-slate-400/40"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> {p.stock === 0 ? 'Sold out' : 'Add to cart'}
            </motion.button>
          )}
        </div>
      </div>
    </SpotlightCard>
  )
}

function TeaserCard() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-forest p-8 text-center text-cream">
      <div className="absolute inset-0 animate-spin-slow opacity-20 [background:conic-gradient(from_0deg,transparent,#d4a373,transparent_30%)]" />
      <div className="absolute inset-[2px] rounded-[22px] bg-forest" />
      <div className="relative">
        <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber/15 text-amber">
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-amber">Coming soon</p>
        <h3 className="mt-3 font-serif text-3xl">Future Variants</h3>
        <p className="mt-3 text-cream/70">Exciting new herbal blends coming soon!</p>
        <div className="mt-6 flex justify-center gap-2 opacity-60">
          {['?', '?', '?'].map((q, i) => (
            <span key={i} className="grid h-10 w-14 place-items-center rounded-xl border border-dashed border-cream/30 font-serif text-cream/50">{q}</span>
          ))}
        </div>
        <button onClick={() => inquireAbout('Notify me about new variants')} className="mt-8 rounded-full border border-amber/40 px-5 py-2 text-sm font-semibold text-amber transition hover:bg-amber hover:text-forest">
          Notify me
        </button>
      </div>
    </div>
  )
}

function ProductModal({ p, onClose }) {
  const { settings, setCartOpen, maxFor } = useStore()
  const add = useAddToCart()
  const [qty, setQty] = useState(1)
  const maxQty = Math.max(1, maxFor(p.id))
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-forest-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-cream sm:rounded-3xl md:grid-cols-2"
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-forest shadow transition hover:rotate-90" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        {p.photos?.length ? (
          <ProductGallery photos={p.photos} name={p.name} className="h-[340px] bg-forest/5 sm:h-[420px] md:h-auto md:min-h-[520px]" />
        ) : (
          <div className="relative flex items-center justify-center overflow-hidden p-10" style={{ background: `radial-gradient(circle at 50% 40%, ${p.base}55, ${p.base}11 70%)` }}>
            <div className="absolute inset-0 grid grid-cols-3 gap-6 p-6 opacity-25">
              {p.ingredients.slice(0, 3).map((_, i) => (
                <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + i, repeat: Infinity }}>
                  <Ingredient name={productIngredient[p.id] || 'leaf'} className="h-16 w-16 text-forest-400" />
                </motion.div>
              ))}
            </div>
            <motion.div animate={{ y: [0, -12, 0], rotate: [-6, -2, -6] }} transition={{ duration: 5, repeat: Infinity }} className="relative w-full max-w-xs">
              <SoapBar base={p.base} accent={p.accent} className="w-full" />
            </motion.div>
          </div>
        )}
        <div className="p-7 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">{p.tagline}</p>
          <h3 className="mt-2 font-serif text-3xl font-semibold text-forest sm:text-4xl">{p.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{p.nepali} · {p.weight} · Handmade in Nepal</p>
          <p className="mt-5 leading-relaxed text-slate-500">{p.longDescription}</p>

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-forest">Key benefits</h4>
          <ul className="mt-3 space-y-2">
            {p.benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-slate-500">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-forest text-amber"><Check className="h-3 w-3" /></span>
                {b}
              </li>
            ))}
          </ul>

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-forest">What's inside</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.ingredients.map((ing) => (
              <span key={ing} className="inline-flex items-center gap-1.5 rounded-full border border-forest/10 bg-white px-3 py-1.5 text-xs font-medium text-forest">
                <Leaf className="h-3 w-3 text-forest-400" /> {ing}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-forest/10 pt-6">
            <span className="font-serif text-3xl text-forest">Rs. {p.price * qty}</span>
            <div className="flex items-center rounded-full border border-forest/15 bg-white">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-forest" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="grid h-10 w-10 place-items-center text-forest" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
            {settings.cartEnabled ? (
              <div className="flex flex-1 gap-2">
                <button
                  disabled={p.stock === 0}
                  onClick={() => add(p.id, qty)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-forest/20 bg-white px-5 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
                <button
                  disabled={p.stock === 0}
                  onClick={() => {
                    add(p.id, qty)
                    onClose()
                    setCartOpen(true)
                  }}
                  className="flex-1 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {p.stock === 0 ? 'Sold out' : 'Buy now'}
                </button>
              </div>
            ) : (
              <button
                disabled={p.stock === 0}
                onClick={() => {
                  onClose()
                  inquireAbout(`Order: ${qty} × ${p.name}`)
                }}
                className="flex-1 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {p.stock === 0 ? 'Sold out' : 'Order by message'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Collection() {
  const { products } = useStore()
  const [tab, setTab] = useState('All')
  const [open, setOpen] = useState(null)
  const visible = products.filter((p) => p.active && (tab === 'All' || p.categories.includes(tab)))

  return (
    <section id="collection" className="relative scroll-mt-24 bg-gradient-to-b from-cream via-cream-100 to-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="The Collection" title="Seven bars," accent="one for every skin" subtitle="Each bar is crafted around a single hero herb. Pick your concern and find your ritual." />

        <Reveal className="mb-12 flex justify-center">
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-forest/10 bg-white p-1.5 shadow-sm">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${tab === t ? 'text-cream' : 'text-slate-400 hover:text-forest'}`}>
                {tab === t && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-forest" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.35 }}>
                <ProductCard p={p} onOpen={setOpen} />
              </motion.div>
            ))}
            <motion.div key="teaser" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TeaserCard />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <AnimatePresence>{open && <ProductModal p={products.find((x) => x.id === open.id) || open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  )
}
