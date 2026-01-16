/**
 * URL Mapper - Maps page names to URLs and vice versa
 * Provides clean, SEO-friendly URLs for all pages
 */

import type { Page } from '../types/pageTypes';

// Map of page names to URL paths
export const pageToUrl: Partial<Record<Page, string>> = {
    // Public routes
    'landing': '/',
    'home': '/home',
    'about': '/about',
    'contact': '/contact',
    'company': '/company',
    'how-it-works': '/how-it-works',
    'faq': '/faq',
    'massage-types': '/massage-types',
    'facial-types': '/facial-types',
    'providers': '/providers',
    'facialProviders': '/facial-providers',
    'discounts': '/discounts',
    
    // Auth routes
    'therapist-login': '/therapist-login',
    'therapistLogin': '/therapist-login',
    'place-login': '/place-login',
    'massagePlaceLogin': '/place-login',
    'facial-portal': '/facial-portal',
    'simple-signup': '/signup',
    'simpleSignup': '/signup',
    'membership-select': '/join',
    
    // Dashboard routes - Therapist
    'therapist': '/dashboard/therapist',
    'therapistDashboard': '/dashboard/therapist',
    'therapistPortal': '/dashboard/therapist',
    'therapistStatus': '/dashboard/therapist/status',
    'therapistAvailability': '/dashboard/therapist/availability',
    'therapist-bookings': '/dashboard/therapist/bookings',
    'therapistProfile': '/dashboard/therapist/profile',
    'therapistMenu': '/dashboard/therapist/menu',
    
    // Dashboard routes - Massage Place
    'massagePlace': '/dashboard/massage-place',
    'placeDashboard': '/dashboard/massage-place',
    'massagePlacePortal': '/dashboard/massage-place',
    'massagePlaceProfile': '/dashboard/massage-place/profile',
    'massagePlaceTherapists': '/dashboard/massage-place/therapists',
    'massagePlaceBookings': '/dashboard/massage-place/bookings',
    
    // Dashboard routes - Facial Place
    'facialPlace': '/dashboard/facial-place',
    'facialPlaceDashboard': '/dashboard/facial-place',
    'facialPlaceProfile': '/dashboard/facial-place/profile',
    'facialPlaceServices': '/dashboard/facial-place/services',
    'facialPlaceBookings': '/dashboard/facial-place/bookings',
    
    // Profile routes
    'therapist-profile': '/profile/therapist',
    'massage-place-profile': '/profile/place',
    'facial-place-profile': '/profile/facial',
    'place-detail': '/place',
    'share-therapist': '/share/therapist',
    'share-place': '/share/place',
    'share-facial': '/share/facial',
    'shared-therapist-profile': '/shared/therapist',
    
    // Legal routes
    'privacy-policy': '/privacy-policy',
    'cookies-policy': '/cookies-policy',
    'service-terms': '/service-terms',
    'place-terms': '/place-terms',
    'package-terms': '/package-terms',
    'membership-terms': '/membership-terms',
    'mobile-terms-and-conditions': '/mobile-terms',
    
    // Blog routes
    'blog': '/blog',
    'massage-bali': '/blog/massage-bali',
    'balinese-massage': '/blog/balinese-massage',
    'deep-tissue-massage': '/blog/deep-tissue-massage',
    'press': '/press',
    
    // Blog posts
    'blog-bali-spa-trends-2025': '/blog/bali-spa-trends-2025',
    'blog-top-10-massage-techniques': '/blog/top-10-massage-techniques',
    'blog-massage-career-indonesia': '/blog/massage-career-indonesia',
    'blog-benefits-regular-massage': '/blog/benefits-regular-massage',
    'blog-hiring-massage-therapists': '/blog/hiring-massage-therapists',
    'blog-traditional-balinese-massage': '/blog/traditional-balinese-massage',
    'blog-spa-tourism-indonesia': '/blog/spa-tourism-indonesia',
    'blog-aromatherapy-massage-oils': '/blog/aromatherapy-massage-oils',
    'blog-pricing-guide-massage': '/blog/pricing-guide-massage',
    'blog-deep-tissue-vs-swedish': '/blog/deep-tissue-vs-swedish',
    'blog-online-presence-therapist': '/blog/online-presence-therapist',
    'blog-wellness-tourism-ubud': '/blog/wellness-tourism-ubud',
    
    // Specialized pages
    'confirm-therapists': '/confirm-therapists',
    'employer-job-posting': '/employer-job-posting',
    'indastreet-partners': '/indastreet-partners',
    'website-management': '/website-management',
    'guest-profile': '/guest-profile',
    'qr-code': '/qr-code',
    'notifications': '/notifications',
    'booking': '/booking',
    'membership': '/membership',
    'accept-booking': '/accept-booking',
    'decline-booking': '/decline-booking',
    'lead-accept': '/lead-accept',
    'lead-decline': '/lead-decline',
    'job-posting-payment': '/job-posting-payment',
    'browse-jobs': '/browse-jobs',
    'browseJobs': '/browse-jobs',
    'massage-jobs': '/massage-jobs',
    'massageJobs': '/massage-jobs',
    'partnership-application': '/partnership-application',
    'therapist-job-registration': '/therapist-job-registration',
    'reviews': '/reviews',
    'job-unlock-payment': '/job-unlock-payment',
    'customer-reviews': '/customer-reviews',
    'customer-support': '/customer-support',
    'place-discount-badge': '/place-discount-badge',
    'verifiedProBadge': '/verified-pro-badge',
    'verified-pro-badge': '/verified-pro-badge',
    'mobileTherapistStandards': '/mobile-therapist-standards',
    'mobile-therapist-standards': '/mobile-therapist-standards',
    'guest-alerts': '/guest-alerts',
    'partner-settings': '/partner-settings',
    'admin-login': '/admin-login',
    'career-opportunities': '/career-opportunities',
    'therapist-info': '/therapist-info',
    'employer-info': '/employer-info',
    'payment-info': '/payment-info',
    
    // Floating Pages
    'women-reviews': '/women-reviews',
    'advanced-search': '/advanced-search',
    'help-faq': '/help-faq',
    'top-therapists': '/top-therapists',
    'special-offers': '/special-offers',
    'video-center': '/video-center',
    
    // Floating Button URLs
    'chat-support': '/chat/support',
    'booking-quick': '/booking/quick', 
    'emergency-contact': '/emergency/contact',
    'help': '/help',
    'feedback': '/feedback',
    
    // Other dashboard routes (non-user dashboards)
    'agentDashboard': '/dashboard/agent',
    'customerDashboard': '/dashboard/customer',
    'adminDashboard': '/admin',
    'villaDashboard': '/dashboard/villa',
    'hotelDashboard': '/dashboard/hotel',
};

// Reverse map: URL paths to page names
export const urlToPage: Record<string, Page> = Object.entries(pageToUrl).reduce(
    (acc, [page, url]) => {
        acc[url] = page as Page;
        return acc;
    },
    {} as Record<string, Page>
);

/**
 * Get URL for a page
 */
export function getUrlForPage(page: Page, params?: Record<string, string>): string {
    let url = pageToUrl[page] || '/home';
    
    // Replace URL parameters if provided
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value);
        });
    }
    
    return url;
}

/**
 * Get page from URL path
 */
export function getPageFromUrl(path: string): Page | null {
    // Remove leading slash and query params
    const cleanPath = path.replace(/\?.*$/, '');
    
    // Exact match
    if (urlToPage[cleanPath]) {
        return urlToPage[cleanPath];
    }
    
    // Pattern matches for dynamic routes
    // CRITICAL: Handle both /therapist-profile/:id AND /share/therapist/:id
    if (cleanPath.startsWith('/therapist-profile/')) {
        return 'shared-therapist-profile';
    }
    if (cleanPath.startsWith('/profile/therapist/')) {
        return 'therapist-profile';
    }
    if (cleanPath.startsWith('/profile/place/')) {
        return 'massage-place-profile';
    }
    if (cleanPath.startsWith('/profile/facial/')) {
        return 'facial-place-profile';
    }
    if (cleanPath.startsWith('/accept-booking/')) {
        return 'accept-booking';
    }
    if (cleanPath.startsWith('/decline-booking/')) {
        return 'decline-booking';
    }
    if (cleanPath.startsWith('/share/therapist/')) {
        return 'shared-therapist-profile';
    }
    if (cleanPath.startsWith('/share/place/')) {
        return 'share-place';
    }
    if (cleanPath.startsWith('/share/facial/')) {
        return 'share-facial';
    }
    if (cleanPath === '/join' || cleanPath.startsWith('/join/')) {
        return 'membership-select';
    }
    if (cleanPath === '/signup' || cleanPath.startsWith('/signup')) {
        return 'simpleSignup';
    }
    
    // Default to home if no match
    return null;
}

/**
 * Update browser URL without triggering navigation
 */
export function updateBrowserUrl(page: Page, params?: Record<string, string>, replace: boolean = false): void {
    const url = getUrlForPage(page, params);
    
    if (replace) {
        window.history.replaceState({ page, params }, '', url);
    } else {
        window.history.pushState({ page, params }, '', url);
    }
}

/**
 * Navigate to a page and update URL
 */
export function navigateToPage(
    page: Page,
    setPageFn: (page: Page) => void,
    params?: Record<string, string>
): void {
    setPageFn(page);
    updateBrowserUrl(page, params);
}
