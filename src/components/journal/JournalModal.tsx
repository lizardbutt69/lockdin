import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Plus, Trash2, Lock, Unlock, Settings, Sparkles, ChevronRight, ChevronLeft,
  AlertCircle, Loader2, Key
} from 'lucide-react'
import { useJournal, type JournalEntry } from '../../hooks/useJournal'
import { useJournalLock } from '../../contexts/JournalLockContext'
import Anthropic from '@anthropic-ai/sdk'

const MOODS = [
  { level: 1, emoji: '😞', label: 'Low' },
  { level: 2, emoji: '😐', label: 'Meh' },
  { level: 3, emoji: '🙂', label: 'Ok' },
  { level: 4, emoji: '😊', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
]

const ANTHROPIC_KEY_STORAGE = 'lockedin_anthropic_key'

// ─── PIN screen ───────────────────────────────────────────────────────────────

function PinScreen({ onUnlock, onClose }: { onUnlock: () => void; onClose: () => void }) {
  const { unlock } = useJournalLock()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleDigit(i: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    setError(false)
    if (val && i < 3) inputRefs.current[i + 1]?.focus()
    if (next.every(d => d !== '') && i === 3) {
      const pin = next.join('')
      if (unlock(pin)) {
        onUnlock()
      } else {
        setError(true)
        setDigits(['', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 50)
      }
    }
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <Lock className="w-6 h-6" style={{ color: '#16a34a' }} />
        </div>
        <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Journal locked</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Enter your 4-digit PIN to continue</p>
      </div>

      <div className="flex gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            autoFocus={i === 0}
            className="w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all"
            style={{
              border: `2px solid ${error ? '#fca5a5' : d ? '#22c55e' : 'var(--border-default)'}`,
              background: error ? '#fef2f2' : 'var(--bg-input)',
              color: 'var(--text-primary)',
            }}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm font-medium" style={{ color: '#ef4444' }}>Incorrect PIN. Try again.</p>
      )}

      <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Cancel
      </button>
    </div>
  )
}

// ─── PIN setup ────────────────────────────────────────────────────────────────

function PinSetup({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { setPin } = useJournalLock()
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [error, setError] = useState('')

  function handleFirst(val: string) {
    if (val.length <= 4 && /^\d*$/.test(val)) setFirst(val)
    if (val.length === 4) setStep('confirm')
  }

  function handleConfirm(val: string) {
    if (val.length <= 4 && /^\d*$/.test(val)) {
      setSecond(val)
      if (val.length === 4) {
        if (val === first) {
          setPin(val)
          onDone()
        } else {
          setError("PINs don't match. Try again.")
          setFirst('')
          setSecond('')
          setStep('create')
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <Lock className="w-6 h-6" style={{ color: '#16a34a' }} />
        </div>
        <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
          {step === 'create' ? 'Create a PIN' : 'Confirm your PIN'}
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {step === 'create' ? 'Choose a 4-digit PIN for your journal' : 'Enter the same PIN again'}
        </p>
      </div>

      <input
        key={step}
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={step === 'create' ? first : second}
        onChange={e => step === 'create' ? handleFirst(e.target.value) : handleConfirm(e.target.value)}
        autoFocus
        placeholder="••••"
        className="w-32 h-14 text-center text-3xl font-bold rounded-xl outline-none tracking-[0.5em]"
        style={{ border: '2px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
      />

      {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

      <button onClick={onCancel} className="text-sm" style={{ color: 'var(--text-muted)' }}>Cancel</button>
    </div>
  )
}

// ─── AI Summary ───────────────────────────────────────────────────────────────

function AISummaryPanel({ entries, onClose }: { entries: JournalEntry[]; onClose: () => void }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(ANTHROPIC_KEY_STORAGE) || '')
  const [range, setRange] = useState<7 | 30>(7)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem(ANTHROPIC_KEY_STORAGE))

  async function generate() {
    if (!apiKey.trim()) { setShowKeyInput(true); return }
    localStorage.setItem(ANTHROPIC_KEY_STORAGE, apiKey.trim())

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    const recent = entries.filter(e => new Date(e.entry_date) >= cutoff)

    if (recent.length === 0) {
      setError(`No journal entries in the last ${range} days.`)
      return
    }

    setLoading(true)
    setSummary('')
    setError('')

    const entriesText = recent
      .map(e => `Date: ${e.entry_date}\nMood: ${e.mood}/5\nTitle: ${e.title || 'Untitled'}\n${e.content}`)
      .join('\n\n---\n\n')

    try {
      const client = new Anthropic({ apiKey: apiKey.trim(), dangerouslyAllowBrowser: true })
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a thoughtful therapist and life coach helping a man reflect on his recent journal entries. Provide a warm, honest, and encouraging summary of the last ${range} days of his life based on these journal entries. Focus on:\n1. Emotional patterns and mood trends\n2. Recurring themes or concerns\n3. Wins and positive moments to celebrate\n4. One or two gentle areas of growth to consider\n\nBe direct but compassionate. Use plain, readable language — no bullet-point overload. Write 3-4 paragraphs.\n\nJournal entries:\n\n${entriesText}`,
        }],
      })
      setSummary((response.content[0] as { type: string; text: string }).text)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      if (msg.includes('CORS') || msg.includes('fetch')) {
        setError('Browser API calls are blocked. Go to Supabase → Edge Functions to set up a proxy, or use the app from a non-browser environment.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: '#7c3aed' }} />
          <span className="font-semibold text-sm font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>AI Reflection</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* API Key input */}
        {showKeyInput && (
          <div className="p-4 rounded-xl space-y-3" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" style={{ color: '#7c3aed' }} />
              <span className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Anthropic API Key</span>
            </div>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Your key is stored locally on your device only. Get one at console.anthropic.com.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="tactical-input text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { if (apiKey) { localStorage.setItem(ANTHROPIC_KEY_STORAGE, apiKey); setShowKeyInput(false) } }}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                style={{ background: '#7c3aed' }}
              >
                Save key
              </button>
              <button onClick={() => setShowKeyInput(false)} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#6b7280' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Range selector */}
        <div className="flex gap-2">
          {([7, 30] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: range === r ? '#f5f3ff' : 'var(--bg-input)',
                border: `1px solid ${range === r ? '#c4b5fd' : 'var(--border-default)'}`,
                color: range === r ? '#7c3aed' : 'var(--text-muted)',
              }}
            >
              Last {r} days
            </button>
          ))}
        </div>

        {!showKeyInput && (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#7c3aed' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate reflection</>}
          </button>
        )}

        {!apiKey && !showKeyInput && (
          <button onClick={() => setShowKeyInput(true)} className="flex items-center gap-1.5 text-xs" style={{ color: '#7c3aed' }}>
            <Key className="w-3 h-3" /> Change API key
          </button>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg text-sm" style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
            style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: 'var(--text-secondary)' }}
          >
            {summary}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── Main JournalModal ────────────────────────────────────────────────────────

interface JournalModalProps {
  onClose: () => void
}

export default function JournalModal({ onClose }: JournalModalProps) {
  const { entries, loading, saveEntry, deleteEntry, todayEntry, today } = useJournal()
  const { isLocked, hasPIN, lock, removePin } = useJournalLock()

  const [selected, setSelected] = useState<JournalEntry | 'new' | null>(null)
  const [draft, setDraft] = useState({ mood: 3, title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Default to today's entry or new — on mobile stay on list view
  useEffect(() => {
    if (loading) return
    if (todayEntry) {
      setSelected(todayEntry)
      setDraft({ mood: todayEntry.mood, title: todayEntry.title || '', content: todayEntry.content })
    } else {
      setSelected('new')
      setDraft({ mood: 3, title: '', content: '' })
    }
  }, [loading, todayEntry])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [draft.content])

  function selectEntry(entry: JournalEntry) {
    setSelected(entry)
    setDraft({ mood: entry.mood, title: entry.title || '', content: entry.content })
    setShowAI(false)
    setMobileView('editor')
  }

  function newEntry() {
    setSelected('new')
    setDraft({ mood: 3, title: '', content: '' })
    setShowAI(false)
    setMobileView('editor')
  }

  async function handleSave() {
    if (!draft.content.trim()) return
    setSaving(true)
    await saveEntry({
      id: selected !== 'new' && selected ? selected.id : undefined,
      entry_date: selected !== 'new' && selected ? selected.entry_date : today,
      mood: draft.mood,
      title: draft.title,
      content: draft.content,
    })
    setSaving(false)
  }

  async function handleDelete(entry: JournalEntry) {
    if (!confirm('Delete this entry?')) return
    await deleteEntry(entry.id)
    newEntry()
  }

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const moodEmoji = (m: number) => MOODS.find(x => x.level === m)?.emoji ?? '🙂'

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
        >
          <div style={{ height: 320 }}>
            <PinScreen onUnlock={() => {}} onClose={onClose} />
          </div>
        </motion.div>
      </div>
    )
  }

  if (showPinSetup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
        >
          <div style={{ height: 360 }}>
            <PinSetup onDone={() => setShowPinSetup(false)} onCancel={() => setShowPinSetup(false)} />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative flex flex-col sm:flex-row w-full h-full sm:h-auto overflow-hidden sm:rounded-2xl"
        style={{
          background: 'var(--bg-card)',
          maxWidth: 900,
          maxHeight: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Close button — top-right, always visible */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ─ Left sidebar: entry list ─ */}
        <div
          className={`${mobileView === 'editor' ? 'hidden sm:flex' : 'flex'} w-full sm:w-64 shrink-0 flex-col border-b sm:border-b-0 sm:border-r`}
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-subtle)' }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="font-bold font-['Plus_Jakarta_Sans'] text-base" style={{ color: 'var(--text-primary)' }}>Journal</h2>
            <div className="flex gap-1">
              <button
                onClick={() => { setShowAI(!showAI); if (!showAI) setMobileView('editor') }}
                className="p-1.5 rounded-lg transition-colors"
                title="AI Reflection"
                style={{ background: showAI ? '#f5f3ff' : 'transparent', color: showAI ? '#7c3aed' : 'var(--text-muted)' }}
                onMouseEnter={e => { if (!showAI) e.currentTarget.style.background = 'var(--bg-subtle)' }}
                onMouseLeave={e => { if (!showAI) e.currentTarget.style.background = 'transparent' }}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => hasPIN ? lock() : setShowPinSetup(true)}
                className="p-1.5 rounded-lg transition-colors"
                title={hasPIN ? 'Lock journal' : 'Set PIN'}
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {hasPIN ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New entry button */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <button
              onClick={newEntry}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: selected === 'new' ? '#f0fdf4' : 'var(--bg-card)',
                border: `1px solid ${selected === 'new' ? '#bbf7d0' : 'var(--border-default)'}`,
                color: selected === 'new' ? '#15803d' : 'var(--text-secondary)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              New entry
            </button>
          </div>

          {/* Entry list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
            ) : entries.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No entries yet.</div>
            ) : (
              entries.map(entry => {
                const isActive = selected !== 'new' && selected?.id === entry.id
                return (
                  <button
                    key={entry.id}
                    onClick={() => selectEntry(entry)}
                    className="w-full text-left px-4 py-3 border-b transition-colors"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      background: isActive ? '#f0fdf4' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: isActive ? '#15803d' : 'var(--text-secondary)' }}>
                        {formatDate(entry.entry_date)}
                      </span>
                      <span className="text-sm">{moodEmoji(entry.mood)}</span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {entry.title || entry.content.slice(0, 40) || 'Empty'}
                    </p>
                  </button>
                )
              })
            )}
          </div>

          {/* Settings */}
          {hasPIN && (
            <div className="p-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <button
                onClick={removePin}
                className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
              >
                <Settings className="w-3 h-3" />
                Remove PIN
              </button>
            </div>
          )}
        </div>

        {/* ─ Main area: editor or AI panel ─ */}
        <AnimatePresence mode="wait">
          {showAI ? (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${mobileView === 'list' ? 'hidden sm:flex' : 'flex'} flex-1 flex-col overflow-hidden`}
            >
              <AISummaryPanel entries={entries} onClose={() => { setShowAI(false); setMobileView('list') }} />
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${mobileView === 'list' ? 'hidden sm:flex' : 'flex'} flex-1 flex-col overflow-hidden`}
            >
              {/* Editor header */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Back button — mobile only */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="sm:hidden w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      {selected !== 'new' && selected ? formatDate(selected.entry_date) : formatDate(today)}
                    </p>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                      placeholder="Title (optional)"
                      className="text-base sm:text-lg font-bold bg-transparent outline-none w-full font-['Plus_Jakarta_Sans']"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 mr-10">
                  {selected !== 'new' && selected && (
                    <button
                      onClick={() => handleDelete(selected)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || !draft.content.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ background: '#16a34a' }}
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>

              {/* Mood selector */}
              <div className="px-4 sm:px-6 py-3 border-b flex items-center gap-3 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Mood</span>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.level}
                      onClick={() => setDraft(d => ({ ...d, mood: m.level }))}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all text-center"
                      style={{
                        background: draft.mood === m.level ? '#f0fdf4' : 'transparent',
                        border: `1px solid ${draft.mood === m.level ? '#bbf7d0' : 'transparent'}`,
                      }}
                      title={m.label}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="text-[9px]" style={{ color: draft.mood === m.level ? '#16a34a' : '#9ca3af' }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <textarea
                  ref={textareaRef}
                  value={draft.content}
                  onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                  placeholder="What's on your mind today? Write freely — this is your space..."
                  className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
                  style={{
                    color: 'var(--text-secondary)',
                    minHeight: 180,
                    fontFamily: 'Inter, sans-serif',
                    caretColor: '#22c55e',
                  }}
                />
              </div>

              {/* Footer word count */}
              <div className="px-4 sm:px-6 py-2 border-t shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {draft.content.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
