import { Check, Eye, Target } from 'lucide-react'
import { storyTabs, whyChoose } from '../data'
import { Ingredient, Logo, Mountains } from './Illustrations'
import { Reveal, SectionHeader } from './ui'

const [story, mission, vision] = storyTabs

export default function Story() {
  return (
    <section id="story" className="scroll-mt-28 bg-sand/60 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader eyebrow="About TARU CARE" title={<>Born in the foothills, <em className="text-amber-dark">crafted by hand.</em></>} />

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal as="p" className="font-serif text-2xl leading-snug text-moss sm:text-3xl">{story.title}</Reveal>
            <Reveal as="p" i={1} className="mt-5 text-lg leading-relaxed text-ink/70">{story.text}</Reveal>

            <div className="mt-10 space-y-6">
              {[
                { icon: Target, ...mission },
                { icon: Eye, ...vision },
              ].map(({ icon: Icon, label, text }, i) => (
                <Reveal key={label} i={i + 2} className="flex gap-4 border-t border-ink/10 pt-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss text-cream"><Icon size={18} /></span>
                  <div>
                    <h3 className="font-serif text-xl text-moss">{label}</h3>
                    <p className="mt-1 leading-relaxed text-ink/70">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal i={1} className="grain relative overflow-hidden rounded-[2rem] bg-moss p-8 text-cream sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(212,163,115,.3),transparent_55%)]" aria-hidden="true" />
            <Mountains className="absolute inset-x-0 bottom-0 h-28 w-full" />
            <div className="absolute right-6 top-6 w-16 opacity-90" aria-hidden="true">
              <Ingredient name="tulsi" className="w-full" />
            </div>

            <div className="relative">
              <Logo light className="items-start" />
              <h3 className="mt-8 font-serif text-2xl">Why choose TARU CARE?</h3>
              <ul className="mt-5 space-y-3.5 pb-20">
                {whyChoose.map((w) => (
                  <li key={w} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber text-moss"><Check size={13} strokeWidth={3} /></span>
                    <span className="font-medium text-cream/90">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
