import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

export const cn = (...c) => c.filter(Boolean).join(' ')

/** Fade + rise in when scrolled into view. */
export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  )
}

/** Word-by-word blur-in headline (21st.dev "text effect" style). */
export function BlurText({ text, className = '', delay = 0 }) {
  return (
    <span className={className}>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          className="inline-block pr-[0.25em]"
          initial={{ opacity: 0, filter: 'blur(12px)', y: 18 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: delay + i * 0.08, ease: 'easeOut' }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  )
}

export function Eyebrow({ children, light = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
        light ? 'border-cream/20 bg-cream/5 text-amber-200' : 'border-forest/15 bg-forest/5 text-forest-500',
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
      </span>
      {children}
    </span>
  )
}

export function SectionHeading({ eyebrow, title, accent, subtitle, light = false, center = true }) {
  return (
    <div className={cn('mb-14 max-w-2xl', center && 'mx-auto text-center')}>
      <Reveal>
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
      </Reveal>
      <h2 className={cn('mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl', light ? 'text-cream' : 'text-forest')}>
        <BlurText text={title} />
        {accent && <BlurText text={accent} delay={0.2} className="italic text-amber-500" />}
      </h2>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', light ? 'text-cream/70' : 'text-slate-400')}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}

/** Card with a cursor-following radial spotlight + glowing border. */
export function SpotlightCard({ children, className = '', color = 'rgba(212,163,115,0.22)', ...rest }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: -999, y: -999 })
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
      onMouseLeave={() => setPos({ x: -999, y: -999 })}
      className={cn('group relative overflow-hidden', className)}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 45%)` }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

/** 3D tilt wrapper that follows the pointer. */
export function Tilt({ children, className = '', max = 12 }) {
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 18 })
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width)
        y.set((e.clientY - r.top) / r.height)
      }}
      onMouseLeave={() => {
        x.set(0.5)
        y.set(0.5)
      }}
    >
      {children}
    </motion.div>
  )
}

export function Marquee({ children, className = '', reverse = false }) {
  return (
    <div className={cn('group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]', className)}>
      <div
        className="flex shrink-0 animate-marquee items-center gap-10 pr-10 group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

/** Primary CTA with a sweeping shimmer. */
export function ShimmerButton({ children, className = '', ...rest }) {
  return (
    <motion.a
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream shadow-[0_10px_30px_-10px_rgba(27,67,50,0.7)]',
        'before:absolute before:inset-0 before:animate-shimmer before:bg-[linear-gradient(110deg,transparent_25%,rgba(212,163,115,0.45)_50%,transparent_75%)] before:bg-[length:200%_100%]',
        className,
      )}
      {...rest}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.a>
  )
}

export function GhostButton({ children, className = '', ...rest }) {
  return (
    <motion.a
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-forest/20 bg-white/60 px-7 py-3.5 text-sm font-semibold text-forest backdrop-blur transition-colors hover:border-forest/40 hover:bg-white',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.a>
  )
}

/** Counts up to a number once visible. */
export function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: 1800, bounce: 0 })
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`)
  useEffect(() => {
    if (inView) mv.set(to)
  }, [inView, mv, to])
  return <motion.span ref={ref}>{display}</motion.span>
}

/** Soft animated aurora blobs used as section backgrounds. */
export function Aurora({ className = '', colors = ['#95b8a0', '#d4a373', '#2d6a4f'] }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] animate-aurora rounded-full opacity-40 blur-3xl" style={{ background: colors[0] }} />
      <div className="absolute -right-24 top-1/3 h-[24rem] w-[24rem] animate-aurora rounded-full opacity-30 blur-3xl [animation-delay:-6s]" style={{ background: colors[1] }} />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] animate-aurora rounded-full opacity-20 blur-3xl [animation-delay:-12s]" style={{ background: colors[2] }} />
    </div>
  )
}

export function GridPattern({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]', className)}
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(27,67,50,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,67,50,0.07) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    />
  )
}
