import { motion, useScroll, useSpring } from 'framer-motion'
import { Navbar, Hero } from './Hero'
import { About } from './About'
import { Collection } from './Collection'
import { Ingredients } from './Ingredients'
import { Benefits } from './Benefits'
import { Contact, Footer } from './Contact'

export default function Site() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <div className="min-h-screen bg-cream">
      <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[80] h-1 origin-left bg-gradient-to-r from-forest via-forest-400 to-amber" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Collection />
        <Ingredients />
        <Benefits />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
