import { Check, KeyRound, Loader2, Pencil, Plus, Save, ShieldCheck, Trash2, UserPlus, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PERMISSIONS } from '../data'
import { api } from '../lib/api'
import { Button, Drawer, EmptyState, Field, inputClass, timeAgo, Toggle, useConfirm, useToast } from './ui'

function StaffForm({ initial, roles, onSaved, onClose }) {
  const toast = useToast()
  const isNew = !initial.id
  const [f, setF] = useState({ name: initial.name ?? '', email: initial.email ?? '', roleId: initial.roleId ?? roles[0]?.id ?? '', active: initial.active ?? true, password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const save = async (e) => {
    e?.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = { ...f, password: f.password || undefined }
      const saved = isNew ? await api.post('/staff', body) : await api.put(`/staff/${initial.id}`, body)
      toast(isNew ? `${saved.name} can now sign in` : 'Staff member saved')
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const role = roles.find((r) => r.id === f.roleId)
  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? 'Add staff member' : `Edit ${initial.name}`}
      footer={
        <>
          {error && <p className="mr-auto self-center text-sm text-red-600">{error}</p>}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>{isNew ? 'Add staff member' : 'Save changes'}</Button>
        </>
      }
    >
      <form onSubmit={save} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input className={inputClass} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Email" hint="They sign in with this"><input type="email" className={inputClass} value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
        </div>
        <Field label="Role">
          <select className={inputClass} value={f.roleId} onChange={(e) => set('roleId', e.target.value)}>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        {role && (
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate/50">{role.name} can use</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {role.permissions.length ? (
                PERMISSIONS.filter((p) => role.permissions.includes(p.key)).map((p) => <span key={p.key} className="rounded-full bg-forest/5 px-2.5 py-1 text-xs font-semibold text-forest">{p.label}</span>)
              ) : (
                <span className="text-sm text-slate/60">Nothing yet. Turn menus on for this role below the staff list.</span>
              )}
            </div>
          </div>
        )}
        <Field label={isNew ? 'Password' : 'New password'} hint={isNew ? 'At least 8 characters. Share it with them privately.' : 'Leave empty to keep their current password. Setting one signs them out everywhere.'}>
          <input type="text" autoComplete="new-password" className={inputClass} value={f.password} onChange={(e) => set('password', e.target.value)} />
        </Field>
        {!isNew && (
          <div className="rounded-2xl bg-white p-4">
            <Toggle checked={f.active} onChange={(v) => set('active', v)} label={f.active ? 'Account active' : 'Account switched off (cannot sign in)'} />
          </div>
        )}
      </form>
    </Drawer>
  )
}

function RoleRow({ role, staffCount, onSaved, onDelete }) {
  const toast = useToast()
  const [name, setName] = useState(role.name)
  const [perms, setPerms] = useState(role.permissions)
  const [saving, setSaving] = useState(false)
  const dirty = name !== role.name || perms.length !== role.permissions.length || perms.some((p) => !role.permissions.includes(p))
  const toggle = (k) => setPerms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))

  const save = async () => {
    setSaving(true)
    try {
      onSaved(await api.put(`/roles/${role.id}`, { name, permissions: perms }))
      toast(`${name} updated`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="border-t border-forest/5 align-middle">
      <th scope="row" className="p-3 text-left font-normal">
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Role name" className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-semibold text-forest outline-none hover:border-forest/15 focus:border-forest focus:bg-white" />
        <p className="px-2 text-[11px] text-slate/50">{staffCount} staff</p>
      </th>
      {PERMISSIONS.map((p) => {
        const on = perms.includes(p.key)
        return (
          <td key={p.key} className="p-2 text-center">
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              aria-label={`${name}: ${p.label}`}
              onClick={() => toggle(p.key)}
              className={`mx-auto grid h-7 w-7 place-items-center rounded-lg border transition ${on ? 'border-forest bg-forest text-cream' : 'border-forest/20 bg-white text-transparent hover:border-forest/50'}`}
            >
              <Check size={15} strokeWidth={3} />
            </button>
          </td>
        )
      })}
      <td className="whitespace-nowrap p-2 text-right">
        <Button variant={dirty ? 'primary' : 'ghost'} icon={Save} loading={saving} disabled={!dirty} onClick={save} className="px-3 py-2">Save</Button>
        <button onClick={onDelete} aria-label={`Delete ${role.name}`} className="ml-1 rounded-xl p-2.5 text-slate/40 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
      </td>
    </tr>
  )
}

export default function Team({ user }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [staff, setStaff] = useState(null)
  const [roles, setRoles] = useState([])
  const [editing, setEditing] = useState(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    Promise.all([api.get('/staff'), api.get('/roles')])
      .then(([s, r]) => {
        setStaff(s)
        setRoles(r)
      })
      .catch((err) => toast(err.message, 'error'))
  }, [toast])

  const roleName = (id) => roles.find((r) => r.id === id)?.name ?? 'No role'

  const removeStaff = async (m) => {
    const ok = await confirm({ title: `Remove ${m.name}?`, message: 'They will no longer be able to sign in. To pause access instead, edit them and switch the account off.' })
    if (!ok) return
    try {
      await api.del(`/staff/${m.id}`)
      setStaff((s) => s.filter((x) => x.id !== m.id))
      toast(`${m.name} removed`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const addRole = async (e) => {
    e.preventDefault()
    if (!newRole.trim()) return
    try {
      const r = await api.post('/roles', { name: newRole, permissions: ['dashboard'] })
      setRoles((rs) => [...rs, r])
      setNewRole('')
      toast(`${r.name} role added. Tick the menus it should see.`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const deleteRole = async (r) => {
    const ok = await confirm({ title: `Delete the ${r.name} role?`, message: 'Staff must be moved to another role first.' })
    if (!ok) return
    try {
      await api.del(`/roles/${r.id}`)
      setRoles((rs) => rs.filter((x) => x.id !== r.id))
      toast('Role deleted')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!staff) return <div className="grid h-64 place-items-center text-forest/50"><Loader2 className="animate-spin" /></div>

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-forest">Team</h1>
          <p className="mt-1 text-slate/60">Give staff their own sign-in, and choose which menus each role can use.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setEditing({})} disabled={!roles.length}>Add staff member</Button>
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-forest">Staff</h2>
        {staff.length ? (
          <ul className="mt-3 divide-y divide-forest/5 overflow-hidden rounded-2xl border border-forest/10 bg-white">
            {staff.map((m) => (
              <li key={m.id} className={`flex items-center gap-4 px-5 py-4 ${m.active ? '' : 'opacity-60'}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest/10 font-semibold text-forest">{m.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">{m.name}{m.id === user.id ? ' (you)' : ''}</p>
                  <p className="truncate text-xs text-slate/60">{m.email} · {m.lastLoginAt ? `last signed in ${timeAgo(m.lastLoginAt)}` : 'never signed in'}</p>
                </div>
                <span className="hidden rounded-full bg-forest/5 px-2.5 py-1 text-xs font-semibold text-forest sm:inline">{roleName(m.roleId)}</span>
                {!m.active && <span className="rounded-full bg-slate/10 px-2.5 py-1 text-xs font-semibold text-slate/70">Off</span>}
                <button onClick={() => setEditing(m)} aria-label={`Edit ${m.name}`} className="rounded-xl p-2.5 text-slate/50 hover:bg-forest/5 hover:text-forest"><Pencil size={16} /></button>
                {m.id !== user.id && (
                  <button onClick={() => removeStaff(m)} aria-label={`Remove ${m.name}`} className="rounded-xl p-2.5 text-slate/40 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState icon={UsersRound} title="No staff yet">Add people from sales, marketing or support so they get their own sign-in instead of sharing the owner password.</EmptyState>
          </div>
        )}
        <p className="mt-3 flex items-center gap-2 text-xs text-slate/50"><KeyRound size={13} /> The owner signs in with the password from the server settings and always has every menu.</p>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl text-forest"><ShieldCheck size={20} /> Roles &amp; menu access</h2>
            <p className="text-sm text-slate/60">Tick the menus each role can open, then save. Changes apply on the person’s next click.</p>
          </div>
          <form onSubmit={addRole} className="flex gap-2">
            <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role, e.g. Warehouse" aria-label="New role name" className={`${inputClass} w-56`} />
            <Button type="submit" variant="secondary" icon={Plus} className="whitespace-nowrap">Add role</Button>
          </form>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-forest/10 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-xs text-slate/60">
                <th scope="col" className="p-3 text-left font-semibold">Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p.key} scope="col" className="p-2 text-center font-semibold" title={p.hint}>{p.label}</th>
                ))}
                <th scope="col" className="p-2" />
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <RoleRow
                  key={r.id}
                  role={r}
                  staffCount={staff.filter((m) => m.roleId === r.id).length}
                  onSaved={(saved) => setRoles((rs) => rs.map((x) => (x.id === saved.id ? saved : x)))}
                  onDelete={() => deleteRole(r)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <StaffForm
          key={editing.id ?? 'new'}
          initial={editing}
          roles={roles}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setStaff((s) => (s.some((x) => x.id === saved.id) ? s.map((x) => (x.id === saved.id ? saved : x)) : [...s, saved]))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
