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

// Source type for trend reports
export type TrendSourceType = 'quick' | 'deep';

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
      drafts: {
        Row: {
          id: string
          user_id: string
          title: string
          source_content: string | null
          authors_voice: string | null
          platform_selections: Json
          tone: string
          search_intent: string
          results: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          source_content?: string | null
          authors_voice?: string | null
          platform_selections: Json
          tone: string
          search_intent: string
          results: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          source_content?: string | null
          authors_voice?: string | null
          platform_selections?: Json
          tone?: string
          search_intent?: string
          results?: Json
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
          content: string | null
          sources: Json
          created_at: string
          source_type: TrendSourceType | null
          identified_trends: Json | null
          related_keywords: Json | null
          overall_summary: string | null
        }
        Insert: {
          id?: string
          user_id: string
          niche: string
          content?: string | null
          sources?: Json
          created_at?: string
          source_type?: TrendSourceType
          identified_trends?: Json | null
          related_keywords?: Json | null
          overall_summary?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          niche?: string
          content?: string | null
          sources?: Json
          created_at?: string
          source_type?: TrendSourceType
          identified_trends?: Json | null
          related_keywords?: Json | null
          overall_summary?: string | null
        }
      }
    }
    Views: {
      unified_trend_research: {
        Row: {
          id: string
          user_id: string
          topic: string
          source_type: TrendSourceType
          summary_preview: string | null
          trends: Json | null
          keywords: Json | null
          sources: Json
          full_content: string | null
          created_at: string
          source_label: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      trend_source_type: TrendSourceType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
