import { supabase } from '../config/supabase';
import type { Database } from '../database.types';

type BrandPersonaRow = Database['public']['Tables']['brand_personas']['Row'];
type BrandPersonaInsert = Database['public']['Tables']['brand_personas']['Insert'];
type BrandPersonaUpdate = Database['public']['Tables']['brand_personas']['Update'];

/**
 * Brand Persona - Application Type
 */
export interface BrandPersona {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tone: string;
  audience: string;
  forbiddenWords: string[];
  examplePosts: ExamplePost[];
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ExamplePost {
  platform: string;
  content: string;
}

/**
 * Input for creating a new persona
 */
export interface CreatePersonaInput {
  name: string;
  description?: string;
  tone: string;
  audience: string;
  forbiddenWords?: string[];
  examplePosts?: ExamplePost[];
  isDefault?: boolean;
}

/**
 * Input for updating an existing persona
 */
export interface UpdatePersonaInput {
  name?: string;
  description?: string;
  tone?: string;
  audience?: string;
  forbiddenWords?: string[];
  examplePosts?: ExamplePost[];
  isDefault?: boolean;
}

/**
 * Brand Persona Service
 * Manages brand voice personas for content generation
 */
export const brandPersonaService = {
  /**
   * Get all personas for the current user
   */
  async getAll(): Promise<BrandPersona[]> {
    const { data, error } = await supabase
      .from('brand_personas')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personas:', error);
      throw error;
    }

    return (data || []).map(row => this.dbToPersona(row));
  },

  /**
   * Get a single persona by ID
   */
  async getById(id: string): Promise<BrandPersona | null> {
    const { data, error } = await supabase
      .from('brand_personas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching persona:', error);
      throw error;
    }

    return this.dbToPersona(data);
  },

  /**
   * Get the user's default persona
   */
  async getDefault(): Promise<BrandPersona | null> {
    const { data, error } = await supabase
      .from('brand_personas')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching default persona:', error);
      throw error;
    }

    return this.dbToPersona(data);
  },

  /**
   * Create a new persona
   */
  async create(input: CreatePersonaInput): Promise<BrandPersona> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // If this is set as default, unset any existing default
    if (input.isDefault) {
      await this.clearDefaultFlag();
    }

    const insert: BrandPersonaInsert = {
      user_id: user.id,
      name: input.name,
      description: input.description || null,
      tone: input.tone,
      audience: input.audience,
      forbidden_words: input.forbiddenWords || [],
      example_posts: input.examplePosts || [],
      is_default: input.isDefault || false,
    };

    const { data, error } = await supabase
      .from('brand_personas')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error creating persona:', error);
      throw error;
    }

    return this.dbToPersona(data);
  },

  /**
   * Update an existing persona
   */
  async update(id: string, input: UpdatePersonaInput): Promise<BrandPersona> {
    // If setting as default, clear other defaults first
    if (input.isDefault) {
      await this.clearDefaultFlag();
    }

    const update: BrandPersonaUpdate = {};
    
    if (input.name !== undefined) update.name = input.name;
    if (input.description !== undefined) update.description = input.description;
    if (input.tone !== undefined) update.tone = input.tone;
    if (input.audience !== undefined) update.audience = input.audience;
    if (input.forbiddenWords !== undefined) update.forbidden_words = input.forbiddenWords;
    if (input.examplePosts !== undefined) update.example_posts = input.examplePosts;
    if (input.isDefault !== undefined) update.is_default = input.isDefault;

    const { data, error } = await supabase
      .from('brand_personas')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating persona:', error);
      throw error;
    }

    return this.dbToPersona(data);
  },

  /**
   * Delete a persona
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('brand_personas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  },

  /**
   * Set a persona as the default (unsets others)
   */
  async setAsDefault(id: string): Promise<BrandPersona> {
    await this.clearDefaultFlag();
    return this.update(id, { isDefault: true });
  },

  /**
   * Clear the default flag from all personas
   */
  async clearDefaultFlag(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('brand_personas')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true);
  },

  /**
   * Generate a prompt instruction from a persona
   * Used when generating content with a brand voice
   */
  generatePromptInstruction(persona: BrandPersona): string {
    let instruction = `**BRAND VOICE PERSONA: "${persona.name}"**\n`;
    instruction += `- **Target Audience:** ${persona.audience}\n`;
    instruction += `- **Tone & Style:** ${persona.tone}\n`;

    if (persona.forbiddenWords.length > 0) {
      instruction += `- **FORBIDDEN WORDS/PHRASES (NEVER USE):** ${persona.forbiddenWords.join(', ')}\n`;
    }

    if (persona.examplePosts.length > 0) {
      instruction += `\n**EXAMPLE POSTS (Match this style):**\n`;
      persona.examplePosts.forEach((example, index) => {
        instruction += `Example ${index + 1} (${example.platform}):\n"${example.content}"\n\n`;
      });
    }

    instruction += `\nCRITICAL: All generated content MUST sound like it was written by this brand persona. Match the tone exactly.`;

    return instruction;
  },

  /**
   * Convert database row to application type
   */
  dbToPersona(row: BrandPersonaRow): BrandPersona {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description || undefined,
      tone: row.tone,
      audience: row.audience,
      forbiddenWords: row.forbidden_words || [],
      examplePosts: (row.example_posts as ExamplePost[]) || [],
      isDefault: row.is_default || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
    };
  },

  /**
   * Quick create from simple inputs (for Generator quick-save)
   */
  async quickCreate(name: string, tone: string, audience: string): Promise<BrandPersona> {
    return this.create({
      name,
      tone,
      audience,
      isDefault: false,
    });
  },
};
