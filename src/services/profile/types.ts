/**
 * Profile service types
 * Types for user profile management
 */

// ============================================
// PROFILE TYPES
// ============================================

/**
 * User profile data (matches Prisma Profile model)
 */
export interface Profile {
    id: string;
    userId: string;
    bio: string | null;
    phone: string | null;
    avatarUrl: string | null;
    preferences: Record<string, any> | null;
    createdAt: string; // ISO 8601 datetime string
    updatedAt: string; // ISO 8601 datetime string
}

/**
 * Data for creating a new profile
 */
export interface ProfileCreateData {
    userId: string;
    bio?: string;
    phone?: string;
    avatarUrl?: string;
    preferences?: Record<string, any>;
}

/**
 * Data for updating an existing profile
 */
export interface ProfileUpdateData {
    bio?: string;
    phone?: string;
    avatarUrl?: string;
    preferences?: Record<string, any>;
}
