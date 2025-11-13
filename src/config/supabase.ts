import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your-project-url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here';

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  if (!supabase) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

