
import React, { useState, useEffect, useCallback } from 'react';
import type { User, Place, Therapist, UserLocation, SupabaseConfig, Booking, Notification, Analytics, Agent } from './types';
import { AvailabilityStatus, BookingStatus, NotificationType } from './types';
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
import ServiceTermsPage from './pages/ServiceTermsPage';
import Footer from './components/Footer';
import ProviderAuthPage from './pages/ProviderAuthPage';
import SupabaseSettingsPage from './pages/SupabaseSettingsPage';
import MembershipPage from './pages/MembershipPage';
import BookingPage from './pages/BookingPage';
import NotificationsPage from './pages/NotificationsPage';

import { translations } from './translations';
import { initSupabase, disconnectSupabase, getSupabase } from './lib/supabase';

type Page = 'landing' | 'auth' | 'home' | 'detail' | 'adminLogin' | 'adminDashboard' | 'registrationChoice' | 'providerAuth' | 'therapistDashboard' | 'placeDashboard' | 'agent' | 'agentAuth' | 'agentDashboard' | 'serviceTerms' | 'supabaseSettings' | 'membership' | 'booking' | 'notifications';
type Language = 'en' | 'id';
type LoggedInProvider = { id: number; type: 'therapist' | 'place' };

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
    
    // Loading state
    const [isLoading, setIsLoading] = useState(true);
    
    // Provider auth state
    const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);
    const [providerAuthInfo, setProviderAuthInfo] = useState<{ type: 'therapist' | 'place', mode: 'login' | 'register' } | null>(null);
    const [providerForBooking, setProviderForBooking] = useState<{ provider: Therapist | Place; type: 'therapist' | 'place' } | null>(null);
    
    // Agent state
    const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);

    // Supabase state
    const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig | null>(null);
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
    
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
        const supabase = getSupabase();
        if (!supabase) return;
        setIsLoading(true);
        const { data: therapistsData, error: therapistsError } = await supabase.from('therapists').select('*').eq('isLive', true);
        const { data: placesData, error: placesError } = await supabase.from('places').select('*').eq('isLive', true);
        
        if (therapistsError) console.error("Error fetching therapists:", therapistsError);
        else setTherapists(therapistsData || []);
        
        if (placesError) console.error("Error fetching places:", placesError);
        else setPlaces(placesData || []);

        setIsLoading(false);
    }, []);

    const fetchAdminData = useCallback(async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        setIsLoading(true);
        const { data: therapistsData, error: therapistsError } = await supabase.from('therapists').select('*');
        const { data: placesData, error: placesError } = await supabase.from('places').select('*');

        if (therapistsError) console.error("Error fetching all therapists:", therapistsError);
        else setAllAdminTherapists(therapistsData || []);

        if (placesError) console.error("Error fetching all places:", placesError);
        else setAllAdminPlaces(placesData || []);

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
                const agentData = JSON.parse(storedAgent);
                setLoggedInAgent(agentData);
                setPage('agentDashboard');
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

        const storedSupabaseConfig = localStorage.getItem('supabaseConfig');
        if (storedSupabaseConfig) {
            try {
                const config = JSON.parse(storedSupabaseConfig);
                if(config.url && config.key) {
                    handleSupabaseConnect(config.url, config.key, true);
                }
            } catch (e) {
                console.error("Failed to parse supabase config", e);
                localStorage.removeItem('supabaseConfig');
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if(isSupabaseConnected) {
            fetchPublicData();
            if (isAdminLoggedIn) {
                fetchAdminData();
            }
        }
    }, [isSupabaseConnected, isAdminLoggedIn, fetchPublicData, fetchAdminData]);

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
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
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
        if (isSupabaseConnected) {
            setPage('adminLogin');
        } else {
            setPage('supabaseSettings');
        }
    };

    const handleNavigateToRegistrationChoice = () => setPage('registrationChoice');
    const handleNavigateToAgentPage = () => setPage('agent');
    const handleNavigateToServiceTerms = () => setPage('serviceTerms');
    const handleNavigateToSupabaseSettings = () => setPage('supabaseSettings');
    const handleNavigateToNotifications = () => setPage('notifications');
    const handleNavigateToAgentAuth = () => setPage('agentAuth');
    
    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
        setPage('adminDashboard');
    };
    
    const handleAdminLogout = async () => {
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
        setIsAdminLoggedIn(false);
        setPage('home');
    }

    const handleToggleTherapistLive = async (id: number) => {
        const supabase = getSupabase();
        if(!supabase) return;
        const therapist = allAdminTherapists.find(t => t.id === id);
        if(!therapist) return;
        
        const { data, error } = await supabase
            .from('therapists')
            .update({ isLive: !therapist.isLive })
            .eq('id', id)
            .select();

        if (error) {
            alert("Error updating therapist status.");
        } else if (data) {
            setAllAdminTherapists(allAdminTherapists.map(t => t.id === id ? data[0] : t));
        }
    };

    const handleTogglePlaceLive = async (id: number) => {
        const supabase = getSupabase();
        if(!supabase) return;
        const place = allAdminPlaces.find(p => p.id === id);
        if(!place) return;
        
        const { data, error } = await supabase
            .from('places')
            .update({ isLive: !place.isLive })
            .eq('id', id)
            .select();
        
        if (error) {
            alert("Error updating place status.");
        } else if (data) {
            setAllAdminPlaces(allAdminPlaces.map(p => p.id === id ? data[0] : p));
        }
    };

    const handleSelectRegistration = (type: 'therapist' | 'place') => {
        setProviderAuthInfo({ type, mode: 'register' });
        setPage('providerAuth');
    };
    
    const handleProviderRegister = async (email: string, agentCode?: string): Promise<{success: boolean, message: string}> => {
        if (!providerAuthInfo) return { success: false, message: t.providerAuth.genericError };
        
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: t.providerAuth.genericError };
    
        let agentId: number | undefined = undefined;
        if (agentCode) {
            const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .select('id')
                .eq('agentCode', agentCode.trim())
                .single();
            if (agentError || !agentData) {
                return { success: false, message: t.providerAuth.invalidAgentCode };
            }
            agentId = agentData.id;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const commonData: any = {
            email,
            isLive: false,
            activeMembershipDate: yesterday.toISOString().split('T')[0],
            pricing: { 60: 0, 90: 0, 120: 0 },
            analytics: { impressions: 0, profileViews: 0, whatsappClicks: 0 },
        };

        if (agentId) {
            commonData.agentId = agentId;
        }

        const table = providerAuthInfo.type === 'therapist' ? 'therapists' : 'places';
        
        const { error } = await supabase.from(table).insert([commonData]);

        if (error) {
            return { success: false, message: error.message };
        }
        
        setProviderAuthInfo(prev => prev ? { ...prev, mode: 'login' } : null);
        return { success: true, message: t.providerAuth.registerSuccess };
    };

    const handleProviderLogin = async (email: string): Promise<{success: boolean, message: string}> => {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: t.providerAuth.genericError };
        
        const { data: therapistData } = await supabase.from('therapists').select('id').eq('email', email).single();
        if (therapistData) {
            const providerData = { id: therapistData.id, type: 'therapist' as const };
            setLoggedInProvider(providerData);
            localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
            setPage('therapistDashboard');
            setProviderAuthInfo(null);
            return { success: true, message: '' };
        }

        const { data: placeData } = await supabase.from('places').select('id').eq('email', email).single();
        if (placeData) {
            const providerData = { id: placeData.id, type: 'place' as const };
            setLoggedInProvider(providerData);
            localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
            setPage('placeDashboard');
            setProviderAuthInfo(null);
            return { success: true, message: '' };
        }
        
        return { success: false, message: t.providerAuth.invalidCredentialsError };
    };


    const handleProviderLogout = () => {
        setLoggedInProvider(null);
        localStorage.removeItem('loggedInProvider');
        setPage('home');
    };

    const handleSaveTherapist = async (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => {
        const supabase = getSupabase();
        if (!supabase || !loggedInProvider) return;

        const { data, error } = await supabase
            .from('therapists')
            .update(therapistData)
            .eq('id', loggedInProvider.id)
            .select();

        if (error) {
            alert("Error saving profile.");
            console.error(error);
        } else if (data) {
            alert(t.providerDashboard.profileSaved);
        }
    };
    
    const handleSavePlace = async (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => {
        const supabase = getSupabase();
        if (!supabase || !loggedInProvider) return;

        const { data, error } = await supabase
            .from('places')
            .update(placeData)
            .eq('id', loggedInProvider.id)
            .select();

        if (error) {
            alert("Error saving profile.");
            console.error(error);
        } else if (data) {
            alert(t.providerDashboard.profileSaved);
        }
    };

    const handleAgentRegister = async (name: string, email: string): Promise<{ success: boolean; message: string }> => {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: t.agentAuth.genericError };
    
        const agentCode = `${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}-${Math.random().toString(36).substring(2, 6)}`;
    
        const { error } = await supabase.from('agents').insert([{ name, email, agentCode }]);
    
        if (error) {
            console.error('Agent creation error:', error);
            return { success: false, message: error.message };
        }
    
        return { success: true, message: t.agentAuth.registerSuccess.replace('{agentCode}', agentCode) };
    };
    
    const handleAgentLogin = async (email: string): Promise<{ success: boolean; message: string }> => {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: t.agentAuth.genericError };
    
        const { data: agentData, error } = await supabase.from('agents').select('*').eq('email', email).single();
    
        if (error || !agentData) {
            return { success: false, message: t.agentAuth.invalidCredentialsError };
        }
    
        setLoggedInAgent(agentData);
        localStorage.setItem('loggedInAgent', JSON.stringify(agentData));
        setPage('agentDashboard');
        return { success: true, message: '' };
    };

    const handleAgentLogout = async () => {
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
        setLoggedInAgent(null);
        localStorage.removeItem('loggedInAgent');
        setPage('home');
    };


    const handleSupabaseConnect = (url: string, key: string, silent = false) => {
        const client = initSupabase(url, key);
        if (client) {
            const config = { url, key };
            setSupabaseConfig(config);
            setIsSupabaseConnected(true);
            localStorage.setItem('supabaseConfig', JSON.stringify(config));
            if (!silent) {
                alert('Successfully connected to Supabase!');
                setPage('adminDashboard');
            }
        } else {
            if (!silent) {
                alert('Failed to connect to Supabase. Check credentials and console for errors.');
            }
            setIsSupabaseConnected(false);
        }
    };

    const handleSupabaseDisconnect = () => {
        disconnectSupabase();
        setSupabaseConfig(null);
        setIsSupabaseConnected(false);
        localStorage.removeItem('supabaseConfig');
        alert('Disconnected from Supabase.');
    };

    const handleUpdateMembership = async (id: number, type: 'therapist' | 'place', months: number) => {
        const supabase = getSupabase();
        if (!supabase) return;
    
        const table = type === 'therapist' ? 'therapists' : 'places';
        const providersArray = type === 'therapist' ? allAdminTherapists : allAdminPlaces;
    
        const provider = providersArray.find(p => p.id === id);
        if (!provider) return;
        
        const currentExpiry = new Date(provider.activeMembershipDate);
        const now = new Date();
        const startDate = currentExpiry > now ? currentExpiry : now;
        
        const newExpiryDate = new Date(startDate);
        newExpiryDate.setMonth(newExpiryDate.getMonth() + months);
        const newExpiryDateString = newExpiryDate.toISOString().split('T')[0];
    
        const { data, error } = await supabase
            .from(table)
            .update({ activeMembershipDate: newExpiryDateString, isLive: true })
            .eq('id', id)
            .select();
    
        if (error) {
            alert(`Error updating membership: ${error.message}`);
        } else if (data && data[0]) {
            if (type === 'therapist') {
                setAllAdminTherapists(allAdminTherapists.map(t => t.id === id ? data[0] : t));
            } else {
                setAllAdminPlaces(allAdminPlaces.map(p => p.id === id ? data[0] : p));
            }
            alert(t.adminDashboard.membershipUpdateSuccess);
        }
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

    const handleIncrementAnalytics = (id: number, type: 'therapist' | 'place', metric: keyof Analytics) => {
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
                            isLoading={isLoading}
                            t={t} />;
            case 'detail': return selectedPlace && <PlaceDetailPage place={selectedPlace} onBack={handleBackToHome} onBook={(place) => handleNavigateToBooking(place, 'place')} onIncrementAnalytics={(metric) => handleIncrementAnalytics(selectedPlace.id, 'place', metric)} t={t.detail} />;
            case 'adminLogin': return <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} onGoToSupabaseSettings={handleNavigateToSupabaseSettings} isSupabaseConnected={isSupabaseConnected} />;
            case 'adminDashboard': return isAdminLoggedIn ? <AdminDashboardPage therapists={allAdminTherapists} places={allAdminPlaces} onToggleTherapist={handleToggleTherapistLive} onTogglePlace={handleTogglePlaceLive} onLogout={handleAdminLogout} isSupabaseConnected={isSupabaseConnected} onGoToSupabaseSettings={handleNavigateToSupabaseSettings} onUpdateMembership={handleUpdateMembership} googleMapsApiKey={googleMapsApiKey} onSaveGoogleMapsApiKey={handleSaveGoogleMapsApiKey} appContactNumber={appContactNumber} onSaveAppContactNumber={handleSaveAppContactNumber} t={t.adminDashboard} /> : <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} onGoToSupabaseSettings={handleNavigateToSupabaseSettings} isSupabaseConnected={isSupabaseConnected} />;
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
            case 'agentDashboard': return loggedInAgent ? <AgentDashboardPage agent={loggedInAgent} onLogout={handleAgentLogout} t={t.agentDashboard} /> : <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            case 'serviceTerms': return <ServiceTermsPage onBack={handleBackToHome} t={t.serviceTerms} contactNumber={appContactNumber} />;
            case 'supabaseSettings': return <SupabaseSettingsPage
                    onConnect={handleSupabaseConnect}
                    onDisconnect={handleSupabaseDisconnect}
                    onBack={() => setPage('adminDashboard')}
                    config={supabaseConfig}
                    isConnected={isSupabaseConnected}
                    t={t.supabaseSettings}
                />;
            case 'membership': return loggedInProvider ? <MembershipPage onPackageSelect={handleSelectMembershipPackage} onBack={handleBackToProviderDashboard} t={t.membershipPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'booking': return providerForBooking ? <BookingPage provider={providerForBooking.provider} providerType={providerForBooking.type} onBook={handleCreateBooking} onBack={handleBackToHome} bookings={bookings.filter(b => b.providerId === providerForBooking.provider.id)} t={t.bookingPage} /> : <HomePage user={user} loggedInAgent={loggedInAgent} therapists={therapists} places={places} userLocation={userLocation} onSetUserLocation={handleSetUserLocation} onSelectPlace={handleSelectPlace} onLogout={handleLogout} onLoginClick={handleNavigateToAuth} onAdminClick={handleNavigateToAdminLogin} onCreateProfileClick={handleNavigateToRegistrationChoice} onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : handleNavigateToAgentAuth} onBook={handleNavigateToBooking} onIncrementAnalytics={handleIncrementAnalytics} isLoading={isLoading} t={t} />;
            case 'notifications': return loggedInProvider ? <NotificationsPage notifications={notifications.filter(n => n.providerId === loggedInProvider.id)} onMarkAsRead={handleMarkNotificationAsRead} onBack={handleBackToProviderDashboard} t={t.notificationsPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            default: return <LandingPage onLanguageSelect={handleLanguageSelect} />;
        }
    };
    
    const showFooter = ['home', 'detail', 'agent', 'serviceTerms'].includes(page);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col">
            {isMapsApiKeyMissing && isAdminLoggedIn && t.app && (
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
                    t={t} 
                />
            )}
        </div>
    );
};

export default App;