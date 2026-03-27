import { useState } from 'react'
import { Globe, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BondsGroup, BondsGiving } from '../../hooks/useBonds'

const ACCENT = '#dc2626'
const GROUP_TYPES = ['Church', 'Sports', 'Volunteer', 'Club', 'Work', 'Social', 'Other']
const GIVING_TYPES = ['Time', 'Money', 'Skills', 'Other']

interface Props {
  groups: BondsGroup[]
  giving: BondsGiving[]
  onAddGroup: (d: Omit<BondsGroup,'id'|'user_id'|'created_at'>) => void
  onToggleGroup: (id: string) => void
  onDeleteGroup: (id: string) => void
  onAddGiving: (d: Omit<BondsGiving,'id'|'user_id'|'created_at'>) => void
  onDeleteGiving: (id: string) => void
}

function toLocalISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function BondsCommunityTab({ groups, giving, onAddGroup, onToggleGroup, onDeleteGroup, onAddGiving, onDeleteGiving }: Props) {
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: '', group_type: 'Church', is_active: true, notes: '' })
  const [showAddGiving, setShowAddGiving] = useState(false)
  const [givingForm, setGivingForm] = useState({ title: '', given_date: toLocalISO(), giving_type: 'Time', notes: '' })

  function handleAddGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!groupForm.name.trim()) return
    onAddGroup({ name: groupForm.name.trim(), group_type: groupForm.group_type, is_active: true, notes: groupForm.notes.trim() || null })
    setGroupForm({ name: '', group_type: 'Church', is_active: true, notes: '' })
    setShowAddGroup(false)
  }

  function handleAddGiving(e: React.FormEvent) {
    e.preventDefault()
    if (!givingForm.title.trim()) return
    onAddGiving({ title: givingForm.title.trim(), given_date: givingForm.given_date, giving_type: givingForm.giving_type, notes: givingForm.notes.trim() || null })
    setGivingForm({ title: '', given_date: toLocalISO(), giving_type: 'Time', notes: '' })
    setShowAddGiving(false)
  }

  const TYPE_COLORS: Record<string, string> = {
    Time: '#3b82f6', Money: '#22c55e', Skills: '#8b5cf6', Other: '#64748b'
  }

  return (
    <div className="space-y-4">
      {/* Groups */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
              <Globe className="w-3 h-3" style={{ color: ACCENT }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Groups & Commitments</span>
            {groups.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{groups.filter(g=>g.is_active).length} active</span>}
          </div>
          <button onClick={() => setShowAddGroup(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAddGroup ? `${ACCENT}15` : 'var(--bg-subtle)', border: `1px solid ${showAddGroup ? ACCENT : 'var(--border-default)'}`, color: showAddGroup ? ACCENT : 'var(--text-muted)' }}>
            {showAddGroup ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        <AnimatePresence>
          {showAddGroup && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddGroup} className="px-4 py-3 border-b space-y-2.5 overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-2">
                <input value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Group name" className="tactical-input text-sm flex-1" autoFocus />
                <select value={groupForm.group_type} onChange={e => setGroupForm(f => ({ ...f, group_type: e.target.value }))}
                  className="tactical-input text-sm" style={{ width: 110 }}>
                  {GROUP_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>Add Group</button>
                <button type="button" onClick={() => setShowAddGroup(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="px-3 py-3 space-y-2">
          {groups.length === 0 && <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>Add the communities and groups you're part of</p>}
          <AnimatePresence initial={false}>
            {groups.map(g => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg group"
                style={{ background: 'var(--bg-subtle)', opacity: g.is_active ? 1 : 0.5 }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{g.group_type}</p>
                </div>
                <button onClick={() => onToggleGroup(g.id)} className="p-1 rounded transition-colors" style={{ color: g.is_active ? ACCENT : 'var(--text-muted)' }}>
                  {g.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => onDeleteGroup(g.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0"
                  style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Giving Log */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">🤲</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Giving & Volunteering</span>
            {giving.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{giving.length}</span>}
          </div>
          <button onClick={() => setShowAddGiving(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showAddGiving ? `${ACCENT}15` : 'var(--bg-subtle)', border: `1px solid ${showAddGiving ? ACCENT : 'var(--border-default)'}`, color: showAddGiving ? ACCENT : 'var(--text-muted)' }}>
            {showAddGiving ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        <AnimatePresence>
          {showAddGiving && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddGiving} className="px-4 py-3 border-b space-y-2.5 overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
              <input value={givingForm.title} onChange={e => setGivingForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What did you do? (e.g. Helped at food bank)" className="tactical-input text-sm" autoFocus />
              <div className="flex gap-2">
                <select value={givingForm.giving_type} onChange={e => setGivingForm(f => ({ ...f, giving_type: e.target.value }))}
                  className="tactical-input text-sm flex-1">
                  {GIVING_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="date" value={givingForm.given_date} onChange={e => setGivingForm(f => ({ ...f, given_date: e.target.value }))}
                  className="tactical-input text-sm" style={{ width: 140 }} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>Log It</button>
                <button type="button" onClick={() => setShowAddGiving(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {giving.length === 0 && <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>Log your acts of service and giving</p>}
          <AnimatePresence initial={false}>
            {giving.map(g => {
              const color = TYPE_COLORS[g.giving_type] ?? '#64748b'
              return (
                <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 flex items-center gap-3 group">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{g.giving_type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g.title}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(g.given_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => onDeleteGiving(g.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0"
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
