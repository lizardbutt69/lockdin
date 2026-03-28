import { useState } from 'react'
import { CalendarHeart, Plus, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BondsImportantDate } from '../../hooks/useBonds'

const ACCENT = '#dc2626'
const DATE_TYPES = ['Birthday', 'Anniversary', 'Other']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function daysUntil(month: number, day: number): number {
  const today = new Date()
  const thisYear = new Date(today.getFullYear(), month - 1, day)
  const target = thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, month - 1, day)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

interface Props {
  dates: BondsImportantDate[]
  onAdd: (d: Omit<BondsImportantDate, 'id'|'user_id'|'created_at'>) => void
  onDelete: (id: string) => void
}

export default function BondsImportantDates({ dates, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ person_name: '', date_type: 'Birthday', month: '', day: '', year: '', notes: '' })

  const sorted = [...dates].map(d => ({ ...d, days: daysUntil(d.month, d.day) })).sort((a, b) => a.days - b.days)
  const upcoming = sorted.filter(d => d.days <= 14)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.person_name.trim() || !form.month || !form.day) return
    onAdd({
      person_name: form.person_name.trim(),
      date_type: form.date_type,
      month: Number(form.month),
      day: Number(form.day),
      year: form.year ? Number(form.year) : null,
      notes: form.notes.trim() || null,
    })
    setForm({ person_name: '', date_type: 'Birthday', month: '', day: '', year: '', notes: '' })
    setShowAdd(false)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
            <CalendarHeart className="w-3 h-3" style={{ color: ACCENT }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Important Dates</span>
          {dates.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{dates.length}</span>}
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: showAdd ? `${ACCENT}15` : 'var(--bg-subtle)', border: `1px solid ${showAdd ? ACCENT : 'var(--border-default)'}`, color: showAdd ? ACCENT : 'var(--text-muted)' }}
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Upcoming alert */}
      {upcoming.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2" style={{ background: `${ACCENT}08`, borderBottom: '1px solid var(--border-subtle)' }}>
          {upcoming.map(d => (
            <span key={d.id} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: d.days <= 3 ? `${ACCENT}20` : 'var(--bg-subtle)', color: d.days <= 3 ? ACCENT : 'var(--text-secondary)', border: `1px solid ${d.days <= 3 ? ACCENT + '40' : 'var(--border-default)'}` }}>
              {d.person_name} {d.date_type === 'Birthday' ? '🎂' : '💍'} {d.days === 0 ? 'Today!' : `${d.days}d`}
            </span>
          ))}
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd} className="px-4 py-3 space-y-2.5 border-b overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex gap-2">
              <input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))}
                placeholder="Person's name" className="tactical-input text-sm flex-1" autoFocus />
              <select value={form.date_type} onChange={e => setForm(f => ({ ...f, date_type: e.target.value }))}
                className="tactical-input text-sm" style={{ width: 120 }}>
                {DATE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="tactical-input text-sm flex-1">
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <input type="number" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                placeholder="Day" min={1} max={31} className="tactical-input text-sm" style={{ width: 70 }} />
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                placeholder="Year" min={1900} max={2024} className="tactical-input text-sm" style={{ width: 90 }} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>Save Date</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Dates list */}
      <div className="px-3 py-2.5 space-y-1.5">
        {dates.length === 0 ? (
          <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>No dates added yet</p>
        ) : sorted.map(d => (
          <div key={d.id} className="flex items-center gap-2.5 group px-2 py-1.5 rounded-lg" style={{ background: d.days <= 7 ? `${ACCENT}08` : 'transparent' }}>
            <span className="text-lg leading-none">{d.date_type === 'Birthday' ? '🎂' : d.date_type === 'Anniversary' ? '💍' : '📅'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{d.person_name}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.date_type} · {MONTHS[d.month-1]} {d.day}{d.year ? `, ${d.year}` : ''}</p>
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: d.days <= 7 ? ACCENT : 'var(--text-muted)' }}>
              {d.days === 0 ? 'Today!' : `${d.days}d`}
            </span>
            <button onClick={() => onDelete(d.id)} className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded transition-all shrink-0" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
