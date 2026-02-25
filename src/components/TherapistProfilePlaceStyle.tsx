/**
 * Therapist Profile – Place-style layout.
 * Matches Massage City Places profile UI: same hero, card style, tabs, sticky BOOK NOW – WhatsApp.
 * Plan logic: Free → admin WhatsApp; Middle/Premium → therapist WhatsApp. Section limits by plan.
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { Therapist } from '../types';
import TherapistCard from './TherapistCard';
import { useTherapistDisplayImage } from '../utils/therapistImageUtils';
import { getTherapistDisplayName, getLanguageFlag, parseTherapistLanguages, getCombinedMenuForDisplay, getCheapestServiceByTotalPrice } from '../utils/therapistCardHelpers';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';
import { getBookingWhatsAppNumber, buildBookNowMessage, getFirstMassageType, getDefaultDurationAndPrice } from '../utils/whatsappBookingMessages';
import { MessageCircle, Star, MapPin, LayoutGrid, Eye, ShieldCheck, Gift, Quote, X, Globe } from 'lucide-react';
import { APP_CONSTANTS } from '../constants/appConstants';
import AdditionalServiceCard, { type AdditionalService } from './AdditionalServiceCard';
import { getOtherServiceLabel, OTHER_SERVICES_DEFAULT_IMAGES } from '../constants/otherServicesOffered';
import { therapistOffersService, SERVICE_TYPES } from '../constants/serviceTypes';
import SocialMediaLinks from './SocialMediaLinks';
import GiftVoucherSlider from './GiftVoucherSlider';

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

/** True when therapist is available/online for booking (same logic as carousel dot). */
function isTherapistAvailable(t: any): boolean {
  const statusStr = String(t?.status ?? '').toLowerCase();
  const availStr = String(t?.availability ?? '').toLowerCase();
  return (
    t?.isOnline === true ||
    statusStr === 'online' ||
    statusStr === 'available' ||
    availStr === 'available' ||
    t?.availability === 'Available'
  );
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

/** Start of day in local timezone (for calendar-day comparison). */
function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Format "last booked" relative to device now: correct time distance; "yesterday" only when booked on previous calendar day (after midnight). */
function formatLastBooked(bookedAt: Date, now: Date, isId: boolean): string {
  const diffMs = now.getTime() - bookedAt.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

  const todayStart = startOfDay(now);
  const bookedDayStart = startOfDay(bookedAt);
  const diffCalendarDays = Math.round((todayStart.getTime() - bookedDayStart.getTime()) / (24 * 60 * 60 * 1000));

  if (diffMin < 1) return isId ? 'Baru saja dipesan' : 'Just booked';
  if (diffMin < 60) return isId ? `Terakhir dipesan ${diffMin} menit lalu` : `Last booked ${diffMin} min ago`;
  if (diffCalendarDays === 0) return isId ? `Terakhir dipesan ${diffHours} jam lalu` : `Last booked ${diffHours} hours ago`;
  if (diffCalendarDays === 1) return isId ? 'Terakhir dipesan kemarin' : 'Last booked yesterday';
  if (diffCalendarDays === 2) return isId ? 'Terakhir dipesan 2 hari lalu' : 'Last booked 2 days ago';
  return isId ? `Terakhir dipesan ${diffCalendarDays} hari lalu` : `Last booked ${diffCalendarDays} days ago`;
}

export type TherapistPlan = 'free' | 'middle' | 'premium';

/** Plan is only "paid" when explicitly set by admin (e.g. after payment confirmation). Empty/missing = free → show 3 trending therapists. */
function getTherapistPlan(therapist: Therapist | Record<string, any>): TherapistPlan {
  const p = (therapist as any).plan ?? (therapist as any).membershipPlan ?? (therapist as any).membershipTier ?? '';
  const v = String(p).trim().toLowerCase();
  if (!v) return 'free';
  if (v === 'premium' || v === 'elite' || v === 'pro') return 'premium';
  if (v === 'middle' || v === 'plus' || v === 'standard' || v === 'trusted') return 'middle';
  return 'free';
}

function getPlanLimits(plan: TherapistPlan) {
  switch (plan) {
    case 'premium':
      return { profileImages: 1, treatments: 15, gallery: 20, reviews: true, showAvailability: true, showVideoIntro: true, maxColorCharts: 15 };
    case 'middle':
      return { profileImages: 1, treatments: 8, gallery: 10, reviews: true, showAvailability: true, showVideoIntro: false, maxColorCharts: 10 };
    default:
      return { profileImages: 1, treatments: 4, gallery: 5, reviews: false, showAvailability: false, showVideoIntro: false, maxColorCharts: 3 };
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
  /** When true, show skeleton (hero + card + pricing shape) while profile data loads. */
  isLoading?: boolean;
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
  isLoading = false,
}: TherapistProfilePlaceStyleProps) {
  const isIncompleteProfile = !therapist?.name?.trim?.() && !isLoading;
  const [selectedTreatment, setSelectedTreatment] = useState<{ name: string; duration: number; price: number } | null>(null);
  /** Selected price container (60/90/120) so sticky Book Now sends correct duration/price/service to admin */
  const [selectedPriceKey, setSelectedPriceKey] = useState<'60' | '90' | '120' | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showGiftVoucherSlider, setShowGiftVoucherSlider] = useState(false);

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
  const nameNormHero = (therapist?.name ?? '').trim().toLowerCase();
  const isWiwidProfile = nameNormHero === 'wiwid' || nameNormHero.startsWith('wiwid ');
  const isSurtiningsihProfile = nameNormHero === 'surtiningsih' || nameNormHero.startsWith('surtiningsih ');
  /** When true, show verified badge in hero (right side) with "Verified"/"Terverifikasi" text. Any profile with verified badge shows here. */
  const showVerifiedOnHero = verified || isWiwidProfile || isSurtiningsihProfile;
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

  /** Gift voucher data for GiftVoucherSlider – same shape as MassagePlaceProfilePage */
  const giftVoucherData = useMemo(() => {
    const treatments = treatmentList.map((t) => ({
      id: String(t.id),
      name: t.name,
      duration: t.duration,
      price: t.price,
      priceLabel: `IDR ${(t.price / 1000).toFixed(0)}K`,
    }));
    const raw = (therapist as any).otherServicesOffered;
    let list: string[] = [];
    if (Array.isArray(raw)) list = raw.filter((x: unknown) => typeof x === 'string');
    else if (typeof raw === 'string' && raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed.filter((x: unknown) => typeof x === 'string');
      } catch (_) {}
    }
    const additionalServices = list.map((id) => ({
      id,
      name: getOtherServiceLabel(id, isId ? 'id' : 'en'),
      details: [] as { label?: string; price?: string }[],
    }));
    return { treatments, additionalServices };
  }, [treatmentList, therapist, isId]);

  const galleryImages = useMemo(() => {
    const raw = (therapist as any).galleryImages ?? (therapist as any).gallery ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.slice(0, limits.gallery).map((item: any) => ({
      url: item.imageUrl ?? item.url ?? item,
      caption: item.caption ?? item.title ?? '',
    }));
  }, [therapist, limits.gallery]);

  /** Certification image URL for Winda – "Certification Achieved" (shown on profile and in dashboard). */
  const WINDA_CERTIFICATION_IMAGE = 'https://ik.imagekit.io/7grri5v7d/winda.png';
  /** Certification image URL for Wiwid – "Certification Achieved" (shown on profile and in dashboard). */
  const WIWID_CERTIFICATION_IMAGE = 'https://ik.imagekit.io/7grri5v7d/windas.png';
  /** Certification image URL for Surtiningsih – "Certification Achieved" (shown on profile). */
  const SURTININGSIH_CERTIFICATION_IMAGE = 'https://ik.imagekit.io/7grri5v7d/windasu.png?updatedAt=1771923207534';

  /** Up to 5 certification/license/achievement image URLs for Safety & Comfort. Includes achievementsDocuments from dashboard and Winda/Wiwid/Surtiningsih cert when applicable. */
  const certificationImages = useMemo(() => {
    const raw = (therapist as any).certificationImages ?? (therapist as any).licenseImages ?? (therapist as any).achievementImages ?? [];
    const list = Array.isArray(raw) ? raw : [];
    let urls = list.map((item: any) => (typeof item === 'string' ? item : item?.url ?? item?.imageUrl ?? '')).filter(Boolean) as string[];
    // Also include achievements from dashboard (Achievements & Insurance)
    const achievementsRaw = (therapist as any).achievementsDocuments;
    if (achievementsRaw) {
      try {
        const parsed = typeof achievementsRaw === 'string' ? JSON.parse(achievementsRaw) : achievementsRaw;
        if (Array.isArray(parsed)) {
          const fromAchievements = parsed.map((x: any) => (x && typeof x.url === 'string' ? x.url : '')).filter(Boolean);
          urls = [...urls, ...fromAchievements];
        }
      } catch (_) { /* ignore */ }
    }
    // Therapist Winda / Wiwid / Surtiningsih: ensure "Certification Achieved" image is included
    const nameNorm = (therapist?.name ?? '').trim().toLowerCase();
    if (nameNorm === 'winda' || nameNorm.startsWith('winda ')) {
      if (!urls.includes(WINDA_CERTIFICATION_IMAGE)) urls = [WINDA_CERTIFICATION_IMAGE, ...urls];
    }
    if (nameNorm === 'wiwid' || nameNorm.startsWith('wiwid ')) {
      if (!urls.includes(WIWID_CERTIFICATION_IMAGE)) urls = [WIWID_CERTIFICATION_IMAGE, ...urls];
    }
    if (nameNorm === 'surtiningsih' || nameNorm.startsWith('surtiningsih ')) {
      if (!urls.includes(SURTININGSIH_CERTIFICATION_IMAGE)) urls = [SURTININGSIH_CERTIFICATION_IMAGE, ...urls];
    }
    return [...new Set(urls)].slice(0, 5);
  }, [therapist]);

  /** Therapist Trending Now: prefer available/online therapists only; if none available, show same-city and display as online so section stays active. */
  const sameCityDisplay = useMemo(() => {
    if (!Array.isArray(allTherapists) || allTherapists.length === 0) {
      return { list: [] as any[], showViewProfile: false, displayAsOnlineFallback: false };
    }
    const currentId = String(therapist.$id ?? therapist.id ?? '');
    const cityKey = getCityKey(therapist);
    if (!cityKey) return { list: [], showViewProfile: false, displayAsOnlineFallback: false };
    const sameCity = allTherapists.filter((t: any) => {
      const id = String(t.$id ?? t.id ?? '');
      if (id === currentId) return false;
      return getCityKey(t) === cityKey;
    });
    const available = sameCity.filter((t: any) => isTherapistAvailable(t));
    const useAvailableOnly = available.length > 0;
    const source = useAvailableOnly ? available : sameCity;
    const shuffled = shuffle(source);
    return {
      list: shuffled.slice(0, 3),
      showViewProfile: true,
      /** When true, no available therapists in same city – show therapists but display green (online) so section has content. */
      displayAsOnlineFallback: !useAvailableOnly && sameCity.length > 0,
    };
  }, [allTherapists, therapist]);

  /** Default testimonials: ~65% Indonesia (2 of 3); no city names in text so reviews match therapist’s location. */
  const SAFETY_COMFORT_TESTIMONIALS = useMemo(() => [
    { id: '1', customerName: 'Budi S.', rating: 5, text: "The couple massage was amazing! Highly recommend for a romantic treat.", date: '1 week ago', treatment: "Couple's Traditional", country: 'ID' },
    { id: '2', customerName: 'Siti M.', rating: 5, text: 'Best massage experience! The therapist was incredibly skilled and the ambiance was perfect.', date: '2 weeks ago', treatment: '90 min Traditional', country: 'ID' },
    { id: '3', customerName: 'James K.', rating: 5, text: 'Professional service from start to finish. Will definitely come back!', date: '1 month ago', treatment: '120 min Deep Tissue', country: 'AU' },
  ], []);

  /** Two regional indicator letters → flag emoji (e.g. US → 🇺🇸). */
  const getFlagEmoji = (countryCode: string) => {
    const code = (countryCode || 'US').toUpperCase().slice(0, 2);
    if (code.length < 2) return '🌍';
    return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
  };
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
    const cheapest = combinedMenu.length > 0 ? getCheapestServiceByTotalPrice(combinedMenu) : null;
    if (selectedPriceKey && cheapest) {
      const duration = Number(selectedPriceKey);
      const priceThou = Number((cheapest as any)[`price${selectedPriceKey}`]) || 0;
      const price = priceThou > 0 ? Math.round(priceThou * 1000) : getDefaultDurationAndPrice(therapist).price;
      const serviceName = (cheapest as any).name ?? (cheapest as any).serviceName ?? getFirstMassageType(therapist);
      return buildBookNowMessage({
        therapistName: getTherapistDisplayName(therapist.name),
        therapistId: String(therapist.$id ?? therapist.id),
        massageType: serviceName,
        durationMin: duration,
        price,
      }) + `\nMy Location:\nPreferred Time:`;
    }
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

  /** Response time for display (e.g. "Replies within ~2h"); optional on therapist. Supports minutes or hours from backend. */
  const responseTimeLabel = useMemo(() => {
    const hours = (therapist as any).averageResponseHours;
    const minutes = (therapist as any).averageResponseMinutes ?? (therapist as any).responseTime;
    if (hours != null && Number(hours) > 0) {
      const h = Number(hours);
      if (h < 24) return isId ? `Balas dalam ~${Math.round(h)} jam` : `Replies within ~${Math.round(h)}h`;
      return isId ? `Balas dalam ~${Math.round(h / 24)} hari` : `Replies within ~${Math.round(h / 24)} day(s)`;
    }
    if (minutes == null) return null;
    const n = Number(minutes);
    if (Number.isNaN(n) || n <= 0) return null;
    if (n < 60) return isId ? `Balas dalam ~${Math.round(n)} mnt` : `Replies within ~${Math.round(n)} min`;
    const h = n / 60;
    if (h < 24) return isId ? `Balas dalam ~${Math.round(h)} jam` : `Replies within ~${Math.round(h)}h`;
    return isId ? `Balas dalam ~${Math.round(h / 24)} hari` : `Replies within ~${Math.round(h / 24)} day(s)`;
  }, [therapist, isId]);

  const displayReviewCount = therapist?.reviewCount ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full" aria-busy="true" aria-label={isId ? 'Memuat profil' : 'Loading profile'}>
        <div className={`w-full ${HERO_ASPECT} bg-gray-200 rounded-t-2xl animate-pulse`} />
        <main className="w-full max-w-full mx-auto px-4 py-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-md">
            <div className="h-48 sm:h-56 bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse mt-4" />
              <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
      {isIncompleteProfile && (
        <div className="mx-4 mt-4 py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center" role="status">
          {isId ? 'Profil sedang diperbarui.' : 'Profile updating.'}
        </div>
      )}
      {/* Hero – same as Massage City Places profile */}
      <section className="w-full max-w-full overflow-visible bg-gray-200 rounded-t-2xl">
        <div className="relative w-full pt-2 bg-gray-200 rounded-t-2xl overflow-visible">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90 pointer-events-none rounded-t-2xl" />
          <div className={`relative w-full ${HERO_ASPECT} overflow-visible`}>
            <img
              src={displayImage || (therapist.mainImage ?? therapist.profilePicture) || 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png'}
              alt={getTherapistDisplayName(therapist.name) || (isId ? 'Foto profil terapis' : 'Therapist profile photo')}
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
            {showVerifiedOnHero && (
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
                </h1>
                <p className="text-sm text-white/95 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{locationStr}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden />
                    <span className="text-sm font-semibold">{ratingStr}</span>
                    {displayReviewCount > 0 && (
                      <span className="text-xs text-white/90">({displayReviewCount} {isId ? 'ulasan' : 'reviews'})</span>
                    )}
                  </div>
                  {responseTimeLabel && (
                    <span className="text-xs text-white/90">{responseTimeLabel}</span>
                  )}
                  {(therapist as any).yearsOfExperience != null && (
                    <span className="text-xs text-white/90">{therapist.yearsOfExperience} {isId ? 'tahun pengalaman' : 'years experience'}</span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-500/80 text-white' : 'bg-orange-500/80 text-white'}`} aria-label={isAvailable ? (isId ? 'Tersedia' : 'Available') : (isId ? 'Sibuk' : 'Busy')}>
                    {isAvailable ? (isId ? 'Tersedia' : 'Available') : (isId ? 'Sibuk' : 'Busy')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content – extra bottom padding so sticky bar doesn't cover content (safe area aware) */}
      <main className="w-full max-w-full mx-auto px-4 py-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        <style>{`
          @keyframes therapist-subtitle-slide-in {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .therapist-subtitle-slide-in {
            animation: therapist-subtitle-slide-in 0.6s ease-out 0.25s both;
          }
          @keyframes online-dot-pulse {
            0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
            50% { opacity: 0.6; transform: scale(1.15); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
          }
          .online-dot-flash {
            animation: online-dot-pulse 1.2s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-full space-y-4">
          <div className="mb-3 text-center border-b border-gray-200 pb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-1" id="profile-welcome">Welcome To My Profile</h3>
            <p className="text-sm text-gray-600 therapist-subtitle-slide-in">
              {isId ? 'Silakan hubungi untuk layanan yang belum tercantum' : 'Please reach out for any services not listed'}
            </p>
          </div>

          <div className="mb-4 pt-2" role="region" aria-labelledby="profile-welcome">
            <TherapistCard
              therapist={therapist}
              userLocation={userLocation}
              onRate={() => {}}
              onBook={() => {}}
              onIncrementAnalytics={() => {}}
              onNavigate={(page) => onNavigate?.(page)}
              isCustomerLoggedIn={false}
              t={{}}
              selectedPriceKey={selectedPriceKey}
              onSelectPriceKey={setSelectedPriceKey}
            />
          </div>

          {/* Section divider */}
          <div className="border-t border-gray-200 pt-4" />

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
              { id: 'mock-hair', name: 'Hair Salon', description: 'Professional haircut, styling and treatments at our in-house salon. Our stylists are trained in the latest trends and use quality products.', imageUrl: OTHER_SERVICES_DEFAULT_IMAGES.hair_salon, details: [{ label: 'Haircut & styling', price: 'IDR 150K', duration: '45 min' }], bookLabel: 'Book' as const },
              { id: 'mock-eyelashes', name: 'Eye Lashes', description: 'Eyelash extensions, lifts and tints. Classic, volume and hybrid styles available. Professional application for a natural or dramatic look.', imageUrl: mockImage, details: [{ label: 'Lash extensions', price: 'IDR 200K', duration: '60 min' }], bookLabel: 'Book' as const },
              { id: 'mock-nailart', name: 'Nail Art', description: 'Creative nail art, gel manicure, pedicure and nail care. Custom designs and long-lasting finishes.', imageUrl: mockImage, details: [{ label: 'Gel manicure & nail art', price: 'IDR 180K', duration: '45 min' }], bookLabel: 'Book' as const },
            ];
            const nameNormForServices = (therapist?.name ?? '').trim().toLowerCase();
            const isWiwidProfile = nameNormForServices === 'wiwid' || nameNormForServices.startsWith('wiwid ');
            const wiwidDropdownServices: AdditionalService[] = [
              { id: 'coin_rube', name: 'Coin Rub', description: 'Traditional coin rubbing (kerokan/guasha-style) to release tension and improve circulation. Available as an add-on or standalone service.', imageUrl: OTHER_SERVICES_DEFAULT_IMAGES.coin_rube, details: [{ label: 'Coin Rub 60 min', price: 'IDR 170.000', duration: '60 min' }, { label: 'Coin Rub 90 min', price: 'IDR 250.000', duration: '90 min' }], bookLabel: 'Book' as const },
              { id: 'sports_enjury', name: 'Sports Injury', description: 'Therapeutic massage focused on sports-related injuries and recovery. Helps relieve muscle strain, improve flexibility and support rehabilitation.', imageUrl: OTHER_SERVICES_DEFAULT_IMAGES.sports_enjury, details: [{ label: 'Sports Injury', price: 'Contact for price', duration: 'varies' }], bookLabel: 'Book' as const },
              { id: 'nerve_damage', name: 'Nerve Damage', description: 'Specialised massage techniques to support recovery and comfort where nerve sensitivity or damage is a concern. Gentle, targeted approach.', imageUrl: OTHER_SERVICES_DEFAULT_IMAGES.nerve_damage, details: [{ label: 'Nerve Damage', price: 'Contact for price', duration: 'varies' }], bookLabel: 'Book' as const },
            ];
            const displayDropdownServices = isWiwidProfile ? wiwidDropdownServices : defaultServices;
            const placeName = getTherapistDisplayName(therapist.name);
            const placeWhatsApp = (therapist as any).whatsappNumber ?? (therapist as any).contactNumber;
            const defaultAvatar = 'https://ik.imagekit.io/7grri5v7d/default-avatar.png';
            const isBeauticianProfile = therapist ? therapistOffersService(therapist, SERVICE_TYPES.BEAUTICIAN) : false;
            const sectionTitle = isBeauticianProfile
              ? (isId ? "Beautician's Tren Saat Ini" : "Beautician's Trending Now")
              : (isId ? 'Terapis Tren Saat Ini' : 'Therapist Trending Now');
            const sectionSubtitle = isBeauticianProfile
              ? (isId ? 'Kenali beautician dan layanan mereka' : 'Meet Beauticians and explore their services')
              : (isId ? 'Kenali terapis dan layanan mereka' : 'Meet therapists and explore their services');
            const hideBeauticianTrendingSection = isBeauticianProfile && isPaidPlan;
            return (
              <div className="mt-6 px-4" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
                {/* Beautician's Trending Now: hidden on paid plans (all paid plans remove this section) */}
                {!hideBeauticianTrendingSection && (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <LayoutGrid className="w-3.5 h-3.5 text-orange-500" aria-hidden />
                    <h3 className="text-lg font-bold text-gray-900">
                      {sectionTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    {sectionSubtitle}
                  </p>
                </div>
                )}

                {/* Free: show therapist carousel; Paid: hide it (therapist chose to remove by upgrading) */}
                {!isPaidPlan && !hideBeauticianTrendingSection && (
                <div className="mb-6 overflow-visible">
                  <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-2 pl-4 pr-4 snap-x snap-mandatory" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
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
                      // Never show raw JSON like [" on cards: parse massageTypes if it's a string that looks like an array
                      const massageTypesForDisplay = ((): string => {
                        if (!isRealTherapist) return t.specialty ?? 'Massage';
                        const raw = t.massageTypes;
                        if (Array.isArray(raw)) return raw.slice(0, 2).join(', ') || t.specialty || 'Massage';
                        if (typeof raw === 'string' && raw.trim().startsWith('[')) {
                          try {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed)) return parsed.slice(0, 2).join(', ') || t.specialty || 'Massage';
                          } catch (_) { /* ignore */ }
                        }
                        if (typeof raw === 'string' && raw.trim().length > 0) return raw;
                        return t.specialty || 'Massage';
                      })();
                      const specialty = massageTypesForDisplay;
                      const yearsExperience = isRealTherapist ? (t.yearsOfExperience ?? t.yearsExperience ?? 0) : t.yearsExperience;
                      const rating = isRealTherapist ? (t.rating ?? 4.5) : t.rating;
                      const key = isRealTherapist ? (t.$id ?? t.id ?? `t-${index}`) : t.id;
                      const statusStr = String((t as any).status ?? '').toLowerCase();
                      const availStr = String(t.availability ?? '').toLowerCase();
                      const isOnline = isRealTherapist
                        ? (sameCityDisplay.displayAsOnlineFallback || isTherapistAvailable(t))
                        : true;
                      return (
                        <div
                          key={key}
                          className="flex-shrink-0 w-32 snap-start rounded-xl border-2 bg-orange-50/60 border-orange-300 p-4 text-center flex flex-col"
                        >
                          <div className="relative w-16 h-16 mx-auto mb-2 flex-shrink-0 overflow-visible">
                            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-amber-200 bg-white">
                              <img
                                src={displayPhoto}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                              />
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 flex-shrink-0 rounded-full border-2 border-white z-10 ${isOnline ? 'bg-green-500 online-dot-flash' : 'bg-orange-500'}`}
                              style={{ width: 12, height: 12, minWidth: 12, minHeight: 12 }}
                              title={isOnline ? (isId ? 'Online' : 'Online') : (isId ? 'Sibuk' : 'Busy')}
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

                {/* Additional services – same dropdown cards as city places */}
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {getTherapistDisplayName(therapist.name)} {isId ? 'Layanan Lain' : 'Other Services'}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {isId ? 'Pilih panah dropdown untuk melihat' : 'Select the drop down arrow to view'}
                </p>
                <div className="space-y-3">
                  {displayDropdownServices.map((svc) => (
                    <AdditionalServiceCard
                      key={svc.id}
                      service={svc}
                      placeName={placeName}
                      placeWhatsApp={placeWhatsApp}
                      userCountryCode={isId ? 'ID' : undefined}
                      useAdminForBooking={plan === 'free'}
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
                          ...((therapist as any).hotelVillaSafePassStatus === 'active'
                            ? [isId ? 'Terverifikasi aman masuk hotel, rumah & villa' : 'Verified safe to enter hotel, home & villa']
                            : []),
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
                      {/* IndaStreet certification header and disclaimer – above Certification Achieved thumbnails */}
                      <h5 className="text-sm font-bold text-gray-900 mt-4 mb-1">
                        IndaStreet
                      </h5>
                      {certificationImages.length > 0 ? (
                        <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
                          {isId
                            ? 'Terapis berikut telah menjalani pemeriksaan oleh terapis pijat IndaStreet yang berpengalaman, yang mengonfirmasi bahwa terapis mampu menawarkan pijat profesional serta memiliki kebersihan dan sikap profesional dalam karier mereka. Pemeriksaan latar belakang tidak menemukan aktivitas kriminal atau berbahaya, sehingga terapis ini diizinkan mengakses hotel, villa, atau rumah.'
                            : 'The following therapist has undergone examination with an experienced IndaStreet massage therapist, that confirmed that the therapist is fully capable to offer professional massage and has hygiene and professional manner towards their career. Background check resulted in no criminal or dangerous activity, allowing this therapist access to hotels, villas or homes.'}
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
                          {isId
                            ? 'Profil ini belum menampilkan pencapaian atau IndaStreet Safe Hotel, Villa & Home Pass. Dapatkan sertifikasi Safe Pass untuk menandakan bahwa Anda terverifikasi aman masuk hotel, rumah & villa—dan tampilkan kepercayaan lebih kepada klien.'
                            : 'This profile has not yet added achievements or the IndaStreet Safe Hotel, Villa & Home Pass. Get certified with Safe Pass to show you’re verified safe to enter hotel, home and villa—and stand out to clients who look for that trust.'}
                        </p>
                      )}
                      {/* Certification Achieved – up to 5 thumbnails; click opens same lightbox/blur as massage city places */}
                      <h5 className="text-xs font-bold text-gray-900 mt-2 mb-2">
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
                      <style>{`
                        @keyframes review-flag-float {
                          0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4); }
                          50% { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5); }
                        }
                        .review-flag-circle {
                          animation: review-flag-float 2.5s ease-in-out infinite;
                        }
                        .review-flag-circle:nth-child(1) { animation-delay: 0s; }
                        .review-flag-circle:nth-child(2) { animation-delay: 0.3s; }
                        .review-flag-circle:nth-child(3) { animation-delay: 0.6s; }
                        .review-flag-circle.active {
                          animation: none;
                          transform: scale(1.08);
                          box-shadow: 0 6px 16px rgba(245,158,11,0.4), 0 0 0 3px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.5);
                        }
                      `}</style>
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
                      {/* 3 animated round 3D flag circles – country of reviewer; click to switch review (replaces dots) */}
                      <div className="flex justify-center gap-1.5 mt-3">
                        {SAFETY_COMFORT_TESTIMONIALS.map((testimonial, i) => (
                          <button
                            key={testimonial.id}
                            type="button"
                            onClick={() => setTestimonialIndex(i)}
                            className={`review-flag-circle w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 border-2 border-amber-200 bg-white/90 shadow-md hover:scale-105 transition-transform ${i === testimonialIndex ? 'active ring-2 ring-amber-400' : 'opacity-80 hover:opacity-100'}`}
                            aria-label={isId ? `Testimoni dari ${(testimonial as any).country || 'pelanggan'}` : `Review from ${(testimonial as any).country || 'customer'}`}
                            title={(testimonial as any).country ? `${(testimonial as any).country} – ${testimonial.customerName}` : testimonial.customerName}
                          >
                            {(testimonial as any).country ? getFlagEmoji((testimonial as any).country) : '🌍'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGiftVoucherSlider(true)}
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

          {/* Section divider before Reviews */}
          <div className="border-t border-gray-200 pt-4" />

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

      {/* Sticky primary CTA – safe area padding so bar doesn't cover content on notched devices */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        role="complementary"
        aria-label={isId ? 'Pesan sekarang' : 'Book now'}
      >
        <button
          type="button"
          onClick={handleBookNow}
          className={`${STICKY_BTN_CLASS} min-h-[48px] focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none`}
          aria-label={isId ? 'Book Now via WhatsApp' : 'Book Now via WhatsApp'}
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
          {isId ? 'Book Now' : 'Book Now'}
        </button>
        <p className="text-[11px] text-gray-500 text-center mt-2 leading-tight">
          {isId ? 'Batalkan atau ubah minimal 2 jam sebelumnya. Hubungi untuk pesanan same-day.' : 'Cancel or reschedule at least 2 hours in advance. Contact for same-day booking.'}
        </p>
      </div>

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

      {/* Super Elite Gift Voucher Slider – same style and layout as Massage City Places */}
      <GiftVoucherSlider
        isOpen={showGiftVoucherSlider}
        onClose={() => setShowGiftVoucherSlider(false)}
        placeName={getTherapistDisplayName(therapist.name)}
        placeId={String(therapist.$id ?? therapist.id ?? '')}
        whatsappNumber={bookingNumber || undefined}
        treatments={giftVoucherData.treatments}
        additionalServices={giftVoucherData.additionalServices}
        language={language}
        giftTitle={isId ? 'Hadiahkan ke Terapis' : 'Gift This Therapist'}
        variant="therapist"
      />

      {/* Certification / license image lightbox – professional card with caption and close button */}
      {selectedCertImage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          onClick={() => setSelectedCertImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={isId ? 'Tampilan sertifikat' : 'Certification view'}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <img
                src={selectedCertImage}
                alt=""
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-600 leading-relaxed text-center">
                {isId
                  ? 'Terapis ini telah diverifikasi oleh IndaStreet. Sertifikasi mengonfirmasi kemampuan profesional, standar kebersihan, dan pemeriksaan latar belakang yang memenuhi syarat akses ke hotel, villa, dan rumah.'
                  : 'This therapist has been verified by IndaStreet. Certification confirms professional capability, hygiene standards, and a background check qualifying access to hotels, villas and homes.'}
              </p>
            </div>
            <div className="flex justify-center p-4 border-t border-gray-100 bg-gray-50/80">
              <button
                type="button"
                onClick={() => setSelectedCertImage(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                aria-label={isId ? 'Tutup' : 'Close'}
              >
                <X className="w-4 h-4 flex-shrink-0" aria-hidden />
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
