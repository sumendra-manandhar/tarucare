import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, ImageIcon, X } from 'lucide-react'
import { usePhoto } from '../photos'
import { cn } from './ui'

export function Photo({ id, alt = '', className = '', ...rest }) {
  const src = usePhoto(id)
  if (!src) return <div className={cn('animate-pulse bg-forest/5', className)} aria-hidden="true" {...rest} />
  return <img src={src} alt={alt} className={className} draggable={false} {...rest} />
}

const slide = {
  enter: (d) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
}

function useCarousel(count, start = 0) {
  const [[index, dir], set] = useState([start, 0])
  const go = (d) => set(([i]) => [(i + d + count) % count, d])
  const to = (i) => set(([cur]) => [i, i > cur ? 1 : -1])
  useEffect(() => {
    if (index >= count) set([0, 0])
  }, [count, index])
  return { index: Math.min(index, Math.max(count - 1, 0)), dir, go, to }
}

function Lightbox({ photos, start, name, onClose }) {
  const { index, dir, go } = useCarousel(photos.length, start)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const ph = photos[index]
  return (
    <motion.div className="fixed inset-0 z-[90] flex flex-col bg-forest-900/95 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between p-4 text-cream">
        <span className="text-sm text-cream/70">
          {name} · {index + 1} / {photos.length}
        </span>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 hover:bg-cream/20" aria-label="Close photos">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div key={ph.id} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="flex h-full w-full items-center justify-center">
            <Photo id={ph.id} alt={ph.caption || name} className="max-h-[75vh] max-w-full rounded-xl object-contain" />
          </motion.div>
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Previous photo">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => go(1)} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Next photo">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      <p className="min-h-[3.5rem] px-6 py-4 text-center font-serif text-lg italic text-cream/90">{ph?.caption}</p>
    </motion.div>
  )
}

/** Swipeable photo story for a product: main image, caption, thumbnails and a full-screen view. */
export function ProductGallery({ photos, name, className = '' }) {
  const { index, dir, go, to } = useCarousel(photos.length)
  const [full, setFull] = useState(false)
  if (!photos.length) {
    return (
      <div className={cn('grid place-items-center text-forest/30', className)}>
        <ImageIcon className="h-10 w-10" />
      </div>
    )
  }
  const ph = photos[index]
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="group relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={ph.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            drag={photos.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1)
              else if (info.offset.x > 60) go(-1)
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Photo id={ph.id} alt={ph.caption || name} className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        {ph.caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-900/80 to-transparent p-4 pt-12">
            <AnimatePresence mode="wait">
              <motion.p key={ph.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-serif text-base italic text-cream">
                {ph.caption}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
        <button onClick={() => setFull(true)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-forest shadow transition hover:scale-105" aria-label="View full screen">
          <Expand className="h-4 w-4" />
        </button>
        {photos.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-forest opacity-0 shadow transition group-hover:opacity-100" aria-label="Previous photo">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-forest opacity-0 shadow transition group-hover:opacity-100" aria-label="Next photo">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute left-3 top-3 rounded-full bg-forest-900/60 px-2.5 py-1 text-[11px] font-semibold text-cream backdrop-blur">
              {index + 1} / {photos.length}
            </div>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="scrollbar-thin flex gap-2 overflow-x-auto bg-white/60 p-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => to(i)}
              className={cn('relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition', i === index ? 'ring-amber' : 'opacity-60 ring-transparent hover:opacity-100')}
              aria-label={`Show photo ${i + 1}`}
            >
              <Photo id={p.id} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>{full && <Lightbox photos={photos} start={index} name={name} onClose={() => setFull(false)} />}</AnimatePresence>
    </div>
  )
}
