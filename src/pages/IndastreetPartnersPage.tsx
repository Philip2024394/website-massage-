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
    Dumbbell as DumbbellIcon,
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
    loggedInPartnerType?: 'hotel' | 'villa' | 'gym'; // Partner type
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
    const [viewType, setViewType] = useState<'hotel' | 'villa' | 'gym'>('hotel');
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
            'villa': 'bg-amber-100 text-amber-800 border-amber-200',
            'gym': 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return categoryColors[category as keyof typeof categoryColors] || 'bg-orange-100 text-orange-800 border-orange-200';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'therapist': return <HeartIcon className="w-5 h-5" />;
            case 'massage-place': return <BuildingIcon className="w-5 h-5" />;
            case 'hotel': return <BuildingIcon className="w-5 h-5" />;
            case 'villa': return <HomeIcon className="w-5 h-5" />;
            case 'gym': return <DumbbellIcon className="w-5 h-5" />;
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
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading Indastreet Partners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <UniversalHeader
                language={language}
                onLanguageChange={(lang) => {}}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate && onNavigate('home')}
                showHomeButton
            />
            <FlyingButterfly />
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
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

            {/* Spacer below fixed header – matches app layout */}
            <div className="pt-[60px] sm:pt-16" aria-hidden />

            {/* Hero – same style as blog index: rounded container, gradient overlay */}
            <section className="px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-10">
                <div
                    className="relative w-full aspect-[21/9] min-h-[200px] sm:min-h-[260px] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden"
                    onClick={() => {
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
                    <img
                        src="https://ik.imagekit.io/7grri5v7d/hotel%20villa.png"
                        alt="IndaStreet Partners"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-sm">
                            <span className="text-white">Inda</span><span className="text-orange-400">Street</span> Partners
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-white/90 max-w-2xl">
                            {language === 'id'
                                ? 'Hotel, villa, dan gym terverifikasi. Pesan dan nikmati layanan berkualitas.'
                                : 'Verified hotels, villas and gyms. Book and enjoy quality service.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Subtle CTA bar – app orange */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="bg-orange-500 text-white rounded-2xl py-4 sm:py-5 px-4 sm:px-6 text-center">
                    <p className="text-sm sm:text-base font-medium">
                        {language === 'id'
                            ? 'Pesan hotel, villa, atau gym yang terdaftar di bawah ini.'
                            : 'Book any hotel, villa or gym listed below.'}
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-2xl mx-auto">
                        {language === 'id'
                            ? 'Mitra Indastreet menyediakan layanan berkualitas tinggi dari anggota Safe Pass terpercaya—Anda dapat mengandalkan pijat profesional dan perawatan kulit yang aman.'
                            : 'IndaStreet Partners deliver top-quality care through our trusted Safe Pass members—you can count on professional massage and skin care every time.'}
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-24">
                {/* Viewing location – white card, app style */}
                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-5 text-center">
                        <p className="text-lg sm:text-xl font-semibold text-gray-900">
                            {language === 'id' ? 'Melihat' : 'Viewing'}: <span className="text-orange-600">{userCity}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {language === 'id' ? 'Hotel, villa & gym dalam radius 30km' : 'Hotels, villas & gyms within 30km'}
                        </p>
                    </div>
                </div>

                {/* Hotel / Villa / Gym toggle – app theme pills */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8">
                    <button
                        onClick={() => setViewType('hotel')}
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            viewType === 'hotel'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                        }`}
                    >
                        {language === 'id' ? 'Hotel' : 'Hotel'}
                    </button>
                    <button
                        onClick={() => setViewType('villa')}
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            viewType === 'villa'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                        }`}
                    >
                        {language === 'id' ? 'Villa' : 'Villa'}
                    </button>
                    <button
                        onClick={() => setViewType('gym')}
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            viewType === 'gym'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                        }`}
                    >
                        {language === 'id' ? 'Gym' : 'Gym'}
                    </button>
                </div>

                {/* How booking works – under Hotel / Villa / Gym */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-5 mb-6 sm:mb-8">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center max-w-2xl mx-auto">
                        {language === 'id'
                            ? 'Pesan dengan mitra kami sangat mudah. Pilih Hotel, Villa, atau Gym di bawah, lalu hubungi mereka langsung untuk mengatur layanan pijat atau perawatan kulit. Anda bisa memesan menginap atau kunjungan harian—tim mereka dengan senang hati membantu kebutuhan Anda.'
                            : 'Booking with our partners is simple. Choose a Hotel, Villa or Gym below, then contact them directly to arrange a massage or skin care service. You can book an overnight stay or a daily visit—their team will be happy to help with your requirements.'}
                    </p>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => onNavigate?.('joinIndastreet')}
                        className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors rounded focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                        {language === 'id' ? 'Gabung Indastreet' : 'Join Indastreet'}
                    </button>
                </div>

                {/* Partners grid – app theme cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPartners.map((partner) => {
                        const cardClass = 'bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200';
                        return (
                            <div key={partner.id} className={cardClass}>
                                <div className="relative w-full h-40 overflow-hidden rounded-t-2xl bg-gray-100">
                                    <img
                                        src={partner.imageUrl || getRandomDefaultImage()}
                                        alt={`${partner.name} cover`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = getRandomDefaultImage();
                                        }}
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
                                        {partner.verified && (
                                            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm text-orange-400 text-xs font-bold rounded-lg">
                                                {t?.partners?.verifiedPartner || 'VERIFIED'}
                                            </span>
                                        )}
                                        {partner.rating != null && partner.rating > 0 && (
                                            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm text-orange-400 text-xs font-bold rounded-lg flex items-center gap-1">
                                                <StarIcon className="w-3.5 h-3.5 text-orange-400" />
                                                {partner.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPartnerToShare(partner);
                                            setShowSharePopup(true);
                                        }}
                                        className="absolute bottom-3 right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all z-10"
                                        title="Share this partner"
                                        aria-label="Share this partner"
                                    >
                                        <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{partner.name}</h3>
                                    {partner.location && (
                                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                            <MapPinIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <span className="truncate">{partner.location}</span>
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                        {partner.description && partner.description.length > 200
                                            ? partner.description.substring(0, 200) + '...'
                                            : partner.description}
                                    </p>
                                    {partner.specialties && partner.specialties.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {partner.specialties.slice(0, 4).map((amenity, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-0.5 bg-black/80 backdrop-blur-sm text-orange-400 text-xs font-medium rounded-lg"
                                                >
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {partner.addedDate && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            {t?.partners?.added || 'Member since'} {new Date(partner.addedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const message = language === 'id'
                                                ? `Halo, saya ingin menanyakan ketersediaan di ${partner.name}. Terima kasih`
                                                : `Hi, I would like to enquire regarding availability at ${partner.name}. Thank you`;
                                            const phoneNumber = partner.phone?.replace(/[^0-9]/g, '') || '';
                                            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <CalendarIcon className="w-5 h-5" />
                                        {language === 'id' ? 'Pesan Reservasi' : 'Book Reservation'}
                                    </button>
                                    {loggedInPartnerId === partner.id && loggedInPartnerType && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNavigate?.(loggedInPartnerType === 'hotel' ? 'partner-settings-hotel' : loggedInPartnerType === 'villa' ? 'partner-settings-villa' : 'partner-settings');
                                            }}
                                            className="w-full mt-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {language === 'id' ? 'Kelola Pengaturan' : 'Manage Settings'}
                                        </button>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-3 mt-3 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPartner(partner); setShowReferModal(true); }}
                                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                        >
                                            {language === 'id' ? 'Bagikan' : 'Share'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPartner(partner); setShowReviewModal(true); }}
                                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                        >
                                            {language === 'id' ? 'Ulasan' : 'Review'}
                                        </button>
                                        {onNavigate && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onNavigate('massageTypes'); }}
                                                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                            >
                                                {language === 'id' ? 'Direktori' : 'Directory'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

                {/* Join Partner CTA – app theme card */}
                <div className="mt-10 sm:mt-12 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div
                        className="relative p-6 sm:p-8 text-center"
                        style={{
                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20blogssss.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                                {language === 'id' ? 'Ingin menjadi Mitra Indastreet?' : 'Want to become an Indastreet Partner?'}
                            </h2>
                            <p className="text-white/95 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                                {language === 'id'
                                    ? 'Bergabung dengan jaringan hotel, villa, dan gym terverifikasi. Tampilkan bisnis Anda dan tingkatkan visibilitas.'
                                    : 'Join our network of verified hotels, villas and gyms. Get featured and boost your visibility.'}
                            </p>
                            <button
                                onClick={() => onNavigate && onNavigate('partner-contact')}
                                className="bg-orange-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-orange-600 transition-all text-sm sm:text-base shadow-md"
                            >
                                {language === 'id' ? 'Daftar Kemitraan' : 'Apply for Partnership'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer – app theme */}
            <div className="bg-white border-t border-gray-100 mt-8 py-6 sm:py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-gray-600 text-xs sm:text-sm">
                        {language === 'id'
                            ? 'Semua mitra dimiliki dan dioperasikan secara independen. Indastreet menghubungkan Anda dengan hotel, villa, dan gym terpercaya.'
                            : 'All partners are independently owned and operated. Indastreet connects you with trusted hotels, villas and gyms.'}
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
