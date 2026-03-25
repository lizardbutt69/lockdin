import { useState, useEffect } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type GratitudeEntry = Database['public']['Tables']['gratitude_entries']['Row']
type Category = 'grateful' | 'win' | 'smile'

const CATS: { key: Category; emoji: string; label: string; color: string; bg: string; border: string }[] = [
  { key: 'grateful', emoji: '🙏', label: 'Grateful', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  { key: 'win',      emoji: '🏆', label: 'Win',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)' },
  { key: 'smile',    emoji: '😊', label: 'Smile',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.25)' },
]

const PLACEHOLDERS: Record<Category, string> = {
  grateful: 'What are you grateful for?',
  win:      'What did you accomplish?',
  smile:    'What made you smile?',
}

export default function GratitudeQuickAdd() {
  const { user } = useAuth()
  const [cat, setCat] = useState<Category>('grateful')
  const [content, setContent] = useState('')
  const [recent, setRecent] = useState<GratitudeEntry[]>([])
  const [saving, setSaving] = useState(false)

  const activeCat = CATS.find(c => c.key === cat)!

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setRecent(data) })
  }, [user])

  async function add() {
    if (!user || !content.trim()) return
    const payload = { user_id: user.id, category: cat, content: content.trim() }
    setSaving(true)
    if (!isSupabaseConfigured) {
      const demo: GratitudeEntry = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      setRecent(r => [demo, ...r].slice(0, 3))
    } else {
      const { data } = await supabase.from('gratitude_entries').insert(payload).select().single()
      if (data) setRecent(r => [data, ...r].slice(0, 3))
    }
    setSaving(false)
    setContent('')
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
        </div>
        <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
          Gratitude
        </span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5">
        {CATS.map(c => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCat(c.key)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: cat === c.key ? c.bg : 'var(--bg-subtle)',
              border: `1px solid ${cat === c.key ? c.border : 'var(--border-default)'}`,
              color: cat === c.key ? c.color : 'var(--text-muted)',
            }}
          >
            <span>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={PLACEHOLDERS[cat]}
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: activeCat.bg,
            border: `1px solid ${activeCat.border}`,
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="button"
          onClick={add}
          disabled={saving || !content.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
          style={{
            background: content.trim() ? activeCat.color : 'var(--bg-subtle)',
            color: content.trim() ? 'white' : 'var(--text-muted)',
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Recent entries */}
      {recent.length > 0 && (
        <div className="space-y-1.5 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {recent.map(entry => {
            const c = CATS.find(c => c.key === entry.category) ?? CATS[0]
            return (
              <div key={entry.id} className="flex items-start gap-2">
                <span className="text-xs shrink-0 mt-0.5">{c.emoji}</span>
                <p
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {entry.content}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
