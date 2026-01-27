/**
 * Supabase Profile Adapter
 * 
 * Implementation of IProfileService using Supabase.
 */

import type { IProfileService } from '../../services/profile/IProfileService';
import type { Profile, ProfileUpdateData } from '../../services/profile/types';
import { supabaseClient } from '../supabase/client';

export class SupabaseProfileAdapter implements IProfileService {

    async getProfile(userId: string): Promise<Profile | null> {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // If code is PGRST116, it means no rows returned (profile doesn't exist)
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Error fetching profile:', error);
                throw error;
            }

            return this.mapResponseToProfile(data);
        } catch (error) {
            // If it's a known "no rows" error, return null
            if ((error as any)?.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
    }

    async createProfile(userId: string): Promise<Profile> {
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert({
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            throw error;
        }

        return this.mapResponseToProfile(data);
    }

    async updateProfile(userId: string, data: ProfileUpdateData): Promise<Profile> {
        // Map camelCase to snake_case for DB
        const dbData: any = {};
        if (data.bio !== undefined) dbData.bio = data.bio;
        if (data.phone !== undefined) dbData.phone = data.phone;
        if (data.avatarUrl !== undefined) dbData.avatar_url = data.avatarUrl;
        if (data.preferences !== undefined) dbData.preferences = data.preferences;

        dbData.updated_at = new Date().toISOString();

        const { data: updatedProfile, error } = await supabaseClient
            .from('profiles')
            .update(dbData)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }

        return this.mapResponseToProfile(updatedProfile);
    }

    private mapResponseToProfile(data: any): Profile {
        return {
            id: data.id,
            userId: data.user_id,
            bio: data.bio,
            phone: data.phone,
            avatarUrl: data.avatar_url,
            preferences: data.preferences,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
}
