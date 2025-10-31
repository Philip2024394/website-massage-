import React, { useState, useEffect } from 'react';
import { therapistService, placeService } from '../lib/appwriteService';

interface MassageBaliPageProps {
    onNavigate?: (page: string) => void;
    onSelectTherapist?: (therapistId: number) => void;
}

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const MassageBaliPage: React.FC<MassageBaliPageProps> = ({ onNavigate }) => {
    console.log('🌺 MassageBaliPage: Component rendered');
    console.log('onNavigate prop:', !!onNavigate);
    
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Real data states
    const [totalTherapists, setTotalTherapists] = useState<number>(0);
    const [totalPlaces, setTotalPlaces] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [areaStats, setAreaStats] = useState<{[key: string]: number}>({});
    const [featuredTherapists, setFeaturedTherapists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real data from Appwrite
    useEffect(() => {
        console.log('🌺 MassageBaliPage: useEffect triggered, fetching data...');
        const fetchRealData = async () => {
            try {
                setIsLoading(true);
                const [therapistsData, placesData] = await Promise.all([
                    therapistService.getTherapists(),
                    placeService.getPlaces()
                ]);
                
                console.log('✅ MassageBaliPage: Data fetched successfully');
                console.log('Therapists:', therapistsData?.length);
                console.log('Places:', placesData?.length);

                // Calculate total therapists
                const activeTherapists = therapistsData?.filter((t: any) => t.isLive === true) || [];
                setTotalTherapists(activeTherapists.length);

                // Calculate total places (massage spas)
                const activePlaces = placesData?.filter((p: any) => p.isLive === true) || [];
                setTotalPlaces(activePlaces.length);

                // Get featured therapists (top rated, limit to 3)
                const topRatedTherapists = activeTherapists
                    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3);
                setFeaturedTherapists(topRatedTherapists);

                // Calculate average rating from both therapists and places
                const allProviders = [...activeTherapists, ...activePlaces];
                if (allProviders.length > 0) {
                    const totalRating = allProviders.reduce((sum: number, provider: any) => {
                        const rating = provider.rating || 0;
                        return sum + rating;
                    }, 0);
                    const avgRating = totalRating / allProviders.length;
                    setAverageRating(Math.round(avgRating * 10) / 10); // Round to 1 decimal
                }

                // Calculate stats by area
                const areaCounts: {[key: string]: number} = {};
                allProviders.forEach((provider: any) => {
                    const location = provider.location?.toLowerCase() || '';
                    
                    // Match locations to areas
                    if (location.includes('seminyak')) areaCounts.seminyak = (areaCounts.seminyak || 0) + 1;
                    else if (location.includes('ubud')) areaCounts.ubud = (areaCounts.ubud || 0) + 1;
                    else if (location.includes('canggu')) areaCounts.canggu = (areaCounts.canggu || 0) + 1;
                    else if (location.includes('sanur')) areaCounts.sanur = (areaCounts.sanur || 0) + 1;
                    else if (location.includes('nusa dua') || location.includes('nusa-dua')) areaCounts['nusa-dua'] = (areaCounts['nusa-dua'] || 0) + 1;
                    else if (location.includes('jimbaran')) areaCounts.jimbaran = (areaCounts.jimbaran || 0) + 1;
                });
                
                setAreaStats(areaCounts);
                setIsLoading(false);
                console.log('✅ MassageBaliPage: All data loaded successfully');
            } catch (error) {
                console.error('❌ MassageBaliPage: Error fetching real data:', error);
                setIsLoading(false);
            }
        };

        fetchRealData();
    }, []);

    const areas = [
        { id: 'seminyak', name: 'Seminyak', count: areaStats.seminyak || 0, type: 'Luxury Beach Resort' },
        { id: 'ubud', name: 'Ubud', count: areaStats.ubud || 0, type: 'Cultural Wellness Hub' },
        { id: 'canggu', name: 'Canggu', count: areaStats.canggu || 0, type: 'Surf & Wellness' },
        { id: 'sanur', name: 'Sanur', count: areaStats.sanur || 0, type: 'Family-Friendly Beach' },
        { id: 'nusa-dua', name: 'Nusa Dua', count: areaStats['nusa-dua'] || 0, type: 'Premium Resort Area' },
        { id: 'jimbaran', name: 'Jimbaran', count: areaStats.jimbaran || 0, type: 'Beachfront Spa' },
    ];

    const massageTypes = [
        {
            name: 'Traditional Balinese Massage',
            price: 'IDR 150,000 - 300,000/hour',
            description: 'Deep tissue massage using acupressure, reflexology, and aromatherapy oils',
            popularity: 'Most Popular',
            icon: 'https://ik.imagekit.io/7grri5v7d/hot%20stone%20massage.png?updatedAt=1761745973146'
        },
        {
            name: 'Hot Stone Massage',
            price: 'IDR 250,000 - 450,000/90min',
            description: 'Smooth volcanic stones heated and placed on body for deep relaxation',
            popularity: 'Luxury Choice',
            icon: 'https://ik.imagekit.io/7grri5v7d/hot%20stone%20massage%20indonisea.png?updatedAt=1761746078889'
        },
        {
            name: 'Aromatherapy Massage',
            price: 'IDR 180,000 - 350,000/hour',
            description: 'Gentle massage with essential oils for relaxation and healing',
            popularity: 'Relaxation Favorite',
            icon: 'https://ik.imagekit.io/7grri5v7d/athoromathi%20massage.png?updatedAt=1761746249380'
        },
        {
            name: 'Deep Tissue Massage',
            price: 'IDR 200,000 - 400,000/hour',
            description: 'Intensive therapy targeting muscle knots and chronic tension',
            popularity: 'Therapeutic',
            icon: 'https://ik.imagekit.io/7grri5v7d/deep%20tissue.png?updatedAt=1761746165070'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Side Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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

                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => {
                                        console.log('🏠 Back to Home clicked from MassageBaliPage');
                                        setIsMenuOpen(false);
                                        onNavigate?.('home');
                                    }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
            {/* Hero Section */}
            <div className="relative text-white py-16 md:py-24 overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20jogja%20indonisea.png?updatedAt=1761561233215)'
                    }}
                ></div>
                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 drop-shadow-lg">Massage in Bali</h1>
                    <p className="text-lg md:text-2xl text-white mb-3 md:mb-4 drop-shadow-md">
                        Find Professional Balinese Massage Therapists Across the Island
                    </p>
                    <p className="text-sm md:text-lg text-white mb-6 md:mb-8 drop-shadow-md">
                        {isLoading ? 'Loading...' : `${totalTherapists + totalPlaces}+ verified massage therapists | ${totalPlaces}+ spa partners | Instant booking`}
                    </p>
                    <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                        <button 
                            onClick={() => onNavigate?.('home')}
                            className="px-6 md:px-8 py-3 md:py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg text-base md:text-lg"
                        >
                            Browse Therapists
                        </button>
                        <button 
                            onClick={() => onNavigate?.('home')}
                            className="px-6 md:px-8 py-3 md:py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg text-base md:text-lg"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-12 relative z-20">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">
                                {isLoading ? '...' : `${totalTherapists + totalPlaces}+`}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Massage Therapists in Bali</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">
                                {isLoading ? '...' : `${totalPlaces}+`}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Massage Spa Partners</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">24/7</div>
                            <div className="text-xs md:text-sm text-gray-600">Booking Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1 md:mb-2">
                                {isLoading ? '...' : averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
                {/* Popular Areas */}
                <div className="mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Popular Areas in Bali</h2>
                    <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                        {areas.map((area) => (
                            <div 
                                key={area.id}
                                onClick={() => setSelectedArea(area.id)}
                                className={`relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                                    selectedArea === area.id ? 'ring-4 ring-orange-500' : ''
                                }`}
                            >
                                {/* Background Image for Seminyak */}
                                {area.id === 'seminyak' && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indonisea%20city.png?updatedAt=1761741384361)'
                                        }}
                                    ></div>
                                )}
                                {/* Background Image for Ubud */}
                                {area.id === 'ubud' && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20fields.png?updatedAt=1761741529395)'
                                        }}
                                    ></div>
                                )}
                                {/* Background Image for Canggu */}
                                {area.id === 'canggu' && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20er.png?updatedAt=1761742046025)'
                                        }}
                                    ></div>
                                )}
                                {/* Background Image for Sanur */}
                                {area.id === 'sanur' && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20paddie.png?updatedAt=1761742312003)'
                                        }}
                                    ></div>
                                )}
                                {/* Background Image for Nusa Dua */}
                                {area.id === 'nusa-dua' && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea.png?updatedAt=1761742702514)'
                                        }}
                                    ></div>
                                )}
                                {/* Background Image for Jimbaran */}
                                {area.id === 'jimbaran' && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea%20island.png?updatedAt=1761743048054)'
                                        }}
                                    ></div>
                                )}
                                {/* White background for other areas */}
                                {area.id !== 'seminyak' && area.id !== 'ubud' && area.id !== 'canggu' && area.id !== 'sanur' && area.id !== 'nusa-dua' && area.id !== 'jimbaran' && (
                                    <div className="absolute inset-0 bg-white"></div>
                                )}
                                
                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-3 md:mb-4">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-lg">{area.name}</h3>
                                            <p className="text-xs md:text-sm text-gray-700 drop-shadow-md">{area.type}</p>
                                        </div>
                                        <div className="bg-orange-100 text-orange-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
                                            {area.count}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate?.('home')}
                                        className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm md:text-base shadow-lg"
                                    >
                                        View Therapists
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Massage Types */}
                <div className="mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 text-center">Popular Massage Types in Bali</h2>
                    <p className="text-center text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                        Discover traditional Balinese healing techniques and modern wellness therapies
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {massageTypes.map((type, index) => (
                            <div key={index} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-3 md:gap-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                                        <img 
                                            src={type.icon} 
                                            alt={type.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{type.name}</h3>
                                            <span className="bg-orange-100 text-orange-700 px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                                {type.popularity}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3 text-xs md:text-sm">{type.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-orange-600 font-bold text-sm md:text-base">{type.price}</span>
                                            <button 
                                                onClick={() => onNavigate?.('home')}
                                                className="text-orange-600 hover:text-orange-700 font-bold text-xs md:text-sm"
                                            >
                                                Find Therapist →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Therapists */}
                <div className="mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Featured Bali Therapists</h2>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading therapists...</p>
                        </div>
                    ) : featuredTherapists.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No featured therapists available</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
                            {featuredTherapists.map((therapist, index) => (
                                <div key={therapist.id || index} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    {/* Profile Image Circle */}
                                    <div className="flex justify-center mb-4">
                                        {therapist.profileImage ? (
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg border-4 border-orange-500">
                                                <img 
                                                    src={therapist.profileImage} 
                                                    alt={therapist.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg">
                                                {therapist.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-center mb-3 md:mb-4">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{therapist.name}</h3>
                                        <p className="text-xs md:text-sm text-gray-500">{therapist.location || 'Bali'}</p>
                                        {therapist.isLive && (
                                            <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="mb-3">
                                        {therapist.specialties && therapist.specialties.length > 0 && (
                                            <div className="text-xs md:text-sm text-gray-600 mb-1">
                                                <span className="font-bold">Specialty:</span> {therapist.specialties[0]}
                                            </div>
                                        )}
                                        {therapist.experience && (
                                            <div className="text-xs md:text-sm text-gray-600 mb-1">
                                                <span className="font-bold">Experience:</span> {therapist.experience}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-yellow-500 font-bold text-sm md:text-base">
                                                {therapist.rating ? therapist.rating.toFixed(1) : 'N/A'}
                                            </span>
                                            <span className="text-gray-500 text-xs md:text-sm">
                                                ({therapist.reviewCount || 0} reviews)
                                            </span>
                                        </div>
                                        {therapist.languages && therapist.languages.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {therapist.languages.map((lang: string, i: number) => (
                                                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (therapist.id) {
                                                onNavigate?.('home');
                                            }
                                        }}
                                        className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm md:text-base"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Why Choose Bali Massage */}
                <div className="mb-12 md:mb-16 relative rounded-xl md:rounded-2xl overflow-hidden">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20fields.png?updatedAt=1761741529395)'
                        }}
                    ></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-6 md:p-12 text-white">
                        <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-center drop-shadow-lg">Why Bali is the Massage Capital of Asia</h2>
                        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl md:text-2xl">🌺</span>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 drop-shadow-md">Ancient Healing Traditions</h3>
                                <p className="text-white drop-shadow-md text-sm md:text-base">
                                    Balinese massage has been practiced for over 1,000 years, combining acupressure, 
                                    reflexology, and aromatherapy for holistic healing.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl md:text-2xl">👨‍⚕️</span>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 drop-shadow-md">Highly Trained Therapists</h3>
                                <p className="text-white drop-shadow-md text-sm md:text-base">
                                    Bali has specialized massage schools and certification programs producing 
                                    world-class therapists recognized globally.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl md:text-2xl">💰</span>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 drop-shadow-md">Affordable Luxury</h3>
                                <p className="text-white drop-shadow-md text-sm md:text-base">
                                    World-class massage experiences at a fraction of the price compared to 
                                    Western countries. Premium treatments from IDR 150,000.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl md:text-2xl">🏝️</span>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 drop-shadow-md">Wellness Tourism Hub</h3>
                                <p className="text-white drop-shadow-md text-sm md:text-base">
                                    Bali attracts 6 million tourists annually seeking wellness experiences, 
                                    creating a thriving massage and spa industry.
                                </p>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

                {/* How to Book */}
                <div className="mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">How to Book a Massage in Bali</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <span className="text-2xl md:text-3xl font-bold text-orange-600">1</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Browse Therapists</h3>
                            <p className="text-xs md:text-sm text-gray-600">Search by location, specialty, price, and availability</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <span className="text-2xl md:text-3xl font-bold text-orange-600">2</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Check Reviews</h3>
                            <p className="text-xs md:text-sm text-gray-600">Read verified reviews from real clients</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <span className="text-2xl md:text-3xl font-bold text-orange-600">3</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Chat live with therapist / Massage Spa</h3>
                            <p className="text-xs md:text-sm text-gray-600">Connect via chat window to arrange your booking</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <span className="text-2xl md:text-3xl font-bold text-orange-600">4</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Enjoy Your Massage</h3>
                            <p className="text-xs md:text-sm text-gray-600">Relax and experience authentic Balinese therapy</p>
                        </div>
                    </div>
                </div>

                {/* SEO FAQ Section */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-3 md:space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">How much does a massage in Bali cost?</h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                                Traditional Balinese massage typically ranges from IDR 150,000 to 300,000 per hour. 
                                Specialty treatments like hot stone massage cost IDR 250,000 to 450,000. Hotel spa 
                                prices are generally higher (IDR 400,000+) compared to independent therapists.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">What is a traditional Balinese massage?</h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                                Balinese massage is a full-body treatment combining gentle stretching, acupressure, 
                                reflexology, and aromatherapy. It uses long strokes, skin rolling, and palm pressure 
                                to stimulate blood flow, relieve tension, and promote relaxation.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Where can I get a massage in Bali?</h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                                Popular areas include Ubud (wellness hub), Seminyak (luxury spas), Canggu (surf wellness), 
                                Nusa Dua (resort spas), Sanur (family-friendly), and Jimbaran (beachfront). IndaStreet 
                                connects you with verified therapists across all areas.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Are Bali massage therapists certified?</h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                                All therapists on IndaStreet are verified and certified. Most have completed formal 
                                training at Bali massage schools and hold certifications in traditional Balinese, 
                                Swedish, deep tissue, and specialized techniques.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Can I book a massage at my hotel or villa?</h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                                Yes! Many therapists on IndaStreet offer in-room or in-villa services. Simply specify 
                                your location when booking and the therapist will bring all necessary equipment 
                                (massage table, oils, towels) to you.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="mt-12 md:mt-16 relative rounded-xl md:rounded-2xl overflow-hidden">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382&v=20251031-v3)'
                        }}
                        key="massage-bali-bg-v3"
                    ></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center p-6 md:p-12 text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 drop-shadow-lg">Ready to Experience Authentic Balinese Massage?</h2>
                        <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-md">
                            Browse {isLoading ? '...' : `${totalTherapists + totalPlaces}+`} verified massage therapists across Bali and book your perfect massage experience today
                        </p>
                        <button 
                            onClick={() => onNavigate?.('home')}
                            className="px-8 md:px-12 py-3 md:py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg text-base md:text-lg"
                        >
                            Start Browsing Therapists
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
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

export default MassageBaliPage;
