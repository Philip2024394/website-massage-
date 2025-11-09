// State management hooks and utilities for the main App component
import { useState } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage, ChatRoom } from '../types';
import type { Page, Language, LoggedInProvider, LoggedInUser } from '../types/pageTypes';

// Helper functions for localStorage persistence
const getFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (_error) {
    console.error(`Error reading ${key} from localStorage:`, _error);
    return defaultValue;
  }
};

const setToLocalStorage = (key: string, value: any) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (_error) {
    console.error(`Error saving ${key} to localStorage:`, _error);
  }
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
      
      // Allow specific test pages via URL parameter
      if (pageParam === 'rewardBannersTest' || pageParam === 'reward-banners-test') {
        console.log('🎯 URL parameter detected: Opening reward banners test page');
        return 'rewardBannersTest';
      }
      
      // Check if user has already entered the app (has user location and language set)
      const hasUserLocation = localStorage.getItem('user_location');
      const hasLanguage = localStorage.getItem('app_language');
      
      if (hasUserLocation && hasLanguage) {
        console.log('🏠 User has already entered app, going to home page');
        return 'home';
      }
      
      // Default to landing page for first-time users
      console.log('👋 First-time user, showing landing page');
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

  const [page, _setPage] = useState<Page>(getInitialPage()); // Start with URL-aware page detection
  const setPage = (newPage: Page) => {
    console.log('📍 Page change:', newPage);
    _setPage(newPage);
  };
  
  // Location and preferences - with localStorage persistence
  const [selectedPlace, _setSelectedPlace] = useState<Place | null>(() => getFromLocalStorage('app_selected_place'));
  const setSelectedPlace = (place: Place | null) => {
    _setSelectedPlace(place);
    setToLocalStorage('app_selected_place', place);
  };

  const [language, _setLanguage] = useState<Language>(() => getFromLocalStorage('app_language', 'en'));
  const setLanguage = (lang: Language) => {
    _setLanguage(lang);
    setToLocalStorage('app_language', lang);
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

  const [adminDashboardTab, setAdminDashboardTab] = useState<'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'confirm-accounts' | 'chat-messages' | 'drawer-buttons' | 'agent-commission' | 'bank-details' | 'payment-transactions' | 'shop-management' | 'membership-pricing'>('platform-analytics');

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
    adminDashboardTab, setAdminDashboardTab,
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