import { AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { ingredientLabels } from '../data'
import { useSiteData } from '../SiteData'
import { openShop } from './Finder'
import { ProductVisual } from './Illustrations'
import ProductModal, { formatPrice } from './ProductModal'
import { Reveal, SectionHeader, SpotlightCard } from './ui'

// The whole range at a glance — every published soap from the admin, in display order.
export default function Collection() {
  const { products } = useSiteData()
  const [ordering, setOrdering] = useState(null)

  return (
    <section id="collection" className="scroll-mt-28 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="The full collection"
          title={<>All our soaps, <em className="text-amber-dark">side by side.</em></>}
          aside={<p className="font-serif text-lg italic text-ink/50">{products.length} handcrafted bars</p>}
        >
          Every TARU CARE bar in one place — compare, then order the ones your skin will love.
        </SectionHeader>

        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} i={i % 4} className="flex flex-col">
              <SpotlightCard
                as="button"
                onClick={() => setOrdering(p)}
                aria-label={`View ${p.name}`}
                glow={`${p.bar.light}88`}
                className="group block aspect-[4/3.4] w-full rounded-[1.75rem] text-left"
                style={{ background: `linear-gradient(160deg, ${p.bar.light}45, ${p.bar.base}26)` }}
              >
                <span className="paper absolute inset-0" aria-hidden="true" />
                <span className="absolute inset-x-[10%] top-[12%] block transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-2">
                  <ProductVisual p={p} className="drop-shadow-xl" />
                </span>
              </SpotlightCard>

              <div className="flex flex-1 flex-col px-1 pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-xl text-moss">{p.name}</h3>
                  {p.price != null && <span className="shrink-0 text-sm font-semibold text-ink">{formatPrice(p.price)}</span>}
                </div>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-dark">
                  {p.ingredients.map((k) => ingredientLabels[k]).filter(Boolean).join(' · ') || p.local}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{p.description}</p>
                {p.categories.length > 0 && (
                  <p className="mt-3 text-xs text-ink/50">{p.categories.join(' · ')}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setOrdering(p)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-moss px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-light"
                  >
                    <ShoppingBag size={15} /> Order
                  </button>
                  <button
                    onClick={() => openShop(p.categories[0] ?? 'All')}
                    className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-moss transition-colors hover:border-ink/40"
                  >
                    Benefits
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      <AnimatePresence>{ordering && <ProductModal p={ordering} onClose={() => setOrdering(null)} />}</AnimatePresence>
    </section>
  )
}
