/**
 * Dashboard Redirect Utility
 * Handles redirections to different dashboard apps based on user type
 */

export interface DashboardRedirectOptions {
  userType: 'therapist' | 'place' | 'admin' | 'agent' | 'hotel' | 'villa' | 'user';
  fallbackUrl?: string;
  openInNewTab?: boolean;
}

/**
 * Redirect to appropriate dashboard based on user type
 */
export function redirectToDashboard(options: DashboardRedirectOptions): void {
  const { userType, fallbackUrl = '/', openInNewTab = false } = options;
  
  const dashboardUrls = {
    therapist: '/therapist-dashboard',
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
  } else {
    window.location.href = redirectUrl;
  }
}

/**
 * Get dashboard URL for user type without redirecting
 */
export function getDashboardUrl(userType: string): string {
  const dashboardUrls: Record<string, string> = {
    therapist: '/therapist-dashboard',
    place: '/place-dashboard', 
    admin: '/admin-dashboard',
    agent: '/agent-dashboard',
    hotel: '/hotel-dashboard',
    villa: '/villa-dashboard',
    user: '/dashboard'
  };
  
  return dashboardUrls[userType] || '/';
}