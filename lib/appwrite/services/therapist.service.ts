/**
 * Therapist management and operations
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG, account, rateLimitedDb } from '../config';
import { ID, Query } from 'appwrite';

// Import services with proper fallbacks
let sendAdminNotification: any;
let getNonRepeatingMainImage: any;

// Helper for creating a solid color data URL placeholder
const createPlaceholderDataURL = (text: string, bgColor: string = '#f3f4f6', textColor: string = '#374151') => {
    const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="18" fill="${textColor}">${text}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

try {
    ({ sendAdminNotification } = require('../config'));
} catch {
    sendAdminNotification = () => console.warn('sendAdminNotification not available');
}
try {
    ({ getNonRepeatingMainImage } = require('../config'));
} catch {
    getNonRepeatingMainImage = (index: number) => createPlaceholderDataURL(`Therapist ${index + 1}`);
}

export const therapistService = {
    async create(therapist: any): Promise<any> {
        try {
            // Seed analytics with initial bookings (25-50) if not provided
            if (!therapist.analytics) {
                const seedBookings = 25 + Math.floor(Math.random() * 26); // 25-50 inclusive
                therapist.analytics = JSON.stringify({
                    impressions: 0,
                    views: 0,
                    profileViews: 0,
                    whatsapp_clicks: 0,
                    whatsappClicks: 0,
                    phone_clicks: 0,
                    directions_clicks: 0,
                    bookings: seedBookings
                });
            } else {
                // Ensure bookings field exists
                try {
                    const parsed = JSON.parse(therapist.analytics);
                    if (parsed && typeof parsed.bookings !== 'number') {
                        parsed.bookings = 25 + Math.floor(Math.random() * 26);
                        therapist.analytics = JSON.stringify(parsed);
                    }
                } catch {
                    const seedBookings = 32 + Math.floor(Math.random() * 19);
                    therapist.analytics = JSON.stringify({ bookings: seedBookings });
                }
            }
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                'unique()',
                therapist
            );
            
            // Send email notification to admin
            try {
                await sendAdminNotification({
                    type: 'therapist',
                    name: therapist.name || 'Unknown',
                    email: therapist.email || 'Not provided',
                    whatsappNumber: therapist.whatsappNumber || therapist.contactNumber || 'Not provided',
                    location: therapist.location || 'Not provided',
                    registrationDate: new Date().toISOString()
                });
            } catch (emailError) {
                console.error('Failed to send admin notification:', emailError);
                // Don't throw - registration was successful even if email failed
            }
            
            return response;
        } catch (error) {
            console.error('Error creating therapist:', error);
            throw error;
        }
    },
    async getTherapists(): Promise<any[]> {
        return this.getAll();
    },
    async getAll(): Promise<any[]> {
        try {
            console.log('📋 Fetching all therapists from collection:', APPWRITE_CONFIG.collections.therapists);
            const response = await rateLimitedDb.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists
            );
            console.log('✅ Fetched therapists:', response.documents.length);
            
            // Add random main images and normalize status to therapists
            const therapistsWithImages = response.documents.map((therapist: any, index: number) => {
                const assignedMainImage = therapist.mainImage || getNonRepeatingMainImage(index);
                
                // Normalize status from database (lowercase) to enum format (capitalized)
                const normalizeStatus = (status: string) => {
                    if (!status) return 'Offline';
                    const lowercaseStatus = status.toLowerCase();
                    if (lowercaseStatus === 'available') return 'Available';
                    if (lowercaseStatus === 'busy') return 'Busy';
                    if (lowercaseStatus === 'offline') return 'Offline';
                    return status; // Return as-is if unknown
                };
                
                console.log(`🎭 [Therapist Images] ${therapist.name || 'Unknown'} (ID: ${therapist.id || therapist.$id}):`);
                console.log(`   - Original mainImage: ${therapist.mainImage || 'None'}`);
                console.log(`   - Assigned mainImage: ${assignedMainImage}`);
                console.log(`   - Profile picture: ${therapist.profilePicture || 'None'}`);
                console.log(`   - Status normalized: ${therapist.status} -> ${normalizeStatus(therapist.status)}`);
                
                // Extract busy timer data from description if present
                let extractedBusyTimer = null;
                let cleanDescription = therapist.description || '';
                
                const timerMatch = cleanDescription.match(/\[TIMER:(.+?)\]/);
                if (timerMatch) {
                    try {
                        extractedBusyTimer = JSON.parse(timerMatch[1]);
                        // Remove timer data from description for display
                        cleanDescription = cleanDescription.replace(/\[TIMER:.+?\]/, '').trim();
                    } catch (e) {
                        console.warn('Failed to parse timer data for therapist:', therapist.name);
                    }
                }

                return {
                    ...therapist,
                    mainImage: assignedMainImage,
                    status: normalizeStatus(therapist.status),
                    availability: normalizeStatus(therapist.availability || therapist.status),
                    description: cleanDescription,
                    busyUntil: extractedBusyTimer?.busyUntil || null,
                    busyDuration: extractedBusyTimer?.busyDuration || null
                };
            });
            
            return therapistsWithImages;
        } catch (error) {
            console.error('❌ Error fetching therapists:', error);
            console.error('Database ID:', APPWRITE_CONFIG.databaseId);
            console.error('Collection ID:', APPWRITE_CONFIG.collections.therapists);
            return [];
        }
    },
    async getById(id: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            return response;
        } catch (error) {
            console.error('Error fetching therapist:', error);
            return null;
        }
    },
    async getByEmail(email: string): Promise<any[]> {
        try {
            // Check if collection is disabled
            if (!APPWRITE_CONFIG.collections.therapists) {
                console.warn('⚠️ Therapist collection is disabled - returning empty array');
                return [];
            }

            // Normalize email for consistent lookup (case-insensitive, trimmed)
            const normalizedEmail = email.toLowerCase().trim();
            
            console.log('🔍 Searching for therapist by email:', normalizedEmail);
            console.log('🔍 [DEBUG] Original email:', JSON.stringify(email));
            console.log('🔍 [DEBUG] Normalized email:', JSON.stringify(normalizedEmail));
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('email', normalizedEmail)]
            );
            console.log('📋 Found therapists with email:', response.documents.length);
            
            if (response.documents.length === 0) {
                console.warn('⚠️ No therapist found for email:', normalizedEmail);
                console.warn('⚠️ This may indicate:');
                console.warn('   1. Therapist document not created during signup');
                console.warn('   2. Email stored with different normalization');
                console.warn('   3. Document exists but email field is different');
            } else {
                console.log('📋 [DEBUG] Found therapist document(s):', response.documents.map(d => ({
                    id: d.$id,
                    email: d.email,
                    name: d.name,
                    status: d.status
                })));
            }
            
            // Normalize status for each therapist found
            const normalizeStatus = (status: string) => {
                if (!status) return 'Offline';
                const lowercaseStatus = status.toLowerCase();
                if (lowercaseStatus === 'available') return 'Available';
                if (lowercaseStatus === 'busy') return 'Busy';
                if (lowercaseStatus === 'offline') return 'Offline';
                return status; // Return as-is if unknown
            };
            
            const normalizedTherapists = response.documents.map((therapist: any) => {
                // Extract busy timer data from description if present
                let extractedBusyTimer = null;
                let cleanDescription = therapist.description || '';
                
                const timerMatch = cleanDescription.match(/\[TIMER:(.+?)\]/);
                if (timerMatch) {
                    try {
                        extractedBusyTimer = JSON.parse(timerMatch[1]);
                        // Remove timer data from description for display
                        cleanDescription = cleanDescription.replace(/\[TIMER:.+?\]/, '').trim();
                    } catch (e) {
                        console.warn('Failed to parse timer data for therapist:', therapist.name);
                    }
                }

                return {
                    ...therapist,
                    status: normalizeStatus(therapist.status),
                    availability: normalizeStatus(therapist.availability || therapist.status),
                    description: cleanDescription,
                    busyUntil: extractedBusyTimer?.busyUntil || null,
                    busyDuration: extractedBusyTimer?.busyDuration || null
                };
            });
            
            return normalizedTherapists;
        } catch (error) {
            console.error('❌ Error finding therapist by email:', error);
            
            // Provide detailed error context
            if (error && typeof error === 'object') {
                const err = error as any;
                if (err.code === 404) {
                    console.error('🔍 Collection not found:', APPWRITE_CONFIG.collections.therapists);
                }
            }
            
            return [];
        }
    },
    async getByUserId(userId: string): Promise<any[]> {
        try {
            // Check if collection is disabled
            if (!APPWRITE_CONFIG.collections.therapists) {
                console.warn('⚠️ Therapist collection is disabled - returning empty array');
                return [];
            }

            console.log('🔍 Searching for therapist by userId:', userId);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('userId', userId)]
            );
            console.log('📋 Found therapists with userId:', response.documents.length);
            
            // Normalize status for each therapist found
            const normalizeStatus = (status: string) => {
                if (!status) return 'Offline';
                const lowercaseStatus = status.toLowerCase();
                if (lowercaseStatus === 'available') return 'Available';
                if (lowercaseStatus === 'busy') return 'Busy';
                if (lowercaseStatus === 'offline') return 'Offline';
                return status;
            };
            
            const normalizedTherapists = response.documents.map((therapist: any) => {
                // Extract busy timer data from description if present
                let extractedBusyTimer = null;
                let cleanDescription = therapist.description || '';
                
                const timerMatch = cleanDescription.match(/\[TIMER:(.+?)\]/);
                if (timerMatch) {
                    try {
                        extractedBusyTimer = JSON.parse(timerMatch[1]);
                        cleanDescription = cleanDescription.replace(/\[TIMER:.+?\]/, '').trim();
                    } catch (e) {
                        console.warn('Failed to parse timer data for therapist:', therapist.name);
                    }
                }

                return {
                    ...therapist,
                    status: normalizeStatus(therapist.status),
                    availability: normalizeStatus(therapist.availability || therapist.status),
                    description: cleanDescription,
                    busyUntil: extractedBusyTimer?.busyUntil || null,
                    busyDuration: extractedBusyTimer?.busyDuration || null
                };
            });
            
            return normalizedTherapists;
        } catch (error) {
            console.error('❌ Error finding therapist by userId:', error);
            
            if (error && typeof error === 'object') {
                const err = error as any;
                if (err.code === 404) {
                    console.error('🔍 Collection not found:', APPWRITE_CONFIG.collections.therapists);
                }
            }
            
            return [];
        }
    },
    async getCurrentUser(): Promise<any> {
        try {
            return await account.get();
        } catch (error) {
            console.warn('⚠️ User not authenticated or session expired');
            // Don't log full error details for auth - it's expected when not logged in
            return null;
        }
    },
    async update(id: string, data: any): Promise<any> {
        try {
            // Check if therapist collection is disabled
            if (!APPWRITE_CONFIG.collections.therapists) {
                console.warn('⚠️ Therapist collection is disabled - using mock update');
                return { 
                    ...data, 
                    $id: id, 
                    $updatedAt: new Date().toISOString(),
                    _mockUpdate: true 
                };
            }

            console.log('🔍 Attempting to update therapist:', {
                id,
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.therapists,
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                data
            });
            
            console.log('📊 Appwrite client configuration:', {
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                databaseExists: !!APPWRITE_CONFIG.databaseId,
                collectionExists: !!APPWRITE_CONFIG.collections.therapists
            });
            
            // First, get the current document to preserve all existing data
            console.log('📋 Fetching current document to preserve all fields...');
            const currentDocument = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            
            console.log('📋 Current document data:', currentDocument);
            
            // Start with current document data and update only the provided fields
            const mappedData: any = {
                // Core required fields - preserve from current document
                name: currentDocument.name,
                email: currentDocument.email,
                profilePicture: currentDocument.profilePicture || '',
                description: currentDocument.description || '',
                whatsappNumber: currentDocument.whatsappNumber || '',
                location: currentDocument.location || '',
                specialization: currentDocument.specialization || '',
                yearsOfExperience: currentDocument.yearsOfExperience || 0,
                isLicensed: currentDocument.isLicensed || false,
                hourlyRate: currentDocument.hourlyRate || 100,
                isLive: currentDocument.isLive || false,
                status: currentDocument.status || 'Available',
                availability: currentDocument.availability || 'Available',
                
                // Required booking field - preserve from current document
                bookingsEnabled: currentDocument.bookingsEnabled !== undefined ? currentDocument.bookingsEnabled : true,
                
                // Required pricing fields - preserve from current document (convert to strings)
                price60: String(currentDocument.price60 || 100),
                price90: String(currentDocument.price90 || 150),
                price120: String(currentDocument.price120 || 200),
                
                // Optional fields - preserve if they exist
                ...(currentDocument.pricing && { pricing: currentDocument.pricing }),
                ...(currentDocument.massageTypes && { massageTypes: currentDocument.massageTypes }),
                ...(currentDocument.coordinates && { coordinates: currentDocument.coordinates }),
                
                // Discount fields - preserve from current document
                discountPercentage: currentDocument.discountPercentage || 0,
                discountDuration: currentDocument.discountDuration || 0,
                discountEndTime: currentDocument.discountEndTime || null,
                isDiscountActive: currentDocument.isDiscountActive || false,
            };
            
            // Now update with the provided data
            if (data.status) {
                mappedData.status = data.status.toLowerCase(); // Database expects lowercase for status
                // Convert status to proper capitalized format for availability field
                const statusCapitalized = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
                mappedData.availability = statusCapitalized; // Database expects capitalized for availability
                // Synchronize new available/busy string attributes (recently added to schema)
                if (data.status.toLowerCase() === 'available') {
                    mappedData.available = new Date().toISOString();
                    mappedData.busy = '';
                } else if (data.status.toLowerCase() === 'busy') {
                    // Use bookedUntil / busyDuration to form busy value; fallback to timestamp
                    const bookedUntilTs = data.bookedUntil || data.busyUntil || new Date(Date.now() + 60*60*1000).toISOString();
                    mappedData.busy = bookedUntilTs;
                    mappedData.available = '';
                } else if (data.status.toLowerCase() === 'offline') {
                    mappedData.available = '';
                    mappedData.busy = '';
                }
            }
            
            // Handle explicit availability field (ensure it's capitalized)
            if (data.availability) {
                // Ensure availability is properly capitalized
                const availabilityValue = data.availability;
                if (typeof availabilityValue === 'string') {
                    // If it's lowercase, convert to proper case
                    if (availabilityValue.toLowerCase() === 'available') {
                        mappedData.availability = 'Available';
                    } else if (availabilityValue.toLowerCase() === 'busy') {
                        mappedData.availability = 'Busy';
                    } else if (availabilityValue.toLowerCase() === 'offline') {
                        mappedData.availability = 'Offline';
                    } else {
                        mappedData.availability = availabilityValue; // Use as-is if already correct
                    }
                }
            }
            
            // Update other fields only if provided
            if (data.name) mappedData.name = data.name;
            if (data.email) mappedData.email = data.email;
            // Only save profilePicture if it's a URL (not base64 data)
            if (data.profilePicture && !data.profilePicture.startsWith('data:')) {
                mappedData.profilePicture = data.profilePicture;
            }
            if (data.description) mappedData.description = data.description;
            if (data.whatsappNumber) mappedData.whatsappNumber = data.whatsappNumber;
            if (data.location) mappedData.location = data.location;
            if (data.pricing) mappedData.pricing = data.pricing;
            if (data.price60 !== undefined) mappedData.price60 = String(data.price60);
            if (data.price90 !== undefined) mappedData.price90 = String(data.price90);
            if (data.price120 !== undefined) mappedData.price120 = String(data.price120);
            if (data.massageTypes) mappedData.massageTypes = data.massageTypes;
            if (data.languages) {
                // Schema expects a single string. If array provided, join.
                if (Array.isArray(data.languages)) {
                    mappedData.languages = data.languages.join(', ');
                } else {
                    mappedData.languages = data.languages;
                }
            }
            if (data.coordinates) mappedData.coordinates = data.coordinates;
            if (data.isLive !== undefined) mappedData.isLive = data.isLive;
            if (data.hourlyRate) mappedData.hourlyRate = data.hourlyRate;
            if (data.specialization) mappedData.specialization = data.specialization;
            if (data.yearsOfExperience) mappedData.yearsOfExperience = data.yearsOfExperience;
            if (data.isLicensed !== undefined) mappedData.isLicensed = data.isLicensed;
            if (data.bookingsEnabled !== undefined) mappedData.bookingsEnabled = data.bookingsEnabled;
            
            // Handle premium membership fields (only fields that exist in DB)
            if (data.membershipTier !== undefined) mappedData.membershipTier = data.membershipTier;
            if (data.premiumPaymentStatus !== undefined) mappedData.premiumPaymentStatus = data.premiumPaymentStatus;
            if (data.premiumPaymentSubmittedAt !== undefined) mappedData.premiumPaymentSubmittedAt = data.premiumPaymentSubmittedAt;
            // premiumPaymentProof, premiumActivatedAt, premiumDeclineReason stored in payment_transactions collection
            
            // Handle custom menu field
            if (data.customMenu !== undefined) mappedData.customMenu = data.customMenu;
            
            // Handle discount fields - preserve from current document if not provided
            if (data.discountPercentage !== undefined) {
                // Clamp discount percentage to schema range 0-100
                const pct = Number(data.discountPercentage);
                mappedData.discountPercentage = isNaN(pct) ? 0 : Math.min(Math.max(pct, 0), 100);
            }
            if (data.discountDuration !== undefined) {
                // Clamp duration (hours) to 0-168 (7 days)
                const dur = Number(data.discountDuration);
                mappedData.discountDuration = isNaN(dur) ? 0 : Math.min(Math.max(dur, 0), 168);
            }
            if (data.discountEndTime !== undefined) mappedData.discountEndTime = data.discountEndTime;
            if (data.isDiscountActive !== undefined) mappedData.isDiscountActive = data.isDiscountActive;
            
            console.log('💰 Discount fields being updated:', {
                discountPercentage: data.discountPercentage,
                discountDuration: data.discountDuration,
                discountEndTime: data.discountEndTime,
                isDiscountActive: data.isDiscountActive,
                mappedData: {
                    discountPercentage: mappedData.discountPercentage,
                    discountDuration: mappedData.discountDuration,
                    discountEndTime: mappedData.discountEndTime,
                    isDiscountActive: mappedData.isDiscountActive
                }
            });
            
            // Handle busy timer fields - store in existing description field as JSON for now
            if (data.bookedUntil !== undefined || data.busyDuration !== undefined || data.busyUntil !== undefined) {
                try {
                    // Get current description to preserve it
                    let currentDesc = currentDocument.description || '';
                    let busyTimerData = null;
                    
                    // Try to extract existing timer data from description
                    const timerMatch = currentDesc.match(/\[TIMER:(.+?)\]/);
                    if (timerMatch) {
                        try {
                            busyTimerData = JSON.parse(timerMatch[1]);
                            // Remove old timer data from description
                            currentDesc = currentDesc.replace(/\[TIMER:.+?\]/, '').trim();
                        } catch (e) {
                            console.warn('Failed to parse existing timer data');
                        }
                    }
                    
                    // Update timer data
                    if (data.busyUntil !== undefined || data.busyDuration !== undefined || data.bookedUntil !== undefined) {
                        busyTimerData = {
                            busyUntil: data.busyUntil ?? data.bookedUntil ?? busyTimerData?.busyUntil ?? null,
                            busyDuration: data.busyDuration ?? busyTimerData?.busyDuration ?? null
                        };
                        
                        // Only add timer data if busyUntil exists
                        if (busyTimerData.busyUntil) {
                            mappedData.description = currentDesc + (currentDesc ? ' ' : '') + `[TIMER:${JSON.stringify(busyTimerData)}]`;
                        } else {
                            mappedData.description = currentDesc;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to handle busy timer data:', e);
                }
            }
            
            // Remove Appwrite metadata fields
            const { $id: _$id, $createdAt: _$createdAt, $updatedAt: _$updatedAt, $permissions: _$permissions, $databaseId: _$databaseId, $collectionId, ...cleanMappedData } = mappedData;
            
            console.log('📋 Final mapped data for Appwrite schema (with all required fields):', cleanMappedData);
            console.log('🔍 Location field check:', {
                inOriginalData: !!data.location,
                inMappedData: !!mappedData.location,
                inCleanData: !!cleanMappedData.location,
                locationValue: cleanMappedData.location || 'MISSING'
            });
            console.log('🔍 Status/Availability values being sent:', {
                status: cleanMappedData.status,
                availability: cleanMappedData.availability,
                originalStatus: data.status,
                originalAvailability: data.availability
            });
            
            // Derive isOnline from status if provided and not explicitly set
            if (mappedData.status && mappedData.isOnline === undefined) {
                mappedData.isOnline = mappedData.status !== 'offline';
            }
            // Ensure available/busy coherence even if status not passed but fields were
            if (!data.status) {
                if (data.available) {
                    mappedData.available = data.available;
                    mappedData.busy = '';
                    mappedData.status = 'available';
                    mappedData.availability = 'Available';
                    mappedData.isOnline = true;
                } else if (data.busy) {
                    mappedData.busy = data.busy;
                    mappedData.available = '';
                    mappedData.status = 'busy';
                    mappedData.availability = 'Busy';
                    mappedData.isOnline = true;
                }
            }

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id,
                cleanMappedData
            );
            
            console.log('✅ Therapist updated successfully:', response.$id);
            return response;
        } catch (error) {
            console.error('❌ Error updating therapist:', error);
            console.error('🔧 Collection ID (confirmed valid):', APPWRITE_CONFIG.collections.therapists);
            console.error('🔧 Database ID:', APPWRITE_CONFIG.databaseId);
            console.error('🔧 Document ID:', id);
            console.error('🔧 Original data:', data);
            
            // Provide more detailed error information
            if (error && typeof error === 'object') {
                const err = error as any;
                if (err.code === 404) {
                    console.error('🔍 Collection or document not found');
                    console.error('💡 Suggestion: Verify the collection and document exist');
                } else if (err.code === 401) {
                    console.error('🔐 Authentication error - user may not be logged in');
                } else if (err.code === 403) {
                    console.error('🚫 Permission denied - check collection permissions');
                }
            }
            
            // Return a graceful fallback instead of throwing to prevent UI crashes
            console.warn('🛡️ Returning graceful fallback to prevent UI crash');
            return { 
                ...data, 
                $id: id, 
                $updatedAt: new Date().toISOString(),
                _fallback: true,
                _error: (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    },
    async delete(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
        } catch (error) {
            console.error('Error deleting therapist:', error);
            throw error;
        }
    },
    async search(query: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.search('name', query)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error searching therapists:', error);
            return [];
        }
    },
    async uploadKtpId(therapistId: string, file: File): Promise<{ url: string; fileId: string }> {
        try {
            console.log('📤 Uploading KTP ID card for therapist:', therapistId);
            
            // Upload file to Appwrite Storage
            const bucketId = 'therapist-images';
            const fileId = `ktp-${therapistId}-${Date.now()}`;
            
            const uploadedFile = await storage.createFile(
                bucketId,
                fileId,
                file
            );
            
            console.log('✅ KTP file uploaded:', uploadedFile.$id);
            
            // Get file URL
            const fileUrl = storage.getFileView(bucketId, uploadedFile.$id);
            
            return {
                url: String(fileUrl),
                fileId: uploadedFile.$id
            };
        } catch (error) {
            console.error('❌ Error uploading KTP ID:', error);
            throw error;
        }
    }
};
