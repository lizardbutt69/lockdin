import { useState } from 'react'
import { Plus, Trash2, Zap, Trophy, AlertTriangle, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMissions, type Priority, MISSION_COMPLETE_BONUS } from '../../hooks/useMissions'
import MissionsModal from './MissionsModal'

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', dot: '🔴', xp: 50 },
  high:     { label: 'High',     color: '#d97706', bg: '#fffbeb', border: '#fcd34d', dot: '🟡', xp: 25 },
  standard: { label: 'Standard', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '🔵', xp: 10 },
}

const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'standard']

export default function MissionsCard() {
  const { missions, loading, incomplete, completed, overdue, allClear, addMission, toggleMission, deleteMission } = useMissions()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('high')
  const [showAdd, setShowAdd] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addMission(title, priority)
    setTitle('')
    setShowAdd(false)
  }

  const xpEarned = completed.reduce((sum, m) => sum + m.xp_value, 0)

  return (
    <>
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
        maxHeight: 'calc(100vh - 180px)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h3 className="font-semibold text-sm font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Today's Missions</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {incomplete.length} remaining · +{xpEarned} XP earned
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAdd(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAdd ? '#f0fdf4' : 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
            title="Expand"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* All clear banner */}
      <AnimatePresence>
        {allClear && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 flex items-center gap-2 shrink-0"
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

      {/* Add mission form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="px-4 py-3 space-y-2 border-b shrink-0"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Mission title..."
              className="tactical-input text-sm"
            />
            <div className="flex gap-1.5">
              {PRIORITY_ORDER.map(p => {
                const cfg = PRIORITY_CONFIG[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={{
                      background: priority === p ? cfg.bg : 'var(--bg-input)',
                      border: `1px solid ${priority === p ? cfg.border : 'var(--border-default)'}`,
                      color: priority === p ? cfg.color : 'var(--text-tertiary)',
                    }}
                  >
                    {cfg.dot} {cfg.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: '#16a34a' }}
              >
                Add
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

      {/* Mission list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : missions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No missions yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add your first mission for today</p>
          </div>
        ) : (
          <div>
            {/* Overdue indicator */}
            {overdue.length > 0 && (
              <div className="px-4 py-2 flex items-center gap-1.5" style={{ background: '#fef9c3', borderBottom: '1px solid #fef08a' }}>
                <AlertTriangle className="w-3 h-3" style={{ color: '#d97706' }} />
                <span className="text-[11px] font-medium" style={{ color: '#b45309' }}>
                  {overdue.length} overdue from previous days
                </span>
              </div>
            )}

            {/* Incomplete missions by priority */}
            {PRIORITY_ORDER.map(p => {
              const group = incomplete.filter(m => m.priority === p)
              if (group.length === 0) return null
              const cfg = PRIORITY_CONFIG[p]
              return (
                <div key={p}>
                  <div className="px-4 py-1.5 flex items-center gap-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                      {cfg.dot} {cfg.label}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>+{cfg.xp} XP each</span>
                  </div>
                  {group.map(mission => (
                    <MissionRow
                      key={mission.id}
                      mission={mission}
                      onToggle={() => toggleMission(mission.id)}
                      onDelete={() => deleteMission(mission.id)}
                    />
                  ))}
                </div>
              )
            })}

            {/* Completed missions (collapsible) */}
            {completed.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted(v => !v)}
                  className="w-full px-4 py-2 flex items-center gap-2 text-left"
                  style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}
                >
                  <span className="text-[11px] font-medium flex-1" style={{ color: 'var(--text-muted)' }}>
                    ✓ Completed ({completed.length})
                  </span>
                  {showCompleted
                    ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                </button>
                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {completed.map(mission => (
                        <MissionRow
                          key={mission.id}
                          mission={mission}
                          onToggle={() => toggleMission(mission.id)}
                          onDelete={() => deleteMission(mission.id)}
                          dim
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

      {/* Footer XP summary */}
      {missions.length > 0 && (
        <div
          className="px-4 py-2.5 flex items-center gap-2 shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {allClear
              ? `+${xpEarned + MISSION_COMPLETE_BONUS} XP total (incl. ${MISSION_COMPLETE_BONUS} clear bonus)`
              : `+${xpEarned} XP earned · ${incomplete.reduce((s, m) => s + m.xp_value, 0) + (allClear ? 0 : MISSION_COMPLETE_BONUS)} remaining`}
          </span>
        </div>
      )}
    </div>

    <AnimatePresence>
      {showModal && <MissionsModal onClose={() => setShowModal(false)} />}
    </AnimatePresence>
    </>
  )
}

function MissionRow({
  mission, onToggle, onDelete, dim = false,
}: {
  mission: ReturnType<typeof useMissions>['missions'][0]
  onToggle: () => void
  onDelete: () => void
  dim?: boolean
}) {
  const cfg = PRIORITY_CONFIG[mission.priority as Priority]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: dim ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 px-4 py-2.5 group"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
        style={{
          border: `2px solid ${mission.completed ? cfg.color : 'var(--border-default)'}`,
          background: mission.completed ? cfg.color : 'transparent',
        }}
      >
        {mission.completed && <span className="text-white text-[9px] font-bold">✓</span>}
      </button>

      {/* Title */}
      <span
        className="flex-1 text-sm leading-tight"
        style={{
          color: mission.completed ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: mission.completed ? 'line-through' : 'none',
        }}
      >
        {mission.title}
      </span>

      {/* XP badge */}
      <span className="text-[10px] font-semibold shrink-0" style={{ color: cfg.color }}>
        +{mission.xp_value}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </motion.div>
  )
}
