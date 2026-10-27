import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ban, FlaskConical, Rabbit, Sparkles, Waves } from 'lucide-react'
import { Ingredient, SoapBar } from '../components/Art'
import { Aurora, Reveal, SectionHeading } from '../components/ui'
import { INGREDIENTS } from '../data'
import { useStore } from '../store'

const FREE_FROM = [
  { icon: FlaskConical, label: 'No Parabens' },
  { icon: Waves, label: 'No Sulphates' },
  { icon: Sparkles, label: 'No Silicones' },
  { icon: Rabbit, label: 'Cruelty-Free' },
]

const PRODUCT_FOR = { turmeric: 'turmeric', beetroot: 'beetroot', sandalwood: 'sandalwood', titepati: 'titepati', tulsi: 'goatmilk-tulsi', honey: 'honey' }

export function Ingredients() {
  const { products } = useStore()
  const [active, setActive] = useState(INGREDIENTS[0])
  const product = products.find((p) => p.id === PRODUCT_FOR[active.key])

  return (
    <section id="ingredients" className="relative scroll-mt-24 overflow-hidden bg-forest-800 py-24 text-cream sm:py-32">
      <Aurora colors={['#2d6a4f', '#d4a373', '#52936d']} className="opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading light eyebrow="Natural Ingredients" title="Straight from" accent="the garden" subtitle="No mystery chemicals. Just herbs, roots, flowers and honey you can name, sourced with care from across Nepal." />

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* selector */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {INGREDIENTS.map((ing, i) => {
              const on = ing.key === active.key
              return (
                <Reveal key={ing.key} delay={i * 0.06}>
                  <button
                    onMouseEnter={() => setActive(ing)}
                    onClick={() => setActive(ing)}
                    className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                      on ? 'border-amber/60 bg-cream/10' : 'border-cream/10 bg-cream/[0.03] hover:border-cream/25'
                    }`}
                  >
                    {on && <motion.span layoutId="ing-glow" className="absolute inset-0 -z-0" style={{ background: `radial-gradient(circle at 30% 20%, ${ing.color}40, transparent 70%)` }} />}
                    <div className="relative">
                      <motion.div animate={on ? { rotate: [0, -8, 8, 0], scale: 1.08 } : { scale: 1 }} transition={{ duration: 0.6 }} className="h-14 w-14">
                        <Ingredient name={ing.key} className="h-full w-full" />
                      </motion.div>
                      <div className="mt-3 font-serif text-lg">{ing.name}</div>
                      <div className="text-xs italic text-cream/50">{ing.latin}</div>
                    </div>
                  </button>
                </Reveal>
              )
            })}
          </div>

          {/* stage */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <motion.div className="absolute inset-0 rounded-full" animate={{ background: `radial-gradient(circle, ${active.color}55, transparent 65%)` }} transition={{ duration: 0.6 }} />
            <div className="absolute inset-[10%] rounded-full border border-cream/10" />
            <div className="absolute inset-[22%] rounded-full border border-dashed border-cream/15 animate-spin-slow" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.key}
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 10 }}
                transition={{ duration: 0.45 }}
              >
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} className="h-40 w-40 drop-shadow-2xl sm:h-48 sm:w-48">
                  <Ingredient name={active.key} className="h-full w-full" />
                </motion.div>
                {/* falling bits */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute h-2 w-2 rounded-full"
                    style={{ background: active.color, left: `${30 + i * 10}%`, top: '55%' }}
                    animate={{ y: [0, 70], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35 }}
                  />
                ))}
                {product && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 w-32">
                    <SoapBar base={product.base} accent={product.accent} className="w-full" />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 -bottom-4 mx-auto w-[90%] rounded-2xl border border-cream/10 bg-forest-900/80 p-4 text-center backdrop-blur"
              >
                <div className="font-serif text-xl text-amber">{active.name}</div>
                <p className="mt-1 text-sm text-cream/70">{active.note}</p>
                {product && <p className="mt-2 text-xs uppercase tracking-wider text-cream/40">Found in · {product.name}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Purity guarantee */}
        <Reveal className="mt-28">
          <div className="rounded-3xl border border-cream/10 bg-cream/[0.04] p-8 backdrop-blur sm:p-10">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-amber">Purity guarantee</p>
                <h3 className="mt-2 font-serif text-3xl">What we never add</h3>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                {FREE_FROM.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-cream/10 bg-forest-900/50 px-5 py-5"
                  >
                    <span className="relative grid h-12 w-12 place-items-center rounded-full bg-amber/10 text-amber">
                      <Icon className="h-5 w-5" />
                      {label !== 'Cruelty-Free' && <Ban className="absolute h-12 w-12 text-amber/70" strokeWidth={1.2} />}
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
