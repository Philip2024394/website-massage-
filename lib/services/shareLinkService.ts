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
    // Stored type must match Appwrite schema enum values
    linkedItemType: 'therapist' | 'place';
    shortId: string;               // e.g., "12345"
    slug: string;                  // e.g., "budi-massage-ubud"
    // Mirror of linkedItemType for convenience in queries
    entityType: 'therapist' | 'place';
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
     * Normalize input entity type to a storage-safe value supported by Appwrite schema.
     * Appwrite collection allows: user, therapist, place, hotel, agent. We map "facial" to "place".
     */
    private normalizeTypeForStorage(type: 'therapist' | 'place' | 'facial'): 'therapist' | 'place' {
        if (type === 'facial') return 'place';
        return type;
    }

    /**
     * Generate slug from name with Indonesian SEO keywords
     */
    private generateSlug(name: string, type: string, city?: string): string {
        // Indonesian keyword mapping for cities
        const cityKeywords: Record<string, string> = {
            'Bali': 'pijat-bali',
            'Ubud': 'pijat-ubud',
            'Seminyak': 'pijat-seminyak',
            'Canggu': 'pijat-canggu',
            'Sanur': 'pijat-sanur',
            'Nusa Dua': 'pijat-nusa-dua',
            'Kuta': 'pijat-kuta',
            'Denpasar': 'pijat-denpasar',
            'Jakarta': 'pijat-jakarta',
            'Jakarta Selatan': 'pijat-jakarta-selatan',
            'Jakarta Pusat': 'pijat-jakarta-pusat',
            'Jakarta Barat': 'pijat-jakarta-barat',
            'Jakarta Timur': 'pijat-jakarta-timur',
            'Jakarta Utara': 'pijat-jakarta-utara',
            'Bandung': 'pijat-bandung',
            'Surabaya': 'pijat-surabaya',
            'Yogyakarta': 'pijat-jogja',
            'Semarang': 'pijat-semarang',
            'Medan': 'pijat-medan',
            'Makassar': 'pijat-makassar',
            'Bogor': 'pijat-bogor',
            'Depok': 'pijat-depok',
            'Tangerang': 'pijat-tangerang',
            'Bekasi': 'pijat-bekasi',
            'Malang': 'pijat-malang',
            'Palembang': 'pijat-palembang',
            'Pekanbaru': 'pijat-pekanbaru',
            'Balikpapan': 'pijat-balikpapan',
            'Lombok': 'pijat-lombok',
            'Batam': 'pijat-batam',
            'Manado': 'pijat-manado',
            'Jimbaran': 'pijat-jimbaran',
            'Legian': 'pijat-legian'
        };
        
        const baseName = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        
        // Get Indonesian keyword for city if available
        let cityKeyword = '';
        if (city) {
            // Check exact match first
            cityKeyword = cityKeywords[city] || '';
            
            // If no exact match, check if city contains any of the keywords
            if (!cityKeyword) {
                for (const [key, keyword] of Object.entries(cityKeywords)) {
                    if (city.toLowerCase().includes(key.toLowerCase())) {
                        cityKeyword = keyword;
                        break;
                    }
                }
            }
            
            // If still no match, create from city name
            if (!cityKeyword) {
                cityKeyword = 'pijat-' + city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            }
        }
        
        // Format: pijat-{city}-{name} for SEO
        // Example: pijat-bali-surtiningsih, pijat-jakarta-budi
        const slug = cityKeyword 
            ? `${cityKeyword}-${baseName}`
            : `pijat-${baseName}`;
        
        return slug.substring(0, 100);
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
            const storageType = this.normalizeTypeForStorage(entityType);
            
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
                linkedItemType: storageType,
                shortId,
                slug: finalSlug,
                entityType: storageType,
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
            const storageType = this.normalizeTypeForStorage(
                (entityType as 'therapist' | 'place' | 'facial')
            );
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('linkedItemType', storageType),
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
