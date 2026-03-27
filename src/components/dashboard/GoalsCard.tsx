import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Target, CheckCircle2, Circle, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoals, type SubGoal } from '../../hooks/useGoals'

export const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  God:           { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
  Finances:      { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  Relationships: { color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4' },
  Health:        { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Fitness:       { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  Family:        { color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4' },
  Travel:        { color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  Career:        { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  Personal:      { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
}
const CATEGORIES = Object.keys(CATEGORY_CONFIG)
const ACCENT = '#2563eb'

export default function GoalsCard() {
  const { goals, loading, addGoal, toggleGoal, deleteGoal, updateGoalNotes, updateSubGoals, completed, total } = useGoals()
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newSubTitle, setNewSubTitle] = useState('')
  const year = new Date().getFullYear()
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addGoal(title, category || undefined)
    setTitle('')
    setCategory('')
    setShowAdd(false)
  }

  function addSubGoal(goalId: string, currentSubs: SubGoal[]) {
    if (!newSubTitle.trim()) return
    const next: SubGoal[] = [
      ...currentSubs,
      { id: `sg_${Date.now()}`, title: newSubTitle.trim(), is_completed: false },
    ]
    updateSubGoals(goalId, next)
    setNewSubTitle('')
  }

  function toggleSubGoal(goalId: string, subId: string, currentSubs: SubGoal[]) {
    updateSubGoals(goalId, currentSubs.map(s => s.id === subId ? { ...s, is_completed: !s.is_completed } : s))
  }

  function deleteSubGoal(goalId: string, subId: string, currentSubs: SubGoal[]) {
    updateSubGoals(goalId, currentSubs.filter(s => s.id !== subId))
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <Target className="w-3.5 h-3.5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{year} Goals</h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{completed}/{total} complete</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="text-sm font-bold" style={{ color: pct === 100 ? '#16a34a' : ACCENT }}>{pct}%</span>
          )}
          <button
            onClick={() => setShowAdd(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAdd ? '#eff6ff' : 'var(--bg-input)', border: `1px solid ${showAdd ? '#bfdbfe' : 'var(--border-default)'}`, color: showAdd ? ACCENT : 'var(--text-tertiary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1" style={{ background: 'var(--bg-subtle)' }}>
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ background: pct === 100 ? '#16a34a' : ACCENT }}
          />
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="px-4 py-3 space-y-2 border-b overflow-hidden"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Run a half marathon"
              className="tactical-input text-sm"
            />
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => {
                const cfg = CATEGORY_CONFIG[cat]
                const active = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(active ? '' : cat)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium transition-all"
                    style={{
                      background: active ? cfg.bg : 'var(--bg-input)',
                      border: `1px solid ${active ? cfg.border : 'var(--border-default)'}`,
                      color: active ? cfg.color : 'var(--text-tertiary)',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>
                Add goal
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-default)' }}>
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goals list */}
      <div className="px-3 py-3 space-y-2">
        {loading ? (
          <p className="text-center text-xs py-6" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : goals.length === 0 ? (
          <div className="text-center py-6 px-4">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No goals set yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add your goals for {year}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {goals.map(goal => {
              const cfg = goal.category ? (CATEGORY_CONFIG[goal.category] ?? CATEGORY_CONFIG.Personal) : null
              const accentColor = cfg?.color ?? ACCENT
              const isExpanded = expandedId === goal.id
              const subs = goal.sub_goals ?? []
              const subsDone = subs.filter(s => s.is_completed).length

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: `1px solid ${isExpanded ? accentColor + '40' : 'var(--border-default)'}`,
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Goal row */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 group">
                    <button onClick={() => toggleGoal(goal.id)} className="shrink-0 transition-colors">
                      {goal.is_completed
                        ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                        : <Circle className="w-4 h-4" style={{ color: 'var(--border-default)' }} />}
                    </button>

                    {/* Title + category — click to expand */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p
                        className="text-sm leading-tight truncate"
                        style={{
                          color: goal.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: goal.is_completed ? 'line-through' : 'none',
                        }}
                      >
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {cfg && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                          >
                            {goal.category}
                          </span>
                        )}
                        {subs.length > 0 && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {subsDone}/{subs.length} sub-goals
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: isExpanded ? accentColor : 'var(--text-muted)' }}
                      >
                        <ChevronDown
                          className="w-3.5 h-3.5 transition-transform"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          {/* Notes */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</p>
                            <NotesInput
                              value={goal.notes ?? ''}
                              accentColor={accentColor}
                              onSave={notes => updateGoalNotes(goal.id, notes)}
                            />
                          </div>

                          {/* Sub-goals */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Sub-goals</p>
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
                                    <button onClick={() => toggleSubGoal(goal.id, sub.id, subs)} className="shrink-0">
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
                                      onClick={() => deleteSubGoal(goal.id, sub.id, subs)}
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
                                value={newSubTitle}
                                onChange={e => setNewSubTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addSubGoal(goal.id, subs) }}
                                placeholder="Add sub-goal..."
                                className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                                style={{
                                  background: 'var(--bg-input)',
                                  border: '1px solid var(--border-default)',
                                  color: 'var(--text-primary)',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => addSubGoal(goal.id, subs)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
                                style={{ background: accentColor }}
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
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

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
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = accentColor + '80' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
    />
  )
}
