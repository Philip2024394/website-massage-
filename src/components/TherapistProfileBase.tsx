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

import React, { Suspense } from 'react';
import { TrendingUp } from 'lucide-react';
import TherapistCard from './TherapistCard';
import RotatingReviews from './RotatingReviews';
import SocialMediaLinks from './SocialMediaLinks';
import ShareActions from '../features/shared-profiles/ShareActions';
import IndastreetAchievements from './IndastreetAchievements';
import TherapistServiceShowcase from './shared/TherapistServiceShowcase';
import type { Therapist, UserLocation } from '../types';
import { getHeroImageForTherapist, HERO_WELCOME_TEXT } from '../config/heroImages';

// SEO Hashtag Generator for different business types
const generateSEOHashtags = (therapist: Therapist, city: string) => {
  // Safety check: ensure city is a string
  const cityStr = typeof city === 'string' ? city : (city?.name || city?.city || 'all');
  const cityLower = cityStr.toLowerCase();
  const businessName = therapist.name.toLowerCase().replace(/\s+/g, '');
  
  // Determine business type from therapist data
  const businessType = (therapist as any).businessType || (therapist as any).portalType || 'massage_therapist';
  const isPlace = (therapist as any).providerType === 'place';
  
  const baseHashtags = {
    massage_therapist: [
      `#pijatpanggilan${cityLower}`,
      `#terapispijat${cityLower}`,
      `#massage${cityLower}`,
      '#homeservicemassage',
      '#pijatrumahan',
      '#pijatwanita',
      '#pijattradisional',
      '#terappijatprofesional',
      '#massagetherapy',
      '#relaxation',
      '#wellness',
      '#indonesiamassage'
    ],
    massage_place: [
      `#spapijat${cityLower}`,
      `#massagespa${cityLower}`,
      `#pijat${cityLower}`,
      '#spamassage',
      '#wellnesscenter',
      '#massagecenter',
      '#sparelaxation',
      '#traditionalmassage',
      '#hotstone',
      '#aromatherapy',
      '#deeptissue',
      '#swedishmassage'
    ],
    facial_place: [
      `#facial${cityLower}`,
      `#skincare${cityLower}`,
      `#facialtreatment${cityLower}`,
      '#beauty',
      '#skinclinic',
      '#facialclinic',
      '#antiaging',
      '#glowing',
      '#facialwaxing',
      '#microdemrabrasion',
      '#chemicalpeel',
      '#acnetreatment'
    ],
    facial_clinic: [
      `#facialclinic${cityLower}`,
      `#skintreatment${cityLower}`,
      `#dermatology${cityLower}`,
      '#medicalskincare',
      '#cosmeticdermatology',
      '#lasertherapy',
      '#botox',
      '#fillers',
      '#skintightening',
      '#pigmentation',
      '#scartreatment',
      '#professionalfacial'
    ],
    hotel: [
      `#hotelspa${cityLower}`,
      `#luxurymassage${cityLower}`,
      `#resort${cityLower}`,
      '#hotelmassage',
      '#luxuryspa',
      '#resortmassage',
      '#vacationmassage',
      '#sparetreat',
      '#luxurywellness',
      '#premiumspa',
      '#hotelwellness',
      '#spaluxury'
    ],
    wellness_center: [
      `#wellness${cityLower}`,
      `#holistichealing${cityLower}`,
      `#wellnesscenter${cityLower}`,
      '#holisticmassage',
      '#wellnesstherapy',
      '#mindandbody',
      '#stressrelief',
      '#naturalhealing',
      '#therapeuticmassage',
      '#bodyhealing',
      '#wellnessretreat',
      '#healthylifestyle'
    ]
  };
  
  // Select appropriate hashtags based on business type
  let selectedHashtags = baseHashtags.massage_therapist; // default
  
  if (businessType === 'facial_clinic' || businessType === 'facial_place') {
    selectedHashtags = baseHashtags.facial_clinic;
  } else if (businessType === 'massage_spa' || (isPlace && businessType !== 'facial_clinic')) {
    selectedHashtags = baseHashtags.massage_place;
  } else if (businessType === 'hotel') {
    selectedHashtags = baseHashtags.hotel;
  } else if (businessType === 'wellness_center') {
    selectedHashtags = baseHashtags.wellness_center;
  }
  
  // Add business name hashtag
  selectedHashtags.push(`#${businessName}`);
  
  return selectedHashtags.join(' ');
};

interface TherapistProfileBaseProps {
    // REQUIRED: Must be resolved BEFORE mounting this component
    therapist: Therapist;
    
    // UI mode
    mode: 'authenticated' | 'shared';
    
    // Optional features
    userLocation?: UserLocation | null;
    showHeader?: boolean;
    showSEOFooter?: boolean;
    selectedCity?: string; // For location display override
    customVerifiedBadge?: string; // Custom verified badge image URL (for shared profile pages)
    
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
    customVerifiedBadge,
    userLocation,
    showHeader = false,
    showSEOFooter = false,
    selectedCity,
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

    // Hero image logic - only for shared mode
    // Main image = banner URL (same as home page). Use mainImage/profileImageUrl only, NOT profilePicture (avatar).
    const therapistHeroImageUrl = mode === 'shared' ? (
        ((therapist as any).mainImage && !(therapist as any).mainImage.startsWith('data:') ? (therapist as any).mainImage : null) ||
        ((therapist as any).profileImageUrl && !(therapist as any).profileImageUrl.startsWith('data:') ? (therapist as any).profileImageUrl : null) ||
        ((therapist as any).heroImageUrl && !(therapist as any).heroImageUrl.startsWith('data:') ? (therapist as any).heroImageUrl : null)
    ) : null;
    const fallbackHeroImage = getHeroImageForTherapist(therapist.$id, (therapist.location || "a" as string));
    const heroImageRaw = therapistHeroImageUrl || fallbackHeroImage;
    
    const resolvedHeroImage = typeof heroImageRaw === "string" 
        ? heroImageRaw 
        : heroImageRaw?.url 
        ? heroImageRaw.url 
        : Array.isArray(heroImageRaw) && heroImageRaw[0]?.url 
        ? heroImageRaw[0].url 
        : fallbackHeroImage;
    
    const heroImage = resolvedHeroImage;
    const welcomeText = HERO_WELCOME_TEXT[language] || HERO_WELCOME_TEXT.id;
    
    // SEO-optimized image alt text
    // Ensure location is a string - handle cases where it might be an object
    const locationStr = typeof therapist.location === 'string' 
        ? therapist.location 
        : (therapist.location?.name || therapist.location?.city || 'a');
    const city = locationStr.split(' ')[0];
    const heroImageAlt = `Professional massage therapy in ${city} - ${therapist.name} - Terapis pijat panggilan ${city}`;
    
    // Replace {city} placeholder with actual location
    const heroTitle = welcomeText.title.replace('{city}', city);
    const heroSubtitle = welcomeText.subtitle.replace(/{city}/g, city);

    return (
        <div className="bg-white">
            {/* Hero Banner - Only in shared mode */}
            {mode === 'shared' && (
                <div className="w-full bg-white pt-0 pb-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-2">
                            <img 
                                src={heroImage}
                                alt={heroImageAlt}
                                className="w-64 h-64 object-contain mx-auto"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </div>
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
                {/* Avoid lazy loading for critical shared route reliability */}
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
                    selectedCity={selectedCity}
                    customVerifiedBadge={customVerifiedBadge}
                />

                {/* Professional Massage Services - Unified across all modes */}
                <TherapistServiceShowcase therapist={therapist} />

                {/* Indastreet Achievements - Professional Standards Display */}
                <IndastreetAchievements 
                    therapistId={(therapist as any).id || (therapist as any).$id}
                    therapistName={therapist.name}
                    isVerified={(() => {
                        // Real verification logic: Bank details AND KTP required
                        const hasBankDetails = therapist.bankName && therapist.accountName && therapist.accountNumber;
                        const hasKtpUploaded = therapist.ktpPhotoUrl;
                        const isManuallyVerified = (therapist as any).isVerified || (therapist as any).verifiedBadge;
                        return Boolean(isManuallyVerified || (hasBankDetails && hasKtpUploaded));
                    })()}
                    safePassStatus={(therapist as any).hotelVillaSafePassStatus}
                    verifiedDate={(therapist as any).verifiedAt}
                    mode={mode}
                    onViewAll={undefined} // Remove manage button - no valid route for regular users
                    language={language}
                />

                {/* Rotating Reviews Section */}
                <div className="mt-8">
                    <RotatingReviews 
                        location={therapist.location || ("a" as string)} 
                        limit={5}
                        providerId={(therapist as any).id || (therapist as any).$id}
                        providerName={(therapist as any).name}
                        providerType={'therapist'}
                        providerImage={
                            ((therapist as any).mainImage && !(therapist as any).mainImage.startsWith('data:') ? (therapist as any).mainImage : null) ||
                            ((therapist as any).profileImageUrl && !(therapist as any).profileImageUrl.startsWith('data:') ? (therapist as any).profileImageUrl : null) ||
                            ((therapist as any).heroImageUrl && !(therapist as any).heroImageUrl.startsWith('data:') ? (therapist as any).heroImageUrl : null)
                        }
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>

                {/* Share Actions: Copy link + share buttons - Only in shared mode */}
                {mode === 'shared' && (
                    <div className="mt-6">
                        <ShareActions therapist={therapist} />
                    </div>
                )}

                {/* Therapist Profile Google Search Rankings - Only in authenticated mode */}
                {mode === 'authenticated' && (
                    <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-black mb-2 font-medium">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            {(() => {
                                const businessType = (therapist as any).businessType || (therapist as any).portalType || 'massage_therapist';
                                if (businessType === 'facial_clinic' || businessType === 'facial_place') {
                                    return 'Facial Clinic Is Ranking On Google Search For:';
                                } else if (businessType === 'massage_spa' || (therapist as any).providerType === 'place') {
                                    return 'Massage Spa Is Ranking On Google Search For:';
                                } else if (businessType === 'hotel') {
                                    return 'Hotel Spa Is Ranking On Google Search For:';
                                } else {
                                    return 'Therapist Profile Is Ranking On Google Search For:';
                                }
                            })()
                            }
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                            {generateSEOHashtags(therapist, city)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistProfileBase;



