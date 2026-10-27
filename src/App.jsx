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
import { AccountDrawer } from './components/Account'
import { DEMO_BUILD, exitDemo, isDemo } from './lib/api'

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
      {isDemo() && !DEMO_BUILD && (
        // Someone exploring the demo admin sees its sample data here too; orders go to the demo, not the shop.
        <div className="fixed bottom-20 left-4 z-[66] flex items-center gap-2 rounded-full bg-amber py-1.5 pl-4 pr-1.5 text-xs font-semibold text-moss shadow-lg sm:bottom-6">
          Demo mode: orders aren’t sent to the shop
          <a href="/admin" className="rounded-full bg-moss px-3 py-1 text-cream">Admin</a>
          <button
            onClick={() => {
              exitDemo()
              window.location.reload()
            }}
            className="rounded-full bg-cream px-3 py-1 text-moss"
          >
            Exit
          </button>
        </div>
      )}
      <CartDrawer />
      <AccountDrawer />
      <AddedToast />
    </MotionConfig>
  )
}
