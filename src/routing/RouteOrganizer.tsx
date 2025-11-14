import type { Page } from '../../types/pageTypes';

/**
 * Route Organization Helper
 * Categorizes routes to help reduce AppRouter complexity
 */

export const getRouteCategory = (page: Page): 'auth' | 'dashboard' | 'content' | 'core' | 'booking' => {
    // Authentication routes
    const authRoutes = [
        'unifiedLogin', 'therapistLogin', 'adminLogin', 'hotelLogin', 
        'villaLogin', 'massagePlaceLogin', 'customerAuth', 'agentAuth', 
        'providerAuth', 'registrationChoice'
    ];
    
    // Dashboard routes  
    const dashboardRoutes = [
        'therapistDashboard', 'placeDashboard', 'hotelDashboard', 'villaDashboard',
        'adminDashboard', 'agentDashboard', 'customerDashboard', 'place-discount-system'
    ];
    
    // Content/Information routes
    const contentRoutes = [
        'blog', 'faq', 'about', 'how-it-works', 'terms', 'privacy', 'massage-bali',
        'balinese-massage', 'deep-tissue-massage', 'thai-massage', 'swedish-massage', 
        'reflexology-massage', 'shiatsu-massage', 'sports-massage', 'pregnancy-massage',
        'press-media', 'career-opportunities', 'therapist-info', 'hotel-info',
        'employer-info', 'payment-info', 'reviews-testimonials'
    ];
    
    // Booking related routes
    const bookingRoutes = [
        'booking', 'schedule-booking', 'booking-status', 'booking-history',
        'massage-jobs', 'therapist-jobs', 'job-posting', 'job-unlock-payment',
        'browse-jobs'
    ];
    
    if (authRoutes.includes(page)) return 'auth';
    if (dashboardRoutes.includes(page)) return 'dashboard';  
    if (contentRoutes.includes(page)) return 'content';
    if (bookingRoutes.includes(page)) return 'booking';
    
    return 'core'; // home, landing, profile, etc.
};

/**
 * Route Priority for Performance Optimization
 * Higher priority routes should be checked first
 */
export const getRoutePriority = (page: Page): number => {
    // Most frequently used routes get priority 1 (checked first)
    const highPriorityRoutes = ['home', 'therapistDashboard', 'placeDashboard'];
    if (highPriorityRoutes.includes(page)) return 1;
    
    // Auth routes get priority 2
    if (getRouteCategory(page) === 'auth') return 2;
    
    // Dashboard routes get priority 3
    if (getRouteCategory(page) === 'dashboard') return 3;
    
    // Everything else gets priority 4
    return 4;
};