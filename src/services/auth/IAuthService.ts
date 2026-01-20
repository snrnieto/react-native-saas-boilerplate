/**
 * IAuthService Interface
 * 
 * This interface defines the contract that any authentication provider
 * (Supabase, Firebase, Auth0, etc.) must implement.
 * 
 * Following the Adapter Pattern to keep the codebase provider-agnostic.
 */

import type {
    AuthResponse,
    AuthSession,
    AuthStateChangeCallback,
    AuthUser,
    OAuthProvider,
    PasswordResetResponse,
    ProfileUpdateData,
    UserMetadata,
} from './types';

export interface IAuthService {
    // ============================================
    // AUTHENTICATION METHODS
    // ============================================

    /**
     * Register a new user with email and password
     * @param email - User's email address
     * @param password - User's password (min 8 characters recommended)
     * @param metadata - Optional user metadata (name, avatar, etc.)
     * @returns Promise with user and session data
     * @throws AuthError if registration fails
     */
    signUp(
        email: string,
        password: string,
        metadata?: UserMetadata
    ): Promise<AuthResponse>;

    /**
     * Sign in with email and password
     * @param email - User's email address
     * @param password - User's password
     * @returns Promise with user and session data
     * @throws AuthError if credentials are invalid
     */
    signIn(email: string, password: string): Promise<AuthResponse>;

    /**
     * Sign in with OAuth provider (Google, Apple, GitHub, etc.)
     * @param provider - OAuth provider name
     * @returns Promise with user and session data
     * @throws AuthError if OAuth flow fails
     */
    signInWithProvider(provider: OAuthProvider): Promise<AuthResponse>;

    /**
     * Sign out the current user
     * @returns Promise that resolves when sign out is complete
     * @throws AuthError if sign out fails
     */
    signOut(): Promise<void>;

    // ============================================
    // SESSION & USER METHODS
    // ============================================

    /**
     * Get the currently authenticated user
     * @returns Promise with current user or null if not authenticated
     */
    getCurrentUser(): Promise<AuthUser | null>;

    /**
     * Get the current session
     * @returns Promise with current session or null if no active session
     */
    getSession(): Promise<AuthSession | null>;

    /**
     * Subscribe to authentication state changes
     * @param callback - Function to call when auth state changes
     * @returns Unsubscribe function to stop listening
     */
    onAuthStateChange(
        callback: AuthStateChangeCallback
    ): () => void;

    // ============================================
    // PASSWORD & PROFILE METHODS
    // ============================================

    /**
     * Send password reset email
     * @param email - User's email address
     * @returns Promise with reset response
     * @throws AuthError if email doesn't exist or request fails
     */
    resetPassword(email: string): Promise<PasswordResetResponse>;

    /**
     * Update user password (requires current session)
     * @param newPassword - New password
     * @returns Promise that resolves when password is updated
     * @throws AuthError if update fails or no active session
     */
    updatePassword(newPassword: string): Promise<void>;

    /**
     * Update user profile information
     * @param data - Profile data to update
     * @returns Promise with updated user
     * @throws AuthError if update fails or no active session
     */
    updateProfile(data: ProfileUpdateData): Promise<AuthUser>;

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================

    /**
     * Refresh the current session token
     * @returns Promise with new session
     * @throws AuthError if refresh fails
     */
    refreshSession(): Promise<AuthSession>;

    /**
     * Verify if current session is valid
     * @returns Promise with boolean indicating if session is valid
     */
    isSessionValid(): Promise<boolean>;
}
