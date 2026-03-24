import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

function getPastDates(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

export interface DayRecord {
  date: string
  log: DailyLog | null
}

export function useHabitHistory(days = 28) {
  const { user } = useAuth()
  const [records, setRecords] = useState<DayRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const dates = getPastDates(days)
    const from = dates[0]
    const to = dates[dates.length - 1]

    if (!isSupabaseConfigured) {
      // Demo: random data for the past dates
      setRecords(dates.map(date => ({
        date,
        log: {
          id: date,
          user_id: 'demo',
          log_date: date,
          bible_read: Math.random() > 0.35,
          prayed: Math.random() > 0.25,
          prayer_notes: null,
          church_attended: null,
          water_glasses: 6,
          meal_rating: null,
          supplements_taken: false,
          sleep_hours: 7,
          worked_out: Math.random() > 0.4,
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
        },
      })))
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', from)
      .lte('log_date', to)
      .order('log_date', { ascending: true })

    const logMap = new Map((data || []).map(l => [l.log_date, l]))
    setRecords(dates.map(date => ({ date, log: logMap.get(date) ?? null })))
    setLoading(false)
  }, [user, days])

  useEffect(() => { fetch() }, [fetch])

  return { records, loading, refetch: fetch }
}

/** Returns the current streak for a given boolean field */
export function calcStreak(records: DayRecord[], field: keyof Pick<DailyLog, 'bible_read' | 'prayed' | 'worked_out'>): number {
  // Walk backwards from today (last record)
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].log?.[field]) {
      streak++
    } else {
      break
    }
  }
  return streak
}
