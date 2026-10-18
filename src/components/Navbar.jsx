import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logo } from './Illustrations'

const links = [
  { href: '#shop', label: 'Shop by skin' },
  { href: '#collection', label: 'All Soaps' },
  { href: '#ingredients', label: 'Ingredients' },
  { href: '#ritual', label: 'How to use' },
  { href: '#story', label: 'Our Story' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`overflow-hidden bg-moss text-cream transition-[height] duration-300 ${scrolled ? 'h-0' : 'h-9'}`}>
        <p className="flex h-9 items-center justify-center gap-2 px-4 text-center text-xs font-medium tracking-wide">
          <span aria-hidden="true">🇳🇵</span> Handmade in Nepal · Small-batch Ayurvedic herbal soaps
        </p>
      </div>

      <nav className="px-3 pt-3 sm:px-6">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-3 py-2 pl-5 transition-[background-color,border-color,box-shadow] duration-300 ${
            scrolled || open ? 'border-ink/10 bg-cream/90 shadow-[0_10px_30px_-12px_rgba(46,34,25,.25)] backdrop-blur-md' : 'border-transparent bg-transparent'
          }`}
        >
          <a href="#top" aria-label="TARU CARE home">
            <Logo compact />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-ink/75 transition hover:bg-ink/5 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#shop"
              className="group hidden items-center gap-1.5 rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-light sm:inline-flex"
            >
              Order now
              <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full text-moss hover:bg-ink/5 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mt-2 max-w-6xl rounded-3xl border border-ink/10 bg-cream p-3 shadow-xl lg:hidden"
            >
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-serif text-lg text-moss hover:bg-ink/5">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="p-1 pt-2">
                <a href="#shop" onClick={() => setOpen(false)} className="block rounded-full bg-moss py-3 text-center font-semibold text-cream">
                  Order now
                </a>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
