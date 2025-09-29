

import React, { useState, useEffect } from 'react';
import type { User, Place, Therapist, UserLocation } from './types';
import { AvailabilityStatus } from './types';
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
import ServiceTermsPage from './pages/ServiceTermsPage';
import Footer from './components/Footer';
import ProviderAuthPage from './pages/ProviderAuthPage';

import { translations } from './translations';
import { MOCK_THERAPISTS, MOCK_PLACES } from './constants';

type Page = 'landing' | 'auth' | 'home' | 'detail' | 'adminLogin' | 'adminDashboard' | 'registrationChoice' | 'providerAuth' | 'therapistDashboard' | 'placeDashboard' | 'agent' | 'serviceTerms';
type Language = 'en' | 'id';
type LoggedInProvider = { id: number; type: 'therapist' | 'place' };

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('landing');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    
    const [therapists, setTherapists] = useState<Therapist[]>(MOCK_THERAPISTS);
    const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
    
    // Provider auth state
    const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);
    const [providerAuthInfo, setProviderAuthInfo] = useState<{ type: 'therapist' | 'place', mode: 'login' | 'register' } | null>(null);


    useEffect(() => {
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
        
        const storedLocation = localStorage.getItem('user_location');
        if (storedLocation) {
            try {
                setUserLocation(JSON.parse(storedLocation));
            } catch (e) {
                console.error("Failed to parse user location", e);
                localStorage.removeItem('user_location');
            }
        }
    }, []);

    const t = translations[language];

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setPage('home');
    };

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        setPage('home');
    };
    
    const handleSetUserLocation = (location: UserLocation) => {
        setUserLocation(location);
        localStorage.setItem('user_location', JSON.stringify(location));
    };

    const handleLogout = () => {
        setUser(null);
        setPage('home');
    };
    
    const handleSelectPlace = (place: Place) => {
        setSelectedPlace(place);
        setPage('detail');
    };

    const handleBackToHome = () => {
        setSelectedPlace(null);
        setProviderAuthInfo(null);
        setPage('home');
    };
    
    const handleNavigateToAuth = () => setPage('auth');
    const handleNavigateToAdminLogin = () => setPage('adminLogin');
    const handleNavigateToRegistrationChoice = () => setPage('registrationChoice');
    const handleNavigateToAgentPage = () => setPage('agent');
    const handleNavigateToServiceTerms = () => setPage('serviceTerms');
    
    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
        setPage('adminDashboard');
    };
    
    const handleAdminLogout = () => {
        setIsAdminLoggedIn(false);
        setPage('home');
    }

    const handleToggleTherapistLive = (id: number) => {
        setTherapists(therapists.map(therapist => therapist.id === id ? { ...therapist, isLive: !therapist.isLive } : therapist));
    };

    const handleTogglePlaceLive = (id: number) => {
        setPlaces(places.map(place => place.id === id ? { ...place, isLive: !place.isLive } : place));
    };

    const handleSelectRegistration = (type: 'therapist' | 'place') => {
        setProviderAuthInfo({ type, mode: 'register' });
        setPage('providerAuth');
    };
    
    const handleProviderRegister = (email: string, password: string): {success: boolean, message: string} => {
        if (!providerAuthInfo) return { success: false, message: t.providerAuth.genericError };

        const emailExists = therapists.some(t => t.email === email) || places.some(p => p.email === email);
        if (emailExists) {
            return { success: false, message: t.providerAuth.emailExistsError };
        }

        const newId = Date.now();
        if (providerAuthInfo.type === 'therapist') {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const newTherapist: Therapist = {
                id: newId,
                email,
                password,
                name: '',
                profilePicture: '',
                description: '',
                status: AvailabilityStatus.Offline,
                pricing: { 60: 0, 90: 0, 120: 0 },
                whatsappNumber: '',
                distance: 0,
                rating: 0,
                reviewCount: 0,
                massageTypes: [],
                isLive: false,
                location: '',
                coordinates: { lat: 0, lng: 0 },
                activeMembershipDate: nextMonth.toISOString().split('T')[0],
            };
            setTherapists(prev => [...prev, newTherapist]);
        } else {
             const newPlace: Place = {
                id: newId,
                email,
                password,
                name: '',
                description: '',
                mainImage: '',
                thumbnailImages: [],
                pricing: { 60: 0, 90: 0, 120: 0 },
                whatsappNumber: '',
                distance: 0,
                rating: 0,
                reviewCount: 0,
                massageTypes: [],
                isLive: false,
                location: '',
                coordinates: { lat: 0, lng: 0 },
                openingTime: '',
                closingTime: '',
            };
            setPlaces(prev => [...prev, newPlace]);
        }
        
        setProviderAuthInfo(prev => prev ? { ...prev, mode: 'login' } : null);
        return { success: true, message: t.providerAuth.registerSuccess };
    };

    const handleProviderLogin = (email: string, password: string): {success: boolean, message: string} => {
        const therapist = therapists.find(t => t.email === email && t.password === password);
        if (therapist) {
            const providerData = { id: therapist.id, type: 'therapist' as const };
            setLoggedInProvider(providerData);
            localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
            setPage('therapistDashboard');
            setProviderAuthInfo(null);
            return { success: true, message: '' };
        }

        const place = places.find(p => p.email === email && p.password === password);
        if (place) {
            const providerData = { id: place.id, type: 'place' as const };
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

    const handleSaveTherapist = (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate'>) => {
        const existingTherapist = therapists.find(t => t.id === loggedInProvider!.id);

        if (existingTherapist) {
            const updatedTherapist = { ...existingTherapist, ...therapistData };
            setTherapists(therapists.map(t => t.id === loggedInProvider!.id ? updatedTherapist : t));
        } else {
            // This case should ideally not be hit in the new flow, but kept as a fallback.
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const newTherapist: Therapist = {
                ...therapistData,
                id: loggedInProvider!.id,
                isLive: false,
                rating: 0,
                reviewCount: 0,
                activeMembershipDate: nextMonth.toISOString().split('T')[0],
            };
            setTherapists([...therapists, newTherapist]);
        }
        alert(t.providerDashboard.profileSaved);
    };
    
    const handleSavePlace = (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount'>) => {
         const newPlace: Place = {
            ...placeData,
            id: loggedInProvider!.id,
            isLive: false,
            rating: 0,
            reviewCount: 0,
        };

        const existingIndex = places.findIndex(p => p.id === newPlace.id);
        if (existingIndex > -1) {
            setPlaces(places.map(p => p.id === newPlace.id ? newPlace : p));
        } else {
            setPlaces([...places, newPlace]);
        }
        alert(t.providerDashboard.profileSaved);
    };

    const renderPage = () => {
        switch (page) {
            case 'landing': return <LandingPage onLanguageSelect={handleLanguageSelect} />;
            case 'auth': return <AuthPage onLogin={handleLogin} onBack={handleBackToHome} t={t.auth} />;
            case 'home':
                return <HomePage 
                            user={user} 
                            therapists={therapists}
                            places={places}
                            userLocation={userLocation}
                            onSetUserLocation={handleSetUserLocation}
                            onSelectPlace={handleSelectPlace} 
                            onLogout={handleLogout}
                            onLoginClick={handleNavigateToAuth}
                            onAdminClick={handleNavigateToAdminLogin}
                            onCreateProfileClick={handleNavigateToRegistrationChoice}
                            t={t} />;
            case 'detail': return selectedPlace && <PlaceDetailPage place={selectedPlace} onBack={handleBackToHome} t={t.detail} />;
            case 'adminLogin': return <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'adminDashboard': return isAdminLoggedIn ? <AdminDashboardPage therapists={therapists} places={places} onToggleTherapist={handleToggleTherapistLive} onTogglePlace={handleTogglePlaceLive} onLogout={handleAdminLogout} t={t.adminDashboard} /> : <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
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
            case 'therapistDashboard': return loggedInProvider ? <TherapistDashboardPage onSave={handleSaveTherapist} onBack={handleBackToHome} onLogout={handleProviderLogout} t={t.providerDashboard} therapist={therapists.find(t => t.id === loggedInProvider?.id)} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'placeDashboard': return loggedInProvider ? <PlaceDashboardPage onSave={handleSavePlace} onBack={handleBackToHome} onLogout={handleProviderLogout} t={t.providerDashboard} place={places.find(p => p.id === loggedInProvider?.id)} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            case 'agent': return <AgentPage onBack={handleBackToHome} t={t.agentPage} />;
            case 'serviceTerms': return <ServiceTermsPage onBack={handleBackToHome} t={t.serviceTerms} />;
            default: return <LandingPage onLanguageSelect={handleLanguageSelect} />;
        }
    };
    
    const showFooter = ['home', 'detail', 'agent', 'serviceTerms'].includes(page);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col">
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