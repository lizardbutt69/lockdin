import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  expense_date: string
  created_at: string
}

export const EXPENSE_CATEGORIES = [
  { key: 'Housing',       color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)'  },
  { key: 'Food',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  { key: 'Transport',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  { key: 'Health',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  { key: 'Subscriptions', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)'  },
  { key: 'Entertainment', color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.3)'  },
  { key: 'Shopping',      color: '#0284c7', bg: 'rgba(2,132,199,0.12)',   border: 'rgba(2,132,199,0.3)'   },
  { key: 'Other',         color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
]

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function useExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [prevExpenses, setPrevExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentMonth())

  const fetchExpenses = useCallback(async () => {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    const start = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const end = new Date(y, m, 0).toISOString().slice(0, 10)

    const pm = prevMonth(month)
    const pmStart = `${pm}-01`
    const [py, pmm] = pm.split('-').map(Number)
    const pmEnd = new Date(py, pmm, 0).toISOString().slice(0, 10)

    const [{ data: curr }, { data: prev }] = await Promise.all([
      supabase.from('monthly_expenses').select('*').eq('user_id', user.id).gte('expense_date', start).lte('expense_date', end).order('expense_date', { ascending: false }),
      supabase.from('monthly_expenses').select('*').eq('user_id', user.id).gte('expense_date', pmStart).lte('expense_date', pmEnd),
    ])
    setExpenses(curr ?? [])
    setPrevExpenses(prev ?? [])
    setLoading(false)
  }, [user, month])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  async function addExpense(amount: number, category: string, description: string, expense_date: string) {
    if (!user) return
    const row = { user_id: user.id, amount, category, description: description || null, expense_date }
    const { data } = await supabase.from('monthly_expenses').insert(row).select().single()
    if (data) setExpenses(prev => [data, ...prev].sort((a, b) => b.expense_date.localeCompare(a.expense_date)))
  }

  async function deleteExpense(id: string) {
    setExpenses(prev => prev.filter(e => e.id !== id))
    await supabase.from('monthly_expenses').delete().eq('id', id)
  }

  const totalThisMonth = expenses.reduce((s, e) => s + e.amount, 0)
  const totalLastMonth = prevExpenses.reduce((s, e) => s + e.amount, 0)

  return { expenses, prevExpenses, loading, month, setMonth, addExpense, deleteExpense, totalThisMonth, totalLastMonth }
}
