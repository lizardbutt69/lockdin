import { useState } from 'react'
import { Flame, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useCustomHabits, { type HabitDef, type DayRecord } from '../../hooks/useCustomHabits'

interface PillarHabitTrackerProps {
  pillar: string
  accentColor?: string
  accentMuted?: string
}

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getWeekDates(): string[] {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function calcStreak(history: DayRecord[]): number {
  for (let i = history.length - 1; i >= 0; i--) {
    if (!history[i].completed) return history.length - 1 - i
  }
  return history.length
}

function freqLabel(freq: string) {
  if (freq === 'weekly') return 'wk'
  if (freq === 'monthly') return 'mo'
  return null
}

// ─── HabitRow must be defined OUTSIDE PillarHabitTracker so React never
//     treats it as a new component type on re-render (which would cause
//     unmount/remount and double-animation on every toggle).
interface HabitRowProps {
  habit: HabitDef
  done: boolean
  history: DayRecord[]
  accentColor: string
  muted: string
  today: string
  weekDates: string[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function HabitRow({ habit, done, history, accentColor, muted, today, weekDates, onToggle, onRemove }: HabitRowProps) {
  const streak = calcStreak(history)
  const label = freqLabel(habit.frequency)
  const isCustom = !habit.isDefault
  const historyMap = new Map(history.map(r => [r.date, r.completed]))

  return (
    <motion.div
      layout
      className="flex items-center gap-3 group py-1"
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(habit.id)}
        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
        style={{
          background: done ? accentColor : 'transparent',
          border: `2px solid ${done ? accentColor : 'var(--border-default)'}`,
          boxShadow: done ? `0 0 8px ${accentColor}50` : 'none',
        }}
      >
        {done && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Name + freq badge */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span
          className="text-sm truncate transition-colors"
          style={{
            color: done ? 'var(--text-muted)' : 'var(--text-secondary)',
            textDecoration: done ? 'line-through' : 'none',
          }}
          title={habit.name}
        >
          {habit.name}
        </span>
        {label && (
          <span className="text-[11px] px-1 py-0.5 rounded shrink-0" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            {label}
          </span>
        )}
      </div>

      {/* Weekly dots: Mon–Sun */}
      <div className="flex items-center gap-0.5 shrink-0">
        {weekDates.map((date) => {
          const isT = date === today
          const isFuture = date > today
          const isDone = historyMap.get(date) ?? false
          return (
            <div key={date} className="flex flex-col items-center gap-0.5">
              <div
                className="w-3.5 h-3.5 rounded-full transition-all duration-150"
                style={{
                  background: isFuture ? 'transparent' : isDone ? accentColor : muted,
                  border: isT ? `2px solid ${accentColor}` : '2px solid transparent',
                  opacity: isFuture ? 0.2 : 1,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Streak */}
      <div className="flex items-center gap-0.5 shrink-0 w-8">
        {streak > 0 && (
          <>
            <Flame className="w-3 h-3 shrink-0" style={{ color: '#f59e0b' }} />
            <span className="text-xs font-semibold tabular-nums" style={{ color: '#d97706' }}>{streak}</span>
          </>
        )}
      </div>

      {/* Delete custom */}
      {isCustom ? (
        <button
          onClick={() => onRemove(habit.id)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      ) : <div className="w-4 shrink-0" />}
    </motion.div>
  )
}

export default function PillarHabitTracker({ pillar, accentColor = '#22c55e', accentMuted }: PillarHabitTrackerProps) {
  const muted = accentMuted ?? `${accentColor}25`
  const { habits, isToday, toggle, addHabit, removeHabit, getHistory } = useCustomHabits(pillar)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [showHistory, setShowHistory] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const weekDates = getWeekDates()
  const completedToday = habits.filter(h => isToday(h.id)).length

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    addHabit(newName.trim(), newFreq)
    setNewName('')
    setNewFreq('daily')
    setShowForm(false)
  }

  if (habits.length === 0) return null

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold font-['Space_Grotesk'] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Habits
          </h3>
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: completedToday === habits.length ? accentColor : 'var(--text-muted)' }}
          >
            {completedToday}/{habits.length}
          </span>
        </div>
        {/* Day-of-week labels aligned with dots */}
        <div className="flex items-center gap-0.5 mr-12">
          {DOW.map((d, i) => (
            <div
              key={i}
              className="w-3.5 text-center text-[10px] font-semibold"
              style={{ color: weekDates[i] === today ? accentColor : 'var(--text-muted)' }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Habit rows */}
      <div className="px-4 py-2 space-y-0.5">
        <AnimatePresence initial={false}>
          {habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              done={isToday(habit.id)}
              history={getHistory(habit.id)}
              accentColor={accentColor}
              muted={muted}
              today={today}
              weekDates={weekDates}
              onToggle={toggle}
              onRemove={removeHabit}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 28-day history toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowHistory(v => !v)}
          className="flex items-center gap-1 text-xs transition-colors mt-1"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showHistory ? 'Hide' : '28-day history'}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-1.5"
            >
              {habits.map(habit => {
                const history = getHistory(habit.id)
                const streak = calcStreak(history)
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-xs shrink-0 truncate" style={{ color: 'var(--text-muted)', width: 120 }} title={habit.name}>
                      {habit.name}
                    </span>
                    <div className="flex gap-px flex-1">
                      {history.map(rec => (
                        <div
                          key={rec.date}
                          className="flex-1 rounded-sm"
                          style={{
                            height: 10,
                            background: rec.date > today ? 'transparent' : rec.completed ? accentColor : muted,
                            opacity: rec.date > today ? 0 : 1,
                          }}
                          title={rec.date}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Flame className="w-2.5 h-2.5" style={{ color: streak > 0 ? '#f59e0b' : 'var(--text-muted)' }} />
                      <span className="text-[10px] tabular-nums" style={{ color: streak > 0 ? '#d97706' : 'var(--text-muted)' }}>{streak}</span>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add habit */}
      <div className="px-4 pb-3 border-t pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
        {showForm ? (
          <form onSubmit={handleAdd} className="flex gap-1.5">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setShowForm(false)}
              placeholder="Habit name..."
              className="flex-1 px-2.5 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
            <select
              value={newFreq}
              onChange={e => setNewFreq(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="text-[11px] rounded-lg outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', padding: '4px 6px' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button type="submit" className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0" style={{ background: accentColor }}>
              Add
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = accentColor}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Plus className="w-3.5 h-3.5" />
            Add custom habit
          </button>
        )}
      </div>
    </div>
  )
}
