import { useRef, useState } from 'react'
import { Flame, Plus, Trash2, ChevronDown, ChevronUp, Trophy, Pencil, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useCustomHabits, { type HabitDef, type DayRecord } from '../../hooks/useCustomHabits'

interface PillarHabitTrackerProps {
  pillar: string
  accentColor?: string
  accentMuted?: string
  compact?: boolean
}

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DOT_SIZE = 'w-3.5 h-3.5'
const DOT_W = 'w-3.5'

function getWeekDates(): string[] {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function calcStreak(history: DayRecord[], today: string): number {
  const past = history.filter(r => r.date <= today).reverse()
  let streak = 0
  for (const r of past) {
    if (r.completed) streak++
    else break
  }
  return streak
}

function calcTotal(history: DayRecord[], today: string): number {
  return history.filter(r => r.completed && r.date <= today).length
}

// Rank based on total completions in last 28 days
function getRank(total: number): { label: string; color: string; bg: string } | null {
  if (total >= 26) return { label: 'ACE',    color: '#00ff41', bg: 'rgba(0,255,65,0.12)' }
  if (total >= 20) return { label: 'ELITE',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  if (total >= 14) return { label: 'SOLID',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' }
  if (total >= 7)  return { label: 'ACTIVE', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }
  if (total >= 1)  return { label: 'ROOKIE', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'  }
  return null
}

// Streak flame size/intensity
function flameStyle(streak: number): { size: string; color: string } {
  if (streak >= 21) return { size: 'w-4 h-4', color: '#ef4444' }
  if (streak >= 14) return { size: 'w-4 h-4', color: '#f97316' }
  if (streak >= 7)  return { size: 'w-3.5 h-3.5', color: '#f59e0b' }
  return { size: 'w-3 h-3', color: '#d97706' }
}

// ─── HabitRow ────────────────────────────────────────────────────────────────

interface HabitRowProps {
  habit: HabitDef
  done: boolean
  history: DayRecord[]
  accentColor: string
  muted: string
  today: string
  weekDates: string[]
  compact: boolean
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onEdit: (id: string, name: string, frequency: 'daily' | 'weekly' | 'monthly') => void
}

function HabitRow({ habit, done, history, accentColor, muted, today, weekDates, compact, onToggle, onRemove, onEdit }: HabitRowProps) {
  const streak = calcStreak(history, today)
  const total = calcTotal(history, today)
  const rank = getRank(total)
  const flame = streak > 0 ? flameStyle(streak) : null
  const historyMap = new Map(history.map(r => [r.date, r.completed]))

  // XP pop animation
  const [popKey, setPopKey] = useState(0)
  const [popping, setPopping] = useState(false)
  const prevDone = useRef(done)

  // Inline edit state
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(habit.name)
  const [editFreq, setEditFreq] = useState(habit.frequency)

  function handleToggle() {
    const becomingDone = !done
    if (becomingDone) {
      setPopKey(k => k + 1)
      setPopping(true)
      setTimeout(() => setPopping(false), 700)
    }
    prevDone.current = becomingDone
    onToggle(habit.id)
  }

  function openEdit() {
    setEditName(habit.name)
    setEditFreq(habit.frequency)
    setEditing(true)
  }

  function saveEdit() {
    if (editName.trim()) onEdit(habit.id, editName.trim(), editFreq)
    setEditing(false)
  }

  if (editing) {
    return (
      <motion.div layout className="flex items-center gap-2 py-1.5">
        <input
          autoFocus
          value={editName}
          onChange={e => setEditName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
          className="flex-1 px-2 py-1 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-input)', border: `1px solid ${accentColor}60`, color: 'var(--text-primary)' }}
        />
        <select
          value={editFreq}
          onChange={e => setEditFreq(e.target.value as 'daily' | 'weekly' | 'monthly')}
          className="text-[11px] rounded-lg outline-none"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', padding: '4px 6px' }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={saveEdit} className="p-1 rounded" style={{ color: accentColor }}>
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div layout className="flex items-center gap-1.5 group py-1.5 overflow-hidden">

      {/* Checkbox with XP pop */}
      <div className="relative shrink-0">
        <button
          onClick={handleToggle}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150"
          style={{
            background: done ? accentColor : 'transparent',
            border: `2px solid ${done ? accentColor : 'var(--border-default)'}`,
            boxShadow: done ? `0 0 10px ${accentColor}60` : 'none',
          }}
        >
          {done && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <AnimatePresence>
          {popping && (
            <motion.div
              key={popKey}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -28, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 bottom-full pointer-events-none z-10"
            >
              <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}` }}>
                +10 XP
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name + rank badge */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span
          className="text-sm truncate transition-colors"
          style={{ color: done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: done ? 'line-through' : 'none' }}
          title={habit.name}
        >
          {habit.name}
        </span>
        {rank && (
          <span
            className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0 tracking-wider"
            style={{ color: rank.color, background: rank.bg, border: `1px solid ${rank.color}30` }}
          >
            {rank.label}
          </span>
        )}
      </div>

      {/* Weekly dots — hidden on mobile and in compact mode */}
      <div className={`${compact ? 'hidden' : 'hidden sm:flex'} items-center gap-0.5 shrink-0`}>
        {weekDates.map((date) => {
          const isT = date === today
          const isFuture = date > today
          const isDone = historyMap.get(date) ?? false
          return (
            <div
              key={date}
              className={`${DOT_SIZE} rounded-full transition-all duration-150`}
              style={{
                background: isFuture ? 'transparent' : isDone ? accentColor : muted,
                border: isT ? `2px solid ${accentColor}` : '2px solid transparent',
                opacity: isFuture ? 0.15 : 1,
                boxShadow: isDone && isT ? `0 0 6px ${accentColor}80` : 'none',
              }}
            />
          )
        })}
      </div>

      {/* Streak — only takes space when active */}
      {streak > 0 && flame && (
        <div className="flex items-center gap-0.5 shrink-0">
          <Flame className={`${flame.size} shrink-0`} style={{ color: flame.color }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: flame.color }}>{streak}</span>
        </div>
      )}

      {/* Edit + Delete — visible on hover for all habits */}
      <div className="flex items-center gap-0.5 opacity-40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={openEdit}
          className="p-0.5 rounded"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = accentColor}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onRemove(habit.id)}
          className="p-0.5 rounded"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PillarHabitTracker({ pillar, accentColor = '#22c55e', accentMuted, compact = false }: PillarHabitTrackerProps) {
  const muted = accentMuted ?? `${accentColor}25`
  const { habits, isToday, toggle, addHabit, removeHabit, editHabit, getHistory } = useCustomHabits(pillar)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [showHistory, setShowHistory] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const weekDates = getWeekDates()
  const completedToday = habits.filter(h => isToday(h.id)).length
  const allClear = habits.length > 0 && completedToday === habits.length

  function handleAdd(e: React.SyntheticEvent) {
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
          <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
            Habits
          </h3>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: allClear ? accentColor : 'var(--text-muted)' }}
          >
            {completedToday}/{habits.length}
          </span>
        </div>
        {/* Day labels — hidden on mobile and in compact mode */}
        <div className={`${compact ? 'hidden' : 'hidden sm:flex'} items-center gap-2 shrink-0`}>
          <div className="flex items-center gap-0.5">
            {DOW.map((d, i) => (
              <div
                key={i}
                className={`${DOT_W} text-center text-[10px] font-bold`}
                style={{ color: weekDates[i] === today ? accentColor : 'var(--text-muted)' }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perfect day banner */}
      <AnimatePresence>
        {allClear && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: `${accentColor}12`, borderBottom: `1px solid ${accentColor}30` }}
            >
              <Trophy className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
              <div>
                <p className="text-xs font-bold" style={{ color: accentColor }}>PILLAR CLEARED</p>
                <p className="text-[10px]" style={{ color: `${accentColor}99` }}>All habits done today · +50 XP bonus</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="ml-auto text-lg"
              >
                ⚡
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit rows */}
      <div className="px-4 py-2 space-y-0">
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
              compact={compact}
              onToggle={toggle}
              onRemove={removeHabit}
              onEdit={editHabit}
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
              className="mt-2 space-y-2"
            >
              {habits.map(habit => {
                const history = getHistory(habit.id)
                const streak = calcStreak(history, today)
                const total = calcTotal(history, today)
                const rank = getRank(total)
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-xs shrink-0 truncate" style={{ color: 'var(--text-muted)', width: 100 }} title={habit.name}>
                      {habit.name}
                    </span>
                    {rank && (
                      <span
                        className="text-[9px] font-bold px-1 rounded shrink-0"
                        style={{ color: rank.color, background: rank.bg }}
                      >
                        {rank.label}
                      </span>
                    )}
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
