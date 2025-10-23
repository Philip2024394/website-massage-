import React, { useState, useMemo, useEffect } from 'react';
import type { User, Place, Therapist, UserLocation, Analytics, Agent } from '../types';
import TherapistCard from '../components/TherapistCard';
import PlaceCard from '../components/PlaceCard';
import RatingModal from '../components/RatingModal';
import LocationModal from '../components/LocationModal';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';
import HomeIcon from '../components/icons/HomeIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CloseIcon from '../components/icons/CloseIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';

interface HomePageProps {
    user: User | null;
    loggedInAgent: Agent | null;
    therapists: Therapist[];
    places: Place[];
    userLocation: UserLocation | null;
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
    onLogout: () => void;
    onLoginClick: () => void;
    onAdminClick: () => void;
    onCreateProfileClick: () => void;
    onAgentPortalClick: () => void;
    onBook: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onIncrementAnalytics: (id: number, type: 'therapist' | 'place', metric: keyof Analytics) => void;
    onMassageTypesClick: () => void;
    isLoading: boolean;
    t: any;
}

type ActiveTab = 'home' | 'places';

// Icons
const UserIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" />
    </svg>
);

const AdminIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CreateProfileIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);


const UsersIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const TherapistIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const MassagePlaceIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const HotelIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const BuildingIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 17l-4 4 4-4 6.293-6.293a1 1 0 011.414 0L21 11" />
    </svg>
);

const SearchIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};


const HomePage: React.FC<HomePageProps> = ({ user, loggedInAgent, therapists, places, userLocation, onSetUserLocation, onSelectPlace, onLogout, onLoginClick, onAdminClick, onCreateProfileClick, onAgentPortalClick, onBook, onIncrementAnalytics, onMassageTypesClick, isLoading, t }) => {
    // Safety check for translations
    if (!t || !t.home) {
        console.error('HomePage: Missing translations object or t.home', { t });
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-bold">Translation Error</p>
                    <p className="text-gray-600">Unable to load translations. Please refresh the page.</p>
                </div>
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState<ActiveTab>('home');
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [itemToRate, setItemToRate] = useState<Therapist | Place | null>(null);
    const [selectedMassageType, setSelectedMassageType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!userLocation) {
            setIsLocationModalOpen(true);
        }
    }, [userLocation]);
    
    useEffect(() => {
        // Simulate impression tracking for all live providers once
        therapists.forEach(p => onIncrementAnalytics(p.id, 'therapist', 'impressions'));
        places.forEach(p => onIncrementAnalytics(p.id, 'place', 'impressions'));
    }, [therapists, places, onIncrementAnalytics]); 

    const processedTherapists = useMemo(() => {
        let filtered = therapists.filter(therapist => {
            const typeMatch = selectedMassageType === 'all' || therapist.massageTypes.includes(selectedMassageType);
            const searchMatch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase());
            return typeMatch && searchMatch;
        });

        if (userLocation) {
            return filtered.map(therapist => {
                let coords = { lat: 0, lng: 0 };
                try {
                    coords = typeof therapist.coordinates === 'string' ? JSON.parse(therapist.coordinates) : therapist.coordinates;
                } catch (e) {
                    console.warn('Invalid coordinates for therapist:', therapist.id);
                }
                
                return {
                    ...therapist,
                    distance: parseFloat(getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng).toFixed(1))
                };
            }).sort((a, b) => a.distance - b.distance);
        }
        
        return filtered;
    }, [therapists, userLocation, selectedMassageType, searchQuery]);
    
    const processedPlaces = useMemo(() => {
        let filtered = places.filter(place => {
            const typeMatch = selectedMassageType === 'all' || place.massageTypes.includes(selectedMassageType);
            const searchMatch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
            return typeMatch && searchMatch;
        });

        if (userLocation) {
             return filtered.map(place => {
                let coords = { lat: 0, lng: 0 };
                try {
                    coords = typeof place.coordinates === 'string' ? JSON.parse(place.coordinates) : place.coordinates;
                } catch (e) {
                    console.warn('Invalid coordinates for place:', place.id);
                }
                
                return {
                    ...place,
                    distance: parseFloat(getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng).toFixed(1))
                };
            }).sort((a, b) => a.distance - b.distance);
        }

        return filtered;
    }, [places, userLocation, selectedMassageType, searchQuery]);


    const handleOpenRatingModal = (item: Therapist | Place) => {
        setItemToRate(item);
        setIsRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalOpen(false);
        setItemToRate(null);
    };

    const onlineTherapistsCount = useMemo(() => therapists.filter(t => t.status === 'Available').length, [therapists]);

    const renderTherapists = () => {
        if (isLoading) {
            return <p className="text-center text-gray-500 py-8">{t.home.loading}</p>;
        }
        if (processedTherapists.length === 0) {
            return <p className="text-center text-gray-500 py-8">{t.home.noResults}</p>;
        }
        return (
            <div className="space-y-4">
                {processedTherapists.map(therapist => <TherapistCard 
                    key={therapist.id} 
                    therapist={therapist} 
                    onRate={handleOpenRatingModal}
                    onBook={() => onBook(therapist, 'therapist')}
                    onIncrementAnalytics={(metric) => onIncrementAnalytics(therapist.id, 'therapist', metric)}
                    t={t.home.therapistCard}
                />)}
            </div>
        );
    };

    const renderPlaces = () => {
        if (isLoading) {
            return <p className="text-center text-gray-500 py-8">{t.home.loading}</p>;
        }
         if (processedPlaces.length === 0) {
            return <p className="text-center text-gray-500 py-8">{t.home.noResults}</p>;
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {processedPlaces.map(place => <PlaceCard key={place.id} place={place} onClick={() => onSelectPlace(place)} onRate={handleOpenRatingModal} />)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
             <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Indo</span><span className="text-orange-500">street</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsLocationModalOpen(true)} title="Set Your Location">
                            <MapPinIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {isMenuOpen && (
                <div className="fixed inset-0 z-30" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-2xl text-white mb-1">Menu</h2>
                                    <p className="text-orange-100 text-sm">Choose your portal</p>
                                </div>
                                <button 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="text-white hover:bg-white/20 p-2 rounded-full transition-all" 
                                    aria-label="Close menu"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                {/* User Login */}
                                <button 
                                    onClick={() => { (user ? onLogout() : onLoginClick()); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <div className="p-3 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
                                        <UserSolidIcon className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            {user ? 'Logout' : 'Customer Login'}
                                        </h3>
                                        <p className="text-xs text-gray-500">Book massage services</p>
                                    </div>
                                </button>

                                {/* Therapist Login */}
                                <button 
                                    onClick={() => { onCreateProfileClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                >
                                    <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                        <TherapistIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            Therapist Portal
                                        </h3>
                                        <p className="text-xs text-gray-500">Manage your profile</p>
                                    </div>
                                </button>

                                {/* Massage Place Login */}
                                <button 
                                    onClick={() => { onCreateProfileClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-green-500 group"
                                >
                                    <div className="p-3 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                                        <MassagePlaceIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                                            Massage Place
                                        </h3>
                                        <p className="text-xs text-gray-500">Business dashboard</p>
                                    </div>
                                </button>

                                {/* Agent Portal */}
                                <button 
                                    onClick={() => { onAgentPortalClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-purple-500 group"
                                >
                                    <div className="p-3 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                                        <BriefcaseIcon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                            {loggedInAgent ? 'Agent Dashboard' : 'Agent Portal'}
                                        </h3>
                                        <p className="text-xs text-gray-500">Earn commissions</p>
                                    </div>
                                </button>

                                {/* Hotel/Villa Portal */}
                                <button 
                                    onClick={() => { onCreateProfileClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-pink-500 group"
                                >
                                    <div className="p-3 rounded-lg bg-pink-50 group-hover:bg-pink-100 transition-colors">
                                        <HotelIcon className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                                            Hotel & Villa
                                        </h3>
                                        <p className="text-xs text-gray-500">Partner services</p>
                                    </div>
                                </button>

                                {/* Divider */}
                                <div className="border-t border-gray-300 my-3"></div>

                                {/* Admin Login */}
                                <button 
                                    onClick={() => { onAdminClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 shadow-sm hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                                        <AdminIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-white">
                                            Admin Portal
                                        </h3>
                                        <p className="text-xs text-gray-400">System management</p>
                                    </div>
                                </button>
                            </div>
                        </nav>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-center text-gray-500">
                                © 2025 IndoStreet Massage
                            </p>
                        </div>
                    </div>
                </div>
            )}


            <main className="p-4">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                    <UsersIcon className="w-5 h-5"/>
                    <span className="font-medium">{t.home.therapistsOnline.replace('{count}', onlineTherapistsCount).replace('{total}', therapists.length)}</span>
                </div>

                <div className="flex bg-gray-200 rounded-full p-1 mb-4">
                    <button 
                        onClick={() => setActiveTab('home')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <HomeIcon className="w-5 h-5" />
                        {t.home.homeServiceTab}
                    </button>
                    <button 
                        onClick={() => setActiveTab('places')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <BuildingIcon />
                        {t.home.massagePlacesTab}
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-grow">
                            <SparklesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            <select 
                                className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={selectedMassageType}
                                onChange={e => setSelectedMassageType(e.target.value)}
                            >
                                <option value="all">{t.home.massageType}</option>
                                {MASSAGE_TYPES_CATEGORIZED.map(category => (
                                    <optgroup label={category.category} key={category.category}>
                                        {category.types.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                        </div>
                        <button onClick={onMassageTypesClick} className="ml-3 text-orange-500 font-semibold text-sm whitespace-nowrap hover:text-orange-600 transition-colors">
                            Massage Directory
                        </button>
                    </div>
                </div>

                {activeTab === 'home' ? renderTherapists() : renderPlaces()}
            </main>
            <AddToHomeScreenPrompt t={t.a2hsPrompt} />
            {isLocationModalOpen && (
                <LocationModal
                    onConfirm={(location) => {
                        onSetUserLocation(location);
                        setIsLocationModalOpen(false);
                    }}
                    onClose={() => setIsLocationModalOpen(false)}
                    t={t.locationModal}
                />
            )}
            {isRatingModalOpen && itemToRate && (
                <RatingModal
                    itemName={itemToRate.name}
                    itemId={itemToRate.id}
                    itemType={'status' in itemToRate ? 'therapist' : 'place'}
                    onClose={handleCloseRatingModal}
                    onSubmit={handleCloseRatingModal}
                    t={t.ratingModal}
                />
            )}
        </div>
    );
};

export default HomePage;