/**
 * Supabase Client Configuration
 * 
 * Singleton instance of the Supabase client used throughout the auth adapter.
 * Configured for Expo with proper environment variables.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase configuration from environment variables
const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL 
    || process.env.EXPO_PUBLIC_SUPABASE_URL 
    || '';

const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY 
    || '';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!');
    console.error('Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.');
}

/**
 * Singleton Supabase client instance
 * Configured with:
 * - Auto token refresh
 * - Persistent sessions (using AsyncStorage on mobile, localStorage on web)
 * - Auth state change detection
 */
export const supabaseClient: SupabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            // Storage is automatically handled by Supabase:
            // - Web: localStorage
            // - React Native: AsyncStorage (auto-detected)
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true, // Useful for OAuth redirects on web
        },
    }
);

/**
 * Helper to check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
