import { useState } from 'react'
import { X, Plus, Trash2, Pencil, Check, Zap, Trophy, AlertTriangle, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMissions, type Priority, MISSION_COMPLETE_BONUS } from '../../hooks/useMissions'

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', dot: '🔴', xp: 50 },
  high:     { label: 'High',     color: '#d97706', bg: '#fffbeb', border: '#fcd34d', dot: '🟡', xp: 25 },
  standard: { label: 'Standard', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '🔵', xp: 10 },
}
const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'standard']

const today = new Date().toISOString().split('T')[0]

function dueDateLabel(due: string | null): { text: string; color: string } | null {
  if (!due) return null
  if (due === today) return { text: 'Today', color: '#16a34a' }
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  if (due === tomorrow.toISOString().split('T')[0]) return { text: 'Tomorrow', color: '#2563eb' }
  if (due < today) {
    const days = Math.ceil((new Date(today).getTime() - new Date(due).getTime()) / 86400000)
    return { text: `${days}d overdue`, color: '#dc2626' }
  }
  return { text: new Date(due + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'var(--text-muted)' }
}

// ─── Edit Row ──────────────────────────────────────────────────────────────────

function EditRow({
  mission,
  onSave,
  onCancel,
}: {
  mission: ReturnType<typeof useMissions>['missions'][0]
  onSave: (updates: { title: string; priority: Priority; due_date: string | null }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(mission.title)
  const [priority, setPriority] = useState<Priority>(mission.priority as Priority)
  const [dueDate, setDueDate] = useState(mission.due_date ?? '')

  function save() {
    if (!title.trim()) return
    onSave({ title: title.trim(), priority, due_date: dueDate || null })
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 py-3 space-y-2.5" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
          className="tactical-input text-sm"
          placeholder="Mission title..."
        />
        <div className="flex gap-1.5 flex-wrap">
          {PRIORITY_ORDER.map(p => {
            const cfg = PRIORITY_CONFIG[p]
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all min-w-0"
                style={{
                  background: priority === p ? cfg.bg : 'var(--bg-card)',
                  border: `1px solid ${priority === p ? cfg.border : 'var(--border-default)'}`,
                  color: priority === p ? cfg.color : 'var(--text-muted)',
                }}
              >
                {cfg.dot} {cfg.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="tactical-input flex-1 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: '#16a34a' }}
          >
            <Check className="w-3.5 h-3.5 inline mr-1" />Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mission Row ───────────────────────────────────────────────────────────────

function MissionRow({
  mission,
  dim,
  onToggle,
  onDelete,
  onEdit,
}: {
  mission: ReturnType<typeof useMissions>['missions'][0]
  dim?: boolean
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const cfg = PRIORITY_CONFIG[mission.priority as Priority]
  const due = dueDateLabel(mission.due_date)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: dim ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 px-4 py-3 group"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
        style={{
          border: `2px solid ${mission.completed ? cfg.color : 'var(--border-default)'}`,
          background: mission.completed ? cfg.color : 'transparent',
        }}
      >
        {mission.completed && <span className="text-white text-[9px] font-bold">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className="text-sm leading-tight block"
          style={{
            color: mission.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: mission.completed ? 'line-through' : 'none',
          }}
        >
          {mission.title}
        </span>
        {due && (
          <span className="text-[10px] font-medium flex items-center gap-1 mt-0.5" style={{ color: due.color }}>
            <Calendar className="w-2.5 h-2.5" />{due.text}
          </span>
        )}
      </div>

      <span
        className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      >
        {cfg.dot} {cfg.label}
      </span>

      <span className="text-[10px] font-semibold shrink-0" style={{ color: cfg.color }}>
        +{mission.xp_value}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded transition-colors"
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

// ─── Modal ─────────────────────────────────────────────────────────────────────

export default function MissionsModal({ onClose }: { onClose: () => void }) {
  const { missions, loading, incomplete, completed, overdue, allClear, addMission, toggleMission, updateMission, deleteMission } = useMissions()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('high')
  const [dueDate, setDueDate] = useState(today)
  const [showAdd, setShowAdd] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const xpEarned = completed.reduce((sum, m) => sum + m.xp_value, 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addMission(title, priority, dueDate || null)
    setTitle('')
    setDueDate(today)
    setPriority('high')
    setShowAdd(false)
  }

  async function handleEdit(id: string, updates: { title: string; priority: Priority; due_date: string | null }) {
    await updateMission(id, updates)
    setEditingId(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth: 680,
          maxHeight: '90vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <h2 className="font-bold text-base font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
              Today's Missions
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {incomplete.length} remaining · +{xpEarned} XP earned
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ background: showAdd ? '#15803d' : '#16a34a' }}
            >
              <Plus className="w-3.5 h-3.5" />New Mission
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* All clear */}
        <AnimatePresence>
          {allClear && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-3 flex items-center gap-2 shrink-0"
              style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}
            >
              <Trophy className="w-4 h-4" style={{ color: '#16a34a' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#15803d' }}>Mission board cleared!</p>
                <p className="text-[10px]" style={{ color: '#16a34a' }}>+{MISSION_COMPLETE_BONUS} XP bonus earned</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="shrink-0 overflow-hidden"
            >
              <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Mission title..."
                  className="tactical-input text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  {PRIORITY_ORDER.map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all min-w-0"
                        style={{
                          background: priority === p ? cfg.bg : 'var(--bg-card)',
                          border: `1px solid ${priority === p ? cfg.border : 'var(--border-default)'}`,
                          color: priority === p ? cfg.color : 'var(--text-muted)',
                        }}
                      >
                        {cfg.dot} {cfg.label} · +{cfg.xp} XP
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="tactical-input flex-1 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#16a34a' }}>
                    Add Mission
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-xs py-10" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : missions.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No missions yet</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hit "New Mission" to get started</p>
            </div>
          ) : (
            <div>
              {overdue.length > 0 && (
                <div className="px-5 py-2 flex items-center gap-1.5" style={{ background: '#fef9c3', borderBottom: '1px solid #fef08a' }}>
                  <AlertTriangle className="w-3 h-3" style={{ color: '#d97706' }} />
                  <span className="text-[11px] font-medium" style={{ color: '#b45309' }}>
                    {overdue.length} overdue from previous days
                  </span>
                </div>
              )}

              {PRIORITY_ORDER.map(p => {
                const group = incomplete.filter(m => m.priority === p)
                if (group.length === 0) return null
                const cfg = PRIORITY_CONFIG[p]
                return (
                  <div key={p}>
                    <div className="px-5 py-2 flex items-center gap-2" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                        {cfg.dot} {cfg.label}
                      </span>
                      <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>+{cfg.xp} XP each</span>
                    </div>
                    <AnimatePresence>
                      {group.map(mission => (
                        <div key={mission.id}>
                          <MissionRow
                            mission={mission}
                            onToggle={() => toggleMission(mission.id)}
                            onDelete={() => deleteMission(mission.id)}
                            onEdit={() => setEditingId(editingId === mission.id ? null : mission.id)}
                          />
                          <AnimatePresence>
                            {editingId === mission.id && (
                              <EditRow
                                mission={mission}
                                onSave={updates => handleEdit(mission.id, updates)}
                                onCancel={() => setEditingId(null)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                )
              })}

              {completed.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCompleted(v => !v)}
                    className="w-full px-5 py-2.5 flex items-center gap-2 text-left"
                    style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}
                  >
                    <span className="text-[11px] font-medium flex-1" style={{ color: 'var(--text-muted)' }}>
                      ✓ Completed ({completed.length})
                    </span>
                    {showCompleted ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  <AnimatePresence>
                    {showCompleted && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        {completed.map(mission => (
                          <MissionRow
                            key={mission.id}
                            mission={mission}
                            dim
                            onToggle={() => toggleMission(mission.id)}
                            onDelete={() => deleteMission(mission.id)}
                            onEdit={() => setEditingId(editingId === mission.id ? null : mission.id)}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {missions.length > 0 && (
          <div className="px-5 py-3 flex items-center gap-2 shrink-0" style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {allClear
                ? `+${xpEarned + MISSION_COMPLETE_BONUS} XP total (incl. ${MISSION_COMPLETE_BONUS} clear bonus)`
                : `+${xpEarned} XP earned · ${incomplete.reduce((s, m) => s + m.xp_value, 0) + (allClear ? 0 : MISSION_COMPLETE_BONUS)} XP remaining`}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
