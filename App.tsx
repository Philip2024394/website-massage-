

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Analytics, Agent, AdminMessage } from './types';
import { BookingStatus } from './types';
import { dataService } from './services/dataService';
// import AuthPage from './pages/AuthPage';
import UnifiedLoginPage from './pages/UnifiedLoginPage';
import HomePage from './pages/HomePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LandingPage from './pages/LandingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistDashboardPage from './pages/TherapistDashboardPage';
import TherapistStatusPage from './pages/TherapistStatusPage';
import PlaceDashboardPage from './pages/PlaceDashboardPage';
import AgentPage from './pages/AgentPage';
import AgentAuthPage from './pages/AgentAuthPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AgentTermsPage from './pages/AgentTermsPage';
import ServiceTermsPage from './pages/ServiceTermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import Footer from './components/Footer';
import MembershipPage from './pages/MembershipPage';
import BookingPage from './pages/BookingPage';
import NotificationsPage from './pages/NotificationsPage';
import MassageTypesPage from './pages/MassageTypesPage';
import HotelDashboardPage from './pages/HotelDashboardPage';
import VillaDashboardPage from './pages/VillaDashboardPage';
import JoinIndoStreetPage from './pages/JoinIndoStreetPage';
// import UnifiedLoginPage from './pages/UnifiedLoginPage';
import { translations } from './translations/index.ts';
import { therapistService, placeService, agentService } from './lib/appwriteService';

type Page = 'landing' | 'auth' | 'home' | 'detail' | 'adminLogin' | 'adminDashboard' | 'registrationChoice' | 'providerAuth' | 'therapistStatus' | 'therapistDashboard' | 'placeDashboard' | 'agent' | 'agentAuth' | 'agentDashboard' | 'agentTerms' | 'serviceTerms' | 'privacy' | 'membership' | 'booking' | 'bookings' | 'notifications' | 'massageTypes' | 'hotelLogin' | 'hotelDashboard' | 'villaLogin' | 'villaDashboard' | 'unifiedLogin' | 'joinIndoStreet';
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
    const [_allAdminTherapists, setAllAdminTherapists] = useState<Therapist[]>([]);
    const [_allAdminPlaces, setAllAdminPlaces] = useState<Place[]>([]);
    
    // Loading state
    const [isLoading, setIsLoading] = useState(true);
    
    // Provider auth state
    const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);
    const [_providerAuthInfo, setProviderAuthInfo] = useState<{ type: 'therapist' | 'place', mode: 'login' | 'register' } | null>(null);
    const [providerForBooking, setProviderForBooking] = useState<{ provider: Therapist | Place; type: 'therapist' | 'place' } | null>(null);
    
    // Agent state
    const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);
    const [impersonatedAgent, setImpersonatedAgent] = useState<Agent | null>(null);
    const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
    
    // Hotel/Villa state
    const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false);
    const [isVillaLoggedIn, setIsVillaLoggedIn] = useState(false);
    
    // App config state
    const appContactNumber = '6281392000050';

    const fetchPublicData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [therapistsData, placesData] = await Promise.all([
                dataService.getTherapists(),
                dataService.getPlaces()
            ]);
            
            console.log('🏠 HomePage: Fetched therapists:', therapistsData?.length);
            therapistsData?.forEach((t: any) => {
                console.log(`  👤 ${t.name}:`, {
                    profilePicture: t.profilePicture?.substring(0, 60) + '...',
                    isLive: t.isLive,
                    id: t.id || t.$id
                });
            });
            
            const liveTherapists = therapistsData?.filter((t: any) => t.isLive === true);
            console.log('✅ Live therapists count:', liveTherapists?.length);
            
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

        setAllAdminTherapists(therapistsData || []);
        setAllAdminPlaces(placesData || []);

        setIsLoading(false);
    }, []);


    // DEV ONLY: Bypass all login and show all dashboards
    useEffect(() => {
        setIsAdminLoggedIn(true);
        setIsHotelLoggedIn(true);
        setIsVillaLoggedIn(true);
        setLoggedInProvider({ id: 'dev', type: 'therapist' });
        setLoggedInAgent({ id: 0, name: 'Dev Agent', email: 'dev@dev.com', agentCode: 'DEV', hasAcceptedTerms: true });
        setPage('adminDashboard'); // Default to admin, change as needed
        
        // Always fetch public data on mount
        fetchPublicData().catch(err => {
            console.error('Error fetching initial data:', err);
            setTherapists([]);
            setPlaces([]);
        });
        
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
        try {
            // TODO: Implement logout with Appwrite
            setUser(null);
            setIsAdminLoggedIn(false);
            setIsHotelLoggedIn(false);
            setIsVillaLoggedIn(false);
            setLoggedInProvider(null);
            setLoggedInAgent(null);
            
            // Reload public data to ensure we have therapists
            await fetchPublicData();
            
            setPage('home');
        } catch (error) {
            console.error('Error during logout:', error);
            setPage('home');
        }
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
    
    const handleNavigateToAuth = () => setPage('unifiedLogin');

    const handleNavigateToRegistrationChoice = () => setPage('registrationChoice');
    const handleNavigateToServiceTerms = () => setPage('serviceTerms');
    const handleNavigateToPrivacyPolicy = () => setPage('privacy');
    const handleNavigateToNotifications = () => setPage('notifications');
    const handleNavigateToAgentAuth = () => setPage('agentAuth');
    const handleNavigateToHotelLogin = () => setPage('hotelLogin');
    
    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
        setPage('adminDashboard');
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


    const handleSelectRegistration = (type: 'therapist' | 'place') => {
        setProviderAuthInfo({ type, mode: 'register' });
        setPage('providerAuth');
    };

    const _handleProviderLogin = async (email: string): Promise<{success: boolean, message: string}> => {
        try {
            const therapists = await therapistService.getAll();
            const therapist = therapists.find((t: any) => t.email === email);
            
            if (therapist) {
                const providerData = { id: therapist.$id, type: 'therapist' as const };
                setLoggedInProvider(providerData);
                localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
                setPage('therapistStatus');
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
    
    const handleNavigateToTherapistDashboard = () => {
        setPage('therapistDashboard');
    };
    
    const handleTherapistStatusChange = async (status: string) => {
        if (!loggedInProvider || loggedInProvider.type !== 'therapist') return;
        
        try {
            // Update status in backend
            const therapist = therapists.find(t => t.id === loggedInProvider.id);
            if (therapist) {
                await handleSaveTherapist({
                    ...therapist,
                    status: status as any
                });
            }
        } catch (error) {
            console.error('Error updating therapist status:', error);
        }
    };

    const handleSaveTherapist = async (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            // Use string ID for Appwrite
            const therapistId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            
            // Validate profilePicture length (max 512 chars for Appwrite)
            const profilePicture = therapistData.profilePicture || '';
            console.log('💾 Saving therapist profile with profilePicture:', profilePicture);
            console.log('📏 ProfilePicture length:', profilePicture.length);
            
            if (profilePicture.length > 512) {
                alert('Profile picture URL is too long. Please use a shorter URL or upload the image to a hosting service.');
                return;
            }
            
            // First, try to fetch existing therapist data
            let existingTherapist: any = null;
            try {
                existingTherapist = await therapistService.getById(therapistId);
                console.log('📖 Found existing therapist profile:', existingTherapist);
            } catch (error) {
                console.log('📝 No existing profile found, will create new one');
            }
            
            const updateData: any = {
                ...therapistData,
                profilePicture: profilePicture, // Ensure it's within 512 char limit
                id: therapistId, // Add required id field
                therapistId: therapistId, // Add required therapistId field
                hotelId: '', // Required by schema but not used for therapists (only for hotel/villa services)
                pricing: typeof therapistData.pricing === 'string' ? therapistData.pricing : JSON.stringify(therapistData.pricing),
                analytics: typeof therapistData.analytics === 'string' ? therapistData.analytics : JSON.stringify(therapistData.analytics),
                specialization: 'Massage Therapist', // Simple string under 128 chars (massageTypes contains the detailed list)
                yearsOfExperience: (therapistData as any).yearsOfExperience || 0, // Add required yearsOfExperience field
                isLicensed: (therapistData as any).isLicensed || false, // Add required isLicensed field
                availability: '[]', // Required by Appwrite schema (empty array for therapists who use status instead)
                hourlyRate: 100, // Required by schema (50-500 range) - therapists use pricing for 60/90/120 min sessions instead
            };
            
            // If profile exists, preserve important fields that shouldn't be overwritten
            if (existingTherapist) {
                console.log('✏️ Updating existing profile, preserving isLive, email, rating, reviewCount, activeMembershipDate');
                await therapistService.update(therapistId, updateData);
            } else {
                // Create new profile with default values for admin-controlled fields
                console.log('➕ Creating new profile with isLive=false (requires admin activation)');
                const createData = {
                    ...updateData,
                    isLive: false, // New profiles require admin activation
                    email: `therapist${therapistId}@indostreet.com`, // Placeholder email
                };
                await therapistService.create(createData);
            }
            
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
            setPage('therapistStatus'); // Changed to status page
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

    const renderPage = () => {
        if (isLoading && page !== 'landing') {
            return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
        }

        switch (page) {
            case 'landing': return <LandingPage onLanguageSelect={handleLanguageSelect} onJoinClick={() => setPage('joinIndoStreet')} />;
            case 'joinIndoStreet': return <JoinIndoStreetPage />;
            // case 'auth': return <AuthPage onAuthSuccess={() => setPage('home')} onBack={handleBackToHome} t={t.auth} />;
            case 'unifiedLogin': return <UnifiedLoginPage />;
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
                            onCreateProfileClick={handleNavigateToRegistrationChoice}
                            onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : handleNavigateToAgentAuth}
                            onBook={handleNavigateToBooking}
                            onIncrementAnalytics={handleIncrementAnalytics}
                            onMassageTypesClick={() => setPage('massageTypes')}
                            onHotelPortalClick={handleNavigateToHotelLogin}
                            onTermsClick={handleNavigateToServiceTerms}
                            onPrivacyClick={handleNavigateToPrivacyPolicy}
                            isLoading={isLoading}
                            t={t} />;
            case 'detail': return selectedPlace && <PlaceDetailPage place={selectedPlace} onBack={handleBackToHome} onBook={(place) => handleNavigateToBooking(place, 'place')} onIncrementAnalytics={(metric) => handleIncrementAnalytics(selectedPlace.id, 'place', metric)} t={t.detail} />;
            // case 'adminLogin': return <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'adminDashboard': return isAdminLoggedIn ? <AdminDashboardPage onLogout={handleAdminLogout} /> : <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'registrationChoice': return <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            // case 'providerAuth': return providerAuthInfo && <ProviderAuthPage ... />;
            case 'therapistStatus': return loggedInProvider ? <TherapistStatusPage
                therapist={therapists.find(t => t.id === loggedInProvider.id) || null}
                onStatusChange={handleTherapistStatusChange}
                onNavigateToDashboard={handleNavigateToTherapistDashboard}
                t={t.providerDashboard}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'therapistDashboard': return loggedInProvider ? <TherapistDashboardPage 
                onSave={handleSaveTherapist} 
                onLogout={handleProviderLogout} 
                onNavigateToNotifications={handleNavigateToNotifications}
                onNavigateToHome={handleBackToHome}
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
            case 'agent': return <AgentPage onBack={handleBackToHome} onNavigateToAgentAuth={handleNavigateToAgentAuth} t={t.agentPage} contactNumber={appContactNumber} />;
            case 'agentAuth': return <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            case 'agentTerms': return loggedInAgent ? <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} /> : null;
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
                return null;
            case 'serviceTerms': return <ServiceTermsPage onBack={handleBackToHome} t={t.serviceTerms} contactNumber={appContactNumber} />;
            case 'privacy': return <PrivacyPolicyPage onBack={handleBackToHome} t={t.privacyPolicy} />;
            case 'membership': return loggedInProvider ? <MembershipPage onPackageSelect={handleSelectMembershipPackage} onBack={handleBackToProviderDashboard} t={t.membershipPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'booking': return providerForBooking ? <BookingPage provider={providerForBooking.provider} providerType={providerForBooking.type} onBook={handleCreateBooking} onBack={handleBackToHome} bookings={bookings.filter(b => b.providerId === providerForBooking.provider.id)} t={t.bookingPage} /> : <HomePage user={user} loggedInAgent={loggedInAgent} therapists={therapists} places={places} userLocation={userLocation} onSetUserLocation={handleSetUserLocation} onSelectPlace={handleSelectPlace} onLogout={handleLogout} onLoginClick={handleNavigateToAuth} onCreateProfileClick={handleNavigateToRegistrationChoice} onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : handleNavigateToAgentAuth} onBook={handleNavigateToBooking} onIncrementAnalytics={handleIncrementAnalytics} onMassageTypesClick={() => setPage('massageTypes')} onHotelPortalClick={handleNavigateToHotelLogin} isLoading={isLoading} t={t} />;
            case 'notifications': return loggedInProvider ? <NotificationsPage notifications={notifications.filter(n => n.providerId === loggedInProvider.id)} onMarkAsRead={handleMarkNotificationAsRead} onBack={handleBackToProviderDashboard} t={t.notificationsPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'massageTypes': return <MassageTypesPage onBack={handleBackToHome} />;
            // case 'hotelLogin': return <HotelLoginPage onHotelLogin={handleHotelLogin} onBack={handleBackToHome} />;
            case 'hotelDashboard': return isHotelLoggedIn ? <HotelDashboardPage onLogout={handleHotelLogout} /> : null;
            // case 'villaLogin': return <VillaLoginPage onVillaLogin={handleVillaLogin} onBack={handleBackToHome} />;
            case 'villaDashboard': return isVillaLoggedIn ? <VillaDashboardPage onLogout={handleVillaLogout} /> : null;
            default: return <LandingPage onLanguageSelect={handleLanguageSelect} />;
        }
    };
    
    // Determine user role for footer
    const getUserRole = (): 'user' | 'therapist' | 'place' | null => {
        if (!loggedInProvider) return null;
        return loggedInProvider.type;
    };

    // Calculate unread notifications for providers
    const unreadNotifications = loggedInProvider 
        ? notifications.filter(n => n.providerId === loggedInProvider.id && !n.isRead).length 
        : 0;

    // Check for new bookings (bookings in pending status)
    const hasNewBookings = loggedInProvider
        ? bookings.some(b => b.providerId === loggedInProvider.id && b.status === BookingStatus.Pending)
        : false;

    // Check for WhatsApp click notifications
    const hasWhatsAppClick = loggedInProvider
        ? notifications.some(n => n.providerId === loggedInProvider.id && !n.isRead && n.message.includes('WhatsApp'))
        : false;

        const showFooter = ['home', 'therapistStatus', 'therapistDashboard', 'placeDashboard'].includes(page);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col">
            <div className="flex-grow pb-16">
                {renderPage()}
            </div>
            {showFooter && (
                <Footer 
                    userRole={getUserRole()}
                    currentPage={page}
                    unreadNotifications={unreadNotifications}
                    hasNewBookings={hasNewBookings}
                    hasWhatsAppClick={hasWhatsAppClick}
                    onHomeClick={() => setPage(loggedInProvider ? (loggedInProvider.type === 'therapist' ? 'therapistStatus' : 'placeDashboard') : 'home')}
                    onNotificationsClick={() => setPage('notifications')}
                    onBookingsClick={() => setPage('bookings')}
                    onProfileClick={() => setPage(loggedInProvider ? (loggedInProvider.type === 'therapist' ? 'therapistDashboard' : 'placeDashboard') : 'home')}
                    t={t} 
                />
            )}
        </div>
    );
};

export default App;