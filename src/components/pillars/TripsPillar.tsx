import { MapPin, Plus, Clock, CheckCircle, Plane } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TacticalCard from '../ui/TacticalCard'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type Trip = Database['public']['Tables']['trips']['Row']

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const STATUS_COLORS: Record<string, string> = {
  planning: '#ff9500',
  booked: '#00b4d8',
  completed: '#00ff41',
}

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
    if (!isSupabaseConfigured) {
      const demoTrip: Trip = {
        id: crypto.randomUUID(),
        user_id: user.id,
        destination: form.destination.toUpperCase(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: Number(form.budget) || null,
        status: form.status,
        notes: null,
        created_at: new Date().toISOString(),
      }
      setTrips(t => [...t, demoTrip].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')))
      setForm({ destination: '', start_date: '', end_date: '', budget: '', status: 'planning' })
      setShowAdd(false)
      return
    }
    const { data } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        destination: form.destination.toUpperCase(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: Number(form.budget) || null,
        status: form.status,
      })
      .select()
      .single()
    if (data) {
      setTrips(t => [...t, data].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')))
      setForm({ destination: '', start_date: '', end_date: '', budget: '', status: 'planning' })
      setShowAdd(false)
    }
  }

  const completed = trips.filter(t => t.status === 'completed').length
  const upcoming = trips.filter(t => t.status !== 'completed')
  const nextTrip = upcoming[0]
  const daysToNext = nextTrip ? daysUntil(nextTrip.start_date) : null

  const status: 'green' | 'amber' | 'red' = completed > 0 ? 'green' : upcoming.length > 0 ? 'amber' : 'red'

  return (
    <div className="space-y-4">
    <TacticalCard status={status}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Plane className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
            </div>
            <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Trips</span>
          </div>
          <div className="flex items-center gap-2">
            {daysToNext !== null && (
              <div className="text-right">
                <div className="font-['Inter'] text-xs text-[#00b4d8]">{daysToNext}d</div>
                <div className="text-[#94a3b8] font-mono text-[9px]">NEXT MISSION</div>
              </div>
            )}
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="rounded-lg p-1.5 transition-all text-[#4a5568] hover:text-[#00ff41]" style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-1.5"
            >
              <input
                type="text"
                placeholder="DESTINATION"
                value={form.destination}
                onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                className="tactical-input w-full"
              />
              <div className="flex gap-1.5">
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="tactical-input flex-1" />
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="tactical-input flex-1" />
              </div>
              <div className="flex gap-1.5">
                <input type="number" placeholder="BUDGET $" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="tactical-input flex-1" />
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="tactical-input flex-1">
                  <option value="planning">PLANNING</option>
                  <option value="booked">BOOKED</option>
                  <option value="completed">COMPLETED</option>
                </select>
              </div>
              <button onClick={addTrip} className="w-full rounded-lg bg-[#00ff41]/10 text-[#00ff41] font-mono text-xs py-2 hover:bg-[#00ff41]/18 transition-all" style={{ border: '1px solid rgba(0,255,65,0.3)' }}>
                + ADD MISSION
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trip list */}
        <div className="space-y-1">
          {trips.slice(0, 3).map(trip => {
            const days = daysUntil(trip.start_date)
            return (
              <div key={trip.id} className="flex items-center gap-2 py-1.5 last:pb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-1.5 h-1.5 shrink-0" style={{ background: STATUS_COLORS[trip.status] || '#94a3b8' }} />
                <div className="flex-1 min-w-0">
                  <div className="font-['Inter'] text-xs text-[#e2e8f0] truncate flex items-center gap-1">
                    <Plane className="w-2.5 h-2.5 shrink-0 text-[#94a3b8]" />
                    {trip.destination}
                  </div>
                  {trip.start_date && (
                    <div className="text-[#94a3b8] font-mono text-[9px]">
                      {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
                {days !== null && trip.status !== 'completed' && (
                  <div className="text-[#00b4d8] font-['Inter'] text-[10px] shrink-0 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {days > 0 ? `${days}d` : 'NOW'}
                  </div>
                )}
                {trip.status === 'completed' && (
                  <CheckCircle className="w-3 h-3 text-[#00ff41] shrink-0" />
                )}
              </div>
            )
          })}
          {trips.length === 0 && (
            <div className="text-[#2a3441] font-mono text-xs text-center py-2">
              NO MISSIONS PLANNED
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-[#94a3b8] font-mono text-[10px] flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {completed} COMPLETED / {trips.length} TOTAL
          </span>
        </div>
      </div>
    </TacticalCard>
    <PillarGoals category="Travel" accentColor="#0d9488" accentBg="#f0fdfa" accentBorder="#99f6e4" />
    <PillarHabitTracker pillar="Travel" accentColor="#0d9488" accentMuted="rgba(13,148,136,0.15)" />
    </div>
  )
}
