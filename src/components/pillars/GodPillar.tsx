import { useState } from 'react'
import { BookOpen, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import PrayerColumn from './PrayerColumn'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import { useDailyVerse } from '../../hooks/useDailyVerse'
import type { Database } from '../../types/database'
import Anthropic from '@anthropic-ai/sdk'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface GodPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
}

const ANTHROPIC_KEY_STORAGE = 'lockedin_anthropic_key'
const DEVOTIONAL_CACHE_KEY = 'lockedin_devotional_cache'

interface DevotionalCache {
  date: string
  verseRef: string
  content: string
}

function getCachedDevotional(verseRef: string): string | null {
  try {
    const raw = localStorage.getItem(DEVOTIONAL_CACHE_KEY)
    if (!raw) return null
    const cache: DevotionalCache = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    if (cache.date === today && cache.verseRef === verseRef) return cache.content
  } catch { /* ignore */ }
  return null
}

function setCachedDevotional(verseRef: string, content: string) {
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(DEVOTIONAL_CACHE_KEY, JSON.stringify({ date: today, verseRef, content }))
}

// ─── AI Devotional Section ────────────────────────────────────────────────────
function DevotionalSection({ verseRef, verseText }: { verseRef: string; verseText: string }) {
  const [devotional, setDevotional] = useState<string | null>(() => getCachedDevotional(verseRef))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(!!getCachedDevotional(verseRef))

  async function generate() {
    const apiKey = localStorage.getItem(ANTHROPIC_KEY_STORAGE)
    if (!apiKey) {
      setError('Add your Anthropic API key in Settings (click your name in the sidebar).')
      return
    }

    setLoading(true)
    setError('')
    setExpanded(true)

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `You are writing a daily devotional for Christian men — fathers, leaders, men who take their faith seriously.

Based on this verse:
"${verseText}"
— ${verseRef}

Write a devotional with exactly this structure (no headers, just flowing text separated by blank lines):

Paragraph 1 (2-3 sentences): What this verse is really saying — cut through the familiar and speak to it fresh.

Paragraph 2 (3-4 sentences): The lesson for a man today. Make it practical and direct — how does this apply to his role as a man, husband, father, or leader?

Paragraph 3 (2-3 sentences): The challenge. One specific thing he can do or change today.

Closing Prayer (3-4 sentences): Begin with "Lord," — an honest, direct prayer a man would actually pray. No religious fluff.

Be direct. Speak to men who want substance, not sentimentality.`
        }]
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      setDevotional(text)
      setCachedDevotional(verseRef, text)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(`Failed to generate: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.06)' }}>
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
          <span className="text-xs font-semibold font-['Space_Grotesk']" style={{ color: '#7c3aed' }}>
            Today's Devotional
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {devotional && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white transition-all"
            style={{ background: loading ? '#a78bfa' : '#7c3aed', opacity: loading ? 0.8 : 1 }}
          >
            {loading ? (
              <><RefreshCw className="w-3 h-3 animate-spin" />Generating...</>
            ) : devotional ? (
              <><RefreshCw className="w-3 h-3" />Refresh</>
            ) : (
              <><Sparkles className="w-3 h-3" />Generate</>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 text-xs"
            style={{ color: '#dc2626' }}
          >
            {error}
          </motion.p>
        )}
        {devotional && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 pb-3 space-y-3" style={{ borderTop: '1px solid rgba(124,58,237,0.2)' }}>
              {devotional.split('\n\n').filter(Boolean).map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{
                    color: para.startsWith('Lord,') ? '#7c3aed' : 'var(--text-secondary)',
                    fontStyle: para.startsWith('Lord,') ? 'italic' : 'normal',
                    paddingTop: i === 0 ? '0.75rem' : 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GodPillar({ log, onUpdate: _onUpdate }: GodPillarProps) {
  const { verse, loading: verseLoading, error: verseError, refetch } = useDailyVerse()

  if (!log) return null

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left — Verse + Devotional */}
      <GlassCard status="green" active={false}>
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
              </div>
              <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>God</span>
            </div>
          </div>

          {/* Daily Bible verse */}
          <div className="rounded-lg p-3 space-y-1.5" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
            {verseLoading ? (
              <p className="text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading verse...</p>
            ) : verseError ? (
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Could not load verse</p>
                <button onClick={refetch} className="p-1 rounded transition-colors hover:bg-purple-100">
                  <RefreshCw className="w-3 h-3" style={{ color: '#7c3aed' }} />
                </button>
              </div>
            ) : verse ? (
              <>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                  "{verse.text}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>{verse.reference}</p>
                  <button onClick={refetch} className="p-1 rounded transition-colors hover:bg-purple-100" title="New verse">
                    <RefreshCw className="w-3 h-3" style={{ color: '#7c3aed' }} />
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* AI Devotional */}
          {verse && !verseLoading && !verseError && (
            <DevotionalSection verseRef={verse.reference} verseText={verse.text} />
          )}

        </div>
      </GlassCard>

      {/* Right — Prayer column */}
      <PrayerColumn />
    </div>
    <PillarHabitTracker pillar="God" accentColor="#7c3aed" accentMuted="rgba(124,58,237,0.15)" />
    <PillarGoals category="God" accentColor="#7c3aed" accentBg="#faf5ff" accentBorder="#e9d5ff" />
    </div>
  )
}
