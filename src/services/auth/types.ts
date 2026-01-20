/**
 * Core authentication types for the SaaS boilerplate.
 * These types are provider-agnostic and based on Prisma schema models.
 */

// ============================================
// USER & SESSION TYPES
// ============================================

/**
 * Authenticated user representation (client-side)
 * Based on Prisma User model but simplified for frontend use
 */
export interface AuthUser {
    id: string;
    email: string;
    emailVerified: Date | null;
    name: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User session information
 * Based on Prisma Session model
 */
export interface AuthSession {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    user?: AuthUser;
}

/**
 * User metadata for registration
 */
export interface UserMetadata {
    name?: string;
    avatarUrl?: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
    name?: string;
    avatarUrl?: string;
    email?: string;
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
 * Based on Prisma Account model
 */
export interface OAuthAccount {
    id: string;
    userId: string;
    provider: OAuthProvider;
    providerAccountId: string;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: Date | null;
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
