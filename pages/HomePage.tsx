import React, { useState, useEffect } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics } from '../types';
import LocationModal from '../components/LocationModal';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';
import HomeIcon from '../components/icons/HomeIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CloseIcon from '../components/icons/CloseIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';
import { customLinksService } from '../lib/appwriteService';


interface HomePageProps {
    user: User | null;
    loggedInAgent: Agent | null;
    therapists: any[];
    places: any[];
    userLocation: UserLocation | null;
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
    onBook: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onIncrementAnalytics: (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => void;
    onLogout: () => void;
    onLoginClick: () => void;
    onCreateProfileClick: () => void;
    onAgentPortalClick: () => void;
    onMassageTypesClick: () => void;
    onHotelPortalClick: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    isLoading: boolean;
    t: any;
}



// Icons
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

const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);



const HomePage: React.FC<HomePageProps> = ({ loggedInAgent: _loggedInAgent, therapists, onSetUserLocation, onLoginClick, onAgentPortalClick, onMassageTypesClick, onTermsClick, onPrivacyClick, t }) => {
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

    const [activeTab, setActiveTab] = useState('home');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedMassageType, setSelectedMassageType] = useState('all');
    const [customLinks, setCustomLinks] = useState<any[]>([]);

    useEffect(() => {
        setIsLocationModalOpen(true);
    }, []);

    useEffect(() => {
        // Fetch custom drawer links
        const fetchCustomLinks = async () => {
            try {
                const links = await customLinksService.getAll();
                setCustomLinks(links);
            } catch (error) {
                console.error('Error fetching custom links:', error);
            }
        };
        fetchCustomLinks();
    }, []);

    // Removed unused processedTherapists and processedPlaces

    // Count of online therapists (example: status === 'online')
    const onlineTherapistsCount = 0;

    // Rating modal handlers removed for design mock

    // ...existing code...

    // Removed unused renderTherapists

    // Removed unused renderPlaces

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
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Brand Header */}
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">Indo</span>
                                <span className="text-orange-500">Street</span>
                            </h2>
                            <button 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all" 
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                {/* Login Section Header */}
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Login / Create Account</h3>
                                </div>

                                {/* Hotel Login */}
                                <button 
                                    onClick={() => { onLoginClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-2 border-white transform hover:scale-105 transition-transform">
                                        <BuildingIcon className="w-6 h-6 text-white drop-shadow" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            Hotel
                                        </h3>
                                        <p className="text-xs text-gray-500">Login / Register</p>
                                    </div>
                                </button>

                                {/* Villa Login */}
                                <button 
                                    onClick={() => { onLoginClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-green-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-2 border-white transform hover:scale-105 transition-transform">
                                        <HomeIcon className="w-6 h-6 text-white drop-shadow" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                                            Villa
                                        </h3>
                                        <p className="text-xs text-gray-500">Login / Register</p>
                                    </div>
                                </button>

                                {/* Therapists Login */}
                                <button 
                                    onClick={() => { onLoginClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-orange-400 via-yellow-300 to-orange-600 border-2 border-white transform hover:scale-105 transition-transform">
                                        <UserSolidIcon className="w-6 h-6 text-white drop-shadow" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            Therapists
                                        </h3>
                                        <p className="text-xs text-gray-500">Login / Register</p>
                                    </div>
                                </button>

                                {/* Massage Spa Login */}
                                <button 
                                    onClick={() => { onLoginClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-pink-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 border-2 border-white transform hover:scale-105 transition-transform">
                                        <SparklesIcon className="w-6 h-6 text-white drop-shadow" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                                            Massage Spa
                                        </h3>
                                        <p className="text-xs text-gray-500">Login / Register</p>
                                    </div>
                                </button>

                                {/* Agent Portal */}
                                <button 
                                    onClick={() => { onAgentPortalClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-purple-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-purple-500 via-fuchsia-400 to-purple-800 border-2 border-white transform hover:scale-105 transition-transform">
                                        <BriefcaseIcon className="w-6 h-6 text-white drop-shadow" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                            Agent
                                        </h3>
                                        <p className="text-xs text-gray-500">Login / Register</p>
                                    </div>
                                </button>

                                {/* Custom Links */}
                                {customLinks.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-300 my-3"></div>
                                        {customLinks.map((link) => (
                                            <a
                                                key={link.$id}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                            >
                                                {link.icon && (
                                                    <div className="flex-shrink-0">
                                                        <img 
                                                            src={link.icon} 
                                                            alt={link.title || link.name}
                                                            className="w-12 h-12 object-cover rounded-xl shadow-lg border-2 border-white"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                                                        {link.title || link.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </>
                                )}
                            </div>
                        </nav>

                        {/* Footer with Links */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                            <div className="flex justify-center gap-2">
                                <button 
                                    onClick={() => { onAgentPortalClick(); setIsMenuOpen(false); }} 
                                    className="text-xs text-orange-500 font-medium hover:underline"
                                >
                                    Become Agent
                                </button>
                                <span className="text-gray-400">|</span>
                                <button 
                                    onClick={() => { onTermsClick?.(); setIsMenuOpen(false); }} 
                                    className="text-xs text-orange-500 font-medium hover:underline"
                                >
                                    Terms
                                </button>
                                <span className="text-gray-400">|</span>
                                <button 
                                    onClick={() => { onPrivacyClick?.(); setIsMenuOpen(false); }} 
                                    className="text-xs text-orange-500 font-medium hover:underline"
                                >
                                    Privacy
                                </button>
                            </div>
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
                        <HomeIcon className="w-4 h-4" />
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
                {/* ...existing code for therapists/places rendering, modals, etc. should follow here... */}
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
            {/* Rating modal removed for design mock */}
        </div>
    );
};

export default HomePage;