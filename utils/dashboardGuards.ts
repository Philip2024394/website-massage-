/**
 * Dashboard Authentication Guards
 * Ensures solid separation between different user dashboards
 * Prevents cross-contamination of authentication states
 */

export interface AuthenticationState {
    isAdminLoggedIn: boolean;
    loggedInProvider: { id: string | number; type: 'therapist' | 'place' } | null;
    loggedInCustomer: any | null;
    loggedInUser: { id: string; type: 'admin' | 'hotel' | 'villa' | 'agent' } | null;
    // Legacy optional flags retained for compatibility with existing callers
    isHotelLoggedIn?: boolean;
    isVillaLoggedIn?: boolean;
    loggedInAgent?: any | null;
}

export interface DashboardAccess {
    canAccessTherapistDashboard: boolean;
    canAccessPlaceDashboard: boolean;
    canAccessAdminDashboard: boolean;
    canAccessCustomerDashboard: boolean;
    redirectTo?: string;
    errorMessage?: string;
}

/**
 * Validates authentication state and determines dashboard access permissions
 */
export const validateDashboardAccess = (authState: AuthenticationState): DashboardAccess => {
    const {
        isAdminLoggedIn,
        loggedInProvider,
        loggedInCustomer,
        loggedInUser
    } = authState;

    // Count how many different authentication states are active
    const activeAuthCount = [
        isAdminLoggedIn,
        !!loggedInProvider,
        !!loggedInCustomer
    ].filter(Boolean).length;

    // 🚨 CRITICAL: Multiple authentication states detected
    if (activeAuthCount > 1) {
        console.error('🚨 SECURITY ALERT: Multiple authentication states detected!', {
            isAdminLoggedIn,
            hasProvider: !!loggedInProvider,
            hasCustomer: !!loggedInCustomer,
            loggedInUser
        });

        return {
            canAccessTherapistDashboard: false,
            canAccessPlaceDashboard: false,
            canAccessAdminDashboard: false,
            canAccessCustomerDashboard: false,
            redirectTo: 'home',
            errorMessage: 'Multiple login sessions detected. Please log out and log in again with the correct account type.'
        };
    }

    // Therapist Dashboard Access
    const canAccessTherapistDashboard = 
        !isAdminLoggedIn && 
        loggedInProvider?.type === 'therapist' && 
        !loggedInCustomer &&
        !loggedInUser;

    // Place Dashboard Access
    const canAccessPlaceDashboard = 
        !isAdminLoggedIn && 
        loggedInProvider?.type === 'place' && 
        !loggedInCustomer &&
        !loggedInUser;

    // Admin Dashboard Access
    const canAccessAdminDashboard = isAdminLoggedIn && 
        !loggedInProvider && 
        !loggedInCustomer &&
        loggedInUser?.type === 'admin';

    // Customer Dashboard Access
    const canAccessCustomerDashboard = 
        !isAdminLoggedIn && 
        !loggedInProvider && 
        !!loggedInCustomer &&
        !loggedInUser;

    return {
        canAccessTherapistDashboard,
        canAccessPlaceDashboard,
        canAccessAdminDashboard,
        canAccessCustomerDashboard
    };
};

/**
 * Clears all authentication states to prevent cross-contamination
 */
export const clearAllAuthStates = (stateSetters: {
    setIsAdminLoggedIn?: (value: boolean) => void;
    setLoggedInProvider?: (provider: any) => void;
    setLoggedInCustomer?: (customer: any) => void;
    setLoggedInUser?: (user: any) => void;
    // Legacy optional setters retained for compatibility
    setIsHotelLoggedIn?: (value: boolean) => void;
    setIsVillaLoggedIn?: (value: boolean) => void;
    setLoggedInAgent?: (agent: any) => void;
    setImpersonatedAgent?: (agent: any) => void;
}) => {
    console.log('🧹 SECURITY: Clearing ALL authentication states...');
    
    if (stateSetters.setIsAdminLoggedIn) stateSetters.setIsAdminLoggedIn(false);
    if (stateSetters.setLoggedInProvider) stateSetters.setLoggedInProvider(null);
    if (stateSetters.setLoggedInCustomer) stateSetters.setLoggedInCustomer(null);
    if (stateSetters.setLoggedInUser) stateSetters.setLoggedInUser(null);
    if (stateSetters.setIsHotelLoggedIn) stateSetters.setIsHotelLoggedIn(false);
    if (stateSetters.setIsVillaLoggedIn) stateSetters.setIsVillaLoggedIn(false);
    if (stateSetters.setLoggedInAgent) stateSetters.setLoggedInAgent(null);
    if (stateSetters.setImpersonatedAgent) stateSetters.setImpersonatedAgent(null);
    
    // localStorage disabled: persistence keys removed. Auth state cleared in memory only.
    console.log('✅ SECURITY: All authentication states cleared (no localStorage)');
};

/**
 * Creates a secure dashboard renderer that validates access before rendering
 */
export const createSecureDashboardRenderer = (
    authState: AuthenticationState,
    onSecurityError: (message: string, redirectTo?: string) => void
) => {
    const access = validateDashboardAccess(authState);
    
    if (access.errorMessage) {
        onSecurityError(access.errorMessage, access.redirectTo);
        return null;
    }

    return {
        renderTherapistDashboard: (component: React.ReactNode) => 
            access.canAccessTherapistDashboard ? component : null,
            
        renderPlaceDashboard: (component: React.ReactNode) => 
            access.canAccessPlaceDashboard ? component : null,
            
        renderAdminDashboard: (component: React.ReactNode) => 
            access.canAccessAdminDashboard ? component : null,
            
        renderCustomerDashboard: (component: React.ReactNode) => 
            access.canAccessCustomerDashboard ? component : null,
    };
};