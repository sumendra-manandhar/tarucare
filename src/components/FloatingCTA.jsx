import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

// Mobile-only "Find your soap" pill: appears after the hero, hides while the shop or contact form is on screen.
export default function FloatingCTA() {
  const [pastHero, setPastHero] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const visible = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)))
        setBlocked(visible.size > 0)
      },
      { threshold: 0.15 },
    )
    ;['shop', 'contact'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const show = pastHero && !blocked

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#shop"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-moss px-6 py-3.5 text-sm font-semibold text-cream shadow-[0_14px_30px_-10px_rgba(31,61,43,.6)] sm:hidden"
        >
          <ShoppingBag size={16} /> Find your soap
        </motion.a>
      )}
    </AnimatePresence>
  )
}
