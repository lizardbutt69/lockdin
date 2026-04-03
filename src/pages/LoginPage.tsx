import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  AlertCircle, Mail, Lock, User, Target, ArrowLeft,
  BookOpen, DollarSign, Briefcase, Heart, Dumbbell, Plane, Sparkles, BarChart3,
  Flame, Zap, CheckCircle2,
} from 'lucide-react'

type Mode = 'login' | 'signup'

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
        {/* Background glows */}
        <div className="absolute" style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)', top: '-5%', left: '-15%', pointerEvents: 'none' }} />
        <div className="absolute" style={{ width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', bottom: '10%', right: '-8%', pointerEvents: 'none' }} />

        {/* Logo + back link */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.35)' }}>
              <Target className="w-5 h-5" style={{ color: '#4ade80' }} />
            </div>
            <span className="text-lg font-bold tracking-widest font-['Plus_Jakarta_Sans']" style={{ color: '#f9fafb', letterSpacing: '0.15em' }}>
              LOCKD IN
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </button>
        </div>

        {/* Center content */}
        <div className="space-y-8 relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#4ade80', letterSpacing: '0.2em' }}>
            Personal Command Center
          </p>

          <div className="space-y-3">
            <h1 className="font-bold font-['Plus_Jakarta_Sans'] leading-[1.1]" style={{ color: '#f9fafb', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
              One dashboard.<br />
              <span style={{ color: '#4ade80' }}>Every area of your life.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: '#6b7280' }}>
              Stop juggling apps and spreadsheets. LOCKD IN gives you a single command center to track, measure, and level up across all pillars — daily.
            </p>
          </div>

          {/* Mini dashboard preview */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
            {/* Chrome bar */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(239,68,68,0.6)' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(245,158,11,0.6)' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(74,222,128,0.6)' }} />
            </div>

            <div className="flex" style={{ minHeight: 260 }}>
              {/* Mini sidebar */}
              <div className="w-10 shrink-0 flex flex-col items-center py-3 gap-2" style={{ background: 'rgba(0,0,0,0.25)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                  <Target className="w-2.5 h-2.5" style={{ color: '#4ade80' }} />
                </div>
                <div className="flex flex-col gap-2 mt-1 items-center">
                  {[
                    { icon: BarChart3, color: '#4ade80', active: true },
                    { icon: BookOpen, color: '#a78bfa' },
                    { icon: DollarSign, color: '#4ade80' },
                    { icon: Briefcase, color: '#60a5fa' },
                    { icon: Heart, color: '#f87171' },
                    { icon: Dumbbell, color: '#fb923c' },
                    { icon: Plane, color: '#38bdf8' },
                    { icon: Sparkles, color: '#fbbf24' },
                  ].map(({ icon: Icon, color, active }, i) => (
                    <div key={i} className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: active ? `${color}20` : 'transparent' }}>
                      <Icon className="w-2.5 h-2.5" style={{ color: active ? color : 'rgba(255,255,255,0.2)' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini content */}
              <div className="flex-1 p-2.5 space-y-2 overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Overview</span>
                  <div className="flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5" style={{ color: '#fbbf24' }} />
                    <span className="text-[8px] font-semibold" style={{ color: '#fbbf24' }}>47d</span>
                    <Zap className="w-2.5 h-2.5 ml-1" style={{ color: '#4ade80' }} />
                    <span className="text-[8px] font-semibold" style={{ color: '#4ade80' }}>+240 XP</span>
                  </div>
                </div>

                {/* Year bar */}
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[7px] tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>2025 PROGRESS</span>
                    <span className="text-[8px] font-bold" style={{ color: '#4ade80' }}>73%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: '73%', background: 'linear-gradient(90deg, #4ade80, #16a34a)' }} />
                  </div>
                </div>

                {/* Two col */}
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Missions */}
                  <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[7px] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>MISSIONS</p>
                    {[
                      { label: 'Morning workout', done: true },
                      { label: 'Read 20 pages', done: true },
                      { label: 'Cold outreach', done: false },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded shrink-0 flex items-center justify-center" style={{ background: done ? '#16a34a' : 'rgba(255,255,255,0.1)', border: `1px solid ${done ? '#16a34a' : 'rgba(255,255,255,0.15)'}` }}>
                          {done && <CheckCircle2 className="w-1.5 h-1.5 text-white" />}
                        </div>
                        <span className="text-[7px]" style={{ color: done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pillars */}
                  <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[7px] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>PILLARS</p>
                    {[
                      { icon: BookOpen, label: 'Faith', pct: 85, color: '#a78bfa' },
                      { icon: DollarSign, label: 'Finances', pct: 62, color: '#4ade80' },
                      { icon: Briefcase, label: 'Career', pct: 74, color: '#60a5fa' },
                      { icon: Dumbbell, label: 'Fitness', pct: 90, color: '#fb923c' },
                    ].map(({ icon: Icon, label: _label, pct, color }) => (
                      <div key={_label} className="flex items-center gap-1 mb-1">
                        <Icon className="w-2 h-2 shrink-0" style={{ color }} />
                        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[7px] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>GOALS</p>
                  <div className="flex gap-1.5">
                    {[
                      { label: 'Run marathon', pct: 40, color: '#fb923c' },
                      { label: 'Save $10k', pct: 62, color: '#4ade80' },
                      { label: 'Launch project', pct: 25, color: '#60a5fa' },
                    ].map(({ label, pct, color }) => (
                      <div key={label} className="flex-1">
                        <div className="h-1 rounded-full mb-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proverb */}
        <div className="relative z-10 space-y-1">
          <div className="w-8 h-px" style={{ background: 'rgba(74,222,128,0.4)' }} />
          <p className="text-sm italic" style={{ color: '#6b7280' }}>
            "Iron sharpens iron, and one man sharpens another."
          </p>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#4ade80', opacity: 0.7 }}>
            Proverbs 27:17
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16" style={{ background: '#ffffff' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo + back */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Target className="w-4 h-4" style={{ color: '#16a34a' }} />
              </div>
              <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold" style={{ color: '#111827' }}>LOCKD IN</span>
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#9ca3af' }}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
          </div>

          {/* Form heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-1.5" style={{ color: '#111827' }}>
                {mode === 'login' ? 'Welcome back.' : 'Start your mission.'}
              </h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {mode === 'login'
                  ? 'Sign in and pick up where you left off.'
                  : 'Create your account. Your command center awaits.'}
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Your name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Danny"
                      className="tactical-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="tactical-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="tactical-input"
                  style={{ paddingLeft: '2.5rem' }}
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
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 mt-2 disabled:opacity-60 shadow-lg shadow-green-500/20"
              style={{ background: '#16a34a' }}
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

          <p className="mt-8 text-center text-xs" style={{ color: '#d1d5db' }}>
            © {new Date().getFullYear()} Lockd In. Build the man. Track the mission.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
