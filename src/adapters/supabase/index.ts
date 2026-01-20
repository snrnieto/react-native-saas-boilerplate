/**
 * Supabase Adapter Module
 * Barrel export for the Supabase authentication adapter
 */

// Main adapter class
export { SupabaseAuthAdapter } from './SupabaseAuthAdapter';

// Supabase client (for edge cases where direct access is needed)
export { isSupabaseConfigured, supabaseClient } from './client';

// Type mappers (exported for testing purposes)
export {
    mapSupabaseErrorToAuthError, mapSupabaseSessionToAuthSession, mapSupabaseUserToAuthUser
} from './mappers';

