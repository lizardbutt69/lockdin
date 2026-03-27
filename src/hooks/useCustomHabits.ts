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
  Career: [
    { id: 'career_1', pillar: 'Career', name: 'Learned something new', frequency: 'daily', isDefault: true },
    { id: 'career_2', pillar: 'Career', name: 'Worked on a side project', frequency: 'daily', isDefault: true },
    { id: 'career_3', pillar: 'Career', name: 'Read industry news', frequency: 'daily', isDefault: true },
    { id: 'career_4', pillar: 'Career', name: 'Logged a win', frequency: 'weekly', isDefault: true },
    { id: 'career_5', pillar: 'Career', name: 'Applied to a job / networked', frequency: 'weekly', isDefault: true },
    { id: 'career_6', pillar: 'Career', name: 'Completed a course lesson', frequency: 'daily', isDefault: true },
    { id: 'career_7', pillar: 'Career', name: 'Connected with someone', frequency: 'weekly', isDefault: true },
    { id: 'career_8', pillar: 'Career', name: 'Updated resume or LinkedIn', frequency: 'monthly', isDefault: true },
  ],
  Travel: [
    { id: 'trip_1', pillar: 'Travel', name: 'Researched a destination', frequency: 'weekly', isDefault: true },
    { id: 'trip_2', pillar: 'Travel', name: 'Saved toward trip fund', frequency: 'weekly', isDefault: true },
    { id: 'trip_3', pillar: 'Travel', name: 'Booked/planned a trip element', frequency: 'monthly', isDefault: true },
    { id: 'trip_4', pillar: 'Travel', name: 'Reviewed trip checklist', frequency: 'weekly', isDefault: true },
  ],
}

const CUSTOM_KEY   = 'lockedin_hc_custom'
const HIDDEN_KEY   = 'lockedin_hc_hidden'    // set of default habit IDs to hide
const OVERRIDE_KEY = 'lockedin_hc_overrides' // map of id → { name, frequency }

function getHidden(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]')) }
  catch { return new Set() }
}
function saveHidden(s: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...s]))
}

function getOverrides(): Record<string, { name: string; frequency: 'daily' | 'weekly' | 'monthly' }> {
  try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}') }
  catch { return {} }
}
function saveOverrides(o: Record<string, { name: string; frequency: 'daily' | 'weekly' | 'monthly' }>) {
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o))
}

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


function isCompletedForDate(habit: HabitDef, date: string): boolean {
  // All habits reset daily — frequency is informational only
  return !!getCompletions(date)[habit.id]
}

export default function useCustomHabits(pillar: string) {
  const [, forceUpdate] = useState(0)

  const refresh = useCallback(() => forceUpdate(n => n + 1), [])

  const hidden = getHidden()
  const overrides = getOverrides()
  const allCustom = getCustomHabits()
  const pillarCustom = allCustom.filter(h => h.pillar === pillar)
  const defaultHabits = (DEFAULT_HABITS[pillar] || [])
    .filter(h => !hidden.has(h.id))
    .map(h => overrides[h.id] ? { ...h, ...overrides[h.id] } : h)
  const habits: HabitDef[] = [...defaultHabits, ...pillarCustom]

  const today = todayStr()

  const isToday = useCallback((id: string): boolean => {
    const allHabits = [...(DEFAULT_HABITS[pillar] || []), ...getCustomHabits().filter(h => h.pillar === pillar)]
    const habit = allHabits.find(h => h.id === id)
    if (!habit) return false
    return isCompletedForDate(habit, today)
  }, [today, pillar, forceUpdate]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback((id: string): void => {
    // All habits toggle today's entry only — resets every new day
    const completions = getCompletions(today)
    if (completions[id]) delete completions[id]
    else completions[id] = true
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
    const custom = getCustomHabits()
    const isCustom = custom.some(h => h.id === id)
    if (isCustom) {
      saveCustomHabits(custom.filter(h => h.id !== id))
    } else {
      // Default habit — add to hidden set
      const h = getHidden()
      h.add(id)
      saveHidden(h)
    }
    refresh()
  }, [refresh])

  const editHabit = useCallback((id: string, name: string, frequency: 'daily' | 'weekly' | 'monthly'): void => {
    const custom = getCustomHabits()
    const isCustom = custom.some(h => h.id === id)
    if (isCustom) {
      saveCustomHabits(custom.map(h => h.id === id ? { ...h, name, frequency } : h))
    } else {
      // Default habit — store override
      const o = getOverrides()
      o[id] = { name, frequency }
      saveOverrides(o)
    }
    refresh()
  }, [refresh])

  return { habits, isToday, toggle, addHabit, removeHabit, editHabit, getHistory }
}
