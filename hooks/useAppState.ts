// State management hooks and utilities for the main App component
import { useState, useEffect, useCallback } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage } from '../types';
import { dataService } from '../services/dataService';

export const useAppState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false);
  const [isVillaLoggedIn, setIsVillaLoggedIn] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null);
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allAdminTherapists, setAllAdminTherapists] = useState<Therapist[]>([]);
  const [allAdminPlaces, setAllAdminPlaces] = useState<Place[]>([]);
  const [allAdminAgents, setAllAdminAgents] = useState<Agent[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);
  const [impersonatedAgent, setImpersonatedAgent] = useState<Agent | null>(null);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [isMapsApiKeyMissing, setIsMapsApiKeyMissing] = useState(false);
  const [appContactNumber, setAppContactNumber] = useState<string>('6281392000050');

  return {
    // User state
    user, setUser,
    selectedPlace, setSelectedPlace,
    language, setLanguage,
    userLocation, setUserLocation,
    
    // Auth state
    isAdminLoggedIn, setIsAdminLoggedIn,
    isHotelLoggedIn, setIsHotelLoggedIn,
    isVillaLoggedIn, setIsVillaLoggedIn,
    supabaseConfig, setSupabaseConfig,
    
    // Data state
    therapists, setTherapists,
    places, setPlaces,
    bookings, setBookings,
    notifications, setNotifications,
    allAdminTherapists, setAllAdminTherapists,
    allAdminPlaces, setAllAdminPlaces,
    allAdminAgents, setAllAdminAgents,
    
    // Loading and agent state
    isLoading, setIsLoading,
    loggedInAgent, setLoggedInAgent,
    impersonatedAgent, setImpersonatedAgent,
    adminMessages, setAdminMessages,
    
    // Config state
    googleMapsApiKey, setGoogleMapsApiKey,
    isMapsApiKeyMissing, setIsMapsApiKeyMissing,
    appContactNumber, setAppContactNumber,
  };
};

export const useDataFetching = () => {
  const fetchPublicData = useCallback(async () => {
    try {
      const [therapistsData, placesData] = await Promise.all([
        dataService.getTherapists(),
        dataService.getPlaces()
      ]);
      
      return { therapistsData, placesData };
    } catch (error) {
      console.error('Error fetching public data:', error);
      return { therapistsData: [], placesData: [] };
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const [therapistsData, placesData, agentsData] = await Promise.all([
        dataService.getTherapists(),
        dataService.getPlaces(),
        dataService.getAgents()
      ]);
      
      return { therapistsData, placesData, agentsData };
    } catch (error) {
      console.error('Error fetching admin data:', error);
      return { therapistsData: [], placesData: [], agentsData: [] };
    }
  }, []);

  return {
    fetchPublicData,
    fetchAdminData
  };
};