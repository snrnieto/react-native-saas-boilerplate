/**
 * AuthGuard Component
 * 
 * Protects routes by checking authentication status.
 * Redirects to /login if user is not authenticated.
 * 
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */

import { useAuth } from '@/src/providers/auth';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export interface AuthGuardProps {
    children: React.ReactNode;
    /**
     * Routes that don't require authentication
     * @default ['login', 'signup', 'reset-password']
     */
    publicRoutes?: string[];
    /**
     * Redirect path when not authenticated
     * @default '/login'
     */
    redirectTo?: string;
}

/**
 * AuthGuard Component
 * 
 * Wraps protected routes and redirects unauthenticated users to login.
 * Shows loading state while checking authentication.
 * 
 * Works on both web and mobile by using multiple navigation methods.
 */
export function AuthGuard({
    children,
    publicRoutes = ['login', 'signup', 'reset-password'],
    redirectTo = '/login',
}: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();
    const [hasRedirected, setHasRedirected] = useState(false);

    // Determine current route using multiple methods for better mobile compatibility
    const getCurrentRoute = () => {
        // Try pathname first (more reliable on mobile)
        if (pathname) {
            const cleanPath = pathname.replace(/^\//, '').split('/')[0];
            return cleanPath || 'index';
        }

        // Fallback to segments
        if (segments && segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            // Remove parentheses from route groups like "(tabs)"
            return lastSegment.replace(/[()]/g, '') || 'index';
        }

        return 'index';
    };

    const currentRoute = getCurrentRoute();
    const routePath = pathname || segments.join('/') || '';
    const isPublicRoute = publicRoutes.some(route => {
        const routeMatch = routePath.includes(route) ||
            currentRoute === route ||
            segments.some(seg => seg.includes(route));
        return routeMatch;
    });

    // Debug logging (remove in production)
    useEffect(() => {
        console.log('[AuthGuard] State:', {
            isLoading,
            isAuthenticated,
            currentRoute,
            routePath,
            segments: segments.join('/'),
            isPublicRoute,
            hasRedirected,
        });
    }, [isLoading, isAuthenticated, currentRoute, routePath, segments, isPublicRoute, hasRedirected]);

    useEffect(() => {
        // Don't redirect while loading
        if (isLoading) {
            setHasRedirected(false);
            return;
        }

        // If user is not authenticated and trying to access protected route
        if (!isAuthenticated && !isPublicRoute) {
            // Only redirect if not already on login page and haven't redirected yet
            if (currentRoute !== 'login' && !routePath.includes('login') && !hasRedirected) {
                setHasRedirected(true);
                // Use both methods for better compatibility
                try {
                    router.replace(redirectTo as any);
                } catch (error) {
                    console.warn('Router replace failed, trying push:', error);
                    router.push(redirectTo as any);
                }
            }
            return;
        }

        // If user is authenticated and on login page, redirect to home
        if (isAuthenticated && (currentRoute === 'login' || routePath.includes('login'))) {
            if (!hasRedirected) {
                setHasRedirected(true);
                try {
                    router.replace('/(tabs)' as any);
                } catch (error) {
                    console.warn('Router replace failed, trying push:', error);
                    router.push('/(tabs)' as any);
                }
            }
            return;
        }

        // Reset redirect flag if we're on a valid route
        if ((isAuthenticated && !routePath.includes('login')) ||
            (!isAuthenticated && isPublicRoute)) {
            setHasRedirected(false);
        }
    }, [isAuthenticated, isLoading, currentRoute, routePath, isPublicRoute, redirectTo, router, hasRedirected]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading...
                </Text>
            </View>
        );
    }

    // If not authenticated and on a public route, allow access
    if (!isAuthenticated && isPublicRoute) {
        return <>{children}</>;
    }

    // If authenticated, allow access to all routes (except login, which will redirect)
    if (isAuthenticated) {
        // If on login page, the redirect will happen in useEffect
        if (currentRoute === 'login' || routePath.includes('login')) {
            return (
                <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                    <ActivityIndicator size="large" />
                </View>
            );
        }
        return <>{children}</>;
    }

    // If not authenticated and not on public route, show loading (redirect will happen)
    return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
            <ActivityIndicator size="large" />
        </View>
    );
}
