/**
 * Core authentication types for the SaaS boilerplate.
 * These types match the Supabase Auth structure.
 * 
 * NOTE: Dates are serialized as ISO 8601 strings when coming from Supabase,
 * and should be converted to Date objects by the adapter when needed.
 */

// ============================================
// USER & SESSION TYPES
// ============================================

/**
 * Authenticated user representation
 * Matches Supabase auth.users structure + user_metadata
 */
export interface AuthUser {
    id: string;
    email: string;
    emailVerified: string | null; // ISO 8601 datetime string from Supabase
    name: string | null;
    avatarUrl: string | null;
    createdAt: string; // ISO 8601 datetime string from Supabase
    updatedAt: string; // ISO 8601 datetime string from Supabase
}

/**
 * User session information
 * Matches Supabase Session structure
 */
export interface AuthSession {
    id: string;
    userId: string;
    token: string; // JWT access token
    expiresAt: string; // ISO 8601 datetime string
    user?: AuthUser;
}


// ============================================
// OAUTH TYPES
// ============================================

/**
 * Supported OAuth providers
 */
export type OAuthProvider = 'google' | 'apple' | 'github' | 'facebook';

/**
 * OAuth account information
 */
export interface OAuthAccount {
    id: string;
    userId: string;
    provider: OAuthProvider;
    providerAccountId: string;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: string | null;
    tokenType: string | null;
    scope: string | null;
}

// ============================================
// AUTH STATE & EVENTS
// ============================================

/**
 * Authentication state change events
 */
export type AuthEvent =
    | 'SIGNED_IN'
    | 'SIGNED_OUT'
    | 'USER_UPDATED'
    | 'TOKEN_REFRESHED'
    | 'PASSWORD_RECOVERY';

/**
 * Auth state change callback
 */
export type AuthStateChangeCallback = (
    event: AuthEvent,
    session: AuthSession | null
) => void | Promise<void>;

// ============================================
// ERROR TYPES
// ============================================

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
    // Sign In Errors
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
    USER_NOT_FOUND = 'USER_NOT_FOUND',

    // Sign Up Errors
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    INVALID_EMAIL = 'INVALID_EMAIL',

    // Session Errors
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    NO_SESSION = 'NO_SESSION',

    // OAuth Errors
    OAUTH_PROVIDER_ERROR = 'OAUTH_PROVIDER_ERROR',
    OAUTH_CANCELLED = 'OAUTH_CANCELLED',

    // General Errors
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured authentication error
 */
export class AuthError extends Error {
    constructor(
        public code: AuthErrorCode,
        message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

// ============================================
// AUTH RESPONSE TYPES
// ============================================

/**
 * Successful authentication response
 */
export interface AuthResponse {
    user: AuthUser;
    session: AuthSession;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
    success: boolean;
    message: string;
}
