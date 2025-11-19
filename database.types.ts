// =====================================================
// Database Types (Aligned with Production Schema)
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      brand_personas: {
        Row: {
          id: string
          user_id: string
          name: string
          tone: string
          audience: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tone: string
          audience: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          tone?: string
          audience?: string
          created_at?: string
        }
      }
      scheduled_posts: {
        Row: {
          id: string
          user_id: string
          scheduled_at: string
          status: string | null
          content: Json
          platform: string
          error_message: string | null
          posted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_at: string
          status?: string | null
          content: Json
          platform: string
          error_message?: string | null
          posted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_at?: string
          status?: string | null
          content?: Json
          platform?: string
          error_message?: string | null
          posted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      trend_reports: {
        Row: {
          id: string
          user_id: string
          niche: string
          content: string
          sources: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          niche: string
          content: string
          sources?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          niche?: string
          content?: string
          sources?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

