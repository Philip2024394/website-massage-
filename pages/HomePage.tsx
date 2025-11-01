import React, { useState, useEffect } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics } from '../types';
import LocationModal from '../components/LocationModal';
import TherapistCard from '../components/TherapistCard';
import MassagePlaceCard from '../components/MassagePlaceCard';
import RatingModal from '../components/RatingModal';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';
import { customLinksService, reviewService } from '../lib/appwriteService';
import { AppDrawer } from '../components/AppDrawer';
import { Users, Building, Sparkles } from 'lucide-react';
import HomeIcon from '../components/icons/HomeIcon';


interface HomePageProps {
    user: User | null;
    loggedInAgent: Agent | null;
    loggedInProvider?: { id: number; type: 'therapist' | 'place' } | null; // Add logged in provider
    loggedInCustomer?: any | null; // Add customer login state
    therapists: any[];
    places: any[];
    userLocation: UserLocation | null;
    selectedMassageType?: string; // Add optional prop for external control
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
    onBook: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onQuickBookWithChat?: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onChatWithBusyTherapist?: (therapist: Therapist) => void;
    onShowRegisterPrompt?: () => void; // NEW: Show registration prompt for busy chat
    onIncrementAnalytics: (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => void;
    onLogout: () => void;
    onLoginClick: () => void;
    onCreateProfileClick: () => void;
    onAgentPortalClick: () => void;
    onCustomerPortalClick?: () => void; // Add customer portal callback
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



// Icon used in massage type filter
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const HomePage: React.FC<HomePageProps> = ({ 
    loggedInAgent: _loggedInAgent,
    loggedInProvider,
    loggedInCustomer,
    therapists,
    places,
    userLocation,
    selectedMassageType: propSelectedMassageType, // Get from prop
    onSetUserLocation, 
    onSelectPlace,
    onBook,
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onShowRegisterPrompt,
    onIncrementAnalytics, 
    onAgentPortalClick,
    onCustomerPortalClick,
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
    const [selectedMassageType, setSelectedMassageType] = useState(propSelectedMassageType || 'all');
    const [customLinks, setCustomLinks] = useState<any[]>([]);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [selectedRatingItem, setSelectedRatingItem] = useState<{item: any, type: 'therapist' | 'place'} | null>(null);

    // Update selectedMassageType when prop changes
    useEffect(() => {
        if (propSelectedMassageType) {
            setSelectedMassageType(propSelectedMassageType);
        }
    }, [propSelectedMassageType]);

    const handleOpenRatingModal = (item: any, type: 'therapist' | 'place' = 'therapist') => {
        // Check if customer is logged in before allowing review
        if (!loggedInCustomer) {
            if (onShowRegisterPrompt) {
                onShowRegisterPrompt();
            }
            return;
        }
        setSelectedRatingItem({ item, type });
        if (type === 'therapist') {
            setSelectedTherapist(item);
        }
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setSelectedTherapist(null);
        setSelectedRatingItem(null);
    };

    const handleSubmitReview = async () => {
        if (!selectedRatingItem) return;

        try {
            const itemId = selectedRatingItem.item.id || (selectedRatingItem.item as any).$id;
            await reviewService.create({
                providerId: Number(itemId),
                providerType: selectedRatingItem.type,
                providerName: selectedRatingItem.item.name,
                rating: 0, // Will be set by RatingModal
                whatsapp: '', // Will be set by RatingModal
                status: 'pending'
            });
            handleCloseRatingModal();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // Auto-open location modal when user arrives to home page
    useEffect(() => {
        setIsLocationModalOpen(true);
    }, []);

    // Log therapist display info
    useEffect(() => {
        const liveTherapists = therapists.filter((t: any) => t.isLive === true);
        const filteredTherapists = liveTherapists.filter((t: any) => 
            selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType))
        );
        
        console.log('🏠 HomePage Therapist Display:');
        console.log('  Total therapists prop:', therapists.length);
        console.log('  Live therapists:', liveTherapists.length);
        console.log('  After massage type filter:', filteredTherapists.length);
        console.log('  Selected massage type:', selectedMassageType);
    }, [therapists, selectedMassageType]);

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
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onTherapistJobsClick={onTherapistJobsClick}
                onHotelPortalClick={onHotelPortalClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
                customLinks={customLinks}
            />


            <main className="p-4">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                    <Users className="w-5 h-5"/>
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
                        <Building className="w-4 h-4" />
                        {t.home.massagePlacesTab}
                    </button>
                </div>


                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-grow">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
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
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('coin-shop');
                                }
                            }} 
                            className="ml-3 text-orange-500 font-semibold text-sm whitespace-nowrap hover:text-orange-600 transition-colors flex items-center gap-1"
                        >
                            <span>🛒</span>
                            Online Shop
                        </button>
                    </div>
                    
                    {/* Massage Directory Button - Centered */}
                    <div className="flex justify-center mt-3">
                        <button 
                            onClick={onMassageTypesClick} 
                            className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors"
                        >
                            Massage Directory
                        </button>
                    </div>
                </div>

                {/* Therapists and Places Display */}
                {activeTab === 'home' && (
                    <div>
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Home Massage Therapists</h3>
                            <p className="text-gray-600">Discover top-rated massage therapists in Bali</p>
                        </div>
                        
                        <div className="space-y-4">
                        {therapists
                            .filter((t: any) => t.isLive === true) // Only show activated therapists
                            .filter((t: any) => selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType)))
                            .map((therapist: any, index: number) => {
                                // Mock discount data - show all 4 discount levels (20%, 15%, 10%, 5%) on first 4 therapists
                                const hasDiscount = index < 4;
                                const mockDiscount = hasDiscount ? {
                                    percentage: index === 0 ? 20 : index === 1 ? 15 : index === 2 ? 10 : 5,
                                    expiresAt: new Date(Date.now() + (index + 2) * 60 * 60 * 1000) // Expires in 2-5 hours
                                } : null;
                                
                                return (
                                    <TherapistCard
                                        key={therapist.$id || `therapist-${therapist.id}-${index}`}
                                        therapist={therapist}
                                        onRate={() => handleOpenRatingModal(therapist)}
                                        onBook={() => onBook(therapist, 'therapist')}
                                        onQuickBookWithChat={onQuickBookWithChat ? () => onQuickBookWithChat(therapist, 'therapist') : undefined}
                                        onChatWithBusyTherapist={onChatWithBusyTherapist}
                                        onShowRegisterPrompt={onShowRegisterPrompt}
                                        isCustomerLoggedIn={!!loggedInCustomer}
                                        onIncrementAnalytics={(metric) => onIncrementAnalytics(therapist.id || therapist.$id, 'therapist', metric)}
                                        loggedInProviderId={loggedInProvider?.id}
                                        activeDiscount={mockDiscount}
                                        t={t}
                                    />
                                );
                            })}
                        {therapists.filter((t: any) => t.isLive === true).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">No therapists available at the moment.</p>
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && selectedRatingItem && (
                    <RatingModal
                        onClose={handleCloseRatingModal}
                        onSubmit={handleSubmitReview}
                        itemName={selectedRatingItem.item.name}
                        itemType={selectedRatingItem.type}
                        itemId={selectedRatingItem.item.id || (selectedRatingItem.item as any).$id}
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
                    <div>
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Featured Massage Spas</h3>
                            <p className="text-gray-600">Discover top-rated massage places in Bali</p>
                        </div>
                        
                        {/* Show places from Appwrite */}
                        {(() => {
                            console.log('🏨 Massage Places Tab:', {
                                totalPlaces: places?.length,
                                livePlaces: places?.filter(p => p.isLive).length,
                                places: places
                            });
                            
                            const livePlaces = places?.filter(place => place.isLive) || [];
                            
                            if (livePlaces.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <div className="mb-4">
                                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 mb-2 text-lg font-semibold">No massage places available at the moment</p>
                                        <p className="text-sm text-gray-400">Check back soon for featured spas!</p>
                                        <p className="text-xs text-gray-300 mt-4">Total places in DB: {places?.length || 0} | Live: {livePlaces.length}</p>
                                    </div>
                                );
                            }
                            
                            return (
                                <div className="space-y-4">
                                    {livePlaces
                                        .slice(0, 9) // Show maximum 9 places
                                        .map((place, index) => {
                                            const placeId = place.id || (place as any).$id;
                                            
                                            // Mock discount data - show all 4 discount levels (20%, 15%, 10%, 5%) on first 4 places
                                            const hasDiscount = index < 4;
                                            const mockDiscount = hasDiscount ? {
                                                percentage: index === 0 ? 20 : index === 1 ? 15 : index === 2 ? 10 : 5,
                                                expiresAt: new Date(Date.now() + (index + 2) * 60 * 60 * 1000) // Expires in 2-5 hours
                                            } : null;
                                            
                                            return (
                                                <MassagePlaceCard
                                                    key={placeId}
                                                    place={place}
                                                    onRate={() => handleOpenRatingModal(place, 'place')}
                                                    onSelectPlace={onSelectPlace}
                                                    onNavigate={onNavigate}
                                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(placeId, 'place', metric)}
                                                    onShowRegisterPrompt={onShowRegisterPrompt}
                                                    isCustomerLoggedIn={!!loggedInCustomer}
                                                    activeDiscount={mockDiscount}
                                                    t={t}
                                                    userLocation={userLocation}
                                                />
                                            );
                                        })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ...existing code for therapists/places rendering, modals, etc. should follow here... */}
            </main>
            <AddToHomeScreenPrompt t={t.a2hsPrompt} hasLocation={!!userLocation} />
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
            
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default HomePage;