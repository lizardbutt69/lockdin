import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Mail, Lock, User, Target, CheckCircle } from 'lucide-react'

type Mode = 'login' | 'signup'

const PILLARS = [
  { label: 'God & Spirituality',      color: '#7c3aed' },
  { label: 'Finances',                color: '#0891b2' },
  { label: 'Wife & Relationships',    color: '#e11d48' },
  { label: 'Diet & Health',           color: '#16a34a' },
  { label: 'Fitness',                 color: '#ea580c' },
  { label: 'Trips & Adventures',      color: '#2563eb' },
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
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 60%, #14532d 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-lg font-bold font-['Space_Grotesk'] tracking-wide">LOCKD IN</span>
        </div>

        {/* Center content */}
        <div>
          <h1 className="text-white text-4xl font-bold font-['Space_Grotesk'] leading-tight mb-4">
            Your personal<br />command center.
          </h1>
          <p className="text-green-200 text-base leading-relaxed mb-10">
            Track and level up across 6 life pillars. Built for men who are serious about becoming better.
          </p>

          <div className="space-y-3">
            {PILLARS.map(p => (
              <div key={p.label} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-300 shrink-0" />
                <span className="text-green-100 text-sm font-medium">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-300 text-sm">
          Iron sharpens iron — Proverbs 27:17
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <Target className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
            <span className="font-['Space_Grotesk'] text-lg font-bold" style={{ color: '#111827' }}>LOCKD IN</span>
          </div>

          <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-1" style={{ color: '#111827' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
            {mode === 'login'
              ? 'Sign in to your command center.'
              : 'Start tracking your 6 life pillars.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
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
                      className="tactical-input pl-10"
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
                  className="tactical-input pl-10"
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
                  className="tactical-input pl-10"
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
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Sign in' : 'Create account'}
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
