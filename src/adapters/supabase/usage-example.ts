/**
 * Supabase Auth Adapter - Usage Example
 * 
 * This file demonstrates how to use the SupabaseAuthAdapter in your application.
 * DO NOT import this file in production code - it's for reference only.
 */

import { SupabaseAuthAdapter } from './SupabaseAuthAdapter';

// ============================================
// EXAMPLE 1: Basic Email/Password Flow
// ============================================

async function exampleSignUpAndSignIn() {
    const authService = new SupabaseAuthAdapter();

    try {
        // Sign up a new user
        console.log('Signing up...');
        const signUpResult = await authService.signUp(
            'newuser@example.com',
            'MySecurePassword123!',
            {
                name: 'John Doe',
                avatarUrl: 'https://example.com/avatar.jpg',
            }
        );
        console.log('User created:', signUpResult.user);
        console.log('Session:', signUpResult.session);

        // Sign out
        await authService.signOut();
        console.log('Signed out');

        // Sign in
        console.log('Signing in...');
        const signInResult = await authService.signIn(
            'newuser@example.com',
            'MySecurePassword123!'
        );
        console.log('Signed in:', signInResult.user);
    } catch (error) {
        console.error('Auth error:', error);
    }
}

// ============================================
// EXAMPLE 2: Session Management
// ============================================

async function exampleSessionManagement() {
    const authService = new SupabaseAuthAdapter();

    try {
        // Get current session
        const session = await authService.getSession();
        if (session) {
            console.log('Active session found:', session);
            console.log('Expires at:', session.expiresAt);
        } else {
            console.log('No active session');
        }

        // Get current user
        const user = await authService.getCurrentUser();
        if (user) {
            console.log('Logged in as:', user.email);
        } else {
            console.log('Not logged in');
        }

        // Check if session is valid
        const isValid = await authService.isSessionValid();
        console.log('Session valid:', isValid);

        // Refresh session
        if (session) {
            const newSession = await authService.refreshSession();
            console.log('Session refreshed:', newSession);
        }
    } catch (error) {
        console.error('Session error:', error);
    }
}

// ============================================
// EXAMPLE 3: Auth State Listener
// ============================================

function exampleAuthStateListener() {
    const authService = new SupabaseAuthAdapter();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((event, session) => {
        console.log('Auth event:', event);
        
        switch (event) {
            case 'SIGNED_IN':
                console.log('User signed in:', session?.user);
                break;
            case 'SIGNED_OUT':
                console.log('User signed out');
                break;
            case 'USER_UPDATED':
                console.log('User profile updated:', session?.user);
                break;
            case 'TOKEN_REFRESHED':
                console.log('Token refreshed');
                break;
            case 'PASSWORD_RECOVERY':
                console.log('Password recovery initiated');
                break;
        }
    });

    // Later: Cleanup when component unmounts
    // unsubscribe();
    
    return unsubscribe;
}

// ============================================
// EXAMPLE 4: Password Management
// ============================================

async function examplePasswordManagement() {
    const authService = new SupabaseAuthAdapter();

    try {
        // Send password reset email
        const resetResult = await authService.resetPassword('user@example.com');
        console.log(resetResult.message);

        // Update password (must be signed in)
        await authService.updatePassword('MyNewSecurePassword456!');
        console.log('Password updated successfully');
    } catch (error) {
        console.error('Password error:', error);
    }
}

// ============================================
// EXAMPLE 5: Profile Update
// ============================================

async function exampleProfileUpdate() {
    const authService = new SupabaseAuthAdapter();

    try {
        // Update user profile
        const updatedUser = await authService.updateProfile({
            name: 'Jane Doe',
            avatarUrl: 'https://example.com/new-avatar.jpg',
            // email: 'newemail@example.com', // Optional: update email
        });
        console.log('Profile updated:', updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
    }
}

// ============================================
// EXAMPLE 6: Error Handling
// ============================================

async function exampleErrorHandling() {
    const authService = new SupabaseAuthAdapter();

    try {
        await authService.signIn('wrong@example.com', 'wrongpassword');
    } catch (error) {
        // Error is already typed as AuthError with AuthErrorCode
        if (error instanceof Error) {
            console.error('Error code:', (error as any).code);
            console.error('Error message:', error.message);
            
            // Handle specific error codes
            switch ((error as any).code) {
                case 'INVALID_CREDENTIALS':
                    console.log('Show "Invalid email or password" message');
                    break;
                case 'EMAIL_NOT_CONFIRMED':
                    console.log('Show "Please verify your email" message');
                    break;
                case 'NETWORK_ERROR':
                    console.log('Show "Check your internet connection" message');
                    break;
                default:
                    console.log('Show generic error message');
            }
        }
    }
}

// ============================================
// EXAMPLE 7: React Hook Integration (Preview)
// ============================================

/*
// This is how you might use it in a React component/hook:

import { useState, useEffect } from 'react';
import { SupabaseAuthAdapter } from './index';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const authService = new SupabaseAuthAdapter();

    useEffect(() => {
        // Check initial session
        authService.getCurrentUser().then((user) => {
            setUser(user);
            setLoading(false);
        });

        // Listen to auth changes
        const unsubscribe = authService.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => unsubscribe();
    }, []);

    return {
        user,
        loading,
        signUp: authService.signUp.bind(authService),
        signIn: authService.signIn.bind(authService),
        signOut: authService.signOut.bind(authService),
    };
}
*/

// ============================================
// EXPORT (for testing only)
// ============================================

export {
    exampleAuthStateListener, exampleErrorHandling, examplePasswordManagement,
    exampleProfileUpdate, exampleSessionManagement, exampleSignUpAndSignIn
};
