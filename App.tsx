
import React, { useState } from 'react';
import type { User, Place, Therapist } from './types';
import { AvailabilityStatus } from './types';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LandingPage from './pages/LandingPage';
import LocationModal from './components/LocationModal';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistDashboardPage from './pages/TherapistDashboardPage';
import PlaceDashboardPage from './pages/PlaceDashboardPage';
import AgentPage from './pages/AgentPage';
import ServiceTermsPage from './pages/ServiceTermsPage';
import Footer from './components/Footer';

import { translations } from './translations';
import { MOCK_THERAPISTS, MOCK_PLACES } from './constants';

type Page = 'landing' | 'auth' | 'home' | 'detail' | 'adminLogin' | 'adminDashboard' | 'registrationChoice' | 'therapistDashboard' | 'placeDashboard' | 'agent' | 'serviceTerms';
type Language = 'en' | 'id';
type LoggedInProvider = { id: number; type: 'therapist' | 'place' };

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('landing');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);

    const [therapists, setTherapists] = useState<Therapist[]>(MOCK_THERAPISTS);
    const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);

    const t = translations[language];

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setPage('home');
    };

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        setPage('home');
        const location = localStorage.getItem('user_location');
        if (!location) {
            setIsLocationModalOpen(true);
        }
    };
    
    const handleLocationConfirm = () => {
        localStorage.setItem('user_location', JSON.stringify({ set: true }));
        setIsLocationModalOpen(false);
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
        setLoggedInProvider(null);
        setIsAdminLoggedIn(false);
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
        if (type === 'therapist') {
            const newId = Date.now();
            setLoggedInProvider({ id: newId, type: 'therapist' });
            setPage('therapistDashboard');
        } else {
            const newId = Date.now();
            setLoggedInProvider({ id: newId, type: 'place' });
            setPage('placeDashboard');
        }
    };

    const handleSaveTherapist = (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate'>) => {
        const existingTherapist = therapists.find(t => t.id === loggedInProvider!.id);

        if (existingTherapist) {
            const updatedTherapist = { ...existingTherapist, ...therapistData };
            setTherapists(therapists.map(t => t.id === loggedInProvider!.id ? updatedTherapist : t));
        } else {
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
            case 'auth': return <AuthPage onLogin={handleLogin} t={t.auth} />;
            case 'home':
                return <HomePage 
                            user={user} 
                            therapists={therapists}
                            places={places}
                            onSelectPlace={handleSelectPlace} 
                            onLogout={handleLogout}
                            onLoginClick={handleNavigateToAuth}
                            onAdminClick={handleNavigateToAdminLogin}
                            onCreateProfileClick={handleNavigateToRegistrationChoice}
                            t={t} />;
            case 'detail': return selectedPlace && <PlaceDetailPage place={selectedPlace} onBack={handleBackToHome} t={t.detail} />;
            case 'adminLogin': return <AdminLoginPage onAdminLogin={handleAdminLogin} t={t.adminLogin} />;
            case 'adminDashboard': return isAdminLoggedIn ? <AdminDashboardPage therapists={therapists} places={places} onToggleTherapist={handleToggleTherapistLive} onTogglePlace={handleTogglePlaceLive} onLogout={handleAdminLogout} t={t.adminDashboard} /> : <AdminLoginPage onAdminLogin={handleAdminLogin} t={t.adminLogin} />;
            case 'registrationChoice': return <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            case 'therapistDashboard': return loggedInProvider ? <TherapistDashboardPage onSave={handleSaveTherapist} onBack={handleBackToHome} t={t.providerDashboard} therapist={therapists.find(t => t.id === loggedInProvider?.id)} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'placeDashboard': return loggedInProvider ? <PlaceDashboardPage onSave={handleSavePlace} onBack={handleBackToHome} t={t.providerDashboard} place={places.find(p => p.id === loggedInProvider?.id)} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
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
            {isLocationModalOpen && <LocationModal onClose={handleLocationConfirm} t={t.locationModal} />}
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
