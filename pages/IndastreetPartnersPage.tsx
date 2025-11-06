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
    ArrowLeft
} from 'lucide-react';

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
    onBack: () => void;
    onNavigate?: (page: any) => void;
    t: any;
}

const IndastreetPartnersPage: React.FC<IndastreetPartnersPageProps> = ({ onBack, onNavigate: _onNavigate, t: _t }) => {
    const [partners, setPartners] = useState<PartnerWebsite[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Enhanced mock data with website previews
    const mockPartners: PartnerWebsite[] = [
        {
            id: '1',
            name: 'Serenity Spa Therapy',
            websiteUrl: 'https://serenityspatherapy.com',
            websiteTitle: 'Professional Massage & Wellness',
            description: 'Award-winning spa offering traditional Thai massage, deep tissue therapy, and wellness treatments with certified therapists.',
            category: 'therapist',
            location: 'Seminyak, Bali',
            phone: '+62 361 555 0123',
            verified: true,
            rating: 4.9,
            imageUrl: '/api/placeholder/300/200',
            specialties: ['Thai Massage', 'Deep Tissue', 'Aromatherapy', 'Hot Stone'],
            addedDate: '2024-10-15',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=serenityspatherapy.com&viewport=1440x900&width=400'
        },
        {
            id: '2',
            name: 'Ocean View Resort & Spa',
            websiteUrl: 'https://oceanviewresort.com',
            websiteTitle: 'Luxury Resort with World-Class Spa',
            description: 'Beachfront luxury resort featuring comprehensive spa services, wellness programs, and world-class amenities.',
            category: 'hotel',
            location: 'Nusa Dua, Bali',
            phone: '+62 361 555 0456',
            verified: true,
            rating: 4.8,
            imageUrl: '/api/placeholder/300/200',
            specialties: ['Luxury Spa', 'Wellness Programs', 'Beachfront', '5-Star Service'],
            addedDate: '2024-10-12',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=oceanviewresort.com&viewport=1440x900&width=400'
        },
        {
            id: '3',
            name: 'Healing Hands Massage Center',
            websiteUrl: 'https://healinghandsmassage.com',
            websiteTitle: 'Therapeutic Massage & Rehabilitation',
            description: 'Specialized massage center focusing on therapeutic treatments, sports rehabilitation, and wellness recovery programs.',
            category: 'massage-place',
            location: 'Ubud, Bali',
            phone: '+62 361 555 0789',
            verified: true,
            rating: 4.7,
            imageUrl: '/api/placeholder/300/200',
            specialties: ['Sports Massage', 'Rehabilitation', 'Physical Therapy', 'Wellness Recovery'],
            addedDate: '2024-10-10',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=healinghandsmassage.com&viewport=1440x900&width=400'
        },
        {
            id: '4',
            name: 'Paradise Villa Retreat',
            websiteUrl: 'https://paradisevillaretreat.com',
            websiteTitle: 'Private Villa with In-House Spa',
            description: 'Exclusive private villa offering personalized spa experiences, couple retreats, and holistic wellness programs.',
            category: 'villa',
            location: 'Canggu, Bali',
            phone: '+62 361 555 0321',
            verified: false,
            rating: 4.6,
            imageUrl: '/api/placeholder/300/200',
            specialties: ['Private Spa', 'Couples Retreat', 'Yoga', 'Holistic Wellness'],
            addedDate: '2024-10-08',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=paradisevillaretreat.com&viewport=1440x900&width=400'
        },
        {
            id: '5',
            name: 'Traditional Balinese Healing',
            websiteUrl: 'https://balinesehealingcenter.com',
            websiteTitle: 'Authentic Balinese Massage & Healing',
            description: 'Traditional Balinese healing center offering authentic massage techniques passed down through generations.',
            category: 'therapist',
            location: 'Ubud, Bali',
            phone: '+62 361 555 0987',
            verified: true,
            rating: 4.8,
            imageUrl: '/api/placeholder/300/200',
            specialties: ['Balinese Massage', 'Traditional Healing', 'Herbal Therapy'],
            addedDate: '2024-10-05',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=balinesehealingcenter.com&viewport=1440x900&width=400'
        },
        {
            id: '6',
            name: 'Wellness Spa & Treatment Center',
            websiteUrl: 'https://wellnessspatreatment.com',
            websiteTitle: 'Complete Wellness & Spa Solutions',
            description: 'Comprehensive wellness center offering massage therapy, beauty treatments, and holistic health programs.',
            category: 'massage-place',
            location: 'Sanur, Bali',
            phone: '+62 361 555 0654',
            verified: true,
            rating: 4.5,
            imageUrl: '/api/placeholder/300/200',
            specialties: ['Wellness Programs', 'Beauty Treatments', 'Holistic Health'],
            addedDate: '2024-10-03',
            websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=wellnessspatreatment.com&viewport=1440x900&width=400'
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
            color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        },
        { 
            value: 'therapist', 
            label: 'Indastreet Therapists', 
            icon: '💆‍♀️', 
            count: partners.filter(p => p.category === 'therapist').length,
            color: 'bg-gradient-to-r from-purple-500 to-indigo-500'
        },
        { 
            value: 'massage-place', 
            label: 'Indastreet Massage Places', 
            icon: '🏢', 
            count: partners.filter(p => p.category === 'massage-place').length,
            color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
        },
        { 
            value: 'hotel', 
            label: 'Indastreet Hotels', 
            icon: '🏨', 
            count: partners.filter(p => p.category === 'hotel').length,
            color: 'bg-gradient-to-r from-green-500 to-emerald-500'
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
            'therapist': 'bg-purple-100 text-purple-800 border-purple-200',
            'massage-place': 'bg-blue-100 text-blue-800 border-blue-200',
            'hotel': 'bg-green-100 text-green-800 border-green-200',
            'villa': 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200';
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Indastreet Partners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <button 
                            onClick={onBack}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Home
                        </button>
                        <h1 className="text-xl font-bold">
                            <span className="text-gray-900">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                    </div>
                </div>
            </div>
            
            {/* SEO-Optimized Header */}
            <div className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                            🤝 Indastreet Partners
                        </h1>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover our trusted network of verified wellness professionals, luxury accommodations, 
                            and spa destinations. Each partner maintains their own website with detailed services and live previews.
                        </p>
                        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <BadgeCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                                Verified Partners
                            </div>
                            <div className="flex items-center">
                                <EyeIcon className="w-5 h-5 text-blue-500 mr-2" />
                                Live Website Previews
                            </div>
                            <div className="flex items-center">
                                <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
                                Quality Assured
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-lg">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search partners by name, location, or services..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <GlobeAltIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Category Statistics */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <UsersIcon className="w-5 h-5" />
                            <span><strong>{partners.length}</strong> Total Partners</span>
                            <span>•</span>
                            <span><strong>{partners.filter(p => p.verified).length}</strong> Verified</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Category Filter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => setSelectedCategory(category.value)}
                            className={`p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                                selectedCategory === category.value
                                    ? `${category.color} text-white shadow-xl`
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{category.icon}</span>
                                <span className={`text-2xl font-bold ${
                                    selectedCategory === category.value ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {category.count}
                                </span>
                            </div>
                            <h3 className="font-semibold text-sm leading-tight">
                                {category.label}
                            </h3>
                        </button>
                    ))}
                </div>

                {/* Enhanced Partners Grid with Website Previews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredPartners.map((partner) => (
                        <div key={partner.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            {/* Website Preview Section */}
                            <div className="relative h-48 bg-gradient-to-r from-indigo-400 to-purple-500">
                                {partner.websitePreview ? (
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
                                                <EyeIcon className="w-4 h-4 text-indigo-600" />
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
                            <div className="p-6">
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
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium text-center inline-flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Want to become an Indastreet Partner?</h2>
                    <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                        Join our network of verified wellness professionals and luxury accommodations. 
                        Get featured on our platform and boost your online visibility.
                    </p>
                    <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                        Apply for Partnership
                    </button>
                </div>
            </div>

            {/* SEO Footer */}
            <div className="bg-gray-50 mt-12 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600 text-sm">
                        All partner websites are independently owned and operated. 
                        Indastreet connects you with trusted wellness and hospitality professionals.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IndastreetPartnersPage;
