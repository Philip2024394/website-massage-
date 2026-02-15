/**
 * Authentication Guards and Cross-Contamination Prevention
 * 
 * This utility provides functions to prevent authentication state mixing
 * between different user types (therapist, hotel, villa, admin, etc.)
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { enterpriseWebSocketService } from '../services/enterpriseWebSocketService';

export interface AuthenticationResult {
    success: boolean;
    userType: 'therapist' | 'place' | 'hotel' | 'villa' | 'admin' | 'customer' | 'unknown';
    documentId?: string;
    data?: any;
    error?: string;
}

/**
 * Validates that the authenticated user belongs to the expected user type
 * and provides detailed information about what type they actually are
 */
export const validateUserAuthentication = async (
    expectedType: 'therapist' | 'place' | 'hotel' | 'villa' | 'admin' | 'customer',
    userId: string
): Promise<AuthenticationResult> => {
    console.log(`🔍 Validating user authentication for type: ${expectedType}, userId: ${userId}`);
    
    try {
        const checks = [
            { type: 'therapist', collection: COLLECTIONS.THERAPISTS },
            { type: 'place', collection: COLLECTIONS.PLACES },
            { type: 'hotel', collection: COLLECTIONS.HOTELS, filter: (doc: any) => doc.type === 'hotel' },
            { type: 'villa', collection: COLLECTIONS.HOTELS, filter: (doc: any) => doc.type === 'villa' },
        ];
        
        // Check each user type to determine what this user actually is
        const foundTypes: { type: string; documentId: string; data: any }[] = [];
        
        for (const check of checks) {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    check.collection,
                    []
                );
                
                const userDoc = response.documents.find((doc: any) => {
                    const matchesUserId = doc.userId === userId;
                    const passesFilter = check.filter ? check.filter(doc) : true;
                    return matchesUserId && passesFilter;
                });
                
                if (userDoc) {
                    foundTypes.push({
                        type: check.type,
                        documentId: userDoc.$id,
                        data: userDoc
                    });
                }
            } catch (err) {
                console.log(`Could not check ${check.type} collection:`, err);
            }
        }
        
        console.log(`📊 User ${userId} found in types:`, foundTypes.map(f => f.type));
        
        // If user not found in any collection
        if (foundTypes.length === 0) {
            return {
                success: false,
                userType: 'unknown',
                error: `No account found for user ${userId} in any collection`
            };
        }
        
        // If user found in multiple collections (data integrity issue)
        if (foundTypes.length > 1) {
            console.warn(`⚠️ User ${userId} found in multiple collections:`, foundTypes.map(f => f.type));
        }
        
        // Check if user belongs to expected type
        const expectedTypeMatch = foundTypes.find(f => f.type === expectedType);
        
        if (expectedTypeMatch) {
            return {
                success: true,
                userType: expectedType as any,
                documentId: expectedTypeMatch.documentId,
                data: expectedTypeMatch.data
            };
        } else {
            const actualType = foundTypes[0].type;
            return {
                success: false,
                userType: actualType as any,
                documentId: foundTypes[0].documentId,
                data: foundTypes[0].data,
                error: `This email is registered as a ${actualType} account. Please use the ${actualType} login instead.`
            };
        }
        
    } catch (error) {
        console.error('Error validating user authentication:', error);
        return {
            success: false,
            userType: 'unknown',
            error: 'Authentication validation failed'
        };
    }
};

/**
 * Clears all authentication states to prevent cross-contamination
 * This should be called during any logout to ensure clean state
 */
export const clearAllAuthenticationStates = (stateSetters: {
    setIsHotelLoggedIn?: (value: boolean) => void;
    setIsVillaLoggedIn?: (value: boolean) => void;
    setIsAdminLoggedIn?: (value: boolean) => void;
    setLoggedInUser?: (user: any) => void;
    setLoggedInProvider?: (provider: any) => void;
    setLoggedInAgent?: (agent: any) => void;
    setLoggedInCustomer?: (customer: any) => void;
    setImpersonatedAgent?: (agent: any) => void;
}) => {
    console.log('🧹 Clearing all authentication states...');
    
    // Clear all boolean flags
    if (stateSetters.setIsHotelLoggedIn) stateSetters.setIsHotelLoggedIn(false);
    if (stateSetters.setIsVillaLoggedIn) stateSetters.setIsVillaLoggedIn(false);
    if (stateSetters.setIsAdminLoggedIn) stateSetters.setIsAdminLoggedIn(false);
    
    // Clear all user objects
    if (stateSetters.setLoggedInUser) stateSetters.setLoggedInUser(null);
    if (stateSetters.setLoggedInProvider) stateSetters.setLoggedInProvider(null);
    if (stateSetters.setLoggedInAgent) stateSetters.setLoggedInAgent(null);
    if (stateSetters.setLoggedInCustomer) stateSetters.setLoggedInCustomer(null);
    if (stateSetters.setImpersonatedAgent) stateSetters.setImpersonatedAgent(null);
    
    // Clear sessionStorage for provider data
    sessionStorage.removeItem('logged_in_provider');
    sessionStorage.removeItem('has_entered_app');
    sessionStorage.removeItem('current_page');
    
    console.log('✅ All authentication states cleared');
};

/**
 * Safe logout that ensures complete session cleanup
 */
export const performSafeLogout = async (
    sessionLogout: () => Promise<void>,
    stateSetters: Parameters<typeof clearAllAuthenticationStates>[0],
    setPage: (page: any) => void
) => {
    console.log('🚪 Performing safe logout...');
    
    try {
        // Disconnect WebSocket/realtime before session clear (reduces "WebSocket CLOSING" heartbeat errors)
        try {
            enterpriseWebSocketService.disconnect();
        } catch (e) {
            // Ignore - service may not be initialized
        }
        
        // Clear all authentication states
        clearAllAuthenticationStates(stateSetters);
        
        // Clear session storage and Appwrite session
        await sessionLogout();
        
        // Navigate to home
        setPage('home');
        
        console.log('✅ Safe logout completed successfully');
    } catch (error) {
        console.error('❌ Error during safe logout:', error);
        // Still navigate to home even if session cleanup fails
        setPage('home');
    }
};