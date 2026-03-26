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
      <TrainingCalendar accentColor={ACCENT} />
      <PillarGoals category="Fitness" accentColor={ACCENT} accentBg="rgba(234,88,12,0.06)" accentBorder="rgba(234,88,12,0.2)" />
      <PillarHabitTracker pillar="Fitness" accentColor={ACCENT} accentMuted="rgba(234,88,12,0.15)" />
    </div>
  )
}
