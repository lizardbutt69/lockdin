import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, BookOpen, DollarSign, Heart, Leaf, Dumbbell, Plane, LogOut, Flame, Zap, Target, Settings, Sparkles, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { getRankInfo } from '../../hooks/useProfile'
import SettingsPanel, { getAvatarColor } from './SettingsPanel'
import PomodoroTimer from './PomodoroTimer'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export type PillarKey = 'overview' | 'god' | 'finances' | 'relationships' | 'diet' | 'fitness' | 'trips' | 'gratitude' | 'career'

interface SidebarProps {
  activePillar: PillarKey
  onSelect: (p: PillarKey) => void
  profile: Profile | null
  todayXP: number
  onUpdateProfile?: (name: string) => Promise<void>
  isOpen?: boolean
  onClose?: () => void
}

const NAV_ITEMS: { key: PillarKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview',      label: 'Overview',       icon: LayoutGrid },
  { key: 'god',           label: 'God',            icon: BookOpen   },
  { key: 'finances',      label: 'Finances',       icon: DollarSign },
  { key: 'relationships', label: 'Relationships',  icon: Heart      },
  { key: 'diet',          label: 'Diet & Health',  icon: Leaf       },
  { key: 'fitness',       label: 'Fitness',        icon: Dumbbell   },
  { key: 'trips',         label: 'Trips',          icon: Plane      },
  { key: 'career',        label: 'Career',         icon: Briefcase  },
]

export default function Sidebar({ activePillar, onSelect, profile, todayXP, onUpdateProfile, isOpen = false, onClose }: SidebarProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem('lockedin_avatar_photo'))
  const avatarColor = getAvatarColor()

  // sync photo when updated from settings
  useEffect(() => {
    const handler = () => setPhoto(localStorage.getItem('lockedin_avatar_photo'))
    window.addEventListener('lockedin_avatar_updated', handler)
    return () => window.removeEventListener('lockedin_avatar_updated', handler)
  }, [])
  const rankInfo = profile ? getRankInfo(profile.total_xp) : null

  const level = profile?.level || 1
  const totalXP = profile?.total_xp || 0
  const xpForLevel = level * 500
  const prevLevelXP = ((level - 1) * level) / 2 * 500
  const levelPct = Math.min(100, Math.round(((totalXP - prevLevelXP) / xpForLevel) * 100))

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : 'OP'

  return (
    <aside
      className={`flex flex-col w-64 md:w-56 lg:w-60 shrink-0 h-full
        fixed md:static inset-y-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-default)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
        >
          <Target className="w-4 h-4" style={{ color: '#16a34a' }} />
        </div>
        <div>
          <div className="font-['Space_Grotesk'] text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            LOCKD IN
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Command Center
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider px-3 pb-2 pt-1 uppercase" style={{ color: 'var(--text-muted)' }}>
          Pillars
        </div>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activePillar === key
          return (
            <button
              key={key}
              onClick={() => { onSelect(key); onClose?.() }}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left group"
              style={{
                background: isActive ? '#f0fdf4' : 'transparent',
                color: isActive ? '#15803d' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r"
                  style={{ background: '#22c55e' }}
                />
              )}
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? '#16a34a' : '#9ca3af' }}
              />
              <span className="text-sm font-medium">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ border: '1px solid #bbf7d0' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Gratitude */}
      <div className="px-3 py-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => { onSelect('gratitude'); onClose?.() }}
          className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left"
          style={{
            background: activePillar === 'gratitude' ? '#fefce8' : 'transparent',
            color: activePillar === 'gratitude' ? '#b45309' : 'var(--text-secondary)',
          }}
          onMouseEnter={e => { if (activePillar !== 'gratitude') e.currentTarget.style.background = '#fefce8' }}
          onMouseLeave={e => { if (activePillar !== 'gratitude') e.currentTarget.style.background = 'transparent' }}
        >
          {activePillar === 'gratitude' && (
            <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r" style={{ background: '#f59e0b' }} />
          )}
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: activePillar === 'gratitude' ? '#f59e0b' : '#9ca3af' }} />
          <span className="text-sm font-medium">Gratitude</span>
          {activePillar === 'gratitude' && (
            <motion.div
              layoutId="sidebar-gratitude-bg"
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ border: '1px solid #fde68a' }}
            />
          )}
        </button>
      </div>

      {/* Bottom */}
      <div
        className="px-3 pb-4 pt-3 space-y-3"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        {/* Pomodoro timer */}
        <PomodoroTimer compact />

        {/* Streak + XP */}
        {profile && (
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              <span className="text-xs font-semibold" style={{ color: '#b45309' }}>
                {profile.current_streak}d
              </span>
            </div>
            <div className="h-3 w-px" style={{ background: 'var(--border-default)' }} />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
              <span className="text-xs font-semibold" style={{ color: '#15803d' }}>
                +{todayXP} XP
              </span>
            </div>
          </div>
        )}

        {/* Level bar */}
        {profile && (
          <div className="px-1">
            <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium">{rankInfo?.rank} · Lv {level}</span>
              <span>{levelPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, #4ade80, #16a34a)' }}
              />
            </div>
          </div>
        )}

        {/* User row */}
        <div
          className="flex items-center gap-2.5 px-1 py-1 rounded-lg cursor-pointer transition-colors"
          onClick={() => setShowSettings(true)}
          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title="Settings"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
            style={{ background: avatarColor.bg, border: `1px solid ${avatarColor.border}`, color: avatarColor.text }}
          >
            {photo ? <img src={photo} alt="avatar" className="w-full h-full object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {profile?.display_name || 'Operator'}
            </div>
            <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
              {totalXP.toLocaleString()} XP total
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 shrink-0" style={{ color: '#9ca3af' }} />
          <button
            onClick={e => { e.stopPropagation(); handleSignOut() }}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <SettingsPanel
              onClose={() => setShowSettings(false)}
              displayName={profile?.display_name || undefined}
              onSaveName={onUpdateProfile}
            />
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
