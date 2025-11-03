import { supabase } from './supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Utility function to ensure Supabase client is available
 * Throws an error if the client is null (missing environment variables)
 */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }
  return supabase;
}

/**
 * Utility function to safely use Supabase client
 * Returns null if the client is not available
 */
export function getSupabase(): SupabaseClient | null {
  return supabase;
}

/**
 * Type guard to check if Supabase client is available
 */
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}