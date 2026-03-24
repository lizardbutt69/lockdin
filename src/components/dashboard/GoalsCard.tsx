import { useState } from 'react'
import { Plus, Trash2, Target, CheckCircle2, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoals } from '../../hooks/useGoals'

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

export default function GoalsCard() {
  const { goals, loading, addGoal, toggleGoal, deleteGoal, completed, total } = useGoals()
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
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
            <Target className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>{year} Goals</h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{completed}/{total} complete</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="text-sm font-bold" style={{ color: pct === 100 ? '#16a34a' : '#2563eb' }}>{pct}%</span>
          )}
          <button
            onClick={() => setShowAdd(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
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
            style={{ background: pct === 100 ? '#16a34a' : '#2563eb' }}
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
            className="px-4 py-3 space-y-2 border-b"
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
              <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#2563eb' }}>
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
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {loading ? (
          <p className="text-center text-xs py-6" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : goals.length === 0 ? (
          <div className="text-center py-6 px-4">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No goals set yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add your goals for {year}</p>
          </div>
        ) : (
          goals.map(goal => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-2.5 group"
            >
              <button onClick={() => toggleGoal(goal.id)} className="shrink-0 transition-colors">
                {goal.is_completed
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                  : <Circle className="w-4 h-4" style={{ color: 'var(--border-default)' }} />}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-tight"
                  style={{
                    color: goal.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: goal.is_completed ? 'line-through' : 'none',
                  }}
                >
                  {goal.title}
                </p>
                {goal.category && (() => {
                  const cfg = CATEGORY_CONFIG[goal.category] ?? CATEGORY_CONFIG.Personal
                  return (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {goal.category}
                    </span>
                  )
                })()}
              </div>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
