import { useState, useEffect, useRef } from 'react'
import { Bell, Sun, Moon, LogOut, Menu, User, Settings, ChevronDown } from 'lucide-react'
import { getLevelInfo } from '../../hooks/useProfile'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { getAvatarColor } from './SettingsPanel'
import type { Database } from '../../types/database'
import type { PillarKey } from './Sidebar'

type Profile = Database['public']['Tables']['profiles']['Row']

interface TopBarProps {
  profile: Profile | null
  activePillar?: PillarKey
  onMenuToggle?: () => void
  onOpenSettings?: () => void
}

const PAGE_TITLES: Record<PillarKey, string> = {
  overview:      'Overview',
  god:           'God',
  finances:      'Finances',
  relationships: 'Relationships',
  fitness:       'Health & Fitness',
  trips:         'Trips',
  gratitude:     'Gratitude',
  career:        'Career',
  goals:         'Goals',
}

const AVATAR_PHOTO_KEY = 'lockedin_avatar_photo'

function LiveDate() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  const pad = (n: number) => n.toString().padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return (
    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
      {days[now.getDay()]}, {months[now.getMonth()]} {now.getDate()} · {pad(now.getHours())}:{pad(now.getMinutes())}
    </span>
  )
}

export default function TopBar({ profile, activePillar = 'overview', onMenuToggle, onOpenSettings }: TopBarProps) {
  const { theme, toggle } = useTheme()
  const { signOut } = useAuth()
  const levelInfo = profile ? getLevelInfo(profile.total_xp) : { level: 1, xpForCurrentLevel: 0, xpNeeded: 1000, progress: 0 }
  const initials = profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : 'OP'
  const avatarColor = getAvatarColor()
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem(AVATAR_PHOTO_KEY))
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // sync if photo changes in another component
  useEffect(() => {
    const handler = () => setPhoto(localStorage.getItem(AVATAR_PHOTO_KEY))
    window.addEventListener('lockedin_avatar_updated', handler)
    return () => window.removeEventListener('lockedin_avatar_updated', handler)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-lg transition-colors"
            style={{ 
              background: showDropdown ? 'var(--bg-input)' : 'transparent',
              border: showDropdown ? '1px solid var(--border-default)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!showDropdown) e.currentTarget.style.background = 'var(--bg-input)' }}
            onMouseLeave={e => { if (!showDropdown) e.currentTarget.style.background = 'transparent' }}
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
              <ChevronDown className={`w-3.5 h-3.5 hidden sm:block transition-transform ${showDropdown ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </div>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
                    style={{ background: avatarColor.bg, border: `2px solid ${avatarColor.border}`, color: avatarColor.text }}
                  >
                    {photo
                      ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {profile?.display_name || 'Operator'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Level {levelInfo.level}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => { setShowDropdown(false); onOpenSettings?.() }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onOpenSettings?.() }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <div className="p-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}