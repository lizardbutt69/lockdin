import { Dumbbell, Target, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import TacticalCard from '../ui/TacticalCard'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface FitnessPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
  weeklyWorkouts: number
  weeklyTarget?: number
}

const WORKOUT_TYPES = ['RUN', 'LIFT', 'HYROX', 'CYCLE', 'SWIM', 'HIIT', 'YOGA', 'WALK', 'OTHER']

export default function FitnessPillar({ log, onUpdate, weeklyWorkouts, weeklyTarget = 5 }: FitnessPillarProps) {
  const [_showWorkoutForm, setShowWorkoutForm] = useState(false)

  if (!log) return null

  const weeklyPct = Math.min(100, Math.round((weeklyWorkouts / weeklyTarget) * 100))
  const status = log.worked_out ? 'green' : weeklyPct >= 60 ? 'amber' : 'red'

  return (
    <div className="space-y-4">
    <TacticalCard status={status}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Dumbbell className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
            </div>
            <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Fitness</span>
          </div>
          <div className="text-right">
            <div className={`font-['Inter'] text-lg font-bold ${status === 'green' ? 'text-[#00ff41] glow-green' : status === 'amber' ? 'text-[#ff9500]' : 'text-[#ff2d2d]'}`}>
              {weeklyWorkouts}/{weeklyTarget}
            </div>
            <div className="text-[#94a3b8] font-mono text-[10px]">THIS WEEK</div>
          </div>
        </div>

        {/* Today's workout toggle */}
        <button
          onClick={() => {
            onUpdate({ worked_out: !log.worked_out })
            if (!log.worked_out) setShowWorkoutForm(true)
          }}
          className={`toggle-btn mb-2 ${log.worked_out ? 'active' : ''}`}
        >
          <Dumbbell className="w-3 h-3 shrink-0" />
          <span className="font-mono text-xs tracking-wider">TRAINED TODAY</span>
          <span className={`ml-auto font-mono text-xs font-bold ${log.worked_out ? 'text-[#00ff41]' : 'text-[#2a3441]'}`}>
            {log.worked_out ? '✓' : '○'}
          </span>
        </button>

        {/* Workout details */}
        {log.worked_out && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5 mb-2"
          >
            <div className="flex gap-1.5">
              <select
                value={log.workout_type || ''}
                onChange={e => onUpdate({ workout_type: e.target.value })}
                className="tactical-input flex-1"
              >
                <option value="">TYPE</option>
                {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="number"
                placeholder="MIN"
                value={log.workout_duration || ''}
                onChange={e => onUpdate({ workout_duration: Number(e.target.value) })}
                className="tactical-input w-16"
              />
              <input
                type="number"
                placeholder="RPE"
                min="1" max="10"
                value={log.workout_rpe || ''}
                onChange={e => onUpdate({ workout_rpe: Number(e.target.value) })}
                className="tactical-input w-14"
              />
            </div>
            {log.workout_type && log.workout_duration && (
              <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-[10px]">
                <Target className="w-3 h-3" />
                <span>{log.workout_type} — {log.workout_duration}min @ RPE {log.workout_rpe || '?'}/10</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Weekly progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-[#94a3b8] font-mono text-[10px] mb-1">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> WEEKLY TARGET</span>
            <span>{weeklyPct}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${weeklyPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                background: status === 'green' ? '#00ff41' : status === 'amber' ? '#ff9500' : '#ff2d2d',
                boxShadow: `0 0 6px ${status === 'green' ? 'rgba(0,255,65,0.6)' : status === 'amber' ? 'rgba(255,149,0,0.6)' : 'rgba(255,45,45,0.6)'}`,
              }}
            />
          </div>
        </div>
      </div>
    </TacticalCard>
    <PillarGoals category="Fitness" accentColor="#ea580c" accentBg="#fff7ed" accentBorder="#fed7aa" />
    <PillarHabitTracker pillar="Fitness" accentColor="#ea580c" accentMuted="rgba(234,88,12,0.15)" />
    </div>
  )
}
