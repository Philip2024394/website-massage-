import { logger } from './enterpriseLogger';
import { databases, ID, Query, account } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite/config';
import { appwriteHealthMonitor } from './appwriteHealthMonitor';
import { validateChatSession } from '../lib/appwrite/schemas/validators';

// Connection and retry configuration
const CONFIG = {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    TIMEOUT: 10000, // 10 seconds
    SESSION_EXPIRY_HOURS: 24
};

// Enhanced error types for better handling
class AppwriteConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AppwriteConnectionError';
    }
}

class SessionNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SessionNotFoundError';
    }
}

interface ChatSession {
    $id?: string;
    sessionId: string;
    chatId?: string;  // ✅ Added: Required by Appwrite schema
    userId?: string;  // ✅ Added: Required by Appwrite schema - ID of logged-in user
    customerId?: string;
    customerName?: string;
    customerWhatsApp?: string;
    providerId: string;
    providerName: string;
    providerType: 'therapist' | 'place';
    providerStatus: 'available' | 'busy' | 'offline';
    mode: 'immediate' | 'scheduled';
    pricing?: { [key: string]: number };
    discountPercentage?: number;
    discountActive?: boolean;
    profilePicture?: string;
    providerRating?: number;
    bookingId?: string;
    chatRoomId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string; // Auto-cleanup inactive sessions
}

// Utility function for retrying operations with health checking
const retryOperation = async <T>(
    operation: () => Promise<T>,
    attempts: number = CONFIG.RETRY_ATTEMPTS,
    delay: number = CONFIG.RETRY_DELAY
): Promise<T> => {
    // Check circuit breaker first
    const isHealthy = await appwriteHealthMonitor.isHealthy();
    if (!isHealthy) {
        const status = appwriteHealthMonitor.getStatus();
        throw new AppwriteConnectionError(`Appwrite service unavailable. Circuit breaker: ${status.circuitOpen ? 'OPEN' : 'CLOSED'}, Failures: ${status.consecutiveFailures}`);
    }
    
    try {
        return await Promise.race([
            operation(),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Operation timeout')), CONFIG.TIMEOUT)
            )
        ]);
    } catch (error) {
        if (attempts <= 1) {
            if (error instanceof Error && error.message.includes('network')) {
                throw new AppwriteConnectionError(`Network error after ${CONFIG.RETRY_ATTEMPTS} attempts: ${error.message}`);
            }
            throw error;
        }
        
        logger.warn(`Operation failed, retrying... (${CONFIG.RETRY_ATTEMPTS - attempts + 1}/${CONFIG.RETRY_ATTEMPTS})`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryOperation(operation, attempts - 1, delay * 2); // Exponential backoff
    }
};

// Validate session data before operations
const validateSessionData = (data: any): void => {
    if (!data.providerId) throw new Error('Provider ID is required');
    if (!data.providerName) throw new Error('Provider name is required');
    if (!data.providerType) throw new Error('Provider type is required');
};

export const chatSessionService = {
    // Validate session consistency between local and remote state
    async validateSessionConsistency(localChatInfo: any): Promise<{ isValid: boolean; correctedSession?: ChatSession }> {
        try {
            if (!localChatInfo?.therapistId) {
                return { isValid: false };
            }

            const remoteSession = await this.getActiveSession(localChatInfo.therapistId);
            
            if (!remoteSession) {
                logger.warn('🔄 Local session exists but no remote session found. Creating remote session...');
                
                try {
                    const correctedSession = await this.createSession({
                        customerId: localChatInfo.customerName || 'Guest',
                        customerName: localChatInfo.customerName || 'Guest',
                        customerWhatsApp: localChatInfo.customerWhatsApp || '',
                        providerId: localChatInfo.therapistId,
                        providerName: localChatInfo.therapistName,
                        providerType: localChatInfo.therapistType || 'therapist',
                        providerStatus: localChatInfo.therapistStatus || 'available',
                        mode: localChatInfo.mode || 'immediate',
                        pricing: localChatInfo.pricing || { '60': 200000, '90': 300000, '120': 400000 },
                        discountPercentage: localChatInfo.discountPercentage,
                        discountActive: localChatInfo.discountActive,
                        profilePicture: localChatInfo.profilePicture,
                        providerRating: localChatInfo.providerRating,
                        bookingId: localChatInfo.bookingId,
                        chatRoomId: localChatInfo.chatRoomId,
                        isActive: true
                    });
                    
                    return { isValid: true, correctedSession };
                } catch (error) {
                    logger.warn('⚠️ Could not create corrective session:', error);
                    return { isValid: false };
                }
            }
            
            // Check for data consistency
            const hasDataMismatch = (
                remoteSession.providerName !== localChatInfo.therapistName ||
                remoteSession.providerStatus !== localChatInfo.therapistStatus ||
                JSON.stringify(remoteSession.pricing) !== JSON.stringify(localChatInfo.pricing)
            );
            
            if (hasDataMismatch) {
                logger.info('🔄 Data mismatch detected, syncing with remote session');
                return { isValid: true, correctedSession: remoteSession };
            }
            
            return { isValid: true };
        } catch (error) {
            logger.warn('⚠️ Session consistency check failed:', error);
            return { isValid: false };
        }
    },
    // Create new chat session with enhanced error handling
    async createSession(sessionData: Omit<ChatSession, '$id' | 'sessionId' | 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
        try {
            // Validate input data
            validateSessionData(sessionData);
            
            const sessionId = ID.unique();
            const now = new Date().toISOString();
            const expiresAt = new Date(Date.now() + CONFIG.SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

            // ✅ FIX: Get current user ID (required by Appwrite schema)
            let userId = '';
            try {
                const currentUser = await account.get();
                userId = currentUser.$id;
                logger.info('✅ Got current user ID:', userId);
            } catch (error) {
                logger.warn('⚠️ Could not get user ID, session creation may fail:', error);
                // Continue anyway - Appwrite will reject if userId is required
            }

            // CRITICAL FIX: Convert pricing object to JSON string (Appwrite doesn't support nested objects)
            const appwritePayload: any = {
                sessionId,
                chatId: sessionId,  // ✅ FIX: Add required chatId field
                userId,  // ✅ FIX: Add required userId field
                ...sessionData,  // Include all fields from caller
                therapistId: sessionData.providerId,  // ✅ FIX: Add required therapistId field (same as providerId)
                bookingId: sessionData.bookingId || sessionId,
                isActive: true,
                startTime: now,  // ✅ FIX: Add required startTime field
                messagesCount: 0,  // ✅ FIX: Add required messagesCount field (starts at 0)
                createdAt: now,
                updatedAt: now,
                expiresAt
            };
            
            // Convert pricing object to JSON string if it exists
            if (appwritePayload.pricing && typeof appwritePayload.pricing === 'object') {
                appwritePayload.pricing = JSON.stringify(appwritePayload.pricing);
            }

            // ✅ FIX: Convert profilePicture to array if it's a string (Appwrite schema requires array)
            if (appwritePayload.profilePicture) {
                if (typeof appwritePayload.profilePicture === 'string') {
                    appwritePayload.profilePicture = [appwritePayload.profilePicture];
                    logger.info('✅ Converted profilePicture string to array:', appwritePayload.profilePicture);
                } else if (!Array.isArray(appwritePayload.profilePicture)) {
                    // If it's not a string and not an array, remove it to prevent errors
                    delete appwritePayload.profilePicture;
                    logger.warn('⚠️ Removed invalid profilePicture (not string or array)');
                }
            }

            // ✅ FIX: Validate discountPercentage (must be 1-100 or removed)
            if (appwritePayload.discountPercentage !== undefined) {
                const discount = Number(appwritePayload.discountPercentage);
                if (isNaN(discount) || discount < 1 || discount > 100) {
                    delete appwritePayload.discountPercentage;
                    delete appwritePayload.discountActive;  // Remove discountActive if percentage is invalid
                    logger.info('✅ Removed invalid discountPercentage and discountActive:', appwritePayload.discountPercentage);
                } else {
                    appwritePayload.discountPercentage = discount;
                }
            } else if (appwritePayload.discountActive) {
                // If discountActive is true but no percentage provided, remove discountActive
                delete appwritePayload.discountActive;
                logger.info('✅ Removed discountActive (no discountPercentage provided)');
            }

            // ✅ FIX: Validate discountActive (must be boolean)
            if (appwritePayload.discountActive !== undefined && typeof appwritePayload.discountActive !== 'boolean') {
                appwritePayload.discountActive = Boolean(appwritePayload.discountActive);
            }

            // LOG EVERY FIELD AND ITS TYPE
            logger.info('🔬 FULL PAYLOAD DEBUG:', JSON.stringify(appwritePayload, null, 2));
            logger.info('🔬 FIELD TYPES:', Object.keys(appwritePayload).map(key => ({
                field: key,
                type: typeof appwritePayload[key],
                value: appwritePayload[key],
                isObject: typeof appwritePayload[key] === 'object' && appwritePayload[key] !== null
            })));

            logger.info('💾 Creating chat session:', { 
                sessionId, 
                bookingId: appwritePayload.bookingId,
                providerId: appwritePayload.providerId,
                pricingType: typeof appwritePayload.pricing,
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.chatSessions
            });

            const result = await retryOperation(async () => {
                return await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatSessions,
                    sessionId,
                    appwritePayload  // Use payload with stringified pricing
                );
            });

            logger.info('✅ Chat session created successfully:', result.$id);
            return result as unknown as ChatSession;
        } catch (error: any) {
            logger.error('❌ CHAT SESSION CREATION FAILED - FULL ERROR:', error);
            logger.error('❌ Error message:', error?.message);
            logger.error('❌ Error response:', error?.response);
            logger.error('❌ Failed to create chat session:', {
                message: error?.message,
                code: error?.code,
                type: error?.type,
                response: error?.response,
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.chatSessions,
                sessionData: {
                    bookingId: sessionData.bookingId,
                    providerId: sessionData.providerId
                }
            });
            
            // Enhanced error reporting
            if (error instanceof AppwriteConnectionError) {
                throw new Error('Unable to connect to chat service. Please check your internet connection and try again.');
            } else if (error?.message?.includes('Invalid collection ID') || error?.message?.includes('collection')) {
                throw new Error(`Chat service configuration error: ${error.message}. Collection ID: ${APPWRITE_CONFIG.collections.chatSessions}`);
            } else if (error?.code === 401) {
                throw new Error('Permission denied. Please ensure guest users can create chat sessions.');
            } else if (error?.code === 400) {
                throw new Error(`Invalid data format: ${error.message}. Please check schema requirements.`);
            }
            
            throw error;
        }
    },

    // Get active session for provider with enhanced error handling
    async getActiveSession(providerId: string, customerId?: string): Promise<ChatSession | null> {
        try {
            // Input validation
            if (!providerId?.trim()) {
                throw new Error('Provider ID is required');
            }

            const queries = [
                Query.equal('providerId', providerId.trim()),
                Query.equal('isActive', [true]),  // Must be array for Query.equal
                Query.orderDesc('updatedAt'),
                Query.limit(5)
            ];

            if (customerId?.trim()) {
                queries.push(Query.equal('customerId', [customerId.trim()]));  // Must be array
            }

            const result = await retryOperation(async () => {
                return await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatSessions,
                    queries
                );
            });

            if (result.documents.length > 0) {
                const session = result.documents[0] as unknown as ChatSession;
                
                // Check if session is actually expired (server-side cleanup might be delayed)
                if (session.expiresAt && new Date(session.expiresAt) <= new Date()) {
                    logger.info('⏰ Session expired, closing automatically:', session.sessionId);
                    await this.closeSession(session.sessionId).catch(console.warn);
                    return null;
                }
                
                logger.info('📖 Retrieved active chat session:', session.sessionId);
                return session;
            }

            logger.info('📭 No active session found for provider:', providerId);
            return null;
        } catch (error: any) {
            // Silently handle missing collection (400/404 errors)
            if (error?.code === 400 || error?.code === 404 || error?.status === 400 || error?.status === 404) {
                // Collection doesn't exist yet or bad query - fail silently
                return null;
            }
            
            if (error instanceof AppwriteConnectionError) {
                logger.error('🌐 Connection error while fetching session:', error.message);
                return null; // Graceful degradation
            }
            
            logger.warn('⚠️ Failed to get active session:', error);
            return null;
        }
    },

    // Update session with validation and retry
    async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
        try {
            // Input validation
            if (!sessionId?.trim()) {
                throw new Error('Session ID is required for update');
            }
            
            if (!updates || Object.keys(updates).length === 0) {
                throw new Error('Update data is required');
            }

            // Prevent updating system fields
            const { $id, sessionId: _, createdAt, expiresAt, ...allowedUpdates } = updates as any;
            
            const updatedData: any = {
                ...allowedUpdates,
                updatedAt: new Date().toISOString()
            };

            // ✅ FIX: Convert pricing object to JSON string if it exists (Appwrite requires string)
            if (updatedData.pricing && typeof updatedData.pricing === 'object') {
                updatedData.pricing = JSON.stringify(updatedData.pricing);
                logger.info('✅ Stringified pricing for update:', updatedData.pricing);
            }

            // ✅ FIX: Convert profilePicture to array if it's a string (Appwrite schema requires array)
            if (updatedData.profilePicture) {
                if (typeof updatedData.profilePicture === 'string') {
                    updatedData.profilePicture = [updatedData.profilePicture];
                    logger.info('✅ Converted profilePicture string to array for update');
                } else if (!Array.isArray(updatedData.profilePicture)) {
                    delete updatedData.profilePicture;
                    logger.warn('⚠️ Removed invalid profilePicture from update');
                }
            }

            // ✅ FIX: Validate discountPercentage (must be 1-100 or removed)
            if (updatedData.discountPercentage !== undefined) {
                const discount = Number(updatedData.discountPercentage);
                if (isNaN(discount) || discount < 1 || discount > 100) {
                    delete updatedData.discountPercentage;
                    delete updatedData.discountActive;  // Remove discountActive if percentage is invalid
                    logger.info('✅ Removed invalid discountPercentage and discountActive from update:', updatedData.discountPercentage);
                } else {
                    updatedData.discountPercentage = discount;
                }
            } else if (updatedData.discountActive) {
                // If discountActive is true but no percentage provided, remove discountActive
                delete updatedData.discountActive;
                logger.info('✅ Removed discountActive from update (no discountPercentage provided)');
            }

            // ✅ FIX: Validate discountActive (must be boolean)
            if (updatedData.discountActive !== undefined && typeof updatedData.discountActive !== 'boolean') {
                updatedData.discountActive = Boolean(updatedData.discountActive);
            }

            const result = await retryOperation(async () => {
                return await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatSessions,
                    sessionId.trim(),
                    updatedData
                );
            });

            logger.info('✅ Chat session updated:', sessionId);
            return result as unknown as ChatSession;
        } catch (error) {
            if (error instanceof Error && error.message.includes('Document not found')) {
                throw new SessionNotFoundError(`Session ${sessionId} not found or already deleted`);
            }
            
            logger.error('❌ Failed to update chat session:', error);
            throw error;
        }
    },

    // Close session with enhanced error handling
    async closeSession(sessionId: string): Promise<void> {
        try {
            if (!sessionId?.trim()) {
                logger.warn('⚠️ No session ID provided for closing');
                return;
            }

            await this.updateSession(sessionId.trim(), {
                isActive: false,
                updatedAt: new Date().toISOString()
            });

            logger.info('🔒 Chat session closed:', sessionId);
        } catch (error) {
            if (error instanceof SessionNotFoundError) {
                logger.info('📝 Session already closed or deleted:', sessionId);
                return; // Graceful handling - session is effectively closed
            }
            
            logger.error('❌ Failed to close chat session:', error);
            // Don't throw - closing should be graceful
        }
    },

    // Get session by ID
    async getSession(sessionId: string): Promise<ChatSession | null> {
        try {
            const result = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatSessions,
                sessionId
            );

            return result as unknown as ChatSession;
        } catch (error) {
            logger.warn('⚠️ Failed to get session by ID:', error);
            return null;
        }
    },

    // List all active sessions for current user (for session restoration)
    async listActiveSessions(limit: number = 5): Promise<ChatSession[]> {
        try {
            const result = await retryOperation(async () => {
                return await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatSessions,
                    [
                        Query.equal('isActive', [true]),
                        Query.orderDesc('updatedAt'),
                        Query.limit(limit)
                    ]
                );
            });

            return result.documents.map(doc => doc as unknown as ChatSession);
        } catch (error) {
            logger.warn('⚠️ Failed to list active sessions:', error);
            return [];
        }
    },

    // Cleanup expired sessions (can be called periodically)
    async cleanupExpiredSessions(): Promise<void> {
        try {
            const now = new Date().toISOString();
            const expiredSessions = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatSessions,
                [
                    Query.lessThan('expiresAt', now),
                    Query.equal('isActive', [true])
                ]
            );

            for (const session of expiredSessions.documents) {
                await this.closeSession(session.$id);
            }

            if (expiredSessions.documents.length > 0) {
                logger.info(`🧹 Cleaned up ${expiredSessions.documents.length} expired chat sessions`);
            }
        } catch (error) {
            logger.warn('⚠️ Failed to cleanup expired sessions:', error);
        }
    }
};