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
      events: {
        Row: {
          id: string
          name: string
          target_date: string
          created_at: string
          category_id: string | null
          is_recurring: boolean
          recurring_type: 'yearly' | 'monthly' | 'weekly' | null
          notification_enabled: boolean
          notification_times: number[] | null
          user_id: string | null
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          target_date: string
          created_at?: string
          category_id?: string | null
          is_recurring?: boolean
          recurring_type?: 'yearly' | 'monthly' | 'weekly' | null
          notification_enabled?: boolean
          notification_times?: number[] | null
          user_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          target_date?: string
          created_at?: string
          category_id?: string | null
          is_recurring?: boolean
          recurring_type?: 'yearly' | 'monthly' | 'weekly' | null
          notification_enabled?: boolean
          notification_times?: number[] | null
          user_id?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          color: string
          icon?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

