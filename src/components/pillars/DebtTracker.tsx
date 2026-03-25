import { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2, Pencil, Check, X, TrendingDown, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type Debt = Database['public']['Tables']['debts']['Row']
type Strategy = 'avalanche' | 'snowball'

const DEBT_TYPES = ['Credit Card', 'Student Loan', 'Auto', 'Mortgage', 'Medical', 'Personal', 'Other']

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Credit Card':  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  'Student Loan': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)'  },
  'Auto':         { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  'Mortgage':     { color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)'  },
  'Medical':      { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  'Personal':     { color: '#ec4899', bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)'  },
  'Other':        { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
}

function typeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG['Other']
}

function pct(current: number, original: number) {
  if (!original || original <= 0) return 0
  const paid = original - current
  return Math.min(100, Math.max(0, Math.round((paid / original) * 100)))
}

// ─── Debt Card ─────────────────────────────────────────────────────────────────

function DebtCard({
  debt,
  isFocus,
  onUpdate,
  onDelete,
}: {
  debt: Debt
  isFocus: boolean
  onUpdate: (id: string, updates: Partial<Debt>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: debt.name,
    type: debt.type,
    current_balance: String(debt.current_balance),
    original_balance: String(debt.original_balance),
    interest_rate: String(debt.interest_rate),
    minimum_payment: String(debt.minimum_payment),
  })

  const cfg = typeConfig(debt.type)
  const paid = pct(debt.current_balance, debt.original_balance)

  function openEdit() {
    setForm({
      name: debt.name,
      type: debt.type,
      current_balance: String(debt.current_balance),
      original_balance: String(debt.original_balance),
      interest_rate: String(debt.interest_rate),
      minimum_payment: String(debt.minimum_payment),
    })
    setEditing(true)
  }

  async function save() {
    await onUpdate(debt.id, {
      name: form.name.trim() || debt.name,
      type: form.type,
      current_balance: Number(form.current_balance) || 0,
      original_balance: Number(form.original_balance) || 0,
      interest_rate: Number(form.interest_rate) || 0,
      minimum_payment: Number(form.minimum_payment) || 0,
    })
    setEditing(false)
  }

  return (
    <div
      className="card p-4 space-y-3 relative"
      style={isFocus ? { border: `1px solid ${cfg.color}`, boxShadow: `0 0 0 2px ${cfg.bg}` } : {}}
    >
      {/* Focus badge */}
      {isFocus && (
        <div
          className="absolute -top-2.5 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: cfg.color, color: 'white' }}
        >
          <Flame className="w-2.5 h-2.5" /> FOCUS
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {debt.type}
          </span>
          <span className="font-semibold text-sm truncate font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            {debt.name}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={editing ? () => setEditing(false) : openEdit}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: editing ? '#ef4444' : 'var(--text-muted)' }}>
            {editing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
          </button>
          <button type="button" onClick={() => onDelete(debt.id)}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* View mode */}
      {!editing && (
        <>
          {/* Balance */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>Balance</p>
              <p className="text-xl font-bold font-['Space_Grotesk']" style={{ color: '#ef4444' }}>
                ${debt.current_balance.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              {debt.interest_rate > 0 && (
                <p className="text-xs font-semibold" style={{ color: cfg.color }}>{debt.interest_rate}% APR</p>
              )}
              {debt.minimum_payment > 0 && (
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  ${debt.minimum_payment.toLocaleString()}/mo min
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          {debt.original_balance > 0 && (
            <div>
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>{paid}% paid off</span>
                <span>of ${debt.original_balance.toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${paid}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ background: paid === 100 ? '#16a34a' : cfg.color }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit mode */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-2"
          >
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="tactical-input" placeholder="Debt name" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="tactical-input text-sm">
              {DEBT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Current Balance ($)</label>
                <input type="number" value={form.current_balance} onChange={e => setForm(f => ({ ...f, current_balance: e.target.value }))} className="tactical-input" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Original Balance ($)</label>
                <input type="number" value={form.original_balance} onChange={e => setForm(f => ({ ...f, original_balance: e.target.value }))} className="tactical-input" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>APR (%)</label>
                <input type="number" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} className="tactical-input" placeholder="0" step="0.1" />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Min. Payment ($)</label>
                <input type="number" value={form.minimum_payment} onChange={e => setForm(f => ({ ...f, minimum_payment: e.target.value }))} className="tactical-input" placeholder="0" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={save} className="flex-1 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#16a34a' }}>
                <Check className="w-3.5 h-3.5 inline mr-1" />Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-lg text-sm" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function DebtTracker() {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [strategy, setStrategy] = useState<Strategy>('avalanche')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'Credit Card',
    current_balance: '', original_balance: '',
    interest_rate: '', minimum_payment: '',
  })

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setDebts(data) })
  }, [user])

  const totalDebt = debts.reduce((s, d) => s + d.current_balance, 0)
  const totalMin = debts.reduce((s, d) => s + d.minimum_payment, 0)

  // Determine focus debt by strategy
  const focusDebt = debts.length === 0 ? null :
    strategy === 'avalanche'
      ? [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0]
      : [...debts].sort((a, b) => a.current_balance - b.current_balance)[0]

  async function addDebt() {
    setError('')
    if (!user) { setError('Not logged in.'); return }
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.current_balance) { setError('Current balance is required.'); return }
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      type: form.type,
      current_balance: Number(form.current_balance) || 0,
      original_balance: Number(form.original_balance) || Number(form.current_balance) || 0,
      interest_rate: Number(form.interest_rate) || 0,
      minimum_payment: Number(form.minimum_payment) || 0,
    }
    setSaving(true)
    if (!isSupabaseConfigured) {
      const demo: Debt = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      setDebts(d => [...d, demo])
    } else {
      const { data, error: sbError } = await supabase.from('debts').insert(payload).select().single()
      if (sbError) { setError(sbError.message); setSaving(false); return }
      if (data) setDebts(d => [...d, data])
    }
    setSaving(false)
    setForm({ name: '', type: 'Credit Card', current_balance: '', original_balance: '', interest_rate: '', minimum_payment: '' })
    setShowAdd(false)
  }

  async function updateDebt(id: string, updates: Partial<Debt>) {
    setDebts(d => d.map(x => x.id === id ? { ...x, ...updates } : x))
    if (isSupabaseConfigured) await supabase.from('debts').update(updates).eq('id', id)
  }

  async function deleteDebt(id: string) {
    if (!confirm('Remove this debt?')) return
    setDebts(d => d.filter(x => x.id !== id))
    if (isSupabaseConfigured) await supabase.from('debts').delete().eq('id', id)
  }

  return (
    <div className="space-y-3">
      {/* Header card */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <CreditCard className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Debt Tracker</span>
              {totalDebt > 0 && (
                <span className="text-xs ml-2 font-bold font-['Space_Grotesk']" style={{ color: '#ef4444' }}>
                  ${totalDebt.toLocaleString()} total
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showAdd ? 'rgba(239,68,68,0.1)' : 'var(--bg-subtle)',
              border: `1px solid ${showAdd ? 'rgba(239,68,68,0.3)' : 'var(--border-default)'}`,
              color: showAdd ? '#ef4444' : 'var(--text-secondary)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />Add debt
          </button>
        </div>

        {/* Strategy toggle */}
        {debts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
              <button
                type="button"
                onClick={() => setStrategy('avalanche')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: strategy === 'avalanche' ? 'var(--bg-card)' : 'transparent',
                  color: strategy === 'avalanche' ? '#ef4444' : 'var(--text-muted)',
                  boxShadow: strategy === 'avalanche' ? 'var(--shadow-card)' : 'none',
                }}
              >
                <TrendingDown className="w-3.5 h-3.5" /> Avalanche
              </button>
              <button
                type="button"
                onClick={() => setStrategy('snowball')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: strategy === 'snowball' ? 'var(--bg-card)' : 'transparent',
                  color: strategy === 'snowball' ? '#8b5cf6' : 'var(--text-muted)',
                  boxShadow: strategy === 'snowball' ? 'var(--shadow-card)' : 'none',
                }}
              >
                <Flame className="w-3.5 h-3.5" /> Snowball
              </button>
            </div>
            <p className="text-[10px] px-1" style={{ color: 'var(--text-muted)' }}>
              {strategy === 'avalanche'
                ? '🧮 Avalanche: focus extra payments on highest APR first — saves the most interest'
                : '⛄ Snowball: focus extra payments on smallest balance first — builds momentum'}
            </p>
            {totalMin > 0 && (
              <p className="text-[10px] px-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Total minimum payments: <span style={{ color: '#ef4444' }}>${totalMin.toLocaleString()}/mo</span>
              </p>
            )}
          </div>
        )}

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-2.5" style={{ borderTop: '1px solid var(--border-default)' }}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <input type="text" placeholder="Debt name (e.g. Chase Visa)" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="tactical-input" />
                  </div>
                  <div className="col-span-2">
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="tactical-input text-sm">
                      {DEBT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Current Balance ($)</label>
                    <input type="number" placeholder="5000" value={form.current_balance}
                      onChange={e => setForm(f => ({ ...f, current_balance: e.target.value }))} className="tactical-input" />
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Original Balance ($)</label>
                    <input type="number" placeholder="5000" value={form.original_balance}
                      onChange={e => setForm(f => ({ ...f, original_balance: e.target.value }))} className="tactical-input" />
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>APR (%)</label>
                    <input type="number" placeholder="19.99" value={form.interest_rate} step="0.1"
                      onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} className="tactical-input" />
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Min. Payment ($)</label>
                    <input type="number" placeholder="150" value={form.minimum_payment}
                      onChange={e => setForm(f => ({ ...f, minimum_payment: e.target.value }))} className="tactical-input" />
                  </div>
                </div>
                {error && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={addDebt} disabled={saving}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#ef4444', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Add Debt'}
                  </button>
                  <button type="button" onClick={() => { setShowAdd(false); setError('') }}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {debts.length === 0 && !showAdd && (
        <div className="card p-8 flex flex-col items-center justify-center text-center" style={{ borderStyle: 'dashed' }}>
          <CreditCard className="w-7 h-7 mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No debts tracked</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add debts to start tracking your payoff journey</p>
        </div>
      )}

      {/* Debt cards */}
      {debts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {debts.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              isFocus={focusDebt?.id === debt.id}
              onUpdate={updateDebt}
              onDelete={deleteDebt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
