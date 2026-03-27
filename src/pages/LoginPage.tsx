import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Mail, Lock, User, Target } from 'lucide-react'

type Mode = 'login' | 'signup'

const PILLARS = [
  { label: 'God',           color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  { label: 'Finances',      color: '#16a34a', bg: 'rgba(22,163,74,0.15)'  },
  { label: 'Career',        color: '#2563eb', bg: 'rgba(37,99,235,0.15)'  },
  { label: 'Relationships', color: '#dc2626', bg: 'rgba(220,38,38,0.15)'  },
  { label: 'Fitness',       color: '#ea580c', bg: 'rgba(234,88,12,0.15)'  },
  { label: 'Trips',         color: '#0284c7', bg: 'rgba(2,132,199,0.15)'  },
]

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        if (!displayName.trim()) throw new Error('Please enter your name')
        if (password.length < 8) throw new Error('Password must be at least 8 characters')
        const { error } = await signUp(email, password, displayName)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f6f9' }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12"
        style={{ background: '#0d1117', position: 'relative', overflow: 'hidden' }}
      >
        {/* Subtle background glow */}
        <div
          className="absolute"
          style={{
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
            top: '10%',
            left: '-10%',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute"
          style={{
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
            bottom: '15%',
            right: '-5%',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.35)' }}
          >
            <Target className="w-5 h-5" style={{ color: '#4ade80' }} />
          </div>
          <span
            className="text-lg font-bold tracking-widest font-['Plus_Jakarta_Sans']"
            style={{ color: '#f9fafb', letterSpacing: '0.15em' }}
          >
            LOCKD IN
          </span>
        </div>

        {/* Center content */}
        <div className="space-y-8 relative z-10">
          {/* Eyebrow */}
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#4ade80', letterSpacing: '0.2em' }}
          >
            Personal Command Center
          </p>

          {/* Headline */}
          <div className="space-y-2">
            <h1
              className="font-bold font-['Plus_Jakarta_Sans'] leading-[1.1]"
              style={{ color: '#f9fafb', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
            >
              Build the man.<br />
              <span style={{ color: '#4ade80' }}>Track the mission.</span>
            </h1>
          </div>

          {/* Subheadline */}
          <p
            className="text-base leading-relaxed max-w-sm"
            style={{ color: '#9ca3af' }}
          >
            Most men know what they should be doing. Few hold themselves to it.
            LOCKD IN is the system that closes the gap — one dashboard, six pillars, zero drift.
          </p>

          {/* Pillar grid */}
          <div className="flex flex-wrap gap-2">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: p.bg, border: `1px solid ${p.color}30`, color: p.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                {p.label}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Proverb */}
        <div className="relative z-10 space-y-1">
          <div className="w-8 h-px" style={{ background: 'rgba(74,222,128,0.4)' }} />
          <p
            className="text-sm italic"
            style={{ color: '#6b7280' }}
          >
            "Iron sharpens iron, and one man sharpens another."
          </p>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#4ade80', opacity: 0.7 }}>
            Proverbs 27:17
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <Target className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold" style={{ color: '#111827' }}>
              LOCKD IN
            </span>
          </div>

          {/* Form heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h2
                className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-1.5"
                style={{ color: '#111827' }}
              >
                {mode === 'login' ? 'Welcome back.' : 'Set up your command center.'}
              </h2>
              <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
                {mode === 'login'
                  ? 'Sign in and get back to work.'
                  : 'Start owning every area of your life.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                    Your name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Danny"
                      className="tactical-input"
                      style={{ paddingLeft: '2.5rem', background: '#f9fafb', color: '#111827' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="tactical-input"
                  style={{ paddingLeft: '2.5rem', background: '#f9fafb', color: '#111827' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="tactical-input"
                  style={{ paddingLeft: '2.5rem', background: '#f9fafb', color: '#111827' }}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm"
                  style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 mt-2 disabled:opacity-60"
              style={{ background: loading ? '#4ade80' : '#16a34a' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803d' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#16a34a' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="font-semibold transition-colors"
              style={{ color: '#16a34a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#15803d'}
              onMouseLeave={e => e.currentTarget.style.color = '#16a34a'}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
