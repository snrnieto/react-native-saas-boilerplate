/**
 * ProfileContext
 * 
 * Provides access to user profile data (bio, phone, etc.) separately from auth.
 */

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SupabaseProfileAdapter } from '../../adapters/supabase/SupabaseProfileAdapter';
import type { IProfileService } from '../../services/profile/IProfileService';
import type { Profile, ProfileUpdateData } from '../../services/profile/types';
import { useAuth } from '../auth';

interface ProfileContextValue {
    profile: Profile | null;
    isLoading: boolean;
    error: Error | null;
    updateProfile: (data: ProfileUpdateData) => Promise<Profile | null>;
    refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// Instantiate adapter once
// In a real DI system, this would be injected
const profileService: IProfileService = new SupabaseProfileAdapter();

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Fetch profile when auth user changes
    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            if (!user) {
                if (isMounted) setProfile(null);
                return;
            }

            try {
                if (isMounted) setIsLoading(true);
                const data = await profileService.getProfile(user.id);

                if (isMounted) {
                    // If no profile exists, try to create one or just leave as null?
                    // Implementation Plan said "getProfile", for now let's leave as null
                    // or auto-create if we want robust UX. 
                    // Let's assume we want to show empty fields if no profile.
                    setProfile(data);

                    // Optional: If data is null, maybe we want to create one? 
                    // For now, simple fetch.
                }
            } catch (err: any) {
                console.error('Failed to load profile', err);
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const updateProfile = async (data: ProfileUpdateData): Promise<Profile | null> => {
        if (!user) return null;

        try {
            setIsLoading(true);

            // Check if profile exists first. If not, create then update, or insert with data.
            // But our Adapter.updateProfile uses .update() which needs row.
            // Simplest strategy: Try update. If 0 rows (implied refactor needed in adapter?), insert.
            // Our SupabaseProfileAdapter.updateProfile does a straight update.

            // Let's handle the "profile doesn't exist" case gracefully.
            // If profile is null, we might need to create it first.

            let currentProfile = profile;

            if (!currentProfile) {
                // Try to create blank
                try {
                    currentProfile = await profileService.createProfile(user.id);
                } catch (e) {
                    // race condition or error
                }
            }

            const updated = await profileService.updateProfile(user.id, data);
            setProfile(updated);
            return updated;
        } catch (err: any) {
            console.error('Failed to update profile', err);
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const data = await profileService.getProfile(user.id);
            setProfile(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProfileContext.Provider value={{
            profile,
            isLoading,
            error,
            updateProfile,
            refreshProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
