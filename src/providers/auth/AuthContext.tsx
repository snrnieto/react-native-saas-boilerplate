/**
 * AuthContext
 * 
 * React Context for authentication state management.
 * Provides access to the auth service and current user/session state.
 */

import { createContext, useContext } from 'react';
import type { IAuthService } from '../../services/auth/IAuthService';
import type { AuthSession, AuthUser } from '../../services/auth/types';

/**
 * Authentication context value
 */
export interface AuthContextValue {
    // Auth service instance
    authService: IAuthService;

    // Current authentication state
    user: AuthUser | null;
    session: AuthSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Auth service methods (convenience access)
    signUp: IAuthService['signUp'];
    signIn: IAuthService['signIn'];
    signInWithProvider: IAuthService['signInWithProvider'];
    signOut: IAuthService['signOut'];
    getCurrentUser: IAuthService['getCurrentUser'];
    getSession: IAuthService['getSession'];
    resetPassword: IAuthService['resetPassword'];
    updatePassword: IAuthService['updatePassword'];
    updateProfile: IAuthService['updateProfile'];
    refreshSession: IAuthService['refreshSession'];
    isSessionValid: IAuthService['isSessionValid'];
}

/**
 * Auth Context
 * 
 * @throws Error if used outside of AuthProvider
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook to access the authentication context
 * 
 * @returns AuthContextValue
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, signIn, signOut } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
