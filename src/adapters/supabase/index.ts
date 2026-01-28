/**
 * Supabase Adapter Module
 * Barrel export for the Supabase authentication adapter
 */

// Main adapter classes
export { SupabaseAuthAdapter } from './SupabaseAuthAdapter';
export { SupabaseProfileAdapter } from './SupabaseProfileAdapter';

// Supabase client (for edge cases where direct access is needed)
export { isSupabaseConfigured, supabaseClient } from './client';

// Type mappers (exported for testing purposes)
export {
    mapSupabaseErrorToAuthError, mapSupabaseSessionToAuthSession, mapSupabaseUserToAuthUser
} from './mappers';

