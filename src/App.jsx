import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import Collection from './components/Collection'
import Contact from './components/Contact'
import FAQ from './components/FAQ'
import Finder from './components/Finder'
import FloatingCTA from './components/FloatingCTA'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Ingredients from './components/Ingredients'
import Navbar from './components/Navbar'
import Process from './components/Process'
import Ritual from './components/Ritual'
import Story from './components/Story'
import { AddedToast, CartDrawer } from './components/Cart'

// Product-first flow: hook → shop → learn → trust → answer doubts → convert.
export default function App() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <MotionConfig reducedMotion="user">
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-amber" />
      <Navbar />
      <main>
        <Hero />
        <Finder />
        <Collection />
        <Ingredients />
        <Ritual />
        <Story />
        <Process />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingCTA />
      <CartDrawer />
      <AddedToast />
    </MotionConfig>
  )
}
