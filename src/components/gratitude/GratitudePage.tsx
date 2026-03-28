import { useState, useEffect } from 'react'
import { Sparkles, Trash2, Plus, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type GratitudeEntry = Database['public']['Tables']['gratitude_entries']['Row']

interface CareerWin {
  id: string
  title: string
  description: string | null
  category: string
  win_date: string
}

const WIN_CATS: Record<string, { label: string; color: string; bg: string }> = {
  SHIPPED:     { label: 'Shipped',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  RECOGNITION: { label: 'Recognition',color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  SKILL:       { label: 'Skill',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  REVENUE:     { label: 'Revenue',     color: '#16a34a', bg: 'rgba(22,163,74,0.12)'   },
  LEADERSHIP:  { label: 'Leadership',  color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  PROMOTED:    { label: 'Promoted',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  OTHER:       { label: 'Other',       color: '#64748b', bg: 'rgba(100,116,139,0.1)'  },
}

type Category = 'grateful' | 'win' | 'smile' | 'moment'

const CATEGORIES: { key: Category; label: string; emoji: string; color: string; bg: string; border: string; placeholder: string }[] = [
  {
    key: 'grateful',
    label: 'Grateful For',
    emoji: '🙏',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    placeholder: "What are you grateful for today?",
  },
  {
    key: 'win',
    label: 'Win',
    emoji: '🏆',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    placeholder: "What did you accomplish? Big or small, it counts.",
  },
  {
    key: 'smile',
    label: 'Made Me Smile',
    emoji: '😊',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.2)',
    placeholder: "What made you smile today?",
  },
  {
    key: 'moment',
    label: 'Meaningful Moment',
    emoji: '🤝',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.2)',
    placeholder: "A meaningful moment with someone you care about.",
  },
]

function getCategoryConfig(key: string) {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[0]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Entry Card ────────────────────────────────────────────────────────────────

function EntryCard({ entry, onDelete }: { entry: GratitudeEntry; onDelete: (id: string) => void }) {
  const cat = getCategoryConfig(entry.category)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={{ background: 'var(--bg-card)', color: cat.color, border: `1px solid ${cat.border}` }}
        >
          <span>{cat.emoji}</span>
          {cat.label}
        </span>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {entry.content}
      </p>

      {/* Date */}
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {formatDate(entry.created_at)}
      </p>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function GratitudePage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [careerWins, setCareerWins] = useState<CareerWin[]>([])
  const [activeCategory, setActiveCategory] = useState<Category>('grateful')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setEntries(data) });
    (supabase as any)
      .from('win_log')
      .select('id, title, description, category, win_date')
      .eq('user_id', user.id)
      .order('win_date', { ascending: false })
      .then(({ data }: { data: CareerWin[] | null }) => { if (data) setCareerWins(data) })
  }, [user])

  const cat = getCategoryConfig(activeCategory)

  async function addEntry() {
    setError('')
    if (!user) { setError('Not logged in.'); return }
    if (!content.trim()) { setError('Write something first.'); return }

    const payload = { user_id: user.id, category: activeCategory, content: content.trim() }
    setSaving(true)

    if (!isSupabaseConfigured) {
      const demo: GratitudeEntry = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      setEntries(e => [demo, ...e])
    } else {
      const { data, error: sbError } = await supabase.from('gratitude_entries').insert(payload).select().single()
      if (sbError) { setError(sbError.message); setSaving(false); return }
      if (data) setEntries(e => [data, ...e])
    }

    setSaving(false)
    setContent('')
  }

  async function deleteEntry(id: string) {
    setEntries(e => e.filter(x => x.id !== id))
    if (isSupabaseConfigured) {
      await supabase.from('gratitude_entries').delete().eq('id', id)
    }
  }

  const filtered = filterCategory === 'all' ? entries : entries.filter(e => e.category === filterCategory)
  const totalByCategory = (key: Category) => entries.filter(e => e.category === key).length

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
                Gratitude
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Wins, gratitude & things to smile about
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 flex-wrap">
            {CATEGORIES.map(c => (
              <div key={c.key} className="text-center">
                <div className="text-lg font-bold font-['Plus_Jakarta_Sans']" style={{ color: c.color }}>
                  {totalByCategory(c.key)}
                </div>
                <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {c.emoji} {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add Entry ── */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--bg-card)', border: `1px solid ${cat.border}`, transition: 'border-color 0.2s' }}
      >
        {/* Category selector */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveCategory(c.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeCategory === c.key ? c.bg : 'var(--bg-subtle)',
                border: `1px solid ${activeCategory === c.key ? c.border : 'var(--border-default)'}`,
                color: activeCategory === c.key ? c.color : 'var(--text-muted)',
              }}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addEntry() }}
          placeholder={cat.placeholder}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors"
          style={{
            background: cat.bg,
            border: `1px solid ${cat.border}`,
            color: 'var(--text-primary)',
          }}
        />

        {error && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ⌘ + Enter to save
          </p>
          <button
            type="button"
            onClick={addEntry}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: saving || !content.trim() ? 'var(--bg-subtle)' : cat.color,
              color: saving || !content.trim() ? 'var(--text-muted)' : 'white',
              cursor: saving || !content.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Saving...' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      {entries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: filterCategory === 'all' ? 'var(--bg-card)' : 'transparent',
              border: `1px solid ${filterCategory === 'all' ? 'var(--border-default)' : 'transparent'}`,
              color: filterCategory === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            All · {entries.length}
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilterCategory(c.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filterCategory === c.key ? c.bg : 'transparent',
                border: `1px solid ${filterCategory === c.key ? c.border : 'transparent'}`,
                color: filterCategory === c.key ? c.color : 'var(--text-muted)',
              }}
            >
              <span>{c.emoji}</span>
              {c.label} · {totalByCategory(c.key)}
            </button>
          ))}
        </div>
      )}

      {/* ── Entries grid ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={{ border: '1px dashed var(--border-default)' }}
        >
          <div className="text-4xl mb-3">
            {filterCategory === 'all' ? '✨' : getCategoryConfig(filterCategory).emoji}
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {filterCategory === 'all' ? 'Nothing here yet' : `No ${getCategoryConfig(filterCategory).label.toLowerCase()} entries yet`}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Add your first entry above
          </p>
        </div>
      ) : (
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(entry => (
              <div key={entry.id} className="break-inside-avoid mb-4">
                <EntryCard entry={entry} onDelete={deleteEntry} />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Career Wins ── */}
      {careerWins.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <h2 className="text-sm font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Career Wins · {careerWins.length}
            </h2>
          </div>
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {careerWins.map(win => {
                const cfg = WIN_CATS[win.category] ?? WIN_CATS.OTHER
                return (
                  <div key={win.id} className="break-inside-avoid mb-4">
                    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--bg-card)', color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                          🏆 {cfg.label}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {new Date(win.win_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{win.title}</p>
                      {win.description && (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{win.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  )
}
