import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/dashboard/TopBar'
import Sidebar, { type PillarKey } from '../components/dashboard/Sidebar'
import MissionsCard from '../components/dashboard/MissionsCard'
import NotesCard from '../components/dashboard/NotesCard'
import YearProgressCard from '../components/dashboard/YearProgressCard'
import BibleVerseCard from '../components/dashboard/BibleVerseCard'
import QuoteCard from '../components/dashboard/QuoteCard'
import GoalsCard from '../components/dashboard/GoalsCard'
import GodPillar from '../components/pillars/GodPillar'
import FinancesPillar from '../components/pillars/FinancesPillar'
import BondsPillar from '../components/bonds/BondsPillar'
import FitnessPillar from '../components/pillars/FitnessPillar'
import TripsPillar from '../components/pillars/TripsPillar'
import GratitudePage from '../components/gratitude/GratitudePage'
import GoalsPage from '../components/goals/GoalsPage'
import CareerPillar from '../components/pillars/CareerPillar'
import GratitudeQuickAdd from '../components/gratitude/GratitudeQuickAdd'
import JournalCard from '../components/journal/JournalCard'
import OnboardingModal from '../components/dashboard/OnboardingModal'
import { useDailyLog } from '../hooks/useDailyLog'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

const ONBOARDING_KEY = 'lockedin_onboarding_completed'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

function startOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}


export default function DashboardPage() {
  const { user } = useAuth()
  const { log, loading: logLoading, updateLog } = useDailyLog()
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0)
  const [activePillar, setActivePillar] = useState<PillarKey>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTopBarSettings, setShowTopBarSettings] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check both profile and localStorage for onboarding status
    // This runs only once on mount
    if (profile?.onboarding_completed) return false
    const fromStorage = localStorage.getItem(ONBOARDING_KEY) === 'true'
    return !fromStorage
  })

  // Update showOnboarding when profile loads
  useEffect(() => {
    if (profile) {
      const fromProfile = profile.onboarding_completed
      const fromStorage = localStorage.getItem(ONBOARDING_KEY) === 'true'
      if (fromProfile || fromStorage) {
        setShowOnboarding(false)
      }
    }
  }, [profile])

  // Redirect god pillar to overview if user is not religious
  const handlePillarSelect = (pillar: PillarKey) => {
    if (pillar === 'god' && profile?.is_religious === false) {
      setActivePillar('overview')
      return
    }
    setActivePillar(pillar)
  }

  useEffect(() => {
    if (!user) return
    const weekStart = startOfWeek()
    supabase
      .from('daily_logs')
      .select('worked_out, date_night')
      .eq('user_id', user.id)
      .gte('log_date', weekStart)
      .then(({ data }) => {
        if (data) {
          setWeeklyWorkouts(data.filter(d => d.worked_out).length)
        }
      })
  }, [user, log])

  const isLoading = logLoading || profileLoading
  const handleUpdate = (updates: Partial<DailyLog>) => updateLog(updates)

  const handleToggleReligious = async (isReligious: boolean) => {
    await updateProfile({ is_religious: isReligious })
    // If user disables religious content and is currently on god pillar, redirect to overview
    if (!isReligious && activePillar === 'god') {
      setActivePillar('overview')
    }
  }

  const handleCompleteOnboarding = async () => {
    await updateProfile({ onboarding_completed: true })
    localStorage.setItem(ONBOARDING_KEY, 'true')
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center space-y-2">
          <div className="font-['Plus_Jakarta_Sans'] text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            LOCKD IN
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading your dashboard...
          </div>
        </div>
      </div>
    )
  }

  const isReligious = profile?.is_religious ?? true

  const pillarMap: Record<Exclude<PillarKey, 'overview'>, React.ReactElement> = {
    god:           isReligious ? <GodPillar log={log} onUpdate={handleUpdate} /> : <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Religious content is disabled. Enable it in Settings.</div>,
    finances:      <FinancesPillar log={log} onUpdate={handleUpdate} />,
    relationships: <BondsPillar />,
    fitness:       <FitnessPillar log={log} onUpdate={handleUpdate} weeklyWorkouts={weeklyWorkouts} />,
    trips:         <TripsPillar />,
    gratitude:     <GratitudePage />,
    career:        <CareerPillar />,
    goals:         <GoalsPage />,
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <TopBar profile={profile} activePillar={activePillar} onMenuToggle={() => setSidebarOpen(o => !o)} onOpenSettings={() => setShowTopBarSettings(true)} />

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          activePillar={activePillar}
          onSelect={handlePillarSelect}
          profile={profile}
          todayXP={log?.xp_earned || 0}
          onUpdateProfile={name => updateProfile({ display_name: name })}
          onToggleReligious={handleToggleReligious}

          showTopBarSettings={showTopBarSettings}
          isOpen={sidebarOpen}
          onClose={() => { setSidebarOpen(false); setShowTopBarSettings(false) }}
        />

        {/* Onboarding Modal - Centered on screen */}
        <AnimatePresence>
          {showOnboarding && profile && (
            <OnboardingModal
              profile={profile}
              onComplete={async (isReligious) => {
                await handleToggleReligious(isReligious)
                await handleCompleteOnboarding()
                localStorage.setItem(ONBOARDING_KEY, 'true')
                setShowOnboarding(false)
              }}
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div style={{ maxWidth: 1280 }} className="mx-auto">

          <AnimatePresence mode="wait">
            {activePillar === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-5">
                <YearProgressCard name={profile?.display_name?.split(' ')[0]} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* ── Left column (2/3) ── */}
                  <div className="lg:col-span-2 space-y-4">
                    <MissionsCard />
                    <JournalCard />
                    <GoalsCard />
                  </div>

                  {/* ── Right column (1/3) ── */}
                  <div className="lg:col-span-1 space-y-4">
                    {isReligious && <BibleVerseCard />}
                    <QuoteCard />
                    <NotesCard />
                    <GratitudeQuickAdd />
                  </div>
                </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activePillar}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {pillarMap[activePillar as Exclude<PillarKey, 'overview'>]}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
