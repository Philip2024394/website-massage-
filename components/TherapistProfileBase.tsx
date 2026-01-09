/**
 * TherapistProfileBase - Pure Presentation Component
 * 
 * ARCHITECTURE:
 * - NO data fetching
 * - NO authentication logic
 * - NO route parameter parsing
 * - NO early returns
 * - ONLY presentation
 * 
 * USAGE:
 * - TherapistProfilePage wraps this with auth + navigation
 * - SharedTherapistProfile wraps this with direct fetch + SEO
 */

import React from 'react';
import TherapistCard from './TherapistCard';
import RotatingReviews from './RotatingReviews';
import SocialMediaLinks from './SocialMediaLinks';
import type { Therapist, UserLocation } from '../types';
import { getHeroImageForTherapist, HERO_WELCOME_TEXT } from '../config/heroImages';

interface TherapistProfileBaseProps {
    // REQUIRED: Must be resolved BEFORE mounting this component
    therapist: Therapist;
    
    // UI mode
    mode: 'authenticated' | 'shared';
    
    // Optional features
    userLocation?: UserLocation | null;
    showHeader?: boolean;
    showSEOFooter?: boolean;
    
    // Callbacks (optional - may not exist in shared mode)
    onRate?: () => void;
    onQuickBookWithChat?: () => void;
    onChatWithBusyTherapist?: () => void;
    onShowRegisterPrompt?: () => void;
    onIncrementAnalytics?: (metric: string) => void;
    onNavigate?: (page: string, data?: any) => void;
    
    // Auth context (optional - only in authenticated mode)
    isCustomerLoggedIn?: boolean;
    loggedInProviderId?: number | string;
    
    // Translations
    t?: any;
    language?: 'en' | 'id' | 'gb';
}

/**
 * TherapistProfileBase Component
 * 
 * CRITICAL RULES:
 * 1. NEVER render without therapist
 * 2. NEVER fetch data
 * 3. NEVER parse URLs
 * 4. ONLY present what's given
 */
const TherapistProfileBase: React.FC<TherapistProfileBaseProps> = ({
    therapist,
    mode,
    userLocation,
    showHeader = false,
    showSEOFooter = false,
    onRate,
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onShowRegisterPrompt,
    onIncrementAnalytics,
    onNavigate,
    isCustomerLoggedIn = false,
    loggedInProviderId,
    t = {},
    language = 'id'
}) => {
    const realDiscount = (therapist.discountPercentage && therapist.discountPercentage > 0 && therapist.discountEndTime) ? {
        percentage: therapist.discountPercentage,
        expiresAt: new Date(therapist.discountEndTime)
    } : null;

    // Get location-specific hero image
    const heroImage = getHeroImageForTherapist(therapist.$id, therapist.location || 'Yogyakarta');
    const welcomeText = HERO_WELCOME_TEXT[language] || HERO_WELCOME_TEXT.id;
    
    // SEO-optimized image alt text
    const city = (therapist.location || 'Yogyakarta').split(' ')[0];
    const heroImageAlt = `Professional massage therapy in ${city} - ${therapist.name} - Terapis pijat panggilan ${city}`;
    
    // Replace {city} placeholder with actual location
    const heroTitle = welcomeText.title.replace('{city}', city);
    const heroSubtitle = welcomeText.subtitle.replace(/{city}/g, city);

    return (
        <div className="bg-white">
            {/* Personalized Hero Banner - Only in shared mode */}
            {mode === 'shared' && (
                <div className="w-full bg-white pt-0 pb-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Centered Hero Image */}
                        <div className="mb-2">
                            <img 
                                src={heroImage}
                                alt={heroImageAlt}
                                className="w-64 h-64 object-contain mx-auto"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </div>
                        
                        {/* Welcome Text Below Image */}
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {heroTitle}
                            </h1>
                            <p className="text-base md:text-lg text-gray-700">
                                {heroSubtitle}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Therapist Card */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <TherapistCard
                    therapist={therapist}
                    userLocation={userLocation}
                    onRate={onRate || (() => {})}
                    onBook={() => {}}
                    onQuickBookWithChat={onQuickBookWithChat}
                    onChatWithBusyTherapist={onChatWithBusyTherapist}
                    onShowRegisterPrompt={onShowRegisterPrompt}
                    isCustomerLoggedIn={isCustomerLoggedIn}
                    onIncrementAnalytics={onIncrementAnalytics || (() => {})}
                    loggedInProviderId={loggedInProviderId}
                    onNavigate={onNavigate}
                    activeDiscount={realDiscount}
                    t={t}
                    hideJoinButton={mode === 'shared'}
                    customVerifiedBadge={mode === 'shared' ? "https://ik.imagekit.io/7grri5v7d/therapist_verfied-removebg-preview.png" : undefined}
                />

                {/* Rotating Reviews Section */}
                <div className="mt-8">
                    <RotatingReviews 
                        location={therapist.location || 'Yogyakarta'} 
                        limit={5}
                        providerId={(therapist as any).id || (therapist as any).$id}
                        providerName={(therapist as any).name}
                        providerType={'therapist'}
                        providerImage={(therapist as any).profilePicture || (therapist as any).mainImage}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>

                {/* SEO-Optimized Footer - Only in shared mode */}
                {mode === 'shared' && showSEOFooter && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        {/* Main Brand Section */}
                        <div className="text-center mb-6">
                            <a 
                                href="https://www.indastreetmassage.com" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                www.indastreetmassage.com
                            </a>
                            <p className="text-gray-600 mt-2">
                                {language === 'en' 
                                    ? 'Indonesia\'s Premier Massage Booking Platform'
                                    : 'Platform Booking Pijat Terbaik di Indonesia'
                                }
                            </p>
                        </div>

                        {/* Location-Specific Keywords */}
                        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                                {language === 'en' 
                                    ? `Professional Massage Services in ${therapist.location || 'Indonesia'}`
                                    : `Jasa Pijat Profesional di ${therapist.location || 'Indonesia'}`
                                }
                            </h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                {(() => {
                                    const city = therapist.location || 'Indonesia';
                                    const keywords = [
                                        `pijat-${city.toLowerCase().replace(/\s+/g, '-')}`,
                                        `massage-${city.toLowerCase().replace(/\s+/g, '-')}`,
                                        language === 'en' ? `${city} massage therapy` : `terapi pijat ${city}`,
                                        language === 'en' ? `massage near me` : `pijat panggilan`,
                                        language === 'en' ? `home massage service` : `jasa pijat ke rumah`,
                                        language === 'en' ? `professional therapist` : `terapis profesional`,
                                        language === 'en' ? `traditional massage` : `pijat tradisional`,
                                        language === 'en' ? `reflexology` : `pijat refleksi`
                                    ];
                                    
                                    return keywords.map((keyword, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                                        >
                                            {keyword}
                                        </span>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Service Highlights */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <div className="text-2xl mb-1">✅</div>
                                <p className="text-xs text-gray-600">
                                    {language === 'en' ? 'Verified Therapists' : 'Terapis Terverifikasi'}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <div className="text-2xl mb-1">🏠</div>
                                <p className="text-xs text-gray-600">
                                    {language === 'en' ? 'Home Service' : 'Layanan ke Rumah'}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <div className="text-2xl mb-1">💆</div>
                                <p className="text-xs text-gray-600">
                                    {language === 'en' ? 'Multiple Techniques' : 'Berbagai Teknik'}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <div className="text-2xl mb-1">⭐</div>
                                <p className="text-xs text-gray-600">
                                    {language === 'en' ? 'Top Rated' : 'Rating Terbaik'}
                                </p>
                            </div>
                        </div>

                        {/* Rich Footer Text for SEO */}
                        <div className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
                            <p className="leading-relaxed">
                                {language === 'en' 
                                    ? `Book ${therapist.name} and discover professional massage services in ${therapist.location || 'Indonesia'}. IndaStreet Massage connects you with certified therapists offering traditional Indonesian massage, reflexology, aromatherapy, and more. Experience authentic pijat tradisional from verified professionals. Available for home visits and spa locations across Indonesia.`
                                    : `Pesan ${therapist.name} dan temukan layanan pijat profesional di ${therapist.location || 'Indonesia'}. IndaStreet Massage menghubungkan Anda dengan terapis bersertifikat yang menawarkan pijat tradisional Indonesia, refleksi, aromaterapi, dan lainnya. Rasakan pijat tradisional autentik dari profesional terverifikasi. Tersedia untuk kunjungan rumah dan lokasi spa di seluruh Indonesia.`
                                }
                            </p>
                        </div>

                        {/* Bottom Brand Line */}
                        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                            <p>
                                © 2026 IndaStreet Massage • 
                                {language === 'en' 
                                    ? ' Professional Massage Booking Platform in Indonesia'
                                    : ' Platform Booking Pijat Profesional di Indonesia'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistProfileBase;
