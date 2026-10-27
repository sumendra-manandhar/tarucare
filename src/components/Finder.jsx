import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell, ClipboardCheck, Droplet, Droplets, Flower2, Leaf, Scale, ShieldCheck, ShoppingBag, Sparkles, Sun, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SAFE_BENEFIT as SAFE, filters, ingredientLabels, skinBenefits } from '../data'
import { useSiteData } from '../SiteData'
import { Ingredient, ProductVisual } from './Illustrations'
import { useCart } from '../Cart'
import { AddToCart, formatPrice } from './Cart'
import ProductModal from './ProductModal'
import { ArrowPair, Counter, Dots, SectionHeader, useCycler } from './ui'

const Icons = { ClipboardCheck, Droplet, Droplets, Flower2, Leaf, Scale, ShieldCheck, Sparkles, Sun, Wand2 }
const NEEDS = { All: 'Show all', Brightening: 'Brightening', 'Deep Cleansing': 'Deep cleansing', 'Sensitive Skin': 'Sensitive skin' }
const shortLabel = (t) => (t === SAFE ? 'Safe for all skin' : t)

// Other sections (e.g. hero slides) can preselect a skin need by dispatching this event.
export const SHOP_FILTER_EVENT = 'taru:shop-filter'
export function openShop(need) {
  window.dispatchEvent(new CustomEvent(SHOP_FILTER_EVENT, { detail: need }))
  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
}

// Benefits a soap delivers: its mapped skin benefits, "safe for all", then its own benefit notes.
// Own notes that repeat a mapped benefit's lead word (e.g. "Detoxifies skin") are skipped.
function benefitsFor(p) {
  const lead = (t) => t.toLowerCase().split(/\W+/)[0]
  const mapped = skinBenefits.filter((b) => p.skinBenefits.includes(b.title)).map((b) => ({ title: b.title, icon: Icons[b.icon] }))
  const own = p.benefits.filter((t) => !mapped.some((m) => lead(m.title) === lead(t))).map((t) => ({ title: t, icon: Leaf }))
  return [...mapped, { title: shortLabel(SAFE), icon: ShieldCheck }, ...own].slice(0, 4)
}

const ringOffset = (i, active, n) => {
  const off = (((i - active) % n) + n) % n
  return off > n / 2 ? off - n : off
}

function Arc({ items, active, onSelect }) {
  const n = items.length
  const p = items[active]

  return (
    <motion.div
      className="relative mx-auto aspect-[4/3] w-full max-w-[620px] touch-pan-y select-none rounded-[2rem] outline-none focus-visible:ring-2 focus-visible:ring-amber-dark"
      tabIndex={0}
      role="listbox"
      aria-label="Soaps"
      aria-activedescendant={`soap-${p.id}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onSelect(active + 1)
        if (e.key === 'ArrowLeft') onSelect(active - 1)
      }}
      drag={n > 1 ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.x < -50) onSelect(active + 1)
        else if (info.offset.x > 50) onSelect(active - 1)
      }}
    >
      {/* oversized product name behind the boxes */}
      <div className="pointer-events-none absolute inset-x-0 top-[12%] overflow-hidden text-center sm:top-[6%]" aria-hidden="true">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="whitespace-nowrap font-serif text-[17vw] font-bold leading-none tracking-tight sm:text-[9rem] lg:text-[8.5rem]"
            style={{ color: `${p.bar.dark}1c` }}
          >
            {p.name.replace(/\s+soap$/i, '').split(' ').slice(-1)[0]}
          </motion.p>
        </AnimatePresence>
      </div>
      {/* floor */}
      <div className="absolute inset-x-[8%] bottom-[12%] h-px bg-gradient-to-r from-transparent via-ink/15 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-[10%] left-1/2 h-[7%] w-[44%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-xl" aria-hidden="true" />

      {items.map((x, i) => {
        const off = ringOffset(i, active, n)
        const dist = Math.abs(off)
        const visible = dist <= 1
        return (
          <motion.button
            key={x.id}
            id={`soap-${x.id}`}
            role="option"
            aria-selected={off === 0}
            aria-label={x.name}
            tabIndex={-1}
            onClick={() => onSelect(i)}
            className="absolute left-1/2 top-[30%] w-[50%] -translate-x-1/2 cursor-pointer"
            animate={{
              x: `${off * 62}%`,
              y: `${dist * 6}%`,
              rotate: off * 6,
              scale: 1 - dist * 0.32,
              opacity: visible ? 1 - dist * 0.45 : 0,
              zIndex: 10 - dist,
            }}
            transition={{ type: 'spring', stiffness: 170, damping: 22 }}
            style={{ pointerEvents: visible ? 'auto' : 'none' }}
          >
            <ProductVisual p={x} className={off === 0 ? 'drop-shadow-[0_28px_28px_rgba(46,34,25,.35)]' : 'drop-shadow-lg'} />
          </motion.button>
        )
      })}

    </motion.div>
  )
}

export default function Finder() {
  const { products, settings } = useSiteData()
  const reduce = useReducedMotion()
  // One active filter at a time: a skin need (category) or a specific benefit.
  const [filter, setFilter] = useState({ type: 'need', value: 'All' })
  const [ordering, setOrdering] = useState(null)
  const { canBuy } = useCart()

  const items = products.filter((p) => {
    if (filter.type === 'need') return filter.value === 'All' || p.categories.includes(filter.value)
    return filter.value === SAFE || p.skinBenefits.includes(filter.value)
  })
  const { index, select, setPaused } = useCycler(items.length, { ms: 5500, enabled: !reduce })
  const p = items[index]
  const delivered = new Set(p ? [...p.skinBenefits, SAFE] : [])

  const choose = (type, value) => {
    setFilter({ type, value })
    select(0)
  }

  useEffect(() => {
    const onFilter = (e) => choose('need', e.detail)
    window.addEventListener(SHOP_FILTER_EVENT, onFilter)
    return () => window.removeEventListener(SHOP_FILTER_EVENT, onFilter)
  })

  const needChips = (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="flex w-max gap-1 rounded-full border border-ink/10 bg-cream p-1" role="radiogroup" aria-label="Skin need">
        {filters.map((f) => {
          const on = filter.type === 'need' && filter.value === f
          return (
            <button
              key={f}
              role="radio"
              aria-checked={on}
              onClick={() => choose('need', f)}
              className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'text-cream' : 'text-ink/60 hover:text-ink'}`}
            >
              {on && <motion.span layoutId="need-pill" className="absolute inset-0 rounded-full bg-moss" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <span className="relative">{NEEDS[f] ?? f}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <section id="shop" className="scroll-mt-28 overflow-x-clip bg-sand/60 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader eyebrow="Shop by skin need" title={<>Everything your skin <em className="text-amber-dark">asks for.</em></>} aside={needChips}>
          From brightening turmeric to purifying charcoal, every bar has a purpose — and every one is kind to your skin. Pick a skin need or a benefit, then swipe through the bars made for it.
        </SectionHeader>

        {/* benefits legend: lit = delivered by the soap on stage; click to show only soaps with it */}
        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-light">Or shop by benefit</p>
          <div className="no-scrollbar -mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {skinBenefits.map((b) => {
                const Icon = Icons[b.icon] ?? Leaf
                const selected = filter.type === 'benefit' && filter.value === b.title
                const lit = delivered.has(b.title)
                return (
                  <li key={b.title}>
                    <button
                      onClick={() => (selected ? choose('need', 'All') : choose('benefit', b.title))}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-[background-color,border-color,color] duration-300 ${
                        selected
                          ? 'border-moss bg-moss text-cream'
                          : lit
                            ? 'border-moss/40 bg-cream text-moss'
                            : 'border-ink/10 bg-cream/50 text-ink/45 hover:text-ink/70'
                      }`}
                    >
                      <Icon size={15} className={lit || selected ? '' : 'opacity-60'} />
                      {shortLabel(b.title)}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {p ? (
          <motion.div
            className="relative mt-10 grid items-center overflow-hidden rounded-[2.5rem] ring-1 ring-ink/[0.06] lg:grid-cols-[1.15fr_0.85fr]"
            animate={{ background: `linear-gradient(135deg, ${p.bar.light}55 0%, ${p.bar.base}26 55%, #fdfbf7 100%)` }}
            transition={{ duration: 0.7 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="paper absolute inset-0" aria-hidden="true" />
            <div className="relative px-2 pt-6 sm:px-6 lg:py-8">
              <Arc items={items} active={index} onSelect={select} />
            </div>

            <div className="relative m-3 rounded-[2rem] bg-cream/85 p-7 backdrop-blur-sm sm:m-4 sm:p-9">
              <div aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                    <Counter index={index} total={items.length} />
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-dark">{p.tagline || p.local}</p>
                    <div className="mt-1 flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-4xl leading-tight text-moss">{p.name}</h3>
                      {p.price != null && <span className="shrink-0 font-serif text-2xl text-ink">{formatPrice(p.price)}</span>}
                    </div>
                    <p className="mt-4 leading-relaxed text-ink/75">{p.description}</p>

                    <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-forest-light">What it does for your skin</p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                      {benefitsFor(p).map(({ title, icon: Icon }) => (
                        <li key={title} className="flex items-center gap-2.5 text-sm font-medium text-moss">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-moss/10"><Icon size={15} /></span>
                          {title}
                        </li>
                      ))}
                    </ul>

                    {p.ingredients.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {p.ingredients.map((k) => (
                          <a key={k} href="#ingredients" className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-sand/70 py-1 pl-1 pr-3 text-sm font-medium text-moss transition-colors hover:border-moss">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-cream"><Ingredient name={k} className="h-5 w-5" /></span>
                            {ingredientLabels[k]}
                          </a>
                        ))}
                      </div>
                    )}

                    {canBuy(p) || p.stock === 0 ? (
                      <div className="mt-8 space-y-3">
                        <AddToCart p={p} full className="w-full py-4 text-base" />
                        <button onClick={() => setOrdering(p)} className="w-full text-center text-sm font-semibold text-moss underline-offset-4 hover:underline">
                          {p.photos?.length ? `See ${p.photos.length} photo${p.photos.length > 1 ? 's' : ''} & details` : 'See full details'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOrdering(p)}
                        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-6 py-4 font-semibold text-cream transition-colors hover:bg-forest-light"
                      >
                        <ShoppingBag size={18} /> Order {p.name}
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-ink/10 pt-6">
                <Dots count={items.length} active={index} onSelect={select} label="soap" />
                <ArrowPair onPrev={() => select(index - 1)} onNext={() => select(index + 1)} label="soap" />
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="mt-12 rounded-[1.75rem] border border-dashed border-ink/20 p-10 text-center text-ink/60">No soaps for this yet — try another.</p>
        )}

        {settings.showTeaser && (
          <div className="mt-14 flex flex-col items-start gap-4 rounded-[1.75rem] bg-moss p-6 text-cream sm:flex-row sm:items-center sm:p-7">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream/10 text-amber"><Sparkles size={22} /></span>
            <div className="flex-1">
              <p className="font-serif text-xl">Future variants</p>
              <p className="text-sm text-cream/70">{settings.teaserText}</p>
            </div>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-semibold text-moss transition-colors hover:bg-amber">
              <Bell size={15} /> Get notified
            </a>
          </div>
        )}
      </div>

      <AnimatePresence>{ordering && <ProductModal p={ordering} onClose={() => setOrdering(null)} />}</AnimatePresence>
    </section>
  )
}
