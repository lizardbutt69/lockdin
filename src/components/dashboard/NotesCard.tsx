import { useState, useRef } from 'react'
import { StickyNote, Plus, CheckCircle2, Circle, Trash2, Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotesContext } from '../../contexts/NotesContext'

export default function NotesCard() {
  const { active, addNote, updateNote, deleteNote } = useNotesContext()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    addNote(input)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <StickyNote className="w-4 h-4" style={{ color: '#d97706' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
              Notes
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {active.length > 0 ? `${active.length} note${active.length !== 1 ? 's' : ''}` : 'Capture ideas & reminders'}
            </p>
          </div>
        </div>

        {/* Add input */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white transition-colors"
            style={{ background: '#d97706' }}
            onMouseEnter={e => e.currentTarget.style.background = '#b45309'}
            onMouseLeave={e => e.currentTarget.style.background = '#d97706'}
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Notes list */}
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {active.length === 0 ? (
              <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>
                No notes yet — jot something down
              </p>
            ) : (
              active.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2.5 group px-2 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <button
                    onClick={() => updateNote(note.id, { is_completed: !note.is_completed })}
                    className="shrink-0 mt-0.5 transition-colors"
                  >
                    {note.is_completed
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                      : <Circle className="w-4 h-4" style={{ color: 'var(--border-default)' }} />}
                  </button>
                  <span
                    className="flex-1 text-sm leading-snug"
                    style={{
                      color: note.is_completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                      textDecoration: note.is_completed ? 'line-through' : 'none',
                    }}
                  >
                    {note.content}
                  </span>
                  <div className="flex gap-1 opacity-40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => updateNote(note.id, { is_archived: true })}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#d97706'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Archive"
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
