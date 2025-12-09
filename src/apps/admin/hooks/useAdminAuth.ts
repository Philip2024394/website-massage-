import { useState, useEffect } from 'react';
import { account } from '../../../../lib/appwrite';

/**
 * Admin Authentication Hook
 * Handles admin login/logout with Appwrite
 */
export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Check for existing admin session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                // Check if user has admin role (you can customize this check)
                if (currentUser.email && currentUser.email.includes('admin')) {
                    console.log('✅ useAdminAuth: Admin session found:', currentUser.email);
                    setUser(currentUser);
                    setIsAuthenticated(true);
                } else {
                    console.log('⚠️ useAdminAuth: User is not admin');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.log('ℹ️ useAdminAuth: No active session');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Login handler
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            console.log('🔐 useAdminAuth: Attempting admin login...');
            
            // Delete any existing session first
            try {
                await account.deleteSession('current');
            } catch (e) {
                // No existing session, that's fine
            }

            // Create new email session
            const session = await account.createEmailPasswordSession(email, password);
            console.log('✅ useAdminAuth: Session created:', session);

            // Get user details
            const currentUser = await account.get();
            console.log('✅ useAdminAuth: User retrieved:', currentUser.email);

            // Verify admin access (customize this check as needed)
            if (!currentUser.email || !currentUser.email.includes('admin')) {
                console.log('❌ useAdminAuth: Not an admin user');
                await account.deleteSession('current');
                return false;
            }

            setUser(currentUser);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            console.error('❌ useAdminAuth: Login failed:', error.message);
            setIsAuthenticated(false);
            return false;
        }
    };

    // Logout handler
    const logout = async () => {
        try {
            console.log('🚪 useAdminAuth: Logging out admin...');
            await account.deleteSession('current');
            setUser(null);
            setIsAuthenticated(false);
            console.log('✅ useAdminAuth: Logout successful');
        } catch (error) {
            console.error('❌ useAdminAuth: Logout failed:', error);
        }
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout
    };
};
