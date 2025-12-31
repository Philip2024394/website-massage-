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
        'massageTypes': '/massage-types',
        'facialTypes': '/facial-types',
        'faq': '/faq',
        'todays-discounts': '/discounts',
        'therapistLogin': '/therapist-login',
        'therapistPortal': '/dashboard/therapist',
        'therapistDashboard': '/dashboard/therapist',
        'therapist': '/dashboard/therapist',
        'therapistStatus': '/dashboard/therapist/status',
        'therapistAvailability': '/dashboard/therapist/availability',
        'therapistProfile': '/dashboard/therapist/profile',
        'massagePlaceLogin': '/place-login',
        'placeDashboard': '/dashboard/massage-place',
        'massagePlacePortal': '/dashboard/massage-place',
        'massagePlaceProfile': '/dashboard/massage-place/profile',
        'massage-place-profile': '/profile/place',
        'facial-place-profile': '/profile/facial',
        'facialPlaceDashboard': '/dashboard/facial-place',
        'facialPlaceProfile': '/dashboard/facial-place/profile',
        'shared-therapist-profile': '/therapist-profile',
        'share-therapist': '/share/therapist',
        'share-place': '/share/place',
        'share-facial': '/share/facial',
        'customerProviders': '/providers',
        'customerReviews': '/reviews',
        'customerSupport': '/support',
        'registrationChoice': '/register',
        'joinIndastreet': '/join',
        'signup': '/signup',
        'signin': '/signin',
        'login': '/login',
        'createAccount': '/create-account',
        'onboarding-package': '/onboarding/package',
        'simpleSignup': '/signup',
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
        'sharedProfileStandards': '/shared-profile-standards',
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
            page === 'massage-place-profile' ||
            page === 'facial-place-profile' ||
            page === 'mobile-terms-and-conditions') {
            return;
        }
        
        const path = pageToPath[page] || '/';
        const currentPath = window.location.pathname;
        
        console.log('🔄 URL Routing - Page changed:', {
            page,
            mappedPath: pageToPath[page],
            finalPath: path,
            currentPath
        });
        
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
                
                // Handle new share URLs (with SEO keywords or simple format)
                // Match: /share/pijat-yogyakarta-wiwid/123 OR /share/therapist/123
                if (path.startsWith('/share/')) {
                    const segments = path.split('/').filter(Boolean);
                    if (segments.length >= 3) {
                        // SEO format: /share/{slug}/{id}
                        setPage('share-therapist');
                        return;
                    } else if (segments[1] === 'therapist') {
                        // Simple format: /share/therapist/{id}
                        setPage('share-therapist');
                        return;
                    } else if (segments[1] === 'place') {
                        setPage('share-place');
                        return;
                    } else if (segments[1] === 'facial') {
                        setPage('share-facial');
                        return;
                    }
                }
                
                // Handle legacy therapist profile URL
                if (path.startsWith('/therapist-profile/')) {
                    setPage('shared-therapist-profile');
                    return;
                }
                
                // Handle dashboard routes
                if (path === '/dashboard/therapist') {
                    setPage('therapist-dashboard');
                    return;
                }
                if (path === '/dashboard/massage-place') {
                    setPage('place-dashboard');
                    return;
                }
                if (path === '/dashboard/facial-place') {
                    setPage('facialPlaceDashboard');
                    return;
                }
                
                // Handle auth routes with query parameters
                if (path === '/signup') {
                    setPage('signup');
                    return;
                }
                if (path === '/signin' || path === '/sign-in') {
                    setPage('signin');
                    return;
                }
                if (path === '/create-account') {
                    setPage('createAccount');
                    return;
                }
                if (path === '/login') {
                    setPage('login');
                    return;
                }
                if (path === '/onboarding/package') {
                    setPage('onboarding-package');
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
        console.log('🔍 URL Routing Debug - Initial path detection:');
        console.log('   📍 window.location.pathname:', initialPath);
        console.log('   📍 window.location.href:', window.location.href);
        console.log('   📍 window.location.search:', window.location.search);
        
        // Handle new share URLs (with SEO keywords or simple format)
        if (initialPath.startsWith('/share/')) {
            const segments = initialPath.split('/').filter(Boolean);
            if (segments.length >= 3 || segments[1] === 'therapist') {
                // SEO format or simple therapist format
                setPage('share-therapist');
                return () => window.removeEventListener('popstate', handlePopState);
            } else if (segments[1] === 'place') {
                setPage('share-place');
                return () => window.removeEventListener('popstate', handlePopState);
            } else if (segments[1] === 'facial') {
                setPage('share-facial');
                return () => window.removeEventListener('popstate', handlePopState);
            }
        }
        
        // Handle legacy therapist profile URL
        if (initialPath.startsWith('/therapist-profile/')) {
            setPage('shared-therapist-profile');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        
        if (initialPath !== '/' && initialPath !== '/home') {
            // Handle auth routes with query parameters
            if (initialPath === '/signup') {
                console.log(`🎯 Initial URL: ${initialPath} → signup`);
                setPage('signup');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            if (initialPath === '/login') {
                console.log(`🎯 Initial URL: ${initialPath} → login`);
                setPage('login');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            if (initialPath === '/onboarding/package') {
                console.log(`🎯 Initial URL: ${initialPath} → onboarding-package`);
                setPage('onboarding-package');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            
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
