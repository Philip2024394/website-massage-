import { databases, ID, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { appwriteHealthMonitor } from './appwriteHealthMonitor';

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
        
        console.warn(`Operation failed, retrying... (${CONFIG.RETRY_ATTEMPTS - attempts + 1}/${CONFIG.RETRY_ATTEMPTS})`, error);
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
                console.warn('🔄 Local session exists but no remote session found. Creating remote session...');
                
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
                    console.warn('⚠️ Could not create corrective session:', error);
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
                console.log('🔄 Data mismatch detected, syncing with remote session');
                return { isValid: true, correctedSession: remoteSession };
            }
            
            return { isValid: true };
        } catch (error) {
            console.warn('⚠️ Session consistency check failed:', error);
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

            const session: Omit<ChatSession, '$id'> = {
                sessionId,
                ...sessionData,
                isActive: true,
                createdAt: now,
                updatedAt: now,
                expiresAt
            };

            console.log('💾 Creating chat session:', { sessionId, providerId: session.providerId });

            const result = await retryOperation(async () => {
                return await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatSessions,
                    sessionId,
                    session
                );
            });

            console.log('✅ Chat session created successfully:', result.$id);
            return result as unknown as ChatSession;
        } catch (error) {
            console.error('❌ Failed to create chat session:', error);
            
            // Enhanced error reporting
            if (error instanceof AppwriteConnectionError) {
                throw new Error('Unable to connect to chat service. Please check your internet connection and try again.');
            } else if (error instanceof Error && error.message.includes('Invalid collection ID')) {
                throw new Error('Chat service configuration error. Please contact support.');
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
                    console.log('⏰ Session expired, closing automatically:', session.sessionId);
                    await this.closeSession(session.sessionId).catch(console.warn);
                    return null;
                }
                
                console.log('📖 Retrieved active chat session:', session.sessionId);
                return session;
            }

            console.log('📭 No active session found for provider:', providerId);
            return null;
        } catch (error: any) {
            // Silently handle missing collection (400/404 errors)
            if (error?.code === 400 || error?.code === 404 || error?.status === 400 || error?.status === 404) {
                // Collection doesn't exist yet or bad query - fail silently
                return null;
            }
            
            if (error instanceof AppwriteConnectionError) {
                console.error('🌐 Connection error while fetching session:', error.message);
                return null; // Graceful degradation
            }
            
            console.warn('⚠️ Failed to get active session:', error);
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
            
            const updatedData = {
                ...allowedUpdates,
                updatedAt: new Date().toISOString()
            };

            const result = await retryOperation(async () => {
                return await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatSessions,
                    sessionId.trim(),
                    updatedData
                );
            });

            console.log('✅ Chat session updated:', sessionId);
            return result as unknown as ChatSession;
        } catch (error) {
            if (error instanceof Error && error.message.includes('Document not found')) {
                throw new SessionNotFoundError(`Session ${sessionId} not found or already deleted`);
            }
            
            console.error('❌ Failed to update chat session:', error);
            throw error;
        }
    },

    // Close session with enhanced error handling
    async closeSession(sessionId: string): Promise<void> {
        try {
            if (!sessionId?.trim()) {
                console.warn('⚠️ No session ID provided for closing');
                return;
            }

            await this.updateSession(sessionId.trim(), {
                isActive: false,
                updatedAt: new Date().toISOString()
            });

            console.log('🔒 Chat session closed:', sessionId);
        } catch (error) {
            if (error instanceof SessionNotFoundError) {
                console.log('📝 Session already closed or deleted:', sessionId);
                return; // Graceful handling - session is effectively closed
            }
            
            console.error('❌ Failed to close chat session:', error);
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
            console.warn('⚠️ Failed to get session by ID:', error);
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
                        Query.equal('isActive', true),
                        Query.orderDesc('updatedAt'),
                        Query.limit(limit)
                    ]
                );
            });

            return result.documents.map(doc => doc as unknown as ChatSession);
        } catch (error) {
            console.warn('⚠️ Failed to list active sessions:', error);
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
                    Query.equal('isActive', true)
                ]
            );

            for (const session of expiredSessions.documents) {
                await this.closeSession(session.$id);
            }

            if (expiredSessions.documents.length > 0) {
                console.log(`🧹 Cleaned up ${expiredSessions.documents.length} expired chat sessions`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to cleanup expired sessions:', error);
        }
    }
};