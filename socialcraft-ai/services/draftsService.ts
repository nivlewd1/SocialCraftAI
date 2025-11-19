import { supabase } from '../config/supabase';
import type { Draft } from '../types';
import type { Database } from '../database.types';

type DraftRow = Database['public']['Tables']['drafts']['Row'];
type DraftInsert = Database['public']['Tables']['drafts']['Insert'];
type DraftUpdate = Database['public']['Tables']['drafts']['Update'];

/**
 * Drafts Service
 * Type-safe API for managing drafts in Supabase
 */
export const draftsService = {
  /**
   * Get all drafts for the current user
   */
  async getAllDrafts(): Promise<Draft[]> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafts:', error);
      throw error;
    }

    // Convert database format to app format
    return (data || []).map((draft) => this.dbToDraft(draft));
  },

  /**
   * Get a single draft by ID
   */
  async getDraft(id: string): Promise<Draft | null> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching draft:', error);
      throw error;
    }

    return this.dbToDraft(data);
  },

  /**
   * Create a new draft
   */
  async createDraft(draft: Omit<Draft, 'id' | 'createdAt'>): Promise<Draft> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const insert: DraftInsert = {
      user_id: user.id,
      title: draft.title,
      source_content: draft.sourceContent,
      authors_voice: draft.authorsVoice,
      platform_selections: draft.platformSelections as any,
      tone: draft.tone,
      search_intent: draft.searchIntent,
      results: draft.results as any,
    };

    const { data, error } = await supabase
      .from('drafts')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error creating draft:', error);
      throw error;
    }

    return this.dbToDraft(data);
  },

  /**
   * Update an existing draft
   */
  async updateDraft(id: string, updates: Partial<Omit<Draft, 'id' | 'createdAt'>>): Promise<Draft> {
    const update: DraftUpdate = {};

    if (updates.title !== undefined) update.title = updates.title;
    if (updates.sourceContent !== undefined) update.source_content = updates.sourceContent;
    if (updates.authorsVoice !== undefined) update.authors_voice = updates.authorsVoice;
    if (updates.platformSelections !== undefined) update.platform_selections = updates.platformSelections as any;
    if (updates.tone !== undefined) update.tone = updates.tone;
    if (updates.searchIntent !== undefined) update.search_intent = updates.searchIntent;
    if (updates.results !== undefined) update.results = updates.results as any;

    const { data, error } = await supabase
      .from('drafts')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating draft:', error);
      throw error;
    }

    return this.dbToDraft(data);
  },

  /**
   * Delete a draft
   */
  async deleteDraft(id: string): Promise<void> {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  },

  /**
   * Subscribe to draft changes (real-time)
   */
  subscribeToDrafts(callback: () => void) {
    const channel = supabase
      .channel('drafts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drafts',
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Convert database row to Draft type
   */
  dbToDraft(row: DraftRow): Draft {
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      sourceContent: row.source_content || '',
      authorsVoice: row.authors_voice,
      platformSelections: row.platform_selections as any,
      tone: row.tone as any,
      searchIntent: row.search_intent as any,
      results: (row.results as any) || [],
    };
  },
};
