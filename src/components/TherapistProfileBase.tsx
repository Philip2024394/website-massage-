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
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';

/** Same verified logic as massage city places: isVerified or activeMembershipDate at least 3 months ago. */
function isTherapistVerified(therapist: Therapist | Record<string, unknown>): boolean {
  const t = therapist as any;
  if (t?.isVerified === true || t?.verifiedBadge) return true;
  if (t?.activeMembershipDate) {
    const membershipDate = new Date(t.activeMembershipDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (membershipDate <= threeMonthsAgo) return true;
  }
  return false;
}

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
        <div className="min-h-screen bg-gray-50">
            {/* Hero – same theme as massage city place profile: full-width image, amber lines, verified badge, name + location */}
            {mode === 'shared' && (
                <section className="w-full max-w-full overflow-visible bg-gray-200 rounded-t-2xl">
                    <div className="relative w-full pt-2 bg-gray-200 rounded-t-2xl overflow-visible">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90 pointer-events-none rounded-t-2xl" />
                        <div className="relative w-full aspect-[21/9] min-h-[160px] max-h-[280px] overflow-visible">
                            <img
                                src={providerDisplayImage || 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258'}
                                alt={heroImageAlt}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                                loading="eager"
                                fetchPriority="high"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258';
                                }}
                            />
                            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500 pointer-events-none z-[1]" />
                            <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 z-[2] pointer-events-none">
                                <p className="text-white text-sm font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}>
                                    {(therapist as any).viewingNow ?? 3} {language === 'id' ? 'orang melihat sekarang' : 'people viewing now'}
                                </p>
                                <p className="text-white text-sm font-medium text-right" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}>
                                    {language === 'id' ? 'Terapis pijat panggilan' : 'Home service therapist'}
                                </p>
                            </div>
                            {isTherapistVerified(therapist) && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[2] flex flex-col items-center gap-1.5">
                                    <img src={VERIFIED_BADGE_IMAGE_URL} alt="Verified" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" />
                                    <span className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg bg-black/30 px-2 py-0.5 rounded">Verified</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 z-[2]">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                <div className="relative p-4 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{getTherapistDisplayName(therapist.name)}</h1>
                                    <p className="text-sm text-white/95 mt-0.5 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        <span>{locationStr || (therapist as any).city || 'Indonesia'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Legacy hero (logo + title) – only in authenticated mode when no shared hero */}
            {mode === 'authenticated' && (
                <div className="w-full bg-white pt-0 pb-6 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{heroTitle}</h1>
                            <p className="text-base text-gray-700">{heroSubtitle}</p>
                            <p className="text-lg font-semibold text-gray-800">{getTherapistDisplayName(therapist.name)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Therapist Card & content */}
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



