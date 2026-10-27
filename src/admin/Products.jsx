import { Reorder, motion, useDragControls } from 'framer-motion'
import { Eye, EyeOff, GripVertical, ImagePlus, Images, Loader2, Package, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Ingredient, SoapBox } from '../components/Illustrations'
import { benefitChoices, filters } from '../data'
import { api } from '../lib/api'
import { barFromBase } from '../lib/color'
import { Button, Chip, Drawer, EmptyState, Field, inputClass, Toggle, useConfirm, useToast } from './ui'

const CATEGORIES = filters.filter((f) => f !== 'All')
const INGREDIENTS = [
  ['turmeric', 'Turmeric'], ['beetroot', 'Beetroot'], ['sandalwood', 'Sandalwood'], ['titepati', 'Titepati'],
  ['tulsi', 'Tulsi'], ['honey', 'Honey'], ['milk', 'Goat Milk'], ['charcoal', 'Charcoal'],
]
const SWATCHES = ['#e58a2c', '#d9707f', '#e3cfa6', '#8db35f', '#e39a35', '#efe9dc', '#35383b', '#7a9e7e', '#b5835a', '#9b6fb0']

const blank = () => ({
  name: '', local: '', tagline: '', description: '', benefits: [''], categories: [], ingredients: [], skinBenefits: [],
  bar: barFromBase('#8db35f'), image: '', photos: [], price: '', stock: '', published: true, order: '',
})

const MAX_PHOTOS = 12

// Phone photos are often larger than the 4 MB upload limit, so shrink them in the browser first.
function shrink(file, max = 2000) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      if (scale === 1 && file.size < 3.5 * 1024 * 1024) return resolve(file)
      const c = Object.assign(document.createElement('canvas'), { width: Math.round(img.width * scale), height: Math.round(img.height * scale) })
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      c.toBlob((b) => resolve(b ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', 0.86)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

function PhotoRow({ ph, index, onChange, onCover, onRemove }) {
  const drag = useDragControls()
  return (
    <Reorder.Item value={ph} dragListener={false} dragControls={drag} className="flex items-center gap-3 rounded-xl border border-forest/10 bg-white p-2" whileDrag={{ scale: 1.02, boxShadow: '0 12px 30px -12px rgba(27,67,50,.4)' }}>
      <button type="button" onPointerDown={(e) => drag.start(e)} aria-label="Drag to reorder" className="grid h-9 w-6 shrink-0 cursor-grab touch-none place-items-center text-slate/40 active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">
        <img src={ph.url} alt="" className="h-full w-full object-cover" />
        {index === 0 && <span className="absolute left-1 top-1 rounded bg-amber px-1.5 text-[10px] font-bold text-forest">Cover</span>}
      </div>
      <input value={ph.caption} onChange={(e) => onChange({ ...ph, caption: e.target.value })} placeholder="Caption (optional)" aria-label="Photo caption" className={`${inputClass} py-2`} />
      {index > 0 && (
        <button type="button" onClick={onCover} title="Make cover photo" aria-label="Make cover photo" className="rounded-lg p-2 text-slate/40 hover:bg-amber/15 hover:text-amber-dark">
          <Star size={16} />
        </button>
      )}
      <button type="button" onClick={onRemove} aria-label="Remove photo" className="rounded-lg p-2 text-slate/40 hover:bg-red-50 hover:text-red-600">
        <Trash2 size={16} />
      </button>
    </Reorder.Item>
  )
}

function PhotoManager({ photos, onChange }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [pending, setPending] = useState(0)
  const [over, setOver] = useState(false)

  const upload = async (list) => {
    const files = [...list].filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type))
    if (files.length < list.length) toast('Only JPG, PNG or WebP images can be uploaded', 'error')
    const room = MAX_PHOTOS - photos.length
    if (files.length > room) toast(`Up to ${MAX_PHOTOS} photos per soap. ${files.length - Math.max(room, 0)} skipped.`, 'error')
    const take = files.slice(0, Math.max(room, 0))
    setPending(take.length)
    for (const file of take) {
      try {
        const { url } = await api.upload(await shrink(file))
        onChange((cur) => [...cur, { url, caption: '' }])
      } catch (err) {
        toast(`${file.name}: ${err.message}`, 'error')
      }
      setPending((n) => n - 1)
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-medium text-forest">Photos</p>
        <p className="text-xs text-slate/50">{photos.length} / {MAX_PHOTOS}</p>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files) }}
        disabled={photos.length >= MAX_PHOTOS}
        className={`flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition disabled:opacity-50 ${over ? 'border-forest bg-forest/5' : 'border-forest/20 bg-white hover:border-forest/40'}`}
      >
        {pending > 0 ? <Loader2 className="animate-spin text-forest" /> : <ImagePlus className="text-forest" />}
        <span className="text-sm font-semibold text-forest">{pending > 0 ? `Uploading ${pending} photo${pending > 1 ? 's' : ''}…` : 'Drop photos here or click to choose'}</span>
        <span className="text-xs text-slate/50">Pick several at once. Large photos are resized automatically.</span>
      </button>
      {photos.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs text-slate/50">Drag to reorder. The first photo is the cover on the website; captions show under each photo.</p>
          <Reorder.Group axis="y" values={photos} onReorder={(next) => onChange(() => next)} className="space-y-2">
            {photos.map((ph, i) => (
              <PhotoRow
                key={ph.url}
                ph={ph}
                index={i}
                onChange={(n) => onChange((cur) => cur.map((x) => (x.url === ph.url ? n : x)))}
                onCover={() => onChange((cur) => [ph, ...cur.filter((x) => x.url !== ph.url)])}
                onRemove={() => onChange((cur) => cur.filter((x) => x.url !== ph.url))}
              />
            ))}
          </Reorder.Group>
        </>
      )}
    </div>
  )
}

function Visual({ p, className = '' }) {
  const cover = p.photos?.[0]?.url ?? p.image
  return cover ? (
    <img src={cover} alt="" className={`aspect-[4/3] w-full rounded-xl object-cover ${className}`} />
  ) : (
    <SoapBox product={p} className={`w-full ${className}`} />
  )
}

function ProductForm({ initial, onSaved, onClose }) {
  const toast = useToast()
  const [p, setP] = useState(() => ({
    ...initial,
    skinBenefits: initial.skinBenefits ?? [],
    benefits: initial.benefits?.length ? initial.benefits : [''],
    price: initial.price ?? '',
    stock: initial.stock ?? '',
    photos: initial.photos ?? (initial.image ? [{ url: initial.image, caption: '' }] : []),
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const setPhotos = (fn) => setP((x) => ({ ...x, photos: fn(x.photos) }))
  const isNew = !initial.id

  const set = (k, v) => setP((x) => ({ ...x, [k]: v }))
  const toggleIn = (k, v, max) =>
    setP((x) => {
      const has = x[k].includes(v)
      if (!has && max && x[k].length >= max) return x
      return { ...x, [k]: has ? x[k].filter((i) => i !== v) : [...x[k], v] }
    })

  const save = async (e) => {
    e?.preventDefault()
    if (!p.name.trim()) return setError('Product name is required')
    setSaving(true)
    setError('')
    const body = { ...p, benefits: p.benefits.filter((b) => b.trim()) }
    try {
      const saved = isNew ? await api.post('/products', body) : await api.put(`/products/${p.id}`, body)
      toast(isNew ? 'Product added' : 'Product saved')
      onSaved(saved, isNew)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? 'Add product' : `Edit ${initial.name}`}
      footer={
        <>
          {error && <p className="mr-auto self-center text-sm text-red-600">{error}</p>}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>{isNew ? 'Add product' : 'Save changes'}</Button>
        </>
      }
    >
      <form onSubmit={save} className="space-y-6">
        {/* live preview */}
        <div className="flex items-center gap-5 rounded-2xl border border-forest/10 p-4" style={{ background: `radial-gradient(circle at 30% 50%, ${p.bar.light}55, #fff 70%)` }}>
          <motion.div key={p.photos[0]?.url || p.bar.base} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-52 shrink-0">
            <Visual p={p} className="drop-shadow-lg" />
          </motion.div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-dark">{p.local || 'Local name'}</p>
            <p className="truncate font-serif text-xl text-forest">{p.name || 'Product name'}</p>
            <p className="line-clamp-2 text-xs text-slate/60">{p.description || 'Short description shown on the card.'}</p>
          </div>
        </div>

        <PhotoManager photos={p.photos} onChange={setPhotos} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *" className="sm:col-span-2">
            <input className={inputClass} value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Neem Soap" />
          </Field>
          <Field label="Local / subtitle">
            <input className={inputClass} value={p.local} onChange={(e) => set('local', e.target.value)} placeholder="e.g. Chandan" />
          </Field>
          <Field label="Tagline">
            <input className={inputClass} value={p.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. The calming ritual bar" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={3} className={`${inputClass} resize-none`} value={p.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Price (NPR)" hint="Needed to sell through the cart">
            <input type="number" min="0" className={inputClass} value={p.price} onChange={(e) => set('price', e.target.value)} />
          </Field>
          <Field label="Stock (bars)" hint="Leave empty if you don’t track stock">
            <input type="number" min="0" step="1" className={inputClass} value={p.stock} onChange={(e) => set('stock', e.target.value)} />
          </Field>
          <Field label="Display order" hint="Lower numbers show first">
            <input type="number" className={inputClass} value={p.order} onChange={(e) => set('order', e.target.value)} />
          </Field>
        </div>

        <Field label="Key benefits">
          <div className="space-y-2">
            {p.benefits.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  value={b}
                  onChange={(e) => set('benefits', p.benefits.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Benefit ${i + 1}`}
                />
                <button type="button" onClick={() => set('benefits', p.benefits.filter((_, j) => j !== i))} aria-label="Remove benefit" className="rounded-xl px-3 text-slate/40 hover:bg-red-50 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
            {p.benefits.length < 8 && (
              <button type="button" onClick={() => set('benefits', [...p.benefits, ''])} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
                <Plus size={14} /> Add benefit
              </button>
            )}
          </div>
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-forest">Filter categories</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={p.categories.includes(c)} onClick={() => toggleIn('categories', c)}>{c}</Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-forest">Skin benefits</p>
          <p className="mb-2 text-xs text-slate/50">Shown as labels pointing at the soap in “Benefits &amp; Shop”, and used by the “shop by benefit” filter. “Safe for all skin” is added automatically.</p>
          <div className="flex flex-wrap gap-2">
            {benefitChoices.map((b) => (
              <Chip key={b} active={p.skinBenefits.includes(b)} onClick={() => toggleIn('skinBenefits', b)}>{b}</Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-forest">Hero ingredients <span className="font-normal text-slate/50">(up to 2)</span></p>
          <div className="flex flex-wrap gap-2">
            {INGREDIENTS.map(([key, label]) => (
              <Chip key={key} active={p.ingredients.includes(key)} onClick={() => toggleIn('ingredients', key, 2)}>
                <span className="inline-flex items-center gap-1.5">
                  <Ingredient name={key} className="h-4 w-4" />
                  {label}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <div>
            <p className="mb-2 text-sm font-medium text-forest">Accent colour</p>
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('bar', barFromBase(c))}
                  aria-label={`Colour ${c}`}
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${p.bar.base === c ? 'ring-forest' : 'ring-transparent hover:ring-forest/30'}`}
                  style={{ background: c }}
                />
              ))}
              <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-dashed border-forest/30" title="Custom colour">
                <input type="color" value={p.bar.base} onChange={(e) => set('bar', barFromBase(e.target.value))} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                <Plus size={14} className="pointer-events-none absolute inset-0 m-auto text-forest/50" />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-slate/50">Colours the watercolour wash and stripe on the box.</p>
          </div>

        </div>

        <div className="rounded-2xl bg-white p-4">
          <Toggle checked={p.published} onChange={(v) => set('published', v)} label={p.published ? 'Live on website' : 'Hidden from website'} />
        </div>
      </form>
    </Drawer>
  )
}

export default function Products({ data, setData }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('all')

  const products = data.products
    .filter((p) => (view === 'all' ? true : view === 'live' ? p.published : !p.published))
    .filter((p) => `${p.name} ${p.local} ${p.categories.join(' ')}`.toLowerCase().includes(query.toLowerCase()))

  const replace = (saved) => setData((d) => ({ ...d, products: d.products.map((x) => (x.id === saved.id ? saved : x)) }))

  const onSaved = (saved, isNew) => {
    setData((d) => ({
      ...d,
      products: isNew ? [...d.products, saved] : d.products.map((x) => (x.id === saved.id ? saved : x)),
    }))
    setEditing(null)
  }

  const togglePublished = async (p) => {
    try {
      replace(await api.put(`/products/${p.id}`, { ...p, published: !p.published }))
      toast(p.published ? `${p.name} hidden` : `${p.name} is live`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const remove = async (p) => {
    const ok = await confirm({ title: `Delete ${p.name}?`, message: 'This removes the product from the website permanently. Existing inquiries keep their record.' })
    if (!ok) return
    try {
      await api.del(`/products/${p.id}`)
      setData((d) => ({ ...d, products: d.products.filter((x) => x.id !== p.id) }))
      toast('Product deleted')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-forest">Products</h1>
          <p className="mt-1 text-slate/60">{data.products.length} soaps · {data.products.filter((p) => p.published).length} live</p>
        </div>
        <Button icon={Plus} onClick={() => setEditing(blank())}>Add product</Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className={`${inputClass} pl-10`} />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['live', 'Live'], ['hidden', 'Hidden']].map(([k, l]) => (
            <Chip key={k} active={view === k} onClick={() => setView(k)}>{l}</Chip>
          ))}
        </div>
      </div>

      {products.length ? (
        <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <motion.li
              layout
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group flex flex-col rounded-2xl border bg-white p-4 transition hover:shadow-lg hover:shadow-forest/5 ${p.published ? 'border-forest/10' : 'border-dashed border-slate/30 opacity-75'}`}
            >
              <div className="relative rounded-xl p-4" style={{ background: `radial-gradient(circle, ${p.bar.light}66, #f3ece0)` }}>
                <Visual p={p} />
                {p.photos?.length > 1 && (
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-forest/80 px-2 py-0.5 text-[11px] font-semibold text-cream">
                    <Images size={11} /> {p.photos.length}
                  </span>
                )}
                <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate/10 text-slate/70'}`}>
                  {p.published ? <Eye size={11} /> : <EyeOff size={11} />}
                  {p.published ? 'Live' : 'Hidden'}
                </span>
              </div>
              <div className="mt-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg text-forest">{p.name}</h3>
                  {p.price != null && <span className="shrink-0 text-sm font-semibold text-amber-dark">Rs. {p.price}</span>}
                </div>
                <p className="line-clamp-2 text-xs text-slate/60">{p.description}</p>
                {p.stock != null && (
                  <p className={`mt-1.5 text-xs font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-amber-dark' : 'text-emerald-700'}`}>
                    {p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.categories.map((c) => (
                    <span key={c} className="rounded-full bg-forest/5 px-2 py-0.5 text-[10px] font-semibold text-forest/70">{c}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 border-t border-forest/5 pt-3">
                <Button variant="ghost" icon={Pencil} onClick={() => setEditing(p)} className="flex-1">Edit</Button>
                <Button variant="ghost" icon={p.published ? EyeOff : Eye} onClick={() => togglePublished(p)} className="flex-1">
                  {p.published ? 'Hide' : 'Publish'}
                </Button>
                <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="rounded-xl p-2.5 text-slate/40 transition hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Package} title="No products found">Try a different search, or add a new soap.</EmptyState>
        </div>
      )}

      {editing && <ProductForm key={editing.id || 'new'} initial={editing} onSaved={onSaved} onClose={() => setEditing(null)} />}
    </div>
  )
}
