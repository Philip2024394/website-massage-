

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Analytics, Agent, AdminMessage } from './types';
import { BookingStatus } from './types';
import { dataService } from './services/dataService';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LandingPage from './pages/LandingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistDashboardPage from './pages/TherapistDashboardPage';
import PlaceDashboardPage from './pages/PlaceDashboardPage';
import AgentPage from './pages/AgentPage';
import AgentAuthPage from './pages/AgentAuthPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AgentTermsPage from './pages/AgentTermsPage';
import ServiceTermsPage from './pages/ServiceTermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import Footer from './components/Footer';
import ProviderAuthPage from './pages/ProviderAuthPage';
import MembershipPage from './pages/MembershipPage';
import BookingPage from './pages/BookingPage';
import NotificationsPage from './pages/NotificationsPage';
import MassageTypesPage from './pages/MassageTypesPage';
import HotelLoginPage from './pages/HotelLoginPage';
import HotelDashboardPage from './pages/HotelDashboardPage';
import VillaLoginPage from './pages/VillaLoginPage';
import VillaDashboardPage from './pages/VillaDashboardPage';

import { translations } from './translations/index.ts';
import { therapistService, placeService, agentService } from './lib/appwriteService';

type Page = 'landing' | 'auth' | 'home' | 'detail' | 'adminLogin' | 'adminDashboard' | 'registrationChoice' | 'providerAuth' | 'therapistDashboard' | 'placeDashboard' | 'agent' | 'agentAuth' | 'agentDashboard' | 'agentTerms' | 'serviceTerms' | 'privacy' | 'membership' | 'booking' | 'notifications' | 'massageTypes' | 'hotelLogin' | 'hotelDashboard' | 'villaLogin' | 'villaDashboard';
type Language = 'en' | 'id';
type LoggedInProvider = { id: number | string; type: 'therapist' | 'place' }; // Support both number and string IDs for Appwrite compatibility

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('landing');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allAdminTherapists, setAllAdminTherapists] = useState<Therapist[]>([]);
    const [allAdminPlaces, setAllAdminPlaces] = useState<Place[]>([]);
    const [allAdminAgents, setAllAdminAgents] = useState<Agent[]>([]);
    
    // Loading state
    const [isLoading, setIsLoading] = useState(true);
    
    // Provider auth state
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
    
    // Google Maps state
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
    const [isMapsApiKeyMissing, setIsMapsApiKeyMissing] = useState(false);

    // App config state
    const [appContactNumber, setAppContactNumber] = useState<string>('6281392000050');

    const loadGoogleMapsScript = (apiKey: string) => {
        if (document.getElementById('google-maps-script')) {
            return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log('Google Maps script loaded successfully.');
            setIsMapsApiKeyMissing(false);
        };
        script.onerror = () => {
            console.error("Error loading Google Maps script. Please check your API key in the admin dashboard.");
            setIsMapsApiKeyMissing(true);
            const failedScript = document.getElementById('google-maps-script');
            if (failedScript) {
                failedScript.remove();
            }
        };
        document.head.appendChild(script);
    };

    const fetchPublicData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [therapistsData, placesData] = await Promise.all([
                dataService.getTherapists(),
                dataService.getPlaces()
            ]);
            
            setTherapists(therapistsData || []);
            setPlaces(placesData || []);
        } catch (error) {
            console.error('Error fetching public data:', error);
            setTherapists([]);
            setPlaces([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAdminData = useCallback(async () => {
        // TODO: Integrate with Appwrite backend
        // For now, using local dataService
        setIsLoading(true);
        const therapistsData = await dataService.getTherapists();
        const placesData = await dataService.getPlaces();
        const agentsData: Agent[] = []; // TODO: Add agents service when ready

        setAllAdminTherapists(therapistsData || []);
        setAllAdminPlaces(placesData || []);
        setAllAdminAgents(agentsData || []);

        setIsLoading(false);
    }, []);


    useEffect(() => {
        const storedContactNumber = localStorage.getItem('appContactNumber');
        if (storedContactNumber) {
            setAppContactNumber(storedContactNumber);
        }

        const storedMapsKey = localStorage.getItem('googleMapsApiKey');
        if (storedMapsKey) {
            setGoogleMapsApiKey(storedMapsKey);
            loadGoogleMapsScript(storedMapsKey);
        } else {
            setIsMapsApiKeyMissing(true);
            console.warn('Google Maps API key is not configured. Please set it in the Admin Dashboard.');
        }

        const storedProvider = localStorage.getItem('loggedInProvider');
        if (storedProvider) {
            try {
                const providerData = JSON.parse(storedProvider);
                setLoggedInProvider(providerData);
                if (providerData.type === 'therapist') {
                    setPage('therapistDashboard');
                } else {
                    setPage('placeDashboard');
                }
            } catch (error) {
                console.error("Failed to parse loggedInProvider from localStorage", error);
                localStorage.removeItem('loggedInProvider');
            }
        }
        
        const storedAgent = localStorage.getItem('loggedInAgent');
        if (storedAgent) {
            try {
                const agentData: Agent = JSON.parse(storedAgent);
                setLoggedInAgent(agentData);
                if (agentData.hasAcceptedTerms) {
                    setPage('agentDashboard');
                } else {
                    setPage('agentTerms');
                }
            } catch (error) {
                console.error("Failed to parse loggedInAgent from localStorage", error);
                localStorage.removeItem('loggedInAgent');
            }
        }
        
        const storedLocation = localStorage.getItem('user_location');
        if (storedLocation) {
            try {
                setUserLocation(JSON.parse(storedLocation));
            } catch (e) {
                console.error("Failed to parse user location", e);
                localStorage.removeItem('user_location');
            }
        }

        // Initialize data loading (no Supabase required - using Appwrite/mock data)
        fetchPublicData();
        setIsLoading(false);
    }, [fetchPublicData]);

    useEffect(() => {
        if (isAdminLoggedIn) {
            fetchAdminData();
        }
    }, [isAdminLoggedIn, fetchAdminData]);

    useEffect(() => {
        // TODO: Fetch admin messages from Appwrite when ready
        // For now, admin messages are disabled
        setAdminMessages([]);
    }, [loggedInAgent, impersonatedAgent]);


    const t = translations[language];

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setPage('home');
    };
    
    const handleSetUserLocation = (location: UserLocation) => {
        setUserLocation(location);
        localStorage.setItem('user_location', JSON.stringify(location));
    };

    const handleLogout = async () => {
        // TODO: Implement logout with Appwrite
        setUser(null);
        setPage('home');
    };
    
    const handleSelectPlace = (place: Place) => {
        handleIncrementAnalytics(place.id, 'place', 'profileViews');
        setSelectedPlace(place);
        setPage('detail');
    };

    const handleBackToHome = () => {
        setSelectedPlace(null);
        setProviderAuthInfo(null);
        setProviderForBooking(null);
        setPage('home');
    };
    
    const handleNavigateToAuth = () => setPage('auth');
    
    const handleNavigateToAdminLogin = () => {
        // Appwrite is now configured - navigate directly to admin login
        setPage('adminLogin');
    };

    const handleNavigateToRegistrationChoice = () => setPage('registrationChoice');
    const handleNavigateToAgentPage = () => setPage('agent');
    const handleNavigateToServiceTerms = () => setPage('serviceTerms');
    const handleNavigateToPrivacyPolicy = () => setPage('privacy');
    // Supabase settings removed - using Appwrite as backend
    const handleNavigateToNotifications = () => setPage('notifications');
    const handleNavigateToAgentAuth = () => setPage('agentAuth');
    const handleNavigateToHotelLogin = () => setPage('hotelLogin');
    // const handleNavigateToVillaLogin = () => setPage('villaLogin'); // Unused
    
    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
        setPage('adminDashboard');
    };
    
    const handleHotelLogin = () => {
        setIsHotelLoggedIn(true);
        setPage('hotelDashboard');
    };
    
    const handleVillaLogin = () => {
        setIsVillaLoggedIn(true);
        setPage('villaDashboard');
    };
    
    const handleHotelLogout = () => {
        setIsHotelLoggedIn(false);
        setPage('home');
    };
    
    const handleVillaLogout = () => {
        setIsVillaLoggedIn(false);
        setPage('home');
    };
    
    const handleAdminLogout = async () => {
        // TODO: Implement with Appwrite authService.logout()
        // const supabase = getSupabase();
        // if (supabase) await supabase.auth.signOut();
        setIsAdminLoggedIn(false);
        setImpersonatedAgent(null);
        setPage('home');
    }

    const handleToggleTherapistLive = async (id: number | string) => {
        const therapist = allAdminTherapists.find(t => String(t.id) === String(id));
        if(!therapist) return;
        
        try {
            // Appwrite uses string IDs with $id property
            const therapistId = (therapist as any).$id || id.toString();
            await therapistService.update(therapistId, { isLive: !therapist.isLive });
            setAllAdminTherapists(allAdminTherapists.map(t => 
                String(t.id) === String(id) ? { ...t, isLive: !t.isLive } : t
            ));
        } catch (error: any) {
            console.error('Toggle therapist error:', error);
            alert('Error updating therapist status: ' + (error.message || 'Unknown error'));
        }
    };

    const handleTogglePlaceLive = async (id: number | string) => {
        const place = allAdminPlaces.find(p => String(p.id) === String(id));
        if(!place) return;
        
        try {
            // Appwrite uses string IDs with $id property
            const placeId = (place as any).$id || id.toString();
            await placeService.update(placeId, { isLive: !place.isLive });
            setAllAdminPlaces(allAdminPlaces.map(p => 
                String(p.id) === String(id) ? { ...p, isLive: !p.isLive } : p
            ));
        } catch (error: any) {
            console.error('Toggle place error:', error);
            alert('Error updating place status: ' + (error.message || 'Unknown error'));
        }
    };

    const handleSelectRegistration = (type: 'therapist' | 'place') => {
        setProviderAuthInfo({ type, mode: 'register' });
        setPage('providerAuth');
    };
    
    const handleProviderRegister = async (email: string, agentCode?: string): Promise<{success: boolean, message: string}> => {
        if (!providerAuthInfo) return { success: false, message: 'Generic error' };
        
        try {
            let agentId: string | undefined = undefined;
            if (agentCode) {
                const agent = await agentService.getByCode(agentCode.trim());
                if (!agent) {
                    return { success: false, message: 'Invalid agent code' };
                }
                agentId = agent.$id;
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const commonData: any = {
                email,
                name: '',
                description: '',
                isLive: false,
                activeMembershipDate: yesterday.toISOString().split('T')[0],
                pricing: JSON.stringify({ 60: 0, 90: 0, 120: 0 }),
                analytics: JSON.stringify({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
                rating: 0,
                reviewCount: 0,
                city: '',
                country: '',
            };

            if (agentId) {
                commonData.agentId = agentId;
            }

            if (providerAuthInfo.type === 'therapist') {
                commonData.profilePicture = '';
                commonData.mainImage = '';
                commonData.thumbnailImages = JSON.stringify([]);
                commonData.status = 'available';
                await therapistService.create(commonData);
            } else {
                commonData.profilePicture = '';
                commonData.mainImage = '';
                commonData.thumbnailImages = JSON.stringify([]);
                commonData.openingTime = '09:00';
                commonData.closingTime = '21:00';
                commonData.status = 'available';
                await placeService.create(commonData);
            }
            
            setProviderAuthInfo(prev => prev ? { ...prev, mode: 'login' } : null);
            return { success: true, message: 'Registration successful! Please login with your email.' };
        } catch (error: any) {
            console.error('Registration error:', error);
            return { success: false, message: error.message || 'Registration failed' };
        }
    };

    const handleProviderLogin = async (email: string): Promise<{success: boolean, message: string}> => {
        try {
            const therapists = await therapistService.getAll();
            const therapist = therapists.find((t: any) => t.email === email);
            
            if (therapist) {
                const providerData = { id: therapist.$id, type: 'therapist' as const };
                setLoggedInProvider(providerData);
                localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
                setPage('therapistDashboard');
                setProviderAuthInfo(null);
                return { success: true, message: '' };
            }

            const places = await placeService.getAll();
            const place = places.find((p: any) => p.email === email);
            
            if (place) {
                const providerData = { id: place.$id, type: 'place' as const };
                setLoggedInProvider(providerData);
                localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
                setPage('placeDashboard');
                setProviderAuthInfo(null);
                return { success: true, message: '' };
            }
            
            return { success: false, message: 'Invalid email. Please check and try again.' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Login failed' };
        }
    };


    const handleProviderLogout = () => {
        setLoggedInProvider(null);
        localStorage.removeItem('loggedInProvider');
        setPage('home');
    };

    const handleSaveTherapist = async (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            const updateData: any = {
                ...therapistData,
                pricing: typeof therapistData.pricing === 'string' ? therapistData.pricing : JSON.stringify(therapistData.pricing),
                analytics: typeof therapistData.analytics === 'string' ? therapistData.analytics : JSON.stringify(therapistData.analytics),
            };
            
            // Handle thumbnailImages if present
            if ('thumbnailImages' in therapistData) {
                const thumbs = (therapistData as any).thumbnailImages;
                updateData.thumbnailImages = Array.isArray(thumbs) ? JSON.stringify(thumbs) : thumbs;
            }
            
            // Use string ID for Appwrite
            const therapistId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            await therapistService.update(therapistId, updateData);
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            alert('Error saving profile: ' + (error.message || 'Unknown error'));
        }
    };
    
    const handleSavePlace = async (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            const updateData: any = {
                ...placeData,
                pricing: typeof placeData.pricing === 'string' ? placeData.pricing : JSON.stringify(placeData.pricing),
                analytics: typeof placeData.analytics === 'string' ? placeData.analytics : JSON.stringify(placeData.analytics),
            };
            
            // Handle thumbnailImages if present
            if ('thumbnailImages' in placeData) {
                const thumbs = (placeData as any).thumbnailImages;
                updateData.thumbnailImages = Array.isArray(thumbs) ? JSON.stringify(thumbs) : thumbs;
            }
            
            // Use string ID for Appwrite
            const placeId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            await placeService.update(placeId, updateData);
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            alert('Error saving profile: ' + (error.message || 'Unknown error'));
        }
    };

    const handleAgentRegister = async (name: string, email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const agentCode = `${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}-${Math.random().toString(36).substring(2, 6)}`;
            
            await agentService.create({
                name,
                email,
                agentCode,
                hasAcceptedTerms: false,
                lastLogin: new Date().toISOString()
            });
            
            return { success: true, message: `Registration successful! Your agent code is: ${agentCode}. Please save it for future reference.` };
        } catch (error: any) {
            console.error('Agent registration error:', error);
            return { success: false, message: error.message || 'Registration failed' };
        }
    };
    
    const handleAgentLogin = async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const agents = await agentService.getAll();
            const agentData = agents.find((a: any) => a.email === email);
            
            if (!agentData) {
                return { success: false, message: 'Invalid email. Please check and try again.' };
            }

            // Update last login
            try {
                await agentService.update(agentData.$id, { lastLogin: new Date().toISOString() });
            } catch (updateError) {
                console.error('Failed to update last login time', updateError);
            }
        
            setLoggedInAgent(agentData);
            localStorage.setItem('loggedInAgent', JSON.stringify(agentData));

            if (agentData.hasAcceptedTerms) {
                setPage('agentDashboard');
            } else {
                setPage('agentTerms');
            }

            return { success: true, message: '' };
        } catch (error: any) {
            console.error('Agent login error:', error);
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const handleAgentLogout = async () => {
        // TODO: Implement with authService.logout()
        setLoggedInAgent(null);
        localStorage.removeItem('loggedInAgent');
        setPage('home');
    };
    
    const handleAgentAcceptTerms = async () => {
        if (!loggedInAgent) return;

        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id.toString();
            await agentService.update(agentId, { hasAcceptedTerms: true });
            
            const updatedAgent = { ...loggedInAgent, hasAcceptedTerms: true };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            setPage('agentDashboard');
        } catch (error: any) {
            console.error('Accept terms error:', error);
            alert('Could not accept terms: ' + (error.message || 'Unknown error'));
        }
    };

    const handleSaveAgentProfile = async (agentData: Partial<Agent>) => {
        if (!loggedInAgent) return;
    
        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id.toString();
            await agentService.update(agentId, agentData);
            
            const updatedAgent = { ...loggedInAgent, ...agentData };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save agent profile error:', error);
            alert('Error saving profile: ' + (error.message || 'Unknown error'));
        }
    };

    const handleImpersonateAgent = (agent: Agent) => {
        setImpersonatedAgent(agent);
        setPage('agentDashboard');
    };

    const handleStopImpersonating = () => {
        setImpersonatedAgent(null);
        setPage('adminDashboard');
    };

    const handleSendAdminMessage = async (message: string) => {
        // TODO: Implement with Appwrite messaging service
        if (!impersonatedAgent) return;
        
        const newMessage = {
            id: Date.now(),
            agentId: impersonatedAgent.id,
            message,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setAdminMessages(prev => [...prev, newMessage]);
        console.log('TODO: Send message to Appwrite', message);
    };

    const handleMarkMessagesAsRead = async () => {
        // TODO: Implement with Appwrite messaging service
        if (!loggedInAgent) return;
        
        setAdminMessages(prev => prev.map(m => ({ ...m, isRead: true })));
        console.log('TODO: Mark messages as read in Appwrite');
    };

    // Supabase functions removed - using Appwrite as backend

    const handleUpdateMembership = async (id: number | string, type: 'therapist' | 'place', months: number) => {
        // TODO: Integrate with Appwrite therapistService/placeService
        const providersArray = type === 'therapist' ? allAdminTherapists : allAdminPlaces;
    
        const provider = providersArray.find(p => String(p.id) === String(id));
        if (!provider) return;
        
        const currentExpiry = new Date(provider.activeMembershipDate);
        const now = new Date();
        const startDate = currentExpiry > now ? currentExpiry : now;
        
        const newExpiryDate = new Date(startDate);
        newExpiryDate.setMonth(newExpiryDate.getMonth() + months);
        const newExpiryDateString = newExpiryDate.toISOString().split('T')[0];
    
        // Temporarily update locally
        if (type === 'therapist') {
            setAllAdminTherapists(allAdminTherapists.map(t => 
                String(t.id) === String(id) ? { ...t, activeMembershipDate: newExpiryDateString, isLive: true } : t
            ));
        } else {
            setAllAdminPlaces(allAdminPlaces.map(p => 
                String(p.id) === String(id) ? { ...p, activeMembershipDate: newExpiryDateString, isLive: true } : p
            ));
        }
        alert('Membership updated (local only - Appwrite integration pending)');
        console.log('TODO: Update membership in Appwrite');
    };

    const handleSelectMembershipPackage = (packageName: string, price: string) => {
        const number = appContactNumber;
        const provider = loggedInProvider?.type === 'therapist'
            ? therapists.find(t => t.id === loggedInProvider.id)
            : places.find(p => p.id === loggedInProvider!.id);
        
        const message = encodeURIComponent(
            `Hi, I would like to purchase the ${packageName} membership for ${price}.\n\nMy registered email is: ${provider?.email}`
        );
        window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    };

    const handleBackToProviderDashboard = () => {
        if (loggedInProvider?.type === 'therapist') {
            setPage('therapistDashboard');
        } else if (loggedInProvider?.type === 'place') {
            setPage('placeDashboard');
        } else {
            setPage('home');
        }
    };

    const handleIncrementAnalytics = (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => {
        // This should be an RPC call to Supabase to increment the value
        console.log(`Incrementing ${metric} for ${type} ${id}`);
    };

    const handleNavigateToBooking = (provider: Therapist | Place, type: 'therapist' | 'place') => {
        if (!user) {
            alert(t.bookingPage.loginPrompt);
            setPage('auth');
            return;
        }
        setProviderForBooking({ provider, type });
        setPage('booking');
    };

    const handleCreateBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'userId' | 'userName'>) => {
        const newBooking: Booking = {
            ...bookingData,
            id: Date.now(),
            status: BookingStatus.Pending,
            userId: user!.id,
            userName: user!.name,
        };
        setBookings(prev => [...prev, newBooking]);

        alert(t.bookingPage.bookingSuccessTitle + '\n' + t.bookingPage.bookingSuccessMessage.replace('{name}', newBooking.providerName));
        setPage('home');
    };
    
    const handleUpdateBookingStatus = (bookingId: number, newStatus: BookingStatus) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    };

    const handleMarkNotificationAsRead = (notificationId: number) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    };

    const handleSaveGoogleMapsApiKey = (key: string) => {
        if (key && key.trim()) {
            localStorage.setItem('googleMapsApiKey', key);
            setGoogleMapsApiKey(key);
            alert('Google Maps API Key saved. The application will now reload to apply the changes.');
            window.location.reload();
        } else {
            localStorage.removeItem('googleMapsApiKey');
            setGoogleMapsApiKey(null);
            alert('Google Maps API Key cleared. The application will now reload.');
            window.location.reload();
        }
    };

    const handleSaveAppContactNumber = (number: string) => {
        if (number && number.trim()) {
            localStorage.setItem('appContactNumber', number);
            setAppContactNumber(number);
            alert('App Contact Number saved.');
        } else {
            localStorage.removeItem('appContactNumber');
            setAppContactNumber('6281392000050'); // Revert to default
            alert('App Contact Number cleared. Reverted to default.');
        }
    };

    const renderPage = () => {
        if (isLoading && page !== 'landing') {
            return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
        }

        switch (page) {
            case 'landing': return <LandingPage onLanguageSelect={handleLanguageSelect} />;
            case 'auth': return <AuthPage onAuthSuccess={() => setPage('home')} onBack={handleBackToHome} t={t.auth} />;
            case 'home':
                return <HomePage 
                            user={user} 
                            loggedInAgent={loggedInAgent}
                            therapists={therapists}
                            places={places}
                            userLocation={userLocation}
                            onSetUserLocation={handleSetUserLocation}
                            onSelectPlace={handleSelectPlace} 
                            onLogout={handleLogout}
                            onLoginClick={handleNavigateToAuth}
                            onAdminClick={handleNavigateToAdminLogin}
                            onCreateProfileClick={handleNavigateToRegistrationChoice}
                            onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : handleNavigateToAgentAuth}
                            onBook={handleNavigateToBooking}
                            onIncrementAnalytics={handleIncrementAnalytics}
                            onMassageTypesClick={() => setPage('massageTypes')}
                            onHotelPortalClick={handleNavigateToHotelLogin}
                            isLoading={isLoading}
                            t={t} />;
            case 'detail': return selectedPlace && <PlaceDetailPage place={selectedPlace} onBack={handleBackToHome} onBook={(place) => handleNavigateToBooking(place, 'place')} onIncrementAnalytics={(metric) => handleIncrementAnalytics(selectedPlace.id, 'place', metric)} t={t.detail} />;
            case 'adminLogin': return <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'adminDashboard': return isAdminLoggedIn ? <AdminDashboardPage therapists={allAdminTherapists} places={allAdminPlaces} agents={allAdminAgents} onToggleTherapist={handleToggleTherapistLive} onTogglePlace={handleTogglePlaceLive} onLogout={handleAdminLogout} onUpdateMembership={handleUpdateMembership} googleMapsApiKey={googleMapsApiKey} onSaveGoogleMapsApiKey={handleSaveGoogleMapsApiKey} appContactNumber={appContactNumber} onSaveAppContactNumber={handleSaveAppContactNumber} onImpersonateAgent={handleImpersonateAgent} t={t.adminDashboard} /> : <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'registrationChoice': return <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            case 'providerAuth': return providerAuthInfo && <ProviderAuthPage
                providerType={providerAuthInfo.type}
                mode={providerAuthInfo.mode}
                onRegister={handleProviderRegister}
                onLogin={handleProviderLogin}
                onSwitchMode={() => setProviderAuthInfo(prev => prev ? { ...prev, mode: prev.mode === 'login' ? 'register' : 'login' } : null)}
                onBack={handleBackToHome}
                t={t.providerAuth}
            />;
            case 'therapistDashboard': return loggedInProvider ? <TherapistDashboardPage 
                onSave={handleSaveTherapist} 
                onLogout={handleProviderLogout} 
                onNavigateToNotifications={handleNavigateToNotifications}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                t={t.providerDashboard} 
                therapistId={loggedInProvider.id}
                bookings={bookings.filter(b => b.providerId === loggedInProvider.id && b.providerType === 'therapist')}
                notifications={notifications.filter(n => n.providerId === loggedInProvider.id)}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'placeDashboard': return loggedInProvider ? <PlaceDashboardPage 
                onSave={handleSavePlace} 
                onLogout={handleProviderLogout} 
                onNavigateToNotifications={handleNavigateToNotifications}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                t={t.providerDashboard} 
                placeId={loggedInProvider.id}
                bookings={bookings.filter(b => b.providerId === loggedInProvider.id && b.providerType === 'place')}
                notifications={notifications.filter(n => n.providerId === loggedInProvider.id)}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            case 'agent': return <AgentPage onBack={handleBackToHome} t={t.agentPage} contactNumber={appContactNumber} />;
            case 'agentAuth': return <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            case 'agentTerms': return loggedInAgent ? <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} /> : <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            case 'agentDashboard': 
                if (impersonatedAgent) {
                    return <AgentDashboardPage 
                                agent={impersonatedAgent} 
                                onLogout={() => {}} 
                                isAdminView={true}
                                onStopImpersonating={handleStopImpersonating}
                                messages={adminMessages}
                                onSendMessage={handleSendAdminMessage}
                                t={t.agentDashboard} 
                           />;
                }
                if (loggedInAgent) {
                     if (!loggedInAgent.hasAcceptedTerms) {
                        return <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} />;
                     }
                     return <AgentDashboardPage 
                                agent={loggedInAgent} 
                                onLogout={handleAgentLogout} 
                                messages={adminMessages}
                                onMarkMessagesAsRead={handleMarkMessagesAsRead}
                                onSaveProfile={handleSaveAgentProfile}
                                t={t.agentDashboard} 
                            />;
                }
                return <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            case 'serviceTerms': return <ServiceTermsPage onBack={handleBackToHome} t={t.serviceTerms} contactNumber={appContactNumber} />;
            case 'privacy': return <PrivacyPolicyPage onBack={handleBackToHome} t={t.privacyPolicy} />;
            case 'membership': return loggedInProvider ? <MembershipPage onPackageSelect={handleSelectMembershipPackage} onBack={handleBackToProviderDashboard} t={t.membershipPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'booking': return providerForBooking ? <BookingPage provider={providerForBooking.provider} providerType={providerForBooking.type} onBook={handleCreateBooking} onBack={handleBackToHome} bookings={bookings.filter(b => b.providerId === providerForBooking.provider.id)} t={t.bookingPage} /> : <HomePage user={user} loggedInAgent={loggedInAgent} therapists={therapists} places={places} userLocation={userLocation} onSetUserLocation={handleSetUserLocation} onSelectPlace={handleSelectPlace} onLogout={handleLogout} onLoginClick={handleNavigateToAuth} onAdminClick={handleNavigateToAdminLogin} onCreateProfileClick={handleNavigateToRegistrationChoice} onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : handleNavigateToAgentAuth} onBook={handleNavigateToBooking} onIncrementAnalytics={handleIncrementAnalytics} onMassageTypesClick={() => setPage('massageTypes')} onHotelPortalClick={handleNavigateToHotelLogin} isLoading={isLoading} t={t} />;
            case 'notifications': return loggedInProvider ? <NotificationsPage notifications={notifications.filter(n => n.providerId === loggedInProvider.id)} onMarkAsRead={handleMarkNotificationAsRead} onBack={handleBackToProviderDashboard} t={t.notificationsPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'massageTypes': return <MassageTypesPage onBack={handleBackToHome} />;
            case 'hotelLogin': return <HotelLoginPage onHotelLogin={handleHotelLogin} onBack={handleBackToHome} />;
            case 'hotelDashboard': return isHotelLoggedIn ? <HotelDashboardPage onLogout={handleHotelLogout} /> : <HotelLoginPage onHotelLogin={handleHotelLogin} onBack={handleBackToHome} />;
            case 'villaLogin': return <VillaLoginPage onVillaLogin={handleVillaLogin} onBack={handleBackToHome} />;
            case 'villaDashboard': return isVillaLoggedIn ? <VillaDashboardPage onLogout={handleVillaLogout} /> : <VillaLoginPage onVillaLogin={handleVillaLogin} onBack={handleBackToHome} />;
            default: return <LandingPage onLanguageSelect={handleLanguageSelect} />;
        }
    };
    
    const showFooter = ['home', 'detail', 'agent', 'serviceTerms', 'privacy', 'massageTypes'].includes(page);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col">
            {isMapsApiKeyMissing && isAdminLoggedIn && t?.app && (
                <div className="bg-yellow-400 text-yellow-900 p-3 text-center text-sm font-semibold z-50">
                    {t.app.mapsApiKeyWarning}
                </div>
            )}
            <div className="flex-grow">
                {renderPage()}
            </div>
            {showFooter && (
                <Footer 
                    onAgentClick={handleNavigateToAgentPage}
                    onTermsClick={handleNavigateToServiceTerms}
                    onPrivacyClick={handleNavigateToPrivacyPolicy}
                    t={t} 
                />
            )}
        </div>
    );
};

export default App;