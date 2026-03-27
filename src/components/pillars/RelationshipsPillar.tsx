import { Heart, Calendar, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import TacticalCard from '../ui/TacticalCard'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface RelationshipsPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
  weeklyDateNights: number
}

export default function RelationshipsPillar({ log, onUpdate, weeklyDateNights }: RelationshipsPillarProps) {
  if (!log) return null

  const checks = [log.quality_time, log.date_night].filter(Boolean).length
  const pct = Math.round((checks / 2) * 100)
  const status: 'green' | 'amber' | 'red' = log.quality_time && log.date_night ? 'green' : log.quality_time ? 'amber' : 'red'

  const Toggle = ({ label, value, onChange, icon: Icon }: { label: string; value: boolean; onChange: () => void; icon: any }) => (
    <button
      onClick={onChange}
      className={`toggle-btn ${value ? 'active' : ''}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span className="font-mono text-xs tracking-wider">{label}</span>
      <span className={`ml-auto font-mono text-xs font-bold ${value ? 'text-[#00ff41]' : 'text-[#2a3441]'}`}>
        {value ? '✓' : '○'}
      </span>
    </button>
  )

  return (
    <div className="space-y-4">
    <TacticalCard status={status}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.1)' }}>
              <Heart className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
            </div>
            <span className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Relationships</span>
          </div>
          <div className="text-right">
            <div className={`font-['Inter'] text-lg font-bold ${status === 'green' ? 'text-[#00ff41] glow-green' : status === 'amber' ? 'text-[#ff9500]' : 'text-[#ff2d2d]'}`}>
              {pct}%
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <Toggle
            label="QUALITY TIME TODAY"
            value={log.quality_time}
            onChange={() => onUpdate({ quality_time: !log.quality_time })}
            icon={Heart}
          />
          <Toggle
            label="DATE NIGHT"
            value={log.date_night}
            onChange={() => onUpdate({ date_night: !log.date_night })}
            icon={Calendar}
          />
        </div>

        {/* Weekly date nights */}
        <div className="flex items-center justify-between text-[#94a3b8] font-mono text-[10px] mb-1">
          <div className="flex items-center gap-1"><Users className="w-3 h-3" /> DATE NIGHTS THIS WEEK</div>
          <span className={weeklyDateNights >= 1 ? 'text-[#00ff41]' : ''}>{weeklyDateNights}/1</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              background: status === 'green' ? '#00ff41' : status === 'amber' ? '#ff9500' : '#ff2d2d',
              boxShadow: `0 0 6px ${status === 'green' ? 'rgba(0,255,65,0.6)' : status === 'amber' ? 'rgba(255,149,0,0.6)' : 'rgba(255,45,45,0.6)'}`,
            }}
          />
        </div>
      </div>
    </TacticalCard>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PillarGoals category="Relationships" accentColor="#dc2626" accentBg="rgba(220,38,38,0.06)" accentBorder="rgba(220,38,38,0.2)" />
      <PillarHabitTracker pillar="Relationships" accentColor="#dc2626" accentMuted="rgba(220,38,38,0.15)" />
    </div>
    </div>
  )
}
