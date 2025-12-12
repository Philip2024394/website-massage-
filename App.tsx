import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import GlobalHeader from './components/GlobalHeader';
import AppRouter from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { useTranslations } from './lib/useTranslations';
import { DeviceStylesProvider } from './components/DeviceAware';
import BookingPopup from './components/BookingPopup';
import BookingStatusTracker from './components/BookingStatusTracker';
import ScheduleBookingPopup from './components/ScheduleBookingPopup';
import ChatWindow from './components/ChatWindow';
import { useState, useEffect, Suspense } from 'react';
import { bookingExpirationService } from './services/bookingExpirationService';
// localStorage disabled globally
import './utils/disableLocalStorage';
// (Former cleanupLocalStorage import removed as localStorage persisted data is no longer used)
import './lib/globalErrorHandler'; // Initialize global error handling
import { LanguageProvider } from './context/LanguageContext';
import { agentShareAnalyticsService } from './lib/appwriteService';
import type { Therapist, Place } from './types';
import './lib/notificationSound'; // Initialize notification sound system
import { pushNotifications } from './lib/pushNotifications'; // Initialize Appwrite push notifications
import { chatSessionService } from './services/chatSessionService';
import ChatErrorBoundary from './components/ChatErrorBoundary';
// Temporarily removed: import { useSimpleLanguage } from './context/SimpleLanguageContext';
// Temporarily removed: import SimpleLanguageSelector from './components/SimpleLanguageSerializer';

const App = () => {
    console.log('🏗️ App.tsx: App component rendering...');
    
    // Booking popup state
    const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
    const [bookingProviderInfo, setBookingProviderInfo] = useState<{
        name: string;
        whatsappNumber: string;
        providerId: string;
        providerType: 'therapist' | 'place';
        profilePicture?: string;
        hotelVillaId?: string;
        hotelVillaName?: string;
        hotelVillaType?: 'hotel' | 'villa';
        hotelVillaLocation?: string;
        pricing?: { [key: string]: number };
        discountPercentage?: number;
        discountActive?: boolean;
    } | null>(null);

    // Booking Status Tracker state
    const [isStatusTrackerOpen, setIsStatusTrackerOpen] = useState(false);
    const [bookingStatusInfo, setBookingStatusInfo] = useState<{
        bookingId: string;
        therapistName: string;
        duration: number;
        price: number;
        responseDeadline: Date;
    } | null>(null);

    // Schedule Booking Popup state
    const [isScheduleBookingOpen, setIsScheduleBookingOpen] = useState(false);
    const [scheduleBookingInfo, setScheduleBookingInfo] = useState<{
        therapistId: string;
        therapistName: string;
        therapistType: 'therapist' | 'place';
        profilePicture?: string;
        hotelVillaId?: string;
        hotelVillaName?: string;
        hotelVillaType?: 'hotel' | 'villa';
        hotelVillaLocation?: string;
        pricing?: { [key: string]: number };
        discountPercentage?: number;
        discountActive?: boolean;
    } | null>(null);

    // Chat Window state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInfo, setChatInfo] = useState<{
        therapistId: string;
        therapistName: string;
        therapistType: 'therapist' | 'place';
        bookingId?: string;
        chatRoomId?: string;
        customerName?: string;
        customerWhatsApp?: string;
        therapistStatus?: 'available' | 'busy' | 'offline';
        pricing?: { [key: string]: number };
        discountPercentage?: number;
        discountActive?: boolean;
        profilePicture?: string;
        providerRating?: number;
        mode?: 'immediate' | 'scheduled';
    } | null>(null);

    // Listen for openChat events from booking creation
    useEffect(() => {
        console.log('🎧 App.tsx: Setting up openChat event listener');
        
        const handleOpenChat = async (event: CustomEvent) => {
            console.log('📨 App.tsx: Received openChat event!', event.detail);
            const { therapistId, therapistName, therapistType, bookingId, chatRoomId, therapistStatus, pricing, discountPercentage, discountActive, profilePicture, providerRating, mode } = event.detail;
            
            console.log('💬 Opening chat window for booking:', bookingId);
            console.log('📋 Chat info:', { therapistId, therapistName, therapistType, chatRoomId, therapistStatus, pricing });
            
            // IMMEDIATELY open the chat window with the available data
            const immediateChatInfo = {
                therapistId,
                therapistName,
                therapistType: therapistType || 'therapist',
                therapistStatus: therapistStatus || 'available',
                pricing: pricing || { '60': 200000, '90': 300000, '120': 400000 },
                discountPercentage,
                discountActive,
                profilePicture,
                providerRating,
                bookingId,
                chatRoomId,
                customerName: '',
                customerWhatsApp: '',
                mode: mode || 'immediate'
            };
            
            // Open chat immediately
            setChatInfo(immediateChatInfo);
            setIsChatOpen(true);
            console.log('✅ Chat window opened immediately');
            
            // Handle session creation and customer details in background (non-blocking)
            void (async () => {
                try {
                    // Try to get customer details from booking for scheduled bookings
                    let customerName = '';
                    let customerWhatsApp = '';
                    
                    if (bookingId) {
                        try {
                            const { databases } = await import('./lib/appwrite');
                            const { APPWRITE_CONFIG } = await import('./lib/appwrite.config');
                            
                            const booking = await databases.getDocument(
                                APPWRITE_CONFIG.databaseId,
                                APPWRITE_CONFIG.collections.bookings || 'bookings',
                                bookingId
                            );
                            
                            if (booking.customerName) customerName = booking.customerName;
                            if (booking.customerWhatsApp) customerWhatsApp = booking.customerWhatsApp;
                            
                            console.log('✅ Retrieved customer details from booking:', { customerName, customerWhatsApp });
                            
                            // Update chat info if we got customer details
                            setChatInfo(prev => ({ ...prev, customerName, customerWhatsApp }));
                        } catch (error) {
                            console.warn('⚠️ Could not retrieve customer details from booking:', error);
                        }
                    }

                    // Check for existing active session or create new one (in background)
                    let sessionData;
                    try {
                        const existingSession = await chatSessionService.getActiveSession(therapistId);
                    
                    if (existingSession && existingSession.isActive) {
                        // Use existing session
                        console.log('♻️ Reusing existing chat session:', existingSession.sessionId);
                        sessionData = existingSession;
                        
                        // Update session with latest info if needed
                        await chatSessionService.updateSession(existingSession.sessionId, {
                            providerStatus: therapistStatus || existingSession.providerStatus,
                            pricing: pricing || existingSession.pricing,
                            discountPercentage: discountPercentage || existingSession.discountPercentage,
                            discountActive: discountActive !== undefined ? discountActive : existingSession.discountActive
                        });
                    } else {
                        // Create new persistent session
                        console.log('💾 Creating new persistent chat session');
                        sessionData = await chatSessionService.createSession({
                            customerId: customerName || undefined,
                            customerName,
                            customerWhatsApp,
                            providerId: therapistId,
                            providerName: therapistName,
                            providerType: therapistType || 'therapist',
                            providerStatus: therapistStatus || 'available',
                            mode: mode || 'immediate',
                            pricing: pricing || { '60': 200000, '90': 300000, '120': 400000 },
                            discountPercentage,
                            discountActive,
                            profilePicture,
                            providerRating,
                            bookingId,
                            chatRoomId,
                            isActive: true
                        });
                        console.log('✅ Persistent chat session created:', sessionData.sessionId);
                    }
                    
                    // Update chat info with session data if we got it
                    if (sessionData) {
                        const updatedChatInfo = {
                            therapistId: sessionData.providerId || therapistId,
                            therapistName: sessionData.providerName || therapistName,
                            therapistType: sessionData.providerType || therapistType || 'therapist',
                            therapistStatus: sessionData.providerStatus || therapistStatus || 'available',
                            pricing: sessionData.pricing || pricing || { '60': 200000, '90': 300000, '120': 400000 },
                            discountPercentage: sessionData.discountPercentage,
                            discountActive: sessionData.discountActive,
                            profilePicture: sessionData.profilePicture,
                            providerRating: sessionData.providerRating,
                            bookingId: sessionData.bookingId,
                            chatRoomId: sessionData.chatRoomId,
                            customerName: sessionData.customerName || customerName,
                            customerWhatsApp: sessionData.customerWhatsApp || customerWhatsApp,
                            mode: sessionData.mode || mode || 'immediate'
                        };
                        setChatInfo(updatedChatInfo);
                        console.log('✅ Chat info updated with session data');
                    }
                } catch (error) {
                    console.error('❌ Failed to handle persistent session:', error);
                }
            })();
        };

        window.addEventListener('openChat' as any, handleOpenChat);
        console.log('✅ Event listener attached');
        
        return () => {
            window.removeEventListener('openChat' as any, handleOpenChat);
            console.log('🧹 Event listener cleaned up');
        };
    }, []);

    // Listen for data refresh events to update ChatWindow status
    useEffect(() => {
        const handleDataRefresh = (event: CustomEvent) => {
            console.log('🔄 App.tsx: Data refresh detected:', event.detail);
            
            // If ChatWindow is open and this refresh is for the current therapist
            if (isChatOpen && chatInfo && event.detail?.therapistId === chatInfo.therapistId) {
                console.log('🔄 Updating ChatWindow status for therapist:', chatInfo.therapistName);
                setChatInfo(prev => prev ? {
                    ...prev,
                    therapistStatus: event.detail.newStatus?.toLowerCase() || 'available'
                } : null);
                console.log('✅ ChatWindow status updated to:', event.detail.newStatus);
            }
        };

        window.addEventListener('refreshData' as any, handleDataRefresh);
        
        return () => {
            window.removeEventListener('refreshData' as any, handleDataRefresh);
        };
    }, [isChatOpen, chatInfo]);

    // Session restoration and cleanup on app startup
    useEffect(() => {
        const restoreChatSession = async () => {
            try {
                // Check if we have any active sessions that need to be restored
                const allSessions = await chatSessionService.listActiveSessions();
                
                if (allSessions && allSessions.length > 0) {
                    // Get the most recent active session
                    const latestSession = allSessions[0];
                    console.log('🔄 Restoring active chat session from previous visit:', latestSession.sessionId);
                    
                    // Restore the chat state
                    setChatInfo({
                        // sessionId removed from type
                        therapistId: latestSession.providerId,
                        therapistName: latestSession.providerName,
                        therapistType: latestSession.providerType,
                        therapistStatus: latestSession.providerStatus,
                        pricing: latestSession.pricing,
                        discountPercentage: latestSession.discountPercentage,
                        discountActive: latestSession.discountActive,
                        profilePicture: latestSession.profilePicture,
                        providerRating: latestSession.providerRating,
                        bookingId: latestSession.bookingId,
                        chatRoomId: latestSession.chatRoomId,
                        customerName: latestSession.customerName,
                        customerWhatsApp: latestSession.customerWhatsApp,
                        mode: latestSession.mode
                    });
                    setIsChatOpen(true);
                }
                
                // Clean up expired sessions
                await chatSessionService.cleanupExpiredSessions();
            } catch (error) {
                console.warn('⚠️ Failed to restore chat session:', error);
                // Continue normally if session restoration fails
            }
        };

        restoreChatSession();
        
        // localStorage disabled: skip cleanupLocalStorage()
        
        // Play welcome music only once ever (not per session)
        const hasPlayedMusic = localStorage.getItem('welcomeMusicPlayedEver');
        if (hasPlayedMusic) {
            console.log('🎵 Welcome music already played, skipping');
            return; // Exit early if music was already played
        }

        const audio = new Audio('/sounds/booking-notification.mp3');
        audio.volume = 0.5; // Set volume to 50%
        
        let cleanupListeners: (() => void) | null = null;

        // Play with user interaction fallback
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('🎵 Welcome music playing');
                    localStorage.setItem('welcomeMusicPlayedEver', 'true');
                })
                .catch((error) => {
                    // Autoplay was prevented, will try on first user interaction
                    console.log('🎵 Welcome music autoplay prevented, will play on user interaction');
                    const playOnInteraction = (e: Event) => {
                        // Only play on non-functional clicks (not buttons, links, inputs, or interactive elements)
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
                            // Skip music for functional elements
                            return;
                        }
                        
                        audio.play().then(() => {
                            console.log('🎵 Welcome music playing after user interaction');
                            localStorage.setItem('welcomeMusicPlayedEver', 'true');
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('touchstart', playOnInteraction);
                        }).catch(() => {});
                    };
                    
                    document.addEventListener('click', playOnInteraction);
                    document.addEventListener('touchstart', playOnInteraction);
                    
                    // Store cleanup function
                    cleanupListeners = () => {
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                    };
                });
        }

        // Cleanup function to remove event listeners when component unmounts
        return () => {
            if (cleanupListeners) {
                cleanupListeners();
            }
        };
        
        // 🔧 FIX: Initialize Appwrite SDK and make it globally available
        const initializeAppwriteSession = async () => {
            try {
                // Check if Appwrite is already loaded from CDN
                if (!(window as any).Appwrite) {
                    console.log('📦 CDN failed, loading Appwrite from npm...');
                    // Import and expose Appwrite globally as fallback
                    const appwriteModule = await import('appwrite');
                    (window as any).Appwrite = appwriteModule;
                    console.log('✅ Appwrite SDK loaded from npm:', Object.keys(appwriteModule));
                } else {
                    console.log('✅ Appwrite SDK already available from CDN');
                }
                
                const { account } = await import('./lib/appwrite');
                const { sessionCache } = await import('./lib/sessionCache');
                
                // Check cache first to avoid repeated 401 errors
                const cached = sessionCache.get();
                if (cached) {
                    if (cached.hasSession) {
                        console.log('✅ Session active (cached):', cached.user?.email);
                    }
                    return;
                }
                
                // Check for existing authenticated session only
                // Anonymous sessions are disabled to prevent 401/501 error loops
                try {
                    const currentUser = await Promise.race([
                        account.get(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                    ]) as any;
                    
                    sessionCache.set(true, currentUser);
                    console.log('✅ Session already active:', currentUser.email);
                } catch (sessionError: any) {
                    // No session - cache this result to prevent repeated 401s
                    sessionCache.setNoSession();
                    // Suppress 401 console noise - this is expected when not logged in
                    if (sessionError?.code !== 401 && sessionError?.message !== 'timeout') {
                        console.log('ℹ️ Session check:', sessionError.message || 'No active session');
                    }
                }
            } catch (error: any) {
                // Session might already exist, which is fine
                if (!error.message?.includes('already exists')) {
                    console.log('Session initialization:', error.message);
                }
            }
        };

        initializeAppwriteSession();
        bookingExpirationService.start();
        
        // Initialize push notifications for lock-screen alerts
        pushNotifications.initialize().catch(err => {
            console.log('Push notification initialization:', err.message);
        });
        
        return () => {
            bookingExpirationService.stop();
        };
    }, []);

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

    // All hooks combined - ALWAYS call this hook at the same point
    const hooks = useAllHooks();
    const { state, navigation, authHandlers, providerAgentHandlers, derived } = hooks;
    
    // Use the actual language from hooks, not hardcoded
    const { language, setLanguage } = state;
    
    // Log current language state
    console.log('🌐 App.tsx: Current language state:', language);
    
    // Get translations using the actual language state - provide to AppRouter
    const { t: _t, dict } = useTranslations(language);
    
    // Log loaded translations
    console.log('🌐 App.tsx: Loaded translations for language:', language);

    console.log('📄 App.tsx: Current page state:', state.page);

    // Detect direct path navigation for accept-booking links and switch to that page
    useEffect(() => {
        try {
            const path = window.location.pathname || '';
            if (path.startsWith('/accept-booking/')) {
                state.setPage('accept-booking');
            }
        } catch (e) {
            console.warn('Path detection failed:', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Navigate to deep-linked profile once data is available (requires state)
    useEffect(() => {
        try {
            const pending = sessionStorage.getItem('pending_deeplink');
            if (!pending) return;
            const { provider } = JSON.parse(pending) as { provider: string };
            if (!provider) return;
            const [ptype, pidRaw] = provider.split('-');
            const idStr = (pidRaw || '').toString();
            if (ptype === 'therapist' && state.therapists && state.therapists.length) {
                const found = state.therapists.find((th: any) => ((th.id ?? th.$id ?? '').toString() === idStr));
                if (found) {
                    state.setSelectedTherapist(found);
                    state.setPage('therapistProfile');
                    sessionStorage.removeItem('pending_deeplink');
                }
            } else if (ptype === 'place' && state.places && state.places.length) {
                const found = state.places.find((pl: any) => ((pl.id ?? pl.$id ?? '').toString() === idStr));
                if (found) {
                    state.setSelectedPlace(found);
                    state.setPage('massagePlaceProfile');
                    sessionStorage.removeItem('pending_deeplink');
                }
            }
        } catch (e) {
            console.warn('Deeplink navigation failed:', e);
        }
    }, [state.therapists, state.places]);

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

    // Global booking popup handler - can be called from anywhere
    const handleOpenBookingPopup = (
        providerName: string, 
        whatsappNumber?: string,
        providerId?: string,
        providerType?: 'therapist' | 'place',
        hotelVillaId?: string,
        hotelVillaName?: string,
        hotelVillaType?: 'hotel' | 'villa',
        profilePicture?: string,
        hotelVillaLocation?: string,
        pricing?: { [key: string]: number },
        discountPercentage?: number,
        discountActive?: boolean
    ) => {
        console.log('📱 Opening booking popup for:', {
            providerName,
            providerId,
            providerType,
            profilePicture,
            hotelVillaId,
            hotelVillaName,
            hotelVillaType,
            hotelVillaLocation
        });
        setBookingProviderInfo({
            name: providerName,
            whatsappNumber: whatsappNumber || '1234567890', // Default number
            providerId: providerId || '',
            providerType: providerType || 'therapist',
            profilePicture,
            hotelVillaId,
            hotelVillaName,
            hotelVillaType,
            hotelVillaLocation,
            pricing,
            discountPercentage,
            discountActive
        });
        setIsBookingPopupOpen(true);
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
    };

    // Global schedule booking handler
    const handleOpenScheduleBookingPopup = (bookingInfo: {
        therapistId: string;
        therapistName: string;
        therapistType: 'therapist' | 'place';
        profilePicture?: string;
        hotelVillaId?: string;
        hotelVillaName?: string;
        hotelVillaType?: 'hotel' | 'villa';
        hotelVillaLocation?: string;
        pricing?: { [key: string]: number }; // Pricing object (e.g., {"60": 250, "90": 350, "120": 450})
        discountPercentage?: number; // Discount percentage if applicable
        discountActive?: boolean; // Whether discount is currently active
    }) => {
        console.log('📅 Opening schedule booking popup:', bookingInfo);
        setScheduleBookingInfo(bookingInfo);
        setIsScheduleBookingOpen(true);
    };

    // Register global booking functions in useEffect to ensure they're available
    useEffect(() => {
        console.log('📱 Registering global booking functions...');
        (window as any).openBookingPopup = handleOpenBookingPopup;
        (window as any).openBookingStatusTracker = handleOpenBookingStatusTracker;
        (window as any).openScheduleBookingPopup = handleOpenScheduleBookingPopup;
        
        return () => {
            // Cleanup on unmount
            delete (window as any).openBookingPopup;
            delete (window as any).openBookingStatusTracker;
            delete (window as any).openScheduleBookingPopup;
        };
    }, []);

    const handleFindNewTherapist = () => {
        setIsStatusTrackerOpen(false);
        // Optionally navigate back to therapist list
        state.setPage('home');
    };

    return (
        <LanguageProvider value={{ language: language as 'en' | 'id', setLanguage: (l: 'en' | 'id' | 'gb') => { void handleLanguageSelect(l); } }}>
        <DeviceStylesProvider>
            <AppLayout
                isFullScreen={state.page === 'landing' || state.isFullScreen}
            >
            {/* Global Header only in PWA standalone and when page lacks its own header */}
            <GlobalHeader page={state.page} />
            <div className={state.isFullScreen ? "flex-grow" : "flex-1"}>
                <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
                <AppRouter
                    page={state.page}
                    isLoading={state.isLoading}

                    loggedInProvider={state.loggedInProvider}
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
                    // Pass the global loggedInUser (role-aware) to satisfy dashboard guards
                    user={state.loggedInUser as any}
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
                    handleIncrementAnalytics={() => Promise.resolve()}
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


                    setPage={state.setPage}
                    setLoggedInProvider={state.setLoggedInProvider}
                    setLoggedInCustomer={state.setLoggedInCustomer}



                    setSelectedJobId={() => {}}
                />
                </Suspense>
            </div>

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
            {/* Global Booking Popup */}
            <BookingPopup
                isOpen={isBookingPopupOpen}
                onClose={() => setIsBookingPopupOpen(false)}
                therapistId={bookingProviderInfo?.providerId || ''}
                therapistName={bookingProviderInfo?.name || ''}
                profilePicture={bookingProviderInfo?.profilePicture}
                providerType={bookingProviderInfo?.providerType}
                hotelVillaId={bookingProviderInfo?.hotelVillaId}
                hotelVillaName={bookingProviderInfo?.hotelVillaName}
                hotelVillaType={bookingProviderInfo?.hotelVillaType}
                hotelVillaLocation={bookingProviderInfo?.hotelVillaLocation}
                pricing={bookingProviderInfo?.pricing}
                discountPercentage={bookingProviderInfo?.discountPercentage}
                discountActive={bookingProviderInfo?.discountActive}
            />

            {/* Global Booking Status Tracker */}
            <BookingStatusTracker
                isOpen={isStatusTrackerOpen}
                onClose={() => setIsStatusTrackerOpen(false)}
                bookingId={bookingStatusInfo?.bookingId || ''}
                therapistName={bookingStatusInfo?.therapistName || ''}
                duration={bookingStatusInfo?.duration || 60}
                price={bookingStatusInfo?.price || 0}
                responseDeadline={bookingStatusInfo?.responseDeadline || new Date()}
                onFindNewTherapist={handleFindNewTherapist}
            />

            {/* Global Schedule Booking Popup */}
            <ScheduleBookingPopup
                isOpen={isScheduleBookingOpen}
                onClose={() => setIsScheduleBookingOpen(false)}
                therapistId={scheduleBookingInfo?.therapistId || ''}
                therapistName={scheduleBookingInfo?.therapistName || ''}
                therapistType={scheduleBookingInfo?.therapistType || 'therapist'}
                profilePicture={scheduleBookingInfo?.profilePicture}
                hotelVillaId={scheduleBookingInfo?.hotelVillaId}
                hotelVillaName={scheduleBookingInfo?.hotelVillaName}
                hotelVillaType={scheduleBookingInfo?.hotelVillaType}
                pricing={scheduleBookingInfo?.pricing}
                discountPercentage={scheduleBookingInfo?.discountPercentage}
                discountActive={scheduleBookingInfo?.discountActive}
            />

            {/* Global Chat Window - Opens with registration flow */}
            {(() => {
                console.log('🔍 App.tsx render check - chatInfo:', chatInfo, 'isChatOpen:', isChatOpen);
                
                const handleCloseChat = async () => {
                    try {
                        // Close persistent session if it exists
                        if (chatInfo && 'sessionId' in chatInfo) {
                            await chatSessionService.closeSession(chatInfo.sessionId as string);
                            console.log('✅ Persistent chat session closed');
                        }
                    } catch (error) {
                        console.warn('Failed to close persistent chat session:', error);
                        // Continue with local cleanup even if Appwrite fails
                    }
                    
                    // Always close local chat
                    setChatInfo(null);
                    setIsChatOpen(false);
                };
                
                return chatInfo && (
                    <ChatErrorBoundary
                        onError={(error, errorInfo) => {
                            console.error('🚨 ChatWindow crashed:', error);
                            console.error('Error context:', errorInfo);
                            // Could also send to error tracking service
                        }}
                    >
                        <ChatWindow
                            isOpen={isChatOpen}
                            onClose={handleCloseChat}
                            providerId={chatInfo.therapistId}
                            providerRole={chatInfo.therapistType}
                            providerName={chatInfo.therapistName}
                            providerStatus={chatInfo.therapistStatus || 'available'}
                            pricing={chatInfo.pricing as { '60': number; '90': number; '120': number } | undefined}
                            discountPercentage={chatInfo.discountPercentage}
                            discountActive={chatInfo.discountActive}
                            providerPhoto={chatInfo.profilePicture}
                            providerRating={chatInfo.providerRating}
                            bookingId={chatInfo.bookingId}
                            chatRoomId={chatInfo.chatRoomId}
                            customerName={chatInfo.customerName}
                            customerWhatsApp={chatInfo.customerWhatsApp}
                            mode={chatInfo.mode}
                        />
                    </ChatErrorBoundary>
                );
            })()}
        </DeviceStylesProvider>
        </LanguageProvider>
    );
};

export default App;