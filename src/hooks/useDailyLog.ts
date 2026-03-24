import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']
type DailyLogUpdate = Database['public']['Tables']['daily_logs']['Update']

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

const DEMO_LOG: DailyLog = {
  id: 'demo-log',
  user_id: 'demo-user',
  log_date: todayISO(),
  bible_read: false,
  prayed: false,
  prayer_notes: null,
  church_attended: null,
  water_glasses: 3,
  meal_rating: null,
  supplements_taken: false,
  sleep_hours: 7.5,
  worked_out: false,
  workout_type: null,
  workout_duration: null,
  workout_rpe: null,
  weight: null,
  quality_time: false,
  date_night: false,
  tracked_spending: false,
  mood: null,
  xp_earned: 0,
  created_at: new Date().toISOString(),
}

export function useDailyLog() {
  const { user } = useAuth()
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLog = useCallback(async () => {
    if (!user) return
    setLoading(true)

    if (!isSupabaseConfigured) {
      setLog(DEMO_LOG)
      setLoading(false)
      return
    }

    const today = todayISO()
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()

    if (data) {
      setLog(data)
    } else {
      const { data: newLog } = await supabase
        .from('daily_logs')
        .insert({ user_id: user.id, log_date: today })
        .select()
        .single()
      setLog(newLog)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchLog() }, [fetchLog])

  const updateLog = useCallback(async (updates: DailyLogUpdate) => {
    if (!user || !log) return

    if (!isSupabaseConfigured) {
      setLog(prev => prev ? { ...prev, ...updates } : prev)
      return
    }

    const { data } = await supabase
      .from('daily_logs')
      .update(updates)
      .eq('id', log.id)
      .select()
      .single()
    if (data) setLog(data)
  }, [user, log])

  return { log, loading, updateLog, refetch: fetchLog }
}
