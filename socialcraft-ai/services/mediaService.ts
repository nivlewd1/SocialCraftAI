import { supabase } from '../config/supabase';
import type { SavedMedia } from '../types';

/**
 * Media Service
 * Handles AI-generated media storage (images/videos)
 */
export const mediaService = {
  /**
   * Upload media file to Supabase Storage
   */
  async uploadMedia(
    file: File | Blob,
    type: 'image' | 'video',
    prompt: string
  ): Promise<SavedMedia> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate unique filename
    const fileExt = type === 'image' ? 'png' : 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('ai-media')
      .upload(storagePath, file, {
        contentType: type === 'image' ? 'image/png' : 'video/mp4',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading media:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('ai-media')
      .getPublicUrl(storagePath);

    // Save metadata to database
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        user_id: user.id,
        type,
        prompt,
        storage_path: storagePath,
        public_url: publicUrl,
        file_size: file.size,
        mime_type: type === 'image' ? 'image/png' : 'video/mp4',
      })
      .select()
      .single();

    if (dbError) {
      // Try to clean up uploaded file
      await supabase.storage.from('ai-media').remove([storagePath]);
      console.error('Error saving media metadata:', dbError);
      throw dbError;
    }

    return {
      id: mediaRecord.id,
      type,
      prompt,
      url: publicUrl,
      createdAt: mediaRecord.created_at,
    };
  },

  /**
   * Get all media for current user
   */
  async getAllMedia(): Promise<SavedMedia[]> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media:', error);
      throw error;
    }

    return (data || []).map((record) => ({
      id: record.id,
      type: record.type,
      prompt: record.prompt,
      url: record.public_url || '',
      createdAt: record.created_at,
    }));
  },

  /**
   * Delete media (removes from storage and database)
   */
  async deleteMedia(id: string): Promise<void> {
    // Get media record to find storage path
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching media for deletion:', fetchError);
      throw fetchError;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('ai-media')
      .remove([media.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting media record:', dbError);
      throw dbError;
    }
  },
};
