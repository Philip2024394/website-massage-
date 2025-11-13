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
    Heart as HeartIcon
} from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import FlyingButterfly from '../components/FlyingButterfly';

interface PartnerWebsite {
    id: string;
    name: string;
    websiteUrl: string;
    websiteTitle?: string;
    description?: string;
    category: 'therapist' | 'massage-place' | 'hotel' | 'villa';
    location?: string;
    phone?: string;
    verified: boolean;
    rating?: number;
    imageUrl?: string;
    specialties?: string[];
    addedDate: string;
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
    t 
}) => {
    const [partners, setPartners] = useState<PartnerWebsite[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        // TODO: Replace with real Appwrite data fetching
        // const fetchPartners = async () => {
        //     try {
        //         const therapists = await therapistService.getAllWithWebsites();
        //         const places = await placeService.getAllWithWebsites();
        //         const hotels = await hotelService.getAllWithWebsites();
        //         const villas = await villaService.getAllWithWebsites();
        //         setPartners([...therapists, ...places, ...hotels, ...villas]);
        //     } catch (error) {
        //         console.error('Error fetching partners:', error);
        //     }
        // };
        // fetchPartners();

        // Simulate loading data
        setTimeout(() => {
            setPartners(mockPartners);
            setLoading(false);
        }, 1000);
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
        const matchesCategory = selectedCategory === 'all' || partner.category === selectedCategory;
        const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.location?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Indastreet Partners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            <header className="bg-white p-4 shadow-md sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Quick Access Buttons */}
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('notifications');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Notifications"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('referral');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Invite Friends"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        <button onClick={() => {
                            console.log('🍔 Partners Page - Burger menu clicked! Current isMenuOpen:', isMenuOpen);
                            setIsMenuOpen(true);
                        }} title="Menu" style={{ zIndex: 9999, position: 'relative' }}>
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => {
                    console.log('🍔 Partners Page - AppDrawer onClose called');
                    setIsMenuOpen(false);
                }}
                t={t}
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
                therapists={therapists}
                places={places}
            />
            
            {/* Hero Section with Background Image */}
            <div 
                className="relative text-white py-12 sm:py-16 lg:py-24 overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20service.png?updatedAt=1762567819270)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-2xl font-bold sm:text-4xl lg:text-5xl xl:text-6xl drop-shadow-lg">
                        <span className="text-black">Inda</span><span className="text-orange-500">street</span>
                        <span className="text-black text-xl sm:text-3xl lg:text-4xl xl:text-5xl ml-2">Partners</span>
                    </h1>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-lg lg:text-xl text-white max-w-3xl mx-auto drop-shadow-md px-4">
                        Discover our trusted network of verified wellness professionals, luxury accommodations, 
                        and spa destinations. Each partner maintains their own website with detailed services and live previews.
                    </p>
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-white px-4">
                        <div className="flex items-center">
                            <BadgeCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-1 sm:mr-2" />
                            <span>Verified Partners</span>
                        </div>
                        <div className="flex items-center">
                            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mr-1 sm:mr-2" />
                            <span>Live Website Previews</span>
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1 sm:mr-2" />
                            <span>Quality Assured</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24">
                {/* Enhanced Search and Filter Section */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        {/* Search Bar */}
                        <div className="flex-1 lg:max-w-lg">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search partners by name, location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <GlobeAltIcon className="absolute left-3 top-2.5 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Category Statistics */}
                        <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span><strong>{partners.length}</strong> Total Partners</span>
                            <span className="hidden sm:inline">•</span>
                            <span><strong>{partners.filter(p => p.verified).length}</strong> Verified</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Category Filter Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => setSelectedCategory(category.value)}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                                selectedCategory === category.value
                                    ? `${category.color} text-white shadow-xl`
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <span className="text-lg sm:text-2xl">{category.icon}</span>
                                <span className={`text-lg sm:text-2xl font-bold ${
                                    selectedCategory === category.value ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {category.count}
                                </span>
                            </div>
                            <h3 className="font-semibold text-xs sm:text-sm leading-tight">
                                {category.label}
                            </h3>
                        </button>
                    ))}
                </div>

                {/* Enhanced Partners Grid with Website Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {filteredPartners.map((partner) => (
                        <div key={partner.id} className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2">
                            {/* Website Preview Section */}
                            <div className="relative h-40 sm:h-48 bg-gradient-to-r from-orange-400 to-amber-500">
                                {partner.imageUrl && !partner.imageUrl.includes('/api/placeholder') ? (
                                    <div className="relative h-full">
                                        <img
                                            src={partner.imageUrl}
                                            alt={`${partner.name} image`}
                                            className="w-full h-full object-cover opacity-90"
                                            onError={(e) => {
                                                // Fallback to gradient background
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 flex items-center space-x-2">
                                                <EyeIcon className="w-4 h-4 text-orange-600" />
                                                <span className="text-xs font-medium text-gray-700">Partner Image</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : partner.websitePreview ? (
                                    <div className="relative h-full">
                                        <img
                                            src={partner.websitePreview}
                                            alt={`${partner.name} website preview`}
                                            className="w-full h-full object-cover opacity-90"
                                            onError={(e) => {
                                                // Fallback to gradient background
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                            <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 flex items-center space-x-2">
                                                <EyeIcon className="w-4 h-4 text-orange-600" />
                                                <span className="text-xs font-medium text-gray-700">Live Preview</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                        <div className="text-6xl mb-2">
                                            {getCategoryIcon(partner.category)}
                                        </div>
                                        <span className="text-sm opacity-75">Website Preview Loading...</span>
                                    </div>
                                )}
                                
                                {/* Verification Badge */}
                                {partner.verified && (
                                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        Verified
                                    </div>
                                )}

                                {/* Category Tag with Enhanced Design */}
                                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(partner.category)} shadow-lg`}>
                                    <div className="flex items-center space-x-1">
                                        {getCategoryIcon(partner.category)}
                                        <span className="uppercase font-bold">
                                            {partner.category === 'massage-place' ? 'Massage Place' : partner.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Website URL Preview */}
                                <div className="absolute bottom-3 left-3 right-3 bg-white bg-opacity-95 rounded-lg px-3 py-2">
                                    <div className="flex items-center space-x-2">
                                        <GlobeAltIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-700 truncate font-mono">
                                            {partner.websiteUrl.replace('https://', '').replace('http://', '')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Partner Details */}
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                        {partner.name}
                                    </h3>
                                    {partner.rating && renderStars(partner.rating)}
                                </div>

                                {partner.websiteTitle && (
                                    <p className="text-sm font-medium text-indigo-600 mb-2">
                                        {partner.websiteTitle}
                                    </p>
                                )}

                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {partner.description}
                                </p>

                                {/* Location and Contact */}
                                <div className="space-y-2 mb-4">
                                    {partner.location && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPinIcon className="w-4 h-4 mr-2" />
                                            {partner.location}
                                        </div>
                                    )}
                                    {partner.phone && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <PhoneIcon className="w-4 h-4 mr-2" />
                                            {partner.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Specialties */}
                                {partner.specialties && partner.specialties.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {partner.specialties.slice(0, 3).map((specialty, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                            {partner.specialties.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    +{partner.specialties.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Visit Website Button */}
                                <a
                                    href={partner.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 rounded-lg font-medium text-center inline-flex items-center justify-center hover:from-orange-700 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    <ExternalLinkIcon className="w-5 h-5 mr-2" />
                                    Visit Website
                                </a>

                                {/* Added Date */}
                                <p className="text-xs text-gray-400 mt-3 text-center">
                                    Partner since {new Date(partner.addedDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPartners.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <GlobeAltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No partners found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms' : 'No partners in this category yet'}
                        </p>
                    </div>
                )}

                {/* Join Partner Program CTA */}
                <div className="mt-8 sm:mt-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center text-white mx-2 sm:mx-0">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Want to become an Indastreet Partner?</h2>
                    <p className="text-orange-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
                        Join our network of verified wellness professionals and luxury accommodations. 
                        Get featured on our platform and boost your online visibility.
                    </p>
                    <button 
                        onClick={() => onNavigate && onNavigate('partnership-application')}
                        className="bg-white text-orange-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
                    >
                        Apply for Partnership
                    </button>
                </div>
            </div>

            {/* SEO Footer */}
            <div className="bg-white border-t border-gray-100 mt-8 sm:mt-12 py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600 text-xs sm:text-sm">
                        All partner websites are independently owned and operated. 
                        Indastreet connects you with trusted wellness and hospitality professionals.
                    </p>
                </div>
            </div>
            
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

export default IndastreetPartnersPage;
