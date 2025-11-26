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

// Campaign status types
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

// Campaign post status types
export type CampaignPostStatus = 'draft' | 'text_generated' | 'visuals_generated' | 'scheduled' | 'published' | 'failed';

// Content type within campaigns
export type ContentMixType = 'educational' | 'promotional' | 'engagement';

// A/B Variation types
export type VariationType = 'original' | 'variation_a' | 'variation_b';

// Posting frequency options
export type PostingFrequency = 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly';

// Prediction source types
export type PredictionSource = 'baseline' | 'deep_analysis';

// Media types
export type MediaType = 'image' | 'video' | 'carousel';

export interface Database {
  public: {
    Tables: {
      brand_personas: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          tone: string
          audience: string
          forbidden_words: string[] | null
          example_posts: Json | null
          is_default: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          tone: string
          audience: string
          forbidden_words?: string[] | null
          example_posts?: Json | null
          is_default?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          tone?: string
          audience?: string
          forbidden_words?: string[] | null
          example_posts?: Json | null
          is_default?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
      }
      trend_cache: {
        Row: {
          id: string
          query_hash: string
          query_text: string
          result_json: Json
          sources: Json | null
          created_at: string
          expires_at: string
          hit_count: number | null
        }
        Insert: {
          id?: string
          query_hash: string
          query_text: string
          result_json: Json
          sources?: Json | null
          created_at?: string
          expires_at: string
          hit_count?: number | null
        }
        Update: {
          id?: string
          query_hash?: string
          query_text?: string
          result_json?: Json
          sources?: Json | null
          created_at?: string
          expires_at?: string
          hit_count?: number | null
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: CampaignStatus | null
          theme_goal: string
          content_mix: Json | null
          target_platforms: string[]
          brand_persona_id: string | null
          date_range_start: string
          date_range_end: string
          posting_frequency: PostingFrequency | null
          competitor_handles: string[] | null
          competitor_analysis_json: Json | null
          competitor_analysis_updated_at: string | null
          source_trend_report_id: string | null
          source_content: string | null
          total_posts: number | null
          posts_published: number | null
          estimated_credits: number | null
          credits_used: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: CampaignStatus
          theme_goal: string
          content_mix?: Json | null
          target_platforms: string[]
          brand_persona_id?: string | null
          date_range_start: string
          date_range_end: string
          posting_frequency?: PostingFrequency
          competitor_handles?: string[] | null
          competitor_analysis_json?: Json | null
          competitor_analysis_updated_at?: string | null
          source_trend_report_id?: string | null
          source_content?: string | null
          total_posts?: number | null
          posts_published?: number | null
          estimated_credits?: number | null
          credits_used?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: CampaignStatus
          theme_goal?: string
          content_mix?: Json | null
          target_platforms?: string[]
          brand_persona_id?: string | null
          date_range_start?: string
          date_range_end?: string
          posting_frequency?: PostingFrequency
          competitor_handles?: string[] | null
          competitor_analysis_json?: Json | null
          competitor_analysis_updated_at?: string | null
          source_trend_report_id?: string | null
          source_content?: string | null
          total_posts?: number | null
          posts_published?: number | null
          estimated_credits?: number | null
          credits_used?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      campaign_posts: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          platform: string
          content_type: ContentMixType | null
          status: CampaignPostStatus | null
          text_content: Json | null
          variation_type: VariationType | null
          variation_group: string | null
          variation_changes: Json | null
          has_media: boolean | null
          media_type: MediaType | null
          media_url: string | null
          media_prompt: string | null
          scheduled_at: string | null
          scheduled_post_id: string | null
          predicted_engagement_score: number | null
          prediction_factors: Json | null
          prediction_source: PredictionSource | null
          actual_engagement_score: number | null
          actual_metrics: Json | null
          text_credits_used: number | null
          media_credits_used: number | null
          created_at: string
          updated_at: string | null
          published_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          platform: string
          content_type?: ContentMixType
          status?: CampaignPostStatus
          text_content?: Json | null
          variation_type?: VariationType
          variation_group?: string | null
          variation_changes?: Json | null
          has_media?: boolean | null
          media_type?: MediaType | null
          media_url?: string | null
          media_prompt?: string | null
          scheduled_at?: string | null
          scheduled_post_id?: string | null
          predicted_engagement_score?: number | null
          prediction_factors?: Json | null
          prediction_source?: PredictionSource
          actual_engagement_score?: number | null
          actual_metrics?: Json | null
          text_credits_used?: number | null
          media_credits_used?: number | null
          created_at?: string
          updated_at?: string | null
          published_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          platform?: string
          content_type?: ContentMixType
          status?: CampaignPostStatus
          text_content?: Json | null
          variation_type?: VariationType
          variation_group?: string | null
          variation_changes?: Json | null
          has_media?: boolean | null
          media_type?: MediaType | null
          media_url?: string | null
          media_prompt?: string | null
          scheduled_at?: string | null
          scheduled_post_id?: string | null
          predicted_engagement_score?: number | null
          prediction_factors?: Json | null
          prediction_source?: PredictionSource
          actual_engagement_score?: number | null
          actual_metrics?: Json | null
          text_credits_used?: number | null
          media_credits_used?: number | null
          created_at?: string
          updated_at?: string | null
          published_at?: string | null
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
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          current_period_end: string | null
          subscription_credits: number
          purchased_credits: number
          credits_reset_at: string | null
          seats_used: number | null
          seats_limit: number | null
          generations_used: number | null
          has_used_trial: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          subscription_credits?: number
          purchased_credits?: number
          credits_reset_at?: string | null
          seats_used?: number | null
          seats_limit?: number | null
          generations_used?: number | null
          has_used_trial?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          subscription_credits?: number
          purchased_credits?: number
          credits_reset_at?: string | null
          seats_used?: number | null
          seats_limit?: number | null
          generations_used?: number | null
          has_used_trial?: boolean | null
          created_at?: string
          updated_at?: string | null
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
      campaign_overview: {
        Row: {
          id: string
          user_id: string
          name: string
          status: CampaignStatus | null
          theme_goal: string
          target_platforms: string[]
          date_range_start: string
          date_range_end: string
          total_posts: number | null
          posts_published: number | null
          estimated_credits: number | null
          credits_used: number | null
          persona_name: string | null
          date_status: string
          created_at: string
        }
      }
    }
    Functions: {
      get_cached_trend: {
        Args: { p_query_hash: string }
        Returns: Json | null
      }
      set_trend_cache: {
        Args: {
          p_query_hash: string
          p_query_text: string
          p_result_json: Json
          p_sources?: Json
          p_ttl_hours?: number
        }
        Returns: void
      }
      cleanup_expired_trend_cache: {
        Args: Record<string, never>
        Returns: number
      }
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_action_type: string
        }
        Returns: Json
      }
      check_credits: {
        Args: {
          p_user_id: string
          p_required: number
        }
        Returns: Json
      }
    }
    Enums: {
      trend_source_type: TrendSourceType
      campaign_status: CampaignStatus
      campaign_post_status: CampaignPostStatus
      content_mix_type: ContentMixType
      variation_type: VariationType
      posting_frequency: PostingFrequency
      prediction_source: PredictionSource
      media_type: MediaType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
