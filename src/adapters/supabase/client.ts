/**
 * Supabase Client Configuration
 *
 * Singleton instance of the Supabase client used throughout the auth adapter.
 * Configured for Expo with proper environment variables.
 *
 * Session persistence:
 * - Web: localStorage (default). Session survives reload.
 * - Mobile: AsyncStorage. Session survives app close/restart.
 * When session expires or refresh fails, Supabase emits SIGNED_OUT and AuthGuard redirects to login.
 */

import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import type { GoTrueClientOptions } from "@supabase/auth-js";

// Get Supabase configuration from environment variables
const SUPABASE_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    '';

const SUPABASE_ANON_KEY =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    '';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!');
    console.error('Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.');
}

/**
 * Singleton Supabase client instance
 * - persistSession: true — session stored in AsyncStorage (native) / localStorage (web)
 * - autoRefreshToken: true — tokens refreshed before expiry
 * - storage (native only): AsyncStorage so session survives app close
 * - AppState (native only): start/stop auto-refresh when app goes foreground/background
 */
export const supabaseClient: SupabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: Platform.OS === 'web',
            lock: processLock,
            // Avoid "Lock acquisition timed out after 0ms" when multiple auth ops run.
            // Supported by @supabase/auth-js; supabase-js typings don't expose it yet.
            lockAcquireTimeout: 10_000,
        } as GoTrueClientOptions,
    }
);

if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabaseClient.auth.startAutoRefresh();
        } else {
            supabaseClient.auth.stopAutoRefresh();
        }
    });
}

/**
 * Helper to check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
