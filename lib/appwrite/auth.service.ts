import { appwriteAccount } from './client';

export const authService = {
    async getCurrentUser(): Promise<any> {
        try {
            return await appwriteAccount.get();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },
    
    async login(email: string, password: string): Promise<any> {
        try {
            // Delete any existing session first
            try {
                await appwriteAccount.deleteSession('current');
                console.log('🗑️ Existing session cleared before login');
            } catch {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }
            
            await appwriteAccount.createEmailPasswordSession(email, password);
            return await appwriteAccount.get();
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
                await appwriteAccount.deleteSession('current');
                console.log('🗑️ Existing session cleared before registration');
            } catch {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }
            
            const response = await appwriteAccount.create('unique()', email, password, name);
            // Auto-login after registration unless explicitly disabled
            const shouldAutoLogin = options?.autoLogin !== false;
            if (shouldAutoLogin) {
                await appwriteAccount.createEmailPasswordSession(email, password);
            }
            return response;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },
    
    async logout(): Promise<void> {
        try {
            await appwriteAccount.deleteSession('current');
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
            if (error.message?.includes('429')) {
                console.log('⚠️ Anonymous session rate limited - will retry later');
                return null;
            } else if (error.message?.includes('already exists')) {
                console.log('✅ Anonymous session already exists');
                return await appwriteAccount.get().catch(() => null);
            } else {
                console.log('Anonymous session creation deferred:', error.message);
                return null;
            }
        }
    }
};
