import { useState } from 'react'
import { Heart, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BondsPulse, BondsBucketItem } from '../../hooks/useBonds'

const ACCENT = '#dc2626'
const PULSE_FIELDS: { key: keyof Pick<BondsPulse,'quality_time'|'communication'|'intentionality'>; label: string; emoji: string }[] = [
  { key: 'quality_time',   label: 'Quality Time',   emoji: '⏱️' },
  { key: 'communication',  label: 'Communication',  emoji: '💬' },
  { key: 'intentionality', label: 'Intentionality', emoji: '🎯' },
]
const SCORE_LABELS = ['', 'Needs work', 'Below avg', 'Average', 'Good', 'Thriving']

interface Props {
  pulse: BondsPulse | null
  onSavePulse: (data: Partial<Pick<BondsPulse,'quality_time'|'communication'|'intentionality'|'notes'>>) => void
  bucketList: BondsBucketItem[]
  onAddBucket: (title: string) => void
  onToggleBucket: (id: string) => void
  onDeleteBucket: (id: string) => void
}

export default function BondsPartnerTab({ pulse, onSavePulse, bucketList, onAddBucket, onToggleBucket, onDeleteBucket }: Props) {
  const [scores, setScores] = useState({
    quality_time: pulse?.quality_time ?? 3,
    communication: pulse?.communication ?? 3,
    intentionality: pulse?.intentionality ?? 3,
  })
  const [notes, setNotes] = useState(pulse?.notes ?? '')
  const [newBucket, setNewBucket] = useState('')

  const avg = Math.round((scores.quality_time + scores.communication + scores.intentionality) / 3)
  const avgColor = avg >= 4 ? '#22c55e' : avg >= 3 ? '#f59e0b' : '#ef4444'

  function handleScore(key: keyof typeof scores, val: number) {
    const next = { ...scores, [key]: val }
    setScores(next)
    onSavePulse({ ...next, notes })
  }

  function handleNotes(val: string) {
    setNotes(val)
    onSavePulse({ ...scores, notes: val })
  }

  return (
    <div className="space-y-4">
      {/* Relationship Pulse */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
              <Heart className="w-3 h-3" style={{ color: ACCENT }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Relationship Pulse</span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>This week</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold" style={{ color: avgColor }}>{avg}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/5</span>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {PULSE_FIELDS.map(({ key, label, emoji }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{emoji} {label}</span>
                <span className="text-[11px] font-semibold" style={{ color: ACCENT }}>{SCORE_LABELS[scores[key]]}</span>
              </div>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => handleScore(key, n)}
                    className="flex-1 h-7 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: scores[key] >= n ? `${ACCENT}20` : 'var(--bg-subtle)',
                      border: `1px solid ${scores[key] >= n ? ACCENT : 'var(--border-default)'}`,
                      color: scores[key] >= n ? ACCENT : 'var(--text-muted)',
                    }}>{n}</button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</p>
            <textarea value={notes} onChange={e => handleNotes(e.target.value)}
              placeholder="What's one thing to improve this week?"
              rows={2} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              onFocus={e => e.currentTarget.style.borderColor = `${ACCENT}60`}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'} />
          </div>
        </div>
      </div>

      {/* Bucket List */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">🗺️</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Bucket List & Date Ideas</span>
            {bucketList.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{bucketList.filter(b=>!b.is_completed).length} left</span>}
          </div>
        </div>

        <div className="px-3 py-3 space-y-1.5">
          <AnimatePresence initial={false}>
            {bucketList.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg group"
                style={{ background: 'var(--bg-subtle)', opacity: item.is_completed ? 0.6 : 1 }}>
                <button onClick={() => onToggleBucket(item.id)} className="shrink-0">
                  {item.is_completed
                    ? <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
                    : <Circle className="w-4 h-4" style={{ color: 'var(--border-default)' }} />}
                </button>
                <p className="flex-1 text-sm" style={{ color: item.is_completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.is_completed ? 'line-through' : 'none' }}>{item.title}</p>
                <button onClick={() => onDeleteBucket(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0"
                  style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {bucketList.length === 0 && <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>Add experiences you want to share together</p>}
          <div className="flex gap-2 pt-1">
            <input value={newBucket} onChange={e => setNewBucket(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newBucket.trim()) { onAddBucket(newBucket); setNewBucket('') } }}
              placeholder="Add idea..." className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            <button onClick={() => { if (newBucket.trim()) { onAddBucket(newBucket); setNewBucket('') } }}
              className="px-3 py-1.5 rounded-lg text-white shrink-0" style={{ background: ACCENT }}>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
