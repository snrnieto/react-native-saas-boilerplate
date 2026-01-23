/**
 * AuthProvider
 * 
 * React Provider component that injects the authentication adapter globally.
 * Manages authentication state and provides it to all child components.
 * 
 * @example
 * ```tsx
 * <AuthProvider authService={new SupabaseAuthAdapter()}>
 *   <App />
 * </AuthProvider>
 * ```
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { IAuthService } from '../../services/auth/IAuthService';
import type { AuthSession, AuthUser } from '../../services/auth/types';
import { AuthContext } from './AuthContext';

export interface AuthProviderProps {
    /**
     * Authentication service adapter to inject
     * Can be SupabaseAuthAdapter or any other implementation of IAuthService
     */
    authService: IAuthService;

    /**
     * Child components that will have access to the auth context
     */
    children: ReactNode;

    /**
     * Optional initial user (useful for SSR or hydration)
     */
    initialUser?: AuthUser | null;

    /**
     * Optional initial session (useful for SSR or hydration)
     */
    initialSession?: AuthSession | null;
}

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication context to all children.
 * Automatically syncs with the auth service's state changes.
 */
export function AuthProvider({
    authService,
    children,
    initialUser = null,
    initialSession = null,
}: AuthProviderProps) {
    // Authentication state
    const [user, setUser] = useState<AuthUser | null>(initialUser);
    const [session, setSession] = useState<AuthSession | null>(initialSession);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Computed state
    const isAuthenticated = useMemo(
        () => user !== null && session !== null,
        [user, session]
    );

    /**
     * Initialize auth state on mount
     * Fetches current user and session from the auth service
     */
    useEffect(() => {
        let isMounted = true;

        async function initializeAuth() {
            try {
                setIsLoading(true);

                // Fetch current user and session in parallel
                const [currentUser, currentSession] = await Promise.all([
                    authService.getCurrentUser(),
                    authService.getSession(),
                ]);

                if (isMounted) {
                    setUser(currentUser);
                    setSession(currentSession);
                }
            } catch (error) {
                console.error('Failed to initialize auth state:', error);
                // On error, assume not authenticated
                if (isMounted) {
                    setUser(null);
                    setSession(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, [authService]);

    /**
     * Subscribe to authentication state changes
     * Updates local state when auth events occur (sign in, sign out, etc.)
     */
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event, newSession);

            switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                case 'USER_UPDATED': {
                    // Fetch fresh user data when session changes
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                    setSession(newSession);
                    break;
                }

                case 'SIGNED_OUT': {
                    setUser(null);
                    setSession(null);
                    break;
                }

                case 'PASSWORD_RECOVERY': {
                    // Password recovery doesn't change user/session state
                    // But we might want to handle this differently in the future
                    break;
                }
            }
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [authService]);

    // ============================================
    // AUTH SERVICE METHOD WRAPPERS
    // These methods wrap the auth service and update local state
    // ============================================

    const signUp = useCallback<IAuthService['signUp']>(
        async (email, password, metadata) => {
            const response = await authService.signUp(email, password, metadata);
            // State will be updated via onAuthStateChange subscription
            return response;
        },
        [authService]
    );

    const signIn = useCallback<IAuthService['signIn']>(
        async (email, password) => {
            const response = await authService.signIn(email, password);
            // State will be updated via onAuthStateChange subscription
            return response;
        },
        [authService]
    );

    const signInWithProvider = useCallback<IAuthService['signInWithProvider']>(
        async (provider) => {
            const response = await authService.signInWithProvider(provider);
            // State will be updated via onAuthStateChange subscription
            return response;
        },
        [authService]
    );

    const signOut = useCallback<IAuthService['signOut']>(async () => {
        await authService.signOut();
        // State will be updated via onAuthStateChange subscription
    }, [authService]);

    const getCurrentUser = useCallback<IAuthService['getCurrentUser']>(async () => {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        return currentUser;
    }, [authService]);

    const getSession = useCallback<IAuthService['getSession']>(async () => {
        const currentSession = await authService.getSession();
        setSession(currentSession);
        return currentSession;
    }, [authService]);

    const resetPassword = useCallback<IAuthService['resetPassword']>(
        async (email) => {
            return authService.resetPassword(email);
        },
        [authService]
    );

    const updatePassword = useCallback<IAuthService['updatePassword']>(
        async (newPassword) => {
            return authService.updatePassword(newPassword);
        },
        [authService]
    );

    const updateProfile = useCallback<IAuthService['updateProfile']>(
        async (data) => {
            const updatedUser = await authService.updateProfile(data);
            // State will be updated via onAuthStateChange subscription
            return updatedUser;
        },
        [authService]
    );

    const refreshSession = useCallback<IAuthService['refreshSession']>(async () => {
        const newSession = await authService.refreshSession();
        // State will be updated via onAuthStateChange subscription
        return newSession;
    }, [authService]);

    const isSessionValid = useCallback<IAuthService['isSessionValid']>(async () => {
        return authService.isSessionValid();
    }, [authService]);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const contextValue = useMemo(
        () => ({
            authService,
            user,
            session,
            isLoading,
            isAuthenticated,
            signUp,
            signIn,
            signInWithProvider,
            signOut,
            getCurrentUser,
            getSession,
            resetPassword,
            updatePassword,
            updateProfile,
            refreshSession,
            isSessionValid,
        }),
        [
            authService,
            user,
            session,
            isLoading,
            isAuthenticated,
            signUp,
            signIn,
            signInWithProvider,
            signOut,
            getCurrentUser,
            getSession,
            resetPassword,
            updatePassword,
            updateProfile,
            refreshSession,
            isSessionValid,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
}
