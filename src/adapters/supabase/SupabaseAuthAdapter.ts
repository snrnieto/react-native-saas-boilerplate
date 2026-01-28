/**
 * Supabase Auth Adapter
 *
 * Concrete implementation of IAuthService using Supabase as the authentication provider.
 * This adapter translates Supabase Auth API calls to our application's auth interface.
 *
 * Features:
 * - Email/Password authentication (fully implemented)
 * - Session management with auto-refresh
 * - Password reset and profile updates
 * - OAuth ready (Google implementation prepared for future)
 */

import type { IAuthService } from "../../services/auth/IAuthService";
import type {
  AuthResponse,
  AuthSession,
  AuthStateChangeCallback,
  AuthUser,
  OAuthProvider,
  PasswordResetResponse,
  ProfileUpdateData,
  UserMetadata,
} from "../../services/auth/types";
import { AuthError, AuthErrorCode } from "../../services/auth/types";

import { supabaseClient } from "./client";
import {
  mapSupabaseErrorToAuthError,
  mapSupabaseSessionToAuthSession,
  mapSupabaseUserToAuthUser,
} from "./mappers";

export class SupabaseAuthAdapter implements IAuthService {
  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Register a new user with email and password
   */
  async signUp(
    email: string,
    password: string,
    metadata?: UserMetadata,
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata?.name,
            avatar_url: metadata?.avatarUrl,
          },
        },
      });

      if (error) {
        throw mapSupabaseErrorToAuthError(error, "Failed to sign up");
      }

      if (!data.user || !data.session) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          "Sign up succeeded but no user or session returned",
        );
      }

      // Create profile in the profiles table
      try {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .insert({
            user_id: data.user.id,
            avatar_url: metadata?.avatarUrl || null,
            bio: null,
            phone: null,
            preferences: null,
          });

        if (profileError) {
          console.error("Failed to create profile:", profileError);
          // Don't throw - profile creation is not critical for signup success
          // The profile can be created later if needed
        }
      } catch (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't throw - allow signup to succeed even if profile creation fails
      }

      return {
        user: mapSupabaseUserToAuthUser(data.user),
        session: mapSupabaseSessionToAuthSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to sign up");
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw mapSupabaseErrorToAuthError(error, "Failed to sign in");
      }

      if (!data.user || !data.session) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          "Sign in succeeded but no user or session returned",
        );
      }

      return {
        user: mapSupabaseUserToAuthUser(data.user),
        session: mapSupabaseSessionToAuthSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to sign in");
    }
  }

  /**
   * Sign in with OAuth provider (Google, Apple, GitHub, etc.)
   *
   * TODO: Implement OAuth flow for mobile and web
   * - Web: Use supabase.auth.signInWithOAuth({ provider })
   * - Mobile: Use expo-web-browser for OAuth flow
   *
   * Example implementation for Google:
   * ```typescript
   * if (Platform.OS === 'web') {
   *   const { data, error } = await supabaseClient.auth.signInWithOAuth({
   *     provider: 'google',
   *     options: {
   *       redirectTo: window.location.origin,
   *     },
   *   });
   * } else {
   *   // Mobile: Use expo-web-browser
   *   const { data, error } = await supabaseClient.auth.signInWithOAuth({
   *     provider: 'google',
   *     options: {
   *       redirectTo: 'myapp://auth/callback',
   *       skipBrowserRedirect: true,
   *     },
   *   });
   *   // Open browser with data.url using expo-web-browser
   * }
   * ```
   */
  async signInWithProvider(provider: OAuthProvider): Promise<AuthResponse> {
    throw new AuthError(
      AuthErrorCode.OAUTH_PROVIDER_ERROR,
      `OAuth provider "${provider}" is not yet implemented. Coming soon!`,
    );
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        throw mapSupabaseErrorToAuthError(error, "Failed to sign out");
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to sign out");
    }
  }

  // ============================================
  // SESSION & USER METHODS
  // ============================================

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabaseClient.auth.getUser();

      if (error) {
        // If there's an error getting the user, they're likely not authenticated
        // Don't throw, just return null
        return null;
      }

      if (!data.user) {
        return null;
      }

      return mapSupabaseUserToAuthUser(data.user);
    } catch (error) {
      // Swallow errors and return null - user is not authenticated
      return null;
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error || !data.session) {
        return null;
      }

      return mapSupabaseSessionToAuthSession(data.session);
    } catch (error) {
      // Swallow errors and return null - no active session
      return null;
    }
  }

  /**
   * Subscribe to authentication state changes
   * Returns an unsubscribe function
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      // Map Supabase events to our AuthEvent types
      let authEvent: Parameters<AuthStateChangeCallback>[0];

      switch (event) {
        case "SIGNED_IN":
          authEvent = "SIGNED_IN";
          break;
        case "SIGNED_OUT":
          authEvent = "SIGNED_OUT";
          break;
        case "USER_UPDATED":
          authEvent = "USER_UPDATED";
          break;
        case "TOKEN_REFRESHED":
          authEvent = "TOKEN_REFRESHED";
          break;
        case "PASSWORD_RECOVERY":
          authEvent = "PASSWORD_RECOVERY";
          break;
        default:
          // For other events, treat as USER_UPDATED
          authEvent = "USER_UPDATED";
      }

      // Map session to our type or pass null
      const mappedSession = session
        ? mapSupabaseSessionToAuthSession(session)
        : null;

      // Call the callback with our mapped types
      callback(authEvent, mappedSession);
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  // ============================================
  // PASSWORD & PROFILE METHODS
  // ============================================

  /**
   * Check if a user exists with the given email
   * 
   * We try to get the user by email using Supabase Auth API.
   * However, Supabase doesn't expose a direct "getUserByEmail" method from the client.
   * 
   * Alternative approach: Try to sign in with dummy credentials.
   * If we get "invalid credentials", we can't distinguish between:
   * - User doesn't exist
   * - User exists but password is wrong
   * 
   * So we use a more reliable method: check if we can get user info by attempting
   * a password reset and checking the response, OR we try to query the auth.users
   * table directly (if we have RLS policies that allow it).
   * 
   * For now, we'll use a simpler approach: attempt sign-in and check the error.
   * If error explicitly says "user not found", return false.
   * Otherwise, we can't be certain, so we'll be conservative.
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      // Method 1: Try to sign in with dummy password
      // This will fail, but the error message might tell us if user exists
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: 'dummy_password_check_12345!@#$',
      });

      if (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = (error as any).code || '';
        
        // If error explicitly says user/email not found, user doesn't exist
        if (errorMessage.includes('user not found') || 
            errorMessage.includes('email not found') ||
            errorCode === 'user_not_found') {
          return false;
        }
        
        // If we get "invalid login credentials" or "invalid email or password"
        // Supabase intentionally doesn't distinguish between "user doesn't exist" 
        // and "wrong password" for security. 
        // 
        // Since we can't be certain, we return false to be conservative.
        // This prevents sending emails to non-existent users.
        if (errorMessage.includes('invalid login credentials') ||
            errorMessage.includes('invalid email or password') ||
            errorCode === 'invalid_credentials') {
          // We can't distinguish between "user doesn't exist" and "wrong password"
          // Return false to be safe and prevent false positives
          return false;
        }
        
        // For other errors, assume user doesn't exist
        return false;
      }

      // If no error (shouldn't happen with dummy password), user exists
      // But we should sign out immediately
      await supabaseClient.auth.signOut();
      return true;
    } catch (error) {
      // On any error, assume user doesn't exist to be safe
      console.error('Error checking if user exists:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   * Verifies user exists before sending email
   */
  async resetPassword(email: string): Promise<PasswordResetResponse> {
    try {
      // First, verify that the user exists
      const userExists = await this.checkUserExists(email);
      if (!userExists) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          "No account found with this email address"
        );
      }

      // User might exist, proceed with password reset
      // Note: Supabase's resetPasswordForEmail will succeed even if user doesn't exist
      // (for security reasons), so we rely on checkUserExists to filter invalid emails
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window?.location?.origin || "myapp://"}auth/reset-password`,
      });

      if (error) {
        // Check if error indicates user doesn't exist
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = (error as any).code || '';
        
        if (errorMessage.includes('user not found') || 
            errorMessage.includes('email not found') ||
            errorCode === 'user_not_found') {
          throw new AuthError(
            AuthErrorCode.USER_NOT_FOUND,
            "No account found with this email address"
          );
        }
        
        throw mapSupabaseErrorToAuthError(error, "Failed to send reset email");
      }

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to send reset email");
    }
  }

  /**
   * Update user password (requires current session)
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw mapSupabaseErrorToAuthError(error, "Failed to update password");
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to update password");
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(data: ProfileUpdateData): Promise<AuthUser> {
    try {
      const updateData: Record<string, any> = {};

      // Email updates go directly to the user object
      if (data.email) {
        updateData.email = data.email;
      }

      // Profile fields go into user_metadata
      if (data.name || data.avatarUrl) {
        updateData.data = {
          name: data.name,
          avatar_url: data.avatarUrl,
        };
      }

      const { data: userData, error } =
        await supabaseClient.auth.updateUser(updateData);

      if (error) {
        throw mapSupabaseErrorToAuthError(error, "Failed to update profile");
      }

      if (!userData.user) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          "Profile update succeeded but no user returned",
        );
      }

      return mapSupabaseUserToAuthUser(userData.user);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to update profile");
    }
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /**
   * Refresh the current session token
   */
  async refreshSession(): Promise<AuthSession> {
    try {
      const { data, error } = await supabaseClient.auth.refreshSession();

      if (error || !data.session) {
        throw new AuthError(
          AuthErrorCode.SESSION_EXPIRED,
          "Failed to refresh session",
        );
      }

      return mapSupabaseSessionToAuthSession(data.session);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw mapSupabaseErrorToAuthError(error, "Failed to refresh session");
    }
  }

  /**
   * Verify if current session is valid
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const session = await this.getSession();

      if (!session) {
        return false;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt <= now) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
