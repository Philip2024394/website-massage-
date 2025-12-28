/**
 * Dashboard Redirect Utility
 * Handles redirections to different dashboard apps based on user type
 */

export interface DashboardRedirectOptions {
  userType: 'therapist' | 'place' | 'admin' | 'agent' | 'hotel' | 'villa' | 'user';
  fallbackUrl?: string;
  openInNewTab?: boolean;
  navigate?: (path: string) => void;
}

/**
 * Redirect to appropriate dashboard based on user type
 * @param options - Options including navigate function from React Router
 */
export function redirectToDashboard(options: DashboardRedirectOptions): void {
  const { userType, fallbackUrl = '/', openInNewTab = false, navigate } = options;
  
  const dashboardUrls = {
    therapist: '/therapist',
    place: '/place-dashboard', 
    admin: '/admin-dashboard',
    agent: '/agent-dashboard',
    hotel: '/hotel-dashboard',
    villa: '/villa-dashboard',
    user: '/dashboard'
  };
  
  const redirectUrl = dashboardUrls[userType] || fallbackUrl;
  
  if (openInNewTab) {
    window.open(redirectUrl, '_blank');
  } else if (navigate) {
    // Use React Router navigation for internal routes
    navigate(redirectUrl);
  } else {
    // Fallback to window.location for backwards compatibility
    window.location.href = redirectUrl;
  }
}

/**
 * Get dashboard URL for user type without redirecting
 */
export function getDashboardUrl(userType: string): string {
  const dashboardUrls: Record<string, string> = {
    therapist: '/therapist',
    place: '/place-dashboard', 
    admin: '/admin-dashboard',
    agent: '/agent-dashboard',
    hotel: '/hotel-dashboard',
    villa: '/villa-dashboard',
    user: '/dashboard'
  };
  
  return dashboardUrls[userType] || '/';
}