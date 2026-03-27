import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface SubGoal {
  id: string
  title: string
  is_completed: boolean
}

export interface YearlyGoal {
  id: string
  user_id: string
  title: string
  category: string | null
  target_date: string | null
  priority: string | null
  is_completed: boolean
  completed_at: string | null
  sort_order: number
  created_at: string
  notes: string | null
  sub_goals: SubGoal[]
}

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<YearlyGoal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('yearly_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('is_completed', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setGoals((data as unknown as YearlyGoal[]) || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  async function addGoal(title: string, category?: string, priority?: string, target_date?: string) {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('yearly_goals')
      .insert({
        user_id: user.id,
        title: title.trim(),
        category: category?.trim() || null,
        priority: priority || null,
        target_date: target_date || null,
        is_completed: false,
        sort_order: goals.length,
        notes: null,
        sub_goals: [],
      })
      .select()
      .single()
    if (!error && data) setGoals(prev => [...prev, data as unknown as YearlyGoal])
  }

  async function toggleGoal(id: string) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const next = !goal.is_completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('yearly_goals')
      .update({ is_completed: next, completed_at: next ? new Date().toISOString() : null })
      .eq('id', id)
    if (!error) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, is_completed: next, completed_at: next ? new Date().toISOString() : null } : g))
    }
  }

  async function deleteGoal(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('yearly_goals').delete().eq('id', id)
    if (!error) setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function updateGoalNotes(id: string, notes: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('yearly_goals').update({ notes }).eq('id', id)
    if (!error) setGoals(prev => prev.map(g => g.id === id ? { ...g, notes } : g))
  }

  async function updateSubGoals(id: string, sub_goals: SubGoal[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('yearly_goals').update({ sub_goals }).eq('id', id)
    if (!error) setGoals(prev => prev.map(g => g.id === id ? { ...g, sub_goals } : g))
  }

  async function updateGoalPriority(id: string, priority: string | null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('yearly_goals').update({ priority }).eq('id', id)
    if (!error) setGoals(prev => prev.map(g => g.id === id ? { ...g, priority } : g))
  }

  async function updateGoalDueDate(id: string, target_date: string | null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('yearly_goals').update({ target_date }).eq('id', id)
    if (!error) setGoals(prev => prev.map(g => g.id === id ? { ...g, target_date } : g))
  }

  const completed = goals.filter(g => g.is_completed).length
  const total = goals.length

  return { goals, loading, addGoal, toggleGoal, deleteGoal, updateGoalNotes, updateSubGoals, updateGoalPriority, updateGoalDueDate, completed, total }
}
