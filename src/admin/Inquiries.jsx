import { motion } from 'framer-motion'
import { Download, Inbox, Mail, Phone, Search, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'
import { Button, Chip, Drawer, EmptyState, Field, inputClass, STATUS, StatusBadge, timeAgo, useConfirm, useToast } from './ui'

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

function exportCsv(rows) {
  const cols = ['createdAt', 'type', 'status', 'name', 'email', 'phone', 'productName', 'quantity', 'subject', 'message', 'notes']
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `tarucare-inquiries-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

function Detail({ q, onUpdate, onDelete, onClose }) {
  const toast = useToast()
  const [notes, setNotes] = useState(q.notes)
  const [saving, setSaving] = useState(false)

  const patch = async (body, msg) => {
    setSaving(true)
    try {
      onUpdate(await api.patch(`/inquiries/${q.id}`, body))
      if (msg) toast(msg)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const replySubject = q.type === 'order' ? `Your TARU CARE order: ${q.productName}` : `Re: ${q.subject}`

  return (
    <Drawer
      open
      onClose={onClose}
      title={q.type === 'order' ? 'Order request' : 'Inquiry'}
      footer={
        <>
          <Button variant="ghost" icon={Trash2} onClick={onDelete} className="mr-auto text-red-600 hover:bg-red-50">Delete</Button>
          <a
            href={`mailto:${q.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(`Namaste ${q.name},\n\n`)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream hover:bg-forest-light"
          >
            <Mail size={16} /> Reply by email
          </a>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={q.status} />
          <span className="text-xs text-slate/50">Received {new Date(q.createdAt).toLocaleString()}</span>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <p className="font-serif text-2xl text-forest">{q.name}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href={`mailto:${q.email}`} className="inline-flex items-center gap-2 text-forest hover:underline"><Mail size={14} /> {q.email}</a>
            {q.phone && <a href={`tel:${q.phone}`} className="inline-flex items-center gap-2 text-forest hover:underline"><Phone size={14} /> {q.phone}</a>}
          </div>
        </div>

        {q.type === 'order' && (
          <div className="flex items-center gap-4 rounded-2xl border border-amber/40 bg-amber/10 p-5">
            <ShoppingBag className="text-amber-dark" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-dark">Order</p>
              <p className="font-serif text-xl text-forest">{q.quantity} × {q.productName}</p>
            </div>
          </div>
        )}

        <div>
          {q.subject && <p className="font-semibold text-forest">{q.subject}</p>}
          <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate/80">{q.message || <em className="text-slate/40">No message</em>}</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-forest">Status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS).map(([key, s]) => (
              <Chip key={key} active={q.status === key} onClick={() => q.status !== key && patch({ status: key }, `Marked as ${s.label.toLowerCase()}`)}>
                <span className="inline-flex items-center gap-1.5"><s.icon size={12} />{s.label}</span>
              </Chip>
            ))}
          </div>
        </div>

        <Field label="Internal notes" hint="Only visible to admins">
          <textarea rows={4} className={`${inputClass} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Called customer, delivering Friday" />
        </Field>
        <Button variant="secondary" loading={saving} disabled={notes === q.notes} onClick={() => patch({ notes }, 'Notes saved')}>Save notes</Button>
      </div>
    </Drawer>
  )
}

export default function Inquiries({ data, setData }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  const all = data.inquiries
  const counts = Object.fromEntries(Object.keys(STATUS).map((k) => [k, all.filter((q) => q.status === k).length]))
  const rows = all
    .filter((q) => status === 'all' || q.status === status)
    .filter((q) => type === 'all' || q.type === type)
    .filter((q) => `${q.name} ${q.email} ${q.subject} ${q.productName} ${q.message}`.toLowerCase().includes(query.toLowerCase()))
  const open = all.find((q) => q.id === openId)

  const update = (q) => setData((d) => ({ ...d, inquiries: d.inquiries.map((x) => (x.id === q.id ? q : x)) }))

  const openRow = async (q) => {
    setOpenId(q.id)
    if (q.status === 'new') {
      // Opening a new inquiry moves it to "in progress" so the inbox count reflects what's been seen.
      api.patch(`/inquiries/${q.id}`, { status: 'in_progress' }).then(update).catch(() => {})
    }
  }

  const remove = async (q) => {
    const ok = await confirm({ title: 'Delete this inquiry?', message: `The message from ${q.name} will be permanently removed.` })
    if (!ok) return
    try {
      await api.del(`/inquiries/${q.id}`)
      setData((d) => ({ ...d, inquiries: d.inquiries.filter((x) => x.id !== q.id) }))
      setOpenId(null)
      toast('Inquiry deleted')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-forest">Orders & Inquiries</h1>
          <p className="mt-1 text-slate/60">Messages and order requests from the website.</p>
        </div>
        <Button variant="secondary" icon={Download} onClick={() => exportCsv(rows)} disabled={!rows.length}>Export CSV</Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>All · {all.length}</Chip>
        {Object.entries(STATUS).map(([k, s]) => (
          <Chip key={k} active={status === k} onClick={() => setStatus(k)}>{s.label} · {counts[k]}</Chip>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, product…" className={`${inputClass} pl-10`} />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputClass} sm:w-48`} aria-label="Type">
          <option value="all">All types</option>
          <option value="order">Orders</option>
          <option value="general">General inquiries</option>
        </select>
      </div>

      {rows.length ? (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-forest/10 bg-white">
          {rows.map((q, i) => (
            <motion.li key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 10) * 0.02 }} className="border-b border-forest/5 last:border-0">
              <button onClick={() => openRow(q)} className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-sand/40 sm:px-5">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${q.type === 'order' ? 'bg-amber/20 text-amber-dark' : 'bg-forest/5 text-forest'}`}>
                  {q.type === 'order' ? <ShoppingBag size={17} /> : <Inbox size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm text-forest ${q.status === 'new' ? 'font-bold' : 'font-medium'}`}>{q.name}</p>
                    {q.status === 'new' && <span className="h-2 w-2 shrink-0 rounded-full bg-amber" aria-hidden="true" />}
                  </div>
                  <p className="truncate text-sm text-slate/70">{q.type === 'order' ? `${q.quantity} × ${q.productName}` : q.subject}</p>
                  <p className="truncate text-xs text-slate/45">{q.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={q.status} />
                  <span className="text-[11px] text-slate/40">{timeAgo(q.createdAt)}</span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Inbox} title={all.length ? 'Nothing matches these filters' : 'No inquiries yet'}>
            {all.length ? 'Try clearing the search or picking another status.' : 'When visitors use the contact form or order a soap, it shows up here.'}
          </EmptyState>
        </div>
      )}

      {open && <Detail key={open.id} q={open} onUpdate={update} onDelete={() => remove(open)} onClose={() => setOpenId(null)} />}
    </div>
  )
}
