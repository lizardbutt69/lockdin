import { Plus, Trash2, Pencil, Check, X, Target } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']

interface SavingsGoalsProps {
  hidden: boolean
}

function fmt(n: number, hidden: boolean) {
  if (hidden) return '••••••'
  return '$' + n.toLocaleString()
}

// ─── Goal Card ─────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  hidden,
  onUpdate,
  onDelete,
}: {
  goal: SavingsGoal
  hidden: boolean
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: goal.name,
    target: String(goal.target),
    current_amount: String(goal.current_amount),
  })

  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target) * 100)) : 0
  const done = pct >= 100

  function openEdit() {
    setForm({ name: goal.name, target: String(goal.target), current_amount: String(goal.current_amount) })
    setEditing(true)
  }

  async function save() {
    await onUpdate(goal.id, {
      name: form.name.trim() || goal.name,
      target: Number(form.target) || goal.target,
      current_amount: Number(form.current_amount) || 0,
    })
    setEditing(false)
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm truncate font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            {goal.name}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={editing ? () => setEditing(false) : openEdit}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: editing ? '#ef4444' : 'var(--text-muted)' }}
          >
            {editing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Progress — view mode */}
      {!editing && (
        <>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold font-['Space_Grotesk']" style={{ color: done ? '#16a34a' : 'var(--text-secondary)' }}>
                {fmt(goal.current_amount, hidden)}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                of {fmt(goal.target, hidden)}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ background: done ? '#16a34a' : '#3b82f6' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: done ? '#16a34a' : 'var(--text-muted)' }}>
                {done ? '✓ Goal reached!' : `${pct}% saved`}
              </span>
              {!hidden && !done && (
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  ${(goal.target - goal.current_amount).toLocaleString()} to go
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit mode — all fields */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-2"
          >
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="tactical-input"
              placeholder="Goal name"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Target ($)</label>
                <input
                  type="number"
                  value={form.target}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  className="tactical-input"
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Saved so far ($)</label>
                <input
                  type="number"
                  value={form.current_amount}
                  onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                  className="tactical-input"
                  onKeyDown={e => e.key === 'Enter' && save()}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={save}
                className="flex-1 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ background: '#16a34a' }}
              >
                <Check className="w-3.5 h-3.5 inline mr-1" />Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SavingsGoals({ hidden }: SavingsGoalsProps) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', current: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setGoals(data) })
  }, [user])

  async function addGoal() {
    setError('')
    if (!user) { setError('Not logged in.'); return }
    if (!form.name.trim()) { setError('Goal name is required.'); return }
    if (!form.target) { setError('Target amount is required.'); return }
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      emoji: '🎯',
      target: Number(form.target) || 0,
      current_amount: Number(form.current) || 0,
    }
    setSaving(true)
    if (!isSupabaseConfigured) {
      const demo: SavingsGoal = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      setGoals(g => [...g, demo])
    } else {
      const { data, error: sbError } = await supabase.from('savings_goals').insert(payload).select().single()
      if (sbError) { setError(sbError.message); setSaving(false); return }
      if (data) setGoals(g => [...g, data])
    }
    setSaving(false)
    setForm({ name: '', target: '', current: '' })
    setShowAdd(false)
  }

  async function updateGoal(id: string, updates: Partial<SavingsGoal>) {
    setGoals(g => g.map(goal => goal.id === id ? { ...goal, ...updates } : goal))
    if (isSupabaseConfigured) {
      await supabase.from('savings_goals').update(updates).eq('id', id)
    }
  }

  async function deleteGoal(id: string) {
    if (!confirm('Remove this savings goal?')) return
    setGoals(g => g.filter(goal => goal.id !== id))
    if (isSupabaseConfigured) {
      await supabase.from('savings_goals').delete().eq('id', id)
    }
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)' }}>
              <Target className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
            </div>
            <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              Saving For
            </span>
            {goals.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {goals.filter(g => g.current_amount >= g.target).length}/{goals.length} reached
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showAdd ? 'rgba(22,163,74,0.1)' : 'var(--bg-subtle)',
              border: `1px solid ${showAdd ? 'rgba(22,163,74,0.3)' : 'var(--border-default)'}`,
              color: showAdd ? '#16a34a' : 'var(--text-secondary)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add goal
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: '1px solid var(--border-default)' }}>
                {/* Name — full width, first */}
                <input
                  type="text"
                  placeholder="Goal name (e.g. New Car, Hawaii Trip)"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="tactical-input"
                  onKeyDown={e => e.key === 'Enter' && addGoal()}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Target ($)</label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={form.target}
                      onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                      className="tactical-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Saved ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.current}
                      onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                      className="tactical-input"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addGoal}
                    disabled={saving}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#16a34a', opacity: saving ? 0.6 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Add goal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdd(false); setError(''); setForm({ name: '', target: '', current: '' }) }}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {goals.length === 0 && !showAdd && (
        <div
          className="card p-8 flex flex-col items-center justify-center text-center"
          style={{ borderStyle: 'dashed' }}
        >
          <Target className="w-7 h-7 mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No savings goals yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add something you're saving for</p>
        </div>
      )}

      {/* Goal cards */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              hidden={hidden}
              onUpdate={updateGoal}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}
    </div>
  )
}
