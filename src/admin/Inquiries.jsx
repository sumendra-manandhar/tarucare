import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCheck, Inbox, Mail, Trash2 } from 'lucide-react'
import { cn } from '../components/ui'
import { useStore } from '../store'
import { Card, Confirm, StatusBadge, ago, fmtDate } from './ui'

export function Inquiries({ query, toast }) {
  const { inquiries, updateInquiry, deleteInquiry } = useStore()
  const [filter, setFilter] = useState('all')
  const [selId, setSelId] = useState(null)
  const [del, setDel] = useState(null)
  const list = inquiries.filter(
    (q) => (filter === 'all' || q.status === filter) && `${q.name} ${q.email} ${q.subject} ${q.message}`.toLowerCase().includes(query.toLowerCase()),
  )
  const sel = inquiries.find((q) => q.id === selId)

  const open = (q) => {
    setSelId(q.id)
    if (q.status === 'new') updateInquiry(q.id, { status: 'read' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card className="p-0">
        <div className="flex gap-1 overflow-x-auto border-b border-forest/10 p-3">
          {['all', 'new', 'read', 'replied'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn('relative rounded-full px-3.5 py-1.5 text-sm capitalize', filter === s ? 'text-cream' : 'text-slate-400 hover:text-forest')}>
              {filter === s && <motion.span layoutId="inq-filter" className="absolute inset-0 rounded-full bg-forest" />}
              <span className="relative">
                {s} {s !== 'all' && <span className="opacity-60">({inquiries.filter((q) => q.status === s).length})</span>}
              </span>
            </button>
          ))}
        </div>
        <ul className="scrollbar-thin max-h-[60vh] divide-y divide-forest/5 overflow-y-auto">
          {list.map((q) => (
            <li key={q.id}>
              <button onClick={() => open(q)} className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left transition', selId === q.id ? 'bg-forest/5' : 'hover:bg-cream')}>
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-sm font-semibold text-forest">
                  {q.name[0]}
                  {q.status === 'new' && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('truncate text-sm', q.status === 'new' ? 'font-bold text-forest' : 'font-medium text-slate-500')}>{q.name}</p>
                    <span className="shrink-0 text-[11px] text-slate-400">{ago(q.date)}</span>
                  </div>
                  <p className="truncate text-sm text-forest">{q.subject}</p>
                  <p className="truncate text-xs text-slate-400">{q.message}</p>
                </div>
              </button>
            </li>
          ))}
          {!list.length && <li className="p-10 text-center text-sm text-slate-400">No inquiries here.</li>}
        </ul>
      </Card>

      <Card className="min-h-[320px]">
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.div key={sel.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <StatusBadge status={sel.status} />
                  <h3 className="mt-2 font-serif text-2xl text-forest">{sel.subject}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {sel.name} · <a className="text-forest-500 hover:underline" href={`mailto:${sel.email}`}>{sel.email}</a> · {fmtDate(sel.date)}
                  </p>
                </div>
                <button onClick={() => setDel(sel)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Delete inquiry">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-6 whitespace-pre-wrap rounded-2xl bg-cream p-5 leading-relaxed text-slate-500">{sel.message}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={`mailto:${sel.email}?subject=${encodeURIComponent('Re: ' + sel.subject)}`}
                  onClick={() => updateInquiry(sel.id, { status: 'replied' })}
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-500"
                >
                  <Mail className="h-4 w-4" /> Reply by email
                </a>
                {sel.status !== 'replied' && (
                  <button
                    onClick={() => {
                      updateInquiry(sel.id, { status: 'replied' })
                      toast('Marked as replied')
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5"
                  >
                    <CheckCheck className="h-4 w-4" /> Mark replied
                  </button>
                )}
                {sel.status !== 'new' && (
                  <button onClick={() => updateInquiry(sel.id, { status: 'new' })} className="rounded-full px-4 py-2.5 text-sm text-slate-400 hover:bg-forest/5">
                    Mark unread
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-slate-400">
              <Inbox className="h-10 w-10 text-forest-200" />
              <p className="mt-3 text-sm">Select an inquiry to read it</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      <Confirm
        open={!!del}
        title="Delete this inquiry?"
        text={`The message from ${del?.name} will be removed permanently.`}
        onCancel={() => setDel(null)}
        onConfirm={() => {
          deleteInquiry(del.id)
          setSelId(null)
          setDel(null)
          toast('Inquiry deleted')
        }}
      />
    </div>
  )
}
