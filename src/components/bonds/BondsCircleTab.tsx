import { useState } from 'react'
import { Users, Plus, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BondsPerson, BondsMoment } from '../../hooks/useBonds'

const ACCENT = '#ec4899'

const AVATAR_COLORS = ['#ec4899','#8b5cf6','#3b82f6','#22c55e','#f59e0b','#ef4444','#06b6d4','#14b8a6']
const REL_TYPES = ['Brother','Friend','Mentor','Accountability','Family','Other']

function daysSince(date: string | null): number | null {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date + 'T00:00:00').getTime()) / 86400000)
}

function urgencyColor(days: number | null): string {
  if (days === null) return '#ef4444'
  if (days < 7) return '#22c55e'
  if (days < 30) return '#f59e0b'
  return '#ef4444'
}

function urgencyLabel(days: number | null): string {
  if (days === null) return 'Never'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

interface Props {
  people: BondsPerson[]
  moments: BondsMoment[]
  onAddPerson: (d: Omit<BondsPerson,'id'|'user_id'|'created_at'>) => void
  onDeletePerson: (id: string) => void
  onMarkContacted: (id: string) => void
  onAddMoment: (d: { title: string; description?: string; person_id?: string; moment_date?: string }) => void
  onDeleteMoment: (id: string) => void
}

export default function BondsCircleTab({ people, moments, onAddPerson, onDeletePerson, onMarkContacted, onAddMoment, onDeleteMoment }: Props) {
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [personForm, setPersonForm] = useState({ name: '', relationship_type: 'Friend', avatar_color: AVATAR_COLORS[0], notes: '' })
  const [showAddMoment, setShowAddMoment] = useState(false)
  const [momentForm, setMomentForm] = useState({ title: '', description: '', person_id: '', moment_date: '' })

  // Sort by most overdue first
  const sortedPeople = [...people].sort((a, b) => {
    const da = daysSince(a.last_contacted) ?? 9999
    const db = daysSince(b.last_contacted) ?? 9999
    return db - da
  })

  function handleAddPerson(e: React.FormEvent) {
    e.preventDefault()
    if (!personForm.name.trim()) return
    onAddPerson({ name: personForm.name.trim(), relationship_type: personForm.relationship_type, avatar_color: personForm.avatar_color, last_contacted: null, notes: personForm.notes.trim() || null })
    setPersonForm({ name: '', relationship_type: 'Friend', avatar_color: AVATAR_COLORS[0], notes: '' })
    setShowAddPerson(false)
  }

  function handleAddMoment(e: React.FormEvent) {
    e.preventDefault()
    if (!momentForm.title.trim()) return
    onAddMoment({ title: momentForm.title.trim(), description: momentForm.description.trim() || undefined, person_id: momentForm.person_id || undefined, moment_date: momentForm.moment_date || undefined })
    setMomentForm({ title: '', description: '', person_id: '', moment_date: '' })
    setShowAddMoment(false)
  }

  return (
    <div className="space-y-4">
      {/* Inner Circle */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
              <Users className="w-3 h-3" style={{ color: ACCENT }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Inner Circle</span>
            {people.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{people.length}</span>}
          </div>
          <button onClick={() => setShowAddPerson(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAddPerson ? `${ACCENT}15` : 'var(--bg-subtle)', border: `1px solid ${showAddPerson ? ACCENT : 'var(--border-default)'}`, color: showAddPerson ? ACCENT : 'var(--text-muted)' }}>
            {showAddPerson ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Add person form */}
        <AnimatePresence>
          {showAddPerson && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddPerson} className="px-4 py-3 border-b space-y-2.5 overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-2">
                <input value={personForm.name} onChange={e => setPersonForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Name" className="tactical-input text-sm flex-1" autoFocus />
                <select value={personForm.relationship_type} onChange={e => setPersonForm(f => ({ ...f, relationship_type: e.target.value }))}
                  className="tactical-input text-sm" style={{ width: 120 }}>
                  {REL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Color:</span>
                {AVATAR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setPersonForm(f => ({ ...f, avatar_color: c }))}
                    className="w-5 h-5 rounded-full transition-transform"
                    style={{ background: c, transform: personForm.avatar_color === c ? 'scale(1.3)' : 'scale(1)', boxShadow: personForm.avatar_color === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : 'none' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>Add to Circle</button>
                <button type="button" onClick={() => setShowAddPerson(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* People list */}
        <div className="px-3 py-3 space-y-2">
          {people.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Add the people who matter most to you</p>}
          <AnimatePresence initial={false}>
            {sortedPeople.map(person => {
              const days = daysSince(person.last_contacted)
              const color = urgencyColor(days)
              return (
                <motion.div key={person.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg group"
                  style={{ background: 'var(--bg-subtle)', border: `1px solid ${days !== null && days > 30 ? '#ef444420' : 'var(--border-default)'}` }}>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ background: person.avatar_color }}>
                    {person.name.slice(0,2).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{person.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: `${ACCENT}15`, color: ACCENT }}>{person.relationship_type}</span>
                    </div>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color }}>● {urgencyLabel(days)}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onMarkContacted(person.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                      style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                      Contacted
                    </button>
                    <button onClick={() => onDeletePerson(person.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                      style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Meaningful Moments */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Meaningful Moments</span>
            {moments.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{moments.length}</span>}
          </div>
          <button onClick={() => setShowAddMoment(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAddMoment ? `${ACCENT}15` : 'var(--bg-subtle)', border: `1px solid ${showAddMoment ? ACCENT : 'var(--border-default)'}`, color: showAddMoment ? ACCENT : 'var(--text-muted)' }}>
            {showAddMoment ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Add moment form */}
        <AnimatePresence>
          {showAddMoment && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddMoment} className="px-4 py-3 border-b space-y-2.5 overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
              <input value={momentForm.title} onChange={e => setMomentForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What happened?" className="tactical-input text-sm" autoFocus />
              <textarea value={momentForm.description} onChange={e => setMomentForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the moment..." rows={2} className="tactical-input text-sm resize-none w-full" />
              <div className="flex gap-2">
                <select value={momentForm.person_id} onChange={e => setMomentForm(f => ({ ...f, person_id: e.target.value }))}
                  className="tactical-input text-sm flex-1">
                  <option value="">No person tagged</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="date" value={momentForm.moment_date} onChange={e => setMomentForm(f => ({ ...f, moment_date: e.target.value }))}
                  className="tactical-input text-sm" style={{ width: 140 }} />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>✦ This will also be saved to your Gratitude journal</p>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>Save Moment</button>
                <button type="button" onClick={() => setShowAddMoment(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Moments list */}
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {moments.length === 0 && <p className="text-xs text-center py-6 px-4" style={{ color: 'var(--text-muted)' }}>Capture moments worth remembering. They'll appear in your Gratitude journal too.</p>}
          <AnimatePresence initial={false}>
            {moments.map(m => {
              const person = people.find(p => p.id === m.person_id)
              const date = new Date(m.moment_date + 'T00:00:00')
              return (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 flex items-start gap-3 group">
                  <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0">✨</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                    {m.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {person && <span className="text-[10px] font-medium" style={{ color: person.avatar_color }}>with {person.name}</span>}
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => onDeleteMoment(m.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0"
                    style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
