/**
 * Dashboard Authentication Guards
 * Ensures solid separation between different user dashboards
 * Prevents cross-contamination of authentication states
 */

export interface AuthenticationState {
    isHotelLoggedIn: boolean;
    isVillaLoggedIn: boolean;
    isAdminLoggedIn: boolean;
    loggedInProvider: { id: string | number; type: 'therapist' | 'place' } | null;
    loggedInAgent: any | null;
    loggedInCustomer: any | null;
    loggedInUser: { id: string; type: 'admin' | 'hotel' | 'villa' | 'agent' } | null;
}

export interface DashboardAccess {
    canAccessHotelDashboard: boolean;
    canAccessVillaDashboard: boolean;
    canAccessTherapistDashboard: boolean;
    canAccessPlaceDashboard: boolean;
    canAccessAdminDashboard: boolean;
    canAccessCustomerDashboard: boolean;
    canAccessAgentDashboard: boolean;
    redirectTo?: string;
    errorMessage?: string;
}

/**
 * Validates authentication state and determines dashboard access permissions
 */
export const validateDashboardAccess = (authState: AuthenticationState): DashboardAccess => {
    const {
        isHotelLoggedIn,
        isVillaLoggedIn,
        isAdminLoggedIn,
        loggedInProvider,
        loggedInAgent,
        loggedInCustomer,
        loggedInUser
    } = authState;

    // Count how many different authentication states are active
    const activeAuthCount = [
        isHotelLoggedIn,
        isVillaLoggedIn,
        isAdminLoggedIn,
        !!loggedInProvider,
        !!loggedInAgent,
        !!loggedInCustomer
    ].filter(Boolean).length;

    // 🚨 CRITICAL: Multiple authentication states detected
    if (activeAuthCount > 1) {
        console.error('🚨 SECURITY ALERT: Multiple authentication states detected!', {
            isHotelLoggedIn,
            isVillaLoggedIn,
            isAdminLoggedIn,
            hasProvider: !!loggedInProvider,
            hasAgent: !!loggedInAgent,
            hasCustomer: !!loggedInCustomer,
            loggedInUser
        });

        return {
            canAccessHotelDashboard: false,
            canAccessVillaDashboard: false,
            canAccessTherapistDashboard: false,
            canAccessPlaceDashboard: false,
            canAccessAdminDashboard: false,
            canAccessCustomerDashboard: false,
            canAccessAgentDashboard: false,
            redirectTo: 'home',
            errorMessage: 'Multiple login sessions detected. Please log out and log in again with the correct account type.'
        };
    }

    // Hotel Dashboard Access
    const canAccessHotelDashboard = isHotelLoggedIn && 
        !isVillaLoggedIn && 
        !isAdminLoggedIn && 
        !loggedInProvider && 
        !loggedInAgent && 
        !loggedInCustomer &&
        loggedInUser?.type === 'hotel';

    // Villa Dashboard Access  
    const canAccessVillaDashboard = isVillaLoggedIn && 
        !isHotelLoggedIn && 
        !isAdminLoggedIn && 
        !loggedInProvider && 
        !loggedInAgent && 
        !loggedInCustomer &&
        loggedInUser?.type === 'villa';

    // Therapist Dashboard Access
    const canAccessTherapistDashboard = !isHotelLoggedIn && 
        !isVillaLoggedIn && 
        !isAdminLoggedIn && 
        loggedInProvider?.type === 'therapist' && 
        !loggedInAgent && 
        !loggedInCustomer &&
        !loggedInUser;

    // Place Dashboard Access
    const canAccessPlaceDashboard = !isHotelLoggedIn && 
        !isVillaLoggedIn && 
        !isAdminLoggedIn && 
        loggedInProvider?.type === 'place' && 
        !loggedInAgent && 
        !loggedInCustomer &&
        !loggedInUser;

    // Admin Dashboard Access
    const canAccessAdminDashboard = isAdminLoggedIn && 
        !isHotelLoggedIn && 
        !isVillaLoggedIn && 
        !loggedInProvider && 
        !loggedInAgent && 
        !loggedInCustomer &&
        loggedInUser?.type === 'admin';

    // Customer Dashboard Access
    const canAccessCustomerDashboard = !isHotelLoggedIn && 
        !isVillaLoggedIn && 
        !isAdminLoggedIn && 
        !loggedInProvider && 
        !loggedInAgent && 
        !!loggedInCustomer &&
        !loggedInUser;

    // Agent Dashboard Access
    const canAccessAgentDashboard = !isHotelLoggedIn && 
        !isVillaLoggedIn && 
        !isAdminLoggedIn && 
        !loggedInProvider && 
        !!loggedInAgent && 
        !loggedInCustomer &&
        loggedInUser?.type === 'agent';

    return {
        canAccessHotelDashboard,
        canAccessVillaDashboard,
        canAccessTherapistDashboard,
        canAccessPlaceDashboard,
        canAccessAdminDashboard,
        canAccessCustomerDashboard,
        canAccessAgentDashboard
    };
};

/**
 * Clears all authentication states to prevent cross-contamination
 */
export const clearAllAuthStates = (stateSetters: {
    setIsHotelLoggedIn?: (value: boolean) => void;
    setIsVillaLoggedIn?: (value: boolean) => void;
    setIsAdminLoggedIn?: (value: boolean) => void;
    setLoggedInProvider?: (provider: any) => void;
    setLoggedInAgent?: (agent: any) => void;
    setLoggedInCustomer?: (customer: any) => void;
    setLoggedInUser?: (user: any) => void;
    setImpersonatedAgent?: (agent: any) => void;
}) => {
    console.log('🧹 SECURITY: Clearing ALL authentication states...');
    
    if (stateSetters.setIsHotelLoggedIn) stateSetters.setIsHotelLoggedIn(false);
    if (stateSetters.setIsVillaLoggedIn) stateSetters.setIsVillaLoggedIn(false);
    if (stateSetters.setIsAdminLoggedIn) stateSetters.setIsAdminLoggedIn(false);
    if (stateSetters.setLoggedInProvider) stateSetters.setLoggedInProvider(null);
    if (stateSetters.setLoggedInAgent) stateSetters.setLoggedInAgent(null);
    if (stateSetters.setLoggedInCustomer) stateSetters.setLoggedInCustomer(null);
    if (stateSetters.setLoggedInUser) stateSetters.setLoggedInUser(null);
    if (stateSetters.setImpersonatedAgent) stateSetters.setImpersonatedAgent(null);
    
    // Clear localStorage
    localStorage.removeItem('app_hotel_logged_in');
    localStorage.removeItem('app_villa_logged_in');
    localStorage.removeItem('app_logged_in_provider');
    localStorage.removeItem('app_logged_in_agent');
    localStorage.removeItem('app_impersonated_agent');
    
    console.log('✅ SECURITY: All authentication states cleared');
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
        renderHotelDashboard: (component: React.ReactNode) => 
            access.canAccessHotelDashboard ? component : null,
            
        renderVillaDashboard: (component: React.ReactNode) => 
            access.canAccessVillaDashboard ? component : null,
            
        renderTherapistDashboard: (component: React.ReactNode) => 
            access.canAccessTherapistDashboard ? component : null,
            
        renderPlaceDashboard: (component: React.ReactNode) => 
            access.canAccessPlaceDashboard ? component : null,
            
        renderAdminDashboard: (component: React.ReactNode) => 
            access.canAccessAdminDashboard ? component : null,
            
        renderCustomerDashboard: (component: React.ReactNode) => 
            access.canAccessCustomerDashboard ? component : null,
            
        renderAgentDashboard: (component: React.ReactNode) => 
            access.canAccessAgentDashboard ? component : null,
    };
};