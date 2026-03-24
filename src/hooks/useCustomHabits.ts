import { useState, useCallback } from 'react'

export interface HabitDef {
  id: string
  pillar: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  isDefault: boolean
}

export interface DayRecord {
  date: string
  completed: boolean
}

export const DEFAULT_HABITS: Record<string, HabitDef[]> = {
  God: [
    { id: 'god_1', pillar: 'God', name: 'Read the Bible', frequency: 'daily', isDefault: true },
    { id: 'god_2', pillar: 'God', name: 'Prayed today', frequency: 'daily', isDefault: true },
    { id: 'god_3', pillar: 'God', name: 'Attended church', frequency: 'weekly', isDefault: true },
    { id: 'god_4', pillar: 'God', name: 'Read devotional', frequency: 'daily', isDefault: true },
    { id: 'god_5', pillar: 'God', name: 'Memorized scripture', frequency: 'weekly', isDefault: true },
    { id: 'god_6', pillar: 'God', name: 'Fasted', frequency: 'weekly', isDefault: true },
  ],
  Finances: [
    { id: 'fin_1', pillar: 'Finances', name: 'Tracked spending', frequency: 'daily', isDefault: true },
    { id: 'fin_2', pillar: 'Finances', name: 'No impulse purchases', frequency: 'daily', isDefault: true },
    { id: 'fin_3', pillar: 'Finances', name: 'Reviewed budget', frequency: 'weekly', isDefault: true },
    { id: 'fin_4', pillar: 'Finances', name: 'Contributed to savings', frequency: 'weekly', isDefault: true },
    { id: 'fin_5', pillar: 'Finances', name: 'Contributed to investments', frequency: 'weekly', isDefault: true },
    { id: 'fin_6', pillar: 'Finances', name: 'Reviewed net worth', frequency: 'monthly', isDefault: true },
    { id: 'fin_7', pillar: 'Finances', name: 'Worked on side income', frequency: 'weekly', isDefault: true },
    { id: 'fin_8', pillar: 'Finances', name: 'Learned about money/investing', frequency: 'weekly', isDefault: true },
  ],
  Relationships: [
    { id: 'rel_1', pillar: 'Relationships', name: 'Quality time with wife', frequency: 'daily', isDefault: true },
    { id: 'rel_2', pillar: 'Relationships', name: 'Words of affirmation', frequency: 'daily', isDefault: true },
    { id: 'rel_3', pillar: 'Relationships', name: 'Act of service', frequency: 'daily', isDefault: true },
    { id: 'rel_4', pillar: 'Relationships', name: 'Date night', frequency: 'weekly', isDefault: true },
    { id: 'rel_5', pillar: 'Relationships', name: 'Called/texted family', frequency: 'weekly', isDefault: true },
    { id: 'rel_6', pillar: 'Relationships', name: 'Caught up with a friend', frequency: 'weekly', isDefault: true },
    { id: 'rel_7', pillar: 'Relationships', name: 'Planned something thoughtful', frequency: 'weekly', isDefault: true },
    { id: 'rel_8', pillar: 'Relationships', name: 'Phone down during quality time', frequency: 'daily', isDefault: true },
  ],
  Health: [
    { id: 'health_1', pillar: 'Health', name: 'Drank 8+ glasses of water', frequency: 'daily', isDefault: true },
    { id: 'health_2', pillar: 'Health', name: 'Hit protein target', frequency: 'daily', isDefault: true },
    { id: 'health_3', pillar: 'Health', name: 'Took supplements/vitamins', frequency: 'daily', isDefault: true },
    { id: 'health_4', pillar: 'Health', name: 'No junk food / ate clean', frequency: 'daily', isDefault: true },
    { id: 'health_5', pillar: 'Health', name: 'Meal prepped', frequency: 'weekly', isDefault: true },
    { id: 'health_6', pillar: 'Health', name: 'Slept 7+ hours', frequency: 'daily', isDefault: true },
    { id: 'health_7', pillar: 'Health', name: 'No alcohol', frequency: 'daily', isDefault: true },
    { id: 'health_8', pillar: 'Health', name: 'Cooked at home', frequency: 'daily', isDefault: true },
  ],
  Fitness: [
    { id: 'fit_1', pillar: 'Fitness', name: 'Completed workout', frequency: 'daily', isDefault: true },
    { id: 'fit_2', pillar: 'Fitness', name: 'Stretched / mobility work', frequency: 'daily', isDefault: true },
    { id: 'fit_3', pillar: 'Fitness', name: 'Hit 10K steps', frequency: 'daily', isDefault: true },
    { id: 'fit_4', pillar: 'Fitness', name: 'Cold shower / cold exposure', frequency: 'daily', isDefault: true },
    { id: 'fit_5', pillar: 'Fitness', name: 'Active recovery day', frequency: 'weekly', isDefault: true },
    { id: 'fit_6', pillar: 'Fitness', name: 'Tracked workout in log', frequency: 'daily', isDefault: true },
    { id: 'fit_7', pillar: 'Fitness', name: 'Hit a PR or progression', frequency: 'weekly', isDefault: true },
    { id: 'fit_8', pillar: 'Fitness', name: 'HYROX training session', frequency: 'weekly', isDefault: true },
  ],
  Travel: [
    { id: 'trip_1', pillar: 'Travel', name: 'Researched a destination', frequency: 'weekly', isDefault: true },
    { id: 'trip_2', pillar: 'Travel', name: 'Saved toward trip fund', frequency: 'weekly', isDefault: true },
    { id: 'trip_3', pillar: 'Travel', name: 'Booked/planned a trip element', frequency: 'monthly', isDefault: true },
    { id: 'trip_4', pillar: 'Travel', name: 'Reviewed trip checklist', frequency: 'weekly', isDefault: true },
  ],
}

const CUSTOM_KEY = 'lockedin_hc_custom'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateKey(date: string): string {
  return `lockedin_hc_${date}`
}

function getCompletions(date: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(dateKey(date))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setCompletions(date: string, data: Record<string, boolean>): void {
  localStorage.setItem(dateKey(date), JSON.stringify(data))
}

function getCustomHabits(): HabitDef[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomHabits(habits: HabitDef[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(habits))
}

/** Returns Monday of the ISO week containing `dateStr` (YYYY-MM-DD) */
function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay() // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

/** Returns all dates (Mon–Sun) for the ISO week containing `dateStr` */
function getWeekDates(dateStr: string): string[] {
  const monday = getMondayOfWeek(dateStr)
  const m = new Date(monday + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(m)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

/** For a weekly habit, check if it was completed anywhere in the same Mon-Sun week as `date` */
function isWeeklyCompletedForDate(habitId: string, date: string): boolean {
  const weekDates = getWeekDates(date)
  return weekDates.some(d => {
    const completions = getCompletions(d)
    return !!completions[habitId]
  })
}

/** For a monthly habit, check if it was completed anywhere in the same calendar month */
function isMonthlyCompletedForDate(habitId: string, date: string): boolean {
  const [year, month] = date.split('-')
  // Scan all localStorage keys for this month
  const prefix = `lockedin_hc_${year}-${month}`
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      try {
        const data: Record<string, boolean> = JSON.parse(localStorage.getItem(key) || '{}')
        if (data[habitId]) return true
      } catch {
        // ignore
      }
    }
  }
  return false
}

function isCompletedForDate(habit: HabitDef, date: string): boolean {
  if (habit.frequency === 'daily') {
    return !!getCompletions(date)[habit.id]
  } else if (habit.frequency === 'weekly') {
    return isWeeklyCompletedForDate(habit.id, date)
  } else {
    return isMonthlyCompletedForDate(habit.id, date)
  }
}

export default function useCustomHabits(pillar: string) {
  const [, forceUpdate] = useState(0)

  const refresh = useCallback(() => forceUpdate(n => n + 1), [])

  const allCustom = getCustomHabits()
  const pillarCustom = allCustom.filter(h => h.pillar === pillar)
  const defaultHabits = DEFAULT_HABITS[pillar] || []
  const habits: HabitDef[] = [...defaultHabits, ...pillarCustom]

  const today = todayStr()

  const isToday = useCallback((id: string): boolean => {
    const allHabits = [...(DEFAULT_HABITS[pillar] || []), ...getCustomHabits().filter(h => h.pillar === pillar)]
    const habit = allHabits.find(h => h.id === id)
    if (!habit) return false
    return isCompletedForDate(habit, today)
  }, [today, pillar, forceUpdate]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback((id: string): void => {
    const completions = getCompletions(today)
    if (completions[id]) {
      delete completions[id]
    } else {
      completions[id] = true
    }
    setCompletions(today, completions)
    refresh()
  }, [today, refresh])

  const getHistory = useCallback((id: string): DayRecord[] => {
    const records: DayRecord[] = []
    for (let i = 27; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      records.push({
        date: dateStr,
        completed: !!getCompletions(dateStr)[id],
      })
    }
    return records
  }, [pillar, forceUpdate]) // eslint-disable-line react-hooks/exhaustive-deps

  const addHabit = useCallback((name: string, frequency: 'daily' | 'weekly' | 'monthly'): void => {
    const existing = getCustomHabits()
    const newHabit: HabitDef = {
      id: `custom_${pillar.toLowerCase()}_${Date.now()}`,
      pillar,
      name,
      frequency,
      isDefault: false,
    }
    saveCustomHabits([...existing, newHabit])
    refresh()
  }, [pillar, refresh])

  const removeHabit = useCallback((id: string): void => {
    const existing = getCustomHabits()
    const habit = existing.find(h => h.id === id)
    if (!habit || habit.isDefault) return
    saveCustomHabits(existing.filter(h => h.id !== id))
    refresh()
  }, [refresh])

  return { habits, isToday, toggle, addHabit, removeHabit, getHistory }
}
