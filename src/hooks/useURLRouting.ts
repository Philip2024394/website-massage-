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
        // Drawer public pages (must not fall back to "/")
        'indastreet-partners': '/indastreet-partners',
        'partnership-application': '/partnership-application',
        'how-it-works': '/how-it-works',
        'about': '/about',
        'about-us': '/about',
        'company': '/company',
        'contact': '/contact',
        'hotels-and-villas': '/hotels-and-villas',
        'blog': '/blog',
        'massage-bali': '/massage-bali',
        'balinese-massage': '/balinese-massage',
        'deep-tissue-massage': '/deep-tissue-massage',
        'massage-jobs': '/massage-jobs',
        'employer-job-posting': '/employer-job-posting',
        'therapist-job-registration': '/therapist-job-registration',
        'verified-pro-badge': '/verified-badge',
        'admin': '/admin',
        'admin-dashboard': '/admin',
        'todays-discounts': '/discounts',
        'therapistLogin': '/therapist-login',
        'therapistPortal': '/dashboard/therapist',
        'therapistDashboard': '/dashboard/therapist',
        'therapist': '/dashboard/therapist',
        'therapistStatus': '/dashboard/therapist/status',
        'therapistAvailability': '/dashboard/therapist/availability',
        'therapistProfile': '/dashboard/therapist/profile',
        
        // 🚫 ENTERPRISE ROUTING — All 14 Therapist Dashboard Pages
        'therapist-dashboard': '/dashboard/therapist',
        'therapist-status': '/dashboard/therapist/status',
        'therapist-schedule': '/dashboard/therapist/schedule',
        'therapist-bookings': '/dashboard/therapist/bookings',
        'therapist-earnings': '/dashboard/therapist/earnings',
        'therapist-payment': '/dashboard/therapist/payment',
        'therapist-payment-status': '/dashboard/therapist/payment-status',
        'therapist-commission-payment': '/dashboard/therapist/commission',
        'therapist-premium-upgrade': '/dashboard/therapist/premium',
        'therapist-menu': '/dashboard/therapist/menu',
        'therapist-chat': '/dashboard/therapist/chat',
        'therapist-notifications': '/dashboard/therapist/notifications',
        'therapist-calendar': '/dashboard/therapist/calendar',
        'therapist-legal': '/dashboard/therapist/legal',
        
        // Short aliases for therapist dashboard pages (used by side drawer – must not fall back to '/' (landing))
        'status': '/dashboard/therapist/status',
        'dashboard': '/dashboard/therapist',
        'payment': '/dashboard/therapist/payment',
        'payment-status': '/dashboard/therapist/payment-status',
        'bookings': '/dashboard/therapist/bookings',
        'earnings': '/dashboard/therapist/earnings',
        'calendar': '/dashboard/therapist/calendar',
        'schedule': '/dashboard/therapist/schedule',
        'custom-menu': '/dashboard/therapist/menu',
        'legal': '/dashboard/therapist/legal',
        'analytics': '/dashboard/therapist/analytics',
        'commission-payment': '/dashboard/therapist/commission',
        'therapist-analytics': '/dashboard/therapist/analytics',
        'therapist-how-it-works': '/dashboard/therapist/how-it-works',
        'therapist-hotel-villa-safe-pass': '/dashboard/therapist/safe-pass',
        'send-discount': '/dashboard/therapist/send-discount',
        'customers': '/dashboard/therapist/customers',
        
        'massagePlaceLogin': '/place-login',
        'employer-login': '/employer-login',
        'placeDashboard': '/dashboard/massage-place',
        'massagePlacePortal': '/dashboard/massage-place',
        'massagePlaceProfile': '/dashboard/massage-place/profile',
        'massage-place-profile': '/profile/place',
        'facial-place-profile': '/profile/facial',
        'facialPlaceDashboard': '/dashboard/facial-place',
        'facialPlaceProfile': '/dashboard/facial-place/profile',
        'shared-therapist-profile': '/therapist-profile',
        'therapist-profile': '/profile/therapist', // CRITICAL: Customer-facing therapist profile
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
        'signIn': '/signin',  // drawer "Sign In" uses camelCase; must map so URL stays /signin not /
        'login': '/login',
        'createAccount': '/create-account',
        'onboarding-package': '/onboarding/package',
        'simpleSignup': '/signup',
        'booking': '/booking',
        'booking-flow': '/booking',
        'booking-therapist': '/booking/therapist',
        'booking-place': '/booking/place',
        'accept-booking': '/accept-booking',
        'chat': '/chat',
        'chat-room': '/chat/room',
        'chatList': '/chat/inbox',
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
        'qr-code': '/qr',
        
        // Floating Button URLs
        'chat-support': '/chat/support',
        'booking-quick': '/booking/quick',
        'emergency-contact': '/emergency/contact',
        'help': '/help',
        'feedback': '/feedback'
    };

    // Map URL paths back to page states
    const pathToPage: Record<string, Page> = Object.fromEntries(
        Object.entries(pageToPath).map(([page, path]) => [path, page as Page])
    ) as Record<string, Page>;

    // Update URL when page changes
    useEffect(() => {
        // Don't modify URL for shared therapist profiles - preserve the full path with ID and slug
        // Job Positions: preserve so List Availability / Post a Job don't redirect to landing
        if (page === 'shared-therapist-profile' || 
            page === 'therapist-profile' || // CRITICAL: Preserve customer-facing profile URLs
            page === 'share-therapist' || 
            page === 'share-place' ||
            page === 'share-facial' ||
            page === 'massage-place-profile' ||
            page === 'facial-place-profile' ||
            page === 'mobile-terms-and-conditions' ||
            page === 'employer-job-posting' ||
            page === 'therapist-job-registration') {
            console.log('🔒 URL Routing: Preserving URL for:', page, '| Current:', window.location.pathname);
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
                
                // Handle customer-facing profile URLs
                if (path.startsWith('/profile/therapist/')) {
                    console.log('🎯 URL ROUTING: Customer therapist profile URL detected → therapist-profile');
                    setPage('therapist-profile');
                    return;
                }
                
                if (path.startsWith('/profile/place/')) {
                    console.log('🎯 URL ROUTING: Customer place profile URL detected → massage-place-profile');
                    setPage('massage-place-profile');
                    return;
                }
                
                // Handle legacy therapist profile URL
                if (path.startsWith('/therapist-profile/')) {
                    setPage('shared-therapist-profile');
                    return;
                }
                
                // Handle dashboard routes
                // 🚫 ENTERPRISE ROUTING — Therapist Dashboard Sub-Routes
                if (path === '/dashboard/therapist/status') {
                    console.log('🟢 URL ROUTING: /dashboard/therapist/status matched → setting page to therapist-status');
                    setPage('therapist-status');
                    return;
                }
                if (path === '/dashboard/therapist/schedule') {
                    setPage('therapist-schedule');
                    return;
                }
                if (path === '/dashboard/therapist/bookings') {
                    setPage('therapist-bookings');
                    return;
                }
                if (path === '/dashboard/therapist/earnings') {
                    setPage('therapist-earnings');
                    return;
                }
                if (path === '/dashboard/therapist/payment') {
                    setPage('therapist-payment');
                    return;
                }
                if (path === '/dashboard/therapist/payment-status') {
                    setPage('therapist-payment-status');
                    return;
                }
                if (path === '/dashboard/therapist/commission') {
                    setPage('therapist-commission-payment');
                    return;
                }
                if (path === '/dashboard/therapist/premium') {
                    setPage('therapist-premium-upgrade');
                    return;
                }
                if (path === '/dashboard/therapist/menu') {
                    setPage('therapist-menu');
                    return;
                }
                if (path === '/dashboard/therapist/chat') {
                    setPage('therapist-chat');
                    return;
                }
                if (path === '/dashboard/therapist/notifications') {
                    setPage('therapist-notifications');
                    return;
                }
                if (path === '/dashboard/therapist/calendar') {
                    setPage('therapist-calendar');
                    return;
                }
                if (path === '/dashboard/therapist/legal') {
                    setPage('therapist-legal');
                    return;
                }
                if (path === '/dashboard/therapist/analytics') {
                    setPage('therapist-analytics');
                    return;
                }
                if (path === '/dashboard/therapist/customers') {
                    setPage('customers');
                    return;
                }
                if (path === '/dashboard/therapist/send-discount') {
                    setPage('send-discount');
                    return;
                }
                if (path === '/dashboard/therapist/how-it-works') {
                    setPage('therapist-how-it-works');
                    return;
                }
                if (path === '/dashboard/therapist/safe-pass') {
                    setPage('therapist-hotel-villa-safe-pass');
                    return;
                }
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
                
                // Handle chat routes with dynamic IDs
                if (path.startsWith('/chat/')) {
                    const chatSegments = path.split('/').filter(Boolean);
                    if (chatSegments[1] === 'room' || chatSegments[1]) {
                        // /chat/room/:id or /chat/:id
                        setPage('chat-room');
                        return;
                    } else if (path === '/chat/inbox') {
                        setPage('chatList');
                        return;
                    } else if (path === '/chat') {
                        setPage('chat');
                        return;
                    }
                }
                
                // Handle booking routes with dynamic IDs
                if (path.startsWith('/booking/')) {
                    const bookingSegments = path.split('/').filter(Boolean);
                    if (bookingSegments[1] === 'therapist') {
                        // /booking/therapist/:id
                        setPage('booking-therapist');
                        return;
                    } else if (bookingSegments[1] === 'place') {
                        // /booking/place/:id
                        setPage('booking-place');
                        return;
                    } else {
                        // Generic /booking/:id
                        setPage('booking-flow');
                        return;
                    }
                }
                
                const targetPage = pathToPage[path] || 'landing';
                console.log(`🔗 Direct URL: ${path} → ${targetPage}`);
                setPage(targetPage);
            }
        };

        window.addEventListener('popstate', handlePopState);
        
        // Set initial page based on URL on mount
        const initialPath = window.location.pathname;
        const initialHash = window.location.hash;
        console.log('🔍 URL Routing Debug - Initial path detection:');
        console.log('   📍 window.location.pathname:', initialPath);
        console.log('   📍 window.location.hash:', initialHash);
        console.log('   📍 window.location.href:', window.location.href);
        console.log('   📍 window.location.search:', window.location.search);
        
        // PRIORITY: Handle hash routing first (for therapist dashboard + Job Positions)
        if (initialHash) {
            const hashPath = initialHash.substring(1).replace(/^\/+/, ''); // Remove '#' and leading slashes
            const hashPathWithSlash = initialHash.substring(1); // Keep for path-style matches
            console.log('🔗 Hash detected:', hashPath, 'raw:', initialHash);
            
            // Job Positions – List Availability / Post a Job (fixes redirect to landing)
            if (hashPath === 'employer-job-posting') {
                console.log('✅ Hash route matched: employer-job-posting');
                setPage('employer-job-posting');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            if (hashPath === 'therapist-job-registration') {
                console.log('✅ Hash route matched: therapist-job-registration');
                setPage('therapist-job-registration');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            if (hashPath === 'massage-jobs') {
                console.log('✅ Hash route matched: massage-jobs');
                setPage('massage-jobs');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            
            // View Profile from Job Listings – #/therapist-profile/:id must not fall through to root → landing
            if (hashPathWithSlash.startsWith('/therapist-profile/') || hashPath.startsWith('therapist-profile/')) {
                console.log('✅ Hash route matched: shared-therapist-profile (View Profile)');
                setPage('shared-therapist-profile');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            if (hashPathWithSlash.startsWith('/share/therapist/') || hashPath.startsWith('share/therapist/')) {
                console.log('✅ Hash route matched: shared-therapist-profile (share therapist)');
                setPage('shared-therapist-profile');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            
            // Map hash routes to pages (path-style with leading slash)
            if (hashPathWithSlash === '/therapist-status' || hashPathWithSlash === '/status') {
                console.log('✅ Hash route matched: therapist-status');
                setPage('therapist-status');
                return () => window.removeEventListener('popstate', handlePopState);
            }
            if (hashPathWithSlash === '/therapist' || hashPathWithSlash === '/therapist-dashboard') {
                console.log('✅ Hash route matched: therapist-dashboard');
                setPage('therapist-dashboard');
                return () => window.removeEventListener('popstate', handlePopState);
            }
        }
        
        // CRITICAL FIX: Handle customer-facing profile URLs FIRST before other checks
        if (initialPath.startsWith('/profile/therapist/')) {
            console.log(`🎯 Initial URL: ${initialPath} → therapist-profile`);
            setPage('therapist-profile');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        
        if (initialPath.startsWith('/profile/place/')) {
            console.log(`🎯 Initial URL: ${initialPath} → massage-place-profile`);
            setPage('massage-place-profile');
            return () => window.removeEventListener('popstate', handlePopState);
        }
        
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
        
        // CRITICAL FIX: No longer skip root and home paths - they need page state sync
        if (initialPath !== '/') {
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
            
            // Handle chat routes with dynamic IDs
            if (initialPath.startsWith('/chat/')) {
                const chatSegments = initialPath.split('/').filter(Boolean);
                if (chatSegments[1] === 'room' || chatSegments[1]) {
                    console.log(`🎯 Initial URL: ${initialPath} → chat-room`);
                    setPage('chat-room');
                    return () => window.removeEventListener('popstate', handlePopState);
                } else if (initialPath === '/chat/inbox') {
                    console.log(`🎯 Initial URL: ${initialPath} → chatList`);
                    setPage('chatList');
                    return () => window.removeEventListener('popstate', handlePopState);
                }
            }
            
            // Handle booking routes with dynamic IDs
            if (initialPath.startsWith('/booking/')) {
                const bookingSegments = initialPath.split('/').filter(Boolean);
                if (bookingSegments[1] === 'therapist') {
                    console.log(`🎯 Initial URL: ${initialPath} → booking-therapist`);
                    setPage('booking-therapist');
                    return () => window.removeEventListener('popstate', handlePopState);
                } else if (bookingSegments[1] === 'place') {
                    console.log(`🎯 Initial URL: ${initialPath} → booking-place`);
                    setPage('booking-place');
                    return () => window.removeEventListener('popstate', handlePopState);
                } else {
                    console.log(`🎯 Initial URL: ${initialPath} → booking-flow`);
                    setPage('booking-flow');
                    return () => window.removeEventListener('popstate', handlePopState);
                }
            }
            
            const targetPage = pathToPage[initialPath];
            if (targetPage && targetPage !== page) {
                console.log(`🎯 Initial URL: ${initialPath} → ${targetPage}`);
                setPage(targetPage);
            }
        } else {
            // Root path (pathname === '/') – only treat as landing if hash is empty or landing/home
            // Do NOT force landing when hash is #/therapist-profile/... (View Profile from job listings)
            const hashForRoot = (window.location.hash || '').replace('#', '');
            const isProfileOrShareHash = hashForRoot.startsWith('/therapist-profile/') || hashForRoot.startsWith('/share/therapist/') || hashForRoot.startsWith('therapist-profile/');
            if (isProfileOrShareHash) {
                console.log('🔗 Root path but hash is therapist profile – keeping shared-therapist-profile');
                setPage('shared-therapist-profile');
            } else if (page !== 'landing' && page !== 'home') {
                console.log(`🎯 Root URL detected → landing (current page: ${page})`);
                setPage('landing');
            }
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [setPage]);
};
