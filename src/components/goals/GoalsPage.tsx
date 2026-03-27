import { useState, useRef, useEffect } from 'react'
import { Target, Plus, CheckCircle2, Circle, ChevronDown, Trash2, X, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoals, type SubGoal } from '../../hooks/useGoals'

// ─── Config ───────────────────────────────────────────────────────────────────

const PILLARS = [
  { key: 'God',           color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)' },
  { key: 'Finances',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.3)'  },
  { key: 'Career',        color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.3)'  },
  { key: 'Relationships', color: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)' },
  { key: 'Fitness',       color: '#ea580c', bg: 'rgba(234,88,12,0.12)',  border: 'rgba(234,88,12,0.3)'  },
  { key: 'Trips',         color: '#0284c7', bg: 'rgba(2,132,199,0.12)',  border: 'rgba(2,132,199,0.3)'  },
]

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; sort: number }> = {
  p1: { label: 'P1', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  sort: 0 },
  p2: { label: 'P2', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', sort: 1 },
  p3: { label: 'P3', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)', sort: 2 },
}

function pillarConfig(cat: string | null) {
  return PILLARS.find(p => p.key === cat) ?? { color: 'var(--text-muted)', bg: 'var(--bg-subtle)', border: 'var(--border-default)' }
}

function isOverdue(target_date: string | null): boolean {
  if (!target_date) return false
  return target_date < new Date().toISOString().slice(0, 10)
}

function formatDate(d: string): string {
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(d: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(d + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

// ─── Add Goal Modal ────────────────────────────────────────────────────────────

interface AddGoalModalProps {
  onClose: () => void
  onAdd: (title: string, category: string, priority: string, target_date: string) => void
}

function AddGoalModal({ onClose, onAdd }: AddGoalModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(PILLARS[0].key)
  const [priority, setPriority] = useState('p2')
  const [dueDate, setDueDate] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), category, priority, dueDate)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-xl p-5 space-y-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>New Goal</h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Goal</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="tactical-input w-full"
            />
          </div>

          {/* Pillar */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Pillar</label>
            <div className="flex flex-wrap gap-1.5">
              {PILLARS.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setCategory(p.key)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: category === p.key ? p.bg : 'var(--bg-subtle)',
                    color: category === p.key ? p.color : 'var(--text-muted)',
                    border: `1px solid ${category === p.key ? p.border : 'var(--border-default)'}`,
                  }}
                >
                  {p.key}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Priority</label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: priority === key ? cfg.bg : 'var(--bg-subtle)',
                    color: priority === key ? cfg.color : 'var(--text-muted)',
                    border: `1px solid ${priority === key ? cfg.border : 'var(--border-default)'}`,
                  }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Due Date (optional)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="tactical-input w-full" />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#2563eb' }}
            >
              Add Goal
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Goal Row ─────────────────────────────────────────────────────────────────

interface GoalRowProps {
  goal: ReturnType<typeof useGoals>['goals'][number]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdateNotes: (id: string, notes: string) => void
  onUpdateSubGoals: (id: string, subs: SubGoal[]) => void
  onUpdatePriority: (id: string, p: string | null) => void
  onUpdateDueDate: (id: string, d: string | null) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

function GoalRow({ goal, onToggle, onDelete, onUpdateNotes, onUpdateSubGoals, onUpdatePriority, onUpdateDueDate, isExpanded, onToggleExpand }: GoalRowProps) {
  const pc = pillarConfig(goal.category)
  const prio = goal.priority ? PRIORITY_CONFIG[goal.priority] : null
  const overdue = !goal.is_completed && isOverdue(goal.target_date)
  const subs = goal.sub_goals ?? []
  const subsDone = subs.filter(s => s.is_completed).length
  const [newSub, setNewSub] = useState('')

  function addSub() {
    if (!newSub.trim()) return
    onUpdateSubGoals(goal.id, [...subs, { id: `sg_${Date.now()}`, title: newSub.trim(), is_completed: false }])
    setNewSub('')
  }

  function toggleSub(subId: string) {
    onUpdateSubGoals(goal.id, subs.map(s => s.id === subId ? { ...s, is_completed: !s.is_completed } : s))
  }

  function deleteSub(subId: string) {
    onUpdateSubGoals(goal.id, subs.filter(s => s.id !== subId))
  }

  const dayCount = goal.target_date && !goal.is_completed ? daysUntil(goal.target_date) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isExpanded ? pc.color + '40' : 'var(--border-default)'}`,
        transition: 'border-color 0.15s',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3 group">
        {/* Checkbox */}
        <button onClick={() => onToggle(goal.id)} className="shrink-0 transition-colors">
          {goal.is_completed
            ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: '#16a34a' }} />
            : <Circle className="w-4.5 h-4.5" style={{ color: 'var(--border-default)' }} />}
        </button>

        {/* Priority badge */}
        {prio && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
            style={{ color: prio.color, background: prio.bg, border: `1px solid ${prio.border}` }}
          >
            {prio.label}
          </span>
        )}

        {/* Title + meta */}
        <button type="button" onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
          <p
            className="text-sm font-medium leading-tight truncate"
            style={{
              color: goal.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: goal.is_completed ? 'line-through' : 'none',
            }}
          >
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {subs.length > 0 && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {subsDone}/{subs.length} sub-goals
              </span>
            )}
          </div>
        </button>

        {/* Right side meta */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Due date */}
          {goal.target_date && !goal.is_completed && (
            <div className="flex items-center gap-1" style={{ color: overdue ? '#ef4444' : dayCount !== null && dayCount <= 14 ? '#f59e0b' : 'var(--text-muted)' }}>
              {overdue && <AlertCircle className="w-3 h-3" />}
              <span className="text-[11px] font-medium">
                {overdue ? `${Math.abs(dayCount ?? 0)}d overdue` : dayCount === 0 ? 'Today' : dayCount === 1 ? 'Tomorrow' : `${dayCount}d`}
              </span>
            </div>
          )}
          {goal.is_completed && goal.completed_at && (
            <span className="text-[11px]" style={{ color: '#16a34a' }}>
              Done {formatDate(goal.completed_at.slice(0, 10))}
            </span>
          )}

          {/* Pillar chip */}
          {goal.category && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: pc.color, background: pc.bg, border: `1px solid ${pc.border}` }}
            >
              {goal.category}
            </span>
          )}

          {/* Expand */}
          <button
            onClick={onToggleExpand}
            className="p-1 rounded transition-colors"
            style={{ color: isExpanded ? pc.color : 'var(--text-muted)' }}
          >
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-goal progress bar */}
      {subs.length > 0 && !isExpanded && (
        <div className="h-0.5 mx-4 mb-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${subs.length > 0 ? (subsDone / subs.length) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: pc.color }}
          />
        </div>
      )}

      {/* Expanded section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>

              {/* Priority + Due Date inline edit */}
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Priority</span>
                  <div className="flex gap-1">
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onUpdatePriority(goal.id, goal.priority === key ? null : key)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                        style={{
                          background: goal.priority === key ? cfg.bg : 'var(--bg-subtle)',
                          color: goal.priority === key ? cfg.color : 'var(--text-muted)',
                          border: `1px solid ${goal.priority === key ? cfg.border : 'var(--border-default)'}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Due</span>
                  <input
                    type="date"
                    value={goal.target_date ?? ''}
                    onChange={e => onUpdateDueDate(goal.id, e.target.value || null)}
                    className="text-xs px-2 py-0.5 rounded-lg outline-none"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  />
                  {goal.target_date && (
                    <button onClick={() => onUpdateDueDate(goal.id, null)} style={{ color: 'var(--text-muted)' }}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</p>
                <NotesInput value={goal.notes ?? ''} accentColor={pc.color} onSave={notes => onUpdateNotes(goal.id, notes)} />
              </div>

              {/* Sub-goals */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Sub-goals {subs.length > 0 && <span style={{ color: pc.color }}>{subsDone}/{subs.length}</span>}
                  </p>
                  {subs.length > 0 && (
                    <div className="flex-1 mx-3 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: `${(subsDone / subs.length) * 100}%` }}
                        transition={{ duration: 0.4 }}
                        style={{ background: pc.color }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1 mb-2">
                  <AnimatePresence initial={false}>
                    {subs.map(sub => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 group/sub"
                      >
                        <button onClick={() => toggleSub(sub.id)} className="shrink-0">
                          {sub.is_completed
                            ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                            : <Circle className="w-3.5 h-3.5" style={{ color: 'var(--border-default)' }} />}
                        </button>
                        <span
                          className="flex-1 text-xs"
                          style={{
                            color: sub.is_completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                            textDecoration: sub.is_completed ? 'line-through' : 'none',
                          }}
                        >{sub.title}</span>
                        <button
                          onClick={() => deleteSub(sub.id)}
                          className="opacity-0 group-hover/sub:opacity-100 p-0.5 rounded transition-all shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newSub}
                    onChange={e => setNewSub(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addSub() }}
                    placeholder="Add sub-goal..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={addSub}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
                    style={{ background: pc.color }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Debounced Notes ──────────────────────────────────────────────────────────

function NotesInput({ value, accentColor, onSave }: { value: string; accentColor: string; onSave: (v: string) => void }) {
  const [local, setLocal] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { setLocal(value) }, [value])
  function handleChange(v: string) {
    setLocal(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onSave(v), 800)
  }
  return (
    <textarea
      value={local}
      onChange={e => handleChange(e.target.value)}
      placeholder="Add notes, context, or a plan..."
      rows={2}
      className="w-full px-2.5 py-2 rounded-lg text-xs outline-none resize-none"
      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
      onFocus={e => { e.currentTarget.style.borderColor = accentColor + '80' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'done' | string

export default function GoalsPage() {
  const { goals, loading, addGoal, toggleGoal, deleteGoal, updateGoalNotes, updateSubGoals, updateGoalPriority, updateGoalDueDate } = useGoals()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const active = goals.filter(g => !g.is_completed)
  const done = goals.filter(g => g.is_completed)
  const overdue = active.filter(g => isOverdue(g.target_date))
  const dueThisMonth = active.filter(g => {
    if (!g.target_date || isOverdue(g.target_date)) return false
    const m = new Date().toISOString().slice(0, 7)
    return g.target_date.startsWith(m)
  })

  // Sort active: overdue first, then by priority, then by due date
  const prioritySort = (a: typeof goals[number]) => {
    if (a.priority === 'p1') return 0
    if (a.priority === 'p2') return 1
    if (a.priority === 'p3') return 2
    return 3
  }

  const sortedActive = [...active].sort((a, b) => {
    const aOver = isOverdue(a.target_date) ? -1 : 0
    const bOver = isOverdue(b.target_date) ? -1 : 0
    if (aOver !== bOver) return aOver - bOver
    const pDiff = prioritySort(a) - prioritySort(b)
    if (pDiff !== 0) return pDiff
    if (a.target_date && b.target_date) return a.target_date.localeCompare(b.target_date)
    if (a.target_date) return -1
    if (b.target_date) return 1
    return 0
  })

  const filteredGoals = filter === 'all'
    ? sortedActive
    : filter === 'done'
    ? done
    : sortedActive.filter(g => g.category === filter)

  function handleAdd(title: string, category: string, priority: string, target_date: string) {
    addGoal(title, category, priority, target_date || undefined)
  }

  const FILTERS: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'all',  label: 'All Active', count: active.length },
    ...PILLARS.map(p => ({ key: p.key, label: p.key, count: active.filter(g => g.category === p.key).length })).filter(f => f.count > 0),
    { key: 'done', label: 'Completed', count: done.length },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <Target className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
          </div>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Goals</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: '#2563eb' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Goal
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active',        value: active.length,         color: '#2563eb', bg: 'rgba(37,99,235,0.08)'   },
          { label: 'Completed',     value: done.length,           color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
          { label: 'Overdue',       value: overdue.length,        color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
          { label: 'Due This Month',value: dueThisMonth.length,   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: s.color }}>{s.label}</p>
            <p className="text-2xl font-bold font-['Plus_Jakarta_Sans']" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pillar balance */}
      {active.length > 0 && (
        <div className="card p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pillar Balance</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PILLARS.map(p => {
              const pillarGoals = active.filter(g => g.category === p.key)
              const pillarDone = goals.filter(g => g.category === p.key && g.is_completed).length
              const total = pillarGoals.length + pillarDone
              if (total === 0) return null
              const pct = total > 0 ? (pillarDone / total) * 100 : 0
              return (
                <button
                  key={p.key}
                  onClick={() => setFilter(filter === p.key ? 'all' : p.key)}
                  className="text-left rounded-lg p-2.5 transition-all"
                  style={{
                    background: filter === p.key ? p.bg : 'var(--bg-subtle)',
                    border: `1px solid ${filter === p.key ? p.border : 'var(--border-default)'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: p.color }}>{p.key}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pillarDone}/{total}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ background: p.color }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map(f => {
          const pc = PILLARS.find(p => p.key === f.key)
          const isActive = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isActive ? (pc?.bg ?? (f.key === 'done' ? 'rgba(22,163,74,0.12)' : 'rgba(37,99,235,0.12)')) : 'var(--bg-subtle)',
                color: isActive ? (pc?.color ?? (f.key === 'done' ? '#16a34a' : '#2563eb')) : 'var(--text-muted)',
                border: `1px solid ${isActive ? (pc?.border ?? (f.key === 'done' ? 'rgba(22,163,74,0.3)' : 'rgba(37,99,235,0.3)')) : 'var(--border-default)'}`,
              }}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span
                  className="text-[10px] font-bold px-1 rounded"
                  style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)', color: 'inherit' }}
                >
                  {f.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Goals list */}
      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading goals...</p>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Target className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {filter === 'done' ? 'No completed goals yet' : filter === 'all' ? 'No active goals' : `No ${filter} goals`}
          </p>
          {filter !== 'done' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs underline"
              style={{ color: '#2563eb' }}
            >
              Add your first goal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredGoals.map(goal => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onToggle={toggleGoal}
                onDelete={deleteGoal}
                onUpdateNotes={updateGoalNotes}
                onUpdateSubGoals={updateSubGoals}
                onUpdatePriority={updateGoalPriority}
                onUpdateDueDate={updateGoalDueDate}
                isExpanded={expandedId === goal.id}
                onToggleExpand={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddGoalModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAdd}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
