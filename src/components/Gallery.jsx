import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const slide = {
  enter: (d) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
}

function useSlides(count, start = 0) {
  const [[index, dir], set] = useState([start, 0])
  return {
    index: Math.min(index, Math.max(count - 1, 0)),
    dir,
    step: (d) => set(([i]) => [(i + d + count) % count, d]),
    to: (i) => set(([cur]) => [i, i > cur ? 1 : -1]),
  }
}

function Lightbox({ photos, start, name, onClose }) {
  const { index, dir, step } = useSlides(photos.length, start)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })
  const ph = photos[index]
  return (
    <motion.div className="fixed inset-0 z-[80] flex flex-col bg-moss/95 text-cream backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between px-5 py-4">
        <p className="font-serif text-sm italic text-cream/70">{name} · {index + 1} / {photos.length}</p>
        <button onClick={onClose} aria-label="Close photos" className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 hover:bg-cream/20"><X size={20} /></button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img key={ph.url} src={ph.url} alt={ph.caption || name} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="max-h-[74vh] max-w-full rounded-2xl object-contain" />
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-4 grid h-12 w-12 place-items-center rounded-full border border-cream/25 hover:bg-cream hover:text-moss"><ChevronLeft size={22} /></button>
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-4 grid h-12 w-12 place-items-center rounded-full border border-cream/25 hover:bg-cream hover:text-moss"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <p className="min-h-16 px-6 py-5 text-center font-serif text-lg italic text-cream/85">{ph.caption}</p>
    </motion.div>
  )
}

// A product's photo story: swipeable main image with captions, thumbnails and a full-screen view.
export default function Gallery({ photos, name, tint = '#f3ece0', className = '' }) {
  const { index, dir, step, to } = useSlides(photos.length)
  const [full, setFull] = useState(false)
  const ph = photos[index]
  return (
    <div className={`flex flex-col ${className}`} style={{ background: tint }}>
      <div className="group relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={ph.url}
            src={ph.url}
            alt={ph.caption || name}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            drag={photos.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, info) => (info.offset.x < -60 ? step(1) : info.offset.x > 60 ? step(-1) : null)}
            draggable={false}
            className="absolute inset-0 h-full w-full cursor-grab object-cover active:cursor-grabbing"
          />
        </AnimatePresence>
        {ph.caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5 pt-14">
            <AnimatePresence mode="wait">
              <motion.p key={ph.url} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-serif text-lg italic leading-snug text-cream">
                {ph.caption}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
        <button onClick={() => setFull(true)} aria-label="View photos full screen" className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-cream/85 text-moss shadow transition hover:bg-cream">
          <Expand size={16} />
        </button>
        {photos.length > 1 && (
          <>
            <span className="absolute bottom-4 right-4 rounded-full bg-ink/55 px-2.5 py-1 font-serif text-xs italic text-cream backdrop-blur">{index + 1} / {photos.length}</span>
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream/85 text-moss opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"><ChevronLeft size={20} /></button>
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream/85 text-moss opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"><ChevronRight size={20} /></button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
          {photos.map((p, i) => (
            <button key={p.url} onClick={() => to(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index} className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-cream/0 transition ${i === index ? 'ring-moss' : 'opacity-60 ring-transparent hover:opacity-100'}`}>
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>{full && <Lightbox photos={photos} start={index} name={name} onClose={() => setFull(false)} />}</AnimatePresence>
    </div>
  )
}
