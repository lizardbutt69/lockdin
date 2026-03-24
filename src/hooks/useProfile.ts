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
  created_at: new Date().toISOString(),
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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
    } else {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ id: user.id, display_name: user.email?.split('@')[0]?.toUpperCase() || 'OPERATOR' })
        .select()
        .single()
      setProfile(newProfile)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  async function updateProfile(updates: { display_name?: string }) {
    if (!user || !isSupabaseConfigured || !profile) return
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
  }

  return { profile, loading, refetch: fetchProfile, updateProfile }
}
