import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / 1000) + 1
  const xpForCurrentLevel = xp % 1000
  const xpNeeded = 1000 - xpForCurrentLevel
  const progress = xpForCurrentLevel / 1000
  return { level, xpForCurrentLevel, xpNeeded, progress }
}

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  display_name: 'DANNY',
  rank: null,
  level: 1,
  total_xp: 0,
  current_streak: 0,
  longest_streak: 0,
  is_religious: true,
  onboarding_completed: false,
  created_at: new Date().toISOString(),
}

const PROFILE_CACHE_KEY = 'lockedin_profile_cache'

function readProfileCache(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function useProfile() {
  const { user } = useAuth()
  const cached = readProfileCache()
  const [profile, setProfile] = useState<Profile | null>(cached)
  const [loading, setLoading] = useState(!cached)

  const fetchProfile = useCallback(async () => {
    if (!user) return

    if (!isSupabaseConfigured) {
      setProfile(DEMO_PROFILE)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (data) {
      setProfile(data)
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data))
    } else {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ id: user.id, display_name: user.email?.split('@')[0]?.toUpperCase() || 'OPERATOR' })
        .select()
        .single()
      if (newProfile) {
        setProfile(newProfile)
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newProfile))
      }
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  // Keep profile.total_xp in sync when XP is awarded elsewhere
  useEffect(() => {
    const handler = (e: Event) => {
      const amount = (e as CustomEvent<{ amount: number }>).detail.amount
      setProfile(prev => {
        if (!prev) return prev
        const updated = { ...prev, total_xp: prev.total_xp + amount }
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updated))
        return updated
      })
    }
    window.addEventListener('lockedin_xp_awarded', handler)
    return () => window.removeEventListener('lockedin_xp_awarded', handler)
  }, [])

  async function updateProfile(updates: { display_name?: string; is_religious?: boolean; onboarding_completed?: boolean }) {
    if (!profile) return

    // Optimistic update — UI responds immediately
    const optimistic = { ...profile, ...updates }
    setProfile(optimistic)
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(optimistic))

    if (!user || !isSupabaseConfigured) return

    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      setProfile(data)
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data))
    }
  }

  return { profile, loading, refetch: fetchProfile, updateProfile }
}
