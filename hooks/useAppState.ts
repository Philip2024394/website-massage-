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
      
      // Check for hotel/villa menu URL pattern: /hotel/:id/menu or /villa/:id/menu
      const pathname = window.location.pathname;
      const hotelMenuMatch = pathname.match(/\/hotel\/([^/]+)\/menu/);
      const villaMenuMatch = pathname.match(/\/villa\/([^/]+)\/menu/);
      
      if (hotelMenuMatch || villaMenuMatch) {
        console.log('🏨 Hotel/Villa menu URL detected:', pathname);
        return 'hotelVillaMenu';
      }
      
      // 🔧 FIX: Check if user is already logged in as place provider and restore dashboard
      const storedProvider = getFromLocalStorage('app_logged_in_provider');
      if (storedProvider && storedProvider.type === 'place') {
        console.log('✅ Found logged in place provider, restoring placeDashboard:', storedProvider.id);
        return 'placeDashboard';
      }
      
      // Check for other logged-in states
      if (storedProvider && storedProvider.type === 'therapist') {
        console.log('✅ Found logged in therapist, restoring therapistDashboard:', storedProvider.id);
        return 'therapistDashboard';
      }
      
      // Restore last page from session if available
      const sessionPage = sessionStorage.getItem('current_page') as Page | null;
      if (sessionPage && typeof sessionPage === 'string') {
        console.log('↩️ Restoring session page:', sessionPage);
        return sessionPage as Page;
      }
      
      // If user has already entered the app in this session, go to home
      const hasEntered = sessionStorage.getItem('has_entered_app');
      if (hasEntered === 'true') {
        console.log('🚪 Session indicates app already entered → home');
        return 'home';
      }
      
      // Allow specific pages via URL parameter
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
    const storedLang = getFromLocalStorage('app_language', 'en');
    console.log('🌐 useAppState: Initial language from localStorage:', storedLang);
    return storedLang;
  });
  const setLanguage = (lang: Language) => {
    console.log('🌐 useAppState: setLanguage called with:', lang);
    console.log('🌐 useAppState: Current language before change:', language);
    _setLanguage(lang);
    setToLocalStorage('app_language', lang);
    console.log('🌐 useAppState: Language state updated to:', lang);
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
  
  // Data state
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
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
    
    // Data
    therapists, setTherapists,
    places, setPlaces,
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