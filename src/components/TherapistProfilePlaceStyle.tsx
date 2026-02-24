/**
 * Therapist Profile – Place-style layout.
 * Matches Massage City Places profile UI: same hero, card style, tabs, sticky BOOK NOW – WhatsApp.
 * Plan logic: Free → admin WhatsApp; Middle/Premium → therapist WhatsApp. Section limits by plan.
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { Therapist } from '../types';
import TherapistCard from './TherapistCard';
import { useTherapistDisplayImage } from '../utils/therapistImageUtils';
import { getTherapistDisplayName, getLanguageFlag, parseTherapistLanguages, getCombinedMenuForDisplay } from '../utils/therapistCardHelpers';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';
import { getBookingWhatsAppNumber, buildBookNowMessage, getFirstMassageType, getDefaultDurationAndPrice } from '../utils/whatsappBookingMessages';
import { MessageCircle, Star, MapPin, LayoutGrid, Eye, ShieldCheck, Gift, Quote, X, Globe } from 'lucide-react';
import { APP_CONSTANTS } from '../constants/appConstants';
import AdditionalServiceCard, { type AdditionalService } from './AdditionalServiceCard';
import { getOtherServiceLabel } from '../constants/otherServicesOffered';
import SocialMediaLinks from './SocialMediaLinks';

// Design tokens – same as MassagePlaceProfilePage
const HERO_ASPECT = 'aspect-[21/9] min-h-[160px] max-h-[280px]';
const CARD_CLASS = 'rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden';
const SECTION_TITLE_CLASS = 'text-sm font-bold text-gray-900';
const STICKY_BTN_CLASS = 'w-full py-3 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2';

/** Profile images for "Services & Therapist Trending Now" (same as Massage City Places profile). */
const DEWI_SARI_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/therapist.png';
const PUTU_AYU_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/therapists.png';
const WAYAN_SINTA_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/therapistss.png';

function isDewiSari(name: string): boolean {
  const n = (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return n === 'dewi sari' || n === 'sari dewi' || n === 'sar dewi';
}
function isPutuAyu(name: string): boolean {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ') === 'putu ayu';
}
function isWayanSinta(name: string): boolean {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ') === 'wayan sinta';
}

/** Normalize city/location for comparison (locationId, city, location, or location_id). */
function getCityKey(t: any): string {
  const v = t?.locationId ?? t?.city ?? t?.location ?? t?.location_id ?? t?.locationArea ?? '';
  return String(v).trim().toLowerCase();
}

/** Shuffle array (Fisher–Yates) and return new array. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Random integer in [min, max] inclusive. New value on each call (e.g. on refresh). */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random "last booked" time in the past for hero. Stable per mount; display advances with clock. */
function getRandomLastBookedAt(): Date {
  const now = Date.now();
  const msMin = 60 * 1000;
  const msHour = 60 * msMin;
  const msDay = 24 * msHour;
  const choices = [
    () => now - randomInt(1, 60) * msMin,
    () => now - randomInt(1, 4) * msHour,
    () => now - msDay - randomInt(0, 23) * msHour,
    () => now - 2 * msDay - randomInt(0, 23) * msHour,
  ];
  const pick = choices[randomInt(0, choices.length - 1)]();
  return new Date(pick);
}

/** Format "last booked" relative to now: X min ago, X hours ago, yesterday, 1 day ago, 2 days ago. */
function formatLastBooked(bookedAt: Date, now: Date, isId: boolean): string {
  const diffMs = now.getTime() - bookedAt.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMin < 1) return isId ? 'Baru saja dipesan' : 'Just booked';
  if (diffMin < 60) return isId ? `Terakhir dipesan ${diffMin} menit lalu` : `Last booked ${diffMin} min ago`;
  if (diffHours < 24) return isId ? `Terakhir dipesan ${diffHours} jam lalu` : `Last booked ${diffHours} hours ago`;
  if (diffDays === 1) return isId ? 'Terakhir dipesan kemarin' : 'Last booked yesterday';
  if (diffDays === 2) return isId ? 'Terakhir dipesan 2 hari lalu' : 'Last booked 2 days ago';
  return isId ? `Terakhir dipesan ${diffDays} hari lalu` : `Last booked ${diffDays} days ago`;
}

export type TherapistPlan = 'free' | 'middle' | 'premium';

function getTherapistPlan(therapist: Therapist | Record<string, any>): TherapistPlan {
  const p = (therapist as any).plan ?? (therapist as any).membershipPlan ?? (therapist as any).membershipTier ?? '';
  const v = String(p).toLowerCase();
  if (v === 'premium' || v === 'elite' || v === 'pro') return 'premium';
  if (v === 'middle' || v === 'plus' || v === 'trusted') return 'middle';
  return 'free';
}

function getPlanLimits(plan: TherapistPlan) {
  switch (plan) {
    case 'premium':
      return { profileImages: 1, treatments: 15, gallery: 20, reviews: true, showAvailability: true, showVideoIntro: true };
    case 'middle':
      return { profileImages: 1, treatments: 8, gallery: 10, reviews: true, showAvailability: true, showVideoIntro: false };
    default:
      return { profileImages: 1, treatments: 4, gallery: 5, reviews: false, showAvailability: false, showVideoIntro: false };
  }
}

function isTherapistVerified(therapist: Therapist | Record<string, any>): boolean {
  const t = therapist as any;
  if (t?.isVerified === true || t?.verifiedBadge) return true;
  if (t?.activeMembershipDate) {
    const d = new Date(t.activeMembershipDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (d <= threeMonthsAgo) return true;
  }
  return false;
}

export interface TherapistProfilePlaceStyleProps {
  therapist: Therapist;
  language?: 'en' | 'id' | 'gb';
  userLocation?: { lat: number; lng: number } | null;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  prefetchedMenu?: any;
  /** All therapists (e.g. from home). Used to show random same-city therapists in "Services & Therapist Trending Now". */
  therapists?: any[];
  /** When true, viewer is the logged-in therapist (profile owner). Used to show owner-only messages e.g. upgrade hint. */
  isProfileOwner?: boolean;
  /** Navigate to another therapist's profile (updates URL and calls onNavigate). */
  onNavigateToTherapist?: (therapist: any) => void;
}

export default function TherapistProfilePlaceStyle({
  therapist,
  language = 'id',
  userLocation,
  onBack,
  onNavigate,
  prefetchedMenu,
  therapists: allTherapists = [],
  isProfileOwner = false,
  onNavigateToTherapist,
}: TherapistProfilePlaceStyleProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<{ name: string; duration: number; price: number } | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  /** Selected certification/license image URL for lightbox (same system as massage city places). */
  const [selectedCertImage, setSelectedCertImage] = useState<string | null>(null);

  /** People viewing now: random 1–80 on each mount/refresh. */
  const [viewingNow] = useState(() => (therapist as any).viewingNow ?? randomInt(1, 80));
  /** Last booked at a random past time; display advances with clock (tick every minute). */
  const [lastBookedAt] = useState(() => {
    if ((therapist as any).lastBookedMinutesAgo != null) {
      const d = new Date();
      d.setMinutes(d.getMinutes() - Number((therapist as any).lastBookedMinutesAgo));
      return d;
    }
    return getRandomLastBookedAt();
  });
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const displayImage = useTherapistDisplayImage(therapist);
  const plan = getTherapistPlan(therapist);
  const limits = useMemo(() => getPlanLimits(plan), [plan]);
  const verified = isTherapistVerified(therapist);
  const isId = language === 'id';

  const locationStr = typeof therapist.location === 'string'
    ? therapist.location
    : (therapist.location as any)?.name ?? (therapist.location as any)?.city ?? 'Indonesia';
  const rating = getDisplayRating(therapist.rating, therapist.reviewCount) || 4.5;
  const ratingStr = formatRating(rating);
  const statusStr = String((therapist as any).display_status ?? (therapist as any).availability ?? therapist.status ?? 'Available');
  const isAvailable = statusStr === 'Available';

  const combinedMenu = getCombinedMenuForDisplay(prefetchedMenu, therapist);
  const treatmentList = useMemo(() => {
    const items = combinedMenu
      .map((m: any) => {
        const price60 = Number(m?.price60);
        const price90 = Number(m?.price90);
        const price120 = Number(m?.price120);
        const hasMenuPrice = price60 > 0 || price90 > 0 || price120 > 0;

        // Menu helper prices are stored in thousands; convert to full IDR.
        const dur = hasMenuPrice
          ? (price60 > 0 ? 60 : price90 > 0 ? 90 : 120)
          : Number(m?.durationMinutes ?? m?.duration ?? 60);
        const menuPrice = dur === 60 ? price60 : dur === 90 ? price90 : price120;
        const price = hasMenuPrice
          ? Math.round((menuPrice > 0 ? menuPrice : 0) * 1000)
          : Number(m?.totalPrice ?? m?.price ?? 0);
        const name = m.name ?? m.serviceName ?? m.title ?? 'Massage';
        return { name, duration: dur, price, id: m.$id ?? m.id ?? name };
      })
      .filter((t: any) => t.price > 0);
    return items.slice(0, limits.treatments);
  }, [combinedMenu, limits.treatments]);

  const galleryImages = useMemo(() => {
    const raw = (therapist as any).galleryImages ?? (therapist as any).gallery ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.slice(0, limits.gallery).map((item: any) => ({
      url: item.imageUrl ?? item.url ?? item,
      caption: item.caption ?? item.title ?? '',
    }));
  }, [therapist, limits.gallery]);

  /** Up to 5 certification/license/achievement image URLs for Safety & Comfort. */
  const certificationImages = useMemo(() => {
    const raw = (therapist as any).certificationImages ?? (therapist as any).licenseImages ?? (therapist as any).achievementImages ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.slice(0, 5).map((item: any) => (typeof item === 'string' ? item : item?.url ?? item?.imageUrl ?? '')).filter(Boolean) as string[];
  }, [therapist]);

  /** Random therapists from same city for "Services & Therapist Trending Now" – new random set each mount/refresh. */
  const sameCityDisplay = useMemo(() => {
    if (!Array.isArray(allTherapists) || allTherapists.length === 0) {
      return { list: [] as any[], showViewProfile: false };
    }
    const currentId = String(therapist.$id ?? therapist.id ?? '');
    const cityKey = getCityKey(therapist);
    if (!cityKey) return { list: [], showViewProfile: false };
    const sameCity = allTherapists.filter((t: any) => {
      const id = String(t.$id ?? t.id ?? '');
      if (id === currentId) return false;
      return getCityKey(t) === cityKey;
    });
    const shuffled = shuffle(sameCity);
    return { list: shuffled.slice(0, 3), showViewProfile: true };
  }, [allTherapists, therapist]);

  /** Default testimonials for Safety & Comfort section (same as Massage City Places). */
  const SAFETY_COMFORT_TESTIMONIALS = useMemo(() => [
    { id: '1', customerName: 'Michael R.', rating: 5, text: "The couple massage was amazing! Highly recommend for a romantic treat.", date: '1 week ago', treatment: "Couple's Traditional" },
    { id: '2', customerName: 'Sarah M.', rating: 5, text: 'Best massage experience in Bali! The therapists are incredibly skilled and the ambiance is perfect.', date: '2 weeks ago', treatment: '90 min Traditional' },
    { id: '3', customerName: 'John D.', rating: 5, text: 'Professional service from start to finish. Will definitely come back!', date: '1 month ago', treatment: '120 min Deep Tissue' },
  ], []);
  useEffect(() => {
    const interval = setInterval(() => setTestimonialIndex((prev) => (prev + 1) % SAFETY_COMFORT_TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, [SAFETY_COMFORT_TESTIMONIALS.length]);

  const adminDigits = APP_CONSTANTS.DEFAULT_CONTACT_NUMBER?.replace(/\D/g, '') || '6281392000050';
  const bookingNumber = getBookingWhatsAppNumber(
    {
      country: (therapist as any).country ?? 'ID',
      whatsappNumber: (therapist as any).whatsappNumber ?? (therapist as any).contactNumber,
      membershipTier: plan === 'free' ? '' : plan === 'premium' ? 'premium' : 'plus',
      plan: plan,
    },
    adminDigits
  );
  const bookingNumberDigits = bookingNumber.replace(/\D/g, '').replace(/^0/, '62');

  const buildBookNowMessageText = () => {
    const treatment = selectedTreatment ?? (treatmentList[0] ? {
      name: treatmentList[0].name,
      duration: treatmentList[0].duration,
      price: treatmentList[0].price,
    } : null) ?? { name: getFirstMassageType(therapist), duration: 60, price: 200000 };
    const def = getDefaultDurationAndPrice(therapist);
    const duration = treatment.duration || def.durationMin;
    const price = treatment.price || def.price;
    return buildBookNowMessage({
      therapistName: getTherapistDisplayName(therapist.name),
      therapistId: String(therapist.$id ?? therapist.id),
      massageType: treatment.name,
      durationMin: duration,
      price,
    }) + `\nMy Location:\nPreferred Time:`;
  };

  const handleBookNow = () => {
    const text = buildBookNowMessageText();
    const url = `https://wa.me/${bookingNumberDigits}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
      {/* Hero – same as Massage City Places profile */}
      <section className="w-full max-w-full overflow-visible bg-gray-200 rounded-t-2xl">
        <div className="relative w-full pt-2 bg-gray-200 rounded-t-2xl overflow-visible">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90 pointer-events-none rounded-t-2xl" />
          <div className={`relative w-full ${HERO_ASPECT} overflow-visible`}>
            <img
              src={displayImage || (therapist.mainImage ?? therapist.profilePicture) || 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png'}
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png';
              }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500 pointer-events-none z-[1]" />
            <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 z-[2] pointer-events-none">
              <p className="text-white text-sm font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)' }}>
                {viewingNow} {isId ? 'orang melihat sekarang' : 'people viewing now'}
              </p>
              <p className="text-white text-sm font-medium text-right" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)' }}>
                {formatLastBooked(lastBookedAt, new Date(), isId)}
              </p>
            </div>
            {verified && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[2] flex flex-col items-center gap-1.5">
                <img src={VERIFIED_BADGE_IMAGE_URL} alt="Verified" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" />
                <span className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg bg-black/30 px-2 py-0.5 rounded">{isId ? 'Terverifikasi' : 'Verified'}</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 z-[2]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="relative p-4 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                  {getTherapistDisplayName(therapist.name)}
                  {verified && (
                    <img src={VERIFIED_BADGE_IMAGE_URL} alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-md" aria-hidden />
                  )}
                </h1>
                <p className="text-sm text-white/95 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{locationStr}</span>
                </p>
                {verified && (
                  <p className="text-xs text-amber-200 font-medium mt-1 flex items-center gap-1.5">
                    <img src={VERIFIED_BADGE_IMAGE_URL} alt="" className="w-4 h-4 object-contain" aria-hidden />
                    {isId ? 'Terverifikasi' : 'Verified'}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold">{ratingStr}</span>
                  </div>
                  {(therapist as any).yearsOfExperience != null && (
                    <span className="text-xs text-white/90">{therapist.yearsOfExperience} {isId ? 'tahun pengalaman' : 'years experience'}</span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-500/80 text-white' : 'bg-orange-500/80 text-white'}`}>
                    {isAvailable ? (isId ? 'Tersedia' : 'Available') : (isId ? 'Sibuk' : 'Busy')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content – same padding and card style as place profile (no tab bar) */}
      <main className="w-full max-w-full mx-auto px-4 py-6 pb-24">
        <style>{`
          @keyframes therapist-subtitle-slide-in {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .therapist-subtitle-slide-in {
            animation: therapist-subtitle-slide-in 0.6s ease-out 0.25s both;
          }
          @keyframes online-dot-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
          }
          .online-dot-flash {
            animation: online-dot-pulse 1.2s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-full space-y-4">
          <div className="mb-3 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Welcome to {getTherapistDisplayName(therapist.name)}</h3>
            <p className="text-sm text-gray-600 therapist-subtitle-slide-in">
              {isId ? 'Silakan hubungi untuk layanan yang belum tercantum' : 'Please Reach Out For Services Not Listed'}
            </p>
          </div>

          <div className="mb-4">
            <TherapistCard
              therapist={therapist}
              userLocation={userLocation}
              onRate={() => {}}
              onBook={() => {}}
              onIncrementAnalytics={() => {}}
              onNavigate={(page) => onNavigate?.(page)}
              isCustomerLoggedIn={false}
              t={{}}
            />
          </div>

          {/* Services & Therapist Trending Now – free: show 3 therapists; paid: section hidden (therapist can remove by upgrading) */}
          {(() => {
            const isPaidPlan = plan !== 'free';
            const mockImage = 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1766551253328';
            const defaultTherapists = [
              { id: 'dewi-sari', name: 'Dewi Sari', photo: DEWI_SARI_PROFILE_IMAGE, specialty: 'Traditional & Wellness', yearsExperience: 6, rating: 4.9 },
              { id: 'putu-ayu', name: 'Putu Ayu', photo: PUTU_AYU_PROFILE_IMAGE, specialty: 'Deep Tissue & Relaxation', yearsExperience: 4, rating: 4.8 },
              { id: 'wayan-sinta', name: 'Wayan Sinta', photo: WAYAN_SINTA_PROFILE_IMAGE, specialty: 'Aromatherapy & Hot Stone', yearsExperience: 5, rating: 4.9 },
            ];
            const hasSameCity = sameCityDisplay.list.length > 0 && typeof onNavigateToTherapist === 'function';
            const displayTherapists = hasSameCity
              ? sameCityDisplay.list
              : defaultTherapists;
            const defaultServices: AdditionalService[] = [
              { id: 'mock-hair', name: 'Hair Salon', description: 'Professional haircut, styling and treatments at our in-house salon. Our stylists are trained in the latest trends and use quality products.', imageUrl: mockImage, details: [{ label: 'Haircut & styling', price: 'IDR 150K', duration: '45 min' }], bookLabel: 'Book' as const },
              { id: 'mock-beauty', name: 'Beautician', description: 'Nails, lashes and skin treatments. Manicure, pedicure, lash extensions and facials available by appointment.', imageUrl: mockImage, details: [{ label: 'Manicure & pedicure', price: 'IDR 200K', duration: '60 min' }], bookLabel: 'Schedule' as const },
              { id: 'mock-spa', name: 'Spa & Wellness', description: 'Body scrubs, wraps and aromatherapy. Relax and recharge with our signature treatments in a calm environment.', imageUrl: mockImage, details: [{ label: 'Body scrub & wrap', price: 'IDR 350K', duration: '90 min' }], bookLabel: 'Book' as const },
            ];
            const placeName = getTherapistDisplayName(therapist.name);
            const placeWhatsApp = (therapist as any).whatsappNumber ?? (therapist as any).contactNumber;
            const defaultAvatar = 'https://ik.imagekit.io/7grri5v7d/default-avatar.png';
            return (
              <div className="mt-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <LayoutGrid className="w-3.5 h-3.5 text-orange-500" aria-hidden />
                    <h3 className="text-lg font-bold text-gray-900">
                      {isId ? 'Terapis Tren Saat Ini' : 'Therapist Trending Now'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isId ? 'Kenali terapis dan layanan mereka' : 'Meet therapists and explore their services'}
                  </p>
                </div>

                {/* Free: show therapist carousel; Paid: hide it (therapist chose to remove by upgrading) */}
                {!isPaidPlan && (
                <div className="mb-6">
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                    {displayTherapists.map((t: any, index: number) => {
                      const isRealTherapist = hasSameCity;
                      const displayPhoto = isRealTherapist
                        ? (t.profilePicture ?? t.profileImage ?? t.mainImage ?? defaultAvatar)
                        : isDewiSari(t.name)
                          ? DEWI_SARI_PROFILE_IMAGE
                          : isPutuAyu(t.name)
                            ? PUTU_AYU_PROFILE_IMAGE
                            : isWayanSinta(t.name)
                              ? WAYAN_SINTA_PROFILE_IMAGE
                              : (t.photo || defaultAvatar);
                      const name = isRealTherapist ? (t.name || 'Therapist') : t.name;
                      const specialty = isRealTherapist
                        ? (Array.isArray(t.massageTypes) ? t.massageTypes.slice(0, 2).join(', ') : t.massageTypes || t.specialty || 'Massage')
                        : t.specialty;
                      const yearsExperience = isRealTherapist ? (t.yearsOfExperience ?? t.yearsExperience ?? 0) : t.yearsExperience;
                      const rating = isRealTherapist ? (t.rating ?? 4.5) : t.rating;
                      const key = isRealTherapist ? (t.$id ?? t.id ?? `t-${index}`) : t.id;
                      const isOnline = isRealTherapist
                        ? (t.isOnline ?? t.availability === 'Available' ?? (t as any).status === 'Available' ?? false)
                        : true;
                      return (
                        <div
                          key={key}
                          className="flex-shrink-0 w-32 snap-start rounded-xl border-2 bg-orange-50/60 border-orange-300 p-4 text-center flex flex-col"
                        >
                          <div className="relative w-16 h-16 mx-auto mb-2 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-amber-200 bg-white">
                              <img
                                src={displayPhoto}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                              />
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 flex-shrink-0 rounded-full border-2 border-white ${isOnline ? 'bg-green-500 online-dot-flash' : 'bg-gray-400'}`}
                              style={{ width: 12, height: 12, minWidth: 12, minHeight: 12 }}
                              title={isOnline ? (isId ? 'Online' : 'Online') : (isId ? 'Offline' : 'Offline')}
                              aria-hidden
                            />
                          </div>
                          <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                          <p className="text-[10px] text-gray-600 truncate leading-tight min-h-[20px]">{specialty}</p>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-semibold text-gray-800">{rating ?? '—'}</span>
                            <span className="text-[10px] text-gray-500">• {yearsExperience}y</span>
                          </div>
                          {hasSameCity && onNavigateToTherapist && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToTherapist(t);
                              }}
                              className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors inline-flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                              {isId ? 'Lihat' : 'View'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {isProfileOwner && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    {isId ? 'Tidak ingin menampilkan saran terapis di profil? Naikkan ke paket berbayar dan 3 tampilan terapis ini akan hilang.' : 'If you don’t want therapist suggestions on your profile, upgrade to a paid plan and these 3 therapist displays will disappear.'}
                  </p>
                  )}
                </div>
                )}

                {/* Other Services Available – therapist's selected services from dashboard (same card style as Massage City Places) */}
                {(() => {
                  const raw = (therapist as any).otherServicesOffered;
                  let list: string[] = [];
                  if (Array.isArray(raw)) list = raw.filter((x: unknown) => typeof x === 'string');
                  else if (typeof raw === 'string' && raw) {
                    try {
                      const parsed = JSON.parse(raw);
                      if (Array.isArray(parsed)) list = parsed.filter((x: unknown) => typeof x === 'string');
                    } catch (_) {}
                  }
                  if (list.length === 0) return null;
                  return (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">
                        {isId ? 'Layanan Lain yang Tersedia' : 'Other Services Available'}
                      </h3>
                      <div className="space-y-2">
                        {list.map((id) => (
                          <div
                            key={id}
                            className="w-full text-left rounded-xl border-2 border-orange-200 bg-orange-50/80 p-4"
                          >
                            <p className="text-sm font-semibold text-gray-900">{getOtherServiceLabel(id, isId ? 'id' : 'en')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Additional services – same dropdown cards as city places */}
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {getTherapistDisplayName(therapist.name)} {isId ? 'Layanan Lain' : 'Other Services'}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {isId ? 'Pilih panah dropdown untuk melihat' : 'Select the drop down arrow to view'}
                </p>
                <div className="space-y-3">
                  {defaultServices.map((svc) => (
                    <AdditionalServiceCard
                      key={svc.id}
                      service={svc}
                      placeName={placeName}
                      placeWhatsApp={placeWhatsApp}
                      userCountryCode={isId ? 'ID' : undefined}
                    />
                  ))}
                </div>

                {/* Safety & Comfort + Customer Reviews + Gift This Therapist */}
                <section className="mt-6 rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90 rounded-t-2xl" aria-hidden />
                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="p-4 rounded-xl border-2 bg-orange-50/80 border-orange-400">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                        <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden />
                        {isId ? 'Keamanan & Kenyamanan' : 'Safety & Comfort'}
                      </h4>
                      <ul className="space-y-2">
                        {[
                          isId ? 'Terverifikasi aman masuk hotel, rumah & villa' : 'Verified safe to enter hotel, home & villa',
                          isId ? 'Berperilaku profesional & standar layanan' : 'Professional conduct & service standards',
                          ...((therapist as any).hotelVillaSafePassStatus === 'active'
                            ? [isId ? 'Sertifikasi Hotel & Villa Safe Pass' : 'Hotel & Villa Safe Pass certified']
                            : []),
                          isId ? 'Berlisensi & terdaftar' : 'Licensed & registered',
                          isId ? 'Bersertifikat kebersihan' : 'Hygiene certified',
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                            <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {/* Certification Achieved – up to 5 thumbnails; click opens same lightbox/blur as massage city places */}
                      <h5 className="text-xs font-bold text-gray-900 mt-4 mb-2">
                        {isId ? 'Sertifikasi yang Dicapai' : 'Certification Achieved'}
                      </h5>
                      {certificationImages.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {certificationImages.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedCertImage(url)}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-amber-200 bg-gray-100 flex-shrink-0 focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">{isId ? 'Belum ada sertifikat diunggah.' : 'No certifications uploaded yet.'}</p>
                      )}
                    </div>
                    <div className="p-4 rounded-xl border-2 bg-orange-50/80 border-orange-400">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                        <Quote className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden />
                        {isId ? 'Testimoni Pelanggan' : 'Customer Reviews'}
                      </h4>
                      <div className="relative min-h-[88px]">
                        {SAFETY_COMFORT_TESTIMONIALS.map((testimonial, i) => (
                          <div
                            key={testimonial.id}
                            className={`transition-opacity duration-300 ${i === testimonialIndex ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none invisible'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold text-sm">
                                {testimonial.customerName.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="text-xs font-bold text-gray-900">{testimonial.customerName}</span>
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${star <= testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                  {[testimonial.treatment, testimonial.date].filter(Boolean).join(' • ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-1.5 mt-3">
                        {SAFETY_COMFORT_TESTIMONIALS.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTestimonialIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === testimonialIndex ? 'bg-amber-500 w-5' : 'bg-amber-200 w-2'}`}
                            aria-label={isId ? `Testimoni ${i + 1}` : `Review ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('gift-voucher')}
                      className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-[0.98] transition-all border-2 border-amber-600 shadow-md"
                    >
                      <Gift className="w-5 h-5" />
                      {isId ? 'Hadiahkan ke Terapis' : 'Gift This Therapist'}
                    </button>
                  </div>
                </section>
              </div>
            );
          })()}

          {/* Reviews */}
          {limits.reviews && (
            <div className={CARD_CLASS}>
              <div className="p-4">
                <h3 className={SECTION_TITLE_CLASS}>{isId ? 'Ulasan' : 'Reviews'}</h3>
                <p className="text-sm text-gray-500 mt-1">{isId ? 'Lihat ulasan di WhatsApp atau hubungi untuk referensi.' : 'See reviews on WhatsApp or contact for references.'}</p>
                {therapist.reviewCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-gray-800">{ratingStr}</span>
                    <span className="text-xs text-gray-500">({therapist.reviewCount} {isId ? 'ulasan' : 'reviews'})</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* IndaStreet Social – text link, icon and social media images at end of profile */}
      <div className="w-full max-w-full mx-auto px-4 pb-8 pt-4 border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('indonesia')}
            className="inline-flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <Globe className="w-6 h-6 text-amber-500" aria-hidden />
            <span className="font-medium text-sm">IndaStreet Social</span>
            <span className="text-xs text-gray-500">{isId ? 'Menghubungkan komunitas wellness' : 'Connecting wellness communities across the globe'}</span>
          </button>
          <SocialMediaLinks className="mt-2" />
        </div>
      </div>

      {/* Certification / license image lightbox – same system and blur as massage city places thumbnail window */}
      {selectedCertImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          onClick={() => setSelectedCertImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={isId ? 'Tampilan sertifikat' : 'Certification view'}
        >
          <button
            type="button"
            onClick={() => setSelectedCertImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full z-10"
            aria-label={isId ? 'Tutup' : 'Close'}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedCertImage}
              alt=""
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
