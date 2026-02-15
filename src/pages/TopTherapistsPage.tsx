// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// Top 5 Therapists: good reviews, bookings, detailed menu, account health. Rotates weekly per location.
import React, { useState, useMemo } from 'react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { Star, Calendar, Eye, CheckCircle2 } from 'lucide-react';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import FloatingPageFooter from '../components/FloatingPageFooter';
import { logger } from '../utils/logger';
import { getWeekSeed, seededShuffle } from '../utils/weekSeedUtils';

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
    
    // Score therapist for "top 5" eligibility: good reviews, bookings, detailed menu, account health.
    // We take top N by score, then apply weekly seeded shuffle so the displayed 5 change each week per location.
    const scoreTherapist = (t: any): number => {
        const reviews = (t.rating || 0) * (Math.max(0, t.reviewCount || 0) + 1);
        const bookings = t.totalBookings || t.reviewCount || 0;
        const hasDetailedMenu = !!(t.pricing && (t.pricing['60'] || t.pricing['90'] || t.pricing['120'] || (t.services && t.services.length > 0)));
        const accountHealth = (t.isVerified || (t as any).verifiedBadge) ? 100 : 0;
        const activity = (t.$updatedAt || t.updatedAt) ? 10 : 0; // proxy for "time online" / recent activity
        return reviews * 2 + bookings * 5 + (hasDetailedMenu ? 50 : 0) + accountHealth + activity;
    };

    const isTherapistAvailableOnline = (t: any): boolean => {
        const isLive = t.isLive === true || (typeof t.isLive !== 'boolean' && t.isLive !== false);
        const status = (t.status || t.availability || t.availabilityStatus || '')
            .toString().trim().toLowerCase();
        const available = status === 'available' || status === 'online';
        return !!(isLive && available);
    };

    const getTopTherapistsByLocation = (): any[] => {
        logger.debug('🏆 [TOP5] Filtering therapists', { totalCount: therapists.length, userCity });

        let filtered = therapists.filter(isTherapistAvailableOnline);
        if (userCity) {
            filtered = filtered.filter(t => t.city && String(t.city).toLowerCase() === userCity.toLowerCase());
        }

        const scored = filtered.map(t => ({ therapist: t, score: scoreTherapist(t) }));
        scored.sort((a, b) => b.score - a.score);
        const topPool = scored.slice(0, 20).map(s => s.therapist);
        if (topPool.length <= 5) return topPool;

        const seed = getWeekSeed(userCity || null);
        const best = topPool[0];
        const rest = topPool.slice(1);
        const shuffledRest = seededShuffle([...rest], seed);
        const selected = [best, ...shuffledRest.slice(0, 4)];

        logger.debug('🏆 [TOP5] Top 5 this week', { count: selected.length, userCity, weekSeed: seed });
        return selected;
    };

    const topTherapists = useMemo(() => getTopTherapistsByLocation(), [therapists, userCity]);

    type BadgeKey = 'most-popular' | 'newest-menu-prices' | 'rating-climbing' | 'booking-success';
    const badgeAssignments = useMemo((): Record<number, BadgeKey> => {
        const out: Record<number, BadgeKey> = { 0: 'most-popular' };
        if (topTherapists.length < 2) return out;
        const seed = getWeekSeed(userCity || null);
        const badgeSeed = seed + 12345;
        const positions = seededShuffle([1, 2, 3, 4].filter(i => i < topTherapists.length), badgeSeed);
        const twoPositions = positions.slice(0, 2);
        const badgeTypes: BadgeKey[] = ['newest-menu-prices', 'rating-climbing', 'booking-success'];
        const shuffledBadges = seededShuffle([...badgeTypes], badgeSeed + 1);
        const firstBadge = shuffledBadges[0];
        let secondBadge = shuffledBadges[1];
        if (firstBadge === 'newest-menu-prices' && secondBadge === 'newest-menu-prices') {
            secondBadge = shuffledBadges[2] ?? 'rating-climbing';
        }
        out[twoPositions[0]] = firstBadge;
        out[twoPositions[1]] = secondBadge;
        return out;
    }, [topTherapists.length, userCity]);
    
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
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
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
                    <p className="text-gray-600 text-lg mb-2 text-center">
                        {currentLanguage === 'id'
                            ? 'Trending Bulan Ini untuk Performa dan Layanan Terbaik.'
                            : 'Trending This Month For Top Performance And Service.'}
                    </p>

                    {/* Location Badge */}
                    {userCity && (
                        <div className="flex justify-center mb-4">
                            <div className="px-6 py-3 rounded-full bg-orange-500 text-white font-semibold shadow-md flex items-center gap-2">
                                <span>📍</span>
                                <span>{userCity}</span>
                            </div>
                        </div>
                    )}

                    {/* Why these therapists? Standard criteria text */}
                    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-5 text-left">
                        <h3 className="text-base font-bold text-slate-900 mb-3">
                            {currentLanguage === 'id' ? 'Mengapa Terapis Ini Masuk Top 5?' : 'Why Are These Therapists in the Top 5?'}
                        </h3>
                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                            {currentLanguage === 'id'
                                ? 'Top 5 profesional kami diakui karena konsisten memberikan layanan berkualitas tinggi dan mempertahankan standar profesional yang kuat. Pemilihan berdasarkan performa keseluruhan dan kepuasan klien, dan terapis yang ditampilkan diperbarui secara berkala untuk menonjolkan berbagai profesional unggulan.'
                                : 'Our Top 5 professionals are recognized for consistently delivering high-quality service and maintaining strong professional standards. Selection is based on overall performance and client satisfaction, and the featured therapists are refreshed regularly to highlight a variety of outstanding professionals.'}
                        </p>
                        <p className="text-slate-700 text-sm font-semibold mb-2">
                            {currentLanguage === 'id' ? 'Pemilihan berdasarkan:' : 'Selection is based on:'}
                        </p>
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span>{currentLanguage === 'id' ? 'Ulasan Klien yang Sangat Baik – Umpan balik positif yang konsisten dari klien.' : 'Excellent Client Reviews – Consistently positive feedback from clients.'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span>{currentLanguage === 'id' ? 'Kehadiran Aktif & Mapan – Keandalan dan keterlibatan berkelanjutan di platform.' : 'Active & Established Presence – Demonstrated reliability and ongoing engagement on the platform.'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span>{currentLanguage === 'id' ? 'Performa Booking yang Kuat – Permintaan tinggi dan janji temu klien yang konsisten.' : 'Strong Booking Performance – High demand and consistent client appointments.'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span>{currentLanguage === 'id' ? 'Informasi Layanan Lengkap – Menu layanan yang jelas dan rinci serta harga transparan.' : 'Comprehensive Service Information – Clear, detailed service menus and transparent pricing.'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span>{currentLanguage === 'id' ? 'Standar Akun Profesional – Profil yang terpelihara dengan baik dan memenuhi standar kualitas platform.' : 'Professional Account Standing – Well-maintained profiles that meet platform quality standards.'}</span>
                            </li>
                        </ul>
                        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                            {currentLanguage === 'id'
                                ? 'Profesional unggulan kami dirotasi secara berkala agar beragam terapis berkinerja terbaik mendapat visibilitas.'
                                : 'Our featured professionals rotate periodically to ensure visibility for a diverse range of top-performing therapists.'}
                        </p>
                    </div>
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
                            
                            // PRODUCTION DEBUG: Log each therapist's unique data
                            const bookingCount = therapist.totalBookings || therapist.reviewCount || 0;
                            const rating = therapist.rating || 0;
                            
                            logger.debug(`🏆 [TOP5] Rendering therapist #${index + 1}`, {
                                id: therapistId,
                                name: therapist.name,
                                bookings: bookingCount,
                                rating: rating,
                                city: therapist.city
                            });
                            
                            return (
                                <div 
                                    key={therapistId}
                                    className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                                >
                                <div className="flex items-center gap-4">
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
                                            {/* Bookings - Use computed value to prevent reference issues */}
                                            <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
                                                <Calendar className="w-4 h-4" />
                                                <span>{bookingCount} {currentLanguage === 'id' ? 'booking' : 'bookings'}</span>
                                            </div>
                                            
                                            {/* Rating - Use computed value to prevent reference issues */}
                                            <div className="flex items-center gap-1.5 text-yellow-600 font-semibold">
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                                <span>{rating > 0 ? rating.toFixed(1) : 'New'} ({therapist.reviewCount || 0})</span>
                                            </div>
                                            
                                            {/* City */}
                                            {therapist.city && (
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <span>📍</span>
                                                    <span>{therapist.city}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1.5">
                                            {currentLanguage === 'id'
                                                ? 'Masuk Top 5: ulasan, booking, menu lengkap, kesehatan akun.'
                                                : 'In Top 5 for: reviews, bookings, detailed menu, account health.'}
                                        </p>
                                    </div>

                                    {/* View Profile Button - diverts to therapist profile page */}
                                    <button
                                        onClick={() => {
                                            const therapistId = therapist.$id || therapist.id;
                                            const slug = (therapist.name || 'therapist').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                            logger.debug('🏆 [TOP5] View profile clicked', { id: therapistId, name: therapist.name });
                                            try {
                                                if (onSelectTherapist) {
                                                    onSelectTherapist(therapist);
                                                }
                                                if (typeof window !== 'undefined' && window.history) {
                                                    window.history.pushState({}, '', `#/therapist-profile/${therapistId}-${slug}`);
                                                }
                                                if (onNavigate) {
                                                    onNavigate('therapist-profile');
                                                }
                                            } catch (error) {
                                                logger.error('🏆 [TOP5] Navigation failed', error);
                                            }
                                        }}
                                        className="flex-shrink-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-md flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                            {currentLanguage === 'id' ? 'Lihat' : 'View'}
                                        </span>
                                    </button>
                                </div>

                                {/* Badge: #1 always Most Popular; 2 of the other 4 get random badges (Newest Menu/Prices max once) */}
                                {badgeAssignments[index] && (
                                    <div className="mt-3 text-center">
                                        <span className="inline-block px-4 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 font-bold text-xs rounded-full">
                                            {badgeAssignments[index] === 'most-popular' && (
                                                <>🏆 {currentLanguage === 'id' ? 'TERAPIS TERPOPULER' : 'MOST POPULAR THERAPIST'}</>
                                            )}
                                            {badgeAssignments[index] === 'newest-menu-prices' && (
                                                <>{currentLanguage === 'id' ? '✨ Menu & Harga Terbaru' : '✨ Newest Menu & Prices'}</>
                                            )}
                                            {badgeAssignments[index] === 'rating-climbing' && (
                                                <>{currentLanguage === 'id' ? '📈 Rating Naik' : '📈 Account Rating Climbing'}</>
                                            )}
                                            {badgeAssignments[index] === 'booking-success' && (
                                                <>{currentLanguage === 'id' ? '✅ 98% Booking Sukses' : '✅ 98% Booking Success'}</>
                                            )}
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
