import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Flame, TrendingUp, Award, User, Camera, Trash2, BookOpen, Key, Eye, EyeOff, Check, Lock } from 'lucide-react'
import { getLevelInfo } from '../../hooks/useProfile'
import { useXPSystem, XP_VALUES } from '../../hooks/useXPSystem'
import { useXP } from '../../contexts/XPContext'
import { useJournalLock } from '../../contexts/JournalLockContext'
import { AVATAR_COLORS, getAvatarColor } from './SettingsPanel'
import type { Database } from '../../types/database'

const ANTHROPIC_KEY_STORAGE = 'lockedin_anthropic_key'
const AVATAR_COLOR_KEY = 'lockedin_avatar_color'
const AVATAR_PHOTO_KEY = 'lockedin_avatar_photo'

type Profile = Database['public']['Tables']['profiles']['Row']
type Tab = 'progress' | 'settings'

interface ProfileXPPopupProps {
  profile: Profile | null
  isOpen: boolean
  onClose: () => void
  initialTab?: Tab
  displayName?: string
  isReligious?: boolean
  onSaveName?: (name: string) => Promise<void>
  onToggleReligious?: (isReligious: boolean) => Promise<void>
}

export default function ProfileXPPopup({
  profile,
  isOpen,
  onClose,
  initialTab = 'progress',
  displayName,
  isReligious = true,
  onSaveName,
  onToggleReligious,
}: ProfileXPPopupProps) {
  const { getXPSummary, transactions } = useXPSystem()
  const { todayXP } = useXP()
  const { hasPIN, setPin, removePin } = useJournalLock()
  const xpSummary = getXPSummary()
  const levelInfo = getLevelInfo(profile?.total_xp || 0)

  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  // Settings state
  const [nameInput, setNameInput] = useState(displayName || profile?.display_name || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [avatarColorId, setAvatarColorId] = useState(localStorage.getItem(AVATAR_COLOR_KEY) || 'green')
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem(AVATAR_PHOTO_KEY))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [religiousSavedValue, setReligiousSavedValue] = useState<boolean | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(ANTHROPIC_KEY_STORAGE)
    if (stored) setApiKey(stored)
  }, [])

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab)
  }, [isOpen, initialTab])

  // Sync name when profile loads
  useEffect(() => {
    if (profile?.display_name && !nameInput) setNameInput(profile.display_name)
  }, [profile?.display_name])

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

  // ── Settings handlers ──
  async function saveName() {
    if (!nameInput.trim()) return
    await onSaveName?.(nameInput.trim())
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function saveAvatarColor(id: string) {
    setAvatarColorId(id)
    localStorage.setItem(AVATAR_COLOR_KEY, id)
  }

  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      localStorage.setItem(AVATAR_PHOTO_KEY, base64)
      setPhoto(base64)
      window.dispatchEvent(new Event('lockedin_avatar_updated'))
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    localStorage.removeItem(AVATAR_PHOTO_KEY)
    setPhoto(null)
    window.dispatchEvent(new Event('lockedin_avatar_updated'))
  }

  function saveApiKey() {
    if (!apiKey.trim()) return
    localStorage.setItem(ANTHROPIC_KEY_STORAGE, apiKey.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  function removeApiKey() {
    localStorage.removeItem(ANTHROPIC_KEY_STORAGE)
    setApiKey('')
  }

  function handlePinSave() {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) { setPinMsg('PIN must be 4 digits'); return }
    if (pinInput !== pinConfirm) { setPinMsg('PINs do not match'); return }
    setPin(pinInput)
    setPinInput(''); setPinConfirm('')
    setPinMsg('PIN updated')
    setTimeout(() => setPinMsg(''), 2000)
  }

  function handlePinRemove() {
    removePin()
    setPinInput(''); setPinConfirm('')
    setPinMsg('PIN removed')
    setTimeout(() => setPinMsg(''), 2000)
  }

  async function handleToggleReligious(newValue: boolean) {
    await onToggleReligious?.(newValue)
    setReligiousSavedValue(newValue)
    setTimeout(() => setReligiousSavedValue(null), 2000)
  }

  // ── Progress helpers ──
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

  const avatarColor = AVATAR_COLORS.find(c => c.id === avatarColorId) || AVATAR_COLORS[0]
  const initials = nameInput ? nameInput.slice(0, 2).toUpperCase() : (displayName || profile?.display_name || 'OP').slice(0, 2).toUpperCase()
  const currentAvatarColor = getAvatarColor()

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
            className="glass-modal fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                  style={{ background: currentAvatarColor.bg, border: `1px solid ${currentAvatarColor.border}`, color: currentAvatarColor.text }}
                >
                  {photo
                    ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {profile?.display_name || 'Operator'}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Level {levelInfo.level} · {profile?.total_xp?.toLocaleString() || 0} XP
                  </p>
                </div>
              </div>
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

            {/* Tab switcher */}
            <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              {(['progress', 'settings'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 text-sm font-medium capitalize transition-colors"
                  style={{
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '2px solid #22c55e' : '2px solid transparent',
                  }}
                >
                  {tab === 'progress' ? 'Progress' : 'Settings'}
                </button>
              ))}
            </div>

            {/* ── Progress Tab ── */}
            {activeTab === 'progress' && (
              <div className="p-6 space-y-6">
                {/* Level & XP Overview */}
                <div className="flex items-center gap-6">
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
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getSourceColor(source) }} />
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
            )}

            {/* ── Settings Tab ── */}
            {activeTab === 'settings' && (
              <div className="p-6 space-y-6">

                {/* Profile */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4" style={{ color: '#2563eb' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Profile</h3>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden cursor-pointer"
                        style={{ background: avatarColor.bg, border: `2px solid ${avatarColor.border}`, color: avatarColor.text }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload photo"
                      >
                        {photo
                          ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                          : initials}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'var(--border-default)', border: '2px solid var(--bg-card)' }}
                        title="Upload photo"
                      >
                        <Camera className="w-2.5 h-2.5" style={{ color: 'var(--text-tertiary)' }} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoFile}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {photo ? 'Photo uploaded' : 'Avatar color'}
                      </p>
                      {!photo && (
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {AVATAR_COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => saveAvatarColor(c.id)}
                              className="w-5 h-5 rounded-full transition-all"
                              style={{
                                background: c.text,
                                outline: avatarColorId === c.id ? `2px solid ${c.text}` : 'none',
                                outlineOffset: 2,
                                transform: avatarColorId === c.id ? 'scale(1.2)' : 'scale(1)',
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {photo && (
                        <button
                          onClick={removePhoto}
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 className="w-3 h-3" /> Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      placeholder="Display name"
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={saveName}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                      style={{ background: nameSaved ? '#16a34a' : '#2563eb' }}
                    >
                      {nameSaved ? <><Check className="w-3 h-3" />Saved</> : 'Save'}
                    </button>
                  </div>
                </section>

                <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

                {/* Religious Content */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4" style={{ color: '#7c3aed' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Religious Content</h3>
                    {isReligious && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                        Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    {isReligious
                      ? 'God pillar, Bible verses, and faith-based content are visible.'
                      : 'Religious content is hidden. Enable to see the God pillar and Bible verses.'}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleReligious(true)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${isReligious ? 'ring-2 ring-[#7c3aed] ring-offset-1' : ''}`}
                      style={{
                        background: isReligious ? '#7c3aed' : 'var(--bg-input)',
                        color: isReligious ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {religiousSavedValue === true ? <><Check className="w-3 h-3 inline mr-1" />Saved</> : 'Enabled'}
                    </button>
                    <button
                      onClick={() => handleToggleReligious(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${!isReligious ? 'ring-2 ring-[#7c3aed] ring-offset-1' : ''}`}
                      style={{
                        background: !isReligious ? '#7c3aed' : 'var(--bg-input)',
                        color: !isReligious ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {religiousSavedValue === false ? <><Check className="w-3 h-3 inline mr-1" />Saved</> : 'Disabled'}
                    </button>
                  </div>
                </section>

                <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

                {/* API Key */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-4 h-4" style={{ color: '#7c3aed' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Anthropic API Key</h3>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    Used for AI devotionals and journal summaries. Stored locally only.
                  </p>
                  <div className="relative mb-2">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none"
                      style={{ border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={() => setShowKey(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: '#9ca3af' }}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveApiKey}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: keySaved ? '#16a34a' : '#7c3aed' }}
                    >
                      {keySaved ? <><Check className="w-3 h-3" />Saved</> : 'Save Key'}
                    </button>
                    {apiKey && (
                      <button onClick={removeApiKey} className="px-3 py-1.5 rounded-lg text-xs" style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                        Remove
                      </button>
                    )}
                  </div>
                </section>

                <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

                {/* Journal PIN */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4" style={{ color: '#16a34a' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Journal PIN</h3>
                    {hasPIN && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    {hasPIN ? 'Update or remove your journal PIN.' : 'Set a 4-digit PIN to lock your journal.'}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="password" inputMode="numeric" maxLength={4}
                      value={pinInput}
                      onChange={e => { if (/^\d*$/.test(e.target.value)) setPinInput(e.target.value) }}
                      placeholder="New PIN (4 digits)"
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="password" inputMode="numeric" maxLength={4}
                      value={pinConfirm}
                      onChange={e => { if (/^\d*$/.test(e.target.value)) setPinConfirm(e.target.value) }}
                      placeholder="Confirm PIN"
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  {pinMsg && (
                    <p className="text-xs mt-1.5" style={{ color: pinMsg.includes('removed') || pinMsg.includes('updated') ? '#16a34a' : '#ef4444' }}>
                      {pinMsg}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={handlePinSave} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#16a34a' }}>
                      {hasPIN ? 'Update PIN' : 'Set PIN'}
                    </button>
                    {hasPIN && (
                      <button onClick={handlePinRemove} className="px-3 py-1.5 rounded-lg text-xs" style={{ border: '1px solid #fca5a5', color: '#ef4444' }}>
                        Remove
                      </button>
                    )}
                  </div>
                </section>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
