// =====================================================
// Database Types (Auto-generated from Supabase Schema)
// =====================================================
// TODO: Generate this file automatically using Supabase CLI:
// supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
//
// For now, these are manual types matching the schema.
// They provide type safety for Supabase queries.
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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drafts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          source_content: string | null;
          authors_voice: string | null;
          platform_selections: Json;
          tone: string | null;
          search_intent: string | null;
          results: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          source_content?: string | null;
          authors_voice?: string | null;
          platform_selections?: Json;
          tone?: string | null;
          search_intent?: string | null;
          results?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          source_content?: string | null;
          authors_voice?: string | null;
          platform_selections?: Json;
          tone?: string | null;
          search_intent?: string | null;
          results?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      scheduled_posts: {
        Row: {
          id: string;
          user_id: string;
          scheduled_at: string;
          status: 'scheduled' | 'posted' | 'failed';
          content: Json;
          platform: string;
          error_message: string | null;
          posted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scheduled_at: string;
          status?: 'scheduled' | 'posted' | 'failed';
          content: Json;
          platform: string;
          error_message?: string | null;
          posted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scheduled_at?: string;
          status?: 'scheduled' | 'posted' | 'failed';
          content?: Json;
          platform?: string;
          error_message?: string | null;
          posted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          user_id: string;
          type: 'image' | 'video';
          prompt: string;
          storage_path: string;
          public_url: string | null;
          file_size: number | null;
          mime_type: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'image' | 'video';
          prompt: string;
          storage_path: string;
          public_url?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'image' | 'video';
          prompt?: string;
          storage_path?: string;
          public_url?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      connected_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: 'linkedin' | 'instagram' | 'tiktok' | 'pinterest' | 'twitter';
          platform_user_id: string | null;
          platform_username: string | null;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          scopes: string[] | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: 'linkedin' | 'instagram' | 'tiktok' | 'pinterest' | 'twitter';
          platform_user_id?: string | null;
          platform_username?: string | null;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          scopes?: string[] | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: 'linkedin' | 'instagram' | 'tiktok' | 'pinterest' | 'twitter';
          platform_user_id?: string | null;
          platform_username?: string | null;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          scopes?: string[] | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_cache: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          metric_type: string;
          data: Json;
          cached_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          metric_type: string;
          data: Json;
          cached_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          metric_type?: string;
          data?: Json;
          cached_at?: string;
          expires_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
