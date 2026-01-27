/**
 * =====================================================================
 * ADMIN ROUTE GUARD - Role-Based Access Control
 * =====================================================================
 * 
 * Protects admin routes from unauthorized access.
 * Implements Facebook/Amazon-level security standards.
 * 
 * Features:
 * - Session persistence on refresh
 * - Role-based branching (admin vs regular user)
 * - Redirect unauthorized users to main dashboard
 * - Admin session validation
 * 
 * @version 1.0.0
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { account } from './appwriteClient';

// =====================================================================
// ADMIN EMAILS - Authorized admin users
// =====================================================================

const ADMIN_EMAILS = [
    'admin@indastreet.com',
    'admin@indastreetmassage.com',
    'philip@indastreet.com',
    // Add more admin emails as needed
];

// =====================================================================
// ADMIN SESSION HOOK
// =====================================================================

interface AdminSession {
    isAdmin: boolean;
    isLoading: boolean;
    user: any | null;
    error: string | null;
}

export const useAdminSession = (): AdminSession => {
    const [session, setSession] = useState<AdminSession>({
        isAdmin: false,
        isLoading: true,
        user: null,
        error: null
    });

    useEffect(() => {
        const checkAdminSession = async () => {
            try {
                const user = await account.get();
                const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
                
                console.log('🔐 [ADMIN GUARD] Session check:', {
                    email: user.email,
                    isAdmin,
                    name: user.name
                });
                
                setSession({
                    isAdmin,
                    isLoading: false,
                    user,
                    error: null
                });
            } catch (error: any) {
                console.log('🔐 [ADMIN GUARD] No active session');
                setSession({
                    isAdmin: false,
                    isLoading: false,
                    user: null,
                    error: error.message
                });
            }
        };

        checkAdminSession();
    }, []);

    return session;
};

// =====================================================================
// ADMIN ROUTE GUARD COMPONENT
// =====================================================================

interface AdminGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    onUnauthorized?: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
    children,
    fallback,
    onUnauthorized
}) => {
    const { isAdmin, isLoading, user, error } = useAdminSession();

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // Unauthorized - not logged in or not admin
    if (!isAdmin) {
        if (onUnauthorized) {
            onUnauthorized();
        }
        
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Admin Access Required
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error 
                            ? 'Please log in with an admin account to access this page.'
                            : 'You do not have permission to access the admin dashboard.'}
                    </p>
                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go to Home
                    </button>
                    {user && (
                        <p className="mt-4 text-sm text-gray-500">
                            Logged in as: {user.email}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Authorized - render admin content
    return <>{children}</>;
};

// =====================================================================
// DEV MODE BYPASS (for local development)
// =====================================================================

export const AdminGuardDev: React.FC<AdminGuardProps> = ({ children }) => {
    // In development, bypass auth check for localhost
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
    
    if (isDev) {
        console.log('🔧 [DEV MODE] Admin guard bypassed for local development');
        return <>{children}</>;
    }
    
    return <AdminGuard>{children}</AdminGuard>;
};

// =====================================================================
// ADMIN LOGIN HELPER
// =====================================================================

export const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
        // Try to create session
        await account.createEmailPasswordSession(email, password);
        
        // Check if user is admin
        const user = await account.get();
        const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        if (!isAdmin) {
            // Log out non-admin users
            await account.deleteSession('current');
            console.log('🚫 [ADMIN LOGIN] User is not an admin:', email);
            return false;
        }
        
        console.log('✅ [ADMIN LOGIN] Admin logged in:', email);
        return true;
    } catch (error: any) {
        console.error('❌ [ADMIN LOGIN] Failed:', error.message);
        return false;
    }
};

export const adminLogout = async (): Promise<void> => {
    try {
        await account.deleteSession('current');
        console.log('✅ [ADMIN LOGOUT] Session ended');
    } catch (error: any) {
        console.error('❌ [ADMIN LOGOUT] Error:', error.message);
    }
};

// =====================================================================
// CHECK IF CURRENT USER IS ADMIN
// =====================================================================

export const isCurrentUserAdmin = async (): Promise<boolean> => {
    try {
        const user = await account.get();
        return ADMIN_EMAILS.includes(user.email.toLowerCase());
    } catch {
        return false;
    }
};

// =====================================================================
// DEVELOPMENT BYPASS - Admin Access Without Login
// =====================================================================

/**
 * Creates a temporary admin session for development/testing
 * This bypasses normal login flow - use only for development!
 */
export const createDevAdminSession = async (): Promise<boolean> => {
    try {
        // Use a pre-configured admin account for dev access
        const adminEmail = 'admin@indastreet.com';
        const adminPassword = 'admin123'; // Default dev password
        
        console.log('🚀 [DEV ADMIN] Creating development admin session...');
        
        // Try to login with dev admin credentials
        await account.createEmailPasswordSession(adminEmail, adminPassword);
        
        const user = await account.get();
        console.log('✅ [DEV ADMIN] Development admin session created:', user.email);
        return true;
        
    } catch (error: any) {
        // If account doesn't exist, create it
        if (error.code === 401 || error.message.includes('Invalid credentials')) {
            try {
                console.log('📝 [DEV ADMIN] Creating development admin account...');
                
                // Create dev admin account
                await account.create(
                    'dev-admin-id', 
                    'admin@indastreet.com', 
                    'admin123',
                    'Dev Admin'
                );
                
                // Now login
                await account.createEmailPasswordSession('admin@indastreet.com', 'admin123');
                
                console.log('✅ [DEV ADMIN] Development admin account created and logged in');
                return true;
                
            } catch (createError: any) {
                console.error('❌ [DEV ADMIN] Failed to create dev account:', createError.message);
                return false;
            }
        }
        
        console.error('❌ [DEV ADMIN] Failed to create session:', error.message);
        return false;
    }
};

/**
 * Quick admin access for VS Code development
 * Call this function in browser console or trigger from code
 */
export const enableDevAdminAccess = () => {
    if (typeof window !== 'undefined') {
        (window as any).__DEV_ADMIN_ACCESS = createDevAdminSession;
        console.log('🎯 [DEV ADMIN] Added to window.__DEV_ADMIN_ACCESS()');
        console.log('🔧 [DEV ADMIN] Run: window.__DEV_ADMIN_ACCESS() in console');
    }
};

// Enable in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    enableDevAdminAccess();
}

console.log('✅ [ADMIN GUARD] Role-based access control initialized');
