/**
 * ============================================================================
 * 🏨 INDASTREET PARTNERS SERVICE - HOTELS & VILLAS APPWRITE INTEGRATION
 * ============================================================================
 * 
 * Complete service for managing hotel and villa partner data with Appwrite:
 * - Full data synchronization (including images)
 * - Image upload and management
 * - Partner verification system
 * - Real-time data updates
 * - Search and filtering
 */

import { databases, storage, DATABASE_ID, ID, Query, Permission, Role } from '../lib/appwrite';

// ============================================================================
// COLLECTION CONFIGURATION
// ============================================================================

export const PARTNERS_COLLECTION_ID = 'indastreet_partners'; // Main partners collection
export const PARTNERS_IMAGES_BUCKET_ID = 'partner_images'; // Image storage bucket

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PartnerData {
    id?: string;
    name: string;
    websiteUrl?: string;
    websiteTitle?: string;
    description?: string;
    category: 'therapist' | 'massage-place' | 'hotel' | 'villa' | 'gym';
    location?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    verified: boolean;
    rating?: number;
    imageUrl?: string;
    imageFileId?: string; // Appwrite file ID for images
    specialties?: string[];
    amenities?: string[];
    priceRange?: 'budget' | 'mid-range' | 'luxury';
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    socialMedia?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
    };
    businessHours?: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
    };
    contactPerson?: string;
    licenseNumber?: string;
    taxId?: string;
    joinedDate?: string;
    lastUpdated?: string;
    isActive?: boolean;
    commissionRate?: number; // Percentage for bookings
    featuredUntil?: string; // Premium listing expiry
    websitePreview?: string;
    metadata?: Record<string, any>;
}

export interface PartnerImage {
    file: File;
    caption?: string;
    isMain?: boolean;
}

// ============================================================================
// PARTNERS SERVICE CLASS
// ============================================================================

class IndastreetPartnersService {
    
    /**
     * Initialize partners collection and storage bucket
     */
    async initializePartnersSystem(): Promise<boolean> {
        try {
            console.log('🏨 Initializing Indastreet Partners System...');
            
            // Test database connection
            await databases.listDocuments(DATABASE_ID, PARTNERS_COLLECTION_ID, [Query.limit(1)]);
            console.log('✅ Partners collection exists and accessible');
            
            return true;
        } catch (error: any) {
            console.error('❌ Partners system initialization failed:', error);
            
            // If collection doesn't exist, provide setup instructions
            if (error.code === 404) {
                console.log('📋 SETUP REQUIRED: Partners collection not found');
                console.log('Create collection with ID:', PARTNERS_COLLECTION_ID);
                console.log('Required attributes:', this.getRequiredAttributes());
            }
            
            return false;
        }
    }
    
    /**
     * Get required attributes for partners collection
     */
    getRequiredAttributes() {
        return [
            { key: 'name', type: 'string', required: true, size: 255 },
            { key: 'websiteUrl', type: 'string', required: false, size: 500 },
            { key: 'websiteTitle', type: 'string', required: false, size: 255 },
            { key: 'description', type: 'string', required: false, size: 2000 },
            { key: 'category', type: 'string', required: true, size: 50 },
            { key: 'location', type: 'string', required: false, size: 255 },
            { key: 'address', type: 'string', required: false, size: 500 },
            { key: 'phone', type: 'string', required: false, size: 50 },
            { key: 'whatsapp', type: 'string', required: false, size: 50 },
            { key: 'email', type: 'email', required: false, size: 255 },
            { key: 'verified', type: 'boolean', required: true, default: false },
            { key: 'rating', type: 'double', required: false, min: 0, max: 5 },
            { key: 'imageUrl', type: 'url', required: false, size: 500 },
            { key: 'imageFileId', type: 'string', required: false, size: 100 },
            { key: 'specialties', type: 'string', required: false, size: 1000, array: true },
            { key: 'amenities', type: 'string', required: false, size: 1000, array: true },
            { key: 'priceRange', type: 'enum', required: false, elements: ['budget', 'mid-range', 'luxury'] },
            { key: 'latitude', type: 'double', required: false },
            { key: 'longitude', type: 'double', required: false },
            { key: 'contactPerson', type: 'string', required: false, size: 255 },
            { key: 'licenseNumber', type: 'string', required: false, size: 100 },
            { key: 'taxId', type: 'string', required: false, size: 100 },
            { key: 'isActive', type: 'boolean', required: true, default: true },
            { key: 'commissionRate', type: 'double', required: false, min: 0, max: 100 },
            { key: 'featuredUntil', type: 'datetime', required: false },
            { key: 'websitePreview', type: 'url', required: false, size: 500 },
            { key: 'socialMediaFacebook', type: 'url', required: false, size: 500 },
            { key: 'socialMediaInstagram', type: 'url', required: false, size: 500 },
            { key: 'socialMediaTwitter', type: 'url', required: false, size: 500 },
            { key: 'socialMediaTiktok', type: 'url', required: false, size: 500 },
            { key: 'businessHoursMonday', type: 'string', required: false, size: 50 },
            { key: 'businessHoursTuesday', type: 'string', required: false, size: 50 },
            { key: 'businessHoursWednesday', type: 'string', required: false, size: 50 },
            { key: 'businessHoursThursday', type: 'string', required: false, size: 50 },
            { key: 'businessHoursFriday', type: 'string', required: false, size: 50 },
            { key: 'businessHoursSaturday', type: 'string', required: false, size: 50 },
            { key: 'businessHoursSunday', type: 'string', required: false, size: 50 },
        ];
    }
    
    /**
     * Upload partner image to Appwrite Storage
     */
    async uploadPartnerImage(image: PartnerImage, partnerId: string): Promise<string | null> {
        try {
            console.log(`📸 Uploading image for partner ${partnerId}...`);
            
            const fileId = ID.unique();
            const fileName = `partner_${partnerId}_${Date.now()}.${image.file.name.split('.').pop()}`;
            
            const file = await storage.createFile(
                PARTNERS_IMAGES_BUCKET_ID,
                fileId,
                image.file,
                [
                    Permission.read(Role.any()), // Public read access
                    Permission.update(Role.users()), // Users can update
                    Permission.delete(Role.users()) // Users can delete
                ]
            );
            
            // Get public URL
            const imageUrl = storage.getFileView(PARTNERS_IMAGES_BUCKET_ID, fileId);
            
            console.log('✅ Image uploaded successfully:', imageUrl.href);
            return imageUrl.href;
            
        } catch (error) {
            console.error('❌ Failed to upload partner image:', error);
            return null;
        }
    }
    
    /**
     * Create new partner with full data
     */
    async createPartner(partnerData: PartnerData, images?: PartnerImage[]): Promise<string | null> {
        try {
            console.log('🏨 Creating new partner:', partnerData.name);
            
            // Prepare document data
            const documentData = {
                ...partnerData,
                joinedDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                isActive: partnerData.isActive ?? true,
                verified: partnerData.verified ?? false,
                // Flatten nested objects for Appwrite
                latitude: partnerData.coordinates?.latitude || null,
                longitude: partnerData.coordinates?.longitude || null,
                socialMediaFacebook: partnerData.socialMedia?.facebook || null,
                socialMediaInstagram: partnerData.socialMedia?.instagram || null,
                socialMediaTwitter: partnerData.socialMedia?.twitter || null,
                socialMediaTiktok: partnerData.socialMedia?.tiktok || null,
                businessHoursMonday: partnerData.businessHours?.monday || null,
                businessHoursTuesday: partnerData.businessHours?.tuesday || null,
                businessHoursWednesday: partnerData.businessHours?.wednesday || null,
                businessHoursThursday: partnerData.businessHours?.thursday || null,
                businessHoursFriday: partnerData.businessHours?.friday || null,
                businessHoursSaturday: partnerData.businessHours?.saturday || null,
                businessHoursSunday: partnerData.businessHours?.sunday || null,
            };
            
            // Remove nested objects that we've flattened
            delete (documentData as any).coordinates;
            delete (documentData as any).socialMedia;
            delete (documentData as any).businessHours;
            delete (documentData as any).metadata;
            delete documentData.id; // Remove ID as Appwrite will generate it
            
            const partnerId = ID.unique();
            
            // Upload main image if provided
            if (images && images.length > 0) {
                const mainImage = images.find(img => img.isMain) || images[0];
                const imageUrl = await this.uploadPartnerImage(mainImage, partnerId);
                if (imageUrl) {
                    documentData.imageUrl = imageUrl;
                }
            }
            
            // Create document
            const document = await databases.createDocument(
                DATABASE_ID,
                PARTNERS_COLLECTION_ID,
                partnerId,
                documentData,
                [
                    Permission.read(Role.any()), // Public read access
                    Permission.update(Role.users()), // Users can update
                    Permission.delete(Role.users()) // Users can delete
                ]
            );
            
            console.log('✅ Partner created successfully:', document.$id);
            return document.$id;
            
        } catch (error) {
            console.error('❌ Failed to create partner:', error);
            return null;
        }
    }
    
    /**
     * Update existing partner data
     */
    async updatePartner(partnerId: string, updates: Partial<PartnerData>): Promise<boolean> {
        try {
            console.log(`🔄 Updating partner ${partnerId}...`);
            
            const updateData = {
                ...updates,
                lastUpdated: new Date().toISOString(),
                // Flatten nested objects
                latitude: updates.coordinates?.latitude,
                longitude: updates.coordinates?.longitude,
                socialMediaFacebook: updates.socialMedia?.facebook,
                socialMediaInstagram: updates.socialMedia?.instagram,
                socialMediaTwitter: updates.socialMedia?.twitter,
                socialMediaTiktok: updates.socialMedia?.tiktok,
                businessHoursMonday: updates.businessHours?.monday,
                businessHoursTuesday: updates.businessHours?.tuesday,
                businessHoursWednesday: updates.businessHours?.wednesday,
                businessHoursThursday: updates.businessHours?.thursday,
                businessHoursFriday: updates.businessHours?.friday,
                businessHoursSaturday: updates.businessHours?.saturday,
                businessHoursSunday: updates.businessHours?.sunday,
            };
            
            // Remove nested objects and undefined values
            delete (updateData as any).coordinates;
            delete (updateData as any).socialMedia;
            delete (updateData as any).businessHours;
            delete (updateData as any).metadata;
            delete updateData.id;
            
            // Filter out undefined values
            Object.keys(updateData).forEach(key => {
                if ((updateData as any)[key] === undefined) {
                    delete (updateData as any)[key];
                }
            });
            
            await databases.updateDocument(
                DATABASE_ID,
                PARTNERS_COLLECTION_ID,
                partnerId,
                updateData
            );
            
            console.log('✅ Partner updated successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to update partner:', error);
            return false;
        }
    }
    
    /**
     * Get all partners with filtering and pagination
     */
    async getPartners(options: {
        category?: 'hotel' | 'villa' | 'massage-place' | 'therapist';
        verified?: boolean;
        active?: boolean;
        featured?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
    } = {}): Promise<PartnerData[]> {
        try {
            console.log('📊 Fetching partners with options:', options);
            
            const queries = [];
            
            // Add filters
            if (options.category) {
                queries.push(Query.equal('category', options.category));
            }
            if (options.verified !== undefined) {
                queries.push(Query.equal('verified', options.verified));
            }
            if (options.active !== undefined) {
                queries.push(Query.equal('isActive', options.active));
            }
            if (options.featured) {
                queries.push(Query.greaterThan('featuredUntil', new Date().toISOString()));
            }
            if (options.search) {
                queries.push(Query.search('name', options.search));
            }
            
            // Add pagination
            if (options.limit) {
                queries.push(Query.limit(options.limit));
            }
            if (options.offset) {
                queries.push(Query.offset(options.offset));
            }
            
            // Order by most recent
            queries.push(Query.orderDesc('$createdAt'));
            
            const response = await databases.listDocuments(
                DATABASE_ID,
                PARTNERS_COLLECTION_ID,
                queries
            );
            
            // Transform documents back to PartnerData format
            const partners: PartnerData[] = response.documents.map(doc => ({
                id: doc.$id,
                name: doc.name,
                websiteUrl: doc.websiteUrl,
                websiteTitle: doc.websiteTitle,
                description: doc.description,
                category: doc.category,
                location: doc.location,
                address: doc.address,
                phone: doc.phone,
                whatsapp: doc.whatsapp,
                email: doc.email,
                verified: doc.verified,
                rating: doc.rating,
                imageUrl: doc.imageUrl,
                imageFileId: doc.imageFileId,
                specialties: doc.specialties || [],
                amenities: doc.amenities || [],
                priceRange: doc.priceRange,
                coordinates: (doc.latitude && doc.longitude) ? {
                    latitude: doc.latitude,
                    longitude: doc.longitude
                } : undefined,
                socialMedia: {
                    facebook: doc.socialMediaFacebook,
                    instagram: doc.socialMediaInstagram,
                    twitter: doc.socialMediaTwitter,
                    tiktok: doc.socialMediaTiktok
                },
                businessHours: {
                    monday: doc.businessHoursMonday,
                    tuesday: doc.businessHoursTuesday,
                    wednesday: doc.businessHoursWednesday,
                    thursday: doc.businessHoursThursday,
                    friday: doc.businessHoursFriday,
                    saturday: doc.businessHoursSaturday,
                    sunday: doc.businessHoursSunday
                },
                contactPerson: doc.contactPerson,
                licenseNumber: doc.licenseNumber,
                taxId: doc.taxId,
                joinedDate: doc.joinedDate || doc.$createdAt,
                lastUpdated: doc.lastUpdated || doc.$updatedAt,
                isActive: doc.isActive,
                commissionRate: doc.commissionRate,
                featuredUntil: doc.featuredUntil,
                websitePreview: doc.websitePreview,
                metadata: doc.metadata
            }));
            
            console.log(`✅ Retrieved ${partners.length} partners`);
            return partners;
            
        } catch (error) {
            console.error('❌ Failed to fetch partners:', error);
            return [];
        }
    }
    
    /**
     * Get single partner by ID
     */
    async getPartner(partnerId: string): Promise<PartnerData | null> {
        try {
            const partners = await this.getPartners({ limit: 1 });
            const partner = partners.find(p => p.id === partnerId);
            return partner || null;
        } catch (error) {
            console.error('❌ Failed to fetch partner:', error);
            return null;
        }
    }
    
    /**
     * Delete partner
     */
    async deletePartner(partnerId: string): Promise<boolean> {
        try {
            console.log(`🗑️ Deleting partner ${partnerId}...`);
            
            await databases.deleteDocument(
                DATABASE_ID,
                PARTNERS_COLLECTION_ID,
                partnerId
            );
            
            console.log('✅ Partner deleted successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to delete partner:', error);
            return false;
        }
    }
    
    /**
     * Bulk import partners from existing data
     */
    async bulkImportPartners(partners: PartnerData[]): Promise<{ success: number; failed: number; errors: string[] }> {
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };
        
        console.log(`📦 Bulk importing ${partners.length} partners...`);
        
        for (const partner of partners) {
            try {
                const id = await this.createPartner(partner);
                if (id) {
                    results.success++;
                } else {
                    results.failed++;
                    results.errors.push(`Failed to create: ${partner.name}`);
                }
            } catch (error: any) {
                results.failed++;
                results.errors.push(`Error creating ${partner.name}: ${error.message}`);
            }
        }
        
        console.log(`✅ Bulk import completed: ${results.success} success, ${results.failed} failed`);
        return results;
    }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const indastreetPartnersService = new IndastreetPartnersService();