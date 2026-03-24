import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoals } from '../../hooks/useGoals'

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
  const { goals, loading, addGoal, toggleGoal, deleteGoal } = useGoals()
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')

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
            <h3 className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
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
            className="px-4 py-3 border-b space-y-2"
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
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {loading ? (
          <p className="text-center text-xs py-5" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 px-4">
            <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>No {category} goals yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Goals tagged <span className="font-medium" style={{ color: accentColor }}>{category}</span> appear here
            </p>
          </div>
        ) : (
          filtered.map(goal => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-2.5 group"
            >
              <button onClick={() => toggleGoal(goal.id)} className="shrink-0 transition-colors">
                {goal.is_completed
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                  : <Circle className="w-4 h-4" style={{ color: 'var(--border-default)' }} />}
              </button>
              <p
                className="flex-1 text-sm leading-tight"
                style={{
                  color: goal.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: goal.is_completed ? 'line-through' : 'none',
                }}
              >
                {goal.title}
              </p>
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
