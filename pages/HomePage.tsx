

import React, { useState, useMemo } from 'react';
import type { User, Place, Therapist, UserLocation } from '../types';
import TherapistCard from '../components/TherapistCard';
import PlaceCard from '../components/PlaceCard';
import RatingModal from '../components/RatingModal';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';
import HomeIcon from '../components/icons/HomeIcon';
import MapPinIcon from '../components/icons/MapPinIcon';

interface HomePageProps {
    user: User | null;
    therapists: Therapist[];
    places: Place[];
    userLocation: UserLocation | null;
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
    onLogout: () => void;
    onLoginClick: () => void;
    onAdminClick: () => void;
    onCreateProfileClick: () => void;
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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


const HomePage: React.FC<HomePageProps> = ({ user, therapists, places, userLocation, onSetUserLocation, onSelectPlace, onLogout, onLoginClick, onAdminClick, onCreateProfileClick, t }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('home');
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [itemToRate, setItemToRate] = useState<Therapist | Place | null>(null);
    const [selectedMassageType, setSelectedMassageType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    const liveTherapists = useMemo(() => therapists.filter(therapist => therapist.isLive), [therapists]);
    const livePlaces = useMemo(() => places.filter(place => place.isLive), [places]);

    const processedTherapists = useMemo(() => {
        let filtered = liveTherapists.filter(therapist => {
            const typeMatch = selectedMassageType === 'all' || therapist.massageTypes.includes(selectedMassageType);
            const searchMatch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase());
            return typeMatch && searchMatch;
        });

        if (userLocation) {
            return filtered.map(therapist => ({
                ...therapist,
                distance: parseFloat(getDistance(userLocation.lat, userLocation.lng, therapist.coordinates.lat, therapist.coordinates.lng).toFixed(1))
            })).sort((a, b) => a.distance - b.distance);
        }
        
        return filtered;
    }, [liveTherapists, userLocation, selectedMassageType, searchQuery]);
    
    const processedPlaces = useMemo(() => {
        let filtered = livePlaces.filter(place => {
            const typeMatch = selectedMassageType === 'all' || place.massageTypes.includes(selectedMassageType);
            const searchMatch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
            return typeMatch && searchMatch;
        });

        if (userLocation) {
             return filtered.map(place => ({
                ...place,
                distance: parseFloat(getDistance(userLocation.lat, userLocation.lng, place.coordinates.lat, place.coordinates.lng).toFixed(1))
            })).sort((a, b) => a.distance - b.distance);
        }

        return filtered;
    }, [livePlaces, userLocation, selectedMassageType, searchQuery]);


    const handleOpenRatingModal = (item: Therapist | Place) => {
        setItemToRate(item);
        setIsRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalOpen(false);
        setItemToRate(null);
    };
    
    const handleSetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setIsLoadingLocation(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                 const geocoder = new (window as any).google.maps.Geocoder();
                 geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: string) => {
                    setIsLoadingLocation(false);
                    if (status === 'OK' && results[0]) {
                        const location: UserLocation = {
                            address: results[0].formatted_address,
                            lat: latitude,
                            lng: longitude,
                        };
                        onSetUserLocation(location);
                    } else {
                        setLocationError(t.home.locationError);
                    }
                });
            },
            () => {
                setIsLoadingLocation(false);
                setLocationError(t.home.locationError);
            }
        );
    };

    const handleSubmitRating = (rating: number, whatsapp: string) => {
        console.log(`Rating for ${itemToRate?.name}: ${rating}, WhatsApp: ${whatsapp}`);
        alert(t.ratingModal.confirmation);
        handleCloseRatingModal();
    };

    const onlineTherapistsCount = useMemo(() => liveTherapists.filter(t => t.status === 'Available').length, [liveTherapists]);

    const renderTherapists = () => {
        if (processedTherapists.length === 0) {
            return <p className="text-center text-gray-500 py-8">{t.home.noResults}</p>;
        }
        return (
            <div className="space-y-4">
                {processedTherapists.map(therapist => <TherapistCard key={therapist.id} therapist={therapist} onRate={handleOpenRatingModal} />)}
            </div>
        );
    };

    const renderPlaces = () => {
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
             <header className="p-4 bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-brand-green">2Go</span> Massage
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={onCreateProfileClick} title="Create Profile"><CreateProfileIcon /></button>
                        <button onClick={onAdminClick} title="Admin Login"><AdminIcon /></button>
                        <button onClick={user ? onLogout : onLoginClick} className="text-brand-green" title="Customer Login/Logout">
                           <UserIcon />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                    <UsersIcon className="w-5 h-5"/>
                    <span className="font-medium">{t.home.therapistsOnline.replace('{count}', onlineTherapistsCount).replace('{total}', liveTherapists.length)}</span>
                </div>

                <div className="flex bg-gray-200 rounded-full p-1 mb-4">
                    <button 
                        onClick={() => setActiveTab('home')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'home' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}
                    >
                        <HomeIcon className="w-5 h-5" />
                        {t.home.homeServiceTab}
                    </button>
                    <button 
                        onClick={() => setActiveTab('places')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'places' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}
                    >
                        <BuildingIcon />
                        {t.home.massagePlacesTab}
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <MapPinIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500">Your Location</p>
                                    <p className="font-medium text-gray-800 text-sm truncate">{userLocation ? userLocation.address : 'Location not set'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleSetLocation}
                                disabled={isLoadingLocation}
                                className="bg-brand-green-light text-brand-green-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 flex-shrink-0"
                            >
                                {isLoadingLocation ? t.home.gettingLocation : (userLocation ? t.home.updateLocation : t.home.setLocation)}
                            </button>
                        </div>
                        {locationError && <p className="text-red-500 text-xs mt-2 text-center">{locationError}</p>}
                    </div>

                    <div className="relative">
                        <SparklesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <select 
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green"
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
                    
                    <div className="relative">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder={t.home.searchPlaceholder} 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {activeTab === 'home' ? renderTherapists() : renderPlaces()}
            </main>
            {isRatingModalOpen && itemToRate && (
                <RatingModal
                    itemName={itemToRate.name}
                    onClose={handleCloseRatingModal}
                    onSubmit={handleSubmitRating}
                    t={t.ratingModal}
                />
            )}
        </div>
    );
};

export default HomePage;