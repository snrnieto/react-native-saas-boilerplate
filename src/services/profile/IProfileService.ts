/**
 * IProfileService Interface
 * 
 * Contract for managing extended user profile data.
 * Separated from AuthService to keep authentication pure.
 */

import type { Profile, ProfileUpdateData } from './types';

export interface IProfileService {
    /**
     * Get profile by user ID
     */
    getProfile(userId: string): Promise<Profile | null>;

    /**
     * Create profile for user
     */
    createProfile(userId: string): Promise<Profile>;

    /**
     * Update profile data
     */
    updateProfile(userId: string, data: ProfileUpdateData): Promise<Profile>;
}
