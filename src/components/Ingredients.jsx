import { Ban, FlaskConicalOff, HeartHandshake, Rabbit } from 'lucide-react'
import { freeFrom, ingredients } from '../data'
import { useSiteData } from '../SiteData'
import { Ingredient } from './Illustrations'
import { Reveal, SectionHeader, SpotlightCard } from './ui'

const freeIcons = [FlaskConicalOff, Ban, HeartHandshake, Rabbit]

export default function Ingredients() {
  const { products } = useSiteData()

  return (
    <section id="ingredients" className="scroll-mt-28 bg-sand/60 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader eyebrow="The Goodness of Herbs" title={<>Straight from nature. <em className="text-amber-dark">Nothing to hide.</em></>}>
          Time-honoured Ayurvedic botanicals — many growing wild across Nepal’s hills — paired with pure, natural oils.
        </SectionHeader>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing, i) => {
            const usedIn = products.filter((p) => p.ingredients.includes(ing.key))
            return (
              <Reveal as="li" key={ing.key} i={i % 3}>
                <SpotlightCard glow={`${ing.tint}55`} className="flex h-full gap-5 rounded-[1.5rem] border border-ink/10 bg-cream p-5 transition-colors hover:border-moss/30">
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl" style={{ background: `${ing.tint}40` }}>
                    <Ingredient name={ing.key} className="w-14 drop-shadow-md" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl text-moss">{ing.name}</h3>
                    <p className="text-xs italic text-ink/45">{ing.sci}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{ing.note}</p>
                    {usedIn.length > 0 && (
                      <p className="mt-3 text-xs text-ink/55">
                        <span className="font-semibold text-forest-light">In: </span>
                        {usedIn.map((p) => p.name.replace(/\s+soap$/i, '')).join(', ')}
                      </p>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </ul>

        <Reveal className="mt-14 flex flex-col gap-6 border-t border-ink/10 pt-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-forest-light">Purity guarantee</p>
            <h3 className="mt-2 font-serif text-2xl text-moss sm:text-3xl">Free from what your skin doesn’t need.</h3>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {freeFrom.map((f, i) => {
              const Icon = freeIcons[i]
              return (
                <li key={f} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-moss/10 text-moss">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-moss">{f}</span>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
