import { useState } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExpenses, EXPENSE_CATEGORIES } from '../../hooks/useExpenses'

const ACCENT = '#16a34a'

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function navigateMonth(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function catConfig(key: string) {
  return EXPENSE_CATEGORIES.find(c => c.key === key) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
}

export default function ExpenseTracker() {
  const { expenses, loading, month, setMonth, addExpense, deleteExpense, totalThisMonth, totalLastMonth } = useExpenses()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) })
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const isCurrentMonth = month === (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })()

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount.replace(/,/g, ''))
    if (!amount || isNaN(amount) || amount <= 0) return
    addExpense(amount, form.category, form.description, form.date)
    setForm(f => ({ ...f, amount: '', description: '', date: new Date().toISOString().slice(0, 10) }))
    setShowAdd(false)
  }

  // Category breakdown
  const breakdown = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const filtered = filterCat ? expenses.filter(e => e.category === filterCat) : expenses

  const delta = totalThisMonth - totalLastMonth
  const deltaSign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'

  return (
    <div className="card overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <TrendingDown className="w-3 h-3" style={{ color: ACCENT }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Expenses</span>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: showAdd ? 'rgba(22,163,74,0.1)' : 'var(--bg-subtle)', border: `1px solid ${showAdd ? 'rgba(22,163,74,0.3)' : 'var(--border-default)'}`, color: showAdd ? ACCENT : 'var(--text-muted)' }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="tactical-input text-sm"
                    style={{ paddingLeft: '1.5rem' }}
                  />
                </div>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="tactical-input text-sm"
                  style={{ width: 130 }}
                />
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="tactical-input text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {EXPENSE_CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.category === cat.key ? cat.bg : 'var(--bg-subtle)',
                      color: form.category === cat.key ? cat.color : 'var(--text-muted)',
                      border: `1px solid ${form.category === cat.key ? cat.border : 'var(--border-default)'}`,
                    }}
                  >{cat.key}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: ACCENT }}>Add Expense</button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Month nav + total */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(m => navigateMonth(m, -1))} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)', minWidth: 110, textAlign: 'center' }}>{monthLabel(month)}</span>
          <button onClick={() => setMonth(m => navigateMonth(m, 1))} disabled={isCurrentMonth} className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>{fmt(totalThisMonth)}</span>
          {totalLastMonth > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: deltaSign === 'up' ? '#ef4444' : deltaSign === 'down' ? '#16a34a' : 'var(--text-muted)' }}>
              {deltaSign === 'up' && <TrendingUp className="w-3 h-3" />}
              {deltaSign === 'down' && <TrendingDown className="w-3 h-3" />}
              {deltaSign === 'flat' && <Minus className="w-3 h-3" />}
              {deltaSign !== 'flat' && `${fmt(Math.abs(delta))}`}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No expenses logged</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Track where your money is going</p>
        </div>
      ) : (
        <>
          {/* Category breakdown */}
          <div className="px-4 py-3 space-y-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {breakdown.map(cat => {
              const pct = totalThisMonth > 0 ? (cat.total / totalThisMonth) * 100 : 0
              const isActive = filterCat === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setFilterCat(isActive ? null : cat.key)}
                  className="w-full text-left transition-opacity"
                  style={{ opacity: filterCat && !isActive ? 0.4 : 1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{cat.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(cat.total)}</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ background: cat.color }}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Expense list */}
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filterCat && (
              <div className="px-4 py-2 flex items-center justify-between" style={{ background: 'var(--bg-subtle)' }}>
                <span className="text-[11px] font-semibold" style={{ color: catConfig(filterCat).color }}>{filterCat}</span>
                <button onClick={() => setFilterCat(null)} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Clear filter</button>
              </div>
            )}
            <AnimatePresence initial={false}>
              {filtered.map(expense => {
                const cat = catConfig(expense.category)
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-2.5 group"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {expense.description || expense.category}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {expense.description ? expense.category + ' · ' : ''}{formatDate(expense.expense_date)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: 'var(--text-primary)' }}>
                      {fmt(expense.amount)}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded transition-all shrink-0"
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
        </>
      )}
    </div>
  )
}
