import { motion } from 'framer-motion'
import { Droplets, Hand, Sparkles, Sun } from 'lucide-react'
import { Ingredient } from './Illustrations'
import { Reveal, SectionHeader } from './ui'

const STEPS = [
  { icon: Droplets, title: 'Wet', text: 'Wet your skin and the bar with lukewarm water.' },
  { icon: Sparkles, title: 'Lather', text: 'Rub the bar between your palms to build a rich, herbal lather.' },
  { icon: Hand, title: 'Massage', text: 'Massage gently over face or body for 30–60 seconds so the herbs can work.' },
  { icon: Sun, title: 'Rinse & rest', text: 'Rinse, pat dry, and keep the bar on a draining dish — a dry bar lasts much longer.' },
]

// A short daily ritual — practical info that helps visitors picture using the product.
export default function Ritual() {
  return (
    <section id="ritual" className="scroll-mt-28 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader eyebrow="How to use" title={<>A simple daily <em className="text-amber-dark">ritual.</em></>}>
          Four easy steps to get the most from every TARU CARE bar — morning or night, face or body.
        </SectionHeader>

        <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <motion.span
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-gradient-to-r from-amber/70 via-moss/30 to-transparent lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} i={i} className="relative">
              <div className="flex items-center gap-4">
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-moss text-cream ring-8 ring-cream">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span className="font-serif text-5xl italic leading-none text-amber/60">{i + 1}</span>
              </div>
              <h3 className="mt-6 font-serif text-2xl text-moss">{title}</h3>
              <p className="mt-2 leading-relaxed text-ink/70">{text}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14 flex flex-col items-start gap-5 rounded-[1.75rem] bg-sand/70 p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="w-14 shrink-0" aria-hidden="true">
            <Ingredient name="honey" className="w-full" />
          </div>
          <p className="flex-1 leading-relaxed text-ink/75">
            <span className="font-semibold text-moss">Tip: </span>
            Use your skin-need bar daily, and keep a gentle bar like Goat Milk &amp; Tulsi or Honey for days your skin feels sensitive.
            Patch-test first if you have known allergies.
          </p>
          <a href="#shop" className="shrink-0 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-light">
            Find your bar
          </a>
        </Reveal>
      </div>
    </section>
  )
}
