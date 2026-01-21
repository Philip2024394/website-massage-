/**
 * ⚠️ WARNING
 * openChat event is handled ONLY by useOpenChatListener.
 * Do NOT add additional event listeners for chat.
 */
import { Helmet } from 'react-helmet';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import GlobalHeader from './components/GlobalHeader';
import AppRouter from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { useAutoReviews } from './hooks/useAutoReviews';
import { useMobileLock } from './hooks/useMobileLock';
import { usePreventScroll } from './hooks/usePreventScroll';
import { useMobileDetection } from './hooks/useMobileDetection';
import { useTranslations } from './lib/useTranslations';
import { DeviceStylesProvider } from './components/DeviceAware';
import BookingStatusTracker from './components/BookingStatusTracker';
import { useState, useEffect } from 'react';

// Temporarily disabled lazy loading to fix AsyncMode error
// const FloatingChatWindow = lazy(() => import('./chat').then(m => ({ default: m.FloatingChatWindow })));
// const FloatingChat = lazy(() => import('./apps/therapist-dashboard/src/components/FloatingChat'));
import { bookingExpirationService } from './services/bookingExpirationService';
// localStorage disabled globally - COMMENTED OUT to enable language persistence
// import './utils/disableLocalStorage';
// (Former cleanupLocalStorage import removed as localStorage persisted data is no longer used)
import './lib/globalErrorHandler'; // Initialize global error handling
import { LanguageProvider } from './context/LanguageContext';
import { CityProvider, useCityContext } from './context/CityContext';
import { agentShareAnalyticsService } from './lib/appwriteService';
import { analyticsService, AnalyticsEventType } from './services/analyticsService';
import type { Therapist, Place, Analytics } from './types';
import './lib/notificationSound'; // Initialize notification sound system
import { pushNotifications } from './lib/pushNotifications'; // Initialize Appwrite push notifications
// REMOVED: chatSessionService import - no longer using global chat sessions
// REMOVED: ChatErrorBoundary import - no longer using global ChatWindow
import { getUrlForPage, updateBrowserUrl, getPageFromUrl } from './utils/urlMapper';
// Temporarily removed: import { useSimpleLanguage } from './context/SimpleLanguageContext';
// Temporarily removed: import SimpleLanguageSelector from './components/SimpleLanguageSerializer';
import { useServiceWorkerListener } from './app/useServiceWorkerListener';
import { useUrlBookingHandler } from './app/useUrlBookingHandler';
import { useAnalyticsHandler } from './app/useAnalyticsHandler';
import { ChatProvider } from './context/ChatProvider';

// 🔒 PERSISTENT CHAT SYSTEM - Facebook Messenger style
import { PersistentChatProvider } from './context/PersistentChatProvider';
import { PersistentChatWindow } from './components/PersistentChatWindow';

const App = () => {
    console.log('🏗️ App.tsx: App component rendering');
    
    // Mobile viewport lock for stable mobile experience
    useMobileLock();
    
    // DISABLED: This was blocking all mobile scrolling
    // usePreventScroll();
    
    // Enhanced mobile detection and device-aware styling
    const mobileDetection = useMobileDetection();
    
    // Forced booking modal state
    const [forcedBookingData, setForcedBookingData] = useState<any>(null);
    
    // Fetch booking details and show forced modal
    const fetchAndShowForcedBooking = async (bookingId: string) => {
        try {
            // TODO: Fetch booking details from Appwrite
            // For now, show placeholder
            const mockBookingData = {
                id: bookingId,
                customerName: 'J.S.', // Initials only, no full name
                service: 'Traditional Thai Massage',
                date: new Date().toLocaleDateString(),
                time: '2:00 PM',
                duration: '90 minutes',
                price: 'IDR 450,000',
                receivedAt: Date.now() - 60000, // 1 minute ago
                expiresAt: Date.now() + (4 * 60 * 1000) // 4 minutes left
            };
            
            setForcedBookingData(mockBookingData);
        } catch (error) {
            console.error('Failed to fetch forced booking:', error);
        }
    };
    
    // Auto-accept booking (from email link)
    const handleAutoAcceptBooking = async (bookingId: string) => {
        try {
            console.log('✅ Auto-accepting booking:', bookingId);
            // TODO: Accept booking via Appwrite
            // Show success message
            alert('Booking accepted successfully!');
        } catch (error) {
            console.error('Auto-accept failed:', error);
            alert('Failed to accept booking. Please try manually.');
        }
    };
    
    // Handle booking expiration
    const handleBookingExpiration = async (bookingId: string, reason: string) => {
        console.log('⏰ Handling booking expiration:', bookingId, reason);
        // TODO: Update availability score
        // TODO: Send expiration notification
        setForcedBookingData(null); // Close modal if open
    };
    
    // Service Worker message listener - PLATFORM ONLY
    useServiceWorkerListener(fetchAndShowForcedBooking, handleBookingExpiration);
    
    // Check URL for forced booking view on load
    useUrlBookingHandler(fetchAndShowForcedBooking, handleAutoAcceptBooking);
    
    // Booking Status Tracker state
    const [isStatusTrackerOpen, setIsStatusTrackerOpen] = useState(false);
    const [bookingStatusInfo, setBookingStatusInfo] = useState<{
        bookingId: string;
        therapistName: string;
        duration: number;
        price: number;
        responseDeadline: Date;
    } | null>(null);

    // Active chat state for booking chat windows
    const [activeChat, setActiveChat] = useState<{
        chatRoomId: string;
        bookingId: string;
        providerId: string;
        providerName: string;
        providerImage: string | null;
        userRole: string;
        pricing: { [key: string]: number };
        customerName: string;
        customerWhatsApp: string;
        customerId: string;
    } | null>(null);

    // Chat minimization state
    const [isChatMinimized, setIsChatMinimized] = useState(true);

    // ===== CRITICAL HASHROUTER FIX: Clean URL → Hash URL Redirect =====
    // Redirect ALL clean URLs to hash URLs for HashRouter compatibility
    // Examples:
    //   /home → /#/home
    //   /therapist → /#/therapist
    //   /therapist-profile/abc → /#/therapist-profile/abc
    useEffect(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        const search = window.location.search;
        
        // Skip redirect if:
        // - Already has hash route (starts with #/)
        // - Root path with no hash (let router handle)
        // - Admin dashboard path
        if (hash.startsWith('#/') || (path === '/' && !hash) || path.includes('/admin')) {
            return;
        }
        
        // Routes that need hash redirect
        const needsRedirect = 
            path === '/home' ||
            path === '/therapist' ||
            path === '/therapist-dashboard' ||
            path.startsWith('/therapist-profile/') ||
            path.startsWith('/dashboard/');
        
        if (needsRedirect) {
            console.log('🔄 [HASHROUTER FIX] Clean URL detected, redirecting to hash URL');
            console.log('   From:', window.location.href);
            const newUrl = window.location.origin + '/#' + path + search;
            console.log('   To:', newUrl);
            window.location.replace(newUrl); // Silent redirect, no history entry
        }
    }, []); // Run once on mount
    
    // ===== CRITICAL FIX: INITIALIZE ALL HOOKS AT TOP =====
    // All hooks combined - MUST be called BEFORE any useEffect that depends on state
    const hooks = useAllHooks();
    const { state, navigation, authHandlers, providerAgentHandlers, derived, restoreUserSession } = hooks;
    
    // Log mobile detection info for debugging (only when mobile detected)
    useEffect(() => {
        if (mobileDetection.isMobileDevice || mobileDetection.isMobileScreen) {
            console.log('📱 Mobile device detected:', {
                device: mobileDetection.isMobileDevice ? 'Mobile Device' : 'Mobile Screen',
                screen: `${mobileDetection.deviceInfo.viewportWidth}x${mobileDetection.deviceInfo.viewportHeight}`,
                orientation: mobileDetection.isPortrait ? 'Portrait' : 'Landscape',
                browser: mobileDetection.deviceInfo.browser,
                os: mobileDetection.deviceInfo.os,
                hasTouch: mobileDetection.hasTouch,
                hasHover: mobileDetection.hasHover
            });
        }
    }, [
        mobileDetection.isMobileDevice, 
        mobileDetection.isMobileScreen,
        mobileDetection.isPortrait,
        mobileDetection.deviceInfo.viewportWidth,
        mobileDetection.deviceInfo.viewportHeight
    ]);
    
    // Initialize auto-review system for Yogyakarta therapists (5-minute updates)
    useAutoReviews();
    
    // Use the actual language from hooks, not hardcoded
    const { language, setLanguage } = state;
    
    // Get translations using the actual language state - provide to AppRouter
    const { t: _t, dict } = useTranslations(language);

    // Analytics handler function
    const handleIncrementAnalytics = useAnalyticsHandler();

    // Track activeChat state changes

    // Track activeChat state changes
    useEffect(() => {
        console.log('🔥 REACT STATE UPDATED - activeChat changed');
        if (activeChat) {
            console.log('🔥 activeChat IS NOW SET:', {
                chatRoomId: activeChat.chatRoomId,
                bookingId: activeChat.bookingId,
                providerId: activeChat.providerId
            });
            console.log('🔥 NEXT: ChatWindow should render in JSX');
        } else {
            console.log('❌ activeChat cleared - ChatWindow hidden');
        }
    }, [activeChat]);

    // Removed old fallback logic - using new activeChat system

    // REMOVED: Listen for data refresh events - was for ChatWindow updates
    // useEffect(() => {
    //     const handleDataRefresh = (event: CustomEvent) => {
    //         console.log('🔄 App.tsx: Data refresh detected:', event.detail);
    //         // Chat refresh logic removed
    //     };
    // 
    //     window.addEventListener('refreshData' as any, handleDataRefresh);
    //     
    //     return () => {
    //         window.removeEventListener('refreshData' as any, handleDataRefresh);
    //     };
    // }, []);

    // REMOVED: Session restoration - was auto-opening ChatWindow 
    // useEffect(() => {
    //     const restoreChatSession = async () => {
    //         // Session restoration code removed to prevent auto-opening overlays
    //     };
    // }, []);

    // Session initialization on startup
    useEffect(() => {
        const initializeAppwriteSession = async () => {
            try {
                if (!(window as any).Appwrite) {
                    console.log('📦 CDN failed, loading Appwrite from npm...');
                    const appwriteModule = await import('appwrite');
                    (window as any).Appwrite = appwriteModule;
                    console.log('✅ Appwrite SDK loaded from npm:', Object.keys(appwriteModule));
                } else {
                    console.log('✅ Appwrite SDK already available from CDN');
                }

                const { account } = await import('./lib/appwrite');
                const { sessionCache } = await import('./lib/sessionCache');

                const cached = sessionCache.get();
                if (cached) {
                    if (cached.hasSession) {
                        console.log('✅ Session active (cached):', cached.user?.email);
                    }
                    return;
                }

                try {
                    const currentUser = await Promise.race([
                        account.get(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                    ]) as any;

                    sessionCache.set(true, currentUser);
                    console.log('✅ Session already active:', currentUser.email);
                } catch (sessionError: any) {
                    sessionCache.setNoSession();
                    
                    // ⚠️ REMOVED: Automatic anonymous session creation on app init
                    // Anonymous sessions are now created ONLY when needed:
                    // - When user clicks "Book Now" (see BookingPopup.tsx)
                    // - When user opens chat (see ChatWindow.tsx)
                    // - For protected actions requiring authentication
                    // This prevents unnecessary user creation on landing page load.
                    // See: lib/authSessionHelper.ts for on-demand session creation
                    
                    if (sessionError?.code !== 401 && sessionError?.message !== 'timeout') {
                        console.log('ℹ️ Session check:', sessionError.message || 'No active session');
                    }
                }
            } catch (error: any) {
                if (!error.message?.includes('already exists')) {
                    console.log('Session initialization:', error.message);
                }
            }
        };

        // REMOVED: restoreChatSession call - no longer using global ChatWindow
        void initializeAppwriteSession();
        bookingExpirationService.start();

        pushNotifications.initialize().catch(err => {
            console.log('Push notification initialization:', err.message);
        });

        return () => {
            bookingExpirationService.stop();
        };
    }, [state.page]); // Re-run when page changes to allow restoration on non-landing pages

    // Inbound share click tracking via URL params (agent/provider/platform)
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const agent = params.get('agent');
            const provider = params.get('provider'); // format: therapist-<id> or place-<id>
            const platform = (params.get('platform') || 'copy') as any;
            if (agent && provider) {
                const [ptype, pidRaw] = provider.split('-');
                const providerType = (ptype === 'therapist' ? 'therapist' : 'place') as 'therapist' | 'place';
                const providerId = pidRaw;
                // Persist deeplink for when data loads
                sessionStorage.setItem('pending_deeplink', JSON.stringify({ agent, provider, platform }));
                agentShareAnalyticsService.trackShareClick({
                    agentCode: agent,
                    providerType,
                    providerId,
                    platform
                });
                // Optional: clean params from URL to avoid double counting on SPA nav
                const url = new URL(window.location.href);
                url.searchParams.delete('agent');
                url.searchParams.delete('provider');
                url.searchParams.delete('platform');
                window.history.replaceState({}, '', url.toString());
            }
        } catch (e) {
            console.warn('Inbound share tracking failed:', e);
        }
    }, []);

    // Log current language and page state
    console.log('🌐 App.tsx: Current language state:', language);
    console.log('📄 App.tsx: Current page state:', state.page);

    // ===== ROUTE CHANGE CLEANUP =====
    // Close modals and reset temporary UI state on route change
    useEffect(() => {
        console.log('🔄 Route changed to:', state.page);
        
        // Close all modals on route change
        setIsStatusTrackerOpen(false);
        
        // Reset modal data
        setBookingStatusInfo(null);
        
        // Note: Chat is intentionally NOT closed on route change
        // to allow users to continue conversations while navigating
    }, [state.page]);
    
    // ===== LANDING PAGE NAVIGATION HANDLER =====
    // Listen for navigateToLanding event from GlobalHeader logo click
    useEffect(() => {
        const handleNavigateToLanding = () => {
            console.log('🏠 [APP] navigateToLanding event received - navigating to landing page');
            navigation?.setPage('landing');
        };
        
        window.addEventListener('navigateToLanding', handleNavigateToLanding);
        
        return () => {
            window.removeEventListener('navigateToLanding', handleNavigateToLanding);
        };
    }, [navigation]);
        
    // ===== GLOBAL PAGE CHANGE MONITOR =====
    useEffect(() => {
        console.log('\n' + '📄'.repeat(50));
        console.log('📄 [PAGE STATE] Page changed');
        console.log('📄'.repeat(50));
        console.log('📍 Current page:', state.page);
        console.log('📍 Previous page:', document.title);
        console.log('🔗 Current URL:', window.location.href);
        console.log('🔗 Pathname:', window.location.pathname);
        console.log('📄'.repeat(50) + '\n');
    }, [state.page]);

    // ===== URL SYNCHRONIZATION SYSTEM =====
    // Sync browser URL with page state
    useEffect(() => {
        // Skip URL update during initial load to avoid conflicts with direct URL access
        const isInitialLoad = sessionStorage.getItem('app_initial_load') !== 'done';
        if (isInitialLoad) {
            sessionStorage.setItem('app_initial_load', 'done');
            return;
        }
        
        // ⚠️ URL SYNC TEMPORARILY DISABLED - Causing redirect loops with HashRouter
        // TODO: Fix URL mapping to work with hash routes (/#/page instead of /page)
        // Update browser URL when page changes
        const currentPath = window.location.pathname;
        const expectedUrl = getUrlForPage(state.page);
        
        console.log('\n' + '🔄'.repeat(50));
        console.log('🔄 [URL SYNC] DISABLED - Would cause redirect loop');
        console.log('🔄'.repeat(50));
        console.log('📍 Current path:', currentPath);
        console.log('📍 Expected URL:', expectedUrl);
        console.log('📍 Match:', currentPath === expectedUrl);
        console.log('📍 URL sync disabled to prevent HashRouter conflicts');
        console.log('🔄'.repeat(50) + '\n');
        
        // DISABLED: Only update if URL doesn't match (avoid unnecessary history entries)
        // if (currentPath !== expectedUrl && !currentPath.startsWith('/profile/therapist/') && !currentPath.startsWith('/profile/place/') && !currentPath.startsWith('/accept-booking/')) {
        //     console.log('🚫 [REDIRECT] URL sync triggering updateBrowserUrl');
        //     console.log('   From:', currentPath, '→ To:', expectedUrl);
        //     updateBrowserUrl(state.page, undefined, false);
        // }
    }, [state.page]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const path = window.location.pathname;
            const page = getPageFromUrl(path);
            
            console.log('\n' + '🔙'.repeat(50));
            console.log('🔙 [NAVIGATION] Browser back/forward detected');
            console.log('🔙'.repeat(50));
            console.log('📍 Path:', path);
            console.log('📄 Resolved page:', page);
            console.log('📄 Current page:', state.page);
            console.log('🔙'.repeat(50) + '\n');
            
            if (page && page !== state.page) {
                console.log('🚫 [REDIRECT] Page change triggered by popstate');
                console.log('   From:', state.page, '→ To:', page);
                state.setPage(page);
            }
        };
        
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [state.page, state.setPage]);

    // Detect direct path navigation for accept-booking links and membership page
    useEffect(() => {
        try {
            // 🔥 CRITICAL FIX: Parse hash for hash URLs (/#/path)
            // For /#/therapist-profile/123, pathname = "/" and hash = "#/therapist-profile/123"
            let path = window.location.pathname || '';
            const hash = window.location.hash || '';
            
            // If hash starts with #/, use hash as the path
            if (hash.startsWith('#/')) {
                path = hash.substring(1); // Remove # to get /therapist-profile/123
                console.log('🔗 [HASH URL] Parsed path from hash:', path);
            }
            
            if (path.startsWith('/accept-booking/')) {
                state.setPage('accept-booking');
            } else if (path === '/join' || path.startsWith('/join/')) {
                state.setPage('membership-select');
            } else if (path === '/admin' || path.startsWith('/admin/')) {
                // Handle admin routes
                console.log('🔗 [ADMIN URL] Admin route detected:', path);
                if (path === '/admin') {
                    state.setPage('admin');
                } else if (path === '/admin/therapists') {
                    state.setPage('admin-therapists');
                } else if (path === '/admin/bookings') {
                    state.setPage('admin-bookings');
                } else if (path === '/admin/chat') {
                    state.setPage('admin-chat');
                } else if (path === '/admin/revenue') {
                    state.setPage('admin-revenue');
                } else if (path === '/admin/commissions') {
                    state.setPage('admin-commissions');
                } else {
                    state.setPage('admin'); // Default to main admin dashboard
                }
            } else if (path.startsWith('/therapist-profile/')) {
                // Handle direct shared therapist profile URL (production links)
                console.log('🔗 Direct therapist profile path detected:', path);
                const match = path.match(/\/therapist-profile\/([a-z0-9]+)-/);
                if (match) {
                    const therapistId = match[1];
                    console.log('   Extracted therapist ID:', therapistId);
                    state.setPage('shared-therapist-profile');
                    // Store for SharedTherapistProfile component to use
                    sessionStorage.setItem('direct_therapist_id', therapistId);
                } else {
                    console.warn('   Could not extract therapist ID from path:', path);
                }
            } else if (path.startsWith('/profile/therapist/')) {
                // Handle direct therapist profile URL with reviews
                const match = path.match(/\/profile\/therapist\/(\d+)-/);
                if (match && state.therapists?.length) {
                    const therapistId = match[1];
                    const found = state.therapists.find((t: any) => 
                        (t.id || t.$id || '').toString() === therapistId
                    );
                    if (found) {
                        state.setSelectedTherapist(found);
                        state.setPage('therapist-profile');
                    }
                } else if (match) {
                    // Store for later when therapists are loaded
                    sessionStorage.setItem('pending_deeplink', JSON.stringify({
                        provider: `therapist-${match[1]}`,
                        targetPage: 'therapist-profile'
                    }));
                }
            } else if (path.startsWith('/profile/place/')) {
                // Handle direct massage place profile URL
                const match = path.match(/\/profile\/place\/(\d+)-/);
                if (match && state.places?.length) {
                    const placeId = match[1];
                    const found = state.places.find((p: any) => 
                        (p.id || p.$id || '').toString() === placeId
                    );
                    if (found) {
                        state.setSelectedPlace(found);
                        state.setPage('massage-place-profile');
                    }
                } else if (match) {
                    // Store for later when places are loaded
                    sessionStorage.setItem('pending_deeplink', JSON.stringify({
                        provider: `place-${match[1]}`,
                        targetPage: 'massage-place-profile'
                    }));
                }
            } else if (path === '/signup' || path.startsWith('/signup')) {
                // Handle signup - set page state to trigger redirect or render SimpleSignupFlow
                const urlParams = new URLSearchParams(window.location.search);
                const plan = urlParams.get('plan');
                const portal = urlParams.get('portal');
                
                if (plan && portal) {
                    localStorage.setItem('selected_membership_plan', plan);
                    localStorage.setItem('selectedPortalType', portal);
                }
                
                // Set page to simpleSignup which will render SimpleSignupFlow or redirect if needed
                state.setPage('simpleSignup');
                return;
            }
        } catch (e) {
            console.warn('Path detection failed:', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.therapists, state.places]);

    // 🔥 CRITICAL: Listen for hash changes for SPA navigation
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '';
            console.log('🔄 [HASH CHANGE] Hash changed to:', hash);
            
            if (hash.startsWith('#/')) {
                const path = hash.substring(1); // Remove # to get /therapist-profile/123
                console.log('🔗 [HASH CHANGE] Parsed path:', path);
                
                if (path === '/admin' || path.startsWith('/admin/')) {
                    // Handle admin routes
                    console.log('🔗 [HASH CHANGE] Admin route detected:', path);
                    if (path === '/admin') {
                        state.setPage('admin');
                    } else if (path === '/admin/therapists') {
                        state.setPage('admin-therapists');
                    } else if (path === '/admin/bookings') {
                        state.setPage('admin-bookings');
                    } else if (path === '/admin/chat') {
                        state.setPage('admin-chat');
                    } else if (path === '/admin/revenue') {
                        state.setPage('admin-revenue');
                    } else if (path === '/admin/commissions') {
                        state.setPage('admin-commissions');
                    } else {
                        state.setPage('admin'); // Default to main admin dashboard
                    }
                } else if (path.startsWith('/therapist-profile/')) {
                    const match = path.match(/\/therapist-profile\/([a-z0-9]+)-/);
                    if (match) {
                        const therapistId = match[1];
                        console.log('✅ [HASH CHANGE] Setting page to shared-therapist-profile, ID:', therapistId);
                        state.setPage('shared-therapist-profile');
                        sessionStorage.setItem('direct_therapist_id', therapistId);
                    }
                }
            }
        };
        
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [state.setPage]);

    // Navigate to deep-linked profile once data is available (requires state)
    useEffect(() => {
        try {
            const pending = sessionStorage.getItem('pending_deeplink');
            if (!pending) return;
            const parsed = JSON.parse(pending) as { provider?: string; targetPage?: string };
            const { provider, targetPage } = parsed;
            if (!provider) return;
            const [ptype, pidRaw] = provider.split('-');
            const idStr = (pidRaw || '').toString();
            if (ptype === 'therapist' && state.therapists && state.therapists.length) {
                const found = state.therapists.find((th: any) => ((th.id ?? th.$id ?? '').toString() === idStr));
                if (found) {
                    state.setSelectedTherapist(found);
                    const target = (targetPage === 'shared-therapist-profile') ? 'shared-therapist-profile' : 'therapistProfile';
                    state.setPage(target as any);
                    sessionStorage.removeItem('pending_deeplink');
                }
            } else if (ptype === 'place' && state.places && state.places.length) {
                const found = state.places.find((pl: any) => ((pl.id ?? pl.$id ?? '').toString() === idStr));
                if (found) {
                    state.setSelectedPlace(found);
                    state.setPage('massage-place-profile');
                    sessionStorage.removeItem('pending_deeplink');
                }
            }
        } catch (e) {
            console.warn('Deeplink navigation failed:', e);
        }
    }, [state.therapists, state.places]);

    // Play welcome music only for customers (never for members) and only once
    useEffect(() => {
        const isTherapist = state.loggedInProvider?.type === 'therapist';
        const shouldPlayMusic = !isTherapist && !!state.loggedInCustomer && (state.page === 'landing' || state.page === 'home');

        if (isTherapist || state.page === 'therapistStatus') {
            localStorage.setItem('welcomeMusicPlayedEver', 'true');
            return;
        }

        if (!shouldPlayMusic) return;

        if (localStorage.getItem('welcomeMusicPlayedEver')) {
            return;
        }

        const audio = new Audio('/sounds/booking-notification.mp3');
        audio.volume = 0.5;
        let cleanupListeners: (() => void) | null = null;

        const clearListeners = () => {
            if (cleanupListeners) {
                cleanupListeners();
                cleanupListeners = null;
            }
        };

        const playAudio = () => audio.play().then(() => {
            localStorage.setItem('welcomeMusicPlayedEver', 'true');
            clearListeners();
        }).catch(() => {
            // Fallback to first non-interactive tap/click
            const playOnInteraction = (e: Event) => {
                const target = e.target as HTMLElement;
                if (
                    target.closest('button') ||
                    target.closest('a') ||
                    target.closest('input') ||
                    target.closest('select') ||
                    target.closest('textarea') ||
                    target.closest('[role="button"]') ||
                    target.closest('.interactive')
                ) {
                    return;
                }

                audio.play().then(() => {
                    localStorage.setItem('welcomeMusicPlayedEver', 'true');
                    clearListeners();
                }).catch(() => undefined);
            };

            document.addEventListener('click', playOnInteraction, { passive: true });
            document.addEventListener('touchstart', playOnInteraction, { passive: true });
            cleanupListeners = () => {
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
            };
        });

        playAudio();

        return () => {
            clearListeners();
            audio.pause();
        };
    }, [state.loggedInProvider, state.loggedInCustomer, state.page]);

    // Use the actual language handler from hooks
    const handleLanguageSelect = async (lang: 'en' | 'id' | 'gb') => {
        console.log('🌍 App.tsx: handleLanguageSelect called with:', lang);
        const normalized = lang === 'gb' ? 'en' : lang;
        console.log('🌍 App.tsx: Normalized language:', normalized);
        console.log('🌍 App.tsx: Previous language:', language);
        setLanguage(normalized);
        console.log('🌍 App.tsx: Language state updated to:', normalized);
        // Force re-render by ensuring state change is processed
        await new Promise(resolve => setTimeout(resolve, 0));
        return Promise.resolve();
    };

    // Global booking status tracker handler
    const handleOpenBookingStatusTracker = (statusInfo: {
        bookingId: string;
        therapistName: string;
        duration: number;
        price: number;
        responseDeadline: Date;
    }) => {
        console.log('📊 Opening booking status tracker:', statusInfo);
        setBookingStatusInfo(statusInfo);
        setIsStatusTrackerOpen(true);
        
        // Update URL for booking tracker
        const slug = statusInfo.therapistName.toLowerCase().replace(/\s+/g, '-');
        const bookingUrl = `/booking/status/${statusInfo.bookingId}/${slug}`;
        window.history.pushState({ bookingId: statusInfo.bookingId }, '', bookingUrl);
        console.log('🔗 Updated URL to:', bookingUrl);
    };



    // Register global booking functions in useEffect to ensure they're available
    useEffect(() => {
        console.log('📱 Registering global booking functions...');
        (window as any).openBookingStatusTracker = handleOpenBookingStatusTracker;
        
        // Register global navigation functions
        (window as any).setPage = state.setPage;
        (window as any).setLanguage = setLanguage;
        
        return () => {
            // Cleanup on unmount
            delete (window as any).openBookingStatusTracker;
            delete (window as any).setPage;
            delete (window as any).setLanguage;
        };
    }, [state.setPage, setLanguage]);

    const handleFindNewTherapist = () => {
        setIsStatusTrackerOpen(false);
        // Optionally navigate back to therapist list
        state.setPage('home');
    };

    const renderChatWindow = () => {
        console.log('💬 JSX RENDER CYCLE - Checking ChatWindow condition');
        console.log('💬 activeChat value:', activeChat);
        console.log('💬 activeChat?.chatRoomId:', activeChat?.chatRoomId);
        console.log('💬 isChatMinimized:', isChatMinimized);
        console.log('💬 Will render ChatWindow?:', !!activeChat?.chatRoomId && !isChatMinimized);
        
        // Show debug info when activeChat exists but not rendering
        if (activeChat && !activeChat.chatRoomId) {
            console.log('⚠️ activeChat exists but no chatRoomId:', activeChat);
        }
        
        if (activeChat && isChatMinimized) {
            console.log('ℹ️ ChatWindow minimized, activeChat exists');
        }
        
        if (!activeChat?.chatRoomId || isChatMinimized) {
            console.log('❌ ChatWindow NOT rendering - missing chatRoomId or minimized');
            
            // Show debug overlay when we should render but can't
            if (activeChat && !activeChat.chatRoomId && !isChatMinimized) {
                return (
                    <div className="fixed bottom-20 right-6 z-50 bg-red-500 text-white p-3 rounded-lg shadow-lg max-w-sm">
                        <div className="text-sm">
                            <strong>DEBUG:</strong> Chat exists but no chatRoomId
                            <br />
                            <code className="text-xs">{JSON.stringify(activeChat, null, 2)}</code>
                        </div>
                    </div>
                );
            }
            
            return null;
        }
        
        console.log('🔥 RENDERING FloatingChatWindow COMPONENT (lazy loaded)');
        console.log('✅ FloatingChatWindow RENDERING NOW');
        return null; // Temporarily disabled to fix AsyncMode error
        // return (
        //     <Suspense fallback={<div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl animate-pulse" />}>
        //         <FloatingChatWindow
        //             userId={activeChat.customerId || 'guest'}
        //             userName={activeChat.customerName || 'Guest'}
        //             userRole="customer"
        //         />
        //     </Suspense>
        // );
    };

    return (
        <CityProvider>
        <LanguageProvider value={{ 
            language: language as 'en' | 'id', 
            setLanguage: handleLanguageSelect
        }}>
        <ChatProvider>
        <PersistentChatProvider>
        <DeviceStylesProvider>
            <Helmet>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </Helmet>
            <AppLayout
                isFullScreen={
                    state.page === 'landing' || 
                    state.isFullScreen || 
                    state.page === 'admin' || 
                    state.page === 'admin-dashboard' ||
                    state.page === 'admin-therapists' ||
                    state.page === 'admin-bookings' ||
                    state.page === 'admin-chat' ||
                    state.page === 'admin-revenue' ||
                    state.page === 'admin-commissions' ||
                    state.page === 'admin-live-listings'
                }
            >
            {/* Global Header only in PWA standalone and when page lacks its own header */}
            <GlobalHeader page={state.page} />
            <div className={`${state.isFullScreen ? "flex-grow" : "flex-1"} ${
                mobileDetection.isMobileScreen ? 'mobile-layout' : 'desktop-layout'
            } ${
                mobileDetection.isPortrait ? 'portrait-mode' : 'landscape-mode'  
            } ${
                mobileDetection.hasTouch ? 'touch-enabled' : 'no-touch'
            }`}>
                {/* PRODUCTION-FREEZE FIX: Temporarily disable Suspense for React 19 compatibility */}
                {/* <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}> */}
                <AppRouter
                    page={state.page}
                    isLoading={state.isLoading}

                    loggedInProvider={(() => {
                        console.log('🔸 [APP.TSX] Passing loggedInProvider to AppRouter:', {
                            hasProvider: !!state.loggedInProvider,
                            providerId: state.loggedInProvider?.$id || state.loggedInProvider?.id,
                            providerType: state.loggedInProvider?.type,
                            providerName: state.loggedInProvider?.name,
                            providerEmail: state.loggedInProvider?.email,
                            timestamp: new Date().toISOString()
                        });
                        return state.loggedInProvider;
                    })()}
                    loggedInCustomer={state.loggedInCustomer}
                    loggedInAgent={state.loggedInAgent}
                    language={language}
                    isAdminLoggedIn={state.isAdminLoggedIn}
                    isHotelLoggedIn={state.isHotelLoggedIn}
                    isVillaLoggedIn={state.isVillaLoggedIn}
                    therapists={state.therapists}
                    places={state.places}
                    facialPlaces={state.facialPlaces}
                    hotels={state.hotels}
                    notifications={state.notifications}
                    bookings={state.bookings}
                    // Pass loggedInProvider for therapists/places (has full profile data), otherwise use loggedInUser
                    user={(() => {
                        const resolvedUser = (state.loggedInProvider || state.loggedInCustomer || state.loggedInUser) as any;
                        console.log('[APP.TSX] Resolved user for AppRouter:', {
                            hasUser: !!resolvedUser,
                            userId: resolvedUser?.$id || resolvedUser?.id,
                            userName: resolvedUser?.name,
                            source: state.loggedInProvider ? 'loggedInProvider' : state.loggedInCustomer ? 'loggedInCustomer' : 'loggedInUser',
                            timestamp: new Date().toISOString()
                        });
                        return resolvedUser;
                    })()}
                    userLocation={state.userLocation}
                    selectedPlace={state.selectedPlace}
                    selectedMassageType={state.selectedMassageType}
                    providerForBooking={state.providerForBooking}
                    adminMessages={state.adminMessages}
                    providerAuthInfo={state.providerAuthInfo}

                    selectedJobId={null}
                    venueMenuId={state.venueMenuId}
                    hotelVillaLogo={null}
                    impersonatedAgent={state.impersonatedAgent}
                    selectedTherapist={state.selectedTherapist}
                    handleLanguageSelect={handleLanguageSelect}
                    handleEnterApp={navigation?.handleEnterApp || (() => Promise.resolve())}
                    handleSetUserLocation={navigation?.handleSetUserLocation || (() => {})}
                    handleSetSelectedPlace={navigation?.handleSetSelectedPlace || (() => {})}
                    handleSetSelectedTherapist={(therapist: any) => state.setSelectedTherapist(therapist)}
                    handleLogout={authHandlers?.handleProviderLogout || (() => Promise.resolve())}
                    handleNavigateToTherapistLogin={navigation?.handleNavigateToTherapistLogin || (() => {})}
                    handleNavigateToRegistrationChoice={navigation?.handleNavigateToRegistrationChoice || (() => {})}
                    handleNavigateToBooking={navigation?.handleNavigateToBooking || (() => {})}
                    restoreUserSession={restoreUserSession}
                    handleQuickBookWithChat={(provider: Therapist | Place, type: 'therapist' | 'place') => {
                        console.log('🚀 Opening chat for provider:', provider.name);
                        window.dispatchEvent(new CustomEvent('openChat', {
                            detail: {
                                therapistId: provider.id || (provider as any).$id,
                                therapistName: provider.name,
                                therapistType: type,
                                therapistStatus: (provider as any).status || (provider as any).availability || 'available',
                                pricing: (provider as any).pricing ? JSON.parse((provider as any).pricing) : { '60': 200000, '90': 300000, '120': 400000 },
                                profilePicture: (provider as any).profilePicture || (provider as any).mainImage,
                                mode: 'immediate'
                            }
                        }));
                        return Promise.resolve();
                    }}
                    handleChatWithBusyTherapist={() => Promise.resolve()}
                    handleShowRegisterPromptForChat={() => {
                        state.setRegisterPromptContext('booking');
                        state.setShowRegisterPrompt(true);
                    }}
                    handleIncrementAnalytics={handleIncrementAnalytics}
                    handleShowRegisterPrompt={() => { state.setRegisterPromptContext('booking'); state.setShowRegisterPrompt(true); }}
                    t={(key: string) => key}
                    currentPage={state.page}
                    handleNavigateToHotelLogin={() => {}}
                    handleNavigateToMassagePlaceLogin={navigation?.handleNavigateToMassagePlaceLogin || (() => {})}
                    handleNavigateToServiceTerms={navigation?.handleNavigateToServiceTerms || (() => {})}
                    handleNavigateToPrivacyPolicy={navigation?.handleNavigateToPrivacyPolicy || (() => {})}
                    handleBackToHome={navigation?.handleBackToHome || (() => {})}
                    handleSelectRegistration={() => {}}
                    handleTherapistStatusChange={(status: string) => 
                        providerAgentHandlers?.handleTherapistStatusChange 
                            ? providerAgentHandlers.handleTherapistStatusChange(status)
                            : Promise.resolve()
                    }
                    handleSaveTherapist={providerAgentHandlers?.handleSaveTherapist || (() => Promise.resolve())}
                    handleSavePlace={providerAgentHandlers?.handleSavePlace || (() => Promise.resolve())}
                    handleAgentRegister={providerAgentHandlers?.handleAgentRegister || (async () => ({ success: false, message: 'Unavailable' }))}
                    handleAgentLogin={providerAgentHandlers?.handleAgentLogin || (async () => ({ success: false, message: 'Unavailable' }))}
                    handleAgentAcceptTerms={providerAgentHandlers?.handleAgentAcceptTerms || (() => Promise.resolve())}
                    handleSaveAgentProfile={providerAgentHandlers?.handleSaveAgentProfile || (() => Promise.resolve())}
                    handleStopImpersonating={providerAgentHandlers?.handleStopImpersonating || (() => {})}
                    handleSendAdminMessage={providerAgentHandlers?.handleSendAdminMessage || (() => Promise.resolve())}
                    handleMarkMessagesAsRead={providerAgentHandlers?.handleMarkMessagesAsRead || (() => Promise.resolve())}
                    handleSelectMembershipPackage={() => {}}

                    handleProviderLogout={authHandlers?.handleProviderLogout || (() => Promise.resolve())}
                    handleCustomerAuthSuccess={() => Promise.resolve()}
                    handleCustomerLogout={authHandlers?.handleCustomerLogout || (() => Promise.resolve())}
                    handleAgentLogout={authHandlers?.handleAgentLogout || (() => Promise.resolve())}
                    handleHotelLogout={authHandlers?.handleHotelLogout || (() => Promise.resolve())}
                    handleHotelLogin={authHandlers?.handleHotelLogin || (() => {})}
                    handleAdminLogin={authHandlers?.handleAdminLogin || (() => {})}
                    handleAdminLogout={authHandlers?.handleAdminLogout || (() => Promise.resolve())}
                    handleCreateBooking={() => Promise.resolve()}

                    handleUpdateBookingStatus={() => Promise.resolve()}
                    handleMarkNotificationAsRead={() => {}}
                    handleNavigateToNotifications={navigation?.handleNavigateToNotifications || (() => {})}
                    handleNavigateToAgentAuth={navigation?.handleNavigateToAuth || (() => {})}
                    onTherapistPortalClick={navigation?.handleNavigateToTherapistSignup || (() => {})}
                    onMassagePlacePortalClick={navigation?.handleNavigateToMassagePlaceSignup || (() => {})}
                    onAgentPortalClick={() => state.setPage('agentPortal')}
                    onCustomerPortalClick={() => state.setPage('customerPortal')}
                    onHotelPortalClick={() => state.setPage('hotelDashboard')}
                    onVillaPortalClick={() => state.setPage('villaDashboard')}
                    onFacialPortalClick={navigation?.handleNavigateToFacialPlaceSignup || (() => {})}
                    onAdminPortalClick={() => state.setPage('adminDashboard')}
                    onBrowseJobsClick={() => state.setPage('browseJobs')}
                    onEmployerJobPostingClick={() => state.setPage('employerJobPosting')}
                    onMassageJobsClick={() => state.setPage('massageJobs')}
                    onTherapistJobsClick={() => state.setPage('therapistJobs')}
                    onTermsClick={navigation?.handleNavigateToServiceTerms || (() => {})}
                    onPrivacyClick={navigation?.handleNavigateToPrivacyPolicy || (() => {})}


                    setPage={state.setPage}
                    onNavigate={state.setPage}
                    setLoggedInProvider={state.setLoggedInProvider}
                    setLoggedInCustomer={state.setLoggedInCustomer}



                    setSelectedJobId={() => {}}
                />
                {/* </Suspense> */}
            </div>

            {/* Floating Chat for Therapist Dashboard Pages */}
            {state.loggedInProvider?.type === 'therapist' && (
                state.page?.toString().startsWith('therapist') || 
                state.page === 'status' || 
                state.page === 'schedule' || 
                state.page === 'bookings'
            ) && (
                // Temporarily disabled to fix AsyncMode error
                null
                // <Suspense fallback={<div className="fixed bottom-4 right-4 w-80 h-96 bg-gray-100 rounded-lg animate-pulse" />}>
                //     <FloatingChat 
                //         therapist={state.loggedInProvider as any}
                //         isPWA={false}
                //     />
                // </Suspense>
            )}

            <AppFooterLayout
                showFooter={derived.showFooter}
                showFloatingButton={false}
                page={state.page}
                language={state.language}
                userLocation={state.userLocation}
                unreadNotifications={derived.unreadNotifications}
                hasNewBookings={derived.hasNewBookings}
                showRegisterPrompt={state.showRegisterPrompt}
                registerPromptContext={state.registerPromptContext}
                loyaltyEvent={state.loyaltyEvent}
                getUserRole={() => {
                    const role = derived.getUserRole();
                    if (role === 'customer') return 'user';
                    return role;
                }}
                handleRegisterPromptClose={() => state.setShowRegisterPrompt(false)}
                handleRegisterPromptRegister={() => state.setPage('profile')}
                setPage={state.setPage}
                setLoyaltyEvent={state.setLoyaltyEvent}
            />
            
            </AppLayout>
            
            {/* Global Overlays - Outside AppLayout to prevent clipping */}
            {/* Global Booking Status Tracker - ONLY mount when open AND has data */}
            {isStatusTrackerOpen && bookingStatusInfo && (
                <BookingStatusTracker
                    isOpen={isStatusTrackerOpen}
                    onClose={() => {
                        setIsStatusTrackerOpen(false);
                        setBookingStatusInfo(null);
                        // Reset URL when booking tracker closes
                        window.history.pushState({}, '', '/');
                        console.log('🔗 Reset URL to home');
                    }}
                    bookingId={bookingStatusInfo.bookingId}
                    therapistName={bookingStatusInfo.therapistName}
                    duration={bookingStatusInfo.duration}
                    price={bookingStatusInfo.price}
                    responseDeadline={bookingStatusInfo.responseDeadline}
                    onFindNewTherapist={handleFindNewTherapist}
                />
            )}



            {/* Booking Chat Window */}
            {renderChatWindow()}

            {/* New Standalone Floating Chat - Only on home page (rendered in HomePage.tsx) */}

            {/* 🔒 PERSISTENT CHAT WINDOW - Facebook Messenger style
                This renders at ROOT level, OUTSIDE all other components.
                It will NEVER disappear once opened. */}
            <PersistentChatWindow />

        </DeviceStylesProvider>
        </PersistentChatProvider>
        </ChatProvider>
        </LanguageProvider>
        </CityProvider>
    );
};

export default App;
