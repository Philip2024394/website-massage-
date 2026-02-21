/**
 * Indonesia country hub – elite landing for all Indonesia-related content.
 * Massage, facial, beauty: hero, image containers, contextual live listings, and page links.
 * Accessed from side drawer "IndaStreet Countries" → Indonesia.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  BookOpen,
  Building,
  Home,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

/** Right-pointing arrow for CTAs (avoids lucide export variance). */
const ArrowRightIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const ChevronRightIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getTherapistDisplayName } from '../utils/therapistCardHelpers';
import { computeDisplayStatus } from '../utils/therapistDisplayStatus';
import { generateTherapistSlug } from '../utils/seoSlugGenerator';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageContainer from '../components/layout/PageContainer';
import { INDONESIA_DRAWER_ITEMS } from '../config/drawerConfig';
import type { Page } from '../types/pageTypes';

const HERO_IMAGE_SRC =
  'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026';

interface IndonesiaLandingPageProps {
  onNavigate?: (page: Page) => void;
  language?: 'en' | 'id' | 'gb';
  onLanguageChange?: (lang: string) => void;
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onFacialPortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  therapists?: any[];
  places?: any[];
  facialPlaces?: any[];
  handleSetSelectedTherapist?: (therapist: any) => void;
}

const SECTION_LABELS: Record<string, { en: string; id: string }> = {
  massage: { en: 'Massage', id: 'Pijat' },
  facial: { en: 'Facial & Skin Clinics', id: 'Facial & Klinik Kulit' },
  beauty: { en: 'Beauty & Wellness', id: 'Kecantikan & Kesehatan' },
};

const ITEM_TO_SECTION: Record<string, string> = {
  'massage-bali': 'massage',
  'massage-types': 'massage',
  'balinese-massage': 'massage',
  'deep-tissue-massage': 'massage',
  'facial-types': 'facial',
  'facial-places': 'facial',
  'facial-home-service': 'facial',
};

/** Image container: replaceable hero or section image. Pass src to show image, or leave empty for placeholder. */
const ImageContainer: React.FC<{
  src?: string;
  alt: string;
  aspectClass?: string;
  className?: string;
  placeholderLabel?: string;
}> = ({
  src,
  alt,
  aspectClass = 'aspect-[21/9]',
  className = '',
  placeholderLabel = 'Your image',
}) => (
  <div
    className={`relative w-full ${aspectClass} min-h-[120px] bg-slate-200 rounded-xl overflow-hidden ${className}`}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
        {placeholderLabel}
      </div>
    )}
  </div>
);

/** Banner-style live therapist card: horizontal layout, live status, View profile → main profile page. */
const TherapistBannerCard: React.FC<{
  therapist: any;
  onViewProfile: (therapist: any) => void;
  viewProfileLabel: string;
  availableLabel: string;
  busyLabel: string;
}> = ({ therapist, onViewProfile, viewProfileLabel, availableLabel, busyLabel }) => {
  const id = (therapist.$id ?? therapist.id ?? '').toString();
  const name = getTherapistDisplayName(therapist.name ?? therapist.displayName);
  const img =
    therapist.mainImage ??
    therapist.profilePicture ??
    getRandomTherapistImage(id || 'default');
  const displayStatus = computeDisplayStatus(therapist);
  const isAvailable = displayStatus === 'Available';
  return (
    <article className="flex w-full min-w-0 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300">
      <div className="w-24 sm:w-28 flex-shrink-0 aspect-square bg-slate-100">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{name}</p>
          <span
            className={`inline-flex items-center gap-1.5 mt-1 text-xs font-medium rounded-full px-2 py-0.5 ${
              isAvailable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}
            />
            {isAvailable ? availableLabel : busyLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(therapist);
          }}
          className="self-start sm:self-center flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {viewProfileLabel}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};

/** Section wrapper with scroll-in animation. */
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const IndonesiaLandingPage: React.FC<IndonesiaLandingPageProps> = ({
  onNavigate,
  handleSetSelectedTherapist,
  language = 'en',
  onLanguageChange,
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onFacialPortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  therapists = [],
  places = [],
  facialPlaces = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isId = language === 'id';

  const dt: Record<string, string> = {
    massageInBali: isId ? 'Pijat di Bali' : 'Massage in Bali',
    massageDirectory: isId ? 'Direktori Pijat' : 'Massage Directory',
    facialDirectory: isId ? 'Direktori Facial' : 'Facial Directory',
    facialPlaces: isId ? 'Tempat Facial' : 'Facial Places',
    facialHomeService: isId ? 'Facial Layanan Rumah' : 'Facial Home Service',
    balineseMassage: isId ? 'Pijat Bali' : 'Balinese Massage',
    deepTissueMassage: isId ? 'Pijat Deep Tissue' : 'Deep Tissue Massage',
    liveTherapists: isId ? 'Terapis tersedia' : 'Live therapists',
    viewAll: isId ? 'Lihat semua' : 'View all',
    exploreIndonesia: isId ? 'Jelajahi Indonesia' : 'Explore Indonesia',
    viewProfile: isId ? 'Lihat profil' : 'View profile',
    available: isId ? 'Tersedia' : 'Available',
    busy: isId ? 'Sibuk' : 'Busy',
  };

  const handleNav = (page: Page) => {
    if (page === 'facial-types' && onNavigate) {
      try {
        sessionStorage.setItem('home_initial_tab', 'facials');
      } catch (_) {}
    }
    onNavigate?.(page);
  };

  const sectionOrder: Array<'massage' | 'facial' | 'beauty'> = [
    'massage',
    'facial',
    'beauty',
  ];

  // Only live therapists with services (isLive) appear on country page
  const liveTherapists = therapists.filter((t: any) => t.isLive === true);

  const handleViewProfile = (therapist: any) => {
    handleSetSelectedTherapist?.(therapist);
    onNavigate?.('therapist-profile');
    try {
      const slug = generateTherapistSlug(therapist);
      const therapistId = (therapist.$id ?? therapist.id ?? '').toString();
      const pathSegment = therapistId ? `${therapistId}-${slug}` : slug;
      window.history.pushState({}, '', `/#/therapist-profile/${pathSegment}`);
    } catch (_) {}
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-slate-50">
      <UniversalHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onMenuClick={() => setIsMenuOpen(true)}
        onHomeClick={() => onNavigate?.('home')}
        showHomeButton
        title={isId ? 'Indonesia' : 'Indonesia'}
      />
      <React19SafeWrapper condition={isMenuOpen}>
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={onNavigate}
          language={language}
          onMassageJobsClick={onMassageJobsClick}
          onHotelPortalClick={onHotelPortalClick}
          onVillaPortalClick={onVillaPortalClick}
          onTherapistPortalClick={onTherapistPortalClick}
          onMassagePlacePortalClick={onMassagePlacePortalClick}
          onFacialPortalClick={onFacialPortalClick}
          onAgentPortalClick={onAgentPortalClick}
          onCustomerPortalClick={onCustomerPortalClick}
          onAdminPortalClick={onAdminPortalClick}
          onTermsClick={onTermsClick}
          onPrivacyClick={onPrivacyClick}
          therapists={therapists}
          places={places}
        />
      </React19SafeWrapper>

      <div className="pt-[60px] sm:pt-16">
        {/* Hero – replaceable image container */}
        <AnimatedSection delay={0}>
          <div className="relative w-full aspect-[21/9] min-h-[200px] sm:min-h-[260px] bg-slate-100 overflow-hidden">
            <img
              src={HERO_IMAGE_SRC}
              alt="IndaStreet Massage – Indonesia"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-orange-300" />
                <span className="text-sm font-semibold uppercase tracking-wide text-orange-200">
                  {isId ? 'Negara' : 'Country'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold drop-shadow-lg">
                {isId ? 'Indonesia' : 'Indonesia'}
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1 max-w-xl">
                {isId
                  ? 'Pijat, facial, dan kecantikan. Pilih layanan di rumah atau kunjungi tempat terbaik.'
                  : 'Massage, facials, and beauty. Home service or visit the best places.'}
              </p>
            </div>
          </div>
        </AnimatedSection>

        <PageContainer className="py-6 sm:py-10 px-4 sm:px-6">
          {/* Massage at Home – live therapists + links */}
          <AnimatedSection delay={100}>
            <section className="mb-10 sm:mb-14">
              <div className="flex items-center gap-2 text-orange-600 mb-3">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {SECTION_LABELS.massage[isId ? 'id' : 'en']}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {isId ? 'Pijat Layanan Rumah' : 'Massage at Home'}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-4">
                {isId
                  ? 'Terapis pijat profesional datang ke lokasi Anda. Pilih jenis pijat dan booking dengan mudah.'
                  : 'Professional massage therapists come to you. Choose your massage type and book easily.'}
              </p>
              <div className="mb-6">
                <ImageContainer
                  src=""
                  alt="Massage at home"
                  aspectClass="aspect-[2/1]"
                  placeholderLabel="Massage at home image"
                />
              </div>
              {liveTherapists.length > 0 && (
                <div className="mb-6 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    {dt.liveTherapists}
                  </p>
                  <div className="space-y-3">
                    {liveTherapists.map((t) => (
                      <TherapistBannerCard
                        key={(t.$id ?? t.id ?? '').toString()}
                        therapist={t}
                        onViewProfile={handleViewProfile}
                        viewProfileLabel={dt.viewProfile}
                        availableLabel={dt.available}
                        busyLabel={dt.busy}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('home')}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 text-sm font-medium hover:border-orange-400 hover:text-orange-600 transition-colors"
                  >
                    {dt.viewAll}
                  </button>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {INDONESIA_DRAWER_ITEMS.filter(
                    (i) => ITEM_TO_SECTION[i.id] === 'massage'
                  ).map((item) => {
                    const label =
                      item.labelOverride ?? dt[item.labelKey] ?? item.labelKey;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleNav(item.id as Page)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left hover:bg-orange-50/50 transition-colors"
                        >
                          <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-orange-100 flex items-center justify-center">
                            {item.icon === 'Heart' && (
                              <Heart className="w-5 h-5 text-orange-600" />
                            )}
                            {item.icon === 'BookOpen' && (
                              <BookOpen className="w-5 h-5 text-orange-600" />
                            )}
                          </span>
                          <span className="flex-1 font-medium text-slate-800">
                            {label}
                          </span>
                          <ChevronRightIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </AnimatedSection>

          {/* Massage Places – no live listings (only therapists on country page); image + links only */}
          <AnimatedSection delay={150}>
            <section className="mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {isId ? 'Tempat Pijat' : 'Massage Places'}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-4">
                {isId
                  ? 'Salon dan spa pijat terbaik. Kunjungi lokasi dan nikmati perawatan di tempat.'
                  : 'Best massage salons and spas. Visit in person and enjoy treatments on location.'}
              </p>
              <div className="mb-6">
                <ImageContainer
                  src=""
                  alt="Massage places"
                  aspectClass="aspect-[2/1]"
                  placeholderLabel="Massage places image"
                />
              </div>
            </section>
          </AnimatedSection>

          {/* Facial at Home */}
          <AnimatedSection delay={200}>
            <section className="mb-10 sm:mb-14">
              <div className="flex items-center gap-2 text-orange-600 mb-3">
                <Home className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {SECTION_LABELS.facial[isId ? 'id' : 'en']}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {dt.facialHomeService}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-4">
                {isId
                  ? 'Facial dan perawatan kulit di rumah. Ahli datang ke lokasi Anda.'
                  : 'Facials and skin treatments at home. Experts come to your location.'}
              </p>
              <div className="mb-6">
                <ImageContainer
                  src=""
                  alt="Facial home service"
                  aspectClass="aspect-[2/1]"
                  placeholderLabel="Facial home service image"
                />
              </div>
              <button
                type="button"
                onClick={() => handleNav('facial-home-service')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                {isId ? 'Lihat layanan' : 'View services'}
                <ArrowRightIcon />
              </button>
            </section>
          </AnimatedSection>

          {/* Facial Places – live facial places */}
          <AnimatedSection delay={250}>
            <section className="mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {dt.facialPlaces}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-4">
                {isId
                  ? 'Klinik kulit dan tempat facial. Pilih lokasi dan booking perawatan.'
                  : 'Skin clinics and facial venues. Choose a location and book your treatment.'}
              </p>
              <div className="mb-6">
                <ImageContainer
                  src=""
                  alt="Facial places"
                  aspectClass="aspect-[2/1]"
                  placeholderLabel="Facial places image"
                />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {INDONESIA_DRAWER_ITEMS.filter(
                    (i) => ITEM_TO_SECTION[i.id] === 'facial'
                  ).map((item) => {
                    const label =
                      item.labelOverride ?? dt[item.labelKey] ?? item.labelKey;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleNav(item.id as Page)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left hover:bg-orange-50/50 transition-colors"
                        >
                          <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-orange-100 flex items-center justify-center">
                            {item.icon === 'BookOpen' && (
                              <BookOpen className="w-5 h-5 text-orange-600" />
                            )}
                            {item.icon === 'Building' && (
                              <Building className="w-5 h-5 text-orange-600" />
                            )}
                            {item.icon === 'Home' && (
                              <Home className="w-5 h-5 text-orange-600" />
                            )}
                          </span>
                          <span className="flex-1 font-medium text-slate-800">
                            {label}
                          </span>
                          <ChevronRightIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </AnimatedSection>

          {/* Beauty & Wellness – image containers + links */}
          <AnimatedSection delay={300}>
            <section className="mb-10 sm:mb-14">
              <div className="flex items-center gap-2 text-orange-600 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {SECTION_LABELS.beauty[isId ? 'id' : 'en']}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {isId ? 'Kecantikan & Kesehatan' : 'Beauty & Wellness'}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-4">
                {isId
                  ? 'Facial, perawatan kulit, dan layanan kecantikan. Semua dalam satu area.'
                  : 'Facials, skin care, and beauty services. All in one place.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <ImageContainer
                  src=""
                  alt="Beauty home"
                  aspectClass="aspect-[4/3]"
                  placeholderLabel="Beauty home service image"
                />
                <ImageContainer
                  src=""
                  alt="Beauty places"
                  aspectClass="aspect-[4/3]"
                  placeholderLabel="Beauty places image"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleNav('facial-types')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-medium hover:bg-orange-100 hover:text-orange-800 transition-colors"
                >
                  {dt.facialDirectory}
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('facial-places')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-medium hover:bg-orange-100 hover:text-orange-800 transition-colors"
                >
                  {dt.facialPlaces}
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('facial-home-service')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-medium hover:bg-orange-100 hover:text-orange-800 transition-colors"
                >
                  {dt.facialHomeService}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </section>
          </AnimatedSection>

          {/* Explore Indonesia – more pages */}
          <AnimatedSection delay={350}>
            <section className="pb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {dt.exploreIndonesia}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { page: 'how-it-works' as Page, en: 'How it works', id: 'Cara kerja' },
                    { page: 'about' as Page, en: 'About us', id: 'Tentang kami' },
                    { page: 'blog' as Page, en: 'Blog', id: 'Blog' },
                    { page: 'faq' as Page, en: 'FAQ', id: 'FAQ' },
                    { page: 'contact' as Page, en: 'Contact', id: 'Kontak' },
                  ] as const
                ).map(({ page, en, id: idLabel }) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onNavigate?.(page)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-orange-300 hover:text-orange-700 transition-colors"
                  >
                    {isId ? idLabel : en}
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </section>
          </AnimatedSection>
        </PageContainer>
      </div>
    </div>
  );
};

export default IndonesiaLandingPage;
