import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { logger } from '../utils/logger';
import type { Place, Therapist, Booking, Notification, AdminMessage, UserLocation, ChatRoom } from '../types';

type Language = 'en' | 'id';

interface AppStateContextType {
    // Navigation
    page: string;
    setPage: (page: string) => void;
    
    // Language
    language: Language;
    setLanguage: (lang: Language) => void;
    
    // Selected items
    selectedPlace: Place | null;
    setSelectedPlace: (place: Place | null) => void;
    
    selectedMassageType: string;
    setSelectedMassageType: (type: string) => void;
    
    // Location
    userLocation: UserLocation | null;
    setUserLocation: (location: UserLocation | null) => void;
    
    // Data
    therapists: Therapist[];
    setTherapists: (therapists: Therapist[]) => void;
    
    places: Place[];
    setPlaces: (places: Place[]) => void;
    
    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;
    
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    
    adminMessages: AdminMessage[];
    setAdminMessages: (messages: AdminMessage[]) => void;
    
    // UI State
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    
    // Booking/Provider state
    providerForBooking: { provider: Therapist | Place; type: 'therapist' | 'place' } | null;
    setProviderForBooking: (provider: { provider: Therapist | Place; type: 'therapist' | 'place' } | null) => void;
    
    // Job posting
    jobPostingId: string;
    setJobPostingId: (id: string) => void;
    
    // Venue menu
    venueMenuId: string;
    setVenueMenuId: (id: string) => void;
    
    // Loyalty/Rewards
    loyaltyEvent: any | null;
    setLoyaltyEvent: (event: any | null) => void;
    
    // Registration prompts
    showRegisterPrompt: boolean;
    setShowRegisterPrompt: (show: boolean) => void;
    
    registerPromptContext: 'booking' | 'chat';
    setRegisterPromptContext: (context: 'booking' | 'chat') => void;
    
    // Chat
    activeChatRoom: ChatRoom | null;
    setActiveChatRoom: (room: ChatRoom | null) => void;
    
    chatBooking: Booking | null;
    setChatBooking: (booking: Booking | null) => void;
    
    isChatWindowVisible: boolean;
    setIsChatWindowVisible: (visible: boolean) => void;
    
    // Config
    appContactNumber: string;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within AppStateProvider');
    }
    return context;
};

interface AppStateProviderProps {
    children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
    // Initialize page from URL hash or default to 'landing'
    const getInitialPage = () => {
        const hash = window.location.hash.replace('#', '');
        if (!hash || hash === 'landing') {
            return 'landing';
        }
        
        // Handle dynamic routes - convert URL patterns to page names
        if (hash.startsWith('/therapist-profile/')) {
            logger.debug('🔗 Initial URL detected: therapist profile ->', hash);
            return 'shared-therapist-profile';
        } else if (hash.startsWith('/share/therapist/') || hash.startsWith('/shared/therapist')) {
            logger.debug('🔗 Initial URL detected: share therapist ->', hash);
            return 'shared-therapist-profile';
        } else if (hash.startsWith('/profile/therapist/')) {
            logger.debug('🔗 Initial URL detected: authenticated therapist profile ->', hash);
            return 'therapist-profile';
        } else if (hash.startsWith('/profile/place/')) {
            logger.debug('🔗 Initial URL detected: place profile ->', hash);
            return 'massage-place-profile';
        } else if (hash.startsWith('/profile/facial/')) {
            logger.debug('🔗 Initial URL detected: facial place profile ->', hash);
            return 'facial-place-profile';
        } else if (hash.startsWith('/share/place/')) {
            logger.debug('🔗 Initial URL detected: share place ->', hash);
            return 'share-place';
        } else if (hash.startsWith('/share/facial/')) {
            logger.debug('🔗 Initial URL detected: share facial ->', hash);
            return 'share-facial';
        } else if (hash.startsWith('/accept-booking/')) {
            logger.debug('🔗 Initial URL detected: accept booking ->', hash);
            return 'accept-booking';
        } else if (hash.startsWith('/decline-booking/')) {
            logger.debug('🔗 Initial URL detected: decline booking ->', hash);
            return 'decline-booking';
        }
        
        logger.debug('🔗 Initializing page from URL hash:', hash);
        return hash;
    };
    
    const [page, _setPage] = useState<string>(getInitialPage());
    const [language, _setLanguage] = useState<Language>(() => {
        // Check localStorage for saved language, default to Indonesian
        try {
            const stored = localStorage.getItem('app_language');
            if (stored === 'en' || stored === 'id') return stored as Language;
        } catch {}
        return 'id'; // Default to Indonesian
    });

    // Wrapper for setLanguage to persist to localStorage
    const setLanguage = useCallback((newLanguage: Language) => {
        logger.debug('🌐 Language changing from', language, 'to', newLanguage);
        _setLanguage(newLanguage);
        try {
            localStorage.setItem('app_language', newLanguage);
            logger.debug('✅ Language saved to localStorage:', newLanguage);
        } catch (error) {
            logger.error('❌ Failed to save language to localStorage:', error);
        }
    }, [language]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [selectedMassageType, setSelectedMassageType] = useState<string>('all');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false); // P0 FIX: Start false to prevent blocking landing page
    const [adminDashboardTab, setAdminDashboardTab] = useState<string>('platform-analytics');
    const [providerForBooking, setProviderForBooking] = useState<{ provider: Therapist | Place; type: 'therapist' | 'place' } | null>(null);
    const [jobPostingId, setJobPostingId] = useState<string>('');
    const [venueMenuId, setVenueMenuId] = useState<string>('');
    const [loyaltyEvent, setLoyaltyEvent] = useState<any | null>(null);
    const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
    const [registerPromptContext, setRegisterPromptContext] = useState<'booking' | 'chat'>('booking');
    const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
    const [chatBooking, setChatBooking] = useState<Booking | null>(null);
    const [isChatWindowVisible, setIsChatWindowVisible] = useState(false);
    const appContactNumber = '6281392000050';

    // Wrapper to log all page changes and sync with URL hash
    const setPage = useCallback((newPage: string) => {
        logger.debug('📍 setPage called:', newPage, 'Current page:', page, 'Chat visible:', isChatWindowVisible);
        
        // 🔒 CRITICAL: Allow ALL page state changes during active booking flow
        // Don't block ANY navigation when user is in booking chat
        if (isChatWindowVisible) {
            logger.debug('📋 Chat window active - ALLOWING ALL navigation during booking (including landing)');
            _setPage(newPage);
            // Don't change URL hash during active booking
            return;
        }
        
        // ✅ FIXED: Allow landing page when explicitly requested (page refresh, direct URL)
        // Only prevent landing navigation from within the app after user entered
        const hasEntered = sessionStorage.getItem('has_entered_app');
        const isComingFromApp = page && page !== 'landing'; // User is navigating FROM another page
        
        if (newPage === 'landing' && hasEntered === 'true' && isComingFromApp) {
            logger.debug('🚫 Blocked navigation to landing - user navigating from within app');
            return;
        }
        
        if (newPage === 'landing') {
            logger.debug('🏠 Landing page allowed - direct access or explicit navigation');
        }
        
        // Prevent infinite loops by checking if we're already on that page
        if (newPage === page) {
            logger.debug('📍 Already on page:', newPage, 'skipping...');
            return;
        }
        
        logger.debug('📍 Updating page state to:', newPage);
        _setPage(newPage);
        
        // Pages that use path-based URLs (e.g. /therapist-profile/:id) - caller sets full URL
        // Don't overwrite hash or we lose the ID (fixes View Profile redirect bug)
        const pathBasedPages = [
            'shared-therapist-profile', 'therapist-profile', 'massage-place-profile',
            'share-place', 'share-facial', 'accept-booking', 'decline-booking',
        ];
        const isPathBasedPage = pathBasedPages.includes(newPage);
        
        // Sync page state with URL hash AFTER state update to prevent conflicts
        setTimeout(() => {
            if (newPage !== 'landing') {
                if (isPathBasedPage) {
                    // Preserve existing hash - caller (e.g. MassageJobsPage View Profile) already set correct URL
                    logger.debug('📍 Path-based page – preserving hash:', window.location.hash);
                } else {
                    logger.debug('📍 Setting hash to:', `#${newPage}`);
                    window.location.hash = `#${newPage}`;
                }
            } else {
                logger.debug('📍 Clearing hash for landing page');
                window.location.hash = '';
            }
        }, 0);
    }, [page, isChatWindowVisible]);

    // Check on mount if we should redirect from landing to home
    useEffect(() => {
        const hasEntered = sessionStorage.getItem('has_entered_app');
        const hash = window.location.hash.replace('#', '');
        
        // ✅ FIXED: Only auto-redirect if user navigated to landing AFTER entering app
        // Allow direct landing page access (empty hash or explicit #landing)
        if (page === 'landing' && hasEntered === 'true' && hash && hash !== 'landing') {
            logger.debug('🔄 Initial check: User already entered app, redirecting to home');
            window.location.hash = '#home';
            _setPage('home');
        } else {
            logger.debug('🏠 Landing page access allowed - direct navigation or first visit');
        }
    }, []); // Run only once on mount

    // Listen for hash changes to handle browser back/forward buttons
    useEffect(() => {
        const handleHashChange = () => {
            // 🔒 CRITICAL: Block hash changes during active booking to prevent redirect
            if (isChatWindowVisible) {
                logger.debug('🔒 Booking active - ignoring hash change to prevent interruption');
                return;
            }
            
            const hash = window.location.hash.replace('#', '');
            let newPage = hash || 'landing';
            
            // Handle dynamic routes - convert URL patterns to page names
            if (hash.startsWith('/therapist-profile/')) {
                newPage = 'shared-therapist-profile';
            } else if (hash.startsWith('/share/therapist/')) {
                newPage = 'shared-therapist-profile';
            } else if (hash.startsWith('/profile/therapist/')) {
                newPage = 'therapist-profile';
            } else if (hash.startsWith('/profile/place/')) {
                newPage = 'massage-place-profile';
            } else if (hash.startsWith('/profile/facial/')) {
                newPage = 'facial-place-profile';
            } else if (hash.startsWith('/share/place/')) {
                newPage = 'share-place';
            } else if (hash.startsWith('/share/facial/')) {
                newPage = 'share-facial';
            } else if (hash.startsWith('/accept-booking/')) {
                newPage = 'accept-booking';
            } else if (hash.startsWith('/decline-booking/')) {
                newPage = 'decline-booking';
            }
            
            logger.debug('🔗 Hash processing:', {
                originalHash: hash,
                resolvedPage: newPage,
                currentPage: page
            });
            
            // ✅ FIXED: Allow landing page access when explicitly requested (hash empty or #landing)
            // Only prevent landing when navigating from within the app
            const hasEntered = sessionStorage.getItem('has_entered_app');
            const isExplicitLandingRequest = hash === '' || hash === 'landing';
            
            if (newPage === 'landing' && hasEntered === 'true' && !isExplicitLandingRequest && page !== 'landing') {
                logger.debug('🚫 Prevented return to landing from internal navigation - forcing home');
                window.location.hash = '#home';
                _setPage('home');
                return;
            }
            
            if (isExplicitLandingRequest) {
                logger.debug('🏠 Landing page explicitly requested - allowing access');
            }
            
            if (newPage !== page) {
                logger.debug('🔗 Hash changed, updating page to:', newPage);
                _setPage(newPage);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [page, isChatWindowVisible]);

    const value: AppStateContextType = {
        page,
        setPage,
        language,
        setLanguage,
        selectedPlace,
        setSelectedPlace,
        selectedMassageType,
        setSelectedMassageType,
        userLocation,
        setUserLocation,
        therapists,
        setTherapists,
        places,
        setPlaces,
        bookings,
        setBookings,
        notifications,
        setNotifications,
        adminMessages,
        setAdminMessages,
        isLoading,
        setIsLoading,
        adminDashboardTab,
        setAdminDashboardTab,
        providerForBooking,
        setProviderForBooking,
        jobPostingId,
        setJobPostingId,
        venueMenuId,
        setVenueMenuId,
        loyaltyEvent,
        setLoyaltyEvent,
        showRegisterPrompt,
        setShowRegisterPrompt,
        registerPromptContext,
        setRegisterPromptContext,
        activeChatRoom,
        setActiveChatRoom,
        chatBooking,
        setChatBooking,
        isChatWindowVisible,
        setIsChatWindowVisible,
        appContactNumber
    };

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};
