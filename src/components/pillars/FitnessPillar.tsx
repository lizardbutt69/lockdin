import { Dumbbell } from 'lucide-react'
import type { Database } from '../../types/database'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import TrainingCalendar from './TrainingCalendar'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface FitnessPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
  weeklyWorkouts: number
  weeklyTarget?: number
}

const ACCENT = '#ea580c'

export default function FitnessPillar({ log }: FitnessPillarProps) {
  if (!log) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)' }}>
          <Dumbbell className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        </div>
        <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Health & Fitness</span>
      </div>
      <TrainingCalendar accentColor={ACCENT} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PillarGoals category="Fitness" accentColor={ACCENT} accentBg="rgba(234,88,12,0.06)" accentBorder="rgba(234,88,12,0.2)" />
        <PillarHabitTracker pillar="Fitness" accentColor={ACCENT} accentMuted="rgba(234,88,12,0.15)" compact />
      </div>
    </div>
  )
}
