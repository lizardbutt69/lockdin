import { Flame, Zap } from 'lucide-react'
import { getRankInfo } from '../../hooks/useProfile'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface BottomBarProps {
  profile: Profile | null
  todayXP: number
}

export default function BottomBar({ profile, todayXP }: BottomBarProps) {
  if (!profile) return null

  const rankInfo = getRankInfo(profile.total_xp)
  const xpForLevel = profile.level * 500
  const prevLevelXP = ((profile.level - 1) * profile.level) / 2 * 500
  const xpIntoLevel = profile.total_xp - prevLevelXP
  const levelPct = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100))

  return (
    <footer className="border-t px-4 py-3" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-screen-2xl mx-auto flex items-center gap-6">
        {/* Streak */}
        <div className="flex items-center gap-2 shrink-0">
          <Flame className="w-4 h-4" style={{ color: '#f97316' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: '#f97316' }}>
              {profile.current_streak}d
            </div>
            <div className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Streak</div>
          </div>
        </div>

        <div className="h-8 w-px" style={{ background: 'var(--border-default)' }} />

        {/* Today XP */}
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4" style={{ color: '#22c55e' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: '#22c55e' }}>
              +{todayXP} XP
            </div>
            <div className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Today</div>
          </div>
        </div>

        <div className="h-8 w-px" style={{ background: 'var(--border-default)' }} />

        {/* Level progress bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Lvl {profile.level} — {rankInfo?.rank}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {xpIntoLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${levelPct}%`, background: '#22c55e' }}
            />
          </div>
        </div>

        <div className="h-8 w-px hidden sm:block" style={{ background: 'var(--border-default)' }} />

        {/* Total XP */}
        <div className="hidden sm:block shrink-0 text-right">
          <div className="text-sm font-bold" style={{ color: '#eab308' }}>
            {profile.total_xp.toLocaleString()} XP
          </div>
          <div className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Total</div>
        </div>
      </div>
    </footer>
  )
}
