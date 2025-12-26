import { appwriteAccount } from './client';
import { retryWithBackoff } from '../rateLimitService';

// Debug logging
console.log('🔧 Auth service loaded with rate limiting support');
console.log('🔧 retryWithBackoff function available:', typeof retryWithBackoff);

export const authService = {
    async getCurrentUser(): Promise<any> {
        try {
            return await retryWithBackoff(
                () => appwriteAccount.get(),
                'account_get'
            );
        } catch (error: any) {
            // Silently handle expected guest/401 errors (not logged in)
            // Only log unexpected errors
            if (error?.code !== 401 && error?.type !== 'general_unauthorized_scope') {
                console.error('Error getting current user:', error);
            }
            return null;
        }
    },
    
    async login(email: string, password: string): Promise<any> {
        try {
            // Delete any existing session first
            try {
                await retryWithBackoff(
                    () => appwriteAccount.deleteSession('current'),
                    'account_delete_session'
                );
                console.log('🗑️ Existing session cleared before login');
            } catch {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }
            
            await retryWithBackoff(
                () => appwriteAccount.createEmailPasswordSession(email, password),
                'account_login'
            );
            return await retryWithBackoff(
                () => appwriteAccount.get(),
                'account_get_after_login'
            );
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },
    
    async register(
        email: string,
        password: string,
        name: string,
        options?: { autoLogin?: boolean }
    ): Promise<any> {
        try {
            // Delete any existing session first
            try {
                await retryWithBackoff(
                    () => appwriteAccount.deleteSession('current'),
                    'account_delete_session_register'
                );
                console.log('🗑️ Existing session cleared before registration');
            } catch {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }
            
            const response = await retryWithBackoff(
                () => appwriteAccount.create('unique()', email, password, name),
                'account_create'
            );
            
            // Auto-login after registration unless explicitly disabled
            const shouldAutoLogin = options?.autoLogin !== false;
            if (shouldAutoLogin) {
                await retryWithBackoff(
                    () => appwriteAccount.createEmailPasswordSession(email, password),
                    'account_login_after_register'
                );
            }
            return response;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },
    
    async logout(): Promise<void> {
        try {
            await retryWithBackoff(
                () => appwriteAccount.deleteSession('current'),
                'account_logout'
            );
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },
    
    async createAnonymousSession(): Promise<any> {
        try {
            // Check if already logged in with timeout
            const currentUser = await Promise.race([
                appwriteAccount.get(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ]).catch(() => null);
            
            if (currentUser) {
                console.log('✅ Session already exists, skipping anonymous creation');
                return currentUser;
            }
            
            // Create anonymous session with timeout and retry logic
            await Promise.race([
                appwriteAccount.createAnonymousSession(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]);
            
            return await appwriteAccount.get();
        } catch (error: any) {
            const errorCode = error?.code || error?.status;
            const errorMsg = error?.message || '';
            
            if (errorCode === 429 || errorMsg.includes('429')) {
                console.log('⚠️ Anonymous session rate limited - will retry later');
                return null;
            } else if (errorCode === 501 || errorMsg.includes('501')) {
                console.warn('⚠️ Anonymous sessions not enabled in Appwrite project - continuing without auth');
                return null;
            } else if (errorMsg.includes('already exists')) {
                console.log('✅ Anonymous session already exists');
                return await appwriteAccount.get().catch(() => null);
            } else {
                console.log('ℹ️ Anonymous session creation deferred:', errorMsg || errorCode);
                return null;
            }
        }
    }
};
