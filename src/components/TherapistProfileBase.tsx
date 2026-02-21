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
import IndastreetAchievements from './IndastreetAchievements';
import TherapistServiceShowcase from './shared/TherapistServiceShowcase';
import { therapistOffersService, SERVICE_TYPES } from '../constants/serviceTypes';
import type { Therapist, UserLocation } from '../types';
import { useTherapistDisplayImage } from '../utils/therapistImageUtils';
import { getTherapistDisplayName } from '../utils/therapistCardHelpers';
import { HERO_WELCOME_TEXT } from '../config/heroImages';

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
    /** Total times this profile was shared (shared profile page only; shown over main image) */
    shareCount?: number;
    
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
    shareCount,
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

    const providerDisplayImage = useTherapistDisplayImage(therapist);

    // Hero image = Indastreet logo on shared/profile view (from Top 5 or shared link)
    const heroImage = mode === 'shared'
        ? 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258'
        : '';
    const welcomeText = HERO_WELCOME_TEXT[language] || HERO_WELCOME_TEXT.id;
    
    // Ensure location is a string; display in capital letters
    const locationStr = typeof therapist.location === 'string' 
        ? therapist.location 
        : (therapist.location?.name || therapist.location?.city || 'a');
    const city = locationStr.split(' ')[0];
    const cityUpper = city ? city.toUpperCase() : city;
    const heroImageAlt = `Professional massage therapy in ${cityUpper} - ${getTherapistDisplayName(therapist.name).toUpperCase()} - Terapis pijat panggilan ${cityUpper}`;
    
    // Replace {city} placeholder with location in capital letters
    const heroTitle = welcomeText.title.replace('{city}', cityUpper);
    const heroSubtitle = welcomeText.subtitle.replace(/{city}/g, cityUpper);

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
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase">
                                {heroTitle}
                            </h1>
                            <p className="text-base md:text-lg text-gray-700 uppercase">
                                {heroSubtitle}
                            </p>
                            <p className="text-lg font-semibold text-gray-800 uppercase">
                                {getTherapistDisplayName(therapist.name)}
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
                    isSharedProfile={mode === 'shared'}
                    selectedCity={selectedCity}
                    customVerifiedBadge={customVerifiedBadge}
                    shareCount={mode === 'shared' ? shareCount : undefined}
                />

                {/* Beautician treatments are shown inside TherapistCard (replacing Swedish massage + 3 price containers) */}

                {/* Professional Massage Services / Facial body guide - Hidden for beauticians (replaced by Color & Design Chart in card) */}
                {!therapistOffersService(therapist, SERVICE_TYPES.BEAUTICIAN) && (
                    <TherapistServiceShowcase
                        therapist={therapist}
                        variant={((therapist as any).businessType === 'facial_clinic' || (therapist as any).businessType === 'facial_place' || (therapist as any).portalType === 'facial_clinic' || (therapist as any).portalType === 'facial_place') ? 'facial' : 'massage'}
                    />
                )}

                {/* Facial-specific attributes (when therapist offers facial and has data) */}
                {(() => {
                    const t = therapist as any;
                    const toList = (v: string | string[] | undefined): string[] => {
                        if (!v) return [];
                        if (Array.isArray(v)) return v.filter(Boolean);
                        if (typeof v === 'string') {
                            try {
                                const parsed = JSON.parse(v);
                                return Array.isArray(parsed) ? parsed.filter(Boolean) : [v];
                            } catch { return v.trim() ? [v] : []; }
                        }
                        return [];
                    };
                    const certs = toList(t.facialCertifications);
                    const products = toList(t.facialProductsUsed);
                    const equipment = toList(t.facialEquipment);
                    const specialties = toList(t.facialSpecialties);
                    const hasAny = certs.length > 0 || products.length > 0 || equipment.length > 0 || specialties.length > 0;
                    if (!hasAny) return null;
                    const Section = ({ title, items }: { title: string; items: string[] }) =>
                        items.length > 0 ? (
                            <div className="mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">{title}</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {items.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-800 rounded-full text-xs">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null;
                    return (
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                            <h3 className="text-base font-bold text-gray-900 mb-3">
                                {language === 'id' ? 'Detail Facial' : 'Facial details'}
                            </h3>
                            <Section title={language === 'id' ? 'Sertifikasi' : 'Certifications'} items={certs} />
                            <Section title={language === 'id' ? 'Produk yang digunakan' : 'Products used'} items={products} />
                            <Section title={language === 'id' ? 'Peralatan' : 'Equipment'} items={equipment} />
                            <Section title={language === 'id' ? 'Spesialisasi facial' : 'Facial specialties'} items={specialties} />
                        </div>
                    );
                })()}

                {/* Indastreet Achievements - Professional Standards Display */}
                <IndastreetAchievements 
                    therapistId={(therapist as any).id || (therapist as any).$id}
                    therapistName={getTherapistDisplayName(therapist.name)}
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
                        providerImage={providerDisplayImage}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>

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



