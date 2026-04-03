export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      monthly_expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          description: string | null
          expense_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description?: string | null
          expense_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string | null
          expense_date?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          rank: string
          level: number
          total_xp: number
          current_streak: number
          longest_streak: number
          is_religious: boolean
          onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          rank?: string
          level?: number
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          is_religious?: boolean
          onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          rank?: string
          level?: number
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          is_religious?: boolean
          onboarding_completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          bible_read: boolean
          prayed: boolean
          prayer_notes: string | null
          church_attended: boolean | null
          water_glasses: number
          meal_rating: number | null
          supplements_taken: boolean
          sleep_hours: number | null
          worked_out: boolean
          workout_type: string | null
          workout_duration: number | null
          workout_rpe: number | null
          weight: number | null
          quality_time: boolean
          date_night: boolean
          tracked_spending: boolean
          mood: number | null
          xp_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          bible_read?: boolean
          prayed?: boolean
          prayer_notes?: string | null
          church_attended?: boolean | null
          water_glasses?: number
          meal_rating?: number | null
          supplements_taken?: boolean
          sleep_hours?: number | null
          worked_out?: boolean
          workout_type?: string | null
          workout_duration?: number | null
          workout_rpe?: number | null
          weight?: number | null
          quality_time?: boolean
          date_night?: boolean
          tracked_spending?: boolean
          mood?: number | null
          xp_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          bible_read?: boolean
          prayed?: boolean
          prayer_notes?: string | null
          church_attended?: boolean | null
          water_glasses?: number
          meal_rating?: number | null
          supplements_taken?: boolean
          sleep_hours?: number | null
          worked_out?: boolean
          workout_type?: string | null
          workout_duration?: number | null
          workout_rpe?: number | null
          weight?: number | null
          quality_time?: boolean
          date_night?: boolean
          tracked_spending?: boolean
          mood?: number | null
          xp_earned?: number
          created_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          id: string
          user_id: string
          destination: string
          start_date: string | null
          end_date: string | null
          budget: number | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      financial_snapshots: {
        Row: {
          id: string
          user_id: string
          month: string
          net_worth: number | null
          savings_target: number | null
          savings_actual: number | null
          investment_contributions: number | null
          side_income: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          net_worth?: number | null
          savings_target?: number | null
          savings_actual?: number | null
          investment_contributions?: number | null
          side_income?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          net_worth?: number | null
          savings_target?: number | null
          savings_actual?: number | null
          investment_contributions?: number | null
          side_income?: number | null
          created_at?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          id: string
          user_id: string
          pillar: string
          name: string
          frequency: string
          xp_value: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pillar: string
          name: string
          frequency?: string
          xp_value?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pillar?: string
          name?: string
          frequency?: string
          xp_value?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_date?: string
          created_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          mood: number
          title: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          mood: number
          title?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          mood?: number
          title?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      relationship_goals: {
        Row: {
          id: string
          user_id: string
          goal_text: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_text: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_text?: string
          is_completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      fitness_goals: {
        Row: {
          id: string
          user_id: string
          goal_text: string
          target_date: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_text: string
          target_date?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_text?: string
          target_date?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          current_balance: number
          original_balance: number
          interest_rate: number
          minimum_payment: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: string
          current_balance: number
          original_balance?: number
          interest_rate?: number
          minimum_payment?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          current_balance?: number
          original_balance?: number
          interest_rate?: number
          minimum_payment?: number
          created_at?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          id: string
          user_id: string
          category: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string
          target: number
          current_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emoji?: string
          target: number
          current_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          emoji?: string
          target?: number
          current_amount?: number
          created_at?: string
        }
        Relationships: []
      }
      career_snapshots: {
        Row: {
          id: string
          user_id: string
          role: string | null
          company: string | null
          start_date: string | null
          target_role: string | null
          salary: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string | null
          company?: string | null
          start_date?: string | null
          target_role?: string | null
          salary?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string | null
          company?: string | null
          start_date?: string | null
          target_role?: string | null
          salary?: number | null
          created_at?: string
        }
        Relationships: []
      }
      win_log: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          win_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          win_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          win_date?: string
          created_at?: string
        }
        Relationships: []
      }
      saved_verses: {
        Row: {
          id: string
          user_id: string
          reference: string
          text: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reference: string
          text: string
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reference?: string
          text?: string
          saved_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
