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

  // XP within current level
  const prevLevelXP = ((profile.level - 1) * profile.level) / 2 * 500
  const xpIntoLevel = profile.total_xp - prevLevelXP
  const levelPct = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100))

  return (
    <footer className="border-t border-[#2a3441] bg-[#0a0e17] px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-6">
        {/* Streak */}
        <div className="flex items-center gap-2 shrink-0">
          <Flame className="w-4 h-4 text-[#ff9500]" />
          <div>
            <div className="font-['Inter'] text-[#ff9500] text-sm font-bold">
              {profile.current_streak}d
            </div>
            <div className="text-[#94a3b8] font-mono text-[10px] tracking-widest">STREAK</div>
          </div>
        </div>

        <div className="h-8 w-px bg-[#2a3441]" />

        {/* Today XP */}
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-[#00ff41]" />
          <div>
            <div className="font-['Inter'] text-[#00ff41] text-sm font-bold glow-green">
              +{todayXP} XP
            </div>
            <div className="text-[#94a3b8] font-mono text-[10px] tracking-widest">TODAY</div>
          </div>
        </div>

        <div className="h-8 w-px bg-[#2a3441]" />

        {/* Level progress bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#94a3b8] font-mono text-[10px] tracking-widest">
              LVL {profile.level} — {rankInfo?.rank}
            </span>
            <span className="text-[#94a3b8] font-mono text-[10px] tracking-widest">
              {xpIntoLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-[#1a1f2e] border border-[#2a3441] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff41]/60 to-[#00ff41] transition-all duration-1000"
              style={{
                width: `${levelPct}%`,
                boxShadow: '0 0 8px rgba(0,255,65,0.6)',
              }}
            />
          </div>
        </div>

        <div className="h-8 w-px bg-[#2a3441] hidden sm:block" />

        {/* Total XP */}
        <div className="hidden sm:block shrink-0 text-right">
          <div className="font-['Inter'] text-[#ffd700] text-sm font-bold">
            {profile.total_xp.toLocaleString()} XP
          </div>
          <div className="text-[#94a3b8] font-mono text-[10px] tracking-widest">TOTAL</div>
        </div>
      </div>
    </footer>
  )
}
