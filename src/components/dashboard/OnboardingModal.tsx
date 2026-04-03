import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Heart, Dumbbell, DollarSign, BookOpen, Plane, Sparkles, Briefcase } from 'lucide-react'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface OnboardingModalProps {
  profile: Profile | null
  onComplete: (isReligious: boolean) => Promise<void>
}

const PILLARS = [
  { key: 'god', label: 'God', icon: BookOpen, color: '#7c3aed', bg: '#faf5ff', description: 'Bible reading, prayer, and spiritual growth' },
  { key: 'finances', label: 'Finances', icon: DollarSign, color: '#16a34a', bg: '#f0fdf4', description: 'Budget tracking, debt payoff, and wealth building' },
  { key: 'career', label: 'Career', icon: Briefcase, color: '#2563eb', bg: '#eff6ff', description: 'Professional development and advancement' },
  { key: 'relationships', label: 'Relationships', icon: Heart, color: '#dc2626', bg: '#fef2f2', description: 'Family, friends, and meaningful connections' },
  { key: 'fitness', label: 'Health & Fitness', icon: Dumbbell, color: '#ea580c', bg: '#fff7ed', description: 'Workouts, nutrition, and physical wellness' },
  { key: 'trips', label: 'Trips', icon: Plane, color: '#0d9488', bg: '#f0fdfa', description: 'Travel planning and adventures' },
  { key: 'gratitude', label: 'Gratitude', icon: Sparkles, color: '#f59e0b', bg: '#fffbeb', description: 'Daily gratitude and reflection' },
]

export default function OnboardingModal({ profile, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [isReligious, setIsReligious] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  const totalSteps = 3

  const handleComplete = async () => {
    setIsCompleting(true)
    await onComplete(isReligious)
    setIsCompleting(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* Header */}
          <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
                  {step === 0 && "Welcome to Lockd In!"}
                  {step === 1 && "Personalize Your Experience"}
                  {step === 2 && "You're All Set!"}
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  {step === 0 && "Let's set up your command center"}
                  {step === 1 && "Choose what matters to you"}
                  {step === 2 && "Ready to level up your life"}
                </p>
              </div>
              <div className="text-white/60 text-sm font-medium">
                {step + 1} / {totalSteps}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: '33%' }}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}>
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Your Life, Optimized
                  </h3>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Lockd In helps you track and improve every area of your life through our comprehensive pillar system.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Track Daily Habits', desc: 'Build consistency' },
                    { label: 'Earn XP & Level Up', desc: 'Gamified progress' },
                    { label: 'Set & Crush Goals', desc: 'Achieve more' },
                    { label: 'Journal & Reflect', desc: 'Grow mentally' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
                    Include religious/spiritual content?
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsReligious(true)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${isReligious ? 'border-[#7c3aed]' : 'border-transparent'}`}
                      style={{
                        background: isReligious ? '#faf5ff' : 'var(--bg-input)',
                        color: isReligious ? '#7c3aed' : 'var(--text-secondary)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Yes, include God pillar
                      </div>
                    </button>
                    <button
                      onClick={() => setIsReligious(false)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${!isReligious ? 'border-[#7c3aed]' : 'border-transparent'}`}
                      style={{
                        background: !isReligious ? '#faf5ff' : 'var(--bg-input)',
                        color: !isReligious ? '#7c3aed' : 'var(--text-secondary)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        No, skip religious content
                      </div>
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {isReligious
                      ? 'You\'ll see the God pillar, Bible verses, and faith-based content.'
                      : 'Religious content will be hidden. You can change this anytime in settings.'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
                    Your Pillars
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {PILLARS.map((pillar) => {
                      const isHidden = !isReligious && pillar.key === 'god'
                      if (isHidden) return null
                      const Icon = pillar.icon
                      return (
                        <div
                          key={pillar.key}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: pillar.bg, border: `1px solid ${pillar.color}20` }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: pillar.color, border: `1px solid ${pillar.color}40` }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: pillar.color }}>{pillar.label}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{pillar.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)' }}>
                    <span className="text-3xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Welcome, {profile?.display_name?.split(' ')[0] || 'Operator'}!
                  </h3>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Your command center is ready. Start tracking your progress and watch yourself level up!
                  </p>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Quick Tips:</div>
                  <ul className="text-xs space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Use the sidebar to navigate between pillars</li>
                    <li>• Track your daily habits to earn XP</li>
                    <li>• Check your progress in the Overview</li>
                    <li>• Visit Settings to customize your experience</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ background: '#2563eb' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: isCompleting ? '#9ca3af' : '#16a34a' }}
                onMouseEnter={e => { if (!isCompleting) e.currentTarget.style.background = '#15803d' }}
                onMouseLeave={e => { if (!isCompleting) e.currentTarget.style.background = '#16a34a' }}
              >
                {isCompleting ? 'Setting up...' : "Let's Go!"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}