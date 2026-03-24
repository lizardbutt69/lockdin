import { BookOpen, DollarSign, Heart, Leaf, Dumbbell, Plane, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PillarKey } from './Sidebar'
import type { Database } from '../../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface StatTilesProps {
  log: DailyLog | null
  weeklyWorkouts: number
  activePillar: PillarKey
  onSelect: (p: PillarKey) => void
}

interface TileData {
  key: PillarKey
  label: string
  icon: React.ElementType
  value: string
  sub: string
  trend: 'up' | 'down' | 'neutral'
  color: string
  bgColor: string
  borderColor: string
}

function getTiles(log: DailyLog | null, weeklyWorkouts: number): TileData[] {
  const godComplete = log ? [log.bible_read, log.prayed].filter(Boolean).length : 0
  const water = log?.water_glasses || 0
  const sleep = log?.sleep_hours || 0
  const relComplete = log ? [log.quality_time, log.date_night].filter(Boolean).length : 0

  return [
    {
      key: 'god',
      label: 'God',
      icon: BookOpen,
      value: `${godComplete}/2`,
      sub: godComplete === 2 ? 'All done' : godComplete === 1 ? 'In progress' : 'Not started',
      trend: godComplete === 2 ? 'up' : godComplete === 1 ? 'neutral' : 'down',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
    },
    {
      key: 'finances',
      label: 'Finances',
      icon: DollarSign,
      value: log?.tracked_spending ? '✓' : '—',
      sub: log?.tracked_spending ? 'Tracked today' : 'Not tracked',
      trend: log?.tracked_spending ? 'up' : 'neutral',
      color: '#0891b2',
      bgColor: '#ecfeff',
      borderColor: '#a5f3fc',
    },
    {
      key: 'relationships',
      label: 'Relationships',
      icon: Heart,
      value: `${relComplete}/2`,
      sub: relComplete >= 1 ? 'Connected' : 'Check in needed',
      trend: relComplete === 2 ? 'up' : relComplete === 1 ? 'neutral' : 'down',
      color: '#e11d48',
      bgColor: '#fff1f2',
      borderColor: '#fecdd3',
    },
    {
      key: 'diet',
      label: 'Diet & Health',
      icon: Leaf,
      value: `${water}/8`,
      sub: `${sleep || 0}h sleep`,
      trend: water >= 6 ? 'up' : water >= 4 ? 'neutral' : 'down',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
    {
      key: 'fitness',
      label: 'Fitness',
      icon: Dumbbell,
      value: `${weeklyWorkouts}/5`,
      sub: log?.worked_out ? 'Active today' : 'Rest day',
      trend: weeklyWorkouts >= 4 ? 'up' : weeklyWorkouts >= 2 ? 'neutral' : 'down',
      color: '#ea580c',
      bgColor: '#fff7ed',
      borderColor: '#fed7aa',
    },
    {
      key: 'trips',
      label: 'Trips',
      icon: Plane,
      value: '—',
      sub: 'Mission ops',
      trend: 'neutral',
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
    },
  ]
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3" style={{ color: '#16a34a' }} />
  if (trend === 'down') return <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />
  return <Minus className="w-3 h-3" style={{ color: '#9ca3af' }} />
}

export default function StatTiles({ log, weeklyWorkouts, activePillar, onSelect }: StatTilesProps) {
  const tiles = getTiles(log, weeklyWorkouts)

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
      {tiles.map((tile, i) => {
        const Icon = tile.icon
        const isActive = activePillar === tile.key

        return (
          <motion.button
            key={tile.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            onClick={() => onSelect(isActive ? 'overview' : tile.key)}
            className="relative flex flex-col items-start gap-2 p-3 text-left transition-all duration-200 rounded-xl"
            style={{
              background: isActive ? tile.bgColor : '#ffffff',
              border: `1px solid ${isActive ? tile.borderColor : 'var(--border-default)'}`,
              boxShadow: isActive
                ? `0 0 0 3px ${tile.color}12, var(--shadow-card)`
                : 'var(--shadow-card)',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#d1d5db'
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.boxShadow = 'var(--shadow-card)'
              }
            }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${tile.color}15` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: tile.color }} />
            </div>

            {/* Metric */}
            <div>
              <div className="text-lg font-bold leading-none font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                {tile.value}
              </div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {tile.label}
              </div>
            </div>

            {/* Trend + sub */}
            <div className="flex items-center gap-1">
              <TrendIcon trend={tile.trend} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {tile.sub}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
