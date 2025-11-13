import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
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
    
    adminDashboardTab: string;
    setAdminDashboardTab: (tab: string) => void;
    
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
        if (hash && hash !== 'landing') {
            console.log('🔗 Initializing page from URL hash:', hash);
            return hash;
        }
        return 'landing';
    };
    
    const [page, _setPage] = useState<string>(getInitialPage());
    const [language, setLanguage] = useState<Language>('en');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [selectedMassageType, setSelectedMassageType] = useState<string>('all');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
        console.log('📍 setPage called:', newPage, 'Current page:', page);
        
        // Prevent infinite loops by checking if we're already on that page
        if (newPage === page) {
            console.log('📍 Already on page:', newPage, 'skipping...');
            return;
        }
        
        // Sync page state with URL hash (except for landing page)
        if (newPage !== 'landing') {
            console.log('📍 Setting hash to:', `#${newPage}`);
            window.location.hash = `#${newPage}`;
        } else {
            console.log('📍 Clearing hash for landing page');
            window.location.hash = '';
        }
        
        console.log('📍 Updating page state to:', newPage);
        _setPage(newPage);
    }, [page]);

    // Listen for hash changes to handle browser back/forward buttons
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const newPage = hash || 'landing';
            if (newPage !== page) {
                console.log('🔗 Hash changed, updating page to:', newPage);
                _setPage(newPage);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [page]);

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
