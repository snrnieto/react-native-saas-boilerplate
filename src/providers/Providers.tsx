/**
 * Providers - Centralized Integration Point
 * 
 * This file centralizes all provider integrations and adapter instantiations.
 * This makes it easy to swap adapters (e.g., Supabase -> Firebase) or add new providers.
 * 
 * To swap an adapter:
 * 1. Import the new adapter
 * 2. Replace the instantiation in the corresponding section
 * 3. All components using the context will automatically use the new adapter
 */

import { useMemo, type ReactNode } from 'react';
import { SupabaseAuthAdapter } from '../adapters/supabase';
import { ToastProvider } from '../ui/components/Toast/ToastContext';
import { ThemeProvider } from '../ui/ThemeProvider';
import { AuthProvider } from './auth';
import { ProfileProvider } from './profile/ProfileContext';

// TODO: Future adapters can be imported here
// import { FirebaseAuthAdapter } from '../adapters/firebase';
// import { Auth0AuthAdapter } from '../adapters/auth0';

export interface ProvidersProps {
    children: ReactNode;
}

/**
 * AppProviders Component
 * 
 * Centralizes all provider integrations for the application.
 * 
 * Current Integrations:
 * - AuthProvider: Authentication service (currently using SupabaseAuthAdapter)
 * 
 * To add a new provider:
 * 1. Import the provider component
 * 2. Import/create the adapter/service instance
 * 3. Add it to the provider tree below
 */
export function AppProviders({ children }: ProvidersProps) {
    // ============================================
    // ADAPTER INSTANTIATIONS
    // ============================================
    // Create adapter instances here
    // Using useMemo to ensure single instance per render cycle

    /**
     * Authentication Adapter
     * 
     * Current: SupabaseAuthAdapter
     * 
     * To swap to a different auth provider:
     * 1. Import the new adapter (e.g., FirebaseAuthAdapter)
     * 2. Replace SupabaseAuthAdapter with the new adapter
     * 
     * Example:
     * const authService = useMemo(() => new FirebaseAuthAdapter(), []);
     */
    const authService = useMemo(() => new SupabaseAuthAdapter(), []);

    // TODO: Future adapter instantiations
    // const billingService = useMemo(() => new PaddleAdapter(), []); // Web
    // const billingService = useMemo(() => new RevenueCatAdapter(), []); // Native
    // const analyticsService = useMemo(() => new MixpanelAdapter(), []);

    // ============================================
    // PROVIDER COMPOSITION
    // ============================================
    // Compose all providers here
    // Order matters: inner providers can depend on outer providers

    return (
        <ThemeProvider>
            <AuthProvider authService={authService}>
                <ProfileProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </ProfileProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
