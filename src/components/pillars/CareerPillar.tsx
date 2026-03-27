import { useState, useEffect, useCallback } from 'react'
import { Briefcase, Eye, EyeOff, Pencil, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import WinLog from './WinLog'
import SkillsTracker from './SkillsTracker'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'

const ACCENT = '#2563eb'
const EYE_KEY = 'lockedin_career_privacy'

interface Snapshot {
  id: string
  role: string | null
  company: string | null
  start_date: string | null
  target_role: string | null
  salary: number | null
}

function fmt(n: number | null | undefined, hidden: boolean) {
  if (hidden) return '••••••'
  if (n == null) return '—'
  return '$' + n.toLocaleString()
}

function numOrNull(s: string): number | null {
  const n = Number(s.replace(/,/g, ''))
  return isNaN(n) || s.trim() === '' ? null : n
}

function tenure(startDate: string | null): string {
  if (!startDate) return ''
  const start = new Date(startDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (months < 1) return 'Just started'
  if (months < 12) return `${months}mo`
  const yrs = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${yrs}y ${rem}mo` : `${yrs}y`
}

export default function CareerPillar() {
  const { user } = useAuth()
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [hidden, setHidden] = useState(() => localStorage.getItem(EYE_KEY) === 'true')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ role: '', company: '', start_date: '', target_role: '', salary: '' })

  const fetchSnapshot = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return
    const { data } = await (supabase as any).from('career_snapshots').select('*').eq('user_id', user.id).maybeSingle()
    if (data) setSnapshot(data as Snapshot)
  }, [user])

  useEffect(() => { fetchSnapshot() }, [fetchSnapshot])

  function togglePrivacy() {
    const next = !hidden; setHidden(next); localStorage.setItem(EYE_KEY, String(next))
  }

  function openEdit() {
    setForm({
      role:        snapshot?.role        ?? '',
      company:     snapshot?.company     ?? '',
      start_date:  snapshot?.start_date  ?? '',
      target_role: snapshot?.target_role ?? '',
      salary:      snapshot?.salary      != null ? String(snapshot.salary) : '',
    })
    setEditing(true)
  }

  async function saveSnapshot() {
    if (!user || !isSupabaseConfigured) return
    const payload = {
      user_id: user.id,
      role: form.role.trim() || null,
      company: form.company.trim() || null,
      start_date: form.start_date || null,
      target_role: form.target_role.trim() || null,
      salary: numOrNull(form.salary),
    }
    if (snapshot) {
      const { data } = await (supabase as any).from('career_snapshots').update(payload).eq('id', snapshot.id).select().single()
      if (data) setSnapshot(data as Snapshot)
    } else {
      const { data } = await (supabase as any).from('career_snapshots').insert(payload).select().single()
      if (data) setSnapshot(data as Snapshot)
    }
    setEditing(false)
  }

  const hasData = snapshot?.role || snapshot?.company

  return (
    <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
        <Briefcase className="w-3.5 h-3.5" style={{ color: ACCENT }} />
      </div>
      <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Career</span>
    </div>
    <div className="grid grid-cols-3 gap-4 items-start">
      {/* LEFT 2/3 */}
      <div className="col-span-2 space-y-4">
      {/* Role Snapshot */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
              <Briefcase className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            </div>
            <span className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Current Role</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={togglePrivacy}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: hidden ? ACCENT : 'var(--text-muted)', background: hidden ? `${ACCENT}18` : 'transparent', border: '1px solid var(--border-default)' }}>
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={editing ? () => setEditing(false) : openEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: editing ? '#ef4444' : 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
              {editing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!editing ? (
          hasData ? (
            <div className="space-y-3">
              {/* Current role */}
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Current Role</p>
                <p className="text-xl font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
                  {snapshot?.role || '—'}
                </p>
                {snapshot?.company && (
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {snapshot.company}
                    {snapshot.start_date && (
                      <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ background: `${ACCENT}12`, color: ACCENT }}>
                        {tenure(snapshot.start_date)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {snapshot?.target_role && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                    <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Target</p>
                    <p className="text-sm font-bold font-['Plus_Jakarta_Sans']" style={{ color: ACCENT }}>{snapshot.target_role}</p>
                  </div>
                )}
                <div className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                  <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Salary</p>
                  <p className="text-sm font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>{fmt(snapshot?.salary, hidden)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No role set yet.</p>
              <button type="button" onClick={openEdit} className="text-xs mt-1 underline" style={{ color: ACCENT }}>Set up your career profile</button>
            </div>
          )
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {([
              ['role', 'Current Role', 'text', 'e.g. Senior Software Engineer'],
              ['company', 'Company', 'text', 'e.g. Acme Corp'],
              ['target_role', 'Target Role', 'text', 'e.g. Engineering Manager'],
              ['salary', 'Salary ($)', 'number', '0'],
            ] as const).map(([key, label, type, placeholder]) => (
              <div key={key}>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="tactical-input"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="tactical-input" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={saveSnapshot} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: ACCENT }}>Save</button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WinLog />
        <SkillsTracker />
      </div>
      </div>{/* end col-span-2 */}

      {/* RIGHT 1/3 */}
      <div className="col-span-1 space-y-4">
        <PillarGoals category="Career" accentColor={ACCENT} accentBg={`${ACCENT}08`} accentBorder={`${ACCENT}30`} />
        <PillarHabitTracker pillar="Career" accentColor={ACCENT} accentMuted={`${ACCENT}20`} compact />
      </div>
    </div>
    </div>
  )
}
