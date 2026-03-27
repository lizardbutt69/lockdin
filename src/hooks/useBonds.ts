import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface BondsPerson {
  id: string; user_id: string; name: string; relationship_type: string
  last_contacted: string | null; avatar_color: string; notes: string | null; created_at: string
}
export interface BondsMoment {
  id: string; user_id: string; person_id: string | null; title: string
  description: string | null; moment_date: string; created_at: string
}
export interface BondsCheckIn {
  id: string; user_id: string; check_date: string
  energy: number | null; mood: number | null; mindset: number | null
  reflection: string | null; showing_up_text: string | null
}
export interface BondsPulse {
  id: string; user_id: string; week_of: string
  quality_time: number | null; communication: number | null; intentionality: number | null; notes: string | null
}
export interface BondsBucketItem {
  id: string; user_id: string; title: string; is_completed: boolean; completed_at: string | null; created_at: string
}
export interface BondsImportantDate {
  id: string; user_id: string; person_name: string; date_type: string
  month: number; day: number; year: number | null; notes: string | null; created_at: string
}
export interface BondsGroup {
  id: string; user_id: string; name: string; group_type: string; is_active: boolean; notes: string | null; created_at: string
}
export interface BondsGiving {
  id: string; user_id: string; title: string; given_date: string; giving_type: string; notes: string | null; created_at: string
}

function toLocalISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function getMondayISO() {
  const d = new Date(); const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); return toLocalISO(d)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabase as any

export function useBonds() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState<BondsPerson[]>([])
  const [moments, setMoments] = useState<BondsMoment[]>([])
  const [checkIn, setCheckIn] = useState<BondsCheckIn | null>(null)
  const [pulse, setPulse] = useState<BondsPulse | null>(null)
  const [bucketList, setBucketList] = useState<BondsBucketItem[]>([])
  const [importantDates, setImportantDates] = useState<BondsImportantDate[]>([])
  const [groups, setGroups] = useState<BondsGroup[]>([])
  const [giving, setGiving] = useState<BondsGiving[]>([])

  const fetch = useCallback(async () => {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    const uid = user.id
    const [p, m, ci, pulse, bl, dates, g, gv] = await Promise.all([
      db().from('bonds_people').select('*').eq('user_id', uid).order('created_at'),
      db().from('bonds_moments').select('*').eq('user_id', uid).order('moment_date', { ascending: false }),
      db().from('bonds_check_ins').select('*').eq('user_id', uid).eq('check_date', toLocalISO()).maybeSingle(),
      db().from('bonds_relationship_pulse').select('*').eq('user_id', uid).eq('week_of', getMondayISO()).maybeSingle(),
      db().from('bonds_bucket_list').select('*').eq('user_id', uid).order('created_at'),
      db().from('bonds_important_dates').select('*').eq('user_id', uid).order('month').order('day'),
      db().from('bonds_groups').select('*').eq('user_id', uid).order('created_at'),
      db().from('bonds_giving').select('*').eq('user_id', uid).order('given_date', { ascending: false }),
    ])
    if (p.data) setPeople(p.data)
    if (m.data) setMoments(m.data)
    if (ci.data) setCheckIn(ci.data)
    if (pulse.data) setPulse(pulse.data)
    if (bl.data) setBucketList(bl.data)
    if (dates.data) setImportantDates(dates.data)
    if (g.data) setGroups(g.data)
    if (gv.data) setGiving(gv.data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  // ── People ───────────────────────────────────────────────
  async function addPerson(data: Omit<BondsPerson, 'id'|'user_id'|'created_at'>) {
    if (!user) return
    const { data: row } = await db().from('bonds_people').insert({ ...data, user_id: user.id }).select().single()
    if (row) setPeople(p => [...p, row])
  }
  async function updatePerson(id: string, data: Partial<BondsPerson>) {
    await db().from('bonds_people').update(data).eq('id', id)
    setPeople(p => p.map(x => x.id === id ? { ...x, ...data } : x))
  }
  async function deletePerson(id: string) {
    await db().from('bonds_people').delete().eq('id', id)
    setPeople(p => p.filter(x => x.id !== id))
  }
  async function markContacted(id: string) {
    const today = toLocalISO()
    await db().from('bonds_people').update({ last_contacted: today }).eq('id', id)
    setPeople(p => p.map(x => x.id === id ? { ...x, last_contacted: today } : x))
  }

  // ── Moments ──────────────────────────────────────────────
  async function addMoment(data: { title: string; description?: string; person_id?: string; moment_date?: string }) {
    if (!user) return
    const payload = {
      user_id: user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      person_id: data.person_id || null,
      moment_date: data.moment_date || toLocalISO(),
    }
    const { data: row } = await db().from('bonds_moments').insert(payload).select().single()
    if (row) setMoments(m => [row, ...m])
    // Cross-write to gratitude
    try {
      const content = data.description ? `${data.title}: ${data.description}` : data.title
      await db().from('gratitude_entries').insert({ user_id: user.id, category: 'moment', content })
    } catch { /* non-critical */ }
  }
  async function deleteMoment(id: string) {
    await db().from('bonds_moments').delete().eq('id', id)
    setMoments(m => m.filter(x => x.id !== id))
  }

  // ── Check-in ─────────────────────────────────────────────
  async function saveCheckIn(data: Partial<Pick<BondsCheckIn, 'energy'|'mood'|'mindset'|'reflection'|'showing_up_text'>>) {
    if (!user) return
    const today = toLocalISO()
    const payload = { user_id: user.id, check_date: today, ...data }
    const { data: row } = await db().from('bonds_check_ins')
      .upsert(payload, { onConflict: 'user_id,check_date' }).select().single()
    if (row) setCheckIn(row)
  }

  // ── Pulse ────────────────────────────────────────────────
  async function savePulse(data: Partial<Pick<BondsPulse, 'quality_time'|'communication'|'intentionality'|'notes'>>) {
    if (!user) return
    const week = getMondayISO()
    const payload = { user_id: user.id, week_of: week, ...data }
    const { data: row } = await db().from('bonds_relationship_pulse')
      .upsert(payload, { onConflict: 'user_id,week_of' }).select().single()
    if (row) setPulse(row)
  }

  // ── Bucket list ──────────────────────────────────────────
  async function addBucketItem(title: string) {
    if (!user) return
    const { data: row } = await db().from('bonds_bucket_list').insert({ user_id: user.id, title: title.trim() }).select().single()
    if (row) setBucketList(b => [...b, row])
  }
  async function toggleBucketItem(id: string) {
    const item = bucketList.find(x => x.id === id); if (!item) return
    const next = !item.is_completed
    await db().from('bonds_bucket_list').update({ is_completed: next, completed_at: next ? new Date().toISOString() : null }).eq('id', id)
    setBucketList(b => b.map(x => x.id === id ? { ...x, is_completed: next } : x))
  }
  async function deleteBucketItem(id: string) {
    await db().from('bonds_bucket_list').delete().eq('id', id)
    setBucketList(b => b.filter(x => x.id !== id))
  }

  // ── Important dates ──────────────────────────────────────
  async function addImportantDate(data: Omit<BondsImportantDate, 'id'|'user_id'|'created_at'>) {
    if (!user) return
    const { data: row } = await db().from('bonds_important_dates').insert({ ...data, user_id: user.id }).select().single()
    if (row) setImportantDates(d => [...d, row].sort((a,b) => a.month - b.month || a.day - b.day))
  }
  async function deleteImportantDate(id: string) {
    await db().from('bonds_important_dates').delete().eq('id', id)
    setImportantDates(d => d.filter(x => x.id !== id))
  }

  // ── Groups ───────────────────────────────────────────────
  async function addGroup(data: Omit<BondsGroup, 'id'|'user_id'|'created_at'>) {
    if (!user) return
    const { data: row } = await db().from('bonds_groups').insert({ ...data, user_id: user.id }).select().single()
    if (row) setGroups(g => [...g, row])
  }
  async function toggleGroup(id: string) {
    const g = groups.find(x => x.id === id); if (!g) return
    await db().from('bonds_groups').update({ is_active: !g.is_active }).eq('id', id)
    setGroups(gs => gs.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x))
  }
  async function deleteGroup(id: string) {
    await db().from('bonds_groups').delete().eq('id', id)
    setGroups(g => g.filter(x => x.id !== id))
  }

  // ── Giving ───────────────────────────────────────────────
  async function addGiving(data: Omit<BondsGiving, 'id'|'user_id'|'created_at'>) {
    if (!user) return
    const { data: row } = await db().from('bonds_giving').insert({ ...data, user_id: user.id }).select().single()
    if (row) setGiving(g => [row, ...g])
  }
  async function deleteGiving(id: string) {
    await db().from('bonds_giving').delete().eq('id', id)
    setGiving(g => g.filter(x => x.id !== id))
  }

  return {
    loading,
    people, addPerson, updatePerson, deletePerson, markContacted,
    moments, addMoment, deleteMoment,
    checkIn, saveCheckIn,
    pulse, savePulse,
    bucketList, addBucketItem, toggleBucketItem, deleteBucketItem,
    importantDates, addImportantDate, deleteImportantDate,
    groups, addGroup, toggleGroup, deleteGroup,
    giving, addGiving, deleteGiving,
  }
}
