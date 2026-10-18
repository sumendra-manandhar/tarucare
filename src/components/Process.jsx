import { motion } from 'framer-motion'
import { ClipboardCheck, Globe2, HandHeart, Leaf, Recycle } from 'lucide-react'
import { quality } from '../data'
import { Mountains } from './Illustrations'
import { Reveal, SectionHeader, pad2 } from './ui'

const Icons = { ClipboardCheck, Globe2, HandHeart, Leaf, Recycle }

// Steps sit along a hand-drawn vine that draws itself in — no boxes.
export default function Process() {
  return (
    <section id="process" className="grain relative scroll-mt-28 overflow-hidden bg-moss py-24 text-cream sm:py-28">
      <Mountains className="absolute inset-x-0 bottom-0 h-32 w-full opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader light eyebrow="Quality & Manufacturing Excellence" title={<>Small batches. <em className="text-amber">Big standards.</em></>}>
          From the herb garden to your hands — every TARU CARE bar follows the same careful journey.
        </SectionHeader>

        <div className="relative mt-16">
          {/* desktop vine */}
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-28 w-full lg:block" aria-hidden="true">
            <motion.path
              d="M20 30 C 120 110, 200 110, 220 70 S 330 0, 420 60 S 560 120, 620 60 S 740 0, 800 60 S 920 110, 980 40"
              fill="none"
              stroke="#d4a373"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
            />
          </svg>
          {/* mobile line */}
          <span className="absolute bottom-6 left-6 top-6 w-px bg-amber/40 lg:hidden" aria-hidden="true" />

          <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
            {quality.map((q, i) => {
              const Icon = Icons[q.icon]
              return (
                <Reveal as="li" key={q.title} i={i} className={`flex gap-5 lg:flex-col lg:gap-0 ${i % 2 ? 'lg:pt-14' : ''}`}>
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber text-moss ring-8 ring-moss">
                    <Icon size={20} />
                  </span>
                  <div className="lg:mt-5">
                    <p className="font-serif text-sm italic text-amber">{pad2(i + 1)}</p>
                    <h3 className="mt-1 font-serif text-xl">{q.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream/65">{q.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
