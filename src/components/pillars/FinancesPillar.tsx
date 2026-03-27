import { DollarSign, Eye, EyeOff, Pencil, Plus, Check, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import SavingsGoals from './SavingsGoals'
import DebtTracker from './DebtTracker'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface FinancesPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
}

interface CustomField { id: string; label: string; value: number; sort_order: number }
interface Snapshot { id: string; net_worth: number | null; savings_actual: number | null; debt: number | null; investment_contributions: number | null; assets: number | null }

const EYE_KEY = 'lockedin_finance_privacy'

function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function fmt(n: number | null | undefined, hidden: boolean) {
  if (hidden) return '••••••'
  if (n == null) return '—'
  return '$' + n.toLocaleString()
}
function numOrNull(s: string): number | null {
  const n = Number(s.replace(/,/g, ''))
  return isNaN(n) || s.trim() === '' ? null : n
}

export default function FinancesPillar({ log }: FinancesPillarProps) {
  const { user } = useAuth()

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [hidden, setHidden] = useState(() => localStorage.getItem(EYE_KEY) === 'true')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ net_worth: '', savings: '', debt: '', investments: '', assets: '' })
  const [formCustom, setFormCustom] = useState<CustomField[]>([])
  const [newField, setNewField] = useState({ label: '', value: '' })
  const [showAddField, setShowAddField] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return
    const { data: snap } = await supabase.from('financial_snapshots').select('*').eq('user_id', user.id).eq('month', firstOfMonth()).maybeSingle()
    if (snap) setSnapshot(snap as unknown as Snapshot)
    const { data: fields } = await (supabase as any).from('financial_custom_fields').select('*').eq('user_id', user.id).order('sort_order', { ascending: true })
    if (fields) setCustomFields(fields as CustomField[])
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (!log) return null

  function togglePrivacy() {
    const next = !hidden; setHidden(next); localStorage.setItem(EYE_KEY, String(next))
  }

  function openEdit() {
    setForm({
      net_worth:   snapshot?.net_worth              != null ? String(snapshot.net_worth)              : '',
      savings:     snapshot?.savings_actual         != null ? String(snapshot.savings_actual)         : '',
      debt:        snapshot?.debt                   != null ? String(snapshot.debt)                   : '',
      investments: snapshot?.investment_contributions != null ? String(snapshot.investment_contributions) : '',
      assets:      snapshot?.assets                 != null ? String(snapshot.assets)                 : '',
    })
    setFormCustom(customFields.map(f => ({ ...f })))
    setEditing(true)
  }

  async function saveSnapshot() {
    if (!user || !isSupabaseConfigured) return
    const payload = { user_id: user.id, month: firstOfMonth(), net_worth: numOrNull(form.net_worth), savings_actual: numOrNull(form.savings), debt: numOrNull(form.debt), investment_contributions: numOrNull(form.investments), assets: numOrNull(form.assets) }
    if (snapshot) {
      const { data } = await supabase.from('financial_snapshots').update(payload).eq('id', snapshot.id).select().single()
      if (data) setSnapshot(data as unknown as Snapshot)
    } else {
      const { data } = await supabase.from('financial_snapshots').insert(payload).select().single()
      if (data) setSnapshot(data as unknown as Snapshot)
    }
    for (const f of formCustom) {
      if (f.id.startsWith('new_')) {
        const { data } = await (supabase as any).from('financial_custom_fields').insert({ user_id: user.id, label: f.label, value: f.value, sort_order: f.sort_order }).select().single()
        if (data) setCustomFields(prev => [...prev.filter(c => c.id !== f.id), data as CustomField])
      } else {
        await (supabase as any).from('financial_custom_fields').update({ value: f.value }).eq('id', f.id)
      }
    }
    for (const id of customFields.filter(c => !formCustom.find(f => f.id === c.id)).map(c => c.id)) {
      await (supabase as any).from('financial_custom_fields').delete().eq('id', id)
    }
    await fetchAll()
    setEditing(false); setShowAddField(false); setNewField({ label: '', value: '' })
  }

  function addCustomFieldToForm() {
    if (!newField.label.trim()) return
    setFormCustom(prev => [...prev, { id: `new_${crypto.randomUUID()}`, label: newField.label.trim(), value: numOrNull(newField.value) ?? 0, sort_order: prev.length }])
    setNewField({ label: '', value: '' }); setShowAddField(false)
  }

  const METRICS = [
    { key: 'savings_actual',           label: 'Savings',     val: snapshot?.savings_actual,            color: 'var(--text-primary)' },
    { key: 'debt',                     label: 'Debt',        val: snapshot?.debt,                      color: '#ef4444'             },
    { key: 'investment_contributions', label: 'Investments', val: snapshot?.investment_contributions,  color: 'var(--text-primary)' },
    { key: 'assets',                   label: 'Assets',      val: snapshot?.assets,                    color: 'var(--text-primary)' },
  ] as const

  return (
    <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
        <DollarSign className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
      </div>
      <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Finances</span>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      {/* LEFT 2/3 */}
      <div className="col-span-1 lg:col-span-2 space-y-4">
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)' }}>
              <DollarSign className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
            </div>
            <span className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Finances</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={togglePrivacy}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: hidden ? '#16a34a' : 'var(--text-muted)', background: hidden ? 'rgba(22,163,74,0.1)' : 'transparent', border: '1px solid var(--border-default)' }}>
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={editing ? () => setEditing(false) : openEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: editing ? '#ef4444' : 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
              {editing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!editing && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Net Worth</p>
            <p className="text-3xl font-bold font-['Plus_Jakarta_Sans']" style={{ color: '#16a34a' }}>{fmt(snapshot?.net_worth, hidden)}</p>
          </div>
        )}

        {!editing ? (
          <div className="grid grid-cols-2 gap-2">
            {METRICS.map(({ key, label, val, color }) => (
              <div key={key} className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-bold font-['Plus_Jakarta_Sans']" style={{ color }}>{fmt(val, hidden)}</p>
              </div>
            ))}
            {customFields.map(f => (
              <div key={f.id} className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wide mb-1 truncate" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                <p className="text-sm font-bold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>{fmt(f.value, hidden)}</p>
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {([['net_worth','Net Worth ($)'],['savings','Savings ($)'],['debt','Debt ($)'],['investments','Investments ($)'],['assets','Assets ($)']] as const).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="tactical-input" placeholder="0" />
              </div>
            ))}

            {formCustom.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Custom Fields</p>
                {formCustom.map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                    <input type="number" value={String(f.value)} onChange={e => setFormCustom(prev => prev.map(c => c.id === f.id ? { ...c, value: numOrNull(e.target.value) ?? 0 } : c))} className="tactical-input w-28" placeholder="0" />
                    <button type="button" onClick={() => setFormCustom(prev => prev.filter(c => c.id !== f.id))} style={{ color: '#ef4444' }}><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {showAddField ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex gap-2 pt-1">
                    <input type="text" placeholder="Field name" value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} className="tactical-input flex-1" />
                    <input type="number" placeholder="$" value={newField.value} onChange={e => setNewField(f => ({ ...f, value: e.target.value }))} className="tactical-input w-24" />
                    <button type="button" onClick={addCustomFieldToForm} className="px-2 py-1.5 rounded-lg text-white" style={{ background: '#16a34a' }}><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setShowAddField(false)} className="px-2 py-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              ) : (
                <button type="button" onClick={() => setShowAddField(true)} className="flex items-center gap-1.5 text-xs" style={{ color: '#16a34a' }}>
                  <Plus className="w-3.5 h-3.5" /> Add custom field
                </button>
              )}
            </AnimatePresence>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={saveSnapshot} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#16a34a' }}>Save</button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </div>

      <SavingsGoals hidden={false} />
      <DebtTracker />
      </div>{/* end col-span-2 */}

      {/* RIGHT 1/3 */}
      <div className="col-span-1 lg:col-span-1 space-y-4">
        <PillarHabitTracker pillar="Finances" accentColor="#16a34a" accentMuted="rgba(22,163,74,0.15)" compact />
        <PillarGoals category="Finances" accentColor="#16a34a" accentBg="rgba(22,163,74,0.06)" accentBorder="rgba(22,163,74,0.2)" />
      </div>
    </div>
    </div>
  )
}
