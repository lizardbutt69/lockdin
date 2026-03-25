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
import RelationshipsPillar from '../components/pillars/RelationshipsPillar'
import DietPillar from '../components/pillars/DietPillar'
import FitnessPillar from '../components/pillars/FitnessPillar'
import TripsPillar from '../components/pillars/TripsPillar'
import GratitudePage from '../components/gratitude/GratitudePage'
import GratitudeQuickAdd from '../components/gratitude/GratitudeQuickAdd'
import JournalCard from '../components/journal/JournalCard'
import { useDailyLog } from '../hooks/useDailyLog'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

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
  const [weeklyDateNights, setWeeklyDateNights] = useState(0)
  const [activePillar, setActivePillar] = useState<PillarKey>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          setWeeklyDateNights(data.filter(d => d.date_night).length)
        }
      })
  }, [user, log])

  const isLoading = logLoading || profileLoading
  const handleUpdate = (updates: Partial<DailyLog>) => updateLog(updates)

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center space-y-2">
          <div className="font-['Space_Grotesk'] text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            LOCKD IN
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading your dashboard...
          </div>
        </div>
      </div>
    )
  }

  const pillarMap: Record<Exclude<PillarKey, 'overview'>, React.ReactElement> = {
    god:           <GodPillar log={log} onUpdate={handleUpdate} />,
    finances:      <FinancesPillar log={log} onUpdate={handleUpdate} />,
    relationships: <RelationshipsPillar log={log} onUpdate={handleUpdate} weeklyDateNights={weeklyDateNights} />,
    diet:          <DietPillar log={log} onUpdate={handleUpdate} />,
    fitness:       <FitnessPillar log={log} onUpdate={handleUpdate} weeklyWorkouts={weeklyWorkouts} />,
    trips:         <TripsPillar />,
    gratitude:     <GratitudePage />,
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <TopBar profile={profile} activePillar={activePillar} onMenuToggle={() => setSidebarOpen(o => !o)} />

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
          onSelect={setActivePillar}
          profile={profile}
          todayXP={log?.xp_earned || 0}
          onUpdateProfile={name => updateProfile({ display_name: name })}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

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
                    <JournalCard />
                    <BibleVerseCard />
                    <QuoteCard />
                    <GoalsCard />
                  </div>

                  {/* ── Right column (1/3) ── */}
                  <div className="lg:col-span-1 space-y-4">
                    <MissionsCard />
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
