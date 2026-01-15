// State management hooks and utilities for the main App component
import { useState } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage, ChatRoom } from '../types';
import type { Page, Language, LoggedInProvider, LoggedInUser } from '../types/pageTypes';

// localStorage disabled - using Appwrite storage only
const getFromLocalStorage = (_key: string, defaultValue: any = null) => {
  return defaultValue; // No-op: localStorage disabled
};

const setToLocalStorage = (_key: string, _value: any) => {
  // No-op: localStorage disabled
};

const saveToLocalStorage = (_key: string, _value: any) => {
  // No-op: localStorage disabled
};

export const useAppState = () => {
  // Check URL parameters for page navigation (useful for testing)
  const getInitialPage = (): Page => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');

      // Handle shared profile deep links
      const pathname = window.location.pathname;
      
      // Handle mobile terms and conditions page FIRST (before any session logic)
      if (pathname === '/mobile-terms-and-conditions') {
        console.log('📄 Mobile terms page detected:', pathname);
        return 'mobile-terms-and-conditions';
      }
      
      // Handle share URLs - both SEO format and simple format
      if (pathname.startsWith('/share/')) {
        const segments = pathname.split('/').filter(Boolean);
        // segments will be: ['share', 'pijat-yogyakarta-wiwid', '123'] OR ['share', 'therapist', '123']
        
        if (segments.length >= 3) {
          // SEO format: /share/{slug}/{id} - default to therapist
          console.log('🔗 SEO SHARE URL DETECTED:', pathname);
          return 'share-therapist';
        } else if (segments[1] === 'therapist') {
          console.log('🔗 EXPLICIT THERAPIST SHARE URL');
          return 'share-therapist';
        } else if (segments[1] === 'place') {
          console.log('🔗 EXPLICIT PLACE SHARE URL');
          return 'share-place';
        } else if (segments[1] === 'facial') {
          console.log('🔗 EXPLICIT FACIAL SHARE URL');
          return 'share-facial';
        } else {
          // Short URL format: /share/12345
          console.log('🔗 SHORT SHARE URL DETECTED:', pathname);
          return 'share-therapist'; // Default to therapist for short links
        }
      }
      
      // ✅ NEW: Customer-facing therapist profile URL: /profile/therapist/:id-slug
      if (pathname.startsWith('/profile/therapist/')) {
        console.log('🎯 CUSTOMER THERAPIST PROFILE URL DETECTED:', pathname);
        return 'therapist-profile';
      }
      
      // ✅ NEW: Customer-facing place profile URL: /profile/place/:id-slug
      if (pathname.startsWith('/profile/place/')) {
        console.log('🎯 CUSTOMER PLACE PROFILE URL DETECTED:', pathname);
        return 'massage-place-profile';
      }
      
      // Legacy therapist profile URL
      if (pathname.startsWith('/therapist-profile/')) {
        const parts = pathname.split('/').filter(Boolean);
        const slugPart = parts[1] || '';
        const therapistId = slugPart.split('-')[0];
        if (therapistId) {
          sessionStorage.setItem('pending_deeplink', JSON.stringify({ provider: `therapist-${therapistId}` , targetPage: 'shared-therapist-profile' }));
        }
        return 'shared-therapist-profile';
      }
      
      // Check for hotel/villa menu URL pattern: /hotel/:id/menu or /villa/:id/menu
      const hotelMenuMatch = pathname.match(/\/hotel\/([^/]+)\/menu/);
      const villaMenuMatch = pathname.match(/\/villa\/([^/]+)\/menu/);
      
      if (hotelMenuMatch || villaMenuMatch) {
        console.log('🏨 Hotel/Villa menu URL detected:', pathname);
        return 'hotelVillaMenu';
      }
      
      // 🔧 DISABLED: Provider auto-login to prevent confusion with customer landing page
      // Providers should manually log in via their respective login pages
      // This ensures customers always see the landing page first
      // const storedProvider = getFromLocalStorage('app_logged_in_provider');
      // if (storedProvider && storedProvider.type === 'place') {
      //   console.log('✅ Found logged in place provider, restoring placeDashboard:', storedProvider.id);
      //   return 'placeDashboard';
      // }
      // if (storedProvider && storedProvider.type === 'therapist') {
      //   console.log('✅ Found logged in therapist, restoring therapistPortal:', storedProvider.id);
      //   return 'therapistPortal';
      // }
      
      // Restore last page from session if available
      const sessionPage = sessionStorage.getItem('current_page') as Page | null;
      
      // 🔧 FIX: Only clear session for ROOT PATH loads, NOT for deep links
      // Deep links like /profile/therapist/:id must be respected
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const isPageReload = navigation?.type === 'reload' || navigation?.type === 'navigate';
      const isRootPath = pathname === '/' || pathname === '' || pathname === '/home';
      
      if (isPageReload && !pageParam && isRootPath) {
        console.log('🔄 Fresh ROOT page load detected - clearing session to show landing page');
        sessionStorage.removeItem('has_entered_app');
        sessionStorage.removeItem('current_page');
        sessionStorage.removeItem('reviewParams'); // Clear any stored review params
      } else if (sessionPage && typeof sessionPage === 'string' && isRootPath && sessionPage !== 'reviews') {
        // CRITICAL FIX: Don't restore 'reviews' page on root path - always default to landing/home flow
        console.log('↩️ Restoring session page:', sessionPage);
        return sessionPage as Page;
      } else if (sessionPage === 'reviews' && isRootPath) {
        console.log('🚫 Blocking reviews page restoration on root path - using default flow');
        sessionStorage.removeItem('current_page');
        sessionStorage.removeItem('reviewParams');
      }
      
      // If user has already entered the app in this session, go to home
      const hasEntered = sessionStorage.getItem('has_entered_app');
      if (hasEntered === 'true' && isRootPath) {
        console.log('🚪 Session indicates app already entered → home');
        return 'home';
      }
      
      // Allow specific pages via URL parameter
      if (pageParam === 'company-profile') {
        console.log('🎯 URL parameter detected: Opening Company Profile page');
        return 'company-profile' as Page;
      }
      if (pageParam === 'rewardBannersTest' || pageParam === 'reward-banners-test') {
        console.log('🎯 URL parameter detected: Opening reward banners test page');
        return 'rewardBannersTest';
      }
      if (pageParam === 'hotelVillaMenu') {
        console.log('🎯 URL parameter detected: Opening Hotel/Villa Menu');
        return 'hotelVillaMenu';
      }

      // Default: always start at landing on fresh app arrival
      console.log('🚪 Fresh arrival: starting at landing page');
      return 'landing';
    } catch {
      console.log('⚠️ URL parameter parsing failed, defaulting to landing page');
      return 'landing';
    }
  };

  // Core user state - with localStorage persistence
  const [user, _setUser] = useState<User | null>(() => getFromLocalStorage('app_user'));
  const setUser = (newUser: User | null) => {
    _setUser(newUser);
    setToLocalStorage('app_user', newUser);
  };

  // Use a ref to prevent re-initialization on component re-renders
  const [page, _setPage] = useState<Page>(() => {
    // Always compute initial page from URL context; do not restore last page
    const initialPage = getInitialPage();
    console.log('🚀 MOUNTING: Fresh initialization:', initialPage);
    return initialPage;
  });
  
  const setPage = (newPage: Page) => {
    console.log('📍 Page change request:', newPage, '(from:', page, ')');
    
    // Prevent overriding mobile terms page once it's loaded (except for intentional navigation)
    if (page === 'mobile-terms-and-conditions' && 
        newPage !== 'mobile-terms-and-conditions' && 
        !['landing', 'home', 'share-therapist'].includes(newPage)) {
      console.log('🔒 Blocking unwanted page change from mobile-terms - staying on terms page');
      return;
    }
    
    // Prevent unnecessary state updates
    if (page === newPage) {
      console.log('📍 Page already set to:', newPage, '- skipping update');
      return;
    }
    
    _setPage(newPage);
    console.log('📍 Page state updated to:', newPage);
    
    // Store current page for session persistence
    if (newPage !== 'landing') {
      sessionStorage.setItem('current_page', newPage);
      console.log('📍 Session page stored:', newPage);
    } else {
      sessionStorage.removeItem('current_page');
      console.log('📍 Session page cleared (back to landing)');
    }
  };
  
  // Location and preferences - with localStorage persistence
  const [selectedPlace, _setSelectedPlace] = useState<Place | null>(() => getFromLocalStorage('app_selected_place'));
  const setSelectedPlace = (place: Place | null) => {
    _setSelectedPlace(place);
    setToLocalStorage('app_selected_place', place);
  };

  const [language, _setLanguage] = useState<Language>(() => {
    // Try to get from localStorage first, then sessionStorage as fallback
    try {
      let stored = window.localStorage.getItem('app_language');
      let storageType = 'localStorage';
      
      // Fallback to sessionStorage if localStorage is empty/blocked
      if (!stored || stored === 'null' || stored === 'undefined') {
        stored = window.sessionStorage.getItem('app_language');
        storageType = 'sessionStorage';
      }
      
      console.log(`🌐 useAppState: Raw ${storageType} value:`, stored);
      
      if (!stored || stored === 'null' || stored === 'undefined') {
        // First visit or invalid value - set Indonesian as default
        console.log('🌐 useAppState: No valid language stored - setting Indonesian as default');
        try {
          window.localStorage.setItem('app_language', 'id');
          console.log('🌐 useAppState: ✅ Indonesian saved to localStorage');
        } catch (e) {
          window.sessionStorage.setItem('app_language', 'id');
          console.log('🌐 useAppState: ✅ Indonesian saved to sessionStorage (localStorage blocked)');
        }
        return 'id';
      }
      
      // Normalize: gb -> en, otherwise keep as-is if valid
      let storedLang: Language = stored === 'gb' ? 'en' : (stored as Language);
      
      // If stored value is not valid, default to Indonesian
      if (storedLang !== 'en' && storedLang !== 'id' && storedLang !== 'gb') {
        console.log('🌐 useAppState: Invalid language value, defaulting to Indonesian');
        storedLang = 'id';
        try {
          window.localStorage.setItem('app_language', 'id');
        } catch (e) {
          window.sessionStorage.setItem('app_language', 'id');
        }
      }
      
      console.log(`🌐 useAppState: Initial language from ${storageType}:`, storedLang);
      return storedLang;
    } catch (error) {
      console.error('🌐 useAppState: Storage error:', error);
      console.log('🌐 useAppState: Defaulting to Indonesian due to error');
      return 'id';
    }
  });
  const setLanguage = (lang: Language) => {
    const timestamp = new Date().toISOString();
    console.log(`🌐 useAppState [${timestamp}]: setLanguage called with:`, lang);
    console.log(`🌐 useAppState [${timestamp}]: Current language before change:`, language);
    console.log(`🌐 useAppState [${timestamp}]: Stack trace:`, new Error().stack);
    
    // Normalize gb -> en before saving
    const normalizedLang = lang === 'gb' ? 'en' : lang;
    console.log(`🌐 useAppState [${timestamp}]: Normalized language:`, normalizedLang);
    
    _setLanguage(normalizedLang);
    
    // Multi-layer persistence: try localStorage, sessionStorage, and in-memory fallback
    let saved = false;
    
    // Try localStorage
    try {
      window.localStorage.setItem('app_language', normalizedLang);
      const verified = window.localStorage.getItem('app_language');
      console.log(`🌐 useAppState [${timestamp}]: localStorage save attempt - verified:`, verified);
      
      if (verified === normalizedLang) {
        saved = true;
        console.log(`🌐 useAppState [${timestamp}]: ✅ Language saved to localStorage successfully`);
      }
    } catch (error) {
      console.error(`🌐 useAppState [${timestamp}]: localStorage failed:`, error);
    }
    
    // Fallback to sessionStorage if localStorage failed
    if (!saved) {
      try {
        window.sessionStorage.setItem('app_language', normalizedLang);
        const verified = window.sessionStorage.getItem('app_language');
        if (verified === normalizedLang) {
          saved = true;
          console.log(`🌐 useAppState [${timestamp}]: ✅ Language saved to sessionStorage (localStorage unavailable)`);
        }
      } catch (error) {
        console.error(`🌐 useAppState [${timestamp}]: sessionStorage also failed:`, error);
      }
    }
    
    if (!saved) {
      console.error(`🌐 useAppState [${timestamp}]: ⚠️ CRITICAL: All storage methods failed! Language will reset on refresh.`);
    }
    
    console.log(`🌐 useAppState [${timestamp}]: Language state updated to:`, normalizedLang);
  };

  const [userLocation, _setUserLocation] = useState<UserLocation | null>(() => getFromLocalStorage('app_user_location'));
  const setUserLocation = (location: UserLocation | null) => {
    _setUserLocation(location);
    setToLocalStorage('app_user_location', location);
  };

  const [selectedMassageType, _setSelectedMassageType] = useState<string>(() => getFromLocalStorage('app_selected_massage_type', 'all'));
  const setSelectedMassageType = (type: string) => {
    _setSelectedMassageType(type);
    setToLocalStorage('app_selected_massage_type', type);
  };
  
  // Admin state - with localStorage persistence
  const [isAdminLoggedIn, _setIsAdminLoggedIn] = useState<boolean>(() => getFromLocalStorage('app_is_admin_logged_in', false));
  const setIsAdminLoggedIn = (value: boolean) => {
    _setIsAdminLoggedIn(value);
    setToLocalStorage('app_is_admin_logged_in', value);
  };

  const [loggedInUser, _setLoggedInUser] = useState<LoggedInUser | null>(() => getFromLocalStorage('app_logged_in_user'));
  const setLoggedInUser = (user: LoggedInUser | null) => {
    _setLoggedInUser(user);
    setToLocalStorage('app_logged_in_user', user);
  };
  
  // Customer state - with localStorage persistence
  const [loggedInCustomer, _setLoggedInCustomer] = useState<any | null>(() => getFromLocalStorage('app_logged_in_customer'));
  const setLoggedInCustomer = (customer: any | null) => {
    _setLoggedInCustomer(customer);
    setToLocalStorage('app_logged_in_customer', customer);
  };

  const [loyaltyEvent, setLoyaltyEvent] = useState<any | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [registerPromptContext, setRegisterPromptContext] = useState<'booking' | 'chat'>('booking');
  
  // Chat state
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [isChatWindowVisible, setIsChatWindowVisible] = useState(false);
  
  // Pending booking state - prevents multiple simultaneous bookings
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingBookingTherapistId, setPendingBookingTherapistId] = useState<string | null>(null);
  const [pendingBookingDeadline, setPendingBookingDeadline] = useState<Date | null>(null);
  const [isBookingLocked, setIsBookingLocked] = useState(false);
  
  // Data state
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  
  // Enhanced setTherapists to cache data for shared profiles
  const setTherapistsWithCache = (newTherapists: Therapist[]) => {
    setTherapists(newTherapists);
    // Cache therapists globally for SharedTherapistProfile to use
    if (typeof window !== 'undefined') {
      (window as any).__THERAPISTS_CACHE = newTherapists;
    }
  };
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [facialPlaces, setFacialPlaces] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allAdminTherapists, setAllAdminTherapists] = useState<Therapist[]>([]);
  const [allAdminPlaces, setAllAdminPlaces] = useState<Place[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  
  // Provider state - with localStorage persistence
  const [loggedInProvider, _setLoggedInProvider] = useState<LoggedInProvider | null>(() => getFromLocalStorage('app_logged_in_provider'));
  const setLoggedInProvider = (provider: LoggedInProvider | null) => {
    _setLoggedInProvider(provider);
    setToLocalStorage('app_logged_in_provider', provider);
  };

  const [providerAuthInfo, setProviderAuthInfo] = useState<{ type: 'therapist' | 'place', mode: 'login' | 'register' } | null>(null);
  const [providerForBooking, setProviderForBooking] = useState<{ provider: Therapist | Place; type: 'therapist' | 'place' } | null>(null);
  
  // Agent state - with localStorage persistence
  const [loggedInAgent, _setLoggedInAgent] = useState<Agent | null>(() => getFromLocalStorage('app_logged_in_agent'));
  const setLoggedInAgent = (agent: Agent | null) => {
    _setLoggedInAgent(agent);
    setToLocalStorage('app_logged_in_agent', agent);
  };

  const [impersonatedAgent, _setImpersonatedAgent] = useState<Agent | null>(() => getFromLocalStorage('app_impersonated_agent'));
  const setImpersonatedAgent = (agent: Agent | null) => {
    _setImpersonatedAgent(agent);
    setToLocalStorage('app_impersonated_agent', agent);
  };

  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  
  // Hotel/Villa state - with localStorage persistence
  const [isHotelLoggedIn, _setIsHotelLoggedIn] = useState(() => getFromLocalStorage('app_hotel_logged_in', false));
  const setIsHotelLoggedIn = (status: boolean) => {
    _setIsHotelLoggedIn(status);
    setToLocalStorage('app_hotel_logged_in', status);
  };

  const [isVillaLoggedIn, _setIsVillaLoggedIn] = useState(() => getFromLocalStorage('app_villa_logged_in', false));
  const setIsVillaLoggedIn = (status: boolean) => {
    _setIsVillaLoggedIn(status);
    setToLocalStorage('app_villa_logged_in', status);
  };
  // Extract venue ID from URL for hotel/villa menu
  const getInitialVenueId = (): string => {
    try {
      const search = new URLSearchParams(window.location.search);
      const fromQuery = search.get('venueId');
      if (fromQuery) {
        console.log('🏷️ Venue ID extracted from query:', fromQuery);
        return fromQuery;
      }
      const pathname = window.location.pathname;
      const hotelMenuMatch = pathname.match(/\/hotel\/([^/]+)\/menu/);
      const villaMenuMatch = pathname.match(/\/villa\/([^/]+)\/menu/);
      
      if (hotelMenuMatch) {
        console.log('🏨 Hotel ID extracted from URL:', hotelMenuMatch[1]);
        return hotelMenuMatch[1];
      }
      
      if (villaMenuMatch) {
        console.log('🏡 Villa ID extracted from URL:', villaMenuMatch[1]);
        return villaMenuMatch[1];
      }
      
      return '';
    } catch {
      console.log('⚠️ Venue ID extraction failed');
      return '';
    }
  };

  const [venueMenuId, setVenueMenuId] = useState<string>(getInitialVenueId());
  const [jobPostingId, setJobPostingId] = useState<string>('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  return {
    // User
    user, setUser,
    page, setPage,
    
    // Location & preferences
    selectedPlace, setSelectedPlace,
    language, setLanguage,
    userLocation, setUserLocation,
    selectedMassageType, setSelectedMassageType,
    
    // Admin
    isAdminLoggedIn, setIsAdminLoggedIn,
    loggedInUser, setLoggedInUser,
    
    // Customer
    loggedInCustomer, setLoggedInCustomer,
    loyaltyEvent, setLoyaltyEvent,
    showRegisterPrompt, setShowRegisterPrompt,
    registerPromptContext, setRegisterPromptContext,
    
    // Chat
    activeChatRoom, setActiveChatRoom,
    chatBooking, setChatBooking,
    isChatWindowVisible, setIsChatWindowVisible,
    
    // Pending booking lock
    pendingBookingId, setPendingBookingId,
    pendingBookingTherapistId, setPendingBookingTherapistId,
    pendingBookingDeadline, setPendingBookingDeadline,
    isBookingLocked, setIsBookingLocked,
    
    // Data
    therapists, setTherapists: setTherapistsWithCache,
    places, setPlaces,
    facialPlaces, setFacialPlaces,
    hotels, setHotels,
    bookings, setBookings,
    notifications, setNotifications,
    allAdminTherapists, setAllAdminTherapists,
    allAdminPlaces, setAllAdminPlaces,
    selectedTherapist, setSelectedTherapist,
    
    // Provider
    loggedInProvider, setLoggedInProvider,
    providerAuthInfo, setProviderAuthInfo,
    providerForBooking, setProviderForBooking,
    
    // Agent
    loggedInAgent, setLoggedInAgent,
    impersonatedAgent, setImpersonatedAgent,
    adminMessages, setAdminMessages,
    
    // Hotel/Villa
    isHotelLoggedIn, setIsHotelLoggedIn,
    isVillaLoggedIn, setIsVillaLoggedIn,
    venueMenuId, setVenueMenuId,
    jobPostingId, setJobPostingId,
    
    // UI
    isLoading, setIsLoading,
    isFullScreen, setIsFullScreen
  };
};