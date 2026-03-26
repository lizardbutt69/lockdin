import { Droplets, Moon, Pill, Utensils, Apple } from 'lucide-react'
import { motion } from 'framer-motion'
import TacticalCard from '../ui/TacticalCard'
import PillarGoals from './PillarGoals'
import PillarHabitTracker from './PillarHabitTracker'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface DietPillarProps {
  log: DailyLog | null
  onUpdate: (updates: Partial<DailyLog>) => void
}

const WATER_TARGET = 8

export default function DietPillar({ log, onUpdate }: DietPillarProps) {
  if (!log) return null

  const water = log.water_glasses || 0
  const checks = [
    water >= WATER_TARGET,
    (log.meal_rating || 0) >= 3,
    log.supplements_taken,
    (log.sleep_hours || 0) >= 7,
  ].filter(Boolean).length
  const pct = Math.round((checks / 4) * 100)
  const status = pct === 100 ? 'green' : pct >= 50 ? 'amber' : 'red'

  return (
    <div className="space-y-4">
    <TacticalCard status={status}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Apple className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            </div>
            <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Diet & Health</span>
          </div>
          <span className={`font-['Inter'] text-lg font-bold ${status === 'green' ? 'text-[#00ff41] glow-green' : status === 'amber' ? 'text-[#ff9500]' : 'text-[#ff2d2d]'}`}>
            {pct}%
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {/* Water */}
          <div>
            <div className="flex items-center justify-between text-[#94a3b8] font-mono text-[10px] mb-1">
              <div className="flex items-center gap-1"><Droplets className="w-3 h-3 text-[#00b4d8]" /> HYDRATION</div>
              <span className={water >= WATER_TARGET ? 'text-[#00ff41]' : ''}>{water}/{WATER_TARGET} glasses</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: WATER_TARGET }, (_, i) => (
                <button
                  key={i}
                  onClick={() => onUpdate({ water_glasses: i < water ? i : i + 1 })}
                  className={`flex-1 h-3 border transition-all duration-150 ${
                    i < water
                      ? 'bg-[#00b4d8] border-[#00b4d8]'
                      : 'border-[#ffffff10] hover:border-[#00b4d8]/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Meal rating */}
          <div>
            <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-[10px] mb-1">
              <Utensils className="w-3 h-3" /> MEAL QUALITY
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => onUpdate({ meal_rating: n })}
                  className={`flex-1 py-1 border font-mono text-xs transition-all duration-150 ${
                    (log.meal_rating || 0) >= n
                      ? 'bg-[#00ff41]/10 border-[#00ff41]/40 text-[#00ff41]'
                      : 'border-[#ffffff08] text-[#4a5568] hover:border-[#00ff41]/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep + Supplements row */}
          <div className="flex gap-1.5">
            <div className="flex-1">
              <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-[10px] mb-1">
                <Moon className="w-3 h-3" /> SLEEP (HRS)
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={log.sleep_hours || ''}
                onChange={e => onUpdate({ sleep_hours: Number(e.target.value) })}
                placeholder="0.0"
                className={`tactical-input w-full ${(log.sleep_hours || 0) >= 7 ? 'border-[#00ff41]/40 text-[#00ff41]' : ''}`}
              />
            </div>
            <button
              onClick={() => onUpdate({ supplements_taken: !log.supplements_taken })}
              className={`toggle-btn flex-1 flex-col justify-center ${log.supplements_taken ? 'active' : ''}`}
            >
              <Pill className="w-3 h-3" />
              <span className="font-mono text-[9px] tracking-wider">SUPPS {log.supplements_taken ? '✓' : '○'}</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
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
      <PillarGoals category="Health" accentColor="#16a34a" accentBg="#f0fdf4" accentBorder="#bbf7d0" />
      <PillarHabitTracker pillar="Health" accentColor="#16a34a" accentMuted="rgba(22,163,74,0.15)" />
    </div>
    </div>
  )
}
