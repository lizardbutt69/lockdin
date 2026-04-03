import { RefreshCw, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useDailyVerse } from '../../hooks/useDailyVerse'

export default function BibleVerseCard() {
  const { verse, loading, error, refetch } = useDailyVerse()
  const [animKey, setAnimKey] = useState(0)

  function handleRefetch() {
    refetch()
    setAnimKey(k => k + 1)
  }

  return (
    <div
      className="card overflow-hidden"
    >
      {/* Title bar */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <BookOpen className="w-3 h-3" style={{ color: '#7c3aed' }} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Bible Verse of the Day</span>
        </div>
        <button
          onClick={handleRefetch}
          className="p-1 rounded-lg transition-colors"
          title="New verse"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      <div className="px-3 py-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <p className="text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading verse...</p>
            ) : error ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Could not load verse</p>
            ) : verse ? (
              <>
                <p className="text-xs leading-relaxed italic mb-1" style={{ color: 'var(--text-secondary)' }}>
                  "{verse.text}"
                </p>
                <p className="text-[11px] font-semibold" style={{ color: '#7c3aed' }}>
                  — {verse.reference}
                </p>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
