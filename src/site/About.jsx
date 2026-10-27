import { motion } from 'framer-motion'
import { Compass, Flower2, HandHeart, Leaf, Mountain, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { Ingredient, SoapBar } from '../components/Art'
import { Counter, Reveal, SectionHeading, SpotlightCard } from '../components/ui'

const WHY = [
  { icon: Leaf, title: '100% Natural & Herbal', text: 'Only plant-based herbs, oils and butters. Nothing synthetic.' },
  { icon: Flower2, title: 'Ayurvedic Formulation', text: 'Recipes guided by centuries-old Ayurvedic wisdom.' },
  { icon: HandHeart, title: 'Handcrafted with Love', text: 'Poured, cut and cured by hand in small batches.' },
  { icon: Sparkles, title: 'Gentle on Skin, Tough on Impurities', text: 'A rich, creamy lather that cleans without stripping.' },
  { icon: ShieldCheck, title: 'Safe for All Skin Types', text: 'Dry, oily, sensitive or combination. There is a bar for you.' },
]

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Story"
          title="From the Himalayan foothills"
          accent="to your hands"
          subtitle="Inspired by Nepal's natural heritage and the timeless wisdom of Ayurveda, every TARU CARE soap is handcrafted with the finest herbs, natural oils, and traditional techniques."
        />

        {/* Bento grid */}
        <div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4 md:row-span-2">
            <SpotlightCard className="h-full rounded-3xl bg-forest p-8 text-cream sm:p-10">
              <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber/10 blur-2xl" />
              <Mountain className="h-8 w-8 text-amber" />
              <h3 className="mt-6 max-w-md font-serif text-3xl leading-snug sm:text-4xl">
                Rooted in Ayurveda, <span className="italic text-amber">rooted in Nepal.</span>
              </h3>
              <p className="mt-4 max-w-lg text-cream/70">
                We source turmeric from the Terai, titepati from the hills and wild honey from mountain villages. Each bar is cold-processed and cured
                for 4–6 weeks to keep every herb's goodness intact.
              </p>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-cream/10 pt-6">
                {[
                  [7, '', 'Herbal variants'],
                  [100, '%', 'Natural'],
                  [6, 'wk', 'Slow curing'],
                ].map(([n, s, l]) => (
                  <div key={l}>
                    <div className="font-serif text-3xl text-amber">
                      <Counter to={n} suffix={s} />
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-cream/60">{l}</div>
                  </div>
                ))}
              </div>
              <motion.div
                className="pointer-events-none absolute -bottom-6 right-4 hidden w-56 sm:block md:w-64"
                animate={{ y: [0, -10, 0], rotate: [-10, -6, -10] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <SoapBar base="#5d8a4e" accent="#2f5228" />
              </motion.div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-2">
            <SpotlightCard className="h-full rounded-3xl border border-forest/10 bg-white p-7">
              <Target className="h-7 w-7 text-amber-500" />
              <h4 className="mt-4 font-serif text-2xl text-forest">Our Mission</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                To provide natural, safe, and effective herbal soaps that enhance wellness and promote a sustainable lifestyle.
              </p>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.2} className="md:col-span-2">
            <SpotlightCard className="h-full rounded-3xl border border-forest/10 bg-amber-50 p-7">
              <Compass className="h-7 w-7 text-forest-500" />
              <h4 className="mt-4 font-serif text-2xl text-forest">Our Vision</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                To be a globally recognized herbal soap brand known for purity, quality, and care for nature.
              </p>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* Why choose */}
        <div className="mt-24">
          <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <h3 className="font-serif text-3xl text-forest sm:text-4xl">
              Why choose <span className="italic text-amber-500">TARU CARE?</span>
            </h3>
            <div className="flex gap-2">
              {['turmeric', 'tulsi', 'honey'].map((n) => (
                <span key={n} className="grid h-12 w-12 place-items-center rounded-full border border-forest/10 bg-white p-2">
                  <Ingredient name={n} className="h-full w-full" />
                </span>
              ))}
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WHY.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group relative h-full overflow-hidden rounded-2xl border border-forest/10 bg-white p-6 transition-shadow hover:shadow-xl hover:shadow-forest/10"
                >
                  <span className="absolute right-4 top-3 font-serif text-5xl text-forest/5 transition-colors group-hover:text-amber/30">0{i + 1}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest/5 text-forest transition-colors group-hover:bg-forest group-hover:text-amber">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h4 className="mt-5 font-semibold leading-snug text-forest">{title}</h4>
                  <p className="mt-2 text-sm text-slate-400">{text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
