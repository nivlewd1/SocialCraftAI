import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// More detailed debug logging
console.log('=== SUPABASE CONFIG DETAILED DEBUG ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY (first 20 chars):', supabaseAnonKey?.substring(0, 20));
console.log('URL type:', typeof supabaseUrl);
console.log('Anon Key type:', typeof supabaseAnonKey);

if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
  throw new Error(
    'Supabase URL is not a valid string. Please check your .env file and ensure VITE_SUPABASE_URL is set correctly.'
  );
}

if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  throw new Error(
    'Supabase Anon Key is not a valid string. Please check your .env file and ensure VITE_SUPABASE_ANON_KEY is set correctly.'
  );
}
console.log('======================================');


// Create Supabase client with TypeScript types
// The Database type will be auto-generated from your schema
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper to get session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Auth event listener helper
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
