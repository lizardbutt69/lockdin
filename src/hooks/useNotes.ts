import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Note {
  id: string
  user_id: string
  content: string
  is_completed: boolean
  is_archived: boolean
  created_at: string
}

// localStorage fallback key
const LS_KEY = 'lockedin_notes'

function lsLoad(): Note[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function lsSave(notes: Note[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes))
}
function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    if (!user) return
    setLoading(true)

    if (!isSupabaseConfigured) {
      setNotes(lsLoad())
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setNotes(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const addNote = useCallback(async (content: string) => {
    if (!content.trim() || !user) return

    if (!isSupabaseConfigured) {
      const note: Note = {
        id: newId(),
        user_id: user.id,
        content: content.trim(),
        is_completed: false,
        is_archived: false,
        created_at: new Date().toISOString(),
      }
      const next = [note, ...lsLoad()]
      lsSave(next)
      setNotes(next)
      return
    }

    const { data } = await supabase
      .from('notes')
      .insert({ user_id: user.id, content: content.trim() })
      .select()
      .single()
    if (data) setNotes(prev => [data, ...prev])
  }, [user])

  const updateNote = useCallback(async (id: string, updates: Partial<Pick<Note, 'content' | 'is_completed' | 'is_archived'>>) => {
    if (!isSupabaseConfigured) {
      const next = lsLoad().map(n => n.id === id ? { ...n, ...updates } : n)
      lsSave(next)
      setNotes(next)
      return
    }
    const { data } = await supabase.from('notes').update(updates).eq('id', id).select().single()
    if (data) setNotes(prev => prev.map(n => n.id === id ? data : n))
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) {
      const next = lsLoad().filter(n => n.id !== id)
      lsSave(next)
      setNotes(next)
      return
    }
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }, [])

  const active = notes.filter(n => !n.is_archived)
  const archived = notes.filter(n => n.is_archived)

  return { notes, active, archived, loading, addNote, updateNote, deleteNote }
}
