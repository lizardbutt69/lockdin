import { useState } from 'react'
import { Flame } from 'lucide-react'
import type { DayRecord } from '../../hooks/useHabitHistory'
import { calcStreak } from '../../hooks/useHabitHistory'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']
type TrackedField = keyof Pick<DailyLog, 'bible_read' | 'prayed' | 'worked_out'>

interface HabitConfig {
  field: TrackedField
  label: string
  color: string
  colorMuted: string
}

interface HabitTrackerProps {
  records: DayRecord[]
  habits: HabitConfig[]
  loading?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function HabitTracker({ records, habits, loading }: HabitTrackerProps) {
  const [tooltip, setTooltip] = useState<{ date: string; field: string; done: boolean } | null>(null)
  const today = new Date().toISOString().split('T')[0]

  if (loading) return null

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Habit Tracker
          </h3>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>28 days</span>
        </div>

        <div className="space-y-2">
          {habits.map(habit => {
            const streak = calcStreak(records, habit.field)
            return (
              <div key={habit.field} className="flex items-center gap-3">
                {/* Label */}
                <span className="text-[11px] font-medium w-16 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {habit.label}
                </span>

                {/* Dot row */}
                <div className="flex gap-0.5 flex-1">
                  {records.map(rec => {
                    const done = !!rec.log?.[habit.field]
                    const isToday = rec.date === today
                    const isFuture = rec.date > today

                    return (
                      <div
                        key={rec.date}
                        className="relative flex-1"
                        onMouseEnter={() => setTooltip({ date: rec.date, field: habit.label, done })}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <div
                          className="rounded-sm transition-all duration-150"
                          style={{
                            height: 14,
                            background: isFuture ? 'transparent' : done ? habit.color : habit.colorMuted,
                            outline: isToday ? `1.5px solid ${habit.color}` : 'none',
                            outlineOffset: 1,
                            opacity: isFuture ? 0 : 1,
                          }}
                        />
                        {tooltip?.date === rec.date && tooltip?.field === habit.label && (
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap z-10 pointer-events-none"
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            {formatDate(rec.date)} · {done ? '✓ Done' : '✗ Missed'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 shrink-0">
                  <Flame className="w-3 h-3" style={{ color: streak > 0 ? '#f59e0b' : 'var(--text-muted)' }} />
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: streak > 0 ? '#d97706' : 'var(--text-muted)' }}>
                    {streak}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
