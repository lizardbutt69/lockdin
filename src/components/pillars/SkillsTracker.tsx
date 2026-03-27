import { useState, useCallback } from 'react'
import { Zap, Plus, Trash2, X, Check, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Skill {
  id: string
  name: string
  category: string
  level: number // 1–5
}

const ACCENT = '#2563eb'
const STORAGE_KEY = 'lockedin_skills'

const SKILL_CATS = ['TECHNICAL', 'LEADERSHIP', 'COMMUNICATION', 'DOMAIN', 'OTHER'] as const
const LEVEL_LABELS = ['', 'Learning', 'Familiar', 'Competent', 'Proficient', 'Expert']
const LEVEL_COLOR  = ['', '#94a3b8',  '#60a5fa',  '#34d399',    '#f59e0b',    '#22c55e']

function loadSkills(): Skill[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveSkills(s: Skill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function SkillDots({ level, onChange }: { level: number; onChange?: (l: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={onChange ? () => onChange(i + 1 === level ? i : i + 1) : undefined}
          className={`rounded-full transition-all ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          style={{
            width: 10, height: 10,
            background: i < level ? LEVEL_COLOR[level] : 'var(--border-default)',
          }}
        />
      ))}
    </div>
  )
}

export default function SkillsTracker() {
  const [skills, setSkills] = useState<Skill[]>(loadSkills)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'TECHNICAL', level: 1 })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', category: 'TECHNICAL', level: 1 })
  const [filter, setFilter] = useState<string | null>(null)

  const persist = useCallback((next: Skill[]) => { setSkills(next); saveSkills(next) }, [])

  function handleAdd() {
    if (!form.name.trim()) return
    const newSkill: Skill = { id: `skill_${Date.now()}`, name: form.name.trim(), category: form.category, level: form.level }
    persist([...skills, newSkill])
    setForm({ name: '', category: 'TECHNICAL', level: 1 })
    setShowAdd(false)
  }

  function handleDelete(id: string) {
    persist(skills.filter(s => s.id !== id))
  }

  function openEdit(s: Skill) {
    setEditId(s.id)
    setEditForm({ name: s.name, category: s.category, level: s.level })
  }

  function saveEdit() {
    persist(skills.map(s => s.id === editId ? { ...s, ...editForm, name: editForm.name.trim() || s.name } : s))
    setEditId(null)
  }

  function updateLevel(id: string, level: number) {
    persist(skills.map(s => s.id === id ? { ...s, level } : s))
  }

  const usedCats = [...new Set(skills.map(s => s.category))]
  const displayed = filter ? skills.filter(s => s.category === filter) : skills

  // Group by category for display
  const grouped = displayed.reduce<Record<string, Skill[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] ?? []), s]
    return acc
  }, {})

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
            <Zap className="w-3.5 h-3.5" style={{ color: ACCENT }} />
          </div>
          <h3 className="text-sm font-semibold font-['Space_Grotesk'] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Skills</h3>
          {skills.length > 0 && (
            <span className="text-xs font-bold tabular-nums" style={{ color: ACCENT }}>{skills.length}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: showAdd ? `${ACCENT}18` : 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: showAdd ? ACCENT : 'var(--text-muted)' }}
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2.5 border-b" style={{ borderColor: 'var(--border-subtle)', background: `${ACCENT}06` }}>
              <input
                autoFocus
                type="text"
                placeholder="Skill name (e.g. React, SQL, Public Speaking)"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="tactical-input text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {SKILL_CATS.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all capitalize"
                    style={{
                      background: form.category === cat ? `${ACCENT}18` : 'var(--bg-subtle)',
                      border: `1px solid ${form.category === cat ? ACCENT : 'var(--border-default)'}`,
                      color: form.category === cat ? ACCENT : 'var(--text-muted)',
                    }}
                  >{cat.charAt(0) + cat.slice(1).toLowerCase()}</button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Level:</span>
                  <SkillDots level={form.level} onChange={l => setForm(f => ({ ...f, level: l }))} />
                  <span className="text-xs font-medium" style={{ color: LEVEL_COLOR[form.level] }}>{LEVEL_LABELS[form.level]}</span>
                </div>
                <button type="button" onClick={handleAdd}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5"
                  style={{ background: ACCENT }}>
                  <Check className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      {usedCats.length > 1 && (
        <div className="px-4 pt-3 flex flex-wrap gap-1.5">
          <button type="button"
            onClick={() => setFilter(null)}
            className="px-2 py-0.5 rounded text-[10px] font-semibold"
            style={{ background: !filter ? `${ACCENT}18` : 'var(--bg-subtle)', color: !filter ? ACCENT : 'var(--text-muted)', border: `1px solid ${!filter ? ACCENT : 'var(--border-default)'}` }}
          >All</button>
          {usedCats.map(cat => (
            <button key={cat} type="button"
              onClick={() => setFilter(filter === cat ? null : cat)}
              className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize"
              style={{ background: filter === cat ? `${ACCENT}18` : 'var(--bg-subtle)', color: filter === cat ? ACCENT : 'var(--text-muted)', border: `1px solid ${filter === cat ? ACCENT : 'var(--border-default)'}` }}
            >{cat.charAt(0) + cat.slice(1).toLowerCase()}</button>
          ))}
        </div>
      )}

      {/* Skills list */}
      <div className="px-4 py-3 space-y-1">
        {skills.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Add your first skill to start tracking proficiency.</p>
        )}
        {Object.entries(grouped).map(([cat, catSkills]) => (
          <div key={cat}>
            {usedCats.length > 1 && !filter && (
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </p>
            )}
            <AnimatePresence initial={false}>
              {catSkills.map(skill => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                >
                  {editId === skill.id ? (
                    <div className="flex items-center gap-2 py-1.5">
                      <input
                        autoFocus
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null) }}
                        className="flex-1 px-2 py-1 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--bg-input)', border: `1px solid ${ACCENT}60`, color: 'var(--text-primary)' }}
                      />
                      <SkillDots level={editForm.level} onChange={l => setEditForm(f => ({ ...f, level: l }))} />
                      <button onClick={saveEdit} className="p-1 rounded" style={{ color: ACCENT }}><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditId(null)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-1.5 group">
                      <span className="flex-1 text-sm min-w-0 truncate" style={{ color: 'var(--text-secondary)' }}>{skill.name}</span>
                      <SkillDots level={skill.level} onChange={l => updateLevel(skill.id, l)} />
                      <span className="text-[10px] w-16 text-right" style={{ color: LEVEL_COLOR[skill.level] }}>{LEVEL_LABELS[skill.level]}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(skill)} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(skill.id)} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
