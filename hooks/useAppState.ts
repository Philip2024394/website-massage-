// State management hooks and utilities for the main App component
import { useState } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage, ChatRoom } from '../types';
import type { Page, Language, LoggedInProvider, LoggedInUser } from '../types/pageTypes';

export const useAppState = () => {
  // Core user state
  const [user, setUser] = useState<User | null>(null);
  const [page, _setPage] = useState<Page>('landing');
  const setPage = (newPage: Page) => {
    console.log('📍 Page change:', newPage);
    _setPage(newPage);
  };
  
  // Location and preferences
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedMassageType, setSelectedMassageType] = useState<string>('all');
  
  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminDashboardTab, setAdminDashboardTab] = useState<'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'confirm-accounts' | 'chat-messages' | 'drawer-buttons' | 'agent-commission' | 'bank-details' | 'payment-transactions' | 'shop-management' | 'membership-pricing'>('platform-analytics');
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  
  // Customer state
  const [loggedInCustomer, setLoggedInCustomer] = useState<any | null>(null);
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
  
  // Provider state
  const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);
  const [providerAuthInfo, setProviderAuthInfo] = useState<{ type: 'therapist' | 'place', mode: 'login' | 'register' } | null>(null);
  const [providerForBooking, setProviderForBooking] = useState<{ provider: Therapist | Place; type: 'therapist' | 'place' } | null>(null);
  
  // Agent state
  const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);
  const [impersonatedAgent, setImpersonatedAgent] = useState<Agent | null>(null);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  
  // Hotel/Villa state
  const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false);
  const [isVillaLoggedIn, setIsVillaLoggedIn] = useState(false);
  const [venueMenuId, setVenueMenuId] = useState<string>('');
  const [jobPostingId, setJobPostingId] = useState<string>('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
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