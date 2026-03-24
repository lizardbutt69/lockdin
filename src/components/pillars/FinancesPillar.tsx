import { TrendingUp, DollarSign, BarChart2, Receipt } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TacticalCard from '../ui/TacticalCard'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']
type Snapshot = Database['public']['Tables']['financial_snapshots']['Row']

interface FinancesPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
}

function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function FinancesPillar({ log, onUpdate }: FinancesPillarProps) {
  const { user } = useAuth()
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ net_worth: '', savings_target: '', savings_actual: '', investment_contributions: '', side_income: '' })

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('financial_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', firstOfMonth())
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSnapshot(data)
          setForm({
            net_worth: String(data.net_worth || ''),
            savings_target: String(data.savings_target || ''),
            savings_actual: String(data.savings_actual || ''),
            investment_contributions: String(data.investment_contributions || ''),
            side_income: String(data.side_income || ''),
          })
        }
      })
  }, [user])

  if (!log) return null

  const savingsPct = snapshot?.savings_target && snapshot?.savings_actual
    ? Math.min(100, Math.round((snapshot.savings_actual / snapshot.savings_target) * 100))
    : 0

  const status: 'green' | 'amber' | 'red' = savingsPct >= 80 ? 'green' : savingsPct >= 40 ? 'amber' : 'red'

  const saveSnapshot = async () => {
    if (!user) return
    const payload = {
      user_id: user.id,
      month: firstOfMonth(),
      net_worth: Number(form.net_worth) || null,
      savings_target: Number(form.savings_target) || null,
      savings_actual: Number(form.savings_actual) || null,
      investment_contributions: Number(form.investment_contributions) || null,
      side_income: Number(form.side_income) || null,
    }
    if (snapshot) {
      const { data } = await supabase.from('financial_snapshots').update(payload).eq('id', snapshot.id).select().single()
      if (data) setSnapshot(data)
    } else {
      const { data } = await supabase.from('financial_snapshots').insert(payload).select().single()
      if (data) setSnapshot(data)
    }
    setEditing(false)
  }

  return (
    <div className="space-y-4">
    <TacticalCard status={status}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)' }}>
              <DollarSign className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
            </div>
            <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Finances</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-['Inter'] text-lg font-bold ${status === 'green' ? 'text-[#00ff41] glow-green' : status === 'amber' ? 'text-[#ff9500]' : 'text-[#ff2d2d]'}`}>
              {savingsPct}%
            </span>
            <button
              onClick={() => setEditing(!editing)}
              className="text-[#4a5568] hover:text-[#00ff41] font-mono text-[10px] rounded px-2 py-0.5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {editing ? 'CANCEL' : 'EDIT'}
            </button>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-[10px]">
                <TrendingUp className="w-3 h-3" /> NET WORTH
              </div>
              <span className="font-['Inter'] text-xs text-[#e2e8f0]">
                {snapshot?.net_worth ? `$${snapshot.net_worth.toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-[10px]">
                <BarChart2 className="w-3 h-3" /> SAVINGS PROGRESS
              </div>
              <span className="font-['Inter'] text-xs text-[#e2e8f0]">
                {snapshot?.savings_actual ? `$${snapshot.savings_actual.toLocaleString()}` : '—'}
                {snapshot?.savings_target ? ` / $${snapshot.savings_target.toLocaleString()}` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-[10px]">
                <DollarSign className="w-3 h-3" /> INVESTMENTS
              </div>
              <span className="font-['Inter'] text-xs text-[#e2e8f0]">
                {snapshot?.investment_contributions ? `$${snapshot.investment_contributions.toLocaleString()}` : '—'}
              </span>
            </div>
            <button
              onClick={() => onUpdate({ tracked_spending: !log.tracked_spending })}
              className={`toggle-btn ${log.tracked_spending ? 'active' : ''}`}
            >
              <Receipt className="w-3 h-3 shrink-0" />
              <span className="font-mono text-xs tracking-wider">TRACKED SPENDING</span>
              <span className={`ml-auto font-mono text-xs font-bold ${log.tracked_spending ? 'text-[#00ff41]' : 'text-[#2a3441]'}`}>
                {log.tracked_spending ? '✓' : '○'}
              </span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1.5 mb-3"
          >
            {[
              { key: 'net_worth', label: 'NET WORTH ($)' },
              { key: 'savings_target', label: 'SAVINGS TARGET ($)' },
              { key: 'savings_actual', label: 'SAVINGS ACTUAL ($)' },
              { key: 'investment_contributions', label: 'INVESTMENTS ($)' },
              { key: 'side_income', label: 'SIDE INCOME ($)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-[#94a3b8] font-mono text-[9px] tracking-widest block mb-0.5">{label}</label>
                <input
                  type="number"
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="tactical-input w-full"
                />
              </div>
            ))}
            <button
              onClick={saveSnapshot}
              className="w-full rounded-lg bg-[#00ff41]/10 text-[#00ff41] font-mono text-xs tracking-widest py-2 hover:bg-[#00ff41]/20 transition-all" style={{ border: '1px solid rgba(0,255,65,0.3)' }}
            >
              SAVE DATA
            </button>
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${savingsPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              background: status === 'green' ? '#00ff41' : status === 'amber' ? '#ff9500' : '#ff2d2d',
              boxShadow: `0 0 6px ${status === 'green' ? 'rgba(0,255,65,0.6)' : status === 'amber' ? 'rgba(255,149,0,0.6)' : 'rgba(255,45,45,0.6)'}`,
            }}
          />
        </div>
      </div>
    </TacticalCard>
    <PillarGoals category="Finances" accentColor="#0891b2" accentBg="#ecfeff" accentBorder="#a5f3fc" />
    <PillarHabitTracker pillar="Finances" accentColor="#0891b2" accentMuted="rgba(8,145,178,0.15)" />
    </div>
  )
}
