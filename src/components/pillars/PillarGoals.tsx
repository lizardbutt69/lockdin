import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Target, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoals, type SubGoal } from '../../hooks/useGoals'

interface PillarGoalsProps {
  category: string
  accentColor?: string
  accentBg?: string
  accentBorder?: string
}

export default function PillarGoals({
  category,
  accentColor = '#2563eb',
  accentBg = '#eff6ff',
  accentBorder = '#bfdbfe',
}: PillarGoalsProps) {
  const { goals, loading, addGoal, toggleGoal, deleteGoal, updateGoalNotes, updateSubGoals } = useGoals()
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newSubTitle, setNewSubTitle] = useState('')

  const filtered = goals.filter(g => g.category === category)
  const completed = filtered.filter(g => g.is_completed).length
  const total = filtered.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const year = new Date().getFullYear()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addGoal(title, category)
    setTitle('')
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
    const next = currentSubs.map(s => s.id === subId ? { ...s, is_completed: !s.is_completed } : s)
    updateSubGoals(goalId, next)
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
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
          >
            <Target className="w-3 h-3" style={{ color: accentColor }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {year} Goals
            </h3>
            {total > 0 && (
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{completed}/{total} complete</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="text-sm font-bold" style={{ color: pct === 100 ? '#16a34a' : accentColor }}>{pct}%</span>
          )}
          <button
            onClick={() => setShowAdd(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAdd ? accentBg : 'var(--bg-input)', border: `1px solid ${showAdd ? accentBorder : 'var(--border-default)'}`, color: showAdd ? accentColor : 'var(--text-tertiary)' }}
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
            style={{ background: pct === 100 ? '#16a34a' : accentColor }}
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
            className="px-4 py-3 border-b space-y-2 overflow-hidden"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`Add a ${category} goal for ${year}...`}
              className="tactical-input text-sm w-full"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: accentColor }}
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-default)' }}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goals list */}
      <div className="px-3 py-3 space-y-2">
        {loading ? (
          <p className="text-center text-xs py-4" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-4 px-2">
            <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>No {category} goals yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Goals tagged <span className="font-medium" style={{ color: accentColor }}>{category}</span> appear here
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map(goal => {
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
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className="shrink-0 transition-colors"
                    >
                      {goal.is_completed
                        ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                        : <Circle className="w-4 h-4" style={{ color: 'var(--border-default)' }} />}
                    </button>

                    {/* Title — click to expand */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                      className="flex-1 min-w-0 text-left"
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
                      {subs.length > 0 && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {subsDone}/{subs.length} sub-goals
                        </p>
                      )}
                    </button>

                    {/* Actions */}
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
                        <div
                          className="px-3 pb-3 pt-1 space-y-3"
                          style={{ borderTop: '1px solid var(--border-subtle)' }}
                        >
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
                            {/* Add sub-goal */}
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

// Debounced notes input
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
