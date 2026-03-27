import { useState, useEffect } from 'react'
import { Plus, X, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PRAYER_QUOTES = [
  { text: "A man is powerful on his knees.", author: "Corrie ten Boom" },
  { text: "The prayer of a righteous person is powerful and effective.", author: "James 5:16" },
  { text: "Prayer does not change God, but it changes him who prays.", author: "Søren Kierkegaard" },
  { text: "To be a Christian without prayer is no more possible than to be alive without breathing.", author: "Martin Luther" },
  { text: "You can do more than pray after you have prayed, but you cannot do more than pray until you have prayed.", author: "John Bunyan" },
  { text: "God shapes the world by prayer.", author: "E.M. Bounds" },
  { text: "The more you pray, the less you'll panic.", author: "Rick Warren" },
  { text: "Don't pray when you feel like it. Have an appointment with the Lord and keep it.", author: "Corrie ten Boom" },
  { text: "He who runs from God in the morning will scarcely find Him the rest of the day.", author: "John Bunyan" },
  { text: "Certain thoughts are prayers. There are moments when, whatever the attitude of the body, the soul is on its knees.", author: "Victor Hugo" },
  { text: "Prayer is not asking. It is a longing of the soul.", author: "Mahatma Gandhi" },
  { text: "The Christian on his knees sees more than the philosopher on his tiptoes.", author: "D.L. Moody" },
  { text: "Pray, and let God worry.", author: "Martin Luther" },
  { text: "I have so much to do that I shall spend the first three hours in prayer.", author: "Martin Luther" },
  { text: "Do not have your concert first, and then tune your instrument afterwards. Begin the day with God.", author: "Hudson Taylor" },
  { text: "We must begin to believe that God, in the mystery of prayer, has entrusted us with a force that can move the heavenly world.", author: "Andrew Murray" },
  { text: "The sovereign Lord is my strength; he makes my feet like the feet of a deer.", author: "Habakkuk 3:19" },
]

const PRESET_ITEMS = ['Forgiveness', 'Strength', 'Love', 'Grace', 'Patience', 'Peace']
const CUSTOM_KEY = 'lockedin_prayer_custom_items'
const CHECKED_PREFIX = 'lockedin_prayer_checked_'

function getTodayKey() {
  return CHECKED_PREFIX + new Date().toISOString().split('T')[0]
}

function loadChecked(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(getTodayKey()) || '{}')
  } catch { return {} }
}

function saveChecked(checked: Record<string, boolean>) {
  localStorage.setItem(getTodayKey(), JSON.stringify(checked))
}

function loadCustom(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]')
  } catch { return [] }
}

function saveCustom(items: string[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(items))
}

function getDailyQuoteIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const day = Math.floor((Date.now() - start.getTime()) / 86400000)
  return day % PRAYER_QUOTES.length
}

export default function PrayerColumn() {
  const [quoteIdx, setQuoteIdx] = useState(getDailyQuoteIndex())
  const [quoteAnimKey, setQuoteAnimKey] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked)
  const [custom, setCustom] = useState<string[]>(loadCustom)
  const [newItem, setNewItem] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const quote = PRAYER_QUOTES[quoteIdx]
  const allItems = [...PRESET_ITEMS, ...custom]
  const checkedCount = allItems.filter(i => checked[i]).length

  function nextQuote() {
    setQuoteIdx(i => (i + 1) % PRAYER_QUOTES.length)
    setQuoteAnimKey(k => k + 1)
  }

  function toggle(item: string) {
    const next = { ...checked, [item]: !checked[item] }
    setChecked(next)
    saveChecked(next)
  }

  function addCustom() {
    const val = newItem.trim()
    if (!val || custom.includes(val) || PRESET_ITEMS.includes(val)) return
    const next = [...custom, val]
    setCustom(next)
    saveCustom(next)
    setNewItem('')
    setShowAdd(false)
  }

  function removeCustom(item: string) {
    const next = custom.filter(c => c !== item)
    setCustom(next)
    saveCustom(next)
    const nextChecked = { ...checked }
    delete nextChecked[item]
    setChecked(nextChecked)
    saveChecked(nextChecked)
  }

  useEffect(() => {
    // Clean up old daily check keys (keep only last 7 days)
    const prefix = CHECKED_PREFIX
    Object.keys(localStorage)
      .filter(k => k.startsWith(prefix) && k !== getTodayKey())
      .slice(0, -6)
      .forEach(k => localStorage.removeItem(k))
  }, [])

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col h-full"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Prayer</h3>
          <span className="text-xs font-medium" style={{ color: checkedCount === allItems.length && allItems.length > 0 ? '#16a34a' : 'var(--text-muted)' }}>
            {checkedCount}/{allItems.length}
          </span>
        </div>
      </div>

      {/* Quote */}
      <div className="px-4 py-3 border-b shrink-0" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'var(--border-subtle)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteAnimKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm leading-relaxed italic mb-1" style={{ color: 'var(--text-secondary)' }}>
              "{quote.text}"
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>— {quote.author}</p>
              <button
                onClick={nextQuote}
                className="p-1 rounded transition-colors"
                style={{ color: '#c4b5fd' }}
                onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.color = '#c4b5fd'}
                title="Next quote"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-1">
          {allItems.map(item => {
            const isCustom = custom.includes(item)
            const done = !!checked[item]
            return (
              <motion.div
                key={item}
                layout
                className="flex items-center gap-3 py-2.5 group border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <button
                  onClick={() => toggle(item)}
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: `2px solid ${done ? '#7c3aed' : 'var(--border-default)'}`,
                    background: done ? '#7c3aed' : 'transparent',
                  }}
                >
                  {done && <span className="text-white text-[9px] font-bold">✓</span>}
                </button>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: done ? 'var(--text-muted)' : 'var(--text-secondary)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}
                >
                  {item}
                </span>
                {isCustom && (
                  <button
                    onClick={() => removeCustom(item)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                    style={{ color: 'var(--border-default)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--border-default)'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Add custom */}
      <div className="px-4 py-3 shrink-0 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <AnimatePresence>
          {showAdd ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') setShowAdd(false) }}
                placeholder="e.g. Wisdom"
                className="flex-1 px-2.5 py-1.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={addCustom}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: '#7c3aed' }}
              >
                Add
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-2 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Plus className="w-3.5 h-3.5" />
              Add prayer intention
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
