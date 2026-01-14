// Main image URLs for therapist cards on HOME PAGE (stored in Appwrite)
import type { MonthlyAgentMetrics } from '../types';
import { getNonRepeatingMainImage } from './appwrite/image.service';
export { getRandomLiveMenuImage, getNonRepeatingMainImage } from './appwrite/image.service';
import { Functions } from 'appwrite';

const functions = new Functions(client);

// Email notification function for admin
async function sendAdminNotification(data: {
    type: 'therapist' | 'massage-place',
    name: string,
    email: string,
    whatsappNumber: string,
    location: string,
    registrationDate: string
}): Promise<void> {
    try {
        const emailBody = `
New ${data.type === 'therapist' ? 'Therapist' : 'Massage Place'} Registration

Name: ${data.name}
Email: ${(data as any).email}
WhatsApp: ${data.whatsappNumber}
Location: ${data.location}
Registration Date: ${new Date(data.registrationDate).toLocaleString()}
        `.trim();

        // Using a simple HTTP request to a free email service (you may need to replace this with your preferred service)
        // For production, consider using Appwrite Functions with an email provider or an external API like SendGrid
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_key: '46ce7d7f-e9d5-4d49-8f14-0b0e3c3e1f5a', // Web3Forms free API key (replace with your own)
                subject: `New ${data.type === 'therapist' ? 'Therapist' : 'Massage Place'} Registration`,
                from_name: 'IndaStreet Registration System',
                email: 'indastreet.id@gmail.com',
                message: emailBody,
            }),
        });

        if (!response.ok) {
            throw new Error(`Email service returned ${response.status}`);
        }

        console.log('✅ Admin notification email sent successfully');
    } catch (error) {
        console.error('❌ Failed to send admin notification email:', error);
        throw error;
    }
}

// --- Image Upload Service ---
export const imageUploadService = {
    /**
     * Upload a file (payment proof, commission proof, etc.) to Appwrite Storage
     * @param file - The file to upload
     * @param folder - Optional folder name for organization
     * @returns URL of the uploaded file
     */
    async uploadImage(file: File, folder?: string): Promise<string> {
        try {
            console.log('📤 uploadImage started, file:', file.name, 'Size:', file.size, 'Folder:', folder);
            
            // Generate unique filename with optional folder prefix
            const fileName = folder ? `${folder}/${Date.now()}_${file.name}` : `${Date.now()}_${file.name}`;
            
            console.log('📁 Uploading file:', fileName);
            console.log('☁️ Uploading to Appwrite Storage...');
            console.log('Bucket ID:', APPWRITE_CONFIG.bucketId);
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            console.log('✅ File uploaded successfully! File ID:', (response as any).$id);
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${(response as any).$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            console.log('🔗 Generated URL:', fileUrl);
            
            return fileUrl;
        } catch (error) {
            console.error('❌ Error uploading image:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    },

    async uploadProfileImage(base64Image: string): Promise<string> {
        try {
            console.log('📤 uploadProfileImage started, base64 length:', base64Image.length);
            
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
            if (!base64Data) {
                throw new Error('Invalid base64 image format');
            }
            
            console.log('🔄 Converting base64 to blob...');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            console.log('📦 Blob created, size:', blob.size);
            
            // Create a File object
            const fileName = `profile_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            console.log('📁 File created:', fileName, 'Size:', file.size);
            console.log('☁️ Uploading to Appwrite Storage...');
            console.log('Bucket ID:', APPWRITE_CONFIG.bucketId);
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            console.log('✅ File uploaded successfully! File ID:', (response as any).$id);
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${(response as any).$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            console.log('🔗 Generated URL:', fileUrl);
            
            return fileUrl;
        } catch (error) {
            console.error('❌ Error uploading profile image:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    }
};

// --- Custom Links Service for Drawer ---
export const customLinksService = {
    async uploadIcon(base64Image: string): Promise<string> {
        try {
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            // Create a File object
            const fileName = `icon_${Date.now()}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${(response as any).$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            return fileUrl;
        } catch (error) {
            console.error('Error uploading icon:', error);
            throw error;
        }
    },
    
    async create(link: { name: string; url: string; icon: string }): Promise<any> {
        try {
            // Check if custom links collection is enabled
            if (!APPWRITE_CONFIG.collections.customLinks) {
                console.warn('⚠️ Custom links collection is disabled');
                return null;
            }
            
            // Upload icon to storage first if it's a base64 image
            let iconUrl = link.icon;
            if (link.icon.startsWith('data:image')) {
                iconUrl = await this.uploadIcon(link.icon);
            }
            
            // Generate a unique customLinkId as an integer
            const customLinkId = Date.now();
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks,
                'unique()',
                {
                    name: link.name,
                    title: link.name,
                    url: link.url,
                    icon: iconUrl,
                    customLinkId,
                    createdAt: new Date().toISOString()
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
            return response;
        } catch (error) {
            console.error('Error creating custom link:', error);
            throw error;
        }
    },
    async getAll(): Promise<any[]> {
        try {
            // Check if custom links collection is enabled
            if (!APPWRITE_CONFIG.collections.customLinks) {
                // Return empty array silently - collection is intentionally disabled
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks
            );
            return response.documents;
        } catch (error: any) {
            // Handle 401 permission errors and 404 not found gracefully
            if (error?.code === 401 || error?.code === 404 || error?.message?.includes('Collection') || error?.message?.includes('could not be found')) {
                // Collection doesn't exist or no permissions - return empty array silently
                return [];
            }
            console.warn('⚠️ Custom links unavailable:', error?.message || error);
            return [];
        }
    },
    async delete(id: string): Promise<void> {
        try {
            // Check if custom links collection is enabled
            if (!APPWRITE_CONFIG.collections.customLinks) {
                console.warn('⚠️ Custom links collection is disabled');
                return;
            }
            
            // First, try to update permissions before deleting (in case they weren't set properly)
            try {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.customLinks,
                    id,
                    {},
                    [
                        Permission.read(Role.any()),
                        Permission.update(Role.any()),
                        Permission.delete(Role.any())
                    ]
                );
            } catch (permError) {
                console.log('Could not update permissions, attempting direct delete:', permError);
            }
            
            // Now delete the document
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks,
                id
            );
        } catch (error) {
            console.error('Error deleting custom link:', error);
            throw error;
        }
    },
    
    async update(id: string, link: { name: string; url: string; icon: string }): Promise<any> {
        try {
            // Upload icon to storage first if it's a new base64 image
            let iconUrl = link.icon;
            if (link.icon.startsWith('data:image')) {
                iconUrl = await this.uploadIcon(link.icon);
            }
            
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks,
                id,
                {
                    name: link.name,
                    title: link.name,
                    url: link.url,
                    icon: iconUrl,
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
            return response;
        } catch (error) {
            console.error('Error updating custom link:', error);
            throw error;
        }
    }
};
// Appwrite service - Real implementation
import { Query, ID, Permission, Role } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { rateLimitedDb } from './rateLimitService';
import type { AgentVisit } from '../types';

// Import from new modular structure
import { appwriteClient as client, appwriteDatabases as databases, appwriteAccount as account, appwriteStorage as storage } from './appwrite/client';

export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;

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
                    email: (therapist as any).email || 'Not provided',
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
                databases,
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
                
                console.log(`🎭 [Therapist Images] ${therapist.name || 'Unknown'} (ID: ${therapist.id || (therapist as any).$id}):`);
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

            console.log('🔍 Searching for therapist by email:', email);
            const response = await rateLimitedDb.listDocuments(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('email', email)]
            );
            console.log('📋 Found therapists with email:', response.documents.length);
            
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
            const currentDocument = await rateLimitedDb.getDocument(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            
            console.log('📋 Current document data:', currentDocument);
            
            // Start with current document data and update only the provided fields
            const mappedData: any = {
                // Core required fields - preserve from current document
                name: currentDocument.name,
                email: (currentDocument as any).email,
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
                    const bookedUntilTs = data.bookedUntil || (data as any).busyUntil || new Date(Date.now() + 60*60*1000).toISOString();
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
            if ((data as any).email) (mappedData as any).email = (data as any).email;
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
            if (data.bookedUntil !== undefined || (data as any).busyDuration !== undefined || (data as any).busyUntil !== undefined) {
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
                    if ((data as any).busyUntil !== undefined || (data as any).busyDuration !== undefined || data.bookedUntil !== undefined) {
                        busyTimerData = {
                            busyUntil: (data as any).busyUntil ?? data.bookedUntil ?? busyTimerData?.busyUntil ?? null,
                            busyDuration: (data as any).busyDuration ?? busyTimerData?.busyDuration ?? null
                        };
                        
                        // Only add timer data if busyUntil exists
                        if ((busyTimerData as any).busyUntil) {
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

            const response = await rateLimitedDb.updateDocument(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id,
                cleanMappedData
            );
            
            console.log('✅ Therapist updated successfully:', (response as any).$id);
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
            
            console.log('✅ KTP file uploaded:', (uploadedFile as any).$id);
            
            // Get file URL
            const fileUrl = storage.getFileView(bucketId, (uploadedFile as any).$id);
            
            return {
                url: String(fileUrl),
                fileId: (uploadedFile as any).$id
            };
        } catch (error) {
            console.error('❌ Error uploading KTP ID:', error);
            throw error;
        }
    }
};

// ============================================================================
// PLACES SERVICE - Location/spa/massage place management
// ============================================================================
export const placesService = {
    async getAllPlaces(): Promise<any[]> {
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

            // Fetch complete places from Appwrite
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.limit(100)]
            );

            // Enrich with analytics from leads collection if available
            for (const place of response.documents) {
                try {
                    // Only query leads if user is authenticated AND collection exists
                    if (isAuthenticated && APPWRITE_CONFIG.collections.leads) {
                        const leadsData = await databases.listDocuments(
                            APPWRITE_CONFIG.databaseId,
                            APPWRITE_CONFIG.collections.leads,
                            [Query.equal('placeId', (place as any).$id)]
                        );
                        place.analytics = JSON.stringify({ bookings: leadsData.total });
                    } else {
                        // Use seed data if not authenticated or collection doesn't exist
                        throw new Error('Leads not accessible');
                    }
                } catch {
                    // Silently fallback to seed data (no console errors)
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

    // Alias for compatibility
    async getPlaces(): Promise<any[]> {
        return this.getAllPlaces();
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
                if (direct && (direct as any).$id) {
                    console.log('✅ Found place via direct $id lookup:', (direct as any).$id);
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
    
    async getAll(): Promise<any[]> {
        try {
            // Check if places collection exists
            if (!APPWRITE_CONFIG.collections.places || APPWRITE_CONFIG.collections.places === '') {
                console.log('⚠️ Places collection disabled - returning empty array');
                return [];
            }
            
            console.log('📋 Fetching all PLACES from collection:', APPWRITE_CONFIG.collections.places);
            console.log('🔧 Database ID:', APPWRITE_CONFIG.databaseId);
            console.log('🌐 Endpoint:', APPWRITE_CONFIG.endpoint);
            console.log('📦 Project ID:', APPWRITE_CONFIG.projectId);
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places
            );
            console.log('✅ Fetched PLACES:', response.documents.length);
            
            // Map Appwrite lowercase attributes to camelCase for frontend compatibility
            const mappedPlaces = response.documents.map((p: any) => {
                console.log(`  🏨 ${p.name} - isLive: ${p.isLive}, ID: ${(p as any).$id}`);
                
                // Parse galleryImages JSON string if it exists (check both camelCase and lowercase)
                let parsedGalleryImages = [];
                const galleryData = p.galleryImages || (p as any).galleryimages;
                
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
                    ...p,
                    // Map lowercase Appwrite attributes to camelCase
                    mainImage: (p as any).mainimage || p.mainImage,
                    profilePicture: (p as any).profilePicture || p.profilePicture,
                    yearsEstablished: (p as any).yearsEstablished || p.yearsEstablished || 1,
                    galleryImages: parsedGalleryImages,
                    openingTime: (p as any).openingtime || p.openingTime,
                    closingTime: (p as any).closingtime || p.closingTime,
                    discountPercentage: (p as any).discountpercentage || p.discountPercentage,
                    discountDuration: (p as any).discountduration || p.discountDuration,
                    isDiscountActive: (p as any).isdiscountactive || p.isDiscountActive,
                    discountEndTime: (p as any).discountendtime || p.discountEndTime,
                    websiteUrl: (p as any).websiteurl || p.websiteUrl,
                    websiteTitle: (p as any).websitetitle || p.websiteTitle,
                    websiteDescription: (p as any).websitedescription || p.websiteDescription,
                    // Social links
                    instagramUrl: (p as any).instagramurl || (p as any).instagramUrl || undefined,
                    facebookPageUrl: (p as any).facebookpageurl || (p as any).facebookPageUrl || undefined,
                    instagramPosts: (() => {
                        const raw = (p as any).instagramposts || (p as any).instagramPosts;
                        if (!raw) return undefined;
                        try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return undefined; }
                    })(),
                    // Map critical display attributes and parse JSON strings
                    massageTypes: (() => {
                        const raw = (p as any).massagetypes || p.massageTypes;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing massage types:', e);
                            return [];
                        }
                    })(),
                    languages: (() => {
                        const raw = (p as any).languagesspoken || p.languages;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing languages:', e);
                            return [];
                        }
                    })(),
                    additionalServices: (() => {
                        const raw = (p as any).additionalservices || p.additionalServices;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing additional services:', e);
                            return [];
                        }
                    })(),
                    contactNumber: (p as any).whatsappnumber || p.contactNumber,
                    hotelVillaPricing: (p as any).hotelvillapricing || p.hotelVillaPricing,
                };
            });
            
            return mappedPlaces;
        } catch (error) {
            console.error('❌ Error fetching places (collection might not exist):', error);
            console.error('❌ Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: (error as any)?.code || 'Unknown code',
                type: (error as any)?.type || 'Unknown type'
            });
            return [];
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

// ================================
// Facial Place Service
// ================================
export const facialPlaceService = {
    async getAll(): Promise<any[]> {
        try {
            const collectionId = APPWRITE_CONFIG.collections.facial_places;
            
            console.log('🔍 Facial Places - Collection ID:', collectionId);
            console.log('🔍 Database ID:', APPWRITE_CONFIG.databaseId);
            
            if (!collectionId || collectionId === '') {
                console.warn('⚠️ Facial places collection ID is EMPTY - returning empty array');
                return [];
            }
            
            console.log('📋 Attempting to fetch FACIAL PLACES...');
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId
            );
            
            console.log('✅ Successfully fetched FACIAL PLACES:', response.documents.length);
            
            if (response.documents.length > 0) {
                const firstDoc = response.documents[0];
                console.log('🔬 DIAGNOSTIC - First document raw data:');
                console.log('  Document ID:', (firstDoc as any).$id);
                console.log('  All attributes:', Object.keys(firstDoc));
                console.log('  Full document:', firstDoc);
                
                // Check for common field variations
                console.log('🔍 Field check:');
                console.log('  - name:', firstDoc.name);
                console.log('  - mainImage:', firstDoc.mainImage);
                console.log('  - mainimage:', firstDoc.mainimage);
                console.log('  - address:', firstDoc.address);
                console.log('  - category:', firstDoc.category);
                console.log('  - icon:', firstDoc.icon); // This would be from massage_types!
                console.log('  - description:', firstDoc.description);
            } else {
                console.warn('⚠️ Collection exists but has NO documents!');
            }
            
            // Map Appwrite attributes to camelCase for frontend compatibility
            const mappedFacialPlaces = response.documents.map((fp: any) => {
                console.log(`  💆 ${fp.name} - category: ${fp.category}, ID: ${(fp as any).$id}`);
                
                return {
                    ...fp,
                    // Map to Place-like structure for compatibility with FacialPlaceCard
                    id: (fp as any).$id,
                    name: fp.name || 'Unnamed Facial Spa',
                    mainImage: fp.mainImage || fp.mainimage,
                    profilePicture: fp.mainImage || fp.mainimage, // Use mainImage as profile picture
                    address: fp.address,
                    location: fp.address, // Map address to location field
                    description: fp.description,
                    websiteUrl: fp.websiteurl,
                    starRate: fp.starrate,
                    rating: fp.starrate ? parseFloat(fp.starrate) : 0,
                    distanceKm: fp.distancekm,
                    category: fp.category,
                    isLive: true, // Assume all facial places from DB are live
                    // Parse JSON fields
                    facialTypes: (() => {
                        const raw = fp.facialtypes;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing facial types:', e);
                            return [];
                        }
                    })(),
                    facialServices: (() => {
                        const raw = fp.facialservices;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing facial services:', e);
                            return [];
                        }
                    })(),
                    prices: (() => {
                        const raw = fp.prices;
                        if (!raw) return {};
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing prices:', e);
                            return {};
                        }
                    })(),
                    openingTime: fp.openclosetime,
                    closingTime: fp.openclosetime,
                    discounted: fp.discounted,
                    equipmentList: fp.equipmentList,
                    popularityScore: fp.popularityScore,
                    averageSessionDuration: fp.averageSessionDuration
                };
            });
            
            return mappedFacialPlaces;
        } catch (error) {
            // Handle specific error cases gracefully
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorCode = (error as any)?.code;
            
            if (errorCode === 404) {
                console.warn('⚠️ Facial places collection not found - collection may not exist yet');
            } else if (errorCode === 401 || errorCode === 403) {
                console.warn('⚠️ No permission to access facial places collection');
            } else {
                console.error('❌ Error fetching facial places:', errorMessage);
            }
            
            return [];
        }
    }
};

// ================================
// Hotel Service
// ================================
export const hotelService = {
    async getHotels(): Promise<any[]> {
        try {
            // Check if hotels collection is enabled
            if (!APPWRITE_CONFIG.collections.hotels) {
                console.warn('⚠️ Hotels collection is disabled - returning empty array');
                return [];
            }
            
            console.log('🏨 Fetching hotels from collection:', APPWRITE_CONFIG.collections.hotels);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotels,
                [Query.limit(100)] // Get up to 100 hotels
            );
            console.log('✅ Hotels fetched successfully:', response.documents.length);
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching hotels:', error);
            // Log specific error details to help with debugging
            if (error instanceof Error) {
                console.error('Hotel fetch error details:', {
                    message: error.message,
                    name: error.name
                });
                
                if (error.message.includes('Collection with the requested ID could not be found')) {
                    console.error('💡 Hotels collection not found. Check collection ID in appwrite.config.ts');
                }
            }
            return [];
        }
    },
    async getHotelById(id: string): Promise<any> {
        try {
            // Check if hotels collection is enabled
            if (!APPWRITE_CONFIG.collections.hotels) {
                console.warn('⚠️ Hotels collection is disabled');
                return null;
            }
            
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotels,
                id
            );
            return response;
        } catch (error) {
            console.error('Error fetching hotel by ID:', error);
            throw error;
        }
    }
};

// ================================
// Agent Shares Analytics Service
// ================================
type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy';

export const agentShareAnalyticsService = {
    async trackShareInitiated(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
        platform: SharePlatform;
    }): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                ID.unique(),
                {
                    eventType: 'agent_share_initiated',
                    agentCode: params.agentCode,
                    providerType: params.providerType,
                    providerId: String(params.providerId),
                    platform: params.platform,
                    createdAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.warn('Failed to track share initiated', e);
        }
    },
    async trackShareClick(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
        platform?: SharePlatform;
        userAgent?: string;
    }): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                ID.unique(),
                {
                    eventType: 'agent_share_click',
                    agentCode: params.agentCode,
                    providerType: params.providerType,
                    providerId: String(params.providerId),
                    platform: params.platform || 'copy',
                    userAgent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
                    createdAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.warn('Failed to track share click', e);
        }
    },
    async getCountsByPlatform(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
    }): Promise<Record<SharePlatform, number>> {
        try {
            const res = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                [
                    Query.equal('eventType', 'agent_share_click'),
                    Query.equal('agentCode', params.agentCode),
                    Query.equal('providerType', params.providerType),
                    Query.equal('providerId', String(params.providerId)),
                    Query.limit(200)
                ]
            );
            const counts: Record<SharePlatform, number> = {
                whatsapp: 0,
                facebook: 0,
                twitter: 0,
                linkedin: 0,
                telegram: 0,
                copy: 0
            };
            for (const d of res.documents as any[]) {
                const p = (d.platform || 'copy') as SharePlatform;
                if (counts[p] !== undefined) counts[p]++;
            }
            return counts;
        } catch (e) {
            console.warn('Failed to fetch share click counts', e);
            return { whatsapp: 0, facebook: 0, twitter: 0, linkedin: 0, telegram: 0, copy: 0 };
        }
    }
};

// Convenience lookups by agentCode for recruits
export const recruitLookupService = {
    async therapistsByAgentCode(agentCode: string): Promise<any[]> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('agentCode', agentCode), Query.limit(100)]
            );
            return docs.documents;
        } catch (e) {
            console.warn('Failed to list therapists by agentCode', e);
            return [];
        }
    },
    async placesByAgentCode(agentCode: string): Promise<any[]> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('agentCode', agentCode), Query.limit(100)]
            );
            return docs.documents;
        } catch (e) {
            console.warn('Failed to list places by agentCode', e);
            return [];
        }
    }
};

export const userService = {
    async create(user: any): Promise<any> {
        // Users are created via authService, this stores additional user profile data
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                'unique()',
                user
            );
            return response;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    },
    async getCustomerByEmail(email: string): Promise<any | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.equal('email', email), Query.limit(1)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error fetching customer by email:', error);
            throw error;
        }
    },
    async updateCustomerById(docId: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                docId,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating customer by id:', error);
            throw error;
        }
    },
    async updateCustomerByEmail(email: string, data: any): Promise<any> {
        try {
            const existing = await userService.getCustomerByEmail(email);
            if (existing) {
                return await userService.updateCustomerById((existing as any).$id, data);
            }
            // If not exists, create minimal doc
            return await userService.create({ email, ...data });
        } catch (error) {
            console.error('Error updating customer by email:', error);
            throw error;
        }
    },
    async getByUserId(userId: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.equal('userId', userId)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error fetching user by userId:', error);
            throw error;
        }
    },
    async getByEmail(email: string): Promise<any> {
        try {
            // Search across all user collections
            const therapistResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('email', email)]
            );
            if (therapistResponse.documents.length > 0) {
                return therapistResponse.documents[0];
            }
            
            const placeResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('email', email)]
            );
            if (placeResponse.documents.length > 0) {
                return placeResponse.documents[0];
            }
            // Also check users collection for customers
            const customer = await userService.getCustomerByEmail(email);
            if (customer) return customer;
            
            return null;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        // This is generic - should know which collection to update
        // For now, implement as a pass-through
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists, // default to therapists
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
};

export const agentService = {
    async create(agent: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                'unique()',
                agent
            );
            return response;
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    },
    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching agents:', error);
            return [];
        }
    },
    async getByCode(code: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                [Query.equal('code', code)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching agent by code:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating agent:', error);
            throw error;
        }
    }
};

// ================================
// Admin Agent Overview Aggregations
// ================================
export const adminAgentOverviewService = {
    /** Count therapists referencing an agentCode */
    async countTherapistsByAgentCode(agentCode: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('agentCode', agentCode)]
            );
            return docs.total; // Appwrite provides total
        } catch (error) {
            console.error('Error counting therapists by agentCode:', error);
            return 0;
        }
    },
    /** Count places referencing an agentCode */
    async countPlacesByAgentCode(agentCode: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('agentCode', agentCode)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting places by agentCode:', error);
            return 0;
        }
    },
    /** Count visits logged for agent */
    async countVisits(agentId: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                [Query.equal('agentId', agentId)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting visits:', error);
            return 0;
        }
    },
    /** Get latest monthly metrics snapshot */
    async getLatestMonthlySnapshot(agentId: string): Promise<MonthlyAgentMetrics | null> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'monthly_agent_metrics_collection_id',
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('month'),
                    Query.limit(1)
                ]
            );
            const doc = docs.documents[0];
            if (!doc) return null;
            return {
                $id: (doc as any).$id,
                agentId: doc.agentId,
                agentCode: doc.agentCode,
                month: doc.month,
                newSignUpsCount: doc.newSignUpsCount,
                recurringSignUpsCount: doc.recurringSignUpsCount,
                targetMet: doc.targetMet,
                streakCount: doc.streakCount,
                commissionRateApplied: doc.commissionRateApplied,
                calculatedAt: doc.calculatedAt
            };
        } catch (error) {
            console.error('Error fetching latest monthly snapshot:', error);
            return null;
        }
    },
    /** Derive commission due placeholder (base + recurring) */
    calculateCommissionDue(snapshot: MonthlyAgentMetrics | null): number {
        if (!snapshot) return 0;
        const baseRate = snapshot.commissionRateApplied || 20; // percent
        const recurringRate = snapshot.targetMet ? 10 : 0;
        // Placeholder monetary assumption: each signup worth fixed 100 unit (replace with real booking revenue later)
        const assumedValuePerSignup = 100;
        const base = (snapshot.newSignUpsCount * assumedValuePerSignup) * (baseRate / 100);
        const recurring = (snapshot.recurringSignUpsCount * assumedValuePerSignup) * (recurringRate / 100);
        return Math.round(base + recurring);
    },
    /** List overview rows for all agents */
    async listAgentOverviews(): Promise<Array<{
        agentId: string; name: string; agentCode: string; tier?: string; visits: number; therapistSignups: number; placeSignups: number; monthNew: number; monthRecurring: number; targetMet: boolean; streakCount: number; commissionDue: number; payoutReady: boolean;
    }>> {
        try {
            const agents = await agentService.getAll();
            const rows: Array<any> = [];
            for (const a of agents) {
                const agentId = (a as any).$id || a.agentId;
                const [therapistCount, placeCount, visitCount, snapshot] = await Promise.all([
                    this.countTherapistsByAgentCode(a.agentCode),
                    this.countPlacesByAgentCode(a.agentCode),
                    this.countVisits(agentId),
                    this.getLatestMonthlySnapshot(agentId)
                ]);
                const commissionDue = this.calculateCommissionDue(snapshot);
                rows.push({
                    agentId,
                    name: a.name,
                    agentCode: a.agentCode,
                    tier: a.tier,
                    visits: visitCount,
                    therapistSignups: therapistCount,
                    placeSignups: placeCount,
                    monthNew: snapshot?.newSignUpsCount || 0,
                    monthRecurring: snapshot?.recurringSignUpsCount || 0,
                    targetMet: !!snapshot?.targetMet,
                    streakCount: snapshot?.streakCount || 0,
                    commissionDue,
                    payoutReady: !!(a.bankAccountNumber && a.bankName && a.bankAccountName)
                });
            }
            return rows;
        } catch (error) {
            console.error('Error building agent overviews:', error);
            return [];
        }
    }
};

// --- Auth Service (now in separate file) ---
export { authService } from './appwrite/auth.service';

// --- Translations Service ---
export const translationsService = {
    async getAll(): Promise<any> {
        try {
            // Check if translations collection is disabled
            const translationsCollection = APPWRITE_CONFIG.collections.translations;
            if (!translationsCollection) {
                console.log('🔄 Translations collection disabled, using local fallback translations');
                // Import and return local fallback immediately instead of null
                const { translations: localTranslations } = await import('../translations/index');
                return localTranslations || null; // Will trigger fallback in useTranslations
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                translationsCollection
            );
            
            // Convert array of documents to translations object
            if (response.documents.length === 0) return null;
            
            // Initialize with all supported languages
            const translations: any = {
                en: {}, gb: {}, id: {}, zh: {}, ja: {}, ko: {}, es: {}, fr: {}, de: {}, 
                it: {}, pt: {}, ru: {}, ar: {}, hi: {}, th: {}, vi: {}, nl: {}, 
                tr: {}, pl: {}, sv: {}, da: {}
            };
            
            response.documents.forEach((doc: any) => {
                const { language, Key, value } = doc; // Use the generic schema attributes
                try {
                    // Initialize language object if it doesn't exist
                    if (!translations[language]) {
                        translations[language] = {};
                    }
                    // Parse JSON value if it's a string that looks like JSON
                    const parsedValue = typeof value === 'string' && value.startsWith('{') 
                        ? JSON.parse(value) 
                        : value;
                    translations[language][Key] = parsedValue;
                } catch {
                    // Initialize language object if it doesn't exist
                    if (!translations[language]) {
                        translations[language] = {};
                    }
                    translations[language][Key] = value;
                }
            });

            // Ensure GB mirrors EN if missing
            if (translations.en) {
                translations.gb = translations.gb || {};
                for (const k of Object.keys(translations.en)) {
                    if (translations.gb[k] === undefined) translations.gb[k] = translations.en[k];
                }
            }
            
            return translations;
        } catch (error) {
            console.error('Error fetching translations:', error);
            return null;
        }
    },

    async set(language: string, key: string, value: any): Promise<void> {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        
        try {
            console.log(`🔄 Setting translation: ${language}.${key} = "${stringValue.substring(0, 100)}${stringValue.length > 100 ? '...' : ''}"`);

            // For large values, split them into smaller parts
            if (stringValue.length > 900) {
                console.log(`📦 Large translation detected (${stringValue.length} chars), splitting into chunks...`);
                await this.setLargeTranslation(language, key, stringValue);
                return;
            }

            // Check if a document with this language+key combination already exists
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                [
                    Query.equal('language', language),
                    Query.equal('Key', key)
                ]
            );
            
            // Prepare data for both schema formats
            const baseData = {
                language: language,
                Key: key,
                value: stringValue, // Keep full value in the generic field (65000 char limit)
                lastUpdated: new Date().toISOString(),
                autoTranslated: true
            };
            
            // Add individual language columns with safe values
            const languageData: any = { ...baseData };
            
            // Set required language fields - use short summary for large content
            const safeValue = stringValue.length > 900 ? `${stringValue.substring(0, 900)}...` : stringValue;
            languageData.en = language === 'en' ? safeValue : '';
            // Do not write a 'gb' column (alias of en) to avoid schema issues
            languageData.id = language === 'id' ? safeValue : '';
            
            // Set optional language fields only if they match the current language
            if (language === 'zh') languageData.zh = safeValue;
            if (language === 'ja') languageData.ja = safeValue;
            if (language === 'ko') languageData.ko = safeValue;
            if (language === 'ru') languageData.ru = safeValue;
            if (language === 'fr') languageData.fr = safeValue;
            
            if (existingDocs.documents.length > 0) {
                // Update existing document
                const docId = existingDocs.documents[0].$id;
                const existingDoc = existingDocs.documents[0];
                
                // Preserve existing language values and only update the current language
                languageData.en = language === 'en' ? safeValue : (existingDoc.en || '');
                // Do not write a 'gb' column (alias of en) to avoid schema issues
                languageData.id = language === 'id' ? safeValue : (existingDoc.id || '');
                if (language === 'zh') languageData.zh = safeValue;
                if (language === 'ja') languageData.ja = safeValue;
                if (language === 'ko') languageData.ko = safeValue;
                if (language === 'ru') languageData.ru = safeValue;
                if (language === 'fr') languageData.fr = safeValue;
                
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    docId,
                    languageData
                );
                console.log(`✅ Updated existing: ${language}.${key}`);
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    ID.unique(),
                    languageData
                );
                console.log(`✅ Created new: ${language}.${key}`);
            }
        } catch (error: any) {
            console.error('❌ Error setting translation:', error);
            throw error;
        }
    },

    async setLargeTranslation(language: string, key: string, value: string): Promise<void> {
        try {
            // Store the full value in the generic schema (which has 65000 char limit)
            const mainData: any = {
                language: language,
                Key: key,
                value: value, // Full content goes here
                lastUpdated: new Date().toISOString(),
                autoTranslated: true,
                // Set required individual columns to a summary
                en: language === 'en' ? `${value.substring(0, 900)}...` : '',
                id: language === 'id' ? `${value.substring(0, 900)}...` : ''
            };

            // Add the specific language column if it's one of the optional ones
            if (language === 'zh') mainData.zh = `${value.substring(0, 900)}...`;
            if (language === 'ja') mainData.ja = `${value.substring(0, 900)}...`;
            if (language === 'ko') mainData.ko = `${value.substring(0, 900)}...`;
            if (language === 'ru') mainData.ru = `${value.substring(0, 900)}...`;
            if (language === 'fr') mainData.fr = `${value.substring(0, 900)}...`;

            // Check if document exists
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                [
                    Query.equal('language', language),
                    Query.equal('Key', key)
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    existingDocs.documents[0].$id,
                    mainData
                );
                console.log(`✅ Updated large translation: ${language}.${key} (${value.length} chars)`);
            } else {
                // Create new
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    ID.unique(),
                    mainData
                );
                console.log(`✅ Created large translation: ${language}.${key} (${value.length} chars)`);
            }
        } catch (error: any) {
            console.error('❌ Error setting large translation:', error);
            throw error;
        }
    },

    async syncFromLocal(translations: any): Promise<void> {
        try {
            const languages = Object.keys(translations);
            
            for (const lang of languages) {
                const keys = Object.keys(translations[lang]);
                
                for (const key of keys) {
                    await this.set(lang, key, translations[lang][key]);
                    console.log(`Synced ${lang}.${key}`);
                }
            }
            
            console.log('Translation sync complete!');
        } catch (error) {
            console.error('Error syncing translations:', error);
            throw error;
        }
    }
};

// --- Review Service ---
export const reviewService = {
    async create(review: {
        providerId: number;
        providerType: 'therapist' | 'place';
        providerName: string;
        rating: number;
        comment?: string;
        whatsapp: string;
        status: 'pending' | 'approved' | 'rejected';
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                ID.unique(),
                {
                    ...review,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Review created successfully:', (response as any).$id);
            return response;
        } catch (error) {
            console.error('❌ Error creating review:', error);
            throw error;
        }
    },

    async createAnonymous(review: {
        providerId: string | number;
        providerType: 'therapist' | 'place';
        providerName: string;
        rating: number;
        reviewerName: string;
        whatsappNumber: string;
        comment?: string;
        avatar?: string;
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                ID.unique(),
                {
                    providerId: Number(review.providerId),
                    providerType: review.providerType,
                    providerName: review.providerName,
                    rating: review.rating,
                    comment: review.comment || '',
                    whatsapp: review.whatsappNumber,
                    reviewerName: review.reviewerName,
                    avatar: review.avatar || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
                    isAnonymous: true,
                    status: 'approved', // Auto-approve anonymous reviews
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Anonymous review created successfully:', (response as any).$id);
            
            // Update provider's average rating
            await this.updateProviderRating(review.providerId, review.providerType);
            
            return response;
        } catch (error) {
            console.error('❌ Error creating anonymous review:', error);
            throw error;
        }
    },

    async updateProviderRating(providerId: string | number, providerType: 'therapist' | 'place'): Promise<void> {
        try {
            // Get all approved reviews for this provider
            const reviews = await this.getByProvider(Number(providerId), providerType);
            
            if (reviews.length === 0) return;
            
            // Calculate average rating
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            const averageRating = totalRating / reviews.length;
            const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
            
            console.log(`📊 Updating ${providerType} ${providerId} rating: ${roundedRating} (from ${reviews.length} reviews)`);
            
            // Update the provider's rating
            const collectionId = providerType === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;
            
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                String(providerId),
                {
                    rating: roundedRating,
                    reviewCount: reviews.length
                }
            );
            
            console.log(`✅ Updated ${providerType} rating to ${roundedRating}`);
        } catch (error) {
            console.error('❌ Error updating provider rating:', error);
            // Don't throw - rating update failure shouldn't prevent review submission
        }
    },

    async getAll(): Promise<any[]> {
        try {
            // Check if reviews collection is disabled
            const reviewsCollection = APPWRITE_CONFIG.collections.reviews;
            if (!reviewsCollection) {
                console.log('🔄 Reviews collection disabled, returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                reviewsCollection
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },

    async getByProvider(providerId: number, providerType: 'therapist' | 'place'): Promise<any[]> {
        try {
            // Check if reviews collection is disabled
            const reviewsCollection = APPWRITE_CONFIG.collections.reviews;
            if (!reviewsCollection) {
                console.log('🔄 Reviews collection disabled, returning empty array');
                return [];
            }
            
            // Validate providerId is not null
            if (!providerId) {
                console.error('❌ Invalid providerId (null/undefined), cannot fetch reviews');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                reviewsCollection,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('providerType', providerType),
                    Query.equal('status', 'approved')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider reviews:', error);
            return [];
        }
    },

    async updateStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                reviewId,
                { status }
            );
            console.log(`✅ Review ${reviewId} ${status}`);
            return response;
        } catch (error) {
            console.error(`Error updating review status to ${status}:`, error);
            throw error;
        }
    },

    async delete(reviewId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                reviewId
            );
            console.log('✅ Review deleted:', reviewId);
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }
};

// ============================================================================
// BOOKING SERVICE - Real-time booking with Appwrite backend
// ============================================================================
export const bookingService = {
    /**
     * Validate booking time - must be at least 1 hour from now
     */
    validateBookingTime(startTime: string): { valid: boolean; message?: string } {
        try {
            const bookingTime = new Date(startTime);
            const now = new Date();
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

            if (bookingTime < oneHourFromNow) {
                return {
                    valid: false,
                    message: 'Bookings require minimum 1 hour advance notice for preparation and travel time'
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                message: 'Invalid booking time format'
            };
        }
    },

    async create(booking: {
        providerId: string;  // Changed to string to match Appwrite
        providerType: 'therapist' | 'place';
        providerName: string;
        userId?: string;
        userName?: string;
        service: '60' | '90' | '120';
        startTime: string;
        bookingDate?: string; // Optional explicit booking date
        duration?: number;  // Duration in minutes
        totalCost?: number;
        paymentMethod?: string;
        hotelId?: string;
        hotelGuestName?: string;
        hotelRoomNumber?: string;
    }): Promise<any> {
        try {
            // Validate 1-hour minimum if startTime is provided
            if (booking.startTime && booking.bookingDate) {
                const bookingDateTime = `${booking.bookingDate}T${booking.startTime}`;
                const validation = this.validateBookingTime(bookingDateTime);
                if (!validation.valid) {
                    throw new Error(validation.message);
                }
            }

            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                console.warn('⚠️ Bookings collection disabled - simulating booking creation');
                const mockBooking = {
                    $id: `mock_booking_${Date.now()}`,
                    bookingId: `mock_booking_${Date.now()}`,
                    bookingDate: booking.bookingDate || new Date().toISOString(),
                    providerId: booking.providerId,
                    providerType: booking.providerType,
                    providerName: booking.providerName,
                    service: booking.service,
                    startTime: booking.startTime,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    hotelId: booking.hotelId || null,
                    hotelGuestName: booking.hotelGuestName || null,
                    hotelRoomNumber: booking.hotelRoomNumber || null,
                    status: 'Pending',
                    duration: booking.duration || parseInt(booking.service),
                    totalCost: booking.totalCost || 0,
                    paymentMethod: booking.paymentMethod || 'Unpaid',
                    price: Math.round((booking.totalCost || 0) / 1000), // Add required price field
                    createdAt: new Date().toISOString(), // Add required createdAt field
                    oneHourNotice: true // Flag indicating 1-hour requirement acknowledged
                };
                console.log('✅ Mock booking created:', (mockBooking as any).$id);
                return mockBooking;
            }
            
            const bookingId = ID.unique();
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    bookingId: bookingId,
                    bookingDate: booking.bookingDate || new Date().toISOString(),
                    providerId: booking.providerId,
                    providerType: booking.providerType,
                    providerName: booking.providerName,
                    service: booking.service,
                    startTime: booking.startTime,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    hotelId: booking.hotelId || null,
                    hotelGuestName: booking.hotelGuestName || null,
                    hotelRoomNumber: booking.hotelRoomNumber || null,
                    status: 'Pending',
                    duration: booking.duration || parseInt(booking.service),
                    totalCost: booking.totalCost || 0,
                    paymentMethod: booking.paymentMethod || 'Unpaid',
                    price: Math.round((booking.totalCost || 0) / 1000), // Add required price field (in K format)
                    createdAt: new Date().toISOString(), // Add required createdAt field
                    responseDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minute response deadline
                    oneHourNotice: true, // Customer acknowledged 1-hour requirement
                    source: 'platform' // Mark as platform booking
                }
            );
            console.log('✅ Booking created successfully:', (response as any).$id);
            console.log('⏰ 1-hour minimum requirement enforced');
            
            // Create notification for provider
            await notificationService.create({
                providerId: parseInt(booking.providerId),
                message: `New booking request from ${booking.userName || booking.hotelGuestName || 'Guest'} for ${booking.service} minutes. Customer has been notified of 1-hour minimum preparation time.`,
                type: 'booking_request',
                bookingId: (response as any).$id
            });

            // Create payment record for therapist earnings
            if (booking.providerType === 'therapist' && booking.totalCost) {
                try {
                    await paymentService.createPayment({
                        bookingId: (response as any).$id,
                        therapistId: booking.providerId,
                        customerName: booking.userName || booking.hotelGuestName || 'Guest',
                        amount: booking.totalCost,
                        serviceDuration: booking.service,
                        paymentMethod: booking.paymentMethod
                    });
                    console.log('✅ Payment record created for therapist');
                } catch (paymentError) {
                    console.error('⚠️ Failed to create payment record:', paymentError);
                    // Don't throw - booking was successful, payment tracking failed
                }
            }
            
            return response;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw error;
        }
    },

    async getById(bookingId: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId
            );
            return response;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    async getAll(): Promise<any[]> {
        try {
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                console.warn('⚠️ Bookings collection disabled - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            return [];
        }
    },

    async getByUser(userId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    },

    async getByProvider(providerId: string, providerType: 'therapist' | 'place'): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('providerType', providerType),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider bookings:', error);
            return [];
        }
    },

    async updateStatus(
        bookingId: string, 
        status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
    ): Promise<any> {
        try {
            const nowIso = new Date().toISOString();
            const update: any = { status };
            if (status === 'Confirmed') {
                update.confirmedAt = nowIso;
                update.providerResponseStatus = 'Confirmed';
            } else if (status === 'Completed') {
                update.completedAt = nowIso;
            } else if (status === 'Cancelled') {
                update.cancelledAt = nowIso;
                update.providerResponseStatus = 'Declined';
            }

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                update
            );
            console.log(`✅ Booking ${bookingId} status updated to ${status}`);

            // Fire analytics only on Confirmed and Completed
            if (status === 'Confirmed' || status === 'Completed') {
                try {
                    const { analyticsService } = await import('../services/analyticsService');
                    const providerType = response.providerType as 'therapist' | 'place';
                    const providerId = response.providerId;
                    const amount = response.totalCost || 0;
                    if (status === 'Confirmed') {
                        await analyticsService.trackBookingCompleted(
                            Date.now(), // local synthetic booking id for event; persisted $id may be string
                            providerId,
                            providerType,
                            amount,
                            response.userId || undefined
                        );
                    }
                    if (status === 'Completed' && amount > 0) {
                        await analyticsService.trackRevenue(providerId, providerType, amount);
                    }

                    // Increment provider's bookings counter in analytics JSON
                    try {
                        const collectionId = providerType === 'therapist' 
                            ? APPWRITE_CONFIG.collections.therapists 
                            : APPWRITE_CONFIG.collections.places;
                        if (collectionId) {
                            const providerDoc = await databases.getDocument(
                                APPWRITE_CONFIG.databaseId,
                                collectionId,
                                providerId.toString()
                            );
                            let analyticsObj: any = {};
                            try {
                                if (providerDoc.analytics) {
                                    analyticsObj = JSON.parse(providerDoc.analytics);
                                }
                            } catch { analyticsObj = {}; }
                            const currentBookings = typeof analyticsObj.bookings === 'number' ? analyticsObj.bookings : 0;
                            analyticsObj.bookings = currentBookings + 1;
                            const updatedAnalytics = JSON.stringify(analyticsObj);
                            await databases.updateDocument(
                                APPWRITE_CONFIG.databaseId,
                                collectionId,
                                providerId.toString(),
                                { analytics: updatedAnalytics }
                            );
                            console.log(`📈 Incremented bookings for provider ${providerId} (${providerType}) to ${analyticsObj.bookings}`);
                        }
                    } catch (incErr) {
                        console.warn('⚠️ Failed to increment provider bookings count:', (incErr as any)?.message);
                    }
                } catch (e) {
                    console.warn('⚠️ Analytics tracking failed for booking status transition:', (e as any)?.message);
                }
            }
            return response;
        } catch (error) {
            console.error(`Error updating booking status to ${status}:`, error);
            throw error;
        }
    },

    async confirm(bookingId: string): Promise<any> {
        return this.updateStatus(bookingId, 'Confirmed');
    },

    async complete(bookingId: string): Promise<any> {
        return this.updateStatus(bookingId, 'Completed');
    },

    async decline(bookingId: string, reason?: string): Promise<any> {
        // Reuse cancel logic but mark providerResponseStatus
        try {
            const nowIso = new Date().toISOString();
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    status: 'Cancelled',
                    cancelledAt: nowIso,
                    providerResponseStatus: 'Declined',
                    cancellationReason: reason || null
                }
            );
            console.log(`✅ Booking ${bookingId} declined${reason ? ' (' + reason + ')' : ''}`);
            return response;
        } catch (error) {
            console.error('Error declining booking:', error);
            throw error;
        }
    },

    async updatePayment(
        bookingId: string,
        paymentMethod: string,
        totalCost: number
    ): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    paymentMethod,
                    totalCost
                }
            );
            console.log(`✅ Booking ${bookingId} payment updated`);
            return response;
        } catch (error) {
            console.error('Error updating booking payment:', error);
            throw error;
        }
    },

    async getPending(providerId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('status', 'Pending')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            return [];
        }
    },

    async getByHotel(hotelId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('hotelId', hotelId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching hotel bookings:', error);
            return [];
        }
    },

    async delete(bookingId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId
            );
            console.log('✅ Booking deleted:', bookingId);
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    async cancel(bookingId: string, reason?: string): Promise<void> {
        try {
            const nowIso = new Date().toISOString();
            try {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    bookingId,
                    {
                        status: 'Cancelled',
                        cancelledAt: nowIso,
                        // Attempt to persist reason if attribute exists
                        cancellationReason: reason || null
                    }
                );
            } catch (updateErr) {
                console.warn('⚠️ Full cancel update failed, retrying without reason:', (updateErr as any)?.message);
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    bookingId,
                    {
                        status: 'Cancelled',
                        cancelledAt: nowIso
                    }
                );
            }

            try {
                await notificationService.create({
                    type: 'booking_cancelled',
                    message: `Booking ${bookingId} was cancelled${reason ? `: ${reason}` : ''}.`,
                    bookingId
                });
            } catch (notifyErr) {
                console.warn('⚠️ Failed to send cancellation notification:', (notifyErr as any)?.message);
            }

            console.log('✅ Booking cancelled:', bookingId);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    }
};

// ============================================================================
// NOTIFICATION SERVICE - Push notifications and in-app alerts
// ============================================================================
export const notificationService = {
    async create(notification: {
        providerId?: number;
        message: string;
        type?: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'review_received' | 'promotion' | 'system' | 'whatsapp_contact' | 'place_profile_pending' | 'place_profile_approved' | 'place_profile_rejected';
        bookingId?: string;
        // New admin notification fields
        title?: string;
        recipientType?: 'admin' | 'place' | 'therapist' | 'user';
        recipientId?: string;
        data?: any;
        priority?: 'low' | 'medium' | 'high';
        isRead?: boolean;
    }): Promise<any> {
        try {
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.warn('⚠️ Notifications collection disabled - simulating notification creation');
                const mockNotification = {
                    $id: `mock_notification_${Date.now()}`,
                    ...notification,
                    isRead: notification.isRead || false,
                    createdAt: new Date().toISOString()
                };
                console.log('✅ Mock notification created:', (mockNotification as any).$id);
                return mockNotification;
            }
            
            const notificationId = ID.unique();
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId,
                {
                    ...notification,
                    notificationId: notificationId,
                    isRead: notification.isRead || false,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Notification created:', (response as any).$id);
            
            // TODO: Integrate with push notification service (Firebase/OneSignal)
            // await this.sendPushNotification(notification.providerId, notification.message);
            
            return response;
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            throw error;
        }
    },

    async getAll(): Promise<any[]> {
        try {
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.warn('⚠️ Notifications collection disabled - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            return [];
        }
    },

    async update(notificationId: string, updateData: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId,
                updateData
            );
            console.log('✅ Notification updated:', notificationId);
            return response;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    },

    async getByProvider(providerId: number): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.equal('providerId', providerId),
                    Query.orderDesc('createdAt'),
                    Query.limit(50)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async getUnread(providerId: number | string): Promise<any[]> {
        try {
            // 🔒 SECURITY FIX: Check if notifications collection is configured
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.log('ℹ️ Notifications collection not configured - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('isRead', false),
                    Query.orderDesc('createdAt')
                ]
            );
            return response.documents;
        } catch (error) {
            // Silently handle missing notifications collection or permissions
            if ((error as any)?.message?.includes('Collection with the requested ID could not be found') ||
                (error as any)?.message?.includes('missing scopes') ||
                (error as any)?.message?.includes('Unauthorized')) {
                console.log('ℹ️ Notifications not available - collection disabled or insufficient permissions');
            } else {
                console.error('Error fetching unread notifications:', error);
            }
            return [];
        }
    },

    async markAsRead(notificationId: string): Promise<any> {
        try {
            // 🔒 SECURITY FIX: Check if notifications collection is configured
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.log('ℹ️ Notifications collection not configured - skipping mark as read');
                return null;
            }
            
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId,
                { isRead: true }
            );
            console.log('✅ Notification marked as read:', notificationId);
            return response;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    async markAllAsRead(providerId: number): Promise<void> {
        try {
            const unreadNotifications = await this.getUnread(providerId);
            await Promise.all(
                unreadNotifications.map(notification => 
                    this.markAsRead((notification as any).$id)
                )
            );
            console.log('✅ All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Create WhatsApp contact notification
    async createWhatsAppContactNotification(providerId: number, providerName: string): Promise<any> {
        try {
            const notification = await this.create({
                providerId,
                message: `Someone clicked "Chat Now" to contact you on WhatsApp!`,
                type: 'whatsapp_contact'
            });
            
            console.log(`📱 WhatsApp contact notification created for provider ${providerName} (ID: ${providerId})`);
            return notification;
        } catch (error) {
            console.error('Error creating WhatsApp contact notification:', error);
            // Don't throw - we don't want to break the WhatsApp flow if notification fails
            return null;
        }
    },

    async delete(notificationId: string): Promise<void> {
        try {
            // 🔒 SECURITY FIX: Check if notifications collection is configured
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.log('ℹ️ Notifications collection not configured - skipping delete');
                return;
            }
            
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId
            );
            console.log('✅ Notification deleted:', notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

// ============================================================================
// MESSAGING SERVICE - In-app chat between users and providers
// ============================================================================
export const messagingService = {
    /**
     * Generate consistent conversation ID for two users
     * Format: role1_userId1_role2_userId2 (alphabetically sorted by userId)
     */
    generateConversationId(
        user1: { id: string; role: string },
        user2: { id: string; role: string }
    ): string {
        const participants = [user1, user2].sort((a, b) => a.id.localeCompare(b.id));
        return `${participants[0].role}_${participants[0].id}_${participants[1].role}_${participants[1].id}`;
    },
    async sendMessage(message: {
        conversationId: string;
        senderId: string;
        senderType: 'user' | 'therapist' | 'place';
        senderName: string;
        receiverId: string;
        receiverType: 'user' | 'therapist' | 'place';
        receiverName: string;
        content: string;
        bookingId?: string;
    }): Promise<any> {
        try {
            const messageId = ID.unique();
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages',
                messageId,
                {
                    messageId: messageId,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    senderRole: message.senderType,
                    senderType: message.senderType,
                    recipientId: message.receiverId,
                    receiverId: message.receiverId,
                    receiverName: message.receiverName,
                    receiverRole: message.receiverType,
                    message: message.content, // Full message (10000 char limit)
                    content: message.content.substring(0, 1000), // Truncate to 1000 chars for Appwrite limit
                    messageType: 'text',
                    bookingId: message.bookingId || null,
                    metadata: null,
                    isRead: false,
                    sentAt: new Date().toISOString()
                }
            );
            console.log('✅ Message sent:', (response as any).$id);
            
            // Create notification for receiver (only if receiverId is a valid number)
            if (message.receiverType === 'therapist' || message.receiverType === 'place') {
                try {
                    const receiverIdNum = parseInt(message.receiverId);
                    if (!isNaN(receiverIdNum)) {
                        await notificationService.create({
                            providerId: receiverIdNum,
                            message: `New message from ${message.senderName}`,
                            type: 'system',
                            bookingId: message.bookingId
                        });
                    }
                } catch (notifError) {
                    console.warn('⚠️ Could not create notification:', notifError);
                }
            }
            
            return response;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    },

    async getConversation(conversationId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages',
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('sentAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return [];
        }
    },

    async getUserConversations(userId: string): Promise<any[]> {
        try {
            // Get all messages where user is sender or receiver
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages',
                [
                    Query.or([
                        Query.equal('senderId', userId),
                        Query.equal('receiverId', userId)
                    ]),
                    Query.orderDesc('sentAt'),
                    Query.limit(100)
                ]
            );
            
            // Group by conversationId and get latest message per conversation
            const conversations = new Map();
            response.documents.forEach((msg: any) => {
                if (!conversations.has(msg.conversationId)) {
                    conversations.set(msg.conversationId, msg);
                }
            });
            
            return Array.from(conversations.values());
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            return [];
        }
    },

    async markAsRead(messageId: string): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages_collection_id',
                messageId,
                { isRead: true }
            );
            return response;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }
};

// ============================================================================
// PRICING SERVICE - Dynamic pricing with discounts and packages
// ============================================================================
export const pricingService = {
    async getPricing(
        _providerId: number, // Reserved for future provider-specific pricing
        _providerType: 'therapist' | 'place', // Reserved for future provider-specific pricing
        serviceType: '60' | '90' | '120',
        options?: {
            isHotelGuest?: boolean;
            agentReferral?: boolean;
            promotionCode?: string;
            dayOfWeek?: number; // 0-6, Sunday-Saturday
            timeOfDay?: number; // Hour 0-23
        }
    ): Promise<{
        basePrice: number;
        discounts: Array<{ type: string; amount: number; reason: string }>;
        surcharges: Array<{ type: string; amount: number; reason: string }>;
        finalPrice: number;
        commission: number;
        providerEarnings: number;
    }> {
        try {
            // Base prices (in IDR)
            const basePrices: Record<string, number> = {
                '60': 200000,
                '90': 300000,
                '120': 400000
            };
            
            const basePrice = basePrices[serviceType];
            const discounts: Array<{ type: string; amount: number; reason: string }> = [];
            const surcharges: Array<{ type: string; amount: number; reason: string }> = [];
            
            // Apply hotel guest discount (10%)
            if (options?.isHotelGuest) {
                discounts.push({
                    type: 'hotel_guest',
                    amount: basePrice * 0.10,
                    reason: 'Hotel Guest Discount'
                });
            }
            
            // Apply agent referral discount (5%)
            if (options?.agentReferral) {
                discounts.push({
                    type: 'agent_referral',
                    amount: basePrice * 0.05,
                    reason: 'Agent Referral Discount'
                });
            }
            
            // Weekend surcharge (Friday-Sunday, +15%)
            if (options?.dayOfWeek && [5, 6, 0].includes(options.dayOfWeek)) {
                surcharges.push({
                    type: 'weekend',
                    amount: basePrice * 0.15,
                    reason: 'Weekend Premium'
                });
            }
            
            // Peak hours surcharge (6PM-10PM, +20%)
            if (options?.timeOfDay && options.timeOfDay >= 18 && options.timeOfDay < 22) {
                surcharges.push({
                    type: 'peak_hours',
                    amount: basePrice * 0.20,
                    reason: 'Peak Hours Premium'
                });
            }
            
            // Early bird discount (6AM-9AM, -10%)
            if (options?.timeOfDay && options.timeOfDay >= 6 && options.timeOfDay < 9) {
                discounts.push({
                    type: 'early_bird',
                    amount: basePrice * 0.10,
                    reason: 'Early Bird Special'
                });
            }
            
            // Calculate final price
            const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);
            const totalSurcharges = surcharges.reduce((sum, s) => sum + s.amount, 0);
            const finalPrice = Math.round(basePrice - totalDiscounts + totalSurcharges);
            
            // Platform commission (30% - standard rate for all bookings)
            const commission = Math.round(finalPrice * 0.30);
            const providerEarnings = finalPrice - commission;
            
            return {
                basePrice,
                discounts,
                surcharges,
                finalPrice,
                commission,
                providerEarnings
            };
        } catch (error) {
            console.error('Error calculating pricing:', error);
            throw error;
        }
    },

    async createPackage(packageData: {
        name: string;
        description: string;
        providerId: number;
        providerType: 'therapist' | 'place';
        services: Array<{ type: '60' | '90' | '120'; quantity: number }>;
        discountPercentage: number;
        validUntil?: string;
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.packages || 'packages_collection_id', // Add to config
                ID.unique(),
                {
                    ...packageData,
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Package created:', (response as any).$id);
            return response;
        } catch (error) {
            console.error('❌ Error creating package:', error);
            throw error;
        }
    },

    async getActivePackages(providerId: number): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.packages || 'packages_collection_id',
                [
                    Query.equal('providerId', providerId),
                    Query.equal('isActive', true)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching packages:', error);
            return [];
        }
    }
};

// ============================================================================
// VERIFICATION SERVICE - Verified badge for therapists/places
// ============================================================================
export const verificationService = {
    async checkEligibility(providerId: number, providerType: 'therapist' | 'place'): Promise<{
        isEligible: boolean;
        reason: string;
        accountAge: number; // in days
        completedBookings: number;
        averageRating: number;
    }> {
        try {
            // Get provider data
            const provider = providerType === 'therapist' 
                ? await therapistService.getById(providerId.toString())
                : await placesService.getById(providerId.toString());
            
            if (!provider) {
                return {
                    isEligible: false,
                    reason: 'Provider not found',
                    accountAge: 0,
                    completedBookings: 0,
                    averageRating: 0
                };
            }
            
            // Calculate account age
            const createdAt = new Date(provider.createdAt || provider.$createdAt);
            const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            
            // Get completed bookings
            const bookings = await bookingService.getByProvider(providerId.toString(), providerType);
            const completedBookings = bookings.filter((b: any) => b.status === 'Completed').length;
            
            // Get reviews and calculate average rating
            const reviews = await reviewService.getByProvider(providerId, providerType);
            const averageRating = reviews.length > 0
                ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                : 0;
            
            // Verification criteria
            const minAccountAge = 90; // 3 months
            const minBookings = 10;
            const minRating = 4.0;
            
            const isEligible = 
                accountAge >= minAccountAge &&
                completedBookings >= minBookings &&
                averageRating >= minRating;
            
            let reason = '';
            if (!isEligible) {
                if (accountAge < minAccountAge) {
                    reason = `Account must be ${minAccountAge} days old (currently ${accountAge} days)`;
                } else if (completedBookings < minBookings) {
                    reason = `Need ${minBookings} completed bookings (currently ${completedBookings})`;
                } else if (averageRating < minRating) {
                    reason = `Need ${minRating} average rating (currently ${averageRating.toFixed(1)})`;
                }
            } else {
                reason = 'Eligible for verification badge';
            }
            
            return {
                isEligible,
                reason,
                accountAge,
                completedBookings,
                averageRating
            };
        } catch (error) {
            console.error('Error checking verification eligibility:', error);
            throw error;
        }
    },

    async applyForVerification(providerId: number, providerType: 'therapist' | 'place'): Promise<any> {
        try {
            const eligibility = await this.checkEligibility(providerId, providerType);
            
            if (!eligibility.isEligible) {
                throw new Error(`Not eligible for verification: ${eligibility.reason}`);
            }
            
            // Update provider with verified badge
            const updateData = {
                isVerified: true,
                verifiedAt: new Date().toISOString(),
                verificationBadge: 'verified'
            };
            
            if (providerType === 'therapist') {
                await therapistService.update(providerId.toString(), updateData);
            } else {
                await placesService.update(providerId.toString(), updateData);
            }
            
            console.log(`✅ Provider ${providerId} verified`);
            
            // Create notification
            await notificationService.create({
                providerId,
                message: 'Congratulations! Your profile has been verified with a verified badge.',
                type: 'system'
            });
            
            return { success: true, ...eligibility };
        } catch (error) {
            console.error('Error applying for verification:', error);
            throw error;
        }
    },

    async revokeVerification(providerId: number, providerType: 'therapist' | 'place', reason: string): Promise<void> {
        try {
            const updateData = {
                isVerified: false,
                verifiedAt: null,
                verificationBadge: null,
                verificationRevokedAt: new Date().toISOString(),
                verificationRevokedReason: reason
            };
            
            if (providerType === 'therapist') {
                await therapistService.update(providerId.toString(), updateData);
            } else {
                await placesService.update(providerId.toString(), updateData);
            }
            
            console.log(`✅ Verification revoked for provider ${providerId}`);
            
            // Create notification
            await notificationService.create({
                providerId,
                message: `Your verification badge has been revoked. Reason: ${reason}`,
                type: 'system'
            });
        } catch (error) {
            console.error('Error revoking verification:', error);
            throw error;
        }
    }
};

// Admin Message Service
export const adminMessageService = {
    /**
     * Get messages for an agent
     */
    async getMessages(agentId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.or([
                        Query.equal('senderId', agentId),
                        Query.equal('receiverId', agentId),
                        Query.equal('receiverId', 'admin')
                    ]),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching admin messages:', error);
            return [];
        }
    },

    /**
     * Send a message
     */
    async sendMessage(data: {
        senderId: string;
        senderName: string;
        senderType: 'agent' | 'admin';
        receiverId: string;
        message: string;
    }): Promise<any> {
        try {
            const messageData = {
                ...data,
                isRead: false,
                createdAt: new Date().toISOString()
            };

            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                ID.unique(),
                messageData
            );

            console.log('✅ Message sent:', (response as any).$id);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    /**
     * Mark messages as read
     */
    async markAsRead(agentId: string): Promise<void> {
        try {
            // Get unread messages for this agent
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.equal('receiverId', agentId),
                    Query.equal('isRead', false)
                ]
            );

            // Mark each as read
            const updatePromises = response.documents.map((doc: any) =>
                databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'admin_messages',
                    (doc as any).$id,
                    { isRead: true }
                )
            );

            await Promise.all(updatePromises);
            console.log(`✅ Marked ${response.documents.length} messages as read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    /**
     * Get unread message count
     */
    async getUnreadCount(agentId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.equal('receiverId', agentId),
                    Query.equal('isRead', false)
                ]
            );
            return response.total;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
};

// Hotel/Villa Booking Service
export const hotelVillaBookingService = {
    /**
     * Create a new hotel/villa guest booking
     */
    async createBooking(bookingData: any): Promise<any> {
        try {
            // Capture affiliate code
            const booking = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                ID.unique(),
                {
                    userId: bookingData.userId || 'guest',
                    hotelId: bookingData.hotelVillaId || bookingData.hotelId,
                    bookingDateTime: bookingData.startTime || new Date().toISOString(),
                    checkInDate: bookingData.checkInDate || bookingData.startTime || new Date().toISOString(),
                    checkOutDate: bookingData.checkOutDate || bookingData.endTime || new Date().toISOString(),
                    numberOfGuests: bookingData.numberOfGuests || 1,
                    roomType: bookingData.roomType || 'standard',
                    bookingId: bookingData.bookingId || `BK${Date.now()}`,
                    therapistId: bookingData.providerId || '',
                    therapistName: bookingData.providerName || '',
                    hotelName: bookingData.hotelVillaName || bookingData.hotelName || '',
                    hotelLocation: bookingData.hotelLocation || '',
                    guestName: bookingData.guestName || bookingData.userName || '',
                    roomNumber: bookingData.roomNumber || '',
                    duration: bookingData.duration || '60',
                    bookingTime: bookingData.startTime || new Date().toISOString(),
                    status: bookingData.status || 'pending',
                    price: bookingData.price || 0,
                    createdAt: new Date().toISOString()
                }
            );
            
            console.log('✅ Hotel/Villa booking created:', (booking as any).$id);
            return booking;
        } catch (error) {
            console.error('Error creating hotel/villa booking:', error);
            throw error;
        }
    },

    /**
     * Get all bookings for a hotel/villa
     */
    async getBookingsByVenue(venueId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                [
                    Query.equal('hotelId', venueId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching venue bookings:', error);
            return [];
        }
    },

    /**
     * Get all bookings for a provider/therapist
     */
    async getBookingsByProvider(providerId: string, _providerType?: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                [
                    Query.equal('therapistId', providerId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider bookings:', error);
            return [];
        }
    },

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<any> {
        try {
            const booking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                bookingId
            );
            return booking;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    /**
     * Update booking status
     */
    async updateBooking(bookingId: string, updates: any): Promise<any> {
        try {
            const booking = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                bookingId,
                updates
            );
            console.log('✅ Booking updated:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    /**
     * Provider confirms the booking
     */
    async confirmBooking(bookingId: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'confirmed',
                confirmedAt: new Date().toISOString()
            });
            console.log('✅ Booking confirmed:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    },

    /**
     * Provider indicates on the way
     */
    async setOnTheWay(bookingId: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'on_the_way'
            });
            console.log('✅ Provider on the way:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error setting on the way:', error);
            throw error;
        }
    },

    /**
     * Provider declines the booking
     */
    async declineBooking(bookingId: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'declined'
            });
            console.log('✅ Booking declined:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error declining booking:', error);
            throw error;
        }
    },

    /**
     * Complete a booking
     */
    async completeBooking(bookingId: string): Promise<any> {
        try {
            // First get the booking details
            const bookingDetails = await this.getBookingById(bookingId);
            
            const booking = await this.updateBooking(bookingId, {
                status: 'completed',
                completedAt: new Date().toISOString()
            });
            
            // Note: Coin awarding system has been disabled and moved to deleted folder
            
            console.log('✅ Booking completed:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error completing booking:', error);
            throw error;
        }
    },

    /**
     * Helper method to check if date is weekend
     */
    isWeekend(date: Date): boolean {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    },

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string, reason?: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'cancelled'
            });
            console.log('✅ Booking cancelled:', bookingId, reason ? `- ${reason}` : '');
            return booking;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },

    /**
     * Find alternative providers within radius
     * Note: venueId reserved for future geolocation filtering
     */
    async findAlternativeProviders(
        _venueId: string,
        excludeIds: string[],
        providerType: 'therapist' | 'place'
    ): Promise<any[]> {
        try {
            const collectionId = providerType === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;

            // Query for available providers
            // Note: Distance filtering would require geolocation implementation
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [
                    Query.equal('status', 'available'),
                    Query.equal('hotelVillaServiceStatus', 'active'),
                    Query.limit(10)
                ]
            );

            // Filter out excluded IDs (since Query.notIn might not be available)
            const providers = response.documents.filter(
                (provider: any) => !excludeIds.includes((provider as any).$id)
            );

            return providers;
        } catch (error) {
            console.error('Error finding alternative providers:', error);
            return [];
        }
    },

    /**
     * Reassign booking to new provider
     */
    async reassignBooking(bookingId: string, newProviderId: string, newProviderName: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                therapistId: newProviderId,
                therapistName: newProviderName,
                status: 'pending'
            });

            console.log('✅ Booking reassigned:', bookingId, 'to', newProviderName);
            return booking;
        } catch (error) {
            console.error('Error reassigning booking:', error);
            throw error;
        }
    }
};

// ================================
// Agent Visit Service
// ================================

export const agentVisitService = {
    /**
     * Create a new agent visit record
     */
    async createVisit(visit: AgentVisit): Promise<AgentVisit> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                ID.unique(),
                {
                    agentId: visit.agentId.toString(),
                    agentName: visit.agentName,
                    agentCode: visit.agentCode,
                    providerName: visit.providerName,
                    providerType: visit.providerType,
                    whatsappNumber: visit.whatsappNumber,
                    visitDate: visit.visitDate,
                    locationLat: visit.location.lat,
                    locationLng: visit.location.lng,
                    locationAddress: visit.location.address,
                    locationTimestamp: visit.location.timestamp,
                    meetingNotes: visit.meetingNotes,
                    callbackDate: visit.callbackDate || '',
                    membershipAgreed: visit.membershipAgreed,
                    status: visit.status,
                    createdAt: visit.createdAt,
                    updatedAt: visit.updatedAt || ''
                }
            );

            console.log('✅ Agent visit created:', (response as any).$id);
            
            return {
                ...visit,
                $id: (response as any).$id
            };
        } catch (error) {
            console.error('Error creating agent visit:', error);
            throw error;
        }
    },

    /**
     * Get all visits by a specific agent
     */
    async getVisitsByAgent(agentId: string): Promise<AgentVisit[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );

            return response.documents.map((doc: any) => ({
                $id: (doc as any).$id,
                agentId: doc.agentId,
                agentName: doc.agentName,
                agentCode: doc.agentCode,
                providerName: doc.providerName,
                providerType: doc.providerType,
                whatsappNumber: doc.whatsappNumber,
                visitDate: doc.visitDate,
                location: {
                    lat: doc.locationLat,
                    lng: doc.locationLng,
                    address: doc.locationAddress,
                    timestamp: doc.locationTimestamp
                },
                meetingNotes: doc.meetingNotes,
                callbackDate: doc.callbackDate || undefined,
                membershipAgreed: doc.membershipAgreed,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt || undefined
            }));
        } catch (error) {
            console.error('Error fetching agent visits:', error);
            return [];
        }
    },

    /**
     * Get all visits (Admin only)
     */
    async getAllVisits(filters?: {
        agentId?: string;
        providerType?: 'therapist' | 'place';
        membershipAgreed?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<AgentVisit[]> {
        try {
            const queries: string[] = [
                Query.orderDesc('createdAt'),
                Query.limit(500)
            ];

            // Add filters if provided
            if (filters?.agentId) {
                queries.push(Query.equal('agentId', filters.agentId));
            }
            if (filters?.providerType) {
                queries.push(Query.equal('providerType', filters.providerType));
            }
            if (filters?.membershipAgreed && filters.membershipAgreed !== 'all') {
                queries.push(Query.equal('membershipAgreed', filters.membershipAgreed));
            }
            if (filters?.status && filters.status !== 'all') {
                queries.push(Query.equal('status', filters.status));
            }

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                queries
            );

            let visits = response.documents.map((doc: any) => ({
                $id: (doc as any).$id,
                agentId: doc.agentId,
                agentName: doc.agentName,
                agentCode: doc.agentCode,
                providerName: doc.providerName,
                providerType: doc.providerType,
                whatsappNumber: doc.whatsappNumber,
                visitDate: doc.visitDate,
                location: {
                    lat: doc.locationLat,
                    lng: doc.locationLng,
                    address: doc.locationAddress,
                    timestamp: doc.locationTimestamp
                },
                meetingNotes: doc.meetingNotes,
                callbackDate: doc.callbackDate || undefined,
                membershipAgreed: doc.membershipAgreed,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt || undefined
            }));

            // Client-side date filtering (since Appwrite Query might not support date range)
            if (filters?.dateFrom) {
                visits = visits.filter((visit: any) => 
                    new Date(visit.visitDate) >= new Date(filters.dateFrom!)
                );
            }
            if (filters?.dateTo) {
                visits = visits.filter((visit: any) => 
                    new Date(visit.visitDate) <= new Date(filters.dateTo!)
                );
            }

            return visits;
        } catch (error) {
            console.error('Error fetching all visits:', error);
            return [];
        }
    },

    /**
     * Update a visit record
     */
    async updateVisit(visitId: string, data: Partial<AgentVisit>): Promise<AgentVisit> {
        try {
            const updateData: any = {};

            if (data.providerName) updateData.providerName = data.providerName;
            if (data.providerType) updateData.providerType = data.providerType;
            if (data.whatsappNumber) updateData.whatsappNumber = data.whatsappNumber;
            if (data.meetingNotes) updateData.meetingNotes = data.meetingNotes;
            if (data.callbackDate !== undefined) updateData.callbackDate = data.callbackDate || '';
            if (data.membershipAgreed) updateData.membershipAgreed = data.membershipAgreed;
            if (data.status) updateData.status = data.status;

            updateData.updatedAt = new Date().toISOString();

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                visitId,
                updateData
            );

            console.log('✅ Agent visit updated:', visitId);

            return {
                $id: (response as any).$id,
                agentId: response.agentId,
                agentName: response.agentName,
                agentCode: response.agentCode,
                providerName: response.providerName,
                providerType: response.providerType,
                whatsappNumber: response.whatsappNumber,
                visitDate: response.visitDate,
                location: {
                    lat: response.locationLat,
                    lng: response.locationLng,
                    address: response.locationAddress,
                    timestamp: response.locationTimestamp
                },
                meetingNotes: response.meetingNotes,
                callbackDate: response.callbackDate || undefined,
                membershipAgreed: response.membershipAgreed,
                status: response.status,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt || undefined
            };
        } catch (error) {
            console.error('Error updating visit:', error);
            throw error;
        }
    },

    /**
     * Delete a visit record (Admin only)
     */
    async deleteVisit(visitId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                visitId
            );
            console.log('✅ Agent visit deleted:', visitId);
        } catch (error) {
            console.error('Error deleting visit:', error);
            throw error;
        }
    },

    /**
     * Get visit statistics for an agent
     */
    async getAgentStats(agentId: string): Promise<{
        totalVisits: number;
        completedVisits: number;
        pendingVisits: number;
        followupRequired: number;
        membershipsSigned: {
            '1month': number;
            '3month': number;
            '6month': number;
            '1year': number;
        };
    }> {
        try {
            const visits = await this.getVisitsByAgent(agentId);

            const stats = {
                totalVisits: visits.length,
                completedVisits: visits.filter(v => v.status === 'completed').length,
                pendingVisits: visits.filter(v => v.status === 'pending').length,
                followupRequired: visits.filter(v => v.status === 'followup_required').length,
                membershipsSigned: {
                    '1month': visits.filter(v => v.membershipAgreed === '1month').length,
                    '3month': visits.filter(v => v.membershipAgreed === '3month').length,
                    '6month': visits.filter(v => v.membershipAgreed === '6month').length,
                    '1year': visits.filter(v => v.membershipAgreed === '1year').length
                }
            };

            return stats;
        } catch (error) {
            console.error('Error getting agent stats:', error);
            return {
                totalVisits: 0,
                completedVisits: 0,
                pendingVisits: 0,
                followupRequired: 0,
                membershipsSigned: {
                    '1month': 0,
                    '3month': 0,
                    '6month': 0,
                    '1year': 0
                }
            };
        }
    }
};

// ================================
// Monthly Agent Metrics Service
// ================================

export const monthlyAgentMetricsService = {
    /**
     * List monthly metrics snapshots for an agent (latest first)
     */
    async listByAgent(agentId: string, limit: number = 12): Promise<MonthlyAgentMetrics[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'monthly_agent_metrics_collection_id', // collection ID placeholder; ensure config mapping added if needed
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('month'),
                    Query.limit(limit)
                ]
            );
            return response.documents.map((doc: any) => ({
                $id: (doc as any).$id,
                agentId: doc.agentId,
                agentCode: doc.agentCode,
                month: doc.month,
                newSignUpsCount: doc.newSignUpsCount,
                recurringSignUpsCount: doc.recurringSignUpsCount,
                targetMet: doc.targetMet,
                streakCount: doc.streakCount,
                commissionRateApplied: doc.commissionRateApplied,
                calculatedAt: doc.calculatedAt,
            }));
        } catch (error) {
            console.error('Error listing monthly agent metrics:', error);
            return [];
        }
    },
    /**
     * Get the latest snapshot for an agent
     */
    async getLatest(agentId: string): Promise<MonthlyAgentMetrics | null> {
        const list = await this.listByAgent(agentId, 1);
        return list[0] || null;
    }
};

// --- Member Stats Service ---
export const memberStatsService = {
    /**
     * Get stats for a member for a specific month
     */
    async getStatsByMonth(memberId: string, month: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'member_stats',
                [
                    Query.equal('memberId', memberId),
                    Query.equal('month', month),
                    Query.limit(1)
                ]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching member stats:', error);
            return null;
        }
    },

    /**
     * Get current month stats for a member
     */
    async getCurrentMonthStats(memberId: string): Promise<any> {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        return this.getStatsByMonth(memberId, currentMonth);
    },

    /**
     * Increment clicks for a member
     */
    async incrementClicks(memberId: string, memberType: string): Promise<void> {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const stats = await this.getStatsByMonth(memberId, currentMonth);
            
            if (stats) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'member_stats',
                    (stats as any).$id,
                    {
                        clicksCount: stats.clicksCount + 1,
                        lastUpdated: new Date().toISOString()
                    }
                );
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    'member_stats',
                    ID.unique(),
                    {
                        memberId,
                        memberType,
                        month: currentMonth,
                        clicksCount: 1,
                        viewsCount: 0,
                        bookingsCount: 0,
                        revenue: 0,
                        lastUpdated: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.error('Error incrementing clicks:', error);
        }
    },

    /**
     * Increment views for a member
     */
    async incrementViews(memberId: string, memberType: string): Promise<void> {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const stats = await this.getStatsByMonth(memberId, currentMonth);
            
            if (stats) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'member_stats',
                    (stats as any).$id,
                    {
                        viewsCount: stats.viewsCount + 1,
                        lastUpdated: new Date().toISOString()
                    }
                );
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    'member_stats',
                    ID.unique(),
                    {
                        memberId,
                        memberType,
                        month: currentMonth,
                        clicksCount: 0,
                        viewsCount: 1,
                        bookingsCount: 0,
                        revenue: 0,
                        lastUpdated: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    },

    /**
     * Update revenue for a member
     */
    async updateRevenue(memberId: string, memberType: string, amount: number): Promise<void> {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const stats = await this.getStatsByMonth(memberId, currentMonth);
            
            if (stats) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'member_stats',
                    (stats as any).$id,
                    {
                        revenue: stats.revenue + amount,
                        bookingsCount: stats.bookingsCount + 1,
                        lastUpdated: new Date().toISOString()
                    }
                );
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    'member_stats',
                    ID.unique(),
                    {
                        memberId,
                        memberType,
                        month: currentMonth,
                        clicksCount: 0,
                        viewsCount: 0,
                        bookingsCount: 1,
                        revenue: amount,
                        lastUpdated: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.error('Error updating revenue:', error);
        }
    }
};

// --- Subscription Service ---
export const subscriptionService = {
    /**
     * Get subscription for a member
     */
    async getSubscription(memberId: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                [
                    Query.equal('memberId', memberId),
                    Query.limit(1)
                ]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            return null;
        }
    },

    /**
     * Get all subscriptions
     */
    async getAllSubscriptions(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                [Query.limit(1000)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching all subscriptions:', error);
            return [];
        }
    },

    /**
     * Get subscriptions with payments due within specified days
     */
    async getDueSoon(days: number = 7): Promise<any[]> {
        try {
            const now = new Date();
            const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                [
                    Query.lessThanEqual('nextPaymentDate', futureDate.toISOString()),
                    Query.greaterThanEqual('nextPaymentDate', now.toISOString()),
                    Query.equal('subscriptionStatus', 'active'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching due soon subscriptions:', error);
            return [];
        }
    },

    /**
     * Get overdue subscriptions
     */
    async getOverdue(): Promise<any[]> {
        try {
            const now = new Date();
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                [
                    Query.lessThan('nextPaymentDate', now.toISOString()),
                    Query.equal('subscriptionStatus', 'active'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching overdue subscriptions:', error);
            return [];
        }
    },

    /**
     * Update subscription
     */
    async updateSubscription(subscriptionId: string, data: any): Promise<any> {
        try {
            return await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                subscriptionId,
                data
            );
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    },

    /**
     * Create subscription for a member
     */
    async createSubscription(data: {
        memberId: string;
        memberType: string;
        memberName: string;
        memberLocation: string;
        activationDate: string;
    }): Promise<any> {
        try {
            const nextPaymentDate = new Date(data.activationDate);
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

            return await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                ID.unique(),
                {
                    ...data,
                    currentMonth: 1,
                    monthlyFee: 0, // First month free
                    nextPaymentDate: nextPaymentDate.toISOString(),
                    subscriptionStatus: 'active',
                    notes: ''
                }
            );
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }
};

// --- Payment Service ---
export const paymentService = {
    /**
     * Create a payment record for therapist earnings from booking
     */
    async createPayment(data: {
        bookingId: string;
        therapistId: string;
        customerName: string;
        amount: number;
        serviceDuration: string;
        paymentMethod?: string;
    }): Promise<any> {
        try {
            const commissionRate = 0.30; // 30% admin commission
            const adminCommission = Math.round(data.amount * commissionRate);
            const netEarning = data.amount - adminCommission;

            const paymentId = ID.unique();
            const now = new Date().toISOString();

            return await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.payments,
                paymentId,
                {
                    paymentId: paymentId,
                    bookingId: data.bookingId,
                    transactionDate: now,
                    paymentAmount: data.amount,
                    paymentMethod: data.paymentMethod || 'Cash',
                    currency: 'IDR',
                    status: 'pending',
                    therapistId: data.therapistId,
                    customerName: data.customerName,
                    amount: Math.round(data.amount / 1000), // Amount in thousands for display
                    adminCommission: Math.round(adminCommission / 1000),
                    netEarning: Math.round(netEarning / 1000),
                    serviceDuration: data.serviceDuration,
                    date: now
                }
            );
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    /**
     * Get payments by therapist ID
     */
    async getPaymentsByTherapist(therapistId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.payments,
                [
                    Query.equal('therapistId', therapistId),
                    Query.orderDesc('date'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching payments by therapist:', error);
            return [];
        }
    },

    /**
     * Mark payment as paid
     */
    async markAsPaid(paymentId: string, transactionId: string, paymentMethod: string): Promise<any> {
        try {
            return await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_records',
                paymentId,
                {
                    paymentStatus: 'paid',
                    paidDate: new Date().toISOString(),
                    transactionId,
                    paymentMethod
                }
            );
        } catch (error) {
            console.error('Error marking payment as paid:', error);
            throw error;
        }
    },

    /**
     * Get payment history for a member
     */
    async getPaymentHistory(memberId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_records',
                [
                    Query.equal('memberId', memberId),
                    Query.orderDesc('monthNumber'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }
    },

    /**
     * Get all pending payments
     */
    async getPendingPayments(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_records',
                [
                    Query.equal('paymentStatus', 'pending'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            return [];
        }
    }
};

// --- Lead Generation Service ---
// Handles pay-per-lead system for members (integrated with membership packages)
export const leadGenerationService = {
    LEAD_COST_PERCENTAGE: 0.25, // 25% of booking price per accepted lead (Silver package)
    RESPONSE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
    
    /**
     * Calculate lead cost based on membership package type
     */
    async calculateLeadCost(
        memberId: string, 
        memberType: 'therapist' | 'massage_place' | 'facial_place',
        bookingPrice: number
    ): Promise<number> {
        try {
            // Get membership package
            const membership = await membershipPackageService.getMembership(memberId, memberType);
            
            if (!membership) {
                // Default to Silver (25%) if no membership found
                return Math.round(bookingPrice * this.LEAD_COST_PERCENTAGE);
            }
            
            // Calculate based on package type
            return membershipPackageService.calculateLeadCost(membership.packageType, bookingPrice);
        } catch (error) {
            console.error('Error calculating lead cost:', error);
            // Default to Silver (25%) on error
            return Math.round(bookingPrice * this.LEAD_COST_PERCENTAGE);
        }
    },
    
    /**
     * Check if member is on lead-based payment model (Silver package)
     */
    async isLeadBasedMember(memberId: string, memberType: 'therapist' | 'massage_place' | 'facial_place'): Promise<boolean> {
        try {
            // Get membership package
            const membership = await membershipPackageService.getMembership(memberId, memberType);
            
            // Silver package = lead-based (pay 25% per lead)
            // Bronze & Gold = no leads or free leads
            return membership?.packageType === 'silver';
        } catch (error) {
            console.error('Error checking lead-based status:', error);
            // Default to Silver (lead-based) if error
            return true;
        }
    },

    /**
     * Create a new lead for member
     */
    async createLead(data: {
        memberId: string;
        memberType: 'therapist' | 'massage_place' | 'facial_place';
        memberName: string;
        memberWhatsApp: string;
        customerName: string;
        customerWhatsApp: string;
        customerLocation?: string;
        hotelVillaName?: string;
        roomNumber?: string;
        serviceType: string;
        duration: number;
        bookingPrice: number; // Full booking price to calculate lead cost from
        requestedDateTime: string;
        notes?: string;
    }): Promise<any> {
        try {
            const leadId = ID.unique();
            const now = new Date();
            const expiresAt = new Date(now.getTime() + this.RESPONSE_TIMEOUT);
            
            // Calculate lead cost based on membership package
            const leadCost = await this.calculateLeadCost(data.memberId, data.memberType, data.bookingPrice);
            
            // Generate unique accept/decline URLs with tokens
            const acceptToken = ID.unique();
            const declineToken = ID.unique();
            const acceptUrl = `${window.location.origin}/lead/accept/${leadId}?token=${acceptToken}`;
            const declineUrl = `${window.location.origin}/lead/decline/${leadId}?token=${declineToken}`;
            
            const leadData = {
                leadId,
                ...data,
                leadCost, // Dynamic based on membership package (0 for Bronze/Gold, 25% for Silver)
                status: 'pending',
                sentAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
                acceptUrl,
                declineUrl,
                billed: false,
                paymentStatus: leadCost > 0 ? 'pending' : 'free' // Free for Bronze/Gold
            };
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                leadId,
                leadData
            );
            
            console.log('✅ Lead created:', leadId, 'Cost:', leadCost);
            
            // Send WhatsApp message to member
            await this.sendLeadWhatsApp(response);
            
            // Set expiry timer
            this.setExpiryTimer(leadId);
            
            return response;
        } catch (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
    },

    /**
     * Send WhatsApp message with lead details
     */
    async sendLeadWhatsApp(lead: any): Promise<void> {
        try {
            const serviceEmoji = lead.serviceType.toLowerCase().includes('facial') ? '💆‍♀️' : '💆';
            const locationText = lead.hotelVillaName 
                ? `${lead.hotelVillaName}${lead.roomNumber ? ` - Room ${lead.roomNumber}` : ''}`
                : lead.customerLocation || 'Not specified';
            
            const message = `🎯 NEW BOOKING LEAD - INDASTREET

${serviceEmoji} ${lead.serviceType.toUpperCase()} SERVICE REQUEST

👤 Customer: ${lead.customerName}
📱 WhatsApp: ${lead.customerWhatsApp}
📍 Location: ${locationText}
⏰ Requested: ${lead.requestedDateTime}
⏱️ Duration: ${lead.duration} minutes
💵 Booking Price: Rp ${lead.bookingPrice.toLocaleString()}

💰 LEAD COST: Rp ${lead.leadCost.toLocaleString()} (25% of booking)
   (Billed ONLY if you accept)

✅ ACCEPT LEAD (Rp ${lead.leadCost.toLocaleString()} will be charged):
${lead.acceptUrl}

❌ DECLINE LEAD (No charge):
${lead.declineUrl}

⏰ YOU HAVE 5 MINUTES TO RESPOND
   After 5 minutes, this lead will be sent to other providers.

${lead.notes ? `📝 Notes: ${lead.notes}\n\n` : ''}📞 Questions? Contact IndaStreet Support
+62-XXX-XXXX`;

            // Send in-app message/notification to provider
            const conversationId = `booking_${(lead as any).$id}`;
            await messagingService.sendMessage({
                conversationId,
                senderId: 'system',
                senderType: 'user',
                senderName: 'System',
                receiverId: lead.memberId,
                receiverType: 'user',
                receiverName: lead.memberName || 'Provider',
                content: `🆕 New booking request! Customer: ${lead.customerName}. Service: ${lead.serviceType}. Price: Rp ${lead.bookingPrice.toLocaleString()}. You have 5 minutes to respond.`,
                bookingId: (lead as any).$id
            });
            
            console.log('✅ Lead notification sent to provider:', lead.memberWhatsApp);
        } catch (error) {
            console.error('Error sending lead WhatsApp:', error);
        }
    },

    /**
     * Accept a lead
     */
    async acceptLead(leadId: string, token: string): Promise<{ success: boolean; message: string; lead?: any }> {
        try {
            const lead = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                leadId
            );
            
            // Verify token matches
            if (!lead.acceptUrl.includes(token)) {
                return { success: false, message: 'Invalid token' };
            }
            
            // Check if already responded
            if (lead.status !== 'pending') {
                return { success: false, message: `Lead already ${lead.status}` };
            }
            
            // Check if expired
            const now = new Date();
            const expiresAt = new Date(lead.expiresAt);
            if (now > expiresAt) {
                await this.expireLead(leadId);
                return { success: false, message: 'Lead has expired (5 minute window passed)' };
            }
            
            // Update lead status
            const updatedLead = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                leadId,
                {
                    status: 'accepted',
                    respondedAt: now.toISOString(),
                    billed: true,
                    billedAt: now.toISOString()
                }
            );
            
            // Send in-app message to customer
            const conversationId = `booking_${leadId}`;
            await messagingService.sendMessage({
                conversationId,
                senderId: updatedLead.memberId,
                senderType: 'user',
                senderName: updatedLead.memberName,
                receiverId: updatedLead.customerId,
                receiverType: 'user',
                receiverName: updatedLead.customerName,
                content: `✅ Your ${updatedLead.serviceType} booking has been confirmed! Provider: ${updatedLead.memberName}. They will contact you shortly via WhatsApp at ${updatedLead.customerWhatsApp}.`,
                bookingId: leadId
            });
            
            // Update monthly billing summary
            await this.updateBillingSummary(updatedLead.memberId, updatedLead.memberType);
            
            console.log('✅ Lead accepted:', leadId);
            
            return { 
                success: true, 
                message: 'Lead accepted! You will be billed Rp 50,000. Customer has been notified.',
                lead: updatedLead
            };
        } catch (error) {
            console.error('Error accepting lead:', error);
            return { success: false, message: 'Error processing acceptance' };
        }
    },

    /**
     * Decline a lead
     */
    async declineLead(leadId: string, token: string): Promise<{ success: boolean; message: string }> {
        try {
            const lead = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                leadId
            );
            
            // Verify token matches
            if (!lead.declineUrl.includes(token)) {
                return { success: false, message: 'Invalid token' };
            }
            
            // Check if already responded
            if (lead.status !== 'pending') {
                return { success: false, message: `Lead already ${lead.status}` };
            }
            
            // Update lead status
            const now = new Date();
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                leadId,
                {
                    status: 'declined',
                    respondedAt: now.toISOString()
                }
            );
            
            // Send in-app message to customer about decline
            const conversationId = `booking_${leadId}`;
            await messagingService.sendMessage({
                conversationId,
                senderId: 'system',
                senderType: 'user',
                senderName: 'System',
                receiverId: lead.customerId,
                receiverType: 'user',
                receiverName: lead.customerName || 'Customer',
                content: `⚠️ Provider ${lead.memberName} is currently unavailable. We're finding you another available provider. You'll receive a new booking notification shortly.`,
                bookingId: leadId
            });
            
            // Update monthly billing summary
            await this.updateBillingSummary(lead.memberId, lead.memberType);
            
            console.log('✅ Lead declined:', leadId);
            
            return { 
                success: true, 
                message: 'Lead declined. No charges applied. Customer will be notified.'
            };
        } catch (error) {
            console.error('Error declining lead:', error);
            return { success: false, message: 'Error processing decline' };
        }
    },

    /**
     * Expire a lead (after 5 minutes)
     */
    async expireLead(leadId: string): Promise<void> {
        try {
            const lead = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                leadId
            );
            
            if (lead.status === 'pending') {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'lead_generations',
                    leadId,
                    {
                        status: 'expired',
                        respondedAt: new Date().toISOString()
                    }
                );
                
                // Send in-app message to customer about expiration
                const conversationId = `booking_${leadId}`;
                await messagingService.sendMessage({
                    conversationId,
                    senderId: 'system',
                    senderType: 'user',
                    senderName: 'System',
                    receiverId: lead.customerId,
                    receiverType: 'user',
                    receiverName: lead.customerName || 'Customer',
                    content: `⏰ Your booking request has expired (5 minute response window). We're finding you another available provider. You'll receive a new notification shortly.`,
                    bookingId: leadId
                });
                
                console.log('⏰ Lead expired:', leadId);
            }
        } catch (error) {
            console.error('Error expiring lead:', error);
        }
    },

    /**
     * Set timer to auto-expire lead after 5 minutes
     */
    setExpiryTimer(leadId: string): void {
        setTimeout(async () => {
            await this.expireLead(leadId);
        }, this.RESPONSE_TIMEOUT);
    },



    /**
     * Get all leads for a member
     */
    async getMemberLeads(memberId: string, status?: string): Promise<any[]> {
        try {
            const queries = [
                Query.equal('memberId', memberId),
                Query.orderDesc('sentAt'),
                Query.limit(100)
            ];
            
            if (status) {
                queries.push(Query.equal('status', status));
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                queries
            );
            
            return response.documents;
        } catch (error) {
            console.error('Error fetching member leads:', error);
            return [];
        }
    },

    /**
     * Get all leads (admin view)
     */
    async getAllLeads(filters?: {
        status?: string;
        memberType?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<any[]> {
        try {
            const queries: any[] = [
                Query.orderDesc('sentAt'),
                Query.limit(500)
            ];
            
            if (filters?.status) {
                queries.push(Query.equal('status', filters.status));
            }
            if (filters?.memberType) {
                queries.push(Query.equal('memberType', filters.memberType));
            }
            if (filters?.dateFrom) {
                queries.push(Query.greaterThanEqual('sentAt', filters.dateFrom));
            }
            if (filters?.dateTo) {
                queries.push(Query.lessThanEqual('sentAt', filters.dateTo));
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                queries
            );
            
            return response.documents;
        } catch (error) {
            console.error('Error fetching all leads:', error);
            return [];
        }
    },

    /**
     * Update monthly billing summary
     */
    async updateBillingSummary(memberId: string, memberType: string): Promise<void> {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            
            // Get all leads for this member this month
            const leads = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'lead_generations',
                [
                    Query.equal('memberId', memberId),
                    Query.greaterThanEqual('sentAt', `${currentMonth}-01`),
                    Query.lessThan('sentAt', `${currentMonth}-32`)
                ]
            );
            
            const totalLeads = leads.documents.length;
            const acceptedLeads = leads.documents.filter(l => l.status === 'accepted').length;
            const declinedLeads = leads.documents.filter(l => l.status === 'declined').length;
            const expiredLeads = leads.documents.filter(l => l.status === 'expired').length;
            // Calculate total owed by summing actual leadCost from each accepted lead (25% of each booking)
            const totalOwed = leads.documents
                .filter(l => l.status === 'accepted')
                .reduce((sum, l) => sum + (l.leadCost || 0), 0);
            
            // Try to get existing summary
            const summaryId = `${memberId}_${currentMonth}`;
            let summary;
            try {
                summary = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    'lead_billing_summary',
                    summaryId
                );
            } catch {
                // Doesn't exist, will create
            }
            
            const summaryData = {
                memberId,
                memberType,
                memberName: leads.documents[0]?.memberName || 'Unknown',
                billingMonth: currentMonth,
                totalLeads,
                acceptedLeads,
                declinedLeads,
                expiredLeads,
                totalOwed,
                totalPaid: summary?.totalPaid || 0,
                balance: totalOwed - (summary?.totalPaid || 0),
                lastUpdated: new Date().toISOString()
            };
            
            if (summary) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'lead_billing_summary',
                    summaryId,
                    summaryData
                );
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    'lead_billing_summary',
                    summaryId,
                    summaryData
                );
            }
            
            console.log('✅ Billing summary updated for:', memberId);
        } catch (error) {
            console.error('Error updating billing summary:', error);
        }
    },

    /**
     * Get billing summary for member
     */
    async getMemberBillingSummary(memberId: string, month?: string): Promise<any> {
        try {
            const targetMonth = month || new Date().toISOString().slice(0, 7);
            const summaryId = `${memberId}_${targetMonth}`;
            
            return await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_billing_summary',
                summaryId
            );
        } catch (error) {
            console.error('Error fetching billing summary:', error);
            return null;
        }
    },

    /**
     * Mark lead payment as paid
     */
    async markLeadsPaid(memberId: string, month: string, amountPaid: number): Promise<void> {
        try {
            const summaryId = `${memberId}_${month}`;
            const summary = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_billing_summary',
                summaryId
            );
            
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'lead_billing_summary',
                summaryId,
                {
                    totalPaid: summary.totalPaid + amountPaid,
                    balance: summary.balance - amountPaid,
                    lastUpdated: new Date().toISOString()
                }
            );
            
            console.log('✅ Payment recorded:', amountPaid);
        } catch (error) {
            console.error('Error marking payment:', error);
            throw error;
        }
    }
};

// --- Membership Service ---
export const membershipService = {
    // Pricing constants (Indonesia - IDR)
    COUNTRY: 'ID', // Indonesia
    CURRENCY: 'IDR',
    PRICING: {
        TRIAL: 0,
        MONTH_2: 100000,
        MONTH_3: 135000,
        MONTH_4: 175000,
        MONTH_5: 200000,
        MONTH_6_PLUS: 200000, // Stays at 200k for all months after Month 5
        PREMIUM_UPGRADE: 275000,
        LEAD_COST_PERCENTAGE: 0.25, // 25% of booking price per accepted lead
        LATE_FEE: 25000,
        REACTIVATION_FEE: 275000
    },
    
    // Grace period settings
    GRACE_PERIOD_DAYS: 5, // Days 1-5: no penalty
    LATE_FEE_AFTER_DAY: 5, // After day 5: late fee applies
    SUSPENSION_AFTER_DAY: 10, // After day 10: switch to lead-based model

    /**
     * Get pricing for current membership month (Indonesia - IDR)
     * Month 1: Free
     * Month 2: 100k
     * Month 3: 135k
     * Month 4: 175k
     * Month 5+: 200k (consistent rate for all subsequent months)
     */
    getPricingForMonth: (month: number): number => {
        if (month === 1) return membershipService.PRICING.TRIAL;
        if (month === 2) return membershipService.PRICING.MONTH_2;
        if (month === 3) return membershipService.PRICING.MONTH_3;
        if (month === 4) return membershipService.PRICING.MONTH_4;
        // Month 5 and all subsequent months: 200,000 IDR
        return membershipService.PRICING.MONTH_6_PLUS;
    },

    /**
     * Check if member is verified (has badge)
     */
    isVerified: (member: any): boolean => {
        return member.isVerified && 
               member.subscriptionStatus !== 'suspended' &&
               member.subscriptionStatus !== 'deactivated' &&
               (member.outstandingDues || 0) === 0;
    },

    /**
     * Calculate outstanding dues for member
     */
    calculateOutstandingDues: async (memberId: string, memberType: string) => {
        try {
            // Get membership payments owed
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            const member = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId
            );

            let totalDues = 0;

            // Add unpaid subscription fees
            if (member.subscriptionStatus === 'active' && member.outstandingDues) {
                totalDues += member.outstandingDues;
            }

            // Add unpaid lead charges
            const unpaidLeads = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadGenerations,
                [
                    Query.equal('memberId', memberId),
                    Query.equal('status', 'accepted'),
                    Query.equal('paymentStatus', 'unpaid')
                ]
            );

            unpaidLeads.documents.forEach((lead: any) => {
                totalDues += lead.leadCost;
            });

            return totalDues;
        } catch (error) {
            console.error('Error calculating outstanding dues:', error);
            throw error;
        }
    },

    /**
     * Accept membership agreement
     */
    acceptAgreement: async (memberId: string, memberType: string, agreementData: any) => {
        try {
            // Create agreement record
            const agreement = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipAgreements,
                ID.unique(),
                {
                    memberId,
                    memberType,
                    agreementVersion: '1.0',
                    acceptedDate: new Date().toISOString(),
                    ipAddress: agreementData.ipAddress,
                    userAgent: agreementData.userAgent,
                    termsAcknowledged: [
                        'five_month_commitment',
                        'payment_schedule',
                        'deactivation_policy',
                        'upgrade_pricing',
                        'verified_badge_policy'
                    ],
                    pricingTierAcknowledged: {
                        month1: 0,
                        month2: 100000,
                        month3: 135000,
                        month4: 175000,
                        month5Plus: 200000,
                        premiumUpgrade: 275000
                    },
                    isActive: true
                }
            );

            // Update member document
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId,
                {
                    agreementAccepted: true,
                    agreementAcceptedDate: new Date().toISOString(),
                    agreementVersion: '1.0',
                    subscriptionStatus: 'trial',
                    membershipMonth: 1,
                    commitmentEndDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString() // 5 months
                }
            );

            return agreement;
        } catch (error) {
            console.error('Error accepting agreement:', error);
            throw error;
        }
    },

    /**
     * Request upgrade from lead-based to premium
     */
    requestPremiumUpgrade: async (memberId: string, memberType: string) => {
        try {
            // Check if member is eligible
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                 memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                 APPWRITE_CONFIG.collections.facial_places;            const member = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId
            );

            if (member.paymentModel !== 'lead_based') {
                throw new Error('Only lead-based members can upgrade to premium');
            }

            // Calculate outstanding dues
            const outstandingDues = await membershipService.calculateOutstandingDues(memberId, memberType);
            const totalUpgradeCost = membershipService.PRICING.PREMIUM_UPGRADE + outstandingDues;

            // Create upgrade request
            const upgrade = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                ID.unique(),
                {
                    memberId,
                    memberType,
                    upgradeDate: new Date().toISOString(),
                    previousModel: 'lead_based',
                    newModel: 'premium',
                    upgradeFee: membershipService.PRICING.PREMIUM_UPGRADE,
                    outstandingDuesCleared: outstandingDues,
                    totalPaidAtUpgrade: totalUpgradeCost,
                    paymentStatus: 'pending',
                    verifiedBadgeGranted: false
                }
            );

            return {
                upgrade,
                totalCost: totalUpgradeCost,
                outstandingDues,
                upgradeFee: membershipService.PRICING.PREMIUM_UPGRADE
            };
        } catch (error) {
            console.error('Error requesting premium upgrade:', error);
            throw error;
        }
    },

    /**
     * Complete premium upgrade after payment
     */
    completePremiumUpgrade: async (upgradeId: string) => {
        try {
            const upgrade = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                upgradeId
            );

            // Update upgrade record
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                upgradeId,
                {
                    paymentStatus: 'paid',
                    paymentDate: new Date().toISOString(),
                    verifiedBadgeGranted: true,
                    verifiedBadgeDate: new Date().toISOString()
                }
            );

            // Update member record
            const collectionId = upgrade.memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                upgrade.memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                upgrade.memberId,
                {
                    subscriptionStatus: 'premium',
                    paymentModel: 'premium',
                    previousPaymentModel: 'lead_based',
                    upgradedToPremium: true,
                    premiumUpgradeDate: new Date().toISOString(),
                    isVerified: true,
                    verifiedSince: new Date().toISOString(),
                    outstandingDues: 0
                }
            );

            // Mark all outstanding leads as paid
            await leadGenerationService.markLeadsPaid(upgrade.memberId, new Date().toISOString().substring(0,7), upgrade.amount || 0);

            return upgrade;
        } catch (error) {
            console.error('Error completing premium upgrade:', error);
            throw error;
        }
    },

    /**
     * Request account deactivation
     */
    requestDeactivation: async (memberId: string, memberType: string, reason: string) => {
        try {
            // Check outstanding dues
            const outstandingDues = await membershipService.calculateOutstandingDues(memberId, memberType);

            if (outstandingDues > 0) {
                throw new Error(`Cannot deactivate account with outstanding dues: Rp ${outstandingDues.toLocaleString()}`);
            }

            // Create deactivation request
            const request = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                ID.unique(),
                {
                    memberId,
                    memberType,
                    requestDate: new Date().toISOString(),
                    reason,
                    status: 'pending',
                    outstandingDuesAtRequest: outstandingDues,
                    noticeProvidedDate: new Date().toISOString(),
                    effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    canReactivateAfter: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 90 days after
                    reactivationFeeRequired: membershipService.PRICING.REACTIVATION_FEE,
                    reactivationRequiresApproval: true
                }
            );

            // Update member record
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId,
                {
                    deactivationRequested: true,
                    deactivationRequestDate: new Date().toISOString()
                }
            );

            return request;
        } catch (error) {
            console.error('Error requesting deactivation:', error);
            throw error;
        }
    },

    /**
     * Approve deactivation request
     */
    approveDeactivation: async (requestId: string, adminId: string, notes: string) => {
        try {
            const request = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                requestId
            );

            // Update request
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                requestId,
                {
                    status: 'approved',
                    reviewedBy: adminId,
                    reviewedDate: new Date().toISOString(),
                    reviewNotes: notes,
                    clearanceCertificateIssued: true
                }
            );

            // Update member record
            const collectionId = request.memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                request.memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                request.memberId,
                {
                    subscriptionStatus: 'deactivated',
                    deactivationEffectiveDate: request.effectiveDate,
                    isVerified: false,
                    verifiedSince: null
                }
            );

            return request;
        } catch (error) {
            console.error('Error approving deactivation:', error);
            throw error;
        }
    },

    /**
     * Get membership stats for admin dashboard
     */
    getMembershipStats: async () => {
        try {
            const stats = {
                totalMembers: 0,
                trialMembers: 0,
                activeMembers: 0,
                premiumMembers: 0,
                leadBasedMembers: 0,
                suspendedMembers: 0,
                deactivatedMembers: 0,
                verifiedMembers: 0,
                totalRevenue: 0,
                pendingUpgrades: 0,
                pendingDeactivations: 0
            };

            // Get counts from all collections
            const collections = [
                APPWRITE_CONFIG.collections.therapists,
                APPWRITE_CONFIG.collections.places,
                APPWRITE_CONFIG.collections.facial_places
            ];

            for (const collectionId of collections) {
                const members = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    collectionId
                );

                members.documents.forEach((member: any) => {
                    stats.totalMembers++;
                    if (member.subscriptionStatus === 'trial') stats.trialMembers++;
                    if (member.subscriptionStatus === 'active') stats.activeMembers++;
                    if (member.subscriptionStatus === 'premium') stats.premiumMembers++;
                    if (member.subscriptionStatus === 'lead_based') stats.leadBasedMembers++;
                    if (member.subscriptionStatus === 'suspended') stats.suspendedMembers++;
                    if (member.subscriptionStatus === 'deactivated') stats.deactivatedMembers++;
                    if (member.isVerified) stats.verifiedMembers++;
                    stats.totalRevenue += member.totalPaidToDate || 0;
                });
            }

            // Get pending upgrades
            const upgrades = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                [Query.equal('paymentStatus', 'pending')]
            );
            stats.pendingUpgrades = upgrades.total;

            // Get pending deactivations
            const deactivations = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                [Query.equal('status', 'pending')]
            );
            stats.pendingDeactivations = deactivations.total;

            return stats;
        } catch (error) {
            console.error('Error getting membership stats:', error);
            throw error;
        }
    }
};

// ===================================
// Membership Package Service (Bronze, Silver, Gold)
// ===================================

export interface MembershipPackage {
    $id?: string;
    userId: string;
    memberType: 'therapist' | 'massage_place' | 'facial_place';
    memberId: string;
    packageType: 'bronze' | 'silver' | 'gold';
    status: 'active' | 'inactive' | 'expired' | 'pending';
    startDate: string;
    endDate?: string; // For Bronze yearly
    renewalDate?: string; // For Gold monthly
    goldTier?: number; // Current month tier for Gold (1-5+)
    totalPaid: number; // Total amount paid in IDR
    lastPaymentDate?: string;
    lastPaymentAmount?: number;
    autoRenew: boolean;
    paymentMethod?: 'bank_transfer' | 'credit_card' | 'e_wallet';
    notes?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

export const membershipPackageService = {
    /**
     * Get membership package for a specific member
     */
    async getMembership(memberId: string, memberType: 'therapist' | 'massage_place' | 'facial_place'): Promise<MembershipPackage | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.equal('memberId', memberId),
                    Query.equal('memberType', memberType),
                    Query.equal('status', 'active')
                ]
            );

            return response.documents.length > 0 ? response.documents[0] as any : null;
        } catch (error) {
            console.error('Error getting membership:', error);
            return null;
        }
    },

    /**
     * Create default Silver membership for new member
     */
    async createDefaultMembership(
        userId: string,
        memberId: string,
        memberType: 'therapist' | 'massage_place' | 'facial_place'
    ): Promise<MembershipPackage> {
        try {
            const membership: Partial<MembershipPackage> = {
                userId,
                memberId,
                memberType,
                packageType: 'silver', // Default to Silver (25% leads)
                status: 'active',
                startDate: new Date().toISOString(),
                totalPaid: 0,
                autoRenew: false
            };

            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                ID.unique(),
                membership
            );

            return response as any;
        } catch (error) {
            console.error('Error creating default membership:', error);
            throw error;
        }
    },

    /**
     * Update membership package
     */
    async updatePackage(
        membershipId: string,
        packageType: 'bronze' | 'silver' | 'gold',
        paymentDetails?: {
            amount: number;
            method: 'bank_transfer' | 'credit_card' | 'e_wallet';
        }
    ): Promise<MembershipPackage> {
        try {
            const updates: any = {
                packageType,
                status: 'active',
                $updatedAt: new Date().toISOString()
            };

            // Handle package-specific logic
            if (packageType === 'bronze') {
                // Bronze: 2M IDR/year
                const endDate = new Date();
                endDate.setFullYear(endDate.getFullYear() + 1);
                updates.endDate = endDate.toISOString();
                updates.renewalDate = null;
                updates.goldTier = null;
            } else if (packageType === 'gold') {
                // Monthly Package: 200K IDR/month (flat rate)
                const renewalDate = new Date();
                renewalDate.setMonth(renewalDate.getMonth() + 1);
                updates.renewalDate = renewalDate.toISOString();
                updates.goldTier = null; // No tiers for flat monthly
                updates.endDate = null;
            } else {
                // Silver: Pay-per-lead (25% commission), no subscription
                updates.endDate = null;
                updates.renewalDate = null;
                updates.goldTier = null;
            }

            // Update payment details if provided
            if (paymentDetails) {
                const currentMembership = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.memberships,
                    membershipId
                );

                updates.totalPaid = (currentMembership.totalPaid || 0) + paymentDetails.amount;
                updates.lastPaymentDate = new Date().toISOString();
                updates.lastPaymentAmount = paymentDetails.amount;
                updates.paymentMethod = paymentDetails.method;
            }

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                membershipId,
                updates
            );

            return response as any;
        } catch (error) {
            console.error('Error updating membership package:', error);
            throw error;
        }
    },

    /**
     * Get Monthly Package price (flat 200K IDR)
     */
    getMonthlyPackagePrice(): number {
        return 200000; // Fixed 200K IDR per month
    },

    /**
     * Calculate lead cost based on membership package
     */
    calculateLeadCost(packageType: 'bronze' | 'silver' | 'gold', bookingPrice: number): number {
        switch (packageType) {
            case 'bronze':
                return 0; // Bronze (2M/year): NO commission
            case 'silver':
                return Math.floor(bookingPrice * 0.25); // Silver: 25% admin commission
            case 'gold':
                return 0; // Monthly Package (200K/month): NO commission
            default:
                return 0;
        }
    },

    /**
     * Get all memberships (Admin)
     */
    async getAllMemberships(): Promise<MembershipPackage[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );

            return response.documents as any[];
        } catch (error) {
            console.error('Error getting all memberships:', error);
            throw error;
        }
    },

    /**
     * Get membership stats for admin dashboard
     */
    async getMembershipStats(): Promise<{
        totalMembers: number;
        bronzeCount: number;
        silverCount: number;
        goldCount: number;
        bronzeRevenue: number;
        goldRevenue: number;
        expiringSoon: number; // Bronze memberships expiring in 30 days
    }> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.equal('status', 'active'),
                    Query.limit(1000)
                ]
            );

            const stats = {
                totalMembers: response.documents.length,
                bronzeCount: 0,
                silverCount: 0,
                goldCount: 0,
                bronzeRevenue: 0,
                goldRevenue: 0,
                expiringSoon: 0
            };

            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            response.documents.forEach((doc: any) => {
                // Count by package type
                if (doc.packageType === 'bronze') {
                    stats.bronzeCount++;
                    stats.bronzeRevenue += doc.totalPaid || 0;
                    
                    // Check if expiring soon
                    if (doc.endDate && new Date(doc.endDate) <= thirtyDaysFromNow) {
                        stats.expiringSoon++;
                    }
                } else if (doc.packageType === 'silver') {
                    stats.silverCount++;
                } else if (doc.packageType === 'gold') {
                    stats.goldCount++;
                    stats.goldRevenue += doc.totalPaid || 0;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting membership stats:', error);
            throw error;
        }
    },

    /**
     * Expire Bronze memberships past end date
     */
    async expireBronzeMemberships(): Promise<number> {
        try {
            const now = new Date().toISOString();
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.equal('packageType', 'bronze'),
                    Query.equal('status', 'active'),
                    Query.lessThan('endDate', now)
                ]
            );

            let expiredCount = 0;

            for (const membership of response.documents) {
                // Set to expired status
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.memberships,
                    (membership as any).$id,
                    {
                        status: 'expired'
                    }
                );

                // Create new Silver membership (revert to default)
                await this.createDefaultMembership(
                    membership.userId,
                    membership.memberId,
                    membership.memberType
                );

                expiredCount++;
            }

            return expiredCount;
        } catch (error) {
            console.error('Error expiring Bronze memberships:', error);
            throw error;
        }
    },

    /**
     * Expire Monthly Package (Gold) memberships past renewal date
     * Auto-revert to Silver (25% commission default)
     */
    async expireMonthlyMemberships(): Promise<number> {
        try {
            const now = new Date().toISOString();
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.equal('packageType', 'gold'),
                    Query.equal('status', 'active'),
                    Query.lessThan('renewalDate', now)
                ]
            );

            let expiredCount = 0;

            for (const membership of response.documents) {
                // Set to expired status
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.memberships,
                    (membership as any).$id,
                    {
                        status: 'expired'
                    }
                );

                // Create new Silver membership (revert to default 25% commission)
                await this.createDefaultMembership(
                    membership.userId,
                    membership.memberId,
                    membership.memberType
                );

                expiredCount++;
            }

            return expiredCount;
        } catch (error) {
            console.error('Error expiring Monthly memberships:', error);
            throw error;
        }
    },

    /**
     * Get memberships expiring within specified days
     * Used for 7-day advance notifications
     */
    async getExpiringSoon(days: number = 7): Promise<MembershipPackage[]> {
        try {
            const now = new Date();
            const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            
            // Get Bronze memberships expiring (check endDate)
            const bronzeResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.equal('packageType', 'bronze'),
                    Query.equal('status', 'active'),
                    Query.lessThanEqual('endDate', futureDate.toISOString()),
                    Query.greaterThanEqual('endDate', now.toISOString())
                ]
            );

            // Get Monthly Package memberships expiring (check renewalDate)
            const monthlyResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.memberships,
                [
                    Query.equal('packageType', 'gold'),
                    Query.equal('status', 'active'),
                    Query.lessThanEqual('renewalDate', futureDate.toISOString()),
                    Query.greaterThanEqual('renewalDate', now.toISOString())
                ]
            );

            return [...bronzeResponse.documents, ...monthlyResponse.documents] as any;
        } catch (error) {
            console.error('Error getting expiring memberships:', error);
            return [];
        }
    },

    /**
     * Send expiry notifications via email/WhatsApp
     * Call this daily via cron job or scheduled task
     */
    async sendExpiryNotifications(): Promise<{ sent: number; failed: number }> {
        try {
            const expiring = await this.getExpiringSoon(7);
            let sent = 0;
            let failed = 0;

            for (const membership of expiring) {
                try {
                    const expiryDate = membership.packageType === 'bronze' 
                        ? membership.endDate 
                        : membership.renewalDate;
                    
                    const daysLeft = Math.ceil(
                        (new Date(expiryDate || new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );

                    // Send admin notification  
                    await sendAdminNotification({
                        type: 'therapist',
                        name: 'Member Expiry Alert',
                        email: 'admin@indastreet.com',
                        whatsappNumber: 'N/A',
                        location: 'System Alert',
                        registrationDate: new Date().toISOString()
                    });

                    sent++;
                } catch (error) {
                    console.error(`Failed to send expiry notification for ${membership.memberId}:`, error);
                    failed++;
                }
            }

            console.log(`✅ Expiry notifications sent: ${sent}, failed: ${failed}`);
            return { sent, failed };
        } catch (error) {
            console.error('Error sending expiry notifications:', error);
            return { sent: 0, failed: 0 };
        }
    }
};

// --- Lead Billing Service ---
export const leadBillingService = {
    /**
     * Get monthly billing summary for a provider
     */
    async getMonthlyBilling(
        providerId: string,
        providerType: 'therapist' | 'place' | 'facial-place',
        month: string,
        year: number
    ) {
        try {
            // Get all accepted leads for this provider in the specified month
            const startDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1);
            const endDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0);

            const result = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadGenerations,
                [
                    Query.equal('memberId', providerId),
                    Query.equal('memberType', providerType),
                    Query.equal('status', 'accepted'),
                    Query.greaterThanEqual('acceptedDate', startDate.toISOString()),
                    Query.lessThanEqual('acceptedDate', endDate.toISOString())
                ]
            );

            const leads = result.documents.map(doc => ({
                $id: (doc as any).$id,
                customerName: doc.customerName,
                customerWhatsApp: doc.customerWhatsApp,
                leadCost: doc.leadCost || 50000,
                acceptedDate: doc.acceptedDate,
                bookingDetails: doc.bookingDetails
            }));

            const totalAmount = leads.reduce((sum, lead) => sum + lead.leadCost, 0);

            // Calculate due date (7 days after month end)
            const dueDate = new Date(endDate);
            dueDate.setDate(dueDate.getDate() + 7);

            // Check if there's a billing summary record
            const summaryResult = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadBillingSummary,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('month', month),
                    Query.equal('year', year)
                ]
            );

            let summary;
            if (summaryResult.documents.length > 0) {
                summary = summaryResult.documents[0];
            } else {
                // Create new summary
                summary = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.leadBillingSummary,
                    ID.unique(),
                    {
                        providerId,
                        providerType,
                        month,
                        year,
                        totalLeads: leads.length,
                        totalAmount,
                        paidAmount: 0,
                        pendingAmount: totalAmount,
                        status: 'pending',
                        dueDate: dueDate.toISOString()
                    }
                );
            }

            return {
                $id: (summary as any).$id,
                month,
                year,
                totalLeads: leads.length,
                totalAmount,
                paidAmount: summary.paidAmount || 0,
                pendingAmount: summary.pendingAmount || totalAmount,
                status: summary.status || 'pending',
                dueDate: summary.dueDate || dueDate.toISOString(),
                leads
            };
        } catch (error) {
            console.error('Error getting monthly billing:', error);
            throw error;
        }
    },

    /**
     * Get billing history for past months
     */
    async getBillingHistory(
        providerId: string,
        providerType: 'therapist' | 'place' | 'facial-place',
        months: number = 6
    ) {
        try {
            const history = [];
            const now = new Date();

            for (let i = 1; i <= months; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const month = date.toLocaleString('default', { month: 'long' });
                const year = date.getFullYear();

                const billing = await this.getMonthlyBilling(providerId, providerType, month, year);
                if (billing.totalLeads > 0) {
                    history.push(billing);
                }
            }

            return history;
        } catch (error) {
            console.error('Error getting billing history:', error);
            return [];
        }
    },

    /**
     * Record a payment
     */
    async recordPayment(
        summaryId: string,
        amount: number,
        paymentMethod: string,
        transactionId?: string
    ) {
        try {
            // Get current summary
            const summary = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadBillingSummary,
                summaryId
            );

            const newPaidAmount = (summary.paidAmount || 0) + amount;
            const newPendingAmount = summary.totalAmount - newPaidAmount;
            const newStatus = newPendingAmount <= 0 ? 'paid' : newPendingAmount < summary.totalAmount ? 'partial' : 'pending';

            // Update summary
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadBillingSummary,
                summaryId,
                {
                    paidAmount: newPaidAmount,
                    pendingAmount: newPendingAmount,
                    status: newStatus,
                    lastPaymentDate: new Date().toISOString(),
                    lastPaymentAmount: amount,
                    lastPaymentMethod: paymentMethod,
                    lastTransactionId: transactionId || ''
                }
            );

            console.log(`✅ Payment recorded: ${amount} for summary ${summaryId}`);
            return { success: true, newStatus };
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    },

    /**
     * Get total pending amount across all months
     */
    async getTotalPending(providerId: string, providerType: string): Promise<number> {
        try {
            const result = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadBillingSummary,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('providerType', providerType),
                    Query.greaterThan('pendingAmount', 0)
                ]
            );

            return result.documents.reduce((sum, doc) => sum + (doc.pendingAmount || 0), 0);
        } catch (error) {
            console.error('Error getting total pending:', error);
            return 0;
        }
    }
};

// Export new services
export { simpleChatService, simpleBookingService } from './simpleChatService';

// --- Payment Confirmation Service ---
export const paymentConfirmationService = {
    /**
     * Submit payment proof for admin review
     */
    async submitPaymentProof(data: {
        userId: string;
        userEmail: string;
        userName: string;
        memberType: 'therapist' | 'place' | 'agent' | 'hotel' | 'lead_buyer';
        paymentType: 'membership' | 'lead_fee' | 'commission' | 'package_upgrade';
        packageName?: string;
        packageDuration?: string;
        amount: number;
        bankName: string;
        accountNumber: string;
        accountName: string;
        proofOfPaymentFile: File;
    }): Promise<any> {
        try {
            console.log('📤 Submitting payment proof for review...');

            // Upload payment proof to storage
            const fileResponse = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                data.proofOfPaymentFile
            );

            const proofUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${(fileResponse as any).$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            // Calculate expiry date (7 days from now)
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            // Create payment confirmation document
            const confirmation = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_transactions',
                ID.unique(),
                {
                    transactionId: ID.unique(),
                    userId: data.userId,
                    userEmail: data.userEmail,
                    userName: data.userName,
                    userType: data.memberType, // Map memberType to userType
                    memberType: data.memberType,
                    paymentType: data.paymentType,
                    packageType: data.packageName || null, // Map packageName to packageType
                    packageDuration: data.packageDuration || null,
                    amount: data.amount,
                    currency: 'IDR', // Default currency
                    transactionDate: now.toISOString(),
                    paymentMethod: 'bank_transfer', // Default payment method
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    accountName: data.accountName,
                    paymentProofUrl: proofUrl, // Match existing field name
                    proofOfPaymentFileId: (fileResponse as any).$id,
                    status: 'pending',
                    submittedAt: now.toISOString(),
                    expiresAt: expiresAt.toISOString(),
                    notificationSent: false,
                }
            );

            // Send notification to admin
            await this.notifyAdminNewPayment(confirmation);

            console.log('✅ Payment proof submitted successfully:', (confirmation as any).$id);
            return confirmation;
        } catch (error) {
            console.error('❌ Failed to submit payment proof:', error);
            throw error;
        }
    },

    /**
     * Get user's payment confirmations
     */
    async getUserPayments(userId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_transactions',
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('submittedAt'),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Failed to get user payments:', error);
            throw error;
        }
    },

    /**
     * Get all pending payments (for admin)
     */
    async getPendingPayments(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_transactions',
                [
                    Query.equal('status', 'pending'),
                    Query.orderDesc('submittedAt'),
                    Query.limit(100),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Failed to get pending payments:', error);
            throw error;
        }
    },

    /**
     * Get all payments with optional filters (for admin)
     */
    async getAllPayments(filter?: {
        status?: string;
        memberType?: string;
        paymentType?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<any[]> {
        try {
            const queries: string[] = [
                Query.orderDesc('submittedAt'),
                Query.limit(100),
            ];

            if (filter?.status) {
                queries.push(Query.equal('status', filter.status));
            }
            if (filter?.memberType) {
                queries.push(Query.equal('memberType', filter.memberType));
            }
            if (filter?.paymentType) {
                queries.push(Query.equal('paymentType', filter.paymentType));
            }

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_transactions',
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Failed to get all payments:', error);
            throw error;
        }
    },

    /**
     * Approve payment (admin only)
     */
    async approvePayment(confirmationId: string, adminId: string): Promise<void> {
        try {
            console.log('✅ Approving payment:', confirmationId);

            const payment = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_confirmations',
                confirmationId
            );

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_confirmations',
                confirmationId,
                {
                    status: 'approved',
                    reviewedBy: adminId,
                    reviewedAt: new Date().toISOString(),
                }
            );

            // Send approval notification to user
            await notificationService.create({
                message: `Your payment of IDR ${payment.amount.toLocaleString()} has been verified. ${
                    payment.paymentType === 'membership' ? 'Your membership is now active!' : 'Your payment has been processed.'
                }`,
                type: 'payment_received',
                priority: 'high',
            });

            // TODO: Activate membership if paymentType === 'membership'

            console.log('✅ Payment approved and user notified');
        } catch (error) {
            console.error('❌ Failed to approve payment:', error);
            throw error;
        }
    },

    /**
     * Decline payment (admin only)
     */
    async declinePayment(
        confirmationId: string,
        adminId: string,
        reason: string
    ): Promise<void> {
        try {
            console.log('❌ Declining payment:', confirmationId);

            const payment = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_confirmations',
                confirmationId
            );

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_confirmations',
                confirmationId,
                {
                    status: 'declined',
                    reviewedBy: adminId,
                    reviewedAt: new Date().toISOString(),
                    declineReason: reason,
                    notificationSent: true,
                }
            );

            // Send decline notification to user
            await notificationService.create({
                message: `Payment was not received. Please check the proof of payment attachment. Reason: ${reason}`,
                type: 'system',
                priority: 'high',
            });

            console.log('✅ Payment declined and user notified');
        } catch (error) {
            console.error('❌ Failed to decline payment:', error);
            throw error;
        }
    },

    /**
     * Get expired payments (for admin auto-decline)
     */
    async getExpiredPayments(): Promise<any[]> {
        try {
            const now = new Date().toISOString();
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_transactions',
                [
                    Query.equal('status', 'pending'),
                    Query.lessThan('expiresAt', now),
                    Query.limit(50),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Failed to get expired payments:', error);
            throw error;
        }
    },

    /**
     * Auto-decline expired payments
     */
    async autoDeclineExpired(): Promise<number> {
        try {
            const expiredPayments = await this.getExpiredPayments();
            let declinedCount = 0;

            for (const payment of expiredPayments) {
                await this.declinePayment(
                    (payment as any).$id,
                    'system',
                    'No response from admin within 7 days. Please resubmit your payment proof.'
                );
                declinedCount++;
            }

            console.log(`✅ Auto-declined ${declinedCount} expired payments`);
            return declinedCount;
        } catch (error) {
            console.error('❌ Failed to auto-decline expired payments:', error);
            throw error;
        }
    },

    /**
     * Notify admin of new payment submission
     */
    async notifyAdminNewPayment(confirmation: any): Promise<void> {
        try {
            const emailBody = `
New Payment Proof Submitted

Transaction ID: ${confirmation.transactionId}
User: ${confirmation.userName} (${confirmation.userEmail})
Member Type: ${confirmation.memberType}
Payment Type: ${confirmation.paymentType}
${confirmation.packageType ? `Package: ${confirmation.packageType}` : ''}
Amount: IDR ${confirmation.amount.toLocaleString()}
Bank: ${confirmation.bankName}
Account: ${confirmation.accountNumber}
Submitted: ${new Date(confirmation.submittedAt).toLocaleString()}
Expires: ${new Date(confirmation.expiresAt).toLocaleString()}

View proof: ${confirmation.paymentProofUrl}

Please review and approve/decline within 7 days.
            `.trim();

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '46ce7d7f-e9d5-4d49-8f14-0b0e3c3e1f5a',
                    subject: `🔔 New Payment Proof Submitted - ${confirmation.memberType}`,
                    from_name: 'IndaStreet Payment System',
                    email: 'indastreet.id@gmail.com',
                    message: emailBody,
                }),
            });

            if (!response.ok) {
                throw new Error(`Email service returned ${response.status}`);
            }

            console.log('✅ Admin notification sent for new payment');
        } catch (error) {
            console.error('❌ Failed to send admin notification:', error);
            // Don't throw - payment is still submitted
        }
    },
};

// ===========================
// Premium Payments Service
// ===========================
export const premiumPaymentsService = {
    /**
     * Create premium payment record
     */
    async create(data: {
        userId: string;
        therapistId: string;
        paymentAmount: number;
        currency: string;
        paymentProofUrl: string;
        paymentStatus: string;
        submittedAt: string;
    }): Promise<any> {
        try {
            console.log('📝 Creating premium payment record...');
            
            const payment = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.premiumPayments,
                ID.unique(),
                {
                    paymentId: Date.now(), // Generate unique integer ID
                    userId: parseInt(data.userId) || 0, // Convert to integer
                    therapistId: parseInt(data.therapistId) || 0, // Convert to integer
                    paymentAmount: data.paymentAmount,
                    currency: data.currency,
                    paymentProofUrl: data.paymentProofUrl,
                    paymentStatus: data.paymentStatus,
                    submittedAt: data.submittedAt,
                    placeId: null,
                    bookingId: null,
                    activatedAt: null,
                    declineReason: null,
                }
            );
            
            console.log('✅ Premium payment record created:', (payment as any).$id);
            return payment;
        } catch (error) {
            console.error('❌ Failed to create premium payment:', error);
            throw error;
        }
    },

    /**
     * Update premium payment status
     */
    async update(paymentId: string, data: {
        paymentStatus?: string;
        activatedAt?: string;
        declineReason?: string;
    }): Promise<any> {
        try {
            const updates: any = {};
            if (data.paymentStatus) updates.paymentStatus = data.paymentStatus;
            if (data.activatedAt) updates.activatedAt = data.activatedAt;
            if (data.declineReason) updates.declineReason = data.declineReason;

            const payment = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.premiumPayments,
                paymentId,
                updates
            );

            console.log('✅ Premium payment updated:', paymentId);
            return payment;
        } catch (error) {
            console.error('❌ Failed to update premium payment:', error);
            throw error;
        }
    },

    /**
     * Get payment by therapist ID
     */
    async getByTherapistId(therapistId: string): Promise<any | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.premiumPayments,
                [
                    Query.equal('therapistId', parseInt(therapistId) || 0),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1)
                ]
            );

            return response.documents[0] || null;
        } catch (error) {
            console.error('❌ Failed to get premium payment:', error);
            return null;
        }
    },

    /**
     * Get all pending payments for admin
     */
    async getPendingPayments(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.premiumPayments,
                [
                    Query.equal('paymentStatus', 'pending'),
                    Query.orderDesc('$createdAt')
                ]
            );

            return response.documents;
        } catch (error) {
            console.error('❌ Failed to get pending payments:', error);
            return [];
        }
    },
};

// ===========================
// Therapist Menus Service
// ===========================
// 🛡️ THERAPIST MENUS SERVICE 
// CRITICAL REQUIREMENTS:
// 1. Collection ID must use underscores: 'therapist_menus' NOT 'Therapist Menus' 
// 2. Menu data flows: Dashboard → Service → Collection → TherapistCard display
// 3. Always check for null returns - collection might be disabled
// 4. See THERAPIST_MENU_SYSTEM_SAFEGUARDS.md for full documentation
export const therapistMenusService = {
    /**
     * Get menu for therapist
     */
    async getByTherapistId(therapistId: string): Promise<any | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapistMenus,
                [
                    Query.equal('therapistId', therapistId),
                    // If duplicates exist, always pick the most recently updated doc
                    Query.orderDesc('$updatedAt'),
                    Query.limit(1)
                ]
            );

            return response.documents[0] || null;
        } catch (error) {
            console.error('❌ Failed to get therapist menu:', error);
            return null;
        }
    },

    /**
     * Save or update menu
     */
    async saveMenu(therapistId: string, menuData: string): Promise<any> {
        try {
            // Check if menu exists
            const existing = await this.getByTherapistId(therapistId);

            if (existing) {
                // Update existing menu
                const updated = await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapistMenus,
                    (existing as any).$id,
                    { 
                        menuData,
                        updatedDate: new Date().toISOString()
                    }
                );
                console.log('✅ Menu updated');
                return updated;
            } else {
                // Create new menu with permissions
                const menuId = ID.unique();
                const now = new Date().toISOString();
                const created = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapistMenus,
                    menuId,
                    {
                        menuId: menuId,
                        therapistId,
                        menuData,
                        isActive: true,
                        createdDate: now,
                        updatedDate: now
                    },
                    [
                        Permission.read(Role.any()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users())
                    ]
                );
                console.log('✅ Menu created');
                return created;
            }
        } catch (error) {
            console.error('❌ Failed to save menu:', error);
            throw error;
        }
    },

    /**
     * Delete menu
     */
    async deleteMenu(therapistId: string): Promise<void> {
        try {
            const existing = await this.getByTherapistId(therapistId);
            if (existing) {
                await databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapistMenus,
                    (existing as any).$id
                );
                console.log('✅ Menu deleted');
            }
        } catch (error) {
            console.error('❌ Failed to delete menu:', error);
            throw error;
        }
    },
};









