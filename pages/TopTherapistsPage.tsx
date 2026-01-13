import React, { useState, useMemo } from 'react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { ArrowLeft, Star, Calendar, Eye } from 'lucide-react';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface TopTherapistsPageProps {
    t: any;
    language?: 'en' | 'id';
    therapists?: any[];
    onNavigate?: (page: string) => void;
    onSelectTherapist?: (therapist: any) => void;
    userCity?: string;
}

const TopTherapistsPage: React.FC<TopTherapistsPageProps> = ({ 
    t, 
    language, 
    therapists = [], 
    onNavigate,
    onSelectTherapist,
    userCity
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language || 'en');
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const handleLanguageChange = (newLang: 'en' | 'id') => {
        setCurrentLanguage(newLang);
    };

    const handleImageLoad = (therapistId: string) => {
        setLoadedImages(prev => new Set(prev).add(therapistId));
    };
    
    // Filter and sort therapists by user's location and bookings
    const getTopTherapistsByLocation = () => {
        // Filter by user's city if provided
        let filtered = therapists;
        if (userCity) {
            filtered = therapists.filter(t => 
                t.city && t.city.toLowerCase() === userCity.toLowerCase()
            );
        }
        
        // Sort by bookings (last 30 days) or online time, then by rating
        return filtered
            .filter(t => t.rating && t.reviewCount > 0)
            .sort((a, b) => {
                // Sort by bookings first (if available), otherwise by rating
                const aBookings = a.totalBookings || a.reviewCount || 0;
                const bBookings = b.totalBookings || b.reviewCount || 0;
                
                if (bBookings !== aBookings) {
                    return bBookings - aBookings;
                }
                return (b.rating || 0) - (a.rating || 0);
            })
            .slice(0, 5);
    };
    
    const topTherapists = useMemo(() => getTopTherapistsByLocation(), [therapists, userCity]);
    
    // Get consistent Appwrite image for each therapist
    // FIX: Appwrite stores profile images as 'profilePicture', not 'profileImageUrl'
    // Priority: profilePicture > profileImageUrl > profileImage > mainImage > random Appwrite image
    const getTherapistImage = (therapist: any) => {
        const therapistId = therapist.$id || therapist.id || therapist.name;
        
        // Try multiple field names: profilePicture (Appwrite standard), profileImageUrl, profileImage
        const profileImage = therapist.profilePicture || therapist.profileImageUrl || therapist.profileImage;
        
        // If profile image exists and is valid (not base64), use it
        if (profileImage && !profileImage.startsWith('data:')) {
            return profileImage;
        }
        
        // Fallback to main image if available (banner/hero image)
        if (therapist.mainImage && !therapist.mainImage.startsWith('data:')) {
            return therapist.mainImage;
        }
        
        // Finally, use consistent random image from Appwrite storage (12 curated images)
        return getRandomTherapistImage(therapistId);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Universal Header */}
            <UniversalHeader 
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                isMenuOpen={isMenuOpen}
                menuIcon={<BurgerMenuIcon />}
                onNavigate={onNavigate}
                showLanguageSwitch={true}
                className="sticky top-0 z-40"
            />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate?.('home')}
                    className="mt-5 mb-4 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="mb-8">
                    {/* Hero Image */}
                    <div className="text-center mb-8 -mt-10">
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258"
                            alt="Indastreet Massage Logo"
                            className="w-60 h-60 object-contain mx-auto mb-4"
                        />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3 justify-center">
                        <span className="text-4xl">🏆</span>
                        {currentLanguage === 'id' ? 'Top 5 Terapis' : 'Top 5 Therapists'}
                    </h2>
                    <p className="text-gray-600 text-lg mb-6 text-center">
                        {currentLanguage === 'id' 
                            ? 'Terapis terpopuler berdasarkan jumlah booking dalam 30 hari terakhir.'
                            : 'Most popular therapists based on bookings in the last 30 days.'
                        }
                    </p>

                    {/* Location Badge */}
                    {userCity && (
                        <div className="flex justify-center mb-6">
                            <div className="px-6 py-3 rounded-full bg-orange-500 text-white font-semibold shadow-md flex items-center gap-2">
                                <span>📍</span>
                                <span>{userCity}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Therapists List */}
                {topTherapists.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {currentLanguage === 'id' ? 'Belum ada data terapis.' : 'No therapist data available yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topTherapists.map((therapist, index) => {
                            const therapistId = therapist.$id || therapist.id || therapist.name;
                            const imageUrl = getTherapistImage(therapist);
                            const isImageLoaded = loadedImages.has(therapistId);
                            
                            return (
                                <div 
                                    key={therapistId}
                                    className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                                >
                                <div className="flex items-center gap-4">
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md bg-gradient-to-br from-yellow-400 to-yellow-600">
                                        #{index + 1}
                                    </div>

                                    {/* Profile Image with Loading State */}
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        {!isImageLoaded && (
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse border-4 border-white shadow-lg" />
                                        )}
                                        <img
                                            src={imageUrl}
                                            alt={therapist.name}
                                            className={`w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg transition-opacity duration-300 ${
                                                isImageLoaded ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            onLoad={() => handleImageLoad(therapistId)}
                                            onError={(e) => {
                                                handleImageLoad(therapistId);
                                                // Fallback to default or another image from the pool
                                                const fallbackImage = getRandomTherapistImage(therapistId + '-fallback');
                                                (e.target as HTMLImageElement).src = fallbackImage;
                                            }}
                                        />
                                    </div>

                                    {/* Therapist Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 truncate">
                                            {therapist.name}
                                        </h3>
                                        
                                        {/* Stats Row */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                            {/* Bookings */}
                                            <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
                                                <Calendar className="w-4 h-4" />
                                                <span>{therapist.totalBookings || therapist.reviewCount || 0} {currentLanguage === 'id' ? 'booking' : 'bookings'}</span>
                                            </div>
                                            
                                            {/* Rating */}
                                            <div className="flex items-center gap-1.5 text-yellow-600 font-semibold">
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                                <span>{therapist.rating?.toFixed(1) || '0.0'} ({therapist.reviewCount || 0})</span>
                                            </div>
                                            
                                            {/* City */}
                                            {therapist.city && (
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <span>📍</span>
                                                    <span>{therapist.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* View Profile Button */}
                                    <button
                                        onClick={() => {
                                            onSelectTherapist?.(therapist);
                                            onNavigate?.('therapist-profile');
                                        }}
                                        className="flex-shrink-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-md flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                            {currentLanguage === 'id' ? 'Lihat' : 'View'}
                                        </span>
                                    </button>
                                </div>

                                {/* Trophy Animation for #1 */}
                                {index === 0 && (
                                    <div className="mt-3 text-center">
                                        <span className="inline-block px-4 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 font-bold text-xs rounded-full">
                                            🏆 {currentLanguage === 'id' ? 'TERAPIS TERPOPULER' : 'MOST POPULAR THERAPIST'}
                                        </span>
                                    </div>
                                )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-16">
                <FloatingPageFooter 
                    currentLanguage={currentLanguage}
                    onNavigate={onNavigate}
                />
            </div>

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate || (() => {})}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
            />
        </div>
    );
};

export default TopTherapistsPage;
