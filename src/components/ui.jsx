import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function Reveal({ as = 'div', i = 0, className = '', children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i} className={className} {...rest}>
      {children}
    </Tag>
  )
}

export function Eyebrow({ children, light = false, className = '' }) {
  return (
    <p className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] ${light ? 'text-amber' : 'text-forest-light'} ${className}`}>
      <span className={`h-px w-6 ${light ? 'bg-amber' : 'bg-forest-light'}`} />
      {children}
    </p>
  )
}

// Editorial, left-aligned section header with an optional slot on the right (filters, buttons).
export function SectionHeader({ eyebrow, title, children, aside, light = false }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Reveal><Eyebrow light={light}>{eyebrow}</Eyebrow></Reveal>
        <Reveal as="h2" i={1} className={`mt-4 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl ${light ? 'text-cream' : 'text-moss'}`}>
          {title}
        </Reveal>
        {children && (
          <Reveal as="p" i={2} className={`mt-4 max-w-xl text-base leading-relaxed ${light ? 'text-cream/70' : 'text-ink/65'}`}>
            {children}
          </Reveal>
        )}
      </div>
      {aside && <Reveal i={3}>{aside}</Reveal>}
    </div>
  )
}

// ---------- shared "stage + detail card" pieces (the ingredient-orbit design language) ----------
export const pad2 = (n) => String(n).padStart(2, '0')

export function Counter({ index, total, className = '' }) {
  return (
    <p className={`font-serif text-sm italic text-ink/50 ${className}`}>
      {pad2(index + 1)} / {pad2(total)}
    </p>
  )
}

export function Dots({ count, active, onSelect, label = 'item' }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Show ${label} ${i + 1}`}
          aria-current={i === active}
          className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === active ? 'w-6 bg-moss' : 'w-1.5 bg-ink/20 hover:bg-ink/40'}`}
        />
      ))}
    </div>
  )
}

export function ArrowPair({ onPrev, onNext, label = 'item', light = false }) {
  const cls = light
    ? 'border-cream/25 text-cream hover:bg-cream hover:text-moss'
    : 'border-ink/15 text-moss hover:bg-moss hover:text-cream'
  return (
    <div className="flex gap-2">
      <button onClick={onPrev} aria-label={`Previous ${label}`} className={`grid h-11 w-11 place-items-center rounded-full border transition-colors ${cls}`}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button onClick={onNext} aria-label={`Next ${label}`} className={`grid h-11 w-11 place-items-center rounded-full border transition-colors ${cls}`}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </div>
  )
}

// Auto-advancing index that stops once the visitor takes over.
export function useCycler(count, { ms = 4500, enabled = true } = {}) {
  const [index, setIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (!enabled || touched || paused || count < 2) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), ms)
    return () => clearTimeout(id)
  }, [index, enabled, touched, paused, count, ms])
  const select = (i) => {
    setTouched(true)
    setIndex(((i % count) + count) % count)
  }
  return { index: Math.min(index, Math.max(count - 1, 0)), select, setPaused }
}

// ---------- 21st-inspired primitives: spotlight card, background paths, hand-drawn underline ----------

// Card with a soft glow that follows the cursor (inspired by 21st "Spotlight Card").
export function SpotlightCard({ as: Tag = 'div', glow = 'rgba(212,163,115,.22)', className = '', children, ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`)
  }
  return (
    <Tag onMouseMove={onMove} className={`group/spot relative overflow-hidden ${className}`} {...rest}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(320px circle at var(--sx) var(--sy), ${glow}, transparent 70%)` }}
      />
      {children}
    </Tag>
  )
}

// Slow-drifting vine-like lines behind a section (inspired by 21st "Background Paths").
export function BackgroundPaths({ className = '', color = 'currentColor', count = 9 }) {
  const paths = Array.from({ length: count }, (_, i) => {
    const o = i * 26
    return `M-${380 - o} -${189 + i * 6}C-${380 - o} -${189 + i * 6} -${312 - o} ${216 - i * 6} ${152 - o} ${343 - i * 6}C${616 - o} ${470 - i * 6} ${684 - o} ${875 - i * 6} ${684 - o} ${875 - i * 6}`
  })
  return (
    <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none ${className}`} aria-hidden="true">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={0.5 + i * 0.05}
          strokeOpacity={0.08 + i * 0.02}
          initial={{ pathLength: 0.3, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
          transition={{ duration: 22 + i * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </svg>
  )
}

// Hand-drawn brush underline that draws itself in (inspired by 21st "Sketch" components).
export function HandUnderline({ className = '', delay = 0.6 }) {
  return (
    <svg viewBox="0 0 300 20" preserveAspectRatio="none" className={className} aria-hidden="true">
      <motion.path
        d="M4 14 C 60 4, 120 4, 170 10 S 260 16, 296 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  )
}
