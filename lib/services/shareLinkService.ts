/**
 * Share Link Service
 * Manages short share links for therapists, places, and facial places
 */

import { databases } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { Query } from 'appwrite';

export interface ShareLink {
    $id?: string;
    linkId: string;                // Full URL
    linkedItemId: string;          // Entity ID (your schema)
    linkedItemType: 'therapist' | 'place' | 'facial';  // Enum type
    shortId: string;               // e.g., "12345"
    slug: string;                  // e.g., "budi-massage-ubud"
    entityType: 'therapist' | 'place' | 'facial';  // Matches linkedItemType
    entityId: string;              // Full Appwrite ID (duplicate of linkedItemId)
    entityName?: string;           // Cached name
    isActive: boolean;
    clickCount?: number;
    accessCount?: number;          // Your additional field
    createdAt: string;
    updatedAt?: string;
    expiryDate?: string;           // Your additional field
    $createdAt?: string;
    $updatedAt?: string;
}

class ShareLinkService {
    private get collectionId(): string {
        return APPWRITE_CONFIG.collections.share_links;
    }
    /**
     * Generate a unique short ID (5-6 digit number)
     */
    private async generateShortId(): Promise<string> {
        const min = 10000;
        const max = 999999;
        
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const shortId = Math.floor(Math.random() * (max - min + 1) + min).toString();
            
            // Check if this ID already exists
            const exists = await this.checkShortIdExists(shortId);
            if (!exists) {
                return shortId;
            }
            
            attempts++;
        }
        
        throw new Error('Failed to generate unique short ID after ' + maxAttempts + ' attempts');
    }
    
    /**
     * Check if a short ID already exists
     */
    private async checkShortIdExists(shortId: string): Promise<boolean> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [Query.equal('shortId', shortId)]
            );
            return response.documents.length > 0;
        } catch (error) {
            console.error('Error checking short ID:', error);
            return false;
        }
    }
    
    /**
     * Generate slug from name
     */
    private generateSlug(name: string, type: string, city?: string): string {
        const baseName = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        
        const cityPart = city 
            ? '-' + city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
            : '';
        
        return `${baseName}${cityPart}`.substring(0, 100);
    }
    
    /**
     * Create a share link for an entity
     */
    async createShareLink(
        entityType: 'therapist' | 'place' | 'facial',
        entityId: string,
        entityName: string,
        city?: string
    ): Promise<ShareLink> {
        try {
            const shortId = await this.generateShortId();
            const slug = this.generateSlug(entityName, entityType, city);
            
            // Check if slug exists and make it unique if needed
            let finalSlug = slug;
            let slugAttempt = 0;
            while (await this.checkSlugExists(finalSlug)) {
                slugAttempt++;
                finalSlug = `${slug}-${slugAttempt}`;
            }
            
            const shareLink: Omit<ShareLink, '$id' | '$createdAt' | '$updatedAt'> = {
                linkId: `https://www.indastreetmassage.com/share/${shortId}`,
                linkedItemId: entityId,
                linkedItemType: entityType,
                shortId,
                slug: finalSlug,
                entityType,
                entityId,
                entityName,
                isActive: true,
                clickCount: 0,
                accessCount: 0,
                createdAt: new Date().toISOString()
            };
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                'unique()',
                shareLink
            );
            
            console.log('✅ Share link created:', {
                shortId: `#${shortId}`,
                slug: finalSlug,
                entity: entityName
            });
            
            return response as ShareLink;
        } catch (error) {
            console.error('❌ Failed to create share link:', error);
            throw error;
        }
    }
    
    /**
     * Check if slug exists
     */
    private async checkSlugExists(slug: string): Promise<boolean> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [Query.equal('slug', slug)]
            );
            return response.documents.length > 0;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Get entity by short ID or slug
     */
    async getByShortIdOrSlug(identifier: string): Promise<ShareLink | null> {
        try {
            // Remove # if present
            const cleanId = identifier.replace('#', '');
            
            // Try short ID first (if it's numeric)
            if (/^\d+$/.test(cleanId)) {
                const response = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    this.collectionId,
                    [
                        Query.equal('shortId', cleanId),
                        Query.equal('isActive', true)
                    ]
                );
                
                if (response.documents.length > 0) {
                    await this.incrementClickCount(response.documents[0].$id);
                    return response.documents[0] as ShareLink;
                }
            }
            
            // Try slug
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('slug', cleanId),
                    Query.equal('isActive', true)
                ]
            );
            
            if (response.documents.length > 0) {
                await this.incrementClickCount(response.documents[0].$id);
                return response.documents[0] as ShareLink;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Failed to get share link:', error);
            return null;
        }
    }
    
    /**
     * Get share link for an entity
     */
    async getByEntity(entityType: string, entityId: string): Promise<ShareLink | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('linkedItemType', entityType),
                    Query.equal('linkedItemId', entityId),
                    Query.equal('isActive', true)
                ]
            );
            
            if (response.documents.length > 0) {
                return response.documents[0] as ShareLink;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Failed to get share link by entity:', error);
            return null;
        }
    }
    
    /**
     * Increment click count
     */
    private async incrementClickCount(documentId: string): Promise<void> {
        try {
            const doc = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                documentId
            );
            
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                documentId,
                {
                    clickCount: (doc.clickCount || 0) + 1,
                    accessCount: (doc.accessCount || 0) + 1,
                    updatedAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.warn('Failed to increment click count:', error);
        }
    }
    
    /**
     * Update share link
     */
    async updateShareLink(documentId: string, updates: Partial<ShareLink>): Promise<ShareLink> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                documentId,
                {
                    ...updates,
                    updatedAt: new Date().toISOString()
                }
            );
            
            return response as ShareLink;
        } catch (error) {
            console.error('❌ Failed to update share link:', error);
            throw error;
        }
    }
    
    /**
     * Deactivate share link
     */
    async deactivateShareLink(documentId: string): Promise<void> {
        try {
            await this.updateShareLink(documentId, { isActive: false });
            console.log('✅ Share link deactivated');
        } catch (error) {
            console.error('❌ Failed to deactivate share link:', error);
            throw error;
        }
    }
    
    /**
     * Get or create share link for entity
     */
    async getOrCreateShareLink(
        entityType: 'therapist' | 'place' | 'facial',
        entityId: string,
        entityName: string,
        city?: string
    ): Promise<ShareLink> {
        // Try to get existing link
        const existing = await this.getByEntity(entityType, entityId);
        if (existing) {
            return existing;
        }
        
        // Create new link
        return await this.createShareLink(entityType, entityId, entityName, city);
    }
}

export const shareLinkService = new ShareLinkService();
