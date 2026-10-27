import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Award, Droplet, Feather, Gem, Globe2, Leaf, PackageCheck, Scale, ShieldCheck, Sparkles, Sun, Wind, FlaskRound, Hand } from 'lucide-react'
import { Ingredient } from '../components/Art'
import { Marquee, Reveal, SectionHeading, SpotlightCard } from '../components/ui'

const BENEFITS = [
  { icon: Wind, title: 'Detoxifies Skin', color: '#a4244b' },
  { icon: Droplet, title: 'Deep Cleanses', color: '#2d2d2f' },
  { icon: Feather, title: 'Moisturizes Deeply', color: '#e39b16' },
  { icon: Sun, title: 'Brightens Complexion', color: '#e9a23b' },
  { icon: Sparkles, title: 'Reduces Blemishes', color: '#5d8a4e' },
  { icon: Leaf, title: 'Soothes & Nourishes', color: '#3f7d3a' },
  { icon: Scale, title: 'Balances Oil', color: '#b07d4f' },
  { icon: ShieldCheck, title: 'Gentle & Safe for All Skin Types', color: '#1b4332' },
]

const PROCESS = [
  { icon: Gem, title: 'Premium Ingredients', text: 'Herbs hand-picked from Nepali farms and forests, with oils cold-pressed for purity.', art: 'tulsi' },
  { icon: Hand, title: 'Small-Batch Handcrafted', text: 'Cold-processed in small batches and cut by hand, so every bar gets attention.', art: 'titepati' },
  { icon: FlaskRound, title: 'Rigorous Quality Control', text: 'Each batch is pH-tested, cured 4–6 weeks and inspected before it leaves us.', art: 'sandalwood' },
  { icon: PackageCheck, title: 'Sustainable Packaging', text: 'Plastic-free, recyclable kraft and seed-paper wraps that return to the earth.', art: 'leaf' },
  { icon: Globe2, title: 'Export Quality Standards', text: 'Made to international standards so Nepal\'s botanicals can travel the world.', art: 'honey' },
]

export function Benefits() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })

  return (
    <section id="benefits" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Skin Benefits" title="Everything your skin" accent="has been asking for" subtitle="Botanical actives that work with your skin's natural balance, not against it." />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, color }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <SpotlightCard color={`${color}22`} className="h-full rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
                <motion.span whileHover={{ rotate: 12, scale: 1.1 }} className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: color, boxShadow: `0 10px 24px -10px ${color}` }}>
                  <Icon className="h-5 w-5" />
                </motion.span>
                <h3 className="mt-5 font-serif text-lg leading-snug text-forest">{title}</h3>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Manufacturing excellence */}
      <div className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Manufacturing Excellence" title="From herb" accent="to handmade bar" />
        <div ref={ref} className="relative">
          <div className="absolute left-6 top-0 h-full w-px bg-forest/10 md:left-1/2" />
          <motion.div style={{ scaleY: progress }} className="absolute left-6 top-0 h-full w-px origin-top bg-gradient-to-b from-amber via-forest-400 to-forest md:left-1/2" />
          <div className="space-y-12">
            {PROCESS.map(({ icon: Icon, title, text, art }, i) => {
              const left = i % 2 === 0
              return (
                <div key={title} className="relative flex items-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    className="absolute left-6 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-4 border-cream bg-forest text-amber shadow-lg md:left-1/2"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <motion.div
                    initial={{ opacity: 0, x: left ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className={`ml-16 w-full md:w-[calc(50%-3rem)] ${left ? 'md:ml-0' : 'md:ml-auto'}`}
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-forest/10 bg-white p-6 transition-shadow hover:shadow-xl hover:shadow-forest/10">
                      <div className="absolute -right-4 -top-4 h-24 w-24 text-forest-200 opacity-40 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                        <Ingredient name={art} className="h-full w-full" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Step 0{i + 1}</span>
                      <h3 className="mt-2 font-serif text-2xl text-forest">{title}</h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{text}</p>
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-28 -rotate-2 bg-amber py-4">
        <Marquee reverse>
          {['Pure', 'Natural', 'Nourishing', 'Handcrafted', 'Ayurvedic', 'Made in Nepal', 'Eco-Friendly'].map((w) => (
            <span key={w} className="flex items-center gap-10 whitespace-nowrap font-serif text-3xl italic text-forest">
              {w} <Award className="h-6 w-6" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
