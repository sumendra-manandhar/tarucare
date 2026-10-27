import { useRef, useState } from 'react'
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion'
import { GripVertical, ImagePlus, Images, Loader2, Pencil, Plus, Save, Star, Trash2, X } from 'lucide-react'
import { SoapBar } from '../components/Art'
import { Photo } from '../components/Gallery'
import { cn } from '../components/ui'
import { CATEGORIES } from '../data'
import { deletePhotos, resizeImage, savePhoto } from '../photos'
import { useStore } from '../store'
import { ProductThumb } from '../site/Cart'
import { Card, Confirm, Toggle } from './ui'

const MAX_PHOTOS = 12

function PhotoRow({ photo, index, onCaption, onCover, onRemove }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={photo}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-xl border border-forest/10 bg-white p-2 shadow-sm"
      whileDrag={{ scale: 1.02, boxShadow: '0 12px 30px -10px rgba(27,67,50,.35)' }}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-slate-400 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
        <Photo id={photo.id} className="h-full w-full object-cover" />
        {index === 0 && <span className="absolute left-1 top-1 rounded bg-amber px-1.5 text-[10px] font-bold text-forest-900">Cover</span>}
      </div>
      <input
        id={`caption-${photo.id}`}
        value={photo.caption}
        onChange={(e) => onCaption(e.target.value)}
        placeholder="Caption for this photo (optional)"
        className="min-w-0 flex-1 rounded-lg border border-transparent bg-cream/60 px-2.5 py-2 text-sm outline-none focus:border-forest-400 focus:bg-white"
      />
      {index > 0 && (
        <button type="button" onClick={onCover} className="hidden shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-forest-500 hover:bg-forest/5 sm:block">
          Make cover
        </button>
      )}
      <button type="button" onClick={onRemove} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove photo">
        <Trash2 className="h-4 w-4" />
      </button>
    </Reorder.Item>
  )
}

function PhotoManager({ photos, onChange, onUploaded }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(0)
  const [over, setOver] = useState(false)
  const [error, setError] = useState('')

  const addFiles = async (files) => {
    const images = [...files].filter((f) => f.type.startsWith('image/'))
    const room = MAX_PHOTOS - photos.length
    setError(images.length > room ? `Up to ${MAX_PHOTOS} photos per product. ${images.length - Math.max(room, 0)} skipped.` : '')
    const take = images.slice(0, Math.max(room, 0))
    if (!take.length) return
    setBusy(take.length)
    const added = []
    for (const file of take) {
      try {
        const id = await savePhoto(await resizeImage(file))
        added.push({ id, caption: '' })
      } catch {
        setError(`Couldn't read ${file.name}. Use a JPG, PNG or WebP image.`)
      }
      setBusy((n) => n - 1)
    }
    onUploaded(added.map((a) => a.id))
    onChange((list) => [...list, ...added])
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Photos</span>
        <span className="text-xs text-slate-400">{photos.length} / {MAX_PHOTOS}</span>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition',
          over ? 'border-forest-400 bg-forest/5' : 'border-forest/15 bg-white hover:border-forest/30',
        )}
      >
        {busy > 0 ? <Loader2 className="h-7 w-7 animate-spin text-forest-400" /> : <ImagePlus className="h-7 w-7 text-forest-400" />}
        <p className="text-sm font-medium text-forest">{busy > 0 ? `Processing ${busy} photo${busy > 1 ? 's' : ''}…` : 'Drop photos here or click to upload'}</p>
        <p className="text-xs text-slate-400">Select several at once. Large images are resized automatically.</p>
        <input
          ref={inputRef}
          id="product-photos"
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {photos.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs text-slate-400">Drag to set the order. The first photo is the cover shown on the product card.</p>
          <Reorder.Group axis="y" values={photos} onReorder={(next) => onChange(() => next)} className="space-y-2">
            {photos.map((ph, i) => (
              <PhotoRow
                key={ph.id}
                photo={ph}
                index={i}
                onCaption={(caption) => onChange((list) => list.map((x) => (x.id === ph.id ? { ...x, caption } : x)))}
                onCover={() => onChange((list) => [ph, ...list.filter((x) => x.id !== ph.id)])}
                onRemove={() => onChange((list) => list.filter((x) => x.id !== ph.id))}
              />
            ))}
          </Reorder.Group>
        </>
      )}
    </div>
  )
}

const BLANK = {
  id: '', name: '', nepali: '', tagline: '', description: '', longDescription: '', ingredients: [], benefits: [], categories: [],
  price: 350, stock: 50, weight: '100g', base: '#c9a26b', accent: '#6b4a24', active: true, featured: false, photos: [],
}

function ProductEditor({ product, onClose, onSave }) {
  const [f, setF] = useState(() => ({ ...product, ingredientsText: product.ingredients.join(', '), benefitsText: product.benefits.join(', ') }))
  const [photos, setPhotos] = useState(product.photos || [])
  // Photos are stored as soon as they're uploaded; discard the new ones if the edit is cancelled.
  const uploaded = useRef([])
  const cancel = () => {
    deletePhotos(uploaded.current)
    onClose()
  }
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const isNew = !product.id

  const save = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Name is required')
    if (!f.categories.length) return setErr('Pick at least one category')
    const split = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)
    const { ingredientsText, benefitsText, ...rest } = f
    const removed = (product.photos || []).filter((ph) => !photos.some((x) => x.id === ph.id))
    deletePhotos(removed.map((ph) => ph.id))
    onSave({
      ...rest,
      photos,
      id: rest.id || rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36).slice(-4),
      ingredients: split(ingredientsText),
      benefits: split(benefitsText),
      stock: Math.max(0, Number(rest.stock) || 0),
      price: Math.max(0, Number(rest.price) || 0),
    })
  }

  const input = 'w-full rounded-xl border border-forest/15 bg-cream/50 px-3 py-2.5 text-sm outline-none transition focus:border-forest-400 focus:bg-white focus:ring-4 focus:ring-forest/10'
  const lbl = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400'

  return (
    <motion.div className="fixed inset-0 z-[80] flex justify-end bg-forest-900/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancel}>
      <motion.form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="scrollbar-thin flex h-full w-full max-w-xl flex-col overflow-y-auto bg-cream"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-forest/10 bg-cream/90 px-6 py-4 backdrop-blur">
          <h2 className="font-serif text-2xl text-forest">{isNew ? 'New product' : 'Edit product'}</h2>
          <button type="button" onClick={cancel} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-5 rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${f.base}33, ${f.base}0d)` }}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-36 shrink-0">
              <SoapBar base={f.base} accent={f.accent} className="w-full" />
            </motion.div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <label>
                <span className={lbl}>Bar color</span>
                <input type="color" value={f.base} onChange={set('base')} className="h-10 w-full cursor-pointer rounded-lg border border-forest/15 bg-white" />
              </label>
              <label>
                <span className={lbl}>Herb flecks</span>
                <input type="color" value={f.accent} onChange={set('accent')} className="h-10 w-full cursor-pointer rounded-lg border border-forest/15 bg-white" />
              </label>
            </div>
          </div>

          <PhotoManager photos={photos} onChange={setPhotos} onUploaded={(ids) => uploaded.current.push(...ids)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={lbl}>Name</span><input className={input} value={f.name} onChange={set('name')} placeholder="e.g. Neem Soap" /></label>
            <label><span className={lbl}>Nepali name</span><input className={input} value={f.nepali} onChange={set('nepali')} /></label>
            <label><span className={lbl}>Tagline</span><input className={input} value={f.tagline} onChange={set('tagline')} /></label>
            <label><span className={lbl}>Price (Rs.)</span><input type="number" min="0" className={input} value={f.price} onChange={set('price')} /></label>
            <label><span className={lbl}>Stock (units)</span><input type="number" min="0" className={input} value={f.stock} onChange={set('stock')} /></label>
            <label><span className={lbl}>Weight</span><input className={input} value={f.weight} onChange={set('weight')} /></label>
          </div>

          <label className="block"><span className={lbl}>Short description</span><textarea rows={2} className={input} value={f.description} onChange={set('description')} /></label>
          <label className="block"><span className={lbl}>Full description</span><textarea rows={3} className={input} value={f.longDescription} onChange={set('longDescription')} /></label>
          <label className="block"><span className={lbl}>Ingredients (comma separated)</span><input className={input} value={f.ingredientsText} onChange={set('ingredientsText')} /></label>
          <label className="block"><span className={lbl}>Benefits (comma separated)</span><input className={input} value={f.benefitsText} onChange={set('benefitsText')} /></label>

          <div>
            <span className={lbl}>Categories</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = f.categories.includes(c)
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setF((x) => ({ ...x, categories: on ? x.categories.filter((y) => y !== c) : [...x.categories, c] }))}
                    className={cn('rounded-full border px-3.5 py-1.5 text-sm transition', on ? 'border-forest bg-forest text-cream' : 'border-forest/15 bg-white text-slate-500 hover:border-forest/40')}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-2xl border border-forest/10 bg-white p-4">
            <label className="flex items-center gap-3 text-sm text-slate-500"><Toggle on={f.active} onChange={(v) => setF((x) => ({ ...x, active: v }))} label="Visible on site" /> Visible on site</label>
            <label className="flex items-center gap-3 text-sm text-slate-500"><Toggle on={f.featured} onChange={(v) => setF((x) => ({ ...x, featured: v }))} label="Bestseller badge" /> Bestseller badge</label>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>

        <div className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t border-forest/10 bg-cream/90 px-6 py-4 backdrop-blur">
          <button type="button" onClick={cancel} className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-forest/5">Cancel</button>
          <button className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500">
            <Save className="h-4 w-4" /> {isNew ? 'Create product' : 'Save changes'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

export function Products({ query, toast }) {
  const { products, saveProduct, deleteProduct } = useStore()
  const [editing, setEditing] = useState(null)
  const [del, setDel] = useState(null)
  const [cat, setCat] = useState('All')
  const list = products.filter(
    (p) => (cat === 'All' || p.categories.includes(cat)) && `${p.name} ${p.ingredients.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-forest/10 bg-white p-1">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm', cat === c ? 'text-cream' : 'text-slate-400 hover:text-forest')}>
              {cat === c && <motion.span layoutId="admin-cat" className="absolute inset-0 rounded-full bg-forest" />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setEditing(BLANK)} className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-amber-300">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className={cn('group h-full transition hover:shadow-lg', !p.active && 'opacity-60')}>
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <ProductThumb product={p} className="h-20 w-24 transition group-hover:scale-105" />
                    {p.photos?.length > 0 && (
                      <span className="absolute -bottom-1.5 -right-1.5 inline-flex items-center gap-0.5 rounded-full bg-forest px-1.5 py-0.5 text-[10px] font-bold text-cream">
                        <Images className="h-3 w-3" /> {p.photos.length}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-serif text-lg text-forest">{p.name}</h3>
                      {p.featured && <Star className="h-4 w-4 shrink-0 fill-amber text-amber" />}
                    </div>
                    <p className="text-xs text-slate-400">{p.categories.join(' · ')}</p>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span className="font-semibold text-forest">Rs. {p.price}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock < 15 ? 'bg-amber/20 text-amber-600' : 'bg-forest-100 text-forest-500')}>
                        {p.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-forest/5 pt-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <Toggle
                      on={p.active}
                      label="Visible"
                      onChange={(v) => {
                        saveProduct({ ...p, active: v })
                        toast(v ? `${p.name} is now visible` : `${p.name} hidden from site`)
                      }}
                    />
                    {p.active ? 'Visible' : 'Hidden'}
                  </label>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-forest/5 hover:text-forest" aria-label={`Edit ${p.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDel(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Delete ${p.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!list.length && <p className="py-16 text-center text-slate-400">No products match.</p>}

      <AnimatePresence>
        {editing && (
          <ProductEditor
            product={editing}
            onClose={() => setEditing(null)}
            onSave={(p) => {
              saveProduct(p)
              setEditing(null)
              toast(editing.id ? 'Product updated' : 'Product created')
            }}
          />
        )}
      </AnimatePresence>
      <Confirm
        open={!!del}
        title={`Delete ${del?.name}?`}
        text="This removes the product from the store and website. This can't be undone."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          deleteProduct(del.id)
          toast('Product deleted')
          setDel(null)
        }}
      />
    </div>
  )
}
