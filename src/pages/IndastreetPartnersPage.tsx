// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState, useEffect } from 'react';
import { 
    ExternalLink as ExternalLinkIcon, 
    Globe as GlobeAltIcon, 
    Star as StarIcon, 
    MapPin as MapPinIcon, 
    Phone as PhoneIcon,
    CheckCircle as CheckCircleIcon,
    Shield as BadgeCheckIcon,
    Eye as EyeIcon,
    Users as UsersIcon,
    Building as BuildingIcon,
    Home as HomeIcon,
    Heart as HeartIcon,
    Calendar as CalendarIcon,
    Share2
} from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import FlyingButterfly from "../components/FlyingButterfly";
import AnonymousReviewModal from "../components/AnonymousReviewModal";
import SocialSharePopup from '../components/modals/SocialSharePopup';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { indastreetPartnersService, PartnerData } from '../services/indastreetPartnersService';
import PartnersAdminPanel from '../components/PartnersAdminPanel';
import { Query } from 'appwrite';
import { useLanguage } from '../hooks/useLanguage';

interface PartnerWebsite extends PartnerData {
    distance?: number; // Distance in km
    websitePreview?: string; // URL for website screenshot/preview
}

interface IndastreetPartnersPageProps {
    onNavigate?: (page: any) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
    t: any;
    loggedInPartnerId?: string; // NEW: To show "Manage Settings" button for owner
    loggedInPartnerType?: 'hotel' | 'villa'; // NEW: Partner type
}

const IndastreetPartnersPage: React.FC<IndastreetPartnersPageProps> = ({ 
    onNavigate, 
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
    t,
    loggedInPartnerId,
    loggedInPartnerType
}) => {
    const { language } = useLanguage();
    const [partners, setPartners] = useState<PartnerWebsite[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userCity, setUserCity] = useState<string>('Your Area');
    const [viewType, setViewType] = useState<'hotel' | 'villa'>('hotel');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReferModal, setShowReferModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<PartnerWebsite | null>(null);
    const [userReferralCode, setUserReferralCode] = useState<string>('');
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [partnerToShare, setPartnerToShare] = useState<PartnerWebsite | null>(null);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    // Default partner images for random display
    const defaultPartnerImages = [
        'https://ik.imagekit.io/7grri5v7d/indonisea%20place%208.png?updatedAt=1767203858237',
        'https://ik.imagekit.io/7grri5v7d/indonisea%20place%207.png?updatedAt=1767203840641',
        'https://ik.imagekit.io/7grri5v7d/indonisea%20place%206.png?updatedAt=1767203820941',
        'https://ik.imagekit.io/7grri5v7d/indonisea%20place%205.png?updatedAt=1767203802081',
        'https://ik.imagekit.io/7grri5v7d/indonisea%20place%204.png?updatedAt=1767203785161'
    ];

    // Get random default image
    const getRandomDefaultImage = () => {
        const randomIndex = Math.floor(Math.random() * defaultPartnerImages.length);
        return defaultPartnerImages[randomIndex];
    };

    // Enhanced mock data with website previews - Only partners with custom images
    const mockPartners: PartnerWebsite[] = [
        {
            id: '1',
            name: 'Mike Massage Therapist',
            websiteUrl: 'https://www.massagelondonsw1.com/',
            websiteTitle: 'Bespoke Massage Therapy in Central London',
            description: 'Professional massage therapist with 10+ years experience offering bespoke Eastern and Western massage techniques. Deep tissue, relaxation, and sports massage sessions available 24/7 in Central London.',
            category: 'therapist',
            location: 'Pimlico, Central London',
            phone: '+44 7852967884',
            verified: true,
            rating: 4.8,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20london.png?updatedAt=1762568808299',
            specialties: ['Deep Tissue Massage', 'Relaxation Massage', 'Sports Massage', 'Bespoke Therapy', '24/7 Service'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=massagelondonsw1.com&viewport=1440x900&width=400'
        },
        {
            id: '2',
            name: 'Vabali Spa Berlin',
            websiteUrl: 'https://www.vabali.de/en/berlin/',
            websiteTitle: 'Balinese Wellness Oasis in Berlin',
            description: 'A world-class Balinese wellness resort in the heart of Berlin featuring 10 saunas, 3 steam baths, 4 pools, massage services, and Indonesian-inspired ambience. Complete wellness destination with restaurant and relaxation facilities.',
            category: 'massage-place',
            location: 'Berlin, Germany',
            phone: '+49 30 12345678',
            verified: true,
            rating: 4.9,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20gemany.png?updatedAt=1762569055961',
            specialties: ['Balinese Wellness', '10 Saunas', '3 Steam Baths', '4 Pools', 'Massage Services', 'Indonesian Spa', 'Wellness Resort'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=vabali.de&viewport=1440x900&width=400'
        },
        {
            id: '3',
            name: "Let's Relax Spa Xi'an",
            websiteUrl: 'https://letsrelaxspa.com/branch/xi-an-china',
            websiteTitle: 'Modern Contemporary Thai-Chinese Spa',
            description: 'Premium spa located in Great Tang All Day Mall, Xi\'an, featuring modern contemporary design with Thai-Chinese touch. Urban retreat offering traditional Thai massage, foot massage, spa packages and wellness treatments with earth tone ambiance.',
            category: 'massage-place',
            location: 'Qujiang New District, Xi\'an, Shaanxi, China',
            phone: '+86 (0)29-88089988',
            verified: true,
            rating: 4.7,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20china.png?updatedAt=1762569611254',
            specialties: ['Thai Massage', 'Foot Massage', 'Spa Experience', 'Heavenly Relax Package', 'Herbal Treatments', 'Aroma Oil Therapy'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=letsrelaxspa.com&viewport=1440x900&width=400'
        },
        {
            id: '4',
            name: 'Mandarin Oriental Wellness & Spa',
            websiteUrl: 'https://www.mandarinoriental.com/en/wellness',
            websiteTitle: 'Award-Winning Luxury Spa & Wellness',
            description: 'World-renowned luxury spa brand with 12 Forbes Five-Star spas and 11 Four-Star spas globally. Rooted in oriental philosophy and authentic rituals, combining ancient techniques with modern innovations for personalized wellness journeys.',
            category: 'hotel',
            location: 'Global Luxury Hotels',
            phone: '+852 2885 4888',
            verified: true,
            rating: 5.0,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20wellness.png?updatedAt=1762569860409',
            specialties: ['Forbes Five-Star Spas', 'Oriental Philosophy', 'Ancient Techniques', 'Personalized Wellness', 'Luxury Retreats', 'Signature Programs'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=mandarinoriental.com&viewport=1440x900&width=400'
        },
        {
            id: '5',
            name: 'Marbella Club Hotel',
            websiteUrl: 'https://www.marbellaclub.com/',
            websiteTitle: 'Mediterranean Beachfront Paradise',
            description: 'Legendary luxury beachfront hotel in Marbella with true Andalusian spirit. Features holistic wellbeing spa, yoga studio, meditation facilities, and natural healing treatments by the sea. Elegant simplicity in a storied finca with 300+ days of sunshine.',
            category: 'hotel',
            location: 'Marbella, Costa del Sol, Spain',
            phone: '+34 952 82 22 11',
            verified: true,
            rating: 4.9,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20place.png?updatedAt=1762570193941',
            specialties: ['Holistic Wellbeing', 'Beachfront Spa', 'Yoga & Meditation', 'Natural Healing', 'Andalusian Luxury', 'Mediterranean Wellness'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=marbellaclub.com&viewport=1440x900&width=400'
        },
        {
            id: '6',
            name: 'La Finca Resort',
            websiteUrl: 'https://www.lafincaresort.com/',
            websiteTitle: 'Paraíso Escondido en la Costa Blanca',
            description: 'Luxury 5-star resort in Costa Blanca featuring La Finca Spa with 10% discount on treatments and massages. Includes two 18-hole golf courses, sports facilities (tennis, paddle, gym), and gourmet restaurants. Bright rooms with terraces overlooking golf, pool, or gardens.',
            category: 'hotel',
            location: 'Algorfa, Alicante, Costa Blanca, Spain',
            phone: '+34 966 729 055',
            verified: true,
            rating: 4.8,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20massage%20place%20new%20shop.png?updatedAt=1762570457253',
            specialties: ['La Finca Spa', '10% Spa Discount', 'Golf Resort', 'Sports Facilities', 'Wellness Experiences', 'Gourmet Dining'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=lafincaresort.com&viewport=1440x900&width=400'
        },
        {
            id: '7',
            name: 'Six Senses Hotels Resorts Spas',
            websiteUrl: 'https://www.sixsenses.com/',
            websiteTitle: 'Pioneering Wellness & Empathetic Hospitality',
            description: 'Global luxury wellness brand offering meaningful experiences in places of incredible natural beauty. Features pioneering wellness programs, high-tech and high-touch spa treatments, personalized wellness programs, and sustainability initiatives across properties worldwide.',
            category: 'hotel',
            location: 'Global Luxury Resorts & Spas',
            phone: '+66 2631 9777',
            verified: true,
            rating: 5.0,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20massage%20place%20new%20shops.png?updatedAt=1762570584171',
            specialties: ['Pioneering Wellness', 'High-Tech Spa Treatments', 'Personalized Programs', 'Natural Beauty Locations', 'Sustainability Focus', 'Empathetic Hospitality'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=sixsenses.com&viewport=1440x900&width=400'
        },
        {
            id: '8',
            name: 'Majestic Hotel Group',
            websiteUrl: 'https://majestichotelgroup.com/',
            websiteTitle: 'Over 100 Years of Luxury Hotel Excellence',
            description: 'Hotel management company with over 100 years of experience in the tourism industry. Specializing in luxury and lifestyle hotels with unique personalities, integrated into local culture and aesthetics. Comprehensive hotel services including spa facilities, wellness programs, and premium accommodations.',
            category: 'hotel',
            location: 'International Hotel Management',
            phone: '+34 971 123 456',
            verified: true,
            rating: 4.8,
            imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20itay.png?updatedAt=1762571418409',
            specialties: ['Luxury Hotel Management', 'Lifestyle Hotels', 'Spa & Wellness', '100+ Years Experience', 'Cultural Integration', 'Premium Services'],
            addedDate: '2024-11-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=majestichotelgroup.com&viewport=1440x900&width=400'
        }
    ];

    useEffect(() => {
        // Note: User referral code initialization has been disabled (coin system removed)

        // Get user's city from localStorage or geolocation
        const storedCity = localStorage.getItem('userCity');
        if (storedCity) {
            setUserCity(storedCity);
        } else {
            // Try to get city from geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
                            );
                            const data = await response.json();
                            const city = data.address.city || data.address.town || data.address.village || 'Your Area';
                            setUserCity(city);
                            localStorage.setItem('userCity', city);
                        } catch (error) {
                            console.error('Error fetching city:', error);
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                    }
                );
            }
        }

        // Fetch partners from Appwrite database using new service
        const fetchPartners = async () => {
            setLoading(true);
            try {
                // Initialize the partners service first
                const initialized = await indastreetPartnersService.initializePartnersSystem();
                
                if (initialized) {
                    // Fetch partners using the new service
                    const fetchedPartners = await indastreetPartnersService.getPartners({
                        active: true,
                        verified: true,
                        limit: 100
                    });
                    
                    // Convert to PartnerWebsite format
                    const partnerWebsites: PartnerWebsite[] = fetchedPartners.map((partner) => ({
                        ...partner,
                        id: partner.id || '',
                        websiteUrl: partner.websiteUrl || '',
                        addedDate: partner.joinedDate || new Date().toISOString(),
                        distance: 0, // Will be calculated if user location available
                        websitePreview: partner.websitePreview || ''
                    }));
                    
                    setPartners(partnerWebsites);
                    console.log(`✅ Loaded ${partnerWebsites.length} partners from Appwrite`);
                } else {
                    console.warn('⚠️ Partners service not initialized, using mock data');
                    setPartners(mockPartners);
                }
            } catch (error) {
                console.error('Error fetching partners:', error);
                // Fallback to mock data if service fails
                setPartners(mockPartners);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    const categories = [
        { 
            value: 'all', 
            label: 'All Partners', 
            icon: '🌟', 
            count: partners.length,
            color: 'bg-gradient-to-r from-orange-500 to-red-500'
        },
        { 
            value: 'therapist', 
            label: 'Indastreet Therapists', 
            icon: '💆‍♀️', 
            count: partners.filter(p => p.category === 'therapist').length,
            color: 'bg-gradient-to-r from-orange-500 to-amber-500'
        },
        { 
            value: 'massage-place', 
            label: 'Indastreet Massage Places', 
            icon: '🏢', 
            count: partners.filter(p => p.category === 'massage-place').length,
            color: 'bg-gradient-to-r from-orange-600 to-orange-400'
        },
        { 
            value: 'hotel', 
            label: 'Indastreet Hotels', 
            icon: '🏨', 
            count: partners.filter(p => p.category === 'hotel').length,
            color: 'bg-gradient-to-r from-amber-500 to-yellow-500'
        },
        { 
            value: 'villa', 
            label: 'Indastreet Villas', 
            icon: '🏡', 
            count: partners.filter(p => p.category === 'villa').length,
            color: 'bg-gradient-to-r from-orange-500 to-red-500'
        }
    ];

    const filteredPartners = partners.filter(partner => {
        // Filter by viewType (hotel or villa)
        const matchesViewType = partner.category === viewType;
        const matchesCategory = selectedCategory === 'all' || partner.category === selectedCategory;
        const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesViewType && matchesCategory && matchesSearch;
    });

    const getCategoryColor = (category: string) => {
        const categoryColors = {
            'therapist': 'bg-orange-100 text-orange-800 border-orange-200',
            'massage-place': 'bg-amber-100 text-amber-800 border-amber-200',
            'hotel': 'bg-orange-100 text-orange-800 border-orange-200',
            'villa': 'bg-amber-100 text-amber-800 border-amber-200'
        };
        return categoryColors[category as keyof typeof categoryColors] || 'bg-orange-100 text-orange-800 border-orange-200';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'therapist': return <HeartIcon className="w-5 h-5" />;
            case 'massage-place': return <BuildingIcon className="w-5 h-5" />;
            case 'hotel': return <BuildingIcon className="w-5 h-5" />;
            case 'villa': return <HomeIcon className="w-5 h-5" />;
            default: return <GlobeAltIcon className="w-5 h-5" />;
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
                <span className="text-sm text-gray-600 ml-1">({rating})</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Indastreet Partners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
            {/* Universal Header with Home Button */}
            <UniversalHeader
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate && onNavigate('home')}
                showHomeButton={true}
                showLanguageSelector={false}
            />
            
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => {
                    console.log('🍔 Partners Page - AppDrawer onClose called');
                    setIsMenuOpen(false);
                }}
                t={t}
                language={language as 'en' | 'id' | 'gb'}
                onMassageJobsClick={onMassageJobsClick}
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
                onQRCodeClick={() => onNavigate && onNavigate('qr-code')}
                therapists={therapists}
                places={places}
            />
            
            {/* Hero Section with Background Image */}
            <div 
                className="relative text-white pt-20 sm:pt-24 pb-8 sm:pb-10 lg:pb-14 overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/hotel%20villa.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-2xl font-extrabold sm:text-4xl lg:text-5xl xl:text-6xl drop-shadow-lg">
                        <div
                            onClick={() => {
                                // Triple-click to open admin panel (for testing)
                                const now = Date.now();
                                const clicks = (window as any).adminClicks || [];
                                clicks.push(now);
                                (window as any).adminClicks = clicks.filter((t: number) => now - t < 1000);
                                if ((window as any).adminClicks.length >= 3) {
                                    setShowAdminPanel(true);
                                    (window as any).adminClicks = [];
                                }
                            }}
                        >
                            <span className="text-white">INDA</span><span className="text-orange-500">STREET PARTNERS</span>
                        </div>
                    </h1>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-lg lg:text-xl text-white max-w-3xl mx-auto drop-shadow-md px-4">
                        {language === 'id'
                            ? 'Temukan hotel dan villa yang menawarkan layanan pijat 24 jam. Anda dapat yakin akan layanan pijat berkualitas tertinggi saat menginap di hotel dan villa yang terdaftar di Indastreet. Masing-masing telah dipilih dengan cermat untuk memfasilitasi brand Indastreet.'
                            : 'Discover hotels and villas offering 24-hour massage services. You can be assured of the highest quality massage service when staying at the hotels and villas listed on Indastreet. Each has been carefully selected to facilitate the Indastreet brand.'}
                    </p>
                </div>
            </div>

            {/* Booking Banner */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-white text-base sm:text-lg lg:text-xl font-medium">
                        {language === 'id'
                            ? 'Pesan Hotel Dan Villa Yang Terdaftar Di Bawah Dan Nikmati Layanan Terapis Pijat Kamar 24 Jam'
                            : 'Book Any Hotel And Villa Listed Below And Enjoy 24 Hour Room Massage Therapist Service'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24">
                {/* Viewing Location Banner */}
                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <p className="text-lg sm:text-xl font-semibold text-gray-800">
                            {language === 'id' ? 'Melihat Sekarang' : 'Viewing Now'}: <span className="text-orange-600">{userCity}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {language === 'id' ? 'Menampilkan hotel dan villa dalam radius 30km' : 'Showing hotels and villas within 30km'}
                        </p>
                    </div>
                </div>

                {/* Hotel/Villa Toggle Button */}
                <div className="flex justify-center mb-6 sm:mb-8" style={{ marginBottom: '20px' }}>
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                        <button
                            onClick={() => setViewType('hotel')}
                            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-all duration-200 ${
                                viewType === 'hotel'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                    : 'text-gray-700 hover:text-orange-600'
                            }`}
                        >
                            {language === 'id' ? 'Hotel Pijat' : 'Massage Hotel'}
                        </button>
                        <button
                            onClick={() => setViewType('villa')}
                            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-all duration-200 ${
                                viewType === 'villa'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                    : 'text-gray-700 hover:text-orange-600'
                            }`}
                        >
                            {language === 'id' ? 'Villa Pijat' : 'Massage Villa'}
                        </button>
                    </div>
                </div>

                {/* Partners Grid with MassagePlace-style Cards */}
                <div className="space-y-16">
                    {filteredPartners.map((partner) => (
                        <div key={partner.id} className="relative mb-12">
                            {/* Join Indastreet and Member Since - Same line level */}
                            <div className="absolute -top-6 left-0 right-0 flex justify-between items-center mb-4">
                                <button
                                    onClick={() => onNavigate?.('join-indastreet-partners')}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline transition-colors"
                                >
                                    Join Indastreet
                                </button>
                                
                                <p className="text-xs text-gray-500 font-medium">
                                    {t?.partners?.added || 'Member since'} {new Date(partner.addedDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short'
                                    })}
                                </p>
                            </div>
                            
                            <div className="w-full bg-white rounded-xl shadow-md overflow-visible relative mt-2">
                            {/* Main Image Banner */}
                            <div className="h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 overflow-hidden relative rounded-t-xl">
                                <img 
                                    src={partner.imageUrl || getRandomDefaultImage()} 
                                    alt={`${partner.name} cover`} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = getRandomDefaultImage();
                                    }}
                                />
                                
                                {/* Verified Badge */}
                                {partner.verified && (
                                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-yellow-400 px-3 py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        {t?.partners?.verifiedPartner || 'Verified'}
                                    </div>
                                )}
                                
                                {/* Rating */}
                                {partner.rating && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-2 shadow-lg">
                                        <StarIcon className="w-4 h-4 text-yellow-400"/>
                                        <span className="font-bold text-white text-sm">{partner.rating.toFixed(1)}</span>
                                    </div>
                                )}

                                {/* Share Button - Orange rounded button like therapist cards */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPartnerToShare(partner);
                                        setShowSharePopup(true);
                                    }}
                                    className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
                                    title="Share this partner"
                                    aria-label="Share this partner"
                                >
                                    <Share2 className="w-5 h-5 text-white" color="white" strokeWidth={2.5} />
                                </button>
                            </div>
                            
                            {/* Logo/Profile Picture - Fixed consistent position */}
                            <div className="absolute bottom-[-40px] left-4 z-20">
                                <div className="relative w-20 h-20">
                                    <img 
                                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" 
                                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png"
                                        alt={partner.name}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Partner Info Section - Repositioned for better layout */}
                        <div className="px-4 pt-14 pb-2">
                            {/* Partner Name and Location */}
                            <div className="mb-2">
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {partner.name.length > 24 ? partner.name.substring(0, 24) + '...' : partner.name}
                                </h3>
                                {partner.location && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPinIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                        <span className="text-xs text-gray-600">{partner.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-600 leading-relaxed text-justify line-clamp-3 mb-3">
                                {partner.description && partner.description.length > 200 
                                    ? partner.description.substring(0, 200) + '...' 
                                    : partner.description}
                            </p>
            
            {/* Content */}
            <div className="flex flex-col gap-4">
                                {/* Separator Line */}
                                <div className="border-t border-gray-200 my-2"></div>

                                {/* Hotel/Villa Amenities */}
                                {partner.specialties && partner.specialties.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <BuildingIcon className="w-4 h-4 text-orange-600" />
                                                {language === 'id' 
                                                    ? (viewType === 'hotel' ? 'Fasilitas Hotel' : 'Fasilitas Villa')
                                                    : (viewType === 'hotel' ? 'Hotel Amenities' : 'Villa Amenities')}
                                            </h4>
                                            <span className="text-xs font-medium text-gray-600">
                                                {language === 'id' ? 'Jarak' : 'Distance'}: {partner.distance ? `${partner.distance.toFixed(1)} km` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {partner.specialties.slice(0, 5).map((amenity, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-800 text-xs font-medium rounded-full"
                                                >
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Book Reservation Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const message = language === 'id'
                                            ? `Halo, saya ingin menanyakan ketersediaan di ${partner.name}. Terima kasih`
                                            : `Hi, I would like to enquire regarding availability at ${partner.name}. Thank you`;
                                        const phoneNumber = partner.phone?.replace(/[^0-9]/g, '') || '';
                                        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                                >
                                    <CalendarIcon className="w-5 h-5" />
                                    <span>{language === 'id' ? 'Pesan Reservasi' : 'Book Reservation'}</span>
                                </button>

                                {/* Manage Settings Button - Only shown to owner */}
                                {loggedInPartnerId === partner.id && loggedInPartnerType && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate?.(loggedInPartnerType === 'hotel' ? 'partner-settings-hotel' : 'partner-settings-villa');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 mt-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{language === 'id' ? 'Kelola Pengaturan' : 'Manage Settings'}</span>
                                    </button>
                                )}

                                {/* Action Links - Share, Massage Directory, Review */}
                                <div className="flex flex-wrap justify-between items-center gap-2 mt-2 px-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPartner(partner);
                                            setShowReferModal(true);
                                        }}
                                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                        </svg>
                                        <span>{language === 'id' ? 'Bagikan' : 'Share'}</span>
                                    </button>
                                    {onNavigate && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onNavigate('massageTypes');
                                            }}
                                            className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-3.5 3.5M16 7l-3.5 3.5M5 12h14M5 16h14" />
                                            </svg>
                                            <span>{language === 'id' ? 'Direktori Pijat' : 'Massage Directory'}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedPartner(partner);
                                            setShowReviewModal(true);
                                        }}
                                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span>{language === 'id' ? 'Ulasan' : 'Review'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPartners.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <GlobeAltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">{language === 'id' ? 'Tidak ada mitra ditemukan' : 'No partners found'}</h3>
                        <p className="text-gray-500">
                            {searchTerm 
                                ? (language === 'id' ? 'Coba sesuaikan kata kunci pencarian Anda' : 'Try adjusting your search terms')
                                : (language === 'id' ? 'Belum ada mitra dalam kategori ini' : 'No partners in this category yet')}
                        </p>
                    </div>
                )}

                {/* Join Partner Program CTA */}
                <div 
                    className="mt-8 sm:mt-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center text-white mx-2 sm:mx-0 relative overflow-hidden"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/start%20your%20journey.png?updatedAt=1763196282314)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'bottom center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Dark overlay to make text visible over background image */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg sm:rounded-xl"></div>
                    
                    <div className="relative z-20">
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 drop-shadow-2xl text-white">
                            {language === 'id' ? 'Ingin menjadi Mitra Indastreet?' : 'Want to become an Indastreet Partner?'}
                        </h2>
                        <p className="text-white mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2 drop-shadow-xl font-medium">
                            {language === 'id'
                                ? 'Bergabunglah dengan jaringan profesional kesehatan dan akomodasi mewah yang terverifikasi. Tampilkan bisnis Anda di platform kami dan tingkatkan visibilitas online Anda.'
                                : 'Join our network of verified wellness professionals and luxury accommodations. Get featured on our platform and boost your online visibility.'}
                        </p>
                        <button 
                            onClick={() => onNavigate && onNavigate('partnership-application')}
                            className="bg-white text-orange-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-100 hover:shadow-xl transition-all duration-200 text-sm sm:text-base shadow-lg transform hover:scale-105"
                        >
                            {language === 'id' ? 'Daftar Kemitraan' : 'Apply for Partnership'}
                        </button>
                    </div>
                </div>
            </div>

            {/* SEO Footer */}
            <div className="bg-white border-t border-gray-100 mt-8 sm:mt-12 py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600 text-xs sm:text-sm">
                        {language === 'id'
                            ? 'Semua website mitra dimiliki dan dioperasikan secara independen. Indastreet menghubungkan Anda dengan profesional kesehatan dan perhotelan terpercaya.'
                            : 'All partner websites are independently owned and operated. Indastreet connects you with trusted wellness and hospitality professionals.'}
                    </p>
                </div>
            </div>
            
            {/* Refer a Friend Modal */}
            {showReferModal && selectedPartner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowReferModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[88vw] max-h-[80vh] sm:max-w-xs md:max-w-sm p-3 sm:p-4 " onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/refer%20a%20friend.png"
                                    alt="Refer a Friend"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Refer a Friend</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Share Indastreet with friends! 🎁</p>
                            
                            <div className="space-y-2 mb-3 sm:mb-4">
                                <p className="text-xs text-gray-600 text-left">
                                    📱 Share your referral link:
                                </p>
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'Loading...'} 
                                        readOnly 
                                        className="flex-1 px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                                        placeholder="Your referral link"
                                    />
                                    <button
                                        onClick={() => {
                                            const link = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            navigator.clipboard.writeText(link);
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="px-3 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-xs whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-3 sm:mb-4">
                                <p className="text-xs text-gray-600 mb-2">Share via:</p>
                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out ${selectedPartner.name} on IndaStreet! 💆‍♀️ ${referralLink}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/whats%20app.png?updatedAt=1761845265148" 
                                            alt="WhatsApp"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/facebook.png?updatedAt=1761845339040" 
                                            alt="Facebook"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out ${selectedPartner.name} on IndaStreet! 💆‍♀️ ${referralLink}`;
                                            navigator.clipboard.writeText(message);
                                            alert('Instagram message copied! Open Instagram and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/insta.png?updatedAt=1761845305146" 
                                            alt="Instagram"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Instagram</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out ${selectedPartner.name} on IndaStreet! 💆‍♀️ ${referralLink}`;
                                            navigator.clipboard.writeText(message);
                                            alert('TikTok message copied! Open TikTok and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/tiktok.png?updatedAt=1761845101981" 
                                            alt="TikTok"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">TikTok</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReferModal(false)}
                                className="w-full px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Anonymous Review Modal */}
            {showReviewModal && selectedPartner && (
                <AnonymousReviewModal
                    providerName={selectedPartner.name}
                    providerId={selectedPartner.id}
                    providerType={(viewType === 'hotel' || viewType === 'villa') ? 'place' : viewType as 'therapist' | 'place'}
                    providerImage={selectedPartner.imageUrl || 'https://ik.imagekit.io/7grri5v7d/hotel%20villa.png'}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedPartner(null);
                    }}
                    onSubmit={async (reviewData) => {
                        console.log('Review submitted for', selectedPartner.name, reviewData);
                        // TODO: Submit review to Appwrite
                        alert('Thank you for your review!');
                        setShowReviewModal(false);
                        setSelectedPartner(null);
                    }}
                />
            )}

            {/* Social Share Popup */}
            {showSharePopup && partnerToShare && (
                <SocialSharePopup
                    isOpen={showSharePopup}
                    onClose={() => {
                        setShowSharePopup(false);
                        setPartnerToShare(null);
                    }}
                    title={partnerToShare.name}
                    description={partnerToShare.websiteTitle || partnerToShare.description || `Visit ${partnerToShare.name} - ${partnerToShare.category} partner on IndaStreet`}
                    url={partnerToShare.websiteUrl}
                    type="place"
                />
            )}

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
            
            {/* Admin Panel (Triple-click header to open) */}
            {showAdminPanel && (
                <PartnersAdminPanel 
                    onClose={() => setShowAdminPanel(false)}
                />
            )}
        </div>
    );
};

export default IndastreetPartnersPage;
