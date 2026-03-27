import { useState, useEffect, useCallback } from 'react'
import { Trophy, Plus, Trash2, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Win {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  win_date: string
  created_at: string
}

const ACCENT = '#2563eb'

const WIN_CATS: Record<string, { label: string; color: string; bg: string }> = {
  SHIPPED:     { label: 'Shipped',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  RECOGNITION: { label: 'Recognition',color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  SKILL:       { label: 'Skill',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  REVENUE:     { label: 'Revenue',     color: '#16a34a', bg: 'rgba(22,163,74,0.12)'   },
  LEADERSHIP:  { label: 'Leadership',  color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  PROMOTED:    { label: 'Promoted',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  OTHER:       { label: 'Other',       color: '#64748b', bg: 'rgba(100,116,139,0.1)'  },
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WinLog() {
  const { user } = useAuth()
  const [wins, setWins] = useState<Win[]>([])
  const [showAdd, setShowAdd] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', category: 'SHIPPED', date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchWins = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return
    const { data } = await (supabase as any).from('win_log').select('*').eq('user_id', user.id).order('win_date', { ascending: false })
    if (data) setWins(data)
  }, [user])

  useEffect(() => { fetchWins() }, [fetchWins])

  async function handleAdd() {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!user || !isSupabaseConfigured) return
    setSaving(true); setError('')
    const { data, error: err } = await (supabase as any)
      .from('win_log')
      .insert({ user_id: user.id, title: form.title.trim(), description: form.description.trim() || null, category: form.category, win_date: form.date })
      .select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    if (data) setWins(prev => [data, ...prev])
    setForm({ title: '', description: '', category: 'SHIPPED', date: new Date().toISOString().slice(0, 10) })
    setShowAdd(false)
  }

  async function handleDelete(id: string) {
    setWins(prev => prev.filter(w => w.id !== id))
    await (supabase as any).from('win_log').delete().eq('id', id)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Trophy className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
          </div>
          <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Win Log</h3>
          {wins.length > 0 && (
            <span className="text-xs font-bold tabular-nums" style={{ color: '#f59e0b' }}>{wins.length}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(v => !v); setError('') }}
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
            <div className="px-4 py-3 space-y-3 border-b" style={{ borderColor: 'var(--border-subtle)', background: `${ACCENT}06` }}>
              <input
                autoFocus
                type="text"
                placeholder="What did you accomplish?"
                value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError('') }}
                className="tactical-input text-sm"
              />
              <textarea
                placeholder="Details (optional) — impact, numbers, context..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="tactical-input text-sm resize-none w-full"
              />
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(WIN_CATS).map(([key, cfg]) => (
                  <button
                    key={key} type="button"
                    onClick={() => setForm(f => ({ ...f, category: key }))}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      background: form.category === key ? cfg.bg : 'var(--bg-subtle)',
                      border: `1px solid ${form.category === key ? cfg.color : 'var(--border-default)'}`,
                      color: form.category === key ? cfg.color : 'var(--text-muted)',
                    }}
                  >{cfg.label}</button>
                ))}
              </div>
              {error && <span className="text-xs text-red-500">{error}</span>}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="tactical-input text-sm"
                  style={{ width: 140 }}
                />
                <button type="button" onClick={handleAdd} disabled={saving}
                  className="flex-1 py-1.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                  style={{ background: ACCENT, opacity: saving ? 0.7 : 1 }}>
                  <Check className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Log Win'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win list */}
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {wins.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No wins logged yet.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Start logging — you'll thank yourself at review time.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {wins.map(win => {
            const cfg = WIN_CATS[win.category] ?? WIN_CATS.OTHER
            return (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 flex items-start gap-3 group"
              >
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 shrink-0 tracking-wider"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                >{cfg.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{win.title}</p>
                  {win.description && (
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{win.description}</p>
                  )}
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(win.win_date)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(win.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
