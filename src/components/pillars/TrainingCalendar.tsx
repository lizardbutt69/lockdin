import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Check, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface TrainingSession {
  id: string
  user_id: string
  session_date: string
  workout_type: string
  title: string | null
  notes: string | null
  duration_min: number | null
  start_time: string | null
  created_at: string
}

const WORKOUT_TYPES = ['LIFT', 'RUN', 'HYROX', 'CYCLE', 'SWIM', 'HIIT', 'YOGA', 'WALK', 'REST', 'OTHER'] as const

const TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  LIFT:  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: 'Lift'  },
  RUN:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  label: 'Run'   },
  HYROX: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'HYROX' },
  CYCLE: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',  label: 'Cycle' },
  SWIM:  { color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', label: 'Swim'  },
  HIIT:  { color: '#f97316', bg: 'rgba(249,115,22,0.15)', label: 'HIIT'  },
  YOGA:  { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  label: 'Yoga'  },
  WALK:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)',label: 'Walk'  },
  REST:  { color: '#475569', bg: 'rgba(71,85,105,0.15)',  label: 'Rest'  },
  OTHER: { color: '#64748b', bg: 'rgba(100,116,139,0.12)',label: 'Other' },
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startMonday = getMondayOfWeek(firstDay)

  const days: (Date | null)[] = []
  const cur = new Date(startMonday)
  while (cur <= lastDay || days.length % 7 !== 0) {
    const inMonth = cur.getMonth() === month && cur.getFullYear() === year
    days.push(inMonth ? new Date(cur) : null)
    cur.setDate(cur.getDate() + 1)
    if (days.length > 42) break
  }
  return days
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ─── Shared overlay wrapper ───────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 6 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 6 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-xl p-4 shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── Session Detail (view/edit existing) ────────────────────────────────────

function SessionDetail({
  session,
  onSave,
  onDelete,
  onClose,
}: {
  session: TrainingSession
  onSave: (date: string, type: string, title: string, notes: string, duration: string, editId: string, startTime: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    type: session.workout_type,
    title: session.title ?? '',
    notes: session.notes ?? '',
    duration: session.duration_min ? String(session.duration_min) : '',
    start_time: session.start_time ?? '',
  })
  const [saving, setSaving] = useState(false)
  const cfg = TYPE_CONFIG[form.type] ?? TYPE_CONFIG.OTHER
  const date = new Date(session.session_date + 'T00:00:00')
  const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  async function handleSave() {
    setSaving(true)
    await onSave(session.session_date, form.type, form.title, form.notes, form.duration, session.id, form.start_time)
    setSaving(false)
    setEditing(false)
  }

  return (
    <Overlay onClose={onClose}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
        </div>

        {!editing ? (
          <>
            {/* View mode */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-['Plus_Jakarta_Sans']" style={{ color: cfg.color }}>{session.workout_type}</span>
                <div className="ml-auto flex items-center gap-2">
                  {session.start_time && (
                    <span className="text-sm" style={{ color: cfg.color }}>{session.start_time}</span>
                  )}
                  {session.duration_min && (
                    <span className="text-sm" style={{ color: cfg.color }}>{session.duration_min} min</span>
                  )}
                </div>
              </div>
              {session.title && (
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{session.title}</p>
              )}
              {session.notes && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{session.notes}</p>
              )}
              {!session.title && !session.notes && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No description added.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(session.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit mode */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {WORKOUT_TYPES.map(t => {
                  const c = TYPE_CONFIG[t]
                  const active = form.type === t
                  return (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                      style={{ background: active ? c.bg : 'var(--bg-subtle)', border: `1px solid ${active ? c.color : 'var(--border-default)'}`, color: active ? c.color : 'var(--text-muted)' }}
                    >{c.label}</button>
                  )
                })}
              </div>
              <input type="text" placeholder="Title (optional)" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="tactical-input text-sm" />
              <div className="flex gap-2">
                <input type="time" value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="tactical-input flex-1" />
                <input type="number" placeholder="Duration (min)" value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="tactical-input flex-1" />
              </div>
              <textarea placeholder="Notes (optional)" value={form.notes} rows={2}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="tactical-input text-sm resize-none w-full" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: cfg.color, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Overlay>
  )
}

// ─── Add Session Popover ──────────────────────────────────────────────────────

function AddSessionPopover({
  date,
  onSave,
  onClose,
}: {
  date: Date
  onSave: (date: string, type: string, title: string, notes: string, duration: string, startTime: string) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({ type: 'LIFT', title: '', notes: '', duration: '', start_time: '' })
  const [saving, setSaving] = useState(false)
  const cfg = TYPE_CONFIG[form.type] ?? TYPE_CONFIG.OTHER
  const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  async function handleSave() {
    setSaving(true)
    await onSave(toISO(date), form.type, form.title, form.notes, form.duration, form.start_time)
    setSaving(false)
  }

  return (
    <Overlay onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {WORKOUT_TYPES.map(t => {
              const c = TYPE_CONFIG[t]
              const active = form.type === t
              return (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{ background: active ? c.bg : 'var(--bg-subtle)', border: `1px solid ${active ? c.color : 'var(--border-default)'}`, color: active ? c.color : 'var(--text-muted)' }}
                >{c.label}</button>
              )
            })}
          </div>
          <input type="text" placeholder="Title (optional — e.g. Back & Bis, 5K easy)" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="tactical-input text-sm" />
          <div className="flex gap-2">
            <input type="time" value={form.start_time}
              onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="tactical-input flex-1" />
            <input type="number" placeholder="Duration (min)" value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="tactical-input flex-1" />
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes} rows={2}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="tactical-input text-sm resize-none w-full" />
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5"
              style={{ background: cfg.color, opacity: saving ? 0.7 : 1 }}>
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Add to plan'}
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ─── Main Calendar ────────────────────────────────────────────────────────────

function getWeekStart(offsetWeeks: number): Date {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getWeekDatesFromMonday(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.toLocaleDateString('en-US', opts)} – ${sunday.getDate()}`
  }
  return `${monday.toLocaleDateString('en-US', opts)} – ${sunday.toLocaleDateString('en-US', opts)}`
}

export default function TrainingCalendar({ accentColor = '#ea580c' }: { accentColor?: string }) {
  const { user } = useAuth()
  const today = new Date()
  const todayStr = toISO(today)

  const [view, setView] = useState<'month' | 'week'>('month')
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [weekOffset, setWeekOffset] = useState(0)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)

  const weekStart = getWeekStart(weekOffset)
  const weekDates = getWeekDatesFromMonday(weekStart)

  const fetchSessions = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return
    let from: string, to: string
    if (view === 'month') {
      from = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`
      const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate()
      to = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    } else {
      from = toISO(weekDates[0])
      to = toISO(weekDates[6])
    }
    const { data } = await (supabase as any)
      .from('training_sessions').select('*').eq('user_id', user.id)
      .gte('session_date', from).lte('session_date', to)
      .order('session_date', { ascending: true })
    if (data) setSessions(data)
  }, [user, view, viewYear, viewMonth, weekOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchSessions() }, [fetchSessions])

  function prevPeriod() {
    if (view === 'month') {
      if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1)
    } else {
      setWeekOffset(o => o - 1)
    }
  }
  function nextPeriod() {
    if (view === 'month') {
      if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1)
    } else {
      setWeekOffset(o => o + 1)
    }
  }

  async function saveSession(date: string, type: string, title: string, notes: string, duration: string, editId?: string, startTime?: string) {
    if (!user || !isSupabaseConfigured) return
    const payload = { user_id: user.id, session_date: date, workout_type: type, title: title.trim() || null, notes: notes.trim() || null, duration_min: duration ? Number(duration) : null, start_time: startTime?.trim() || null }
    if (editId) {
      const { data } = await (supabase as any).from('training_sessions').update(payload).eq('id', editId).select().single()
      if (data) setSessions(prev => prev.map(s => s.id === editId ? data : s))
    } else {
      const { data } = await (supabase as any).from('training_sessions').insert(payload).select().single()
      if (data) setSessions(prev => [...prev, data])
    }
    setSelectedDay(null)
  }

  async function deleteSession(id: string) {
    if (!isSupabaseConfigured) return
    setSessions(prev => prev.filter(s => s.id !== id))
    await (supabase as any).from('training_sessions').delete().eq('id', id)
    setSelectedDay(null)
  }

  const sessionMap = new Map<string, TrainingSession[]>()
  for (const s of sessions) {
    const arr = sessionMap.get(s.session_date) ?? []
    arr.push(s)
    sessionMap.set(s.session_date, arr)
  }

  const totalSessions = sessions.filter(s => s.workout_type !== 'REST').length
  const restDays = sessions.filter(s => s.workout_type === 'REST').length
  const periodLabel = view === 'month'
    ? `${MONTH_NAMES[viewMonth]} ${viewYear}`
    : formatWeekRange(weekStart)

  // ── Month grid ──
  const grid = getMonthGrid(viewYear, viewMonth)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wider shrink-0" style={{ color: 'var(--text-primary)' }}>
            Training Plan
          </h3>
          {totalSessions > 0 && (
            <p className="text-[10px] hidden sm:block truncate" style={{ color: 'var(--text-muted)' }}>
              {totalSessions} sessions · {restDays} rest
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
            {(['month', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors"
                style={{
                  background: view === v ? accentColor : 'var(--bg-subtle)',
                  color: view === v ? '#fff' : 'var(--text-muted)',
                }}
              >{v}</button>
            ))}
          </div>

          {/* Nav */}
          <button onClick={prevPeriod} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)', minWidth: 110, textAlign: 'center' }}>
            {periodLabel}
          </span>
          <button onClick={nextPeriod} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            <ChevronRight className="w-4 h-4" />
          </button>
          {view === 'week' && weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold"
              style={{ background: `${accentColor}18`, color: accentColor }}
            >Today</button>
          )}
        </div>
      </div>

      {/* Day of week headers — month view only (week view has its own inside scroll container) */}
      {view === 'month' && (
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border-default)' }}>
          {DOW.map((d, i) => (
            <div key={i} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              {d}
            </div>
          ))}
        </div>
      )}

      {/* ── MONTH VIEW ── */}
      {view === 'month' && (
        <div className="grid grid-cols-7">
          {grid.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="h-20" style={{ borderBottom: `1px solid var(--border-default)`, borderRight: `1px solid var(--border-default)` }} />
            const ds = toISO(day)
            const isToday = ds === todayStr
            const isPast = ds < todayStr
            const daySessions = sessionMap.get(ds) ?? []
            const isLastRow = i >= grid.length - 7
            const isRightEdge = (i + 1) % 7 === 0
            return (
              <div key={ds}
                className="h-20 p-1.5 flex flex-col gap-1 cursor-pointer transition-colors"
                style={{ borderBottom: isLastRow ? 'none' : `1px solid var(--border-default)`, borderRight: isRightEdge ? 'none' : `1px solid var(--border-default)`, background: isToday ? `${accentColor}12` : 'rgba(255,255,255,0.02)' }}
                onClick={() => setSelectedDay(day)}
                onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}18` }}
                onMouseLeave={e => { e.currentTarget.style.background = isToday ? `${accentColor}12` : 'rgba(255,255,255,0.02)' }}
              >
                <span className="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full shrink-0"
                  style={{ color: isToday ? '#fff' : isPast ? 'var(--text-muted)' : 'var(--text-secondary)', background: isToday ? accentColor : 'transparent', boxShadow: isToday ? `0 0 8px ${accentColor}60` : 'none' }}>
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                  {daySessions.slice(0, 2).map(s => {
                    const c = TYPE_CONFIG[s.workout_type] ?? TYPE_CONFIG.OTHER
                    return (
                      <button key={s.id}
                        onClick={e => { e.stopPropagation(); setSelectedSession(s) }}
                        className="rounded px-1 text-[11px] font-bold leading-tight truncate text-left w-full"
                        style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
                        {s.workout_type}{s.title ? ` · ${s.title}` : ''}
                      </button>
                    )
                  })}
                  {daySessions.length > 2 && <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>+{daySessions.length - 2}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {view === 'week' && (
        <div className="overflow-x-auto">
        <div style={{ minWidth: 560 }}>
        {/* DOW headers inside scroll so they move with content */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border-default)' }}>
          {DOW.map((d, i) => {
            const isToday = toISO(weekDates[i]) === todayStr
            return (
              <div key={i} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider"
                style={{ color: isToday ? accentColor : 'var(--text-muted)' }}>
                {d}
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-7 divide-x" style={{ borderColor: 'var(--border-subtle)' }}>
          {weekDates.map((day, i) => {
            const ds = toISO(day)
            const isToday = ds === todayStr
            const isPast = ds < todayStr
            const daySessions = sessionMap.get(ds) ?? []
            return (
              <div key={ds}
                className="min-h-64 p-2 flex flex-col gap-2 cursor-pointer transition-colors"
                style={{ background: isToday ? `${accentColor}12` : 'rgba(255,255,255,0.02)', borderRight: i < 6 ? `1px solid var(--border-default)` : 'none' }}
                onClick={() => setSelectedDay(day)}
                onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}18` }}
                onMouseLeave={e => { e.currentTarget.style.background = isToday ? `${accentColor}12` : 'rgba(255,255,255,0.02)' }}
              >
                {/* Date badge */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: isToday ? accentColor : 'transparent', color: isToday ? '#fff' : isPast ? 'var(--text-muted)' : 'var(--text-secondary)', boxShadow: isToday ? `0 0 10px ${accentColor}50` : 'none' }}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Sessions — full detail */}
                <div className="flex flex-col gap-1.5 flex-1">
                  {daySessions.map(s => {
                    const c = TYPE_CONFIG[s.workout_type] ?? TYPE_CONFIG.OTHER
                    return (
                      <button key={s.id}
                        onClick={e => { e.stopPropagation(); setSelectedSession(s) }}
                        className="rounded-lg p-2 text-left w-full space-y-0.5 transition-opacity"
                        style={{ background: c.bg, border: `1px solid ${c.color}30` }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                      >
                        <div className="text-[11px] font-bold" style={{ color: c.color }}>{s.workout_type}</div>
                        {s.title && <div className="text-[11px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{s.title}</div>}
                        {(s.start_time || s.duration_min) && (
                          <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            {s.start_time && <span>{s.start_time}</span>}
                            {s.start_time && s.duration_min && <span>·</span>}
                            {s.duration_min && <span>{s.duration_min} min</span>}
                          </div>
                        )}
                        {s.notes && <div className="hidden sm:block text-[10px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.notes}</div>}
                      </button>
                    )
                  })}
                  {daySessions.length === 0 && (
                    <div className="flex-1 flex items-center justify-center opacity-20">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-2.5 border-t flex flex-wrap gap-x-3 gap-y-1" style={{ borderColor: 'var(--border-default)' }}>
        {WORKOUT_TYPES.filter(t => sessions.some(s => s.workout_type === t)).map(t => {
          const c = TYPE_CONFIG[t]
          return (
            <div key={t} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: c.color }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <AddSessionPopover
            date={selectedDay}
            onSave={async (date, type, title, notes, duration, startTime) => {
              await saveSession(date, type, title, notes, duration, undefined, startTime)
              setSelectedDay(null)
            }}
            onClose={() => setSelectedDay(null)}
          />
        )}
        {selectedSession && (
          <SessionDetail
            session={selectedSession}
            onSave={async (date, type, title, notes, duration, editId, startTime) => {
              await saveSession(date, type, title, notes, duration, editId, startTime)
              setSelectedSession(null)
            }}
            onDelete={async (id) => {
              await deleteSession(id)
              setSelectedSession(null)
            }}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
