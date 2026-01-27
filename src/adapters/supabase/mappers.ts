/**
 * Type Mappers for Supabase Auth Adapter
 * 
 * Maps Supabase-specific types to our application's domain types.
 * This isolation ensures that our core business logic never depends on Supabase types.
 */

import type { AuthError as SupabaseAuthError, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthSession, AuthUser } from '../../services/auth/types';
import { AuthError, AuthErrorCode } from '../../services/auth/types';

/**
 * Maps Supabase User to our AuthUser type
 * @param supabaseUser - Supabase user object
 * @returns AuthUser - Our application's user type with ISO 8601 date strings
 */
export function mapSupabaseUserToAuthUser(supabaseUser: SupabaseUser): AuthUser {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        emailVerified: supabaseUser.email_confirmed_at || null,
        name: supabaseUser.user_metadata?.name || null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
}

/**
 * Maps Supabase Session to our AuthSession type
 * @param supabaseSession - Supabase session object
 * @returns AuthSession - Our application's session type with ISO 8601 date strings
 */
export function mapSupabaseSessionToAuthSession(supabaseSession: SupabaseSession): AuthSession {
    return {
        id: supabaseSession.user.id, // Using user ID as session ID
        userId: supabaseSession.user.id,
        token: supabaseSession.access_token,
        expiresAt: new Date(supabaseSession.expires_at! * 1000).toISOString(), // Convert Unix timestamp to ISO 8601 string
        user: mapSupabaseUserToAuthUser(supabaseSession.user),
    };
}

/**
 * Maps Supabase errors to our AuthError type
 * @param error - Error from Supabase (can be AuthError or generic Error)
 * @param fallbackMessage - Default message if error is not recognized
 * @returns AuthError - Our application's error type with appropriate code
 */
export function mapSupabaseErrorToAuthError(
    error: unknown,
    fallbackMessage: string = 'An authentication error occurred'
): AuthError {
    // Handle null/undefined errors
    if (!error) {
        return new AuthError(AuthErrorCode.UNKNOWN_ERROR, fallbackMessage);
    }

    // Check if it's a Supabase AuthError
    const supabaseError = error as SupabaseAuthError;
    const errorMessage = supabaseError.message || fallbackMessage;
    const errorStatus = supabaseError.status;

    // Map Supabase error messages/codes to our AuthErrorCode enum
    // Based on common Supabase Auth error patterns

    // Sign In Errors
    if (errorMessage.toLowerCase().includes('invalid login credentials') ||
        errorMessage.toLowerCase().includes('invalid email or password')) {
        return new AuthError(AuthErrorCode.INVALID_CREDENTIALS, errorMessage, error);
    }

    if (errorMessage.toLowerCase().includes('email not confirmed')) {
        return new AuthError(AuthErrorCode.EMAIL_NOT_CONFIRMED, errorMessage, error);
    }

    if (errorMessage.toLowerCase().includes('user not found')) {
        return new AuthError(AuthErrorCode.USER_NOT_FOUND, errorMessage, error);
    }

    // Sign Up Errors
    if (errorMessage.toLowerCase().includes('user already registered') ||
        errorMessage.toLowerCase().includes('email already exists')) {
        return new AuthError(AuthErrorCode.EMAIL_ALREADY_EXISTS, errorMessage, error);
    }

    if (errorMessage.toLowerCase().includes('password') &&
        (errorMessage.toLowerCase().includes('weak') ||
            errorMessage.toLowerCase().includes('short') ||
            errorMessage.toLowerCase().includes('at least'))) {
        return new AuthError(AuthErrorCode.WEAK_PASSWORD, errorMessage, error);
    }

    if (errorMessage.toLowerCase().includes('invalid email') ||
        errorMessage.toLowerCase().includes('invalid email format')) {
        return new AuthError(AuthErrorCode.INVALID_EMAIL, errorMessage, error);
    }

    // Session Errors
    if (errorMessage.toLowerCase().includes('session expired') ||
        errorMessage.toLowerCase().includes('token expired')) {
        return new AuthError(AuthErrorCode.SESSION_EXPIRED, errorMessage, error);
    }

    if (errorMessage.toLowerCase().includes('invalid token') ||
        errorMessage.toLowerCase().includes('jwt') ||
        errorStatus === 401) {
        return new AuthError(AuthErrorCode.INVALID_TOKEN, errorMessage, error);
    }

    if (errorMessage.toLowerCase().includes('no session') ||
        errorMessage.toLowerCase().includes('not authenticated')) {
        return new AuthError(AuthErrorCode.NO_SESSION, errorMessage, error);
    }

    // OAuth Errors
    if (errorMessage.toLowerCase().includes('oauth') ||
        errorMessage.toLowerCase().includes('provider')) {
        return new AuthError(AuthErrorCode.OAUTH_PROVIDER_ERROR, errorMessage, error);
    }

    // Network Errors
    if (errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch failed') ||
        errorMessage.toLowerCase().includes('connection')) {
        return new AuthError(AuthErrorCode.NETWORK_ERROR, errorMessage, error);
    }

    // Default to unknown error
    return new AuthError(AuthErrorCode.UNKNOWN_ERROR, errorMessage, error);
}
