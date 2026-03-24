import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface YearlyGoal {
  id: string
  user_id: string
  title: string
  category: string | null
  target_date: string | null
  is_completed: boolean
  completed_at: string | null
  sort_order: number
  created_at: string
}

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<YearlyGoal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('yearly_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('is_completed', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setGoals((data as YearlyGoal[]) || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  async function addGoal(title: string, category?: string) {
    if (!user) return
    const { data, error } = await supabase
      .from('yearly_goals')
      .insert({
        user_id: user.id,
        title: title.trim(),
        category: category?.trim() || null,
        is_completed: false,
        sort_order: goals.length,
      })
      .select()
      .single()
    if (!error && data) setGoals(prev => [...prev, data as YearlyGoal])
  }

  async function toggleGoal(id: string) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const next = !goal.is_completed
    const { error } = await supabase
      .from('yearly_goals')
      .update({ is_completed: next, completed_at: next ? new Date().toISOString() : null })
      .eq('id', id)
    if (!error) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, is_completed: next, completed_at: next ? new Date().toISOString() : null } : g))
    }
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('yearly_goals').delete().eq('id', id)
    if (!error) setGoals(prev => prev.filter(g => g.id !== id))
  }

  const completed = goals.filter(g => g.is_completed).length
  const total = goals.length

  return { goals, loading, addGoal, toggleGoal, deleteGoal, completed, total }
}
