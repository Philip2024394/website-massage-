// State management hooks and utilities for the main App component
import { useState } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage, ChatRoom } from '../types';
import type { Page, Language, LoggedInProvider, LoggedInUser } from '../types/pageTypes';

// Helper functions for localStorage persistence
const getFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
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
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useAppState = () => {
  // Core user state - with localStorage persistence
  const [user, _setUser] = useState<User | null>(() => getFromLocalStorage('app_user'));
  const setUser = (newUser: User | null) => {
    _setUser(newUser);
    setToLocalStorage('app_user', newUser);
  };

  const [page, _setPage] = useState<Page>('home'); // Changed from 'landing' to 'home' for testing
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
  // Admin authentication - managed by Appwrite sessions, not localStorage
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

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
  const [venueMenuId, setVenueMenuId] = useState<string>('');
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