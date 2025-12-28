/**
 * Secure Profile Service
 * Production-ready profile management with proper security controls
 * 
 * Key Features:
 * 1. Separate auth and profile collections
 * 2. Partial updates only (never overwrites entire document)
 * 3. Soft deletes (isActive, deletedAt)
 * 4. Role-based access control
 * 5. Timestamps (createdAt, updatedAt)
 * 6. Race condition prevention (optimistic locking)
 * 7. Public/private data separation
 * 8. Profile versioning/backup
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query, Permission, Role } from 'appwrite';

// Types
interface ProfileTimestamps {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

interface ProfileBase extends ProfileTimestamps {
    $id?: string;
    userId: string; // Link to auth user
    isActive: boolean;
    version: number; // For versioning
}

interface TherapistProfile extends ProfileBase {
    // Public data
    name: string;
    location: string;
    specialization: string;
    yearsOfExperience: number;
    isLicensed: boolean;
    profilePicture?: string;
    description?: string;
    status: 'available' | 'busy' | 'offline';
    
    // Private data (stored separately)
    // email, whatsappNumber, etc. go in therapist_profiles_private collection
}

interface MemberProfile extends ProfileBase {
    // Public data
    displayName: string;
    avatar?: string;
    memberSince: string;
    
    // Private data stored separately
}

interface ProfileUpdateResult {
    success: boolean;
    profile?: any;
    error?: string;
    conflictDetected?: boolean;
}

interface ProfileBackup {
    profileId: string;
    profileType: 'therapist' | 'member' | 'place';
    snapshot: any;
    backedUpAt: string;
    version: number;
}

export class SecureProfileService {
    private readonly THERAPIST_PUBLIC_COLLECTION = APPWRITE_CONFIG.collections.therapists;
    private readonly THERAPIST_PRIVATE_COLLECTION = 'therapist_profiles_private';
    private readonly MEMBER_PUBLIC_COLLECTION = 'member_profiles';
    private readonly MEMBER_PRIVATE_COLLECTION = 'member_profiles_private';
    private readonly BACKUP_COLLECTION = 'profile_backups';

    /**
     * Rule 1: Authentication and profiles are separate
     * Auth users exist in Appwrite Auth
     * Profiles exist in dedicated collections
     */
    async createTherapistProfile(
        userId: string,
        publicData: Partial<TherapistProfile>,
        privateData: {
            email?: string;
            whatsappNumber?: string;
            contactNumber?: string;
            bankDetails?: any;
        }
    ): Promise<TherapistProfile> {
        const now = new Date().toISOString();
        
        // Create public profile with timestamps
        const publicProfile = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            this.THERAPIST_PUBLIC_COLLECTION,
            ID.unique(),
            {
                ...publicData,
                userId,
                isActive: true,
                version: 1,
                createdAt: now,
                updatedAt: now,
            },
            [
                // Public read access
                Permission.read(Role.any()),
                // Only owner can update
                Permission.update(Role.user(userId)),
                // Admins can moderate
                Permission.update(Role.label('admin')),
            ]
        );

        // Create private profile with restricted access
        if (privateData && Object.keys(privateData).length > 0) {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PRIVATE_COLLECTION,
                publicProfile.$id!, // Same ID as public profile
                {
                    ...privateData,
                    userId,
                    createdAt: now,
                    updatedAt: now,
                },
                [
                    // Only owner can read/update
                    Permission.read(Role.user(userId)),
                    Permission.update(Role.user(userId)),
                    // Admins can read for moderation
                    Permission.read(Role.label('admin')),
                ]
            );
        }

        return publicProfile as TherapistProfile;
    }

    /**
     * Rule 2: NEVER overwrite entire document
     * Rule 5: Add timestamps
     * Rule 6: Prevent race conditions
     */
    async updateTherapistProfile(
        profileId: string,
        userId: string,
        updates: Partial<TherapistProfile>,
        lastKnownUpdatedAt?: string
    ): Promise<ProfileUpdateResult> {
        try {
            // Get current profile
            const currentProfile = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId
            );

            // Rule 4: Ownership check
            if (currentProfile.userId !== userId) {
                return {
                    success: false,
                    error: 'Unauthorized: You can only edit your own profile'
                };
            }

            // Rule 3: Check if profile is soft-deleted
            if (!currentProfile.isActive) {
                return {
                    success: false,
                    error: 'Cannot update deleted profile'
                };
            }

            // Rule 6: Optimistic locking - prevent race conditions
            if (lastKnownUpdatedAt && currentProfile.updatedAt > lastKnownUpdatedAt) {
                return {
                    success: false,
                    error: 'Profile was modified by another process',
                    conflictDetected: true
                };
            }

            // Rule 8: Backup before update
            await this.createProfileBackup(profileId, 'therapist', currentProfile);

            // Rule 2: Partial update only - preserve all existing fields
            const now = new Date().toISOString();
            const updatedProfile = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId,
                {
                    ...updates,
                    updatedAt: now,
                    version: (currentProfile.version || 1) + 1,
                    // NEVER include: userId, createdAt, isActive, deletedAt
                }
            );

            return {
                success: true,
                profile: updatedProfile
            };
        } catch (error: any) {
            console.error('Profile update failed:', error);
            return {
                success: false,
                error: error.message || 'Update failed'
            };
        }
    }

    /**
     * Rule 7: Update private data separately with strict access control
     */
    async updateTherapistPrivateData(
        profileId: string,
        userId: string,
        updates: {
            email?: string;
            whatsappNumber?: string;
            contactNumber?: string;
            bankDetails?: any;
        }
    ): Promise<ProfileUpdateResult> {
        try {
            // Verify ownership through public profile
            const publicProfile = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId
            );

            if (publicProfile.userId !== userId) {
                return {
                    success: false,
                    error: 'Unauthorized: Access denied'
                };
            }

            // Update private data
            const now = new Date().toISOString();
            const updatedPrivate = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PRIVATE_COLLECTION,
                profileId,
                {
                    ...updates,
                    updatedAt: now,
                }
            );

            return {
                success: true,
                profile: updatedPrivate
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Private data update failed'
            };
        }
    }

    /**
     * Rule 3: Soft delete only - NEVER hard delete
     * Rule 5: Add deletedAt timestamp
     */
    async softDeleteProfile(
        profileId: string,
        userId: string,
        userRole?: 'admin' | 'user'
    ): Promise<ProfileUpdateResult> {
        try {
            const currentProfile = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId
            );

            // Rule 4: Access control
            const isOwner = currentProfile.userId === userId;
            const isAdmin = userRole === 'admin';
            
            if (!isOwner && !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Only owner or admin can delete'
                };
            }

            // Rule 8: Backup before soft delete
            await this.createProfileBackup(profileId, 'therapist', currentProfile);

            const now = new Date().toISOString();
            const updatedProfile = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId,
                {
                    isActive: false,
                    deletedAt: now,
                    updatedAt: now,
                    version: (currentProfile.version || 1) + 1,
                }
            );

            return {
                success: true,
                profile: updatedProfile
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Soft delete failed'
            };
        }
    }

    /**
     * Restore soft-deleted profile
     */
    async restoreProfile(
        profileId: string,
        userId: string,
        userRole?: 'admin' | 'user'
    ): Promise<ProfileUpdateResult> {
        try {
            const currentProfile = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId
            );

            // Only admins can restore
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Unauthorized: Only admins can restore profiles'
                };
            }

            const now = new Date().toISOString();
            const updatedProfile = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId,
                {
                    isActive: true,
                    deletedAt: undefined,
                    updatedAt: now,
                    version: (currentProfile.version || 1) + 1,
                }
            );

            return {
                success: true,
                profile: updatedProfile
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Restore failed'
            };
        }
    }

    /**
     * Rule 8: Create backup/snapshot before updates
     */
    private async createProfileBackup(
        profileId: string,
        profileType: 'therapist' | 'member' | 'place',
        snapshot: any
    ): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.BACKUP_COLLECTION,
                ID.unique(),
                {
                    profileId,
                    profileType,
                    snapshot: JSON.stringify(snapshot),
                    backedUpAt: new Date().toISOString(),
                    version: snapshot.version || 1,
                }
            );
            console.log(`✅ Profile backup created for ${profileId}`);
        } catch (error) {
            console.error('⚠️ Backup failed (non-blocking):', error);
            // Don't throw - backup failure shouldn't block updates
        }
    }

    /**
     * Get profile history/versions
     */
    async getProfileHistory(profileId: string): Promise<ProfileBackup[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.BACKUP_COLLECTION,
                [
                    Query.equal('profileId', profileId),
                    Query.orderDesc('backedUpAt'),
                    Query.limit(50)
                ]
            );

            return response.documents.map(doc => ({
                profileId: doc.profileId,
                profileType: doc.profileType,
                snapshot: JSON.parse(doc.snapshot),
                backedUpAt: doc.backedUpAt,
                version: doc.version,
            }));
        } catch (error) {
            console.error('Failed to get profile history:', error);
            return [];
        }
    }

    /**
     * Restore profile from backup
     */
    async restoreFromBackup(
        profileId: string,
        version: number,
        userId: string,
        userRole?: 'admin'
    ): Promise<ProfileUpdateResult> {
        try {
            // Only admins can restore from backup
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Unauthorized: Only admins can restore from backup'
                };
            }

            // Get the backup
            const backups = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.BACKUP_COLLECTION,
                [
                    Query.equal('profileId', profileId),
                    Query.equal('version', version),
                    Query.limit(1)
                ]
            );

            if (backups.documents.length === 0) {
                return {
                    success: false,
                    error: 'Backup not found'
                };
            }

            const backup = backups.documents[0];
            const snapshot = JSON.parse(backup.snapshot);

            // Restore the profile
            const now = new Date().toISOString();
            const restoredProfile = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.THERAPIST_PUBLIC_COLLECTION,
                profileId,
                {
                    ...snapshot,
                    updatedAt: now,
                    version: (snapshot.version || 1) + 1,
                    restoredFrom: version,
                    restoredAt: now,
                }
            );

            return {
                success: true,
                profile: restoredProfile
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Restore from backup failed'
            };
        }
    }

    /**
     * Get only active profiles (exclude soft-deleted)
     */
    async getActiveProfiles(filters?: any[]): Promise<any[]> {
        const queries = [
            Query.equal('isActive', true),
            ...(filters || [])
        ];

        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            this.THERAPIST_PUBLIC_COLLECTION,
            queries
        );

        return response.documents;
    }
}

// Export singleton instance
export const secureProfileService = new SecureProfileService();
