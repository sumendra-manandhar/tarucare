import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BookOpen, Droplets, HandHeart, Leaf, Menu, Recycle, Sparkles, X } from 'lucide-react'
import { Ingredient, Logo, SoapBar } from '../components/Art'
import { Aurora, BlurText, Eyebrow, GhostButton, GridPattern, Marquee, ShimmerButton } from '../components/ui'
import { useStore } from '../store'
import { CartButton } from './Cart'

const NAV = [
  { href: '#about', label: 'Our Story' },
  { href: '#collection', label: 'Collection' },
  { href: '#ingredients', label: 'Ingredients' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const { settings } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
      const current = NAV.filter((n) => {
        const el = document.querySelector(n.href)
        return el && el.getBoundingClientRect().top < 140
      }).pop()
      setActive(current ? current.href : '')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {settings.announcement && (
        <div className="relative z-50 bg-forest px-4 py-2 text-center text-xs font-medium text-cream/90">{settings.announcement}</div>
      )}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-3 z-40 px-4"
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-500 sm:px-5 ${
            scrolled ? 'border-forest/10 bg-cream/80 shadow-[0_8px_30px_-12px_rgba(27,67,50,0.25)] backdrop-blur-xl' : 'border-transparent bg-transparent'
          }`}
        >
          <a href="#top" aria-label="TARU CARE home">
            <Logo />
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <li key={n.href} className="relative">
                <a href={n.href} className={`relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === n.href ? 'text-cream' : 'text-slate hover:text-forest'}`}>
                  {n.label}
                </a>
                {active === n.href && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-forest" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <CartButton />
            <a href="#collection" className="hidden rounded-full bg-amber px-5 py-2 text-sm font-semibold text-forest-800 transition hover:bg-amber-300 sm:inline-flex">
              Shop Soaps
            </a>
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-cream lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] bg-forest-800/95 backdrop-blur-lg lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between p-5">
              <Logo light />
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 text-cream" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-10 space-y-2 px-8">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <a href={n.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-4xl text-cream hover:text-amber">
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const BADGES = [
  { icon: Droplets, label: 'Pure' },
  { icon: Leaf, label: 'Natural' },
  { icon: HandHeart, label: 'Handcrafted with Care' },
  { icon: Recycle, label: 'Eco-Friendly & Sustainable' },
]

const ORBIT = [
  { name: 'turmeric', angle: 0 },
  { name: 'tulsi', angle: 60 },
  { name: 'beetroot', angle: 120 },
  { name: 'honey', angle: 180 },
  { name: 'sandalwood', angle: 240 },
  { name: 'titepati', angle: 300 },
]

function HeroVisual() {
  const { products } = useStore()
  const showcase = products.filter((p) => p.active).slice(0, 3)
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % Math.max(showcase.length, 1)), 3200)
    return () => clearInterval(t)
  }, [showcase.length])
  const current = showcase[idx] || products[0]

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* rotating rings */}
      <div className="absolute inset-[6%] rounded-full border border-dashed border-forest/20" />
      <div className="absolute inset-[18%] rounded-full border border-forest/10 bg-gradient-to-br from-white/70 to-cream-200/40 backdrop-blur-sm" />
      <motion.div
        className="absolute inset-[18%] rounded-full opacity-70 blur-2xl"
        animate={{ background: `radial-gradient(circle, ${current.base}88, transparent 70%)` }}
        transition={{ duration: 1 }}
      />

      {/* orbiting ingredients */}
      <div className="absolute inset-0 animate-spin-slow">
        {ORBIT.map(({ name, angle }) => (
          <div
            key={name}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{ transform: `rotate(${angle}deg) translateY(calc(-1 * min(38vw, 220px)))` }}
          >
            <div style={{ transform: `translate(-50%, -50%) rotate(-${angle}deg)` }}>
              <div className="animate-spin-slow [animation-direction:reverse]">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/80 bg-white/80 p-2 shadow-lg shadow-forest/10 backdrop-blur sm:h-16 sm:w-16">
                  <Ingredient name={name} className="h-full w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* the soap */}
      <div className="absolute inset-0 grid place-items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.8, rotate: -12, y: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: -6, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotate: 6, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-[58%]"
          >
            <motion.div animate={{ y: [0, -14, 0], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <SoapBar base={current.base} accent={current.accent} className="w-full drop-shadow-2xl" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* floating label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute inset-x-0 bottom-[8%] mx-auto w-fit max-w-[95%] truncate whitespace-nowrap rounded-full border border-forest/10 bg-white/90 px-4 py-2 text-sm shadow-xl backdrop-blur"
        >
          <span className="font-serif font-semibold text-forest">{current.name}</span>
          <span className="ml-2 text-slate-400">· {current.tagline}</span>
        </motion.div>
      </AnimatePresence>

      {/* floating particles */}
      {[
        ['leaf', 'left-[4%] top-[20%] h-8 w-8 text-forest-400', 0],
        ['drop', 'right-[6%] top-[14%] h-6 w-6 text-amber', 1],
        ['flower', 'right-[2%] bottom-[24%] h-9 w-9 text-amber-200', 2],
        ['leaf', 'left-[10%] bottom-[16%] h-6 w-6 text-sage', 1.5],
      ].map(([n, cls, d], i) => (
        <motion.div key={i} className={`absolute ${cls}`} animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: d }}>
          <Ingredient name={n} className="h-full w-full" />
        </motion.div>
      ))}
    </div>
  )
}

export function Hero() {
  const { scrollY } = useScroll()
  const yText = useTransform(scrollY, [0, 600], [0, 80])
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3])

  return (
    <section id="top" className="relative -mt-[72px] overflow-hidden pb-10 pt-32 sm:pt-36">
      <Aurora />
      <GridPattern />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ y: yText, opacity }} className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Eyebrow>Inspired by Nepal's Nature · Rooted in Ayurveda</Eyebrow>
          </motion.div>
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-forest sm:text-6xl lg:text-7xl">
            <BlurText text="Handcrafted by" delay={0.3} />
            <span className="relative inline-block">
              <BlurText text="Nature," delay={0.5} className="italic text-amber-500" />
              <motion.svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-[90%]" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
                <motion.path d="M2 14C50 4 150 2 198 10" stroke="#d4a373" strokeWidth="4" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.9 }} />
              </motion.svg>
            </span>{' '}
            <BlurText text="Loved by All" delay={0.7} />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mx-auto mt-6 max-w-xl text-lg text-slate-400 lg:mx-0">
            <span className="font-semibold text-forest">Pure. Natural. Nourishing.</span> For every skin. Small-batch Ayurvedic soaps made with Himalayan herbs, wild honey and
            cold-pressed oils.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }} className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
            <ShimmerButton href="#collection">
              Explore Collection <ArrowRight className="h-4 w-4" />
            </ShimmerButton>
            <GhostButton href="#about">
              <BookOpen className="h-4 w-4" /> Learn Our Story
            </GhostButton>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }} className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
            <div className="flex -space-x-3">
              {['#e9b949', '#a4244b', '#5d8a4e', '#2d2d2f'].map((c) => (
                <span key={c} className="h-9 w-9 rounded-full border-2 border-cream" style={{ background: c }} />
              ))}
            </div>
            <div className="text-left text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {'★★★★★'} <span className="ml-1 font-semibold text-forest">4.9</span>
              </div>
              <div className="text-slate-400">Loved by 2,000+ happy families</div>
            </div>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          <HeroVisual />
        </motion.div>
      </div>

      <div className="relative mt-16 border-y border-forest/10 bg-white/50 py-5 backdrop-blur">
        <Marquee>
          {[...BADGES, { icon: Sparkles, label: 'Ayurvedic Formulation' }, { icon: Leaf, label: 'Made in Nepal 🇳🇵' }].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-3 whitespace-nowrap font-serif text-xl text-forest">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-forest/5 text-forest-500">
                <Icon className="h-4 w-4" />
              </span>
              {label}
              <span className="ml-7 text-amber">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
