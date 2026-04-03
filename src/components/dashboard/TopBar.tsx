import { useState, useEffect } from 'react'
import { Bell, Sun, Moon, LogOut, Menu } from 'lucide-react'
import { getLevelInfo } from '../../hooks/useProfile'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { getAvatarColor } from './SettingsPanel'
import ProfileXPPopup from './ProfileXPPopup'
import type { Database } from '../../types/database'
import type { PillarKey } from './Sidebar'

type Profile = Database['public']['Tables']['profiles']['Row']

interface TopBarProps {
  profile: Profile | null
  activePillar?: PillarKey
  onMenuToggle?: () => void
  onUpdateProfile?: (name: string) => Promise<void>
  onToggleReligious?: (isReligious: boolean) => Promise<void>
  isReligious?: boolean
}

const PAGE_TITLES: Record<PillarKey, string> = {
  overview: 'Overview',
  god: 'God',
  finances: 'Finances',
  relationships: 'Relationships',
  fitness: 'Health & Fitness',
  trips: 'Trips',
  gratitude: 'Gratitude',
  career: 'Career',
  goals: 'Goals',
}

const AVATAR_PHOTO_KEY = 'lockedin_avatar_photo'

function LiveDate() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  const pad = (n: number) => n.toString().padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return (
    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
      {days[now.getDay()]}, {months[now.getMonth()]} {now.getDate()} · {pad(now.getHours())}:{pad(now.getMinutes())}
    </span>
  )
}

export default function TopBar({ profile, activePillar = 'overview', onMenuToggle, onUpdateProfile, onToggleReligious, isReligious }: TopBarProps) {
  const { theme, toggle } = useTheme()
  const { signOut } = useAuth()
  const levelInfo = profile ? getLevelInfo(profile.total_xp) : { level: 1, xpForCurrentLevel: 0, xpNeeded: 1000, progress: 0 }
  const initials = profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : 'OP'
  const avatarColor = getAvatarColor()
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem(AVATAR_PHOTO_KEY))
  const [showProfilePopup, setShowProfilePopup] = useState(false)

  // sync if photo changes in another component
  useEffect(() => {
    const handler = () => setPhoto(localStorage.getItem(AVATAR_PHOTO_KEY))
    window.addEventListener('lockedin_avatar_updated', handler)
    return () => window.removeEventListener('lockedin_avatar_updated', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 shrink-0"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>
          {PAGE_TITLES[activePillar]}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden sm:block">
          <LiveDate />
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button
          className="relative w-8 h-8 rounded-lg hidden sm:flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={handleSignOut}
          title="Sign out"
          className="w-8 h-8 rounded-lg hidden sm:flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Profile button - opens popup */}
        <button
          onClick={() => setShowProfilePopup(true)}
          className="flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {profile?.display_name || 'Operator'}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Level {levelInfo.level}
              </div>
            </div>
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
              style={{ background: avatarColor.bg, border: `1px solid ${avatarColor.border}`, color: avatarColor.text }}
            >
              {photo
                ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
          </div>
        </button>

        {/* Profile XP Popup */}
        <ProfileXPPopup
          profile={profile}
          isOpen={showProfilePopup}
          onClose={() => setShowProfilePopup(false)}
          displayName={profile?.display_name || undefined}
          isReligious={isReligious}
          onSaveName={onUpdateProfile}
          onToggleReligious={onToggleReligious}
        />
      </div>
    </header>
  )
}