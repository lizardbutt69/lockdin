import { useState, useEffect, useRef } from 'react'
import { X, Key, Eye, EyeOff, Check, Lock, User, Camera, Trash2, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useJournalLock } from '../../contexts/JournalLockContext'

const ANTHROPIC_KEY_STORAGE = 'lockedin_anthropic_key'
const AVATAR_COLOR_KEY = 'lockedin_avatar_color'
const AVATAR_PHOTO_KEY = 'lockedin_avatar_photo'

export const AVATAR_COLORS = [
  { id: 'green',  bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  { id: 'blue',   bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
  { id: 'purple', bg: '#faf5ff', border: '#e9d5ff', text: '#7c3aed' },
  { id: 'pink',   bg: '#fdf2f8', border: '#f9a8d4', text: '#db2777' },
  { id: 'orange', bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  { id: 'teal',   bg: '#f0fdfa', border: '#99f6e4', text: '#0d9488' },
  { id: 'red',    bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  { id: 'slate',  bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
]

export function getAvatarColor() {
  const id = localStorage.getItem(AVATAR_COLOR_KEY) || 'green'
  return AVATAR_COLORS.find(c => c.id === id) || AVATAR_COLORS[0]
}

interface SettingsPanelProps {
  onClose: () => void
  displayName?: string
  isReligious?: boolean
  onSaveName?: (name: string) => Promise<void>
  onToggleReligious?: (isReligious: boolean) => Promise<void>
}

export default function SettingsPanel({ onClose, displayName, isReligious = true, onSaveName, onToggleReligious }: SettingsPanelProps) {
  const { hasPIN, setPin, removePin } = useJournalLock()

  // Profile
  const [nameInput, setNameInput] = useState(displayName || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [avatarColorId, setAvatarColorId] = useState(localStorage.getItem(AVATAR_COLOR_KEY) || 'green')
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem(AVATAR_PHOTO_KEY))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [religiousSavedValue, setReligiousSavedValue] = useState<boolean | null>(null)

  // API Key
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // PIN
  const [pinInput, setPinInput] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(ANTHROPIC_KEY_STORAGE)
    if (stored) setApiKey(stored)
  }, [])

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

  const avatarColor = AVATAR_COLORS.find(c => c.id === avatarColorId) || AVATAR_COLORS[0]
  const initials = nameInput ? nameInput.slice(0, 2).toUpperCase() : (displayName || 'OP').slice(0, 2).toUpperCase()

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 z-50 w-80 flex flex-col"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-default)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-semibold font-['Plus_Jakarta_Sans'] text-base" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#9ca3af' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* ── Profile ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4" style={{ color: '#2563eb' }} />
              <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Profile</h3>
            </div>

            {/* Avatar preview + color picker */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-['Plus_Jakarta_Sans'] shrink-0 overflow-hidden cursor-pointer"
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

            {/* Name */}
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

          {/* ── Religious Preference ── */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" style={{ color: '#7c3aed' }} />
              <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Religious Content</h3>
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

          {/* ── API Key ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4" style={{ color: '#7c3aed' }} />
              <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Anthropic API Key</h3>
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

          {/* ── Journal PIN ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4" style={{ color: '#16a34a' }} />
              <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans']" style={{ color: 'var(--text-primary)' }}>Journal PIN</h3>
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
      </motion.div>
    </>
  )
}
