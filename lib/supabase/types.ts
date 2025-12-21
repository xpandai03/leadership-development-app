/**
 * Database types for Supabase.
 *
 * These types are manually defined to match our Phase 1 schema.
 * For production, consider using `supabase gen types typescript` to
 * auto-generate types from your database schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'client' | 'coach'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: UserRole
          name: string
          email: string
          phone: string | null
          leadership_purpose: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: UserRole
          name: string
          email: string
          phone?: string | null
          leadership_purpose?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          name?: string
          email?: string
          phone?: string | null
          leadership_purpose?: string | null
          created_at?: string
        }
        Relationships: []
      }
      development_themes: {
        Row: {
          id: string
          user_id: string
          theme_text: string
          success_description: string | null
          theme_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme_text: string
          success_description?: string | null
          theme_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme_text?: string
          success_description?: string | null
          theme_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_themes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      progress_entries: {
        Row: {
          id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      weekly_actions: {
        Row: {
          id: string
          user_id: string
          theme_id: string | null
          action_text: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme_id?: string | null
          action_text: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme_id?: string | null
          action_text?: string
          is_completed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_actions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "development_themes"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          user_id: string
          receive_weekly_nudge: boolean
        }
        Insert: {
          user_id: string
          receive_weekly_nudge?: boolean
        }
        Update: {
          user_id?: string
          receive_weekly_nudge?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      nudges_sent: {
        Row: {
          id: string
          coach_id: string
          client_id: string
          message_text: string
          sent_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          client_id: string
          message_text: string
          sent_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          client_id?: string
          message_text?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudges_sent_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nudges_sent_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for Supabase
type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

// Convenience type aliases
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type DevelopmentTheme = Database['public']['Tables']['development_themes']['Row']
export type DevelopmentThemeInsert = Database['public']['Tables']['development_themes']['Insert']
export type DevelopmentThemeUpdate = Database['public']['Tables']['development_themes']['Update']

export type ProgressEntry = Database['public']['Tables']['progress_entries']['Row']
export type ProgressEntryInsert = Database['public']['Tables']['progress_entries']['Insert']

export type WeeklyAction = Database['public']['Tables']['weekly_actions']['Row']
export type WeeklyActionInsert = Database['public']['Tables']['weekly_actions']['Insert']
export type WeeklyActionUpdate = Database['public']['Tables']['weekly_actions']['Update']

export type Settings = Database['public']['Tables']['settings']['Row']
export type SettingsUpdate = Database['public']['Tables']['settings']['Update']

export type NudgeSent = Database['public']['Tables']['nudges_sent']['Row']
export type NudgeSentInsert = Database['public']['Tables']['nudges_sent']['Insert']
