import { Plus, CheckCircle, Plane, ChevronDown, ChevronUp, Trash2, Check, MapPin, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type Trip = Database['public']['Tables']['trips']['Row']

const DEFAULT_CHECKLIST = [
  { id: 'flights',     label: 'Book flights' },
  { id: 'hotel',       label: 'Book accommodation' },
  { id: 'insurance',   label: 'Travel insurance' },
  { id: 'passport',    label: 'Check passport / visa' },
  { id: 'bank',        label: 'Notify bank' },
  { id: 'currency',    label: 'Get local currency' },
  { id: 'packing',     label: 'Pack bags' },
  { id: 'itinerary',   label: 'Plan itinerary' },
]

const STATUS_CONFIG = {
  planning:  { label: 'Planning', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
  booked:    { label: 'Booked',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
  completed: { label: 'Done',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)'   },
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getChecked(tripId: string): string[] {
  try { return JSON.parse(localStorage.getItem(`lockedin_trip_cl_${tripId}`) || '[]') }
  catch { return [] }
}

function saveChecked(tripId: string, ids: string[]) {
  localStorage.setItem(`lockedin_trip_cl_${tripId}`, JSON.stringify(ids))
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState<string[]>(() => getChecked(trip.id))

  const s = STATUS_CONFIG[trip.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.planning
  const days = daysUntil(trip.start_date)
  const done = checked.length
  const total = DEFAULT_CHECKLIST.length
  const pct = Math.round((done / total) * 100)

  function toggle(id: string) {
    const next = checked.includes(id) ? checked.filter(c => c !== id) : [...checked, id]
    setChecked(next)
    saveChecked(trip.id, next)
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Plane className="w-4 h-4" style={{ color: '#3b82f6' }} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm font-['Plus_Jakarta_Sans'] truncate" style={{ color: 'var(--text-primary)' }}>
              {trip.destination}
            </div>
            {(trip.start_date || trip.end_date) && (
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                <Calendar className="w-3 h-3 shrink-0" />
                {formatDate(trip.start_date)}
                {trip.end_date && <span>→ {formatDate(trip.end_date)}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
          >
            {s.label}
          </span>
          <button
            onClick={() => onDelete(trip.id)}
            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Meta row: budget + countdown */}
      <div className="flex items-center gap-3 flex-wrap">
        {trip.budget && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            ${Number(trip.budget).toLocaleString()} budget
          </span>
        )}
        {days !== null && trip.status !== 'completed' && (
          <span
            className="text-xs font-semibold"
            style={{ color: days <= 7 ? '#f59e0b' : '#3b82f6' }}
          >
            {days > 0 ? `${days} days away` : days === 0 ? '✈ Departing today!' : '✈ In progress'}
          </span>
        )}
        {trip.status === 'completed' && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#22c55e' }}>
            <CheckCircle className="w-3 h-3" /> Trip complete
          </span>
        )}
      </div>

      {/* Checklist progress */}
      <div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between mb-1.5"
        >
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Pre-trip checklist
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: done === total ? '#22c55e' : 'var(--text-muted)' }}>
              {done}/{total}
            </span>
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
          </div>
        </button>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ background: done === total ? '#22c55e' : '#3b82f6' }}
          />
        </div>
      </div>

      {/* Expanded checklist */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {DEFAULT_CHECKLIST.map(item => {
                const isDone = checked.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-center gap-2.5 py-1 text-left"
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                      style={{
                        border: `1.5px solid ${isDone ? '#22c55e' : 'var(--border-default)'}`,
                        background: isDone ? '#22c55e' : 'transparent',
                      }}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TripsPillar() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ destination: '', start_date: '', end_date: '', budget: '', status: 'planning' })

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true })
      .then(({ data }) => { if (data) setTrips(data) })
  }, [user])

  const addTrip = async () => {
    if (!user || !form.destination.trim()) return
    const payload = {
      user_id: user.id,
      destination: form.destination.trim().toUpperCase(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: Number(form.budget) || null,
      status: form.status,
      notes: null,
    }
    if (!isSupabaseConfigured) {
      const demo: Trip = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      setTrips(t => [...t, demo].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')))
    } else {
      const { data } = await supabase.from('trips').insert(payload).select().single()
      if (data) setTrips(t => [...t, data].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')))
    }
    setForm({ destination: '', start_date: '', end_date: '', budget: '', status: 'planning' })
    setShowAdd(false)
  }

  const deleteTrip = async (id: string) => {
    if (!confirm('Remove this trip?')) return
    setTrips(t => t.filter(x => x.id !== id))
    if (isSupabaseConfigured) await supabase.from('trips').delete().eq('id', id)
    localStorage.removeItem(`lockedin_trip_cl_${id}`)
  }

  const completed = trips.filter(t => t.status === 'completed').length
  const upcoming = trips.filter(t => t.status !== 'completed')
  const nextTrip = upcoming[0]
  const daysToNext = nextTrip ? daysUntil(nextTrip.start_date) : null

  return (
    <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <Plane className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
      </div>
      <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Trips</span>
    </div>
    <div className="grid grid-cols-3 gap-4 items-start">
      {/* LEFT 2/3 — one big trips box */}
      <div className="col-span-2">
        <div className="card p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <Plane className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <span className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Trips</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  {completed} completed · {upcoming.length} upcoming
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {daysToNext !== null && daysToNext >= 0 && (
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: '#3b82f6' }}>{daysToNext}d</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>next trip</div>
                </div>
              )}
              <button
                onClick={() => setShowAdd(s => !s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: showAdd ? '#f0fdf4' : 'var(--bg-subtle)',
                  border: `1px solid ${showAdd ? '#bbf7d0' : 'var(--border-default)'}`,
                  color: showAdd ? '#15803d' : 'var(--text-secondary)',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add trip
              </button>
            </div>
          </div>

          {/* Add form */}
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2.5" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <input
                    type="text"
                    placeholder="Destination (e.g. Tokyo, Japan)"
                    value={form.destination}
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    className="tactical-input"
                    onKeyDown={e => e.key === 'Enter' && addTrip()}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Departure</label>
                      <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="tactical-input" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Return</label>
                      <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="tactical-input" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Budget ($)</label>
                      <input type="number" placeholder="2500" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="tactical-input" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="tactical-input">
                        <option value="planning">Planning</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addTrip} className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all" style={{ background: '#3b82f6' }}>
                      Add trip
                    </button>
                    <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm transition-all" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trip list */}
          {trips.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <MapPin className="w-8 h-8 mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No trips planned yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add your first trip above</p>
            </div>
          ) : (
            <div className="space-y-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT 1/3 — Goals + Habits */}
      <div className="col-span-1 space-y-4">
        <PillarGoals category="Travel" accentColor="#3b82f6" accentBg="rgba(59,130,246,0.06)" accentBorder="rgba(59,130,246,0.2)" />
        <PillarHabitTracker pillar="Travel" accentColor="#3b82f6" accentMuted="rgba(59,130,246,0.15)" compact />
      </div>
    </div>
    </div>
  )
}
