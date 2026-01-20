/**
 * Auth Service Module
 * Barrel export for clean imports throughout the application
 */

// Main interface
export type { IAuthService } from './IAuthService';

// Types
export type {
    AuthEvent, AuthResponse, AuthSession, AuthStateChangeCallback, AuthUser, OAuthAccount, OAuthProvider, PasswordResetResponse, ProfileUpdateData, UserMetadata
} from './types';

// Error handling
export { AuthError, AuthErrorCode } from './types';

