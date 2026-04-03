import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  Target,
  TrendingUp,
  Shield,
  Users,
  Dumbbell,
  DollarSign,
  Briefcase,
  MapPin,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  Bell,
  Menu,
  X,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [previewImgError, setPreviewImgError] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const pillars = [
    {
      icon: BookOpen,
      label: 'Religion/Spirituality',
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.1)',
      border: 'rgba(124,58,237,0.2)',
      description: 'Deepen your faith through prayer, scripture, and spiritual discipline.',
    },
    {
      icon: DollarSign,
      label: 'Finances',
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.1)',
      border: 'rgba(22,163,74,0.2)',
      description: 'Track expenses, build savings, and achieve financial freedom.',
    },
    {
      icon: Briefcase,
      label: 'Career',
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.1)',
      border: 'rgba(37,99,235,0.2)',
      description: 'Level up your skills, hit your goals, and build your legacy.',
    },
    {
      icon: Users,
      label: 'Relationships',
      color: '#dc2626',
      bg: 'rgba(220,38,38,0.1)',
      border: 'rgba(220,38,38,0.2)',
      description: 'Nurture meaningful connections with family, friends, and community.',
    },
    {
      icon: Dumbbell,
      label: 'Fitness',
      color: '#ea580c',
      bg: 'rgba(234,88,12,0.1)',
      border: 'rgba(234,88,12,0.2)',
      description: 'Build strength, endurance, and health through consistent training.',
    },
    {
      icon: MapPin,
      label: 'Trips',
      color: '#0284c7',
      bg: 'rgba(2,132,199,0.1)',
      border: 'rgba(2,132,199,0.2)',
      description: 'Plan adventures and create memories that last a lifetime.',
    },
  ]

  const features = [
    {
      icon: Target,
      title: 'Mission Control Dashboard',
      description: 'See your entire life at a glance. Track progress across all pillars with real-time metrics and readiness scores.',
    },
    {
      icon: Calendar,
      title: 'Daily Discipline System',
      description: 'Build unbreakable habits with streak tracking, daily logs, and accountability check-ins.',
    },
    {
      icon: BarChart3,
      title: 'Goal Architecture',
      description: 'Set quarterly missions with measurable milestones. Break big visions into daily actions.',
    },
    {
      icon: Shield,
      title: 'Journal Lock Mode',
      description: 'Write freely with time-locked entries. Your private thoughts stay private until you decide otherwise.',
    },
    {
      icon: Zap,
      title: 'Pomodoro Focus Timer',
      description: 'Crush deep work sessions with built-in focus timers and productivity tracking.',
    },
    {
      icon: Bell,
      title: 'Mission Alerts',
      description: 'Get notified about important dates, habit streaks, and pillar check-ins.',
    },
  ]

  const stats = [
    { value: '6', label: 'Life Pillars', suffix: '' },
    { value: '100', label: 'Custom Habits', suffix: '+' },
    { value: '∞', label: 'Potential', suffix: '' },
  ]

  return (
    <div className="min-h-screen bg-[#f4f6f9] overflow-hidden">
      {/* ── Navigation ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)' }}
              >
                <Target className="w-4 h-4" style={{ color: '#16a34a' }} />
              </div>
              <span className="font-bold text-lg tracking-widest" style={{ color: '#111827', letterSpacing: '0.15em' }}>
                LOCKD IN
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#pillars" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pillars
              </a>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ background: '#16a34a' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#16a34a')}
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-6 py-4 space-y-4">
                <a
                  href="#features"
                  className="block text-sm font-medium text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pillars"
                  className="block text-sm font-medium text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pillars
                </a>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="block text-sm font-medium text-gray-600"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#16a34a' }}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[80vh] flex items-center pt-16">
        {/* Background gradient orbs */}
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
        />

        <motion.div
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center"
        >
          {/* Left: Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(22,163,74,0.08)', color: '#15803d', border: '1px solid rgba(22,163,74,0.15)' }}
            >
              <Zap className="w-3.5 h-3.5" />
              Personal Command Center
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ color: '#111827' }}
            >
              Forge Your Best<br />
              <span style={{ color: '#16a34a' }}>Self. Systematically.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl leading-relaxed max-w-lg"
              style={{ color: '#6b7280' }}
            >
              You know what you should be doing. Lockd In gives you the system to actually do it.
              Track every pillar of your life in one powerful dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-xl text-base font-semibold text-white flex items-center gap-2 transition-all duration-200 shadow-lg shadow-green-500/25"
                style={{ background: '#16a34a' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#16a34a')}
              >
                Start Your Mission
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#pillars"
                className="px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 transition-all duration-200"
                style={{ background: 'rgba(17,24,39,0.05)', color: '#111827', border: '1px solid rgba(17,24,39,0.1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(17,24,39,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(17,24,39,0.05)')}
              >
                Explore Pillars
              </a>
            </motion.div>

            {/* Bible Verse */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-8 border-t border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-px mt-2" style={{ background: 'rgba(22,163,74,0.4)' }} />
                <div>
                  <p className="text-base italic leading-relaxed" style={{ color: '#6b7280' }}>
                    "Iron sharpens iron, and one man sharpens another."
                  </p>
                  <p className="text-xs font-semibold tracking-wider uppercase mt-2" style={{ color: '#16a34a', opacity: 0.7 }}>
                    Proverbs 27:17
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative"
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(22,163,74,0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              {/* Preview image */}
              <div className="relative">
                {previewImgError ? (
                  <div
                    className="flex items-center justify-center p-8 min-h-[400px]"
                    style={{ background: 'linear-gradient(135deg, #f4f6f9 0%, #e5e7eb 100%)' }}
                  >
                    <div className="text-center space-y-3">
                      {[
                        { color: '#7c3aed', label: 'RELIGION/SPIRITUALITY' },
                        { color: '#16a34a', label: 'FINANCES' },
                        { color: '#2563eb', label: 'CAREER' },
                        { color: '#10b981', label: 'HEALTH' },
                      ].map(({ color, label }) => (
                        <div
                          key={label}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mx-1"
                          style={{ background: `${color}1a`, border: `1px solid ${color}33` }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                          <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <img
                    src="/dashboard-preview.png"
                    alt="Dashboard Preview"
                    className="w-full h-auto"
                    onError={() => setPreviewImgError(true)}
                  />
                )}
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
              style={{ background: '#ffffff', border: '1px solid rgba(22,163,74,0.2)' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Daily Streak</p>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>47 Days</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="absolute -top-6 -right-6 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
              style={{ background: '#ffffff', border: '1px solid rgba(37,99,235,0.2)' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Readiness</p>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>87%</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-12 border-y border-gray-200" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#111827' }}>
                  {stat.value}
                  <span style={{ color: '#16a34a' }}>{stat.suffix}</span>
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(22,163,74,0.08)', color: '#15803d' }}
            >
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#111827' }}>
              Everything You Need to<br />Stay Lockd In
            </h2>
            <p className="text-lg" style={{ color: '#6b7280' }}>
              A complete system for tracking, measuring, and improving every area of your life.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-8 rounded-2xl transition-all duration-300"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(22,163,74,0.3)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(22,163,74,0.08)' }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: '#16a34a' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#111827' }}>
                  {feature.title}
                </h3>
                <p className="leading-relaxed" style={{ color: '#6b7280' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars Section ── */}
      <section id="pillars" className="py-20" style={{ background: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(22,163,74,0.08)', color: '#15803d' }}
            >
              The Framework
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#111827' }}>
              Six Pillars of a<br />Complete Life
            </h2>
            <p className="text-lg" style={{ color: '#6b7280' }}>
              True success isn't one-dimensional. Track and grow across all areas that matter.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: pillar.bg,
                  border: `1px solid ${pillar.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 12px 40px ${pillar.color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.6)' }}
                >
                  <pillar.icon className="w-5 h-5" style={{ color: pillar.color }} />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: pillar.color }}
                >
                  {pillar.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#111827' }}>
              Ready to Get Lockd In?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#6b7280' }}>
              Join thousands of people who are building their best selves, one pillar at a time.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 rounded-xl text-lg font-semibold text-white flex items-center gap-3 mx-auto transition-all duration-200 shadow-xl shadow-green-500/25"
              style={{ background: '#16a34a' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#15803d')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#16a34a')}
            >
              Start Your Mission Today
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-6 text-sm" style={{ color: '#9ca3af' }}>
              Free to start. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-gray-200" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}
              >
                <Target className="w-4 h-4" style={{ color: '#16a34a' }} />
              </div>
              <span className="font-bold text-sm tracking-widest" style={{ color: '#111827', letterSpacing: '0.15em' }}>
                LOCKD IN
              </span>
            </div>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              © {new Date().getFullYear()} Lockd In. Build the man. Track the mission.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}