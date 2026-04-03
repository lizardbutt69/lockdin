import { useState, useEffect, useRef, useCallback } from 'react'
import { Brain, Plus, Trash2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BondsCheckIn } from '../../hooks/useBonds'

const ACCENT = '#dc2626'
const STORAGE_KEY = 'lockedin_bonds_affirmations'

const SLIDER_FIELDS: { key: keyof Pick<BondsCheckIn, 'energy'|'mood'|'mindset'>; label: string; emoji: string; color: string }[] = [
  { key: 'energy',  label: 'Energy',  emoji: '⚡', color: '#f59e0b' },
  { key: 'mood',    label: 'Mood',    emoji: '🌊', color: '#3b82f6' },
  { key: 'mindset', label: 'Mindset', emoji: '🧠', color: '#8b5cf6' },
]

const SHOWING_UP_PROMPT = "How am I showing up this week? Am I being the person I want to be?"

function loadAffirmations(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

interface Props {
  checkIn: BondsCheckIn | null
  onSaveCheckIn: (data: Partial<Pick<BondsCheckIn,'energy'|'mood'|'mindset'|'reflection'|'showing_up_text'>>) => void
}

export default function BondsSelfTab({ checkIn, onSaveCheckIn }: Props) {
  const [sliders, setSliders] = useState({ energy: checkIn?.energy ?? 3, mood: checkIn?.mood ?? 3, mindset: checkIn?.mindset ?? 3 })
  const [reflection, setReflection] = useState(checkIn?.reflection ?? '')
  const [showingUp, setShowingUp] = useState(checkIn?.showing_up_text ?? '')
  const [affirmations, setAffirmations] = useState<string[]>(loadAffirmations)
  const [newAffirmation, setNewAffirmation] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (checkIn) {
      setSliders({ energy: checkIn.energy ?? 3, mood: checkIn.mood ?? 3, mindset: checkIn.mindset ?? 3 })
      setReflection(checkIn.reflection ?? '')
      setShowingUp(checkIn.showing_up_text ?? '')
    }
  }, [checkIn])

  const debouncedSave = useCallback((data: Parameters<typeof onSaveCheckIn>[0]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSaveCheckIn(data), 800)
  }, [onSaveCheckIn])

  function handleSlider(key: keyof typeof sliders, val: number) {
    const next = { ...sliders, [key]: val }
    setSliders(next)
    debouncedSave({ ...next, reflection, showing_up_text: showingUp })
  }

  function handleReflection(val: string) {
    setReflection(val)
    debouncedSave({ ...sliders, reflection: val, showing_up_text: showingUp })
  }

  function handleShowingUp(val: string) {
    setShowingUp(val)
    debouncedSave({ ...sliders, reflection, showing_up_text: val })
  }

  function addAffirmation() {
    if (!newAffirmation.trim()) return
    const next = [...affirmations, newAffirmation.trim()]
    setAffirmations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setNewAffirmation('')
  }

  function deleteAffirmation(i: number) {
    const next = affirmations.filter((_, idx) => idx !== i)
    setAffirmations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <div className="space-y-4">
      {/* Daily Check-in */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
            <Brain className="w-3 h-3" style={{ color: ACCENT }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Check-in</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>Today</span>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Sliders */}
          {SLIDER_FIELDS.map(({ key, label, emoji, color }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{emoji} {label}</span>
                <span className="text-xs font-bold" style={{ color }}>{sliders[key]}/5</span>
              </div>
              <input
                type="range" min={1} max={5} step={1} value={sliders[key]}
                onChange={e => handleSlider(key, Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${(sliders[key]-1)/4*100}%, var(--bg-subtle) ${(sliders[key]-1)/4*100}%)` }}
              />
              <div className="flex justify-between mt-1">
                {['Low','','Mid','','High'].map((l, i) => (
                  <span key={i} className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{l}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Reflection */}
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Reflection</p>
            <textarea
              value={reflection} onChange={e => handleReflection(e.target.value)}
              placeholder="What's on your mind today?"
              rows={2} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              onFocus={e => e.currentTarget.style.borderColor = `${ACCENT}60`}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>
        </div>
      </div>

      {/* How am I showing up */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>How am I showing up?</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>Weekly</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs mb-2 italic" style={{ color: 'var(--text-muted)' }}>{SHOWING_UP_PROMPT}</p>
          <textarea
            value={showingUp} onChange={e => handleShowingUp(e.target.value)}
            placeholder="Write freely..."
            rows={3} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            onFocus={e => e.currentTarget.style.borderColor = `${ACCENT}60`}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          />
        </div>
      </div>

      {/* Affirmations */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">💪</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Affirmations</span>
            {affirmations.length > 0 && <span className="text-xs font-bold" style={{ color: ACCENT }}>{affirmations.length}</span>}
          </div>
        </div>
        <div className="px-4 py-3 space-y-2">
          <AnimatePresence initial={false}>
            {affirmations.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 group px-3 py-2 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
                <span className="text-sm" style={{ color: ACCENT }}>✦</span>
                <p className="flex-1 text-sm italic leading-snug" style={{ color: 'var(--text-primary)' }}>{a}</p>
                <button onClick={() => deleteAffirmation(i)} className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded transition-all shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {affirmations.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>Add your daily affirmations</p>
          )}
          <div className="flex gap-2 pt-1">
            <input value={newAffirmation} onChange={e => setNewAffirmation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAffirmation()}
              placeholder="I am..." className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            <button onClick={addAffirmation} className="px-3 py-1.5 rounded-lg text-white shrink-0" style={{ background: ACCENT }}>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
