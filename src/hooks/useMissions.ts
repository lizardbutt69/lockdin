import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export type Priority = 'critical' | 'high' | 'standard'

export interface Mission {
  id: string
  user_id: string
  title: string
  priority: Priority
  xp_value: number
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export const XP_BY_PRIORITY: Record<Priority, number> = {
  critical: 50,
  high: 25,
  standard: 10,
}

export const MISSION_COMPLETE_BONUS = 200

export function useMissions() {
  const { user } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchMissions = useCallback(async () => {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    // Show: all incomplete + completed today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('missions')
      .select('*')
      .eq('user_id', user.id)
      .or(`completed.eq.false,completed_at.gte.${today}T00:00:00`)
      .order('completed', { ascending: true })
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
    setMissions((data as unknown as Mission[]) || [])
    setLoading(false)
  }, [user, today])

  useEffect(() => { fetchMissions() }, [fetchMissions])

  async function addMission(title: string, priority: Priority, dueDate?: string | null) {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('missions')
      .insert({
        user_id: user.id,
        title: title.trim(),
        priority,
        xp_value: XP_BY_PRIORITY[priority],
        due_date: dueDate !== undefined ? dueDate : today,
        completed: false,
      })
      .select()
      .single()
    if (!error && data) setMissions(prev => [...prev, data as unknown as Mission])
  }

  async function toggleMission(id: string) {
    const mission = missions.find(m => m.id === id)
    if (!mission) return
    const next = !mission.completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('missions')
      .update({
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      })
      .eq('id', id)
    if (!error) {
      setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: next, completed_at: next ? new Date().toISOString() : null } : m))
    }
  }

  async function updateMission(id: string, updates: { title?: string; priority?: Priority; due_date?: string | null }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('missions').update({
      ...updates,
      ...(updates.priority ? { xp_value: XP_BY_PRIORITY[updates.priority] } : {}),
    }).eq('id', id)
    if (!error) setMissions(prev => prev.map(m => m.id === id ? { ...m, ...updates, ...(updates.priority ? { xp_value: XP_BY_PRIORITY[updates.priority!] } : {}) } : m))
  }

  async function deleteMission(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('missions').delete().eq('id', id)
    if (!error) setMissions(prev => prev.filter(m => m.id !== id))
  }

  const incomplete = missions.filter(m => !m.completed)
  const completed = missions.filter(m => m.completed)
  const overdue = incomplete.filter(m => m.due_date && m.due_date < today)
  const allClear = missions.length > 0 && incomplete.length === 0
  const totalXPAvailable = incomplete.reduce((sum, m) => sum + m.xp_value, 0)

  return {
    missions,
    loading,
    incomplete,
    completed,
    overdue,
    allClear,
    totalXPAvailable,
    addMission,
    toggleMission,
    updateMission,
    deleteMission,
    refetch: fetchMissions,
  }
}
