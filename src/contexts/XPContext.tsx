import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { getLevelInfo } from '../hooks/useProfile'
import type { XPNotificationData } from '../components/dashboard/XPNotification'
import type { XPSource } from '../hooks/useXPSystem'

export const XP_AWARDED_EVENT = 'lockedin_xp_awarded'
const PROFILE_CACHE_KEY = 'lockedin_profile_cache'
const XP_LOCAL_KEY = 'lockedin_xp_transactions'

interface XPContextType {
  todayXP: number
  notification: XPNotificationData | null
  awardXP: (amount: number, source: XPSource, options?: { reference_id?: string; description?: string }) => Promise<void>
  showNotification: (data: Omit<XPNotificationData, 'id'>) => void
  dismissNotification: () => void
}

const XPContext = createContext<XPContextType | undefined>(undefined)

export function XPProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [todayXP, setTodayXP] = useState(0)
  const [notification, setNotification] = useState<XPNotificationData | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Seed todayXP from DB on mount so it survives page refreshes
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .then(({ data }) => {
        if (data) setTodayXP(data.reduce((sum, t) => sum + t.amount, 0))
      })
  }, [user])

  const showNotification = useCallback((data: Omit<XPNotificationData, 'id'>) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setNotification({ ...data, id: `xp_${Date.now()}` })
  }, [])

  const dismissNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const awardXP = useCallback(async (
    amount: number,
    source: XPSource,
    options?: { reference_id?: string; description?: string }
  ) => {
    if (!user) return

    // Level-up check using cached profile total before this award
    const cached = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || 'null')
    const oldTotal: number = cached?.total_xp ?? 0
    const didLevelUp = getLevelInfo(oldTotal + amount).level > getLevelInfo(oldTotal).level
    const newLevel = getLevelInfo(oldTotal + amount).level

    // Optimistic local counter
    setTodayXP(prev => prev + amount)

    if (!isSupabaseConfigured) {
      // Demo mode — localStorage only
      const local = JSON.parse(localStorage.getItem(XP_LOCAL_KEY) || '[]')
      local.unshift({
        id: `local_${Date.now()}`,
        user_id: user.id,
        amount,
        source,
        reference_id: options?.reference_id ?? null,
        description: options?.description ?? null,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem(XP_LOCAL_KEY, JSON.stringify(local))
    } else {
      try {
        await supabase.from('xp_transactions').insert({
          user_id: user.id,
          amount,
          source,
          reference_id: options?.reference_id ?? null,
          description: options?.description ?? null,
        })
        // Atomic increment — no race condition
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('increment_profile_xp', { p_user_id: user.id, p_amount: amount })
      } catch (err) {
        console.error('XP award failed:', err)
      }
    }

    // Tell useProfile to update total_xp in state without a re-fetch
    window.dispatchEvent(new CustomEvent(XP_AWARDED_EVENT, { detail: { amount } }))

    // Show notification
    if (didLevelUp) {
      showNotification({ amount, source, description: `Level ${newLevel} reached!`, levelUp: true })
    } else {
      showNotification({ amount, source, description: options?.description })
    }
  }, [user, showNotification])

  return (
    <XPContext.Provider value={{ todayXP, notification, awardXP, showNotification, dismissNotification }}>
      {children}
    </XPContext.Provider>
  )
}

export function useXPNotification() {
  const ctx = useContext(XPContext)
  if (!ctx) throw new Error('useXPNotification must be used within XPProvider')
  return ctx
}

// Alias used by components that need awardXP
export const useXP = useXPNotification
