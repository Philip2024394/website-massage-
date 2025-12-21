import { useEffect } from 'react';
import type { Page } from '../types/pageTypes';

/**
 * Hook to sync page state with browser URL
 * Updates URL without page reload and handles browser back/forward buttons
 */
export const useURLRouting = (page: Page, setPage: (page: Page) => void) => {
    // Map key page states to URL paths (partial mapping for main routes)
    const pageToPath: Partial<Record<Page, string>> = {
        'landing': '/',
        'home': '/home',
        'facialProviders': '/facials',
        'facialPlaceProfile': '/facial-place',
        'facialPlaceDashboard': '/facial-dashboard',
        'therapistProfile': '/therapist',
        'massagePlaceProfile': '/massage-place',
        'massageTypes': '/massage-types',
        'facialTypes': '/facial-types',
        'faq': '/faq',
        'todays-discounts': '/discounts',
        'therapistLogin': '/therapist-login',
        'therapistPortal': '/therapist-portal',
        'therapistDashboard': '/therapist-dashboard',
        'therapistStatus': '/therapist-status',
        'massagePlaceLogin': '/place-login',
        'placeDashboard': '/place-dashboard',
        'massagePlacePortal': '/place-portal',
        'shared-therapist-profile': '/therapist-profile',
        'share-therapist': '/share/therapist',
        'share-place': '/share/place',
        'share-facial': '/share/facial',
        'customerProviders': '/providers',
        'customerReviews': '/reviews',
        'customerSupport': '/support',
        'registrationChoice': '/register',
        'joinIndastreet': '/join',
        'booking': '/booking',
        'accept-booking': '/accept-booking',
        'notifications': '/notifications',
        'agentPortal': '/agent-portal',
        'agentDashboard': '/agent-dashboard',
        'customerAuth': '/customer-auth',
        'customerPortal': '/customer-portal',
        'profile': '/profile',
        'serviceTerms': '/terms',
        'placeTerms': '/place-terms',
        'privacyPolicy': '/privacy',
        'membership': '/membership',
        'mobile-terms-and-conditions': '/mobile-terms-and-conditions',
        'adminDashboard': '/admin',
        'hotelDashboard': '/hotel-dashboard',
        'villaDashboard': '/villa-dashboard',
        'browseJobs': '/browse-jobs',
        'massageJobs': '/massage-jobs',
        'therapistJobs': '/therapist-jobs',
        'website-management': '/website',
        'placeDiscountBadge': '/discount-badge',
        'verifiedProBadge': '/verified-badge',
        'mobileTherapistStandards': '/mobile-therapist-standards',
        'qr-code': '/qr'
    };

    // Map URL paths back to page states
    const pathToPage: Record<string, Page> = Object.fromEntries(
        Object.entries(pageToPath).map(([page, path]) => [path, page as Page])
    ) as Record<string, Page>;

    // Update URL when page changes
    useEffect(() => {
        // Don't modify URL for shared therapist profiles - preserve the full path with ID and slug
        if (page === 'shared-therapist-profile' || 
            page === 'share-therapist' || 
            page === 'share-place' || 
            page === 'share-facial' ||
            page === 'mobile-terms-and-conditions') {
            return;
        }
        
        const path = pageToPath[page] || '/';
        const currentPath = window.location.pathname;
        
        if (currentPath !== path) {
            console.log(`📍 URL Routing: ${page} → ${path}`);
            window.history.pushState({ page }, '', path);
        }
    }, [page]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state?.page) {
                console.log(`◀️ Browser Back: → ${event.state.page}`);
                setPage(event.state.page);
            } else {
                // Handle direct URL navigation
                const path = window.location.pathname;
                
                // Handle new share URLs
                if (path.startsWith('/share/therapist/')) {
                    setPage('share-therapist');
                    return;
                }
                if (path.startsWith('/share/place/')) {
                    setPage('share-place');
                    return;
                }
                if (path.startsWith('/share/facial/')) {
                    setPage('share-facial');
                    return;
                }
                
                // Handle legacy therapist profile URL
                if (path.startsWith('/therapist-profile/')) {
                    setPage('shared-therapist-profile');
                    return;
                }
                
                const targetPage = pathToPage[path] || 'landing';
                console.log(`🔗 Direct URL: ${path} → ${targetPage}`);
                setPage(targetPage);
            }
        };

        window.addEventListener('popstate', handlePopState);
        
        // Set initial page based on URL on mount
        const initialPath = window.location.pathname;
        
        // Handle new share URLs
        if (initialPath.startsWith('/share/therapist/')) {
            setPage('share-therapist');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        if (initialPath.startsWith('/share/place/')) {
            setPage('share-place');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        if (initialPath.startsWith('/share/facial/')) {
            setPage('share-facial');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        
        // Handle legacy therapist profile URL
        if (initialPath.startsWith('/therapist-profile/')) {
            setPage('shared-therapist-profile');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        
        if (initialPath !== '/' && initialPath !== '/home') {
            const targetPage = pathToPage[initialPath];
            if (targetPage && targetPage !== page) {
                console.log(`🎯 Initial URL: ${initialPath} → ${targetPage}`);
                setPage(targetPage);
            }
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [setPage]);
};
