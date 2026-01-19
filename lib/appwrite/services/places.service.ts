/**
 * Massage place management
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG, account } from '../config';
import { ID, Query } from 'appwrite';

export const placesService = {
    async getAllPlaces(city?: string): Promise<any[]> {
        try {
            // Check if user is authenticated to avoid 401 errors
            let isAuthenticated = false;
            try {
                await account.get();
                isAuthenticated = true;
            } catch {
                // User not authenticated, will use seed data
                isAuthenticated = false;
            }

            // Build query filters
            const queries = [Query.limit(500)];
            if (city) {
                queries.push(Query.search('location', city));
                console.log('🏙️ [PLACES] Filtering by city:', city);
            }

            // Fetch complete places from Appwrite
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                queries
            );

            // Enrich with analytics from leads collection if available
            for (const place of response.documents) {
                // Only attempt to query leads if user is authenticated (prevents 401 errors)
                if (isAuthenticated && APPWRITE_CONFIG.collections.leads) {
                    try {
                        const leadsData = await databases.listDocuments(
                            APPWRITE_CONFIG.databaseId,
                            APPWRITE_CONFIG.collections.leads,
                            [Query.equal('placeId', place.$id)]
                        );
                        place.analytics = JSON.stringify({ bookings: leadsData.total });
                    } catch (error) {
                        // Silently fallback to seed data if query fails
                        const seedBookings = 32 + Math.floor(Math.random() * 19);
                        place.analytics = JSON.stringify({ bookings: seedBookings });
                    }
                } else {
                    // Use seed data for unauthenticated users
                    const seedBookings = 32 + Math.floor(Math.random() * 19);
                    place.analytics = JSON.stringify({ bookings: seedBookings });
                }
            }

            return response.documents;
        } catch (error) {
            console.error('Error fetching places:', error);
            return [];
        }
    },

    // Aliases for compatibility
    async getPlaces(city?: string): Promise<any[]> {
        return this.getAllPlaces(city);
    },
    
    async getAll(city?: string): Promise<any[]> {
        return this.getAllPlaces(city);
    },

    async getByProviderId(providerId: string): Promise<any | null> {
        // Robust lookup: attempt direct document id, then attribute fields (id, placeId)
        if (!providerId) {
            console.warn('⚠️ getByProviderId called without providerId');
            return null;
        }
        try {
            // Helper to map attributes
            const mapAttributes = (doc: any) => {
                // Parse galleryImages JSON string if it exists (check both camelCase and lowercase)
                let parsedGalleryImages = [];
                const galleryData = doc.galleryImages || (doc as any).galleryimages;
                
                if (galleryData) {
                    try {
                        parsedGalleryImages = typeof galleryData === 'string' 
                            ? JSON.parse(galleryData) 
                            : galleryData;
                    } catch (e) {
                        console.error('Error parsing gallery images:', e);
                        parsedGalleryImages = [];
                    }
                }
                
                return {
                    ...doc,
                    mainImage: (doc as any).mainimage || doc.mainImage,
                    galleryImages: parsedGalleryImages,
                    openingTime: (doc as any).openingtime || doc.openingTime,
                    closingTime: (doc as any).closingtime || doc.closingTime,
                    discountPercentage: (doc as any).discountpercentage || doc.discountPercentage,
                    discountDuration: (doc as any).discountduration || doc.discountDuration,
                    isDiscountActive: (doc as any).isdiscountactive || doc.isDiscountActive,
                    discountEndTime: (doc as any).discountendtime || doc.discountEndTime,
                    websiteUrl: (doc as any).websiteurl || doc.websiteUrl,
                    websiteTitle: (doc as any).websitetitle || doc.websiteTitle,
                    websiteDescription: (doc as any).websitedescription || doc.websiteDescription,
                    // Social links
                    instagramUrl: (doc as any).instagramurl || (doc as any).instagramUrl || undefined,
                    facebookPageUrl: (doc as any).facebookpageurl || (doc as any).facebookPageUrl || undefined,
                    instagramPosts: (() => {
                        const raw = (doc as any).instagramposts || (doc as any).instagramPosts;
                        if (!raw) return undefined;
                        try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return undefined; }
                    })(),
                    // Map critical display attributes
                    massageTypes: (doc as any).massagetypes || doc.massageTypes,
                    languages: (doc as any).languagesspoken || doc.languages,
                    additionalServices: (doc as any).additionalservices || doc.additionalServices,
                    contactNumber: (doc as any).whatsappnumber || doc.contactNumber,
                    hotelVillaPricing: (doc as any).hotelvillapricing || doc.hotelVillaPricing,
                };
            };
            
            // 1. Try direct document fetch (most reliable when we pass Appwrite $id through login flow)
            try {
                const direct = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.places,
                    providerId
                );
                if (direct && direct.$id) {
                    console.log('✅ Found place via direct $id lookup:', direct.$id);
                    return mapAttributes(direct);
                }
            } catch (directErr: any) {
                // Expected if providerId is not the document $id; log at debug level only
                if (directErr?.code !== 404) {
                    console.log('ℹ️ Direct $id lookup did not return document:', directErr?.message || directErr);
                }
            }

            // Helper to run a single-field query safely
            const tryField = async (field: string) => {
                try {
                    const resp = await databases.listDocuments(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.places,
                        [Query.equal(field, providerId)]
                    );
                    if (resp.documents.length > 0) {
                        console.log(`✅ Found place via ${field} attribute lookup:`, resp.documents[0].$id);
                        return mapAttributes(resp.documents[0]);
                    }
                } catch (e) {
                    console.log(`ℹ️ ${field} lookup failed:`, (e as any)?.message || e);
                }
                return null;
            };

            // 2. Try 'id' attribute
            const byIdAttr = await tryField('id');
            if (byIdAttr) return byIdAttr;

            // 3. Try 'placeId' attribute (legacy / alternate field)
            const byPlaceIdAttr = await tryField('placeId');
            if (byPlaceIdAttr) return byPlaceIdAttr;

            // 4. If numeric-looking, try numeric variant for 'id'
            const numeric = Number(providerId);
            if (!isNaN(numeric)) {
                try {
                    const respNum = await databases.listDocuments(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.places,
                        [Query.equal('id', numeric)]
                    );
                    if (respNum.documents.length > 0) {
                        console.log('✅ Found place via numeric id attribute lookup:', respNum.documents[0].$id);
                        return mapAttributes(respNum.documents[0]);
                    }
                } catch (numErr) {
                    console.log('ℹ️ Numeric id lookup failed:', (numErr as any)?.message || numErr);
                }
            }

            console.warn('⚠️ No place document found for providerId after all strategies:', providerId);
            return null;
        } catch (error) {
            console.error('❌ Error in getByProviderId combined lookup:', error);
            return null;
        }
    },

    async getById(id: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                id
            );
            
            // Parse galleryimages JSON string if it exists
            let parsedGalleryImages = response.galleryImages;
            if ((response as any).galleryimages) {
                try {
                    parsedGalleryImages = typeof (response as any).galleryimages === 'string' 
                        ? JSON.parse((response as any).galleryimages) 
                        : (response as any).galleryimages;
                } catch (e) {
                    console.error('Error parsing galleryimages:', e);
                    parsedGalleryImages = [];
                }
            }
            
            // Map Appwrite lowercase attributes to camelCase for frontend compatibility
            return {
                ...response,
                mainImage: (response as any).mainimage || response.mainImage,
                profilePicture: (response as any).profilePicture || response.profilePicture,
                yearsEstablished: (response as any).yearsEstablished || response.yearsEstablished || 1,
                galleryImages: parsedGalleryImages,
                openingTime: (response as any).openingtime || response.openingTime,
                closingTime: (response as any).closingtime || response.closingTime,
                discountPercentage: (response as any).discountpercentage || response.discountPercentage,
                discountDuration: (response as any).discountduration || response.discountDuration,
                isDiscountActive: (response as any).isdiscountactive || response.isDiscountActive,
                discountEndTime: (response as any).discountendtime || response.discountEndTime,
                websiteUrl: (response as any).websiteurl || response.websiteUrl,
                websiteTitle: (response as any).websitetitle || response.websiteTitle,
                websiteDescription: (response as any).websitedescription || response.websiteDescription,
                // Social links
                instagramUrl: (response as any).instagramurl || (response as any).instagramUrl || undefined,
                facebookPageUrl: (response as any).facebookpageurl || (response as any).facebookPageUrl || undefined,
                instagramPosts: (() => {
                    const raw = (response as any).instagramposts || (response as any).instagramPosts;
                    if (!raw) return undefined;
                    try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return undefined; }
                })(),
                // Map critical display attributes and parse JSON strings
                massageTypes: (() => {
                    const raw = (response as any).massagetypes || response.massageTypes;
                    if (!raw) return [];
                    try {
                        return typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch (e) {
                        console.error('Error parsing massage types:', e);
                        return [];
                    }
                })(),
                languages: (() => {
                    const raw = (response as any).languagesspoken || response.languages;
                    if (!raw) return [];
                    try {
                        return typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch (e) {
                        console.error('Error parsing languages:', e);
                        return [];
                    }
                })(),
                additionalServices: (() => {
                    const raw = (response as any).additionalservices || response.additionalServices;
                    if (!raw) return [];
                    try {
                        return typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch (e) {
                        console.error('Error parsing additional services:', e);
                        return [];
                    }
                })(),
                contactNumber: (response as any).whatsappnumber || response.contactNumber,
                hotelVillaPricing: (response as any).hotelvillapricing || response.hotelVillaPricing,
            };
        } catch (error) {
            console.error('Error fetching place:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                id,
                data
            );
            
            // Parse galleryimages JSON string if it exists
            let parsedGalleryImages = response.galleryImages;
            if ((response as any).galleryimages) {
                try {
                    parsedGalleryImages = typeof (response as any).galleryimages === 'string' 
                        ? JSON.parse((response as any).galleryimages) 
                        : (response as any).galleryimages;
                } catch (e) {
                    console.error('Error parsing galleryimages:', e);
                    parsedGalleryImages = [];
                }
            }
            
            // Map Appwrite lowercase attributes to camelCase for frontend compatibility
            return {
                ...response,
                mainImage: (response as any).mainimage || response.mainImage,
                galleryImages: parsedGalleryImages,
                openingTime: (response as any).openingtime || response.openingTime,
                closingTime: (response as any).closingtime || response.closingTime,
                discountPercentage: (response as any).discountpercentage || response.discountPercentage,
                discountDuration: (response as any).discountduration || response.discountDuration,
                isDiscountActive: (response as any).isdiscountactive || response.isDiscountActive,
                discountEndTime: (response as any).discountendtime || response.discountEndTime,
                websiteUrl: (response as any).websiteurl || response.websiteUrl,
                websiteTitle: (response as any).websitetitle || response.websiteTitle,
                websiteDescription: (response as any).websitedescription || response.websiteDescription,
                // Social links
                instagramUrl: (response as any).instagramurl || (response as any).instagramUrl || undefined,
                facebookPageUrl: (response as any).facebookpageurl || (response as any).facebookPageUrl || undefined,
                instagramPosts: (() => {
                    const raw = (response as any).instagramposts || (response as any).instagramPosts;
                    if (!raw) return undefined;
                    try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return undefined; }
                })(),
                // Map critical display attributes and parse JSON strings
                massageTypes: (() => {
                    const raw = (response as any).massagetypes || response.massageTypes;
                    if (!raw) return [];
                    try {
                        return typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch (e) {
                        console.error('Error parsing massage types:', e);
                        return [];
                    }
                })(),
                languages: (() => {
                    const raw = (response as any).languagesspoken || response.languages;
                    if (!raw) return [];
                    try {
                        return typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch (e) {
                        console.error('Error parsing languages:', e);
                        return [];
                    }
                })(),
                additionalServices: (() => {
                    const raw = (response as any).additionalservices || response.additionalServices;
                    if (!raw) return [];
                    try {
                        return typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch (e) {
                        console.error('Error parsing additional services:', e);
                        return [];
                    }
                })(),
                contactNumber: (response as any).whatsappnumber || response.contactNumber,
                hotelVillaPricing: (response as any).hotelvillapricing || response.hotelVillaPricing,
            };
        } catch (error) {
            console.error('Error updating place:', error);
            throw error;
        }
    },
    async delete(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                id
            );
        } catch (error) {
            console.error('Error deleting place:', error);
            throw error;
        }
    },
    async getByEmail(email: string): Promise<any[]> {
        try {
            console.log('🔍 Searching for massage place by email:', email);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('email', email)]
            );
            console.log('📋 Found massage places with email:', response.documents.length);
            return response.documents;
        } catch (error) {
            console.error('Error finding massage place by email:', error);
            return [];
        }
    },
    async getCurrentUser(): Promise<any> {
        try {
            return await account.get();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
};
