/**
 * Auth Service Module
 * Barrel export for clean imports throughout the application
 * 
 * Implementation:
 * - Default implementation: SupabaseAuthAdapter (see /src/adapters/supabase)
 * - To use: import { SupabaseAuthAdapter } from '@/adapters/supabase'
 */

// Main interface
export type { IAuthService } from './IAuthService';

// Types
export type {
    AuthEvent, AuthResponse, AuthSession, AuthStateChangeCallback, AuthUser, OAuthAccount, OAuthProvider, PasswordResetResponse, ProfileUpdateData, UserMetadata
} from './types';

// Error handling
export { AuthError, AuthErrorCode } from './types';

