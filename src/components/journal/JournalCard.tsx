import { useState } from 'react'
import { BookOpen, Lock, Plus, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJournal } from '../../hooks/useJournal'
import { useJournalLock } from '../../contexts/JournalLockContext'
import JournalModal from './JournalModal'

const MOODS = [
  { level: 1, emoji: '😞', label: 'Low' },
  { level: 2, emoji: '😐', label: 'Meh' },
  { level: 3, emoji: '🙂', label: 'Ok' },
  { level: 4, emoji: '😊', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
]

// PIN Entry inline (for the lock screen on the card)
function InlinePinEntry({ onUnlock, onCancel }: { onUnlock: () => void; onCancel: () => void }) {
  const { unlock } = useJournalLock()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleChange(val: string) {
    if (val.length > 4 || !/^\d*$/.test(val)) return
    setPin(val)
    setError(false)
    if (val.length === 4) {
      if (unlock(val)) {
        onUnlock()
      } else {
        setError(true)
        setPin('')
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <Lock className="w-5 h-5" style={{ color: '#16a34a' }} />
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Enter PIN to open journal</p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={e => handleChange(e.target.value)}
        placeholder="••••"
        autoFocus
        className="w-24 h-10 text-center text-xl font-bold rounded-lg outline-none tracking-[0.4em]"
        style={{
          border: `2px solid ${error ? '#fca5a5' : 'var(--border-default)'}`,
          background: error ? '#fef2f2' : 'var(--bg-input)',
          color: 'var(--text-primary)',
        }}
      />
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>Incorrect PIN</p>}
      <button onClick={onCancel} className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
    </div>
  )
}

export default function JournalCard() {
  const { todayEntry, loading } = useJournal()
  const { isLocked, hasPIN } = useJournalLock()
  const [showModal, setShowModal] = useState(false)
  const [showPinEntry, setShowPinEntry] = useState(false)
  const [previewHidden, setPreviewHidden] = useState(false)

  const hasEntry = !!todayEntry
  const mood = MOODS.find(m => m.level === todayEntry?.mood)

  function open() {
    if (isLocked && hasPIN) {
      setShowPinEntry(true)
    } else {
      setShowModal(true)
    }
  }

  return (
    <>
      <div
        className="w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
        onClick={!showPinEntry ? open : undefined}
      >
        {/* Top accent */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />

        <div className="p-4">
          <AnimatePresence mode="wait">
            {showPinEntry ? (
              <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InlinePinEntry
                  onUnlock={() => { setShowPinEntry(false); setShowModal(true) }}
                  onCancel={() => setShowPinEntry(false)}
                />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <BookOpen className="w-4 h-4" style={{ color: '#16a34a' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
                          Today's Journal
                        </h3>
                        {hasPIN && <Lock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
                        {hasEntry && (
                          <button
                            onClick={e => { e.stopPropagation(); setPreviewHidden(v => !v) }}
                            className="p-0.5 rounded transition-colors"
                            title={previewHidden ? 'Show preview' : 'Hide preview'}
                          >
                            {previewHidden
                              ? <EyeOff className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                              : <Eye className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
                          </button>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {loading
                          ? 'Loading...'
                          : hasEntry
                          ? `${mood?.emoji} ${mood?.label} · ${todayEntry!.content.split(/\s+/).filter(Boolean).length} words`
                          : 'Start your daily reflection'}
                      </p>
                    </div>
                  </div>

                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0 transition-colors"
                    style={{ background: '#16a34a' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                    onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                  >
                    {hasEntry ? <><ChevronRight className="w-3 h-3" />Open</> : <><Plus className="w-3 h-3" />Write</>}
                  </button>
                </div>

                {/* Today's preview */}
                {hasEntry && todayEntry && !previewHidden && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm leading-relaxed line-clamp-2 pl-11"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {todayEntry.content}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <JournalModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}
