import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Flame, TrendingUp, Award, Settings } from 'lucide-react'
import { getLevelInfo } from '../../hooks/useProfile'
import { useXPSystem, XP_VALUES } from '../../hooks/useXPSystem'
import { useXP } from '../../contexts/XPContext'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileXPPopupProps {
  profile: Profile | null
  isOpen: boolean
  onClose: () => void
  onOpenSettings?: () => void
  onSignOut?: () => void
}

export default function ProfileXPPopup({ profile, isOpen, onClose, onOpenSettings }: ProfileXPPopupProps) {
  const { getXPSummary, transactions } = useXPSystem()
  const { todayXP } = useXP()
  const xpSummary = getXPSummary()
  const levelInfo = getLevelInfo(profile?.total_xp || 0)

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      habit: 'Habit Completion',
      mission: 'Mission Complete',
      mission_bonus: 'Mission Bonus',
      goal_subgoal: 'Sub-Goal Complete',
      goal_complete: 'Goal Complete',
      streak_bonus: 'Streak Bonus',
      perfect_day: 'Perfect Day',
      weekly_review: 'Weekly Review',
      manual: 'Manual Adjustment',
    }
    return labels[source] || source
  }

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      habit: '#22c55e',
      mission: '#3b82f6',
      mission_bonus: '#8b5cf6',
      goal_subgoal: '#f59e0b',
      goal_complete: '#f97316',
      streak_bonus: '#ef4444',
      perfect_day: '#eab308',
      weekly_review: '#06b6d4',
      manual: '#6b7280',
    }
    return colors[source] || '#6b7280'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Profile Progress
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Track your XP journey
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onClose(); onOpenSettings?.() }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Level & XP Overview */}
              <div className="flex items-center gap-6">
                {/* Level Badge */}
                <div className="flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                      boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">Lv</div>
                      <div className="text-xl font-bold text-white">{levelInfo.level}</div>
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {profile?.total_xp?.toLocaleString() || 0}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>XP total</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{levelInfo.xpForCurrentLevel} / 1000 XP</span>
                    <span>·</span>
                    <span>{levelInfo.xpNeeded} XP to Level {levelInfo.level + 1}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ background: 'linear-gradient(90deg, #4ade80, #16a34a)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Today</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>+{todayXP}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Streak</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.current_streak || 0}d</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Best</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.longest_streak || 0}d</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Actions</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{transactions.length}</div>
                </div>
              </div>

              {/* XP Breakdown */}
              {Object.keys(xpSummary.bySource).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>XP Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(xpSummary.bySource)
                      .sort((a, b) => b[1] - a[1])
                      .map(([source, amount]) => (
                        <div key={source} className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: getSourceColor(source) }}
                          />
                          <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                            {getSourceLabel(source)}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            +{amount.toLocaleString()} XP
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* XP Values Reference */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>How to Earn XP</h3>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                    <span>Daily habit: +{XP_VALUES.habit_daily} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#16a34a' }} />
                    <span>Weekly habit: +{XP_VALUES.habit_weekly} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
                    <span>Mission (std): +{XP_VALUES.mission_standard} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />
                    <span>Mission bonus: +{XP_VALUES.mission_complete_bonus} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
                    <span>Sub-goal: +{XP_VALUES.goal_subgoal} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f97316' }} />
                    <span>Goal complete: +{XP_VALUES.goal_complete} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#eab308' }} />
                    <span>Perfect day: +{XP_VALUES.perfect_day} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
                    <span>Streak bonus: up to +100%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {xpSummary.recentTransactions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
                  <div className="space-y-2">
                    {xpSummary.recentTransactions.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${getSourceColor(t.source)}15` }}
                        >
                          <Zap className="w-3.5 h-3.5" style={{ color: getSourceColor(t.source) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {t.description || getSourceLabel(t.source)}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(t.created_at)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                          +{t.amount} XP
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}