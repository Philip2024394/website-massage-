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
            const user = await retryWithBackoff(
                () => appwriteAccount.get(),
                'account_get_after_login'
            );
            
            // Store user info in localStorage as fallback for when cookies fail
            if (user?.$id) {
                try {
                    localStorage.setItem('therapist_session_backup', JSON.stringify({
                        userId: user.$id,
                        email: user.email,
                        timestamp: Date.now()
                    }));
                    console.log('✅ Session backup saved to localStorage');
                } catch (err) {
                    console.warn('⚠️ Failed to save session backup:', err);
                }
            }
            
            return user;
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
            console.log('🔵 auth.service: Starting registration for:', email);
            
            // Validate inputs - trim whitespace from email
            const trimmedEmail = email.trim();
            if (!trimmedEmail) {
                throw new Error('Email is required');
            }
            if (!password || password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }
            if (!name || name.trim().length === 0) {
                throw new Error('Name is required');
            }
            
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
            
            console.log('🔵 Creating Appwrite account...');
            const response = await retryWithBackoff(
                () => appwriteAccount.create('unique()', trimmedEmail, password, name),
                'account_create'
            );
            console.log('✅ Appwrite account created:', response.$id);
            
            // Auto-login after registration unless explicitly disabled
            const shouldAutoLogin = options?.autoLogin !== false;
            if (shouldAutoLogin) {
                console.log('🔵 Auto-logging in...');
                await retryWithBackoff(
                    () => appwriteAccount.createEmailPasswordSession(trimmedEmail, password),
                    'account_login_after_register'
                );
                
                // Store user info in localStorage as fallback
                try {
                    localStorage.setItem('therapist_session_backup', JSON.stringify({
                        userId: response.$id,
                        email: trimmedEmail,
                        timestamp: Date.now()
                    }));
                    console.log('✅ Session backup saved to localStorage');
                } catch (err) {
                    console.warn('⚠️ Failed to save session backup:', err);
                }
                console.log('✅ Auto-login successful');
            }
            return response;
        } catch (error: any) {
            console.error('❌ auth.service: Registration failed:', error);
            console.error('❌ Error details:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response
            });
            
            // Provide specific error messages based on Appwrite error codes
            if (error.code === 409 || error.message?.includes('already exists')) {
                throw new Error('An account with this email already exists');
            } else if (error.code === 400 || error.message?.toLowerCase().includes('password')) {
                throw new Error('Password must be at least 8 characters long');
            } else if (error.code === 429 || error.message?.includes('rate limit')) {
                throw new Error('Too many registration attempts. Please wait a moment');
            } else if (error.code === 400) {
                // Generic 400 error - don't expose technical details about email format
                throw new Error('Unable to create account. Please try a different email or contact support.');
            } else {
                throw new Error(error.message || 'Registration failed. Please try again');
            }
        }
    },
    
    async logout(): Promise<void> {
        try {
            await retryWithBackoff(
                () => appwriteAccount.deleteSession('current'),
                'account_logout'
            );
            // Clear localStorage session backup
            try {
                localStorage.removeItem('therapist_session_backup');
                console.log('🗑️ Session backup cleared from localStorage');
            } catch (err) {
                console.warn('⚠️ Failed to clear session backup:', err);
            }
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
