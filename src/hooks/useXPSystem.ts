import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getLevelInfo } from './useProfile'
import type { Database } from '../types/database'

// XP source types for tracking
export type XPSource = 
  | 'habit'           // Daily habit completion
  | 'mission'         // Mission completion
  | 'mission_bonus'   // Mission completion bonus
  | 'goal_subgoal'    // Sub-goal completion
  | 'goal_complete'   // Full goal completion
  | 'streak_bonus'    // Streak milestone bonus
  | 'perfect_day'     // All daily habits completed
  | 'weekly_review'   // Weekly reflection completed
  | 'manual'          // Manual XP adjustment

export type XPTransaction = Database['public']['Tables']['xp_transactions']['Row']

// XP values configuration
export const XP_VALUES = {
  habit_daily: 10,
  habit_weekly: 15,
  habit_monthly: 25,
  mission_standard: 10,
  mission_high: 25,
  mission_critical: 50,
  mission_complete_bonus: 200,
  goal_subgoal: 50,
  goal_complete: 250,
  perfect_day: 50,
  weekly_review: 75,
}

// Streak bonus multipliers
export const STREAK_BONUSES = {
  3: 0.10,   // 10% bonus at 3 days
  7: 0.25,   // 25% bonus at 7 days
  30: 0.50,  // 50% bonus at 30 days
  100: 1.00, // 100% bonus at 100 days
}

export function getStreakMultiplier(streak: number): number {
  let multiplier = 1.0
  for (const [threshold, bonus] of Object.entries(STREAK_BONUSES)) {
    if (streak >= parseInt(threshold)) {
      multiplier = 1.0 + bonus
    }
  }
  return multiplier
}

export function useXPSystem() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<XPTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [todayXP, setTodayXP] = useState(0)

  const fetchTransactions = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    try {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const typedData = (data as unknown as XPTransaction[]) || []
      setTransactions(typedData)
      
      // Calculate today's XP
      const todayTransactions = typedData.filter((t) => 
        t.created_at.startsWith(today)
      )
      setTodayXP(todayTransactions.reduce((sum: number, t) => sum + t.amount, 0))
    } catch (error) {
      console.error('Error fetching XP transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Award XP for an action
  const awardXP = useCallback(async (
    amount: number,
    source: XPSource,
    options?: { reference_id?: string; description?: string }
  ) => {
    if (!user) return null

    const transaction: Omit<XPTransaction, 'id' | 'created_at'> = {
      user_id: user.id,
      amount,
      source,
      reference_id: options?.reference_id ?? null,
      description: options?.description ?? null,
    }

    if (!isSupabaseConfigured) {
      // LocalStorage fallback
      const cached = JSON.parse(localStorage.getItem('lockedin_xp_transactions') || '[]')
      const newTransaction = {
        ...transaction,
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      const updated = [newTransaction, ...cached]
      localStorage.setItem('lockedin_xp_transactions', JSON.stringify(updated))
      
      // Update today XP
      const today = new Date().toISOString().split('T')[0]
      if (newTransaction.created_at.startsWith(today)) {
        setTodayXP(prev => prev + amount)
      }
      
      setTransactions(updated)
      return newTransaction
    }

      try {
        const { data, error } = await supabase
          .from('xp_transactions')
          .insert(transaction)
          .select()
          .single()

        if (error) throw error

        const newTransaction = data as unknown as XPTransaction
      setTransactions(prev => [newTransaction, ...prev])
      
      // Update today XP if applicable
      const today = new Date().toISOString().split('T')[0]
      if (newTransaction.created_at.startsWith(today)) {
        setTodayXP(prev => prev + amount)
      }

      // Update profile total_xp
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', user.id)
        .single()

      if (profile) {
        const newTotal = (profile.total_xp || 0) + amount
        await supabase
          .from('profiles')
          .update({ total_xp: newTotal })
          .eq('id', user.id)
      }

      return newTransaction
    } catch (error) {
      console.error('Error awarding XP:', error)
      return null
    }
  }, [user])

  // Check and award streak bonus
  const checkStreakBonus = useCallback(async (streak: number) => {
    const thresholds = Object.keys(STREAK_BONUSES).map(Number).sort((a, b) => a - b)
    
    for (const threshold of thresholds) {
      if (streak === threshold) {
        const bonusXP = Math.round(100 * STREAK_BONUSES[threshold as keyof typeof STREAK_BONUSES])
        await awardXP(bonusXP, 'streak_bonus', {
          description: `${streak} day streak milestone!`
        })
        return bonusXP
      }
    }
    return 0
  }, [awardXP])

  // Calculate XP for habit completion with streak bonus
  const getHabitXP = useCallback((frequency: string, streak: number): number => {
    let base = XP_VALUES.habit_daily
    if (frequency === 'weekly') base = XP_VALUES.habit_weekly
    if (frequency === 'monthly') base = XP_VALUES.habit_monthly
    
    const multiplier = getStreakMultiplier(streak)
    return Math.round(base * multiplier)
  }, [])

  // Get XP summary
  const getXPSummary = useCallback(() => {
    const totalXP = transactions.reduce((sum, t) => sum + t.amount, 0)
    const levelInfo = getLevelInfo(totalXP)
    
    const bySource = transactions.reduce((acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    return {
      totalXP,
      ...levelInfo,
      bySource,
      todayXP,
      recentTransactions: transactions.slice(0, 10),
    }
  }, [transactions, todayXP])

  return {
    transactions,
    loading,
    todayXP,
    awardXP,
    checkStreakBonus,
    getHabitXP,
    getXPSummary,
    refetch: fetchTransactions,
  }
}