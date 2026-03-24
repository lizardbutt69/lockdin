import { useState, useRef } from 'react'
import { StickyNote, Plus, CheckCircle2, Circle, Trash2, ChevronDown, ChevronRight, Archive, ArchiveRestore } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotesContext } from '../../contexts/NotesContext'

export default function SidebarNotes() {
  const { active, archived, addNote, updateNote, deleteNote } = useNotesContext()
  const [input, setInput] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    addNote(input)
    setInput('')
    setShowAdd(false)
  }

  return (
    <div className="border-b" style={{ borderColor: 'var(--border-default)' }}>
      {/* Section header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-2">
          <StickyNote className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
          <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            Notes
          </span>
          {active.length > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: '#fef3c7', color: '#d97706' }}
            >
              {active.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!collapsed && (
            <button
              onClick={e => { e.stopPropagation(); setShowAdd(v => !v); setTimeout(() => inputRef.current?.focus(), 50) }}
              className="w-5 h-5 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#d97706'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          {collapsed
            ? <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Add input */}
            <AnimatePresence>
              {showAdd && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAdd}
                  className="px-3 pb-2"
                >
                  <div className="flex gap-1.5">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Escape' && setShowAdd(false)}
                      placeholder="New note..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
                      style={{ background: '#d97706' }}
                    >
                      Add
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Active notes */}
            <div className="px-3 pb-1 space-y-0.5">
              {active.length === 0 && !showAdd && (
                <p className="text-[11px] py-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  No notes yet
                </p>
              )}
              <AnimatePresence initial={false}>
                {active.map(note => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 group py-1.5 px-1.5 rounded-lg transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <button
                      onClick={() => updateNote(note.id, { is_completed: !note.is_completed })}
                      className="shrink-0 mt-0.5"
                    >
                      {note.is_completed
                        ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                        : <Circle className="w-3.5 h-3.5" style={{ color: 'var(--border-default)' }} />}
                    </button>
                    <span
                      className="flex-1 text-xs leading-snug break-words min-w-0"
                      style={{
                        color: note.is_completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: note.is_completed ? 'line-through' : 'none',
                      }}
                    >
                      {note.content}
                    </span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => updateNote(note.id, { is_archived: true })}
                        className="p-0.5 rounded"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#d97706'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Archive"
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-0.5 rounded"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Archived section */}
            {archived.length > 0 && (
              <div className="px-3 pb-2">
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className="flex items-center gap-1.5 w-full py-1.5 text-[10px] font-medium transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showArchived ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Archived ({archived.length})
                </button>

                <AnimatePresence>
                  {showArchived && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-0.5 mt-0.5"
                    >
                      {archived.map(note => (
                        <div
                          key={note.id}
                          className="flex items-start gap-2 group py-1 px-1.5 rounded-lg transition-colors"
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Archive className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                          <span
                            className="flex-1 text-[11px] leading-snug break-words min-w-0 line-through"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {note.content}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => updateNote(note.id, { is_archived: false })}
                              className="p-0.5 rounded"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#16a34a'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Unarchive"
                            >
                              <ArchiveRestore className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="p-0.5 rounded"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
