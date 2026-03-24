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
      className="rounded-xl p-4 flex items-start gap-3"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <Quote className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
      </div>

      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-base leading-relaxed italic mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              "{quote.text}"
            </p>
            <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>
              — {quote.author}{quote.source ? `, ${quote.source}` : ''}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={nextQuote}
        className="p-1.5 rounded-lg shrink-0 transition-colors mt-0.5"
        title="Next quote"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
