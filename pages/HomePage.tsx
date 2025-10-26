import React, { useState, useEffect } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics } from '../types';
import LocationModal from '../components/LocationModal';
import TherapistCard from '../components/TherapistCard';
import RatingModal from '../components/RatingModal';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import HomeIcon from '../components/icons/HomeIcon';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CloseIcon from '../components/icons/CloseIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';
import { customLinksService, reviewService } from '../lib/appwriteService';


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
    onVillaPortalClick: () => void;
    onTherapistPortalClick: () => void;
    onMassagePlacePortalClick: () => void;
    onAdminPortalClick: () => void;
    onBrowseJobsClick?: () => void;
    onEmployerJobPostingClick?: () => void;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    onNavigate?: (page: string) => void;
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



const HomePage: React.FC<HomePageProps> = ({ 
    loggedInAgent: _loggedInAgent, 
    therapists, 
    onSetUserLocation, 
    onBook, 
    onIncrementAnalytics, 
    onAgentPortalClick, 
    onMassageTypesClick, 
    onHotelPortalClick, 
    onVillaPortalClick, 
    onTherapistPortalClick, 
    onMassagePlacePortalClick, 
    onAdminPortalClick, 
    onBrowseJobsClick: _onBrowseJobsClick, 
    onEmployerJobPostingClick: _onEmployerJobPostingClick, 
    onMassageJobsClick, 
    onTherapistJobsClick, 
    onTermsClick, 
    onPrivacyClick, 
    onNavigate, 
    t 
}) => {
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
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

    const handleOpenRatingModal = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setSelectedTherapist(null);
    };

    const handleSubmitReview = async () => {
        if (!selectedTherapist) return;

        try {
            const therapistId = selectedTherapist.id || (selectedTherapist as any).$id;
            await reviewService.create({
                providerId: Number(therapistId),
                providerType: 'therapist',
                providerName: selectedTherapist.name,
                rating: 0, // Will be set by RatingModal
                whatsapp: '', // Will be set by RatingModal
                status: 'pending'
            });
            handleCloseRatingModal();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

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

        // Listen for drawer toggle events from footer
        const handleToggleDrawer = () => {
            setIsMenuOpen(prev => !prev);
        };
        window.addEventListener('toggleDrawer', handleToggleDrawer);
        
        return () => {
            window.removeEventListener('toggleDrawer', handleToggleDrawer);
        };
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
                        <span className="text-black">inda</span><span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Brand Header */}
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">inda</span>
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
                                {/* Job Posting Section Header */}
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Posting</h3>
                                </div>

                                {/* Massage Jobs (Employer Postings) */}
                                <button 
                                    onClick={() => { 
                                        console.log('🔵 Massage Jobs clicked'); 
                                        onMassageJobsClick?.(); 
                                        setIsMenuOpen(false); 
                                    }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-2 border-white transform hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            Massage Jobs
                                        </h3>
                                        <p className="text-xs text-gray-500">Browse job openings</p>
                                    </div>
                                </button>

                                {/* Therapist Jobs (Looking for Work) */}
                                <button 
                                    onClick={() => { 
                                        console.log('🟢 Therapist Jobs clicked'); 
                                        onTherapistJobsClick?.(); 
                                        setIsMenuOpen(false); 
                                    }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 border-2 border-white transform hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            Therapist For Contract
                                        </h3>
                                        <p className="text-xs text-gray-500">Find qualified therapists</p>
                                    </div>
                                </button>

                                {/* Company Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</h3>
                                </div>
                                <button 
                                    onClick={() => { onNavigate?.('about'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                >
                                    <span className="text-2xl">🏢</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">About Us</h3>
                                        <p className="text-xs text-gray-500">Our story & mission</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => { onNavigate?.('how-it-works'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-green-500 group"
                                >
                                    <span className="text-2xl">❓</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">How It Works</h3>
                                        <p className="text-xs text-gray-500">For all user types</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => { onNavigate?.('blog'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-purple-500 group"
                                >
                                    <span className="text-2xl">📰</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Blog</h3>
                                        <p className="text-xs text-gray-500">Massage tips & guides</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => { onNavigate?.('contact'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-gray-500 group"
                                >
                                    <span className="text-2xl">📧</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">Contact Us</h3>
                                        <p className="text-xs text-gray-500">Get in touch</p>
                                    </div>
                                </button>

                                {/* Locations Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Locations</h3>
                                </div>
                                <button 
                                    onClick={() => { onNavigate?.('massage-bali'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-pink-500 group"
                                >
                                    <span className="text-2xl">🌺</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">Massage in Bali</h3>
                                        <p className="text-xs text-gray-500">440+ therapists</p>
                                    </div>
                                </button>

                                {/* Services Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Services</h3>
                                </div>
                                <button 
                                    onClick={() => { onNavigate?.('balinese-massage'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-teal-500 group"
                                >
                                    <span className="text-2xl">🌿</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Balinese Massage</h3>
                                        <p className="text-xs text-gray-500">Traditional relaxation</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => { onNavigate?.('deep-tissue-massage'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-indigo-500 group"
                                >
                                    <span className="text-2xl">💪</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Deep Tissue Massage</h3>
                                        <p className="text-xs text-gray-500">Therapeutic relief</p>
                                    </div>
                                </button>

                                {/* Help Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Help & Support</h3>
                                </div>
                                <button 
                                    onClick={() => { onNavigate?.('faq'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-yellow-500 group"
                                >
                                    <span className="text-2xl">❔</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">FAQ</h3>
                                        <p className="text-xs text-gray-500">Common questions</p>
                                    </div>
                                </button>

                                {/* Divider for Login Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Login / Create Account</h3>
                                </div>

                                {/* Hotel Login */}
                                <button 
                                    onClick={() => { onHotelPortalClick(); setIsMenuOpen(false); }} 
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
                                    onClick={() => { onVillaPortalClick(); setIsMenuOpen(false); }} 
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
                                    onClick={() => { onTherapistPortalClick(); setIsMenuOpen(false); }} 
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
                                    onClick={() => { onMassagePlacePortalClick(); setIsMenuOpen(false); }} 
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

                                {/* Admin Portal */}
                                <button 
                                    onClick={() => { onAdminPortalClick(); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-red-500 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-2 border-white transform hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                                            Admin
                                        </h3>
                                        <p className="text-xs text-gray-500">System Administration</p>
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
                                © 2025 IndaStreet Massage
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
                                        {category.types.map((type, index) => (
                                            <option key={`${category.category}-${type}-${index}`} value={type}>{type}</option>
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

                {/* Therapists and Places Display */}
                {activeTab === 'home' && (
                    <div className="space-y-4">
                        {therapists
                            .filter((t: any) => t.isLive === true) // Only show activated therapists
                            .filter((t: any) => selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType)))
                            .map((therapist: any) => (
                                <TherapistCard
                                    key={therapist.id || therapist.$id}
                                    therapist={therapist}
                                    onRate={() => handleOpenRatingModal(therapist)}
                                    onBook={() => onBook(therapist, 'therapist')}
                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(therapist.id || therapist.$id, 'therapist', metric)}
                                    t={t}
                                />
                            ))}
                        {therapists.filter((t: any) => t.isLive === true).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">No therapists available at the moment.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && selectedTherapist && (
                    <RatingModal
                        onClose={handleCloseRatingModal}
                        onSubmit={handleSubmitReview}
                        itemName={selectedTherapist.name}
                        itemType="therapist"
                        itemId={selectedTherapist.id || (selectedTherapist as any).$id}
                        t={{
                            title: t.ratingModal?.title || 'Rate {itemName}',
                            prompt: t.ratingModal?.prompt || 'How was your experience?',
                            whatsappLabel: t.ratingModal?.whatsappLabel || 'WhatsApp Number',
                            whatsappPlaceholder: t.ratingModal?.whatsappPlaceholder || 'Enter your WhatsApp number',
                            submitButton: t.ratingModal?.submitButton || 'Submit Review',
                            selectRatingError: t.ratingModal?.selectRatingError || 'Please select a rating',
                            whatsappRequiredError: t.ratingModal?.whatsappRequiredError || 'WhatsApp number is required',
                            confirmationV2: t.ratingModal?.confirmationV2 || 'Thank you for your review! It will be visible once approved by admin.'
                        }}
                    />
                )}

                {activeTab === 'places' && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">Massage places coming soon...</p>
                    </div>
                )}

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