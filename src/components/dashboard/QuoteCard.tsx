import { useState } from 'react'
import { RefreshCw, Quote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyQuote, QUOTES } from '../../data/quotes'

export default function QuoteCard() {
  const [quoteIndex, setQuoteIndex] = useState<number | null>(null)
  const [animKey, setAnimKey] = useState(0)

  const quote = quoteIndex !== null ? QUOTES[quoteIndex] : getDailyQuote()

  function nextQuote() {
    const current = quoteIndex ?? QUOTES.indexOf(getDailyQuote())
    setQuoteIndex((current + 1) % QUOTES.length)
    setAnimKey(k => k + 1)
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Title bar */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <Quote className="w-3 h-3" style={{ color: '#7c3aed' }} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quote of the Day</span>
        </div>
        <button
          onClick={nextQuote}
          className="p-1 rounded-lg transition-colors"
          title="Next quote"
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
            <p className="text-xs leading-relaxed italic mb-1" style={{ color: 'var(--text-secondary)' }}>
              "{quote.text}"
            </p>
            <p className="text-[11px] font-semibold" style={{ color: '#7c3aed' }}>
              — {quote.author}{quote.source ? `, ${quote.source}` : ''}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
