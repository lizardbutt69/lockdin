import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../types/database'

export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

export function useJournal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchEntries = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  async function saveEntry(entry: {
    id?: string
    entry_date?: string
    mood: number
    title?: string
    content: string
  }) {
    if (!user) return { error: new Error('Not authenticated'), data: null }

    const payload = {
      user_id: user.id,
      entry_date: entry.entry_date || today,
      mood: entry.mood,
      title: entry.title?.trim() || null,
      content: entry.content,
      updated_at: new Date().toISOString(),
    }

    let result
    if (entry.id) {
      result = await supabase
        .from('journal_entries')
        .update(payload)
        .eq('id', entry.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('journal_entries')
        .insert(payload)
        .select()
        .single()
    }

    if (!result.error && result.data) {
      setEntries(prev => {
        const idx = prev.findIndex(e => e.id === result.data.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = result.data
          return next
        }
        return [result.data, ...prev]
      })
    }
    return result
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  const todayEntry = entries.find(e => e.entry_date === today) ?? null

  return { entries, loading, saveEntry, deleteEntry, refetch: fetchEntries, todayEntry, today }
}
