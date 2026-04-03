import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export const RANKS = [
  { min: 0,       max: 999,    rank: 'RECRUIT',    badge: '🔰' },
  { min: 1000,    max: 4999,   rank: 'PRIVATE',    badge: '⚔️' },
  { min: 5000,    max: 14999,  rank: 'CORPORAL',   badge: '🎖️' },
  { min: 15000,   max: 29999,  rank: 'SERGEANT',   badge: '🏅' },
  { min: 30000,   max: 59999,  rank: 'LIEUTENANT', badge: '⭐' },
  { min: 60000,   max: 99999,  rank: 'CAPTAIN',    badge: '⭐⭐' },
  { min: 100000,  max: 199999, rank: 'MAJOR',      badge: '🌟' },
  { min: 200000,  max: 499999, rank: 'COLONEL',    badge: '🦅' },
  { min: 500000,  max: Infinity, rank: 'COMMANDER', badge: '👑' },
]

export function getRankInfo(xp: number) {
  return RANKS.find(r => xp >= r.min && xp <= r.max) || RANKS[0]
}

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  display_name: 'DANNY',
  rank: 'RECRUIT',
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
