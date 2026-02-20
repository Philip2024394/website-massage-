// Award-winning luxury skin clinic profile UI – conversion-focused, mobile-first
import React, { useState } from 'react';
import {
    MapPin, Phone, Star, Sparkles, Calendar, X, TrendingUp, Building,
    Clock, Award, Shield, CreditCard, FileText, Globe, Share2
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import CityLocationDropdown from '../components/CityLocationDropdown';
import MusicPlayer from '../components/MusicPlayer';
import RotatingReviews from '../components/RotatingReviews';
import SocialMediaLinks from '../components/SocialMediaLinks';
import IndastreetAchievements from '../components/IndastreetAchievements';
import HomeIcon from '../components/icons/HomeIcon';
import SocialSharePopup from '../components/SocialSharePopup';
import { getAuthAppUrl } from '../utils/therapistCardHelpers';

const DEFAULT_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png?updatedAt=1764966155682';

interface Treatment {
    id: string;
    name: string;
    description: string;
    image: string;
    prices: {
        min60: number;
        min90: number;
        min120: number;
    };
    category: string;
    popular?: boolean;
    new?: boolean;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    specialization: string;
    experience: string;
}

interface GalleryImage {
    id: string;
    url: string;
    caption: string;
    category: 'before-after' | 'interior' | 'treatment';
}

export interface ClinicInfoPhoto {
    imageUrl: string;
    header: string;
    description: string;
}

interface FacialClinic {
    id: string;
    name: string;
    tagline: string;
    description: string;
    heroImage: string;
    logo: string;
    location: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    website?: string;
    rating: number;
    reviewCount: number;
    totalTreatments: number;
    yearsInBusiness: number;
    certifications: string[];
    operatingHours: {
        weekdays: string;
        weekend: string;
    };
    treatments: Treatment[];
    team: TeamMember[];
    gallery: GalleryImage[];
    clinicInfoPhotos?: ClinicInfoPhoto[];
    /** Max 5: licenses or certs – from dashboard; each has imageUrl, header, description */
    licenseCertImages?: ClinicInfoPhoto[];
    bookingsCount?: number;
    amenities: string[];
    specialOffers?: {
        title: string;
        description: string;
        discount: number;
        validUntil: string;
    };
}

interface FacialClinicProfilePageProps {
    clinic: FacialClinic;
    onBack?: () => void;
    onBook?: (treatment: Treatment) => void;
    onNavigate?: (page: string) => void;
    therapists?: any[];
    places?: any[];
    userLocation?: { lat: number; lng: number; address?: string } | null;
    language?: string;
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
}

const FacialClinicProfilePage: React.FC<FacialClinicProfilePageProps> = ({
    clinic,
    onBack,
    onBook,
    onNavigate,
    therapists = [],
    places = [],
    userLocation,
    language = 'id',
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
}) => {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [selectedMainImageIndex, setSelectedMainImageIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedClinicPhoto, setSelectedClinicPhoto] = useState<ClinicInfoPhoto | null>(null);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [selectedLicenseCert, setSelectedLicenseCert] = useState<ClinicInfoPhoto | null>(null);

    // Hero first, then gallery; ensure every URL is non-empty for correct display
    const heroUrl = (clinic.heroImage || '').trim() || DEFAULT_HERO_IMAGE;
    const mainDisplayImages = Array.from({ length: 5 }, (_, i) => {
        if (i === 0) return heroUrl;
        const g = clinic.gallery[i - 1]?.url;
        return (g && g.trim()) ? g : heroUrl;
    });

    // Date joined - same as therapist profile (membershipStartDate / $createdAt)
    const joinedDateRaw = (clinic as any).membershipStartDate || (clinic as any).activeMembershipDate || (clinic as any).$createdAt;
    const joinedDisplay = (() => {
        if (!joinedDateRaw) return '—';
        try {
            const d = new Date(joinedDateRaw);
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleDateString('en-GB');
        } catch {
            return '—';
        }
    })();
    const [activeTab, setActiveTab] = useState<'home' | 'facial-places'>('home');
    const [cityState, setCityState] = useState<string>('all');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120>(90);
    const [menuSliderOpen, setMenuSliderOpen] = useState(false);
    const [menuSliderServiceIndex, setMenuSliderServiceIndex] = useState<number | null>(null);
    const [menuSliderDuration, setMenuSliderDuration] = useState<'60' | '90' | '120' | null>(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [scheduleForTreatment, setScheduleForTreatment] = useState<Treatment | null>(null);
    const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
    const [scheduleTime, setScheduleTime] = useState<string | null>(null);

    const whatsappNumber = (clinic.whatsapp || '').replace(/\D/g, '');
    const buildWhatsAppUrl = (message: string) =>
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const handleBookTreatmentWhatsApp = (treatment: Treatment, duration?: number) => {
        const durationStr = duration ? ` (${duration} min)` : '';
        const msg = `Hi, I would like to book ${treatment.name}${durationStr} at ${clinic.name}.`;
        window.open(buildWhatsAppUrl(msg), '_blank');
    };

    const handleScheduleAppointment = (treatment: Treatment) => {
        setScheduleForTreatment(treatment);
        setScheduleDate(null);
        setScheduleTime(null);
        setScheduleModalOpen(true);
    };

    const handleMenuSliderSelectService = (index: number, duration: '60' | '90' | '120') => {
        setMenuSliderServiceIndex(index);
        setMenuSliderDuration(duration);
    };

    const handleConfirmSchedule = () => {
        if (!scheduleForTreatment || !scheduleDate || !scheduleTime) return;
        const dateStr = scheduleDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const msg = `Hi, I would like to book ${scheduleForTreatment.name} on ${dateStr} at ${scheduleTime} at ${clinic.name}.`;
        window.open(buildWhatsAppUrl(msg), '_blank');
        setScheduleModalOpen(false);
        setScheduleForTreatment(null);
        setScheduleDate(null);
        setScheduleTime(null);
    };

    const handleBookTreatment = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setShowBookingModal(true);
    };

    const confirmBooking = () => {
        if (selectedTreatment && onBook) onBook(selectedTreatment);
        setShowBookingModal(false);
    };

    // Time slots for schedule modal (placeholder – real data from API later)
    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    const nextDays = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
    });

    return (
        <>
        <div className="bg-gray-50 min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
            {/* Same header as therapist profile */}
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* App Drawer - same as therapist profile */}
            {isMenuOpen && (
                <AppDrawer
                    isHome={false}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={{}}
                    language={(language || 'id') as 'en' | 'id' | 'gb'}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onFacialPortalClick={onFacialPortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    onQRCodeClick={() => onNavigate?.('qr-code')}
                    therapists={therapists}
                    places={places}
                />
            )}

            {/* Hero strip - same layout as therapist profile (location, toggles, city, Facial) */}
            <div className="bg-white border-b border-gray-100 pt-16">
                <div className="px-3 sm:px-4 pb-3 max-w-6xl mx-auto">
                    {userLocation && (
                        <div className="bg-white flex flex-col items-center gap-0.5 pt-4 pb-3">
                            <div className="flex items-center justify-center gap-2">
                                <MusicPlayer autoPlay={true} />
                                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-lg font-bold text-gray-900">
                                    {cityState === 'all' ? 'All Indonesia' : cityState}
                                </span>
                            </div>
                            <p className="text-base font-semibold text-gray-600">Indonesia&apos;s Facial & Skin Hub</p>
                        </div>
                    )}
                    {/* Tab bar: Home Service (active on profile) | Facial Places (opens listings) */}
                    <div className="flex bg-gray-200 rounded-full p-1 max-w-md mx-auto">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('home'); onNavigate?.('home'); }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{language === 'id' ? 'Layanan Rumah' : 'Home Service'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('facial-places'); onNavigate?.('facial-places'); }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'facial-places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{language === 'id' ? 'Tempat Facial' : 'Facial Places'}</span>
                        </button>
                    </div>
                    <div className="flex flex-row gap-2 sm:gap-3 items-center max-w-2xl mx-auto mt-4 min-h-[54px]">
                        <button
                            type="button"
                            onClick={() => {
                                try { sessionStorage.removeItem('home_initial_tab'); } catch (_) {}
                                if (typeof onNavigate === 'function') onNavigate('home');
                                else if (typeof onBack === 'function') onBack();
                            }}
                            title={language === 'id' ? 'Pijat & tempat pijat' : 'Massage home – Home service or Massage places'}
                            aria-label="Massage"
                            className="relative z-10 flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300"
                        >
                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap truncate">{language === 'id' ? 'Pijat' : 'Massage'}</span>
                        </button>
                        <div className="relative flex-shrink-0 min-w-0 max-w-[180px] sm:max-w-[200px] z-20">
                            <CityLocationDropdown
                                selectedCity={cityState}
                                onCityChange={setCityState}
                                placeholder="🇮🇩 All Indonesia"
                                includeAll={true}
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                try { sessionStorage.setItem('home_initial_tab', 'facials'); } catch (_) {}
                                onNavigate?.('home');
                            }}
                            title={language === 'id' ? 'Facial layanan rumah' : 'Home page – Home service facials & Facial places tab'}
                            aria-label="Facial"
                            className="flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border bg-orange-500 text-white border-orange-500 shadow"
                        >
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap truncate">{language === 'id' ? 'Facial' : 'Facial'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Luxury skin clinic profile – soft neutral, mobile-first, conversion-focused */}
            <div className="bg-[#faf8f5] min-h-screen">
                {/* 1️⃣ Hero – full-width main image, top corners rounded; badges (star, orders, share); Joined over image left */}
                <div className="w-full overflow-hidden rounded-t-2xl">
                    <div className="h-48 w-full overflow-visible relative sm:h-52">
                        <div className="absolute inset-0 overflow-hidden rounded-t-2xl bg-gradient-to-r from-stone-200 to-stone-300" style={{ minHeight: '192px' }}>
                            <img
                                src={mainDisplayImages[selectedMainImageIndex]}
                                alt=""
                                className="w-full h-full object-cover object-center rounded-t-2xl"
                                style={{ aspectRatio: '16/9', minHeight: '192px' }}
                                loading="eager"
                                onError={(e) => {
                                    const el = e.currentTarget;
                                    if (el.src !== DEFAULT_HERO_IMAGE) el.src = DEFAULT_HERO_IMAGE;
                                }}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent pointer-events-none rounded-t-2xl" />
                        {/* Star rating badge – top left (same as therapist) */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-white">{clinic.rating.toFixed(1)}</span>
                        </div>
                        {/* Joined date – over main image, left side with icon */}
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg text-white text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-amber-300" />
                            <span>Joined {joinedDisplay}</span>
                        </div>
                        {/* Orders badge – top right (same as therapist) */}
                        {(clinic.bookingsCount ?? 0) > 0 && (
                            <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                {clinic.bookingsCount}+ Orders
                            </div>
                        )}
                        {/* Share profile button – bottom right (same as therapist) */}
                        <button
                            type="button"
                            onClick={() => setShowSharePopup(true)}
                            className="absolute bottom-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/70 transition-all"
                            title="Share this clinic"
                            aria-label="Share profile"
                        >
                            <Share2 className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    </div>
                    {/* Location under main image – right-aligned with pin (Joined moved over image) */}
                    <div className="px-4 py-2 bg-white/95 backdrop-blur-sm flex flex-col items-end border-b border-stone-100">
                        {clinic.location && (
                            <>
                                <div className="flex items-center gap-1 text-xs text-stone-800 font-medium uppercase">
                                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                    {clinic.location}
                                </div>
                                <div className="text-xs text-amber-600 mt-0.5 font-medium">
                                    Serves {clinic.location} area
                                </div>
                            </>
                        )}
                    </div>

                    {/* Licenses & certifications – max 5 thumbnails; click to enlarge with header and details */}
                    {(() => {
                        const licenses = (clinic.licenseCertImages && clinic.licenseCertImages.length > 0)
                            ? clinic.licenseCertImages.slice(0, 5)
                            : [];
                        if (licenses.length === 0) return null;
                        return (
                            <div className="px-4 py-4 bg-white border-b border-stone-100">
                                <h3 className="font-serif text-base font-bold text-stone-800 mb-3">
                                    {language === 'id' ? 'Lisensi & Sertifikasi' : 'Licenses & certifications'}
                                </h3>
                                <p className="text-xs text-stone-500 mb-3">
                                    {language === 'id' ? 'Klik untuk memperbesar' : 'Tap to enlarge'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {licenses.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedLicenseCert(item)}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:ring-2 hover:ring-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-shrink-0"
                                        >
                                            <img src={item.imageUrl} alt={item.header} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_HERO_IMAGE; }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
                    {/* Profile card – name, tagline, actions */}
                    <div className="bg-white rounded-[20px] shadow-lg shadow-stone-200/60 overflow-hidden mb-6 border border-stone-100 -mt-2 relative z-10">
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <img
                                    src={(clinic.logo || '').trim() || DEFAULT_HERO_IMAGE}
                                    alt=""
                                    className="w-16 h-16 rounded-2xl border-2 border-amber-100 shadow-md object-cover flex-shrink-0"
                                    onError={(e) => {
                                        const el = e.currentTarget;
                                        if (el.src !== DEFAULT_HERO_IMAGE) el.src = DEFAULT_HERO_IMAGE;
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <h1 className="font-serif text-xl font-bold text-stone-800 tracking-tight">{clinic.name}</h1>
                                    <p className="text-stone-600 text-sm mt-0.5 line-clamp-2">{clinic.tagline || clinic.description?.slice(0, 120)}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 text-amber-600">
                                            <Star className="w-4 h-4 fill-amber-500" />
                                            <span className="font-semibold text-stone-800">{clinic.rating.toFixed(1)}</span>
                                        </span>
                                        <span className="text-stone-400">·</span>
                                        <span className="text-stone-500 text-sm">{clinic.reviewCount} reviews</span>
                                        {clinic.location && (
                                            <>
                                                <span className="text-stone-400">·</span>
                                                <span className="text-stone-500 text-sm flex items-center gap-0.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {clinic.location}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {(clinic.yearsInBusiness > 0 || (clinic.amenities?.length ?? 0) > 0) && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {clinic.yearsInBusiness > 0 && (
                                                <span className="text-xs bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5">{clinic.yearsInBusiness}+ years</span>
                                            )}
                                            {clinic.amenities?.slice(0, 3).map((a, i) => (
                                                <span key={i} className="text-xs bg-amber-50 text-amber-800 rounded-full px-2.5 py-0.5">{a}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <a
                                    href={buildWhatsAppUrl(`Hi, I would like to book at ${clinic.name}.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm shadow-md hover:brightness-110 transition"
                                >
                                    <Phone className="w-5 h-5" />
                                    Book Now
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setMenuSliderOpen(true)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-orange-700 shadow-md transition"
                                >
                                    View Menu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Point out the area on your body – 2 body images (front & back) + facial types link */}
                    <section className="mb-8">
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-lg shadow-stone-200/40 overflow-hidden">
                            <div className="p-4 border-b border-stone-100">
                                <h2 className="font-serif text-lg font-bold text-stone-800">
                                    {language === 'id' ? 'Tunjukkan area yang butuh perawatan' : 'Point out the area you need treatment'}
                                </h2>
                                <p className="text-sm text-stone-500 mt-0.5">
                                    {language === 'id' ? 'Gunakan gambar di bawah untuk mengkomunikasikan area tubuh atau masalah kulit dengan terapis wajah.' : 'Use the images below to communicate the body or skin area you want to focus on with your facial therapist.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 p-4">
                                <div className="relative rounded-xl overflow-hidden border border-stone-100 bg-stone-50 min-h-[320px] sm:min-h-[400px]">
                                    <img
                                        src="https://ik.imagekit.io/7grri5v7d/body%20front.png"
                                        alt={language === 'id' ? 'Tubuh depan – referensi area perawatan' : 'Body front – treatment area reference'}
                                        className="w-full h-full min-h-[320px] sm:min-h-[400px] object-cover object-top"
                                        loading="lazy"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/faf8f5/78716c?text=Front'; }}
                                    />
                                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1.5 rounded text-center">
                                        {language === 'id' ? 'Tubuh Depan' : 'Body Front'}
                                    </div>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50 min-h-[320px] sm:min-h-[400px] relative">
                                    <img
                                        src="https://ik.imagekit.io/7grri5v7d/body%20back.png"
                                        alt={language === 'id' ? 'Tubuh belakang – referensi area perawatan' : 'Body back – treatment area reference'}
                                        className="w-full h-full min-h-[320px] sm:min-h-[400px] object-cover object-top"
                                        loading="lazy"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/faf8f5/78716c?text=Back'; }}
                                    />
                                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1.5 rounded text-center">
                                        {language === 'id' ? 'Tubuh Belakang' : 'Body Back'}
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50">
                                <button
                                    type="button"
                                    onClick={() => onNavigate?.('facial-types')}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-amber-700 font-semibold text-sm hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    {language === 'id' ? 'Lihat direktori jenis facial' : 'View Facial Types directory'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Reviews */}
                    <div className="mb-8">
                        <RotatingReviews
                            location={clinic.location || ''}
                            limit={5}
                            providerId={clinic.id}
                            providerName={clinic.name}
                            providerType="facial-place"
                            providerImage={clinic.logo}
                            onNavigate={onNavigate}
                        />
                    </div>

                    {/* 6️⃣ Business information section */}
                    <section className="bg-white rounded-2xl border border-stone-100 shadow-lg shadow-stone-200/40 p-5 mb-8">
                        <h2 className="font-serif text-lg font-bold text-stone-800 mb-4">Clinic information</h2>
                        {/* Up to 5 thumbnail photos – click to open image with header and description */}
                        {(() => {
                            const photos: ClinicInfoPhoto[] = (clinic.clinicInfoPhotos && clinic.clinicInfoPhotos.length > 0)
                                ? clinic.clinicInfoPhotos.slice(0, 5)
                                : clinic.gallery.slice(0, 5).map((g) => ({ imageUrl: g.url, header: g.caption || 'Photo', description: '' }));
                            if (photos.length === 0) return null;
                            return (
                                <div className="mb-5">
                                    <div className="font-semibold text-stone-700 flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-amber-600" />
                                        Clinic photos
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {photos.map((photo, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedClinicPhoto(photo)}
                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:ring-2 hover:ring-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-shrink-0"
                                            >
                                                <img src={photo.imageUrl} alt={photo.header} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="space-y-4 text-sm">
                            {clinic.description && (
                                <div>
                                    <div className="font-semibold text-stone-700 flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        About the clinic
                                    </div>
                                    <p className="text-stone-600 leading-relaxed">{clinic.description}</p>
                                </div>
                            )}
                            {clinic.certifications?.length > 0 && (
                                <div>
                                    <div className="font-semibold text-stone-700 flex items-center gap-2 mb-1">
                                        <Award className="w-4 h-4 text-amber-600" />
                                        Certifications
                                    </div>
                                    <p className="text-stone-600">{clinic.certifications.join(' · ')}</p>
                                </div>
                            )}
                            {clinic.amenities?.length > 0 && (
                                <div>
                                    <div className="font-semibold text-stone-700 flex items-center gap-2 mb-1">
                                        <Shield className="w-4 h-4 text-amber-600" />
                                        Hygiene & facilities
                                    </div>
                                    <p className="text-stone-600">{clinic.amenities.join(', ')}</p>
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-stone-700 flex items-center gap-2 mb-1">
                                    <CreditCard className="w-4 h-4 text-amber-600" />
                                    Payment & policy
                                </div>
                                <p className="text-stone-600">Cash, transfer, card. Cancellation policy as per clinic.</p>
                            </div>
                            <div>
                                <div className="font-semibold text-stone-700 flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    Opening hours
                                </div>
                                <p className="text-stone-600">
                                    Weekdays: {clinic.operatingHours?.weekdays || '—'} · Weekend: {clinic.operatingHours?.weekend || '—'}
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold text-stone-700 flex items-center gap-2 mb-1">
                                    <Globe className="w-4 h-4 text-amber-600" />
                                    Languages
                                </div>
                                <p className="text-stone-600">
                                    {clinic.email && <span>{clinic.email}</span>}
                                    {clinic.email && ' · '}
                                    English, Indonesian
                                </p>
                            </div>
                        </div>
                    </section>

                    <IndastreetAchievements
                        therapistId={clinic.id}
                        therapistName={clinic.name}
                        isVerified={clinic.certifications?.length > 0}
                        mode="authenticated"
                        onViewAll={undefined}
                        language={(language || 'id') as 'en' | 'id' | 'gb'}
                    />
                    <div className="mt-6">
                        <SocialMediaLinks />
                    </div>
                </div>
            </div>

            {/* Quick Links Footer */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="mt-8 mb-6 flex flex-col items-center gap-2">
                    <div className="font-serif font-bold text-lg text-stone-700">
                        <span className="text-stone-800">Inda</span>
                        <span className="text-amber-600">Street</span>
                    </div>
                    <div className="mt-6 pt-6 border-t border-stone-200 w-full">
                        <h3 className="text-center font-serif font-bold text-stone-800 mb-3">Quick Links</h3>
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                            {['home', 'massage-types', 'facial-types', 'therapist-signup', 'place-signup', 'about-us', 'contact-us'].map((page, i) => (
                                <button key={page} type="button" onClick={() => onNavigate?.(page)} className="px-4 py-2 text-stone-600 hover:text-amber-600 transition-colors text-sm font-medium">
                                    {['Home', 'Massage Types', 'Facial Types', 'Join as Therapist', 'Join Place', 'About Us', 'Contact Us'][i]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Clinic photo lightbox – image, header, description */}
            {selectedClinicPhoto && (
                <div
                    className="fixed inset-0 z-[11000] bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setSelectedClinicPhoto(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="clinic-photo-title"
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedClinicPhoto(null)}
                            className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                            <img
                                src={selectedClinicPhoto.imageUrl}
                                alt={selectedClinicPhoto.header}
                                className="w-full object-contain max-h-[50vh] bg-stone-100"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_HERO_IMAGE; }}
                            />
                            <div className="p-4 flex-shrink-0">
                                <h3 id="clinic-photo-title" className="font-serif text-lg font-bold text-stone-800 mb-2">{selectedClinicPhoto.header}</h3>
                                {selectedClinicPhoto.description && (
                                    <p className="text-stone-600 text-sm leading-relaxed">{selectedClinicPhoto.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* License/cert lightbox – image, header, details */}
            {selectedLicenseCert && (
                <div
                    className="fixed inset-0 z-[11000] bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setSelectedLicenseCert(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="license-cert-title"
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedLicenseCert(null)}
                            className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                            <img
                                src={selectedLicenseCert.imageUrl}
                                alt={selectedLicenseCert.header}
                                className="w-full object-contain max-h-[50vh] bg-stone-100"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_HERO_IMAGE; }}
                            />
                            <div className="p-4 flex-shrink-0">
                                <h3 id="license-cert-title" className="font-serif text-lg font-bold text-stone-800 mb-2">{selectedLicenseCert.header}</h3>
                                {selectedLicenseCert.description && (
                                    <p className="text-stone-600 text-sm leading-relaxed">{selectedLicenseCert.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share profile popup */}
            <SocialSharePopup
                isOpen={showSharePopup}
                onClose={() => setShowSharePopup(false)}
                title={clinic.name}
                description={clinic.tagline || clinic.description?.slice(0, 120) || 'Facial & skin clinic'}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="facial"
                headerTitle={language === 'id' ? 'Bagikan profil klinik' : 'Share clinic profile'}
            />

            {/* 4️⃣ Bottom slider – clone of therapist profile price list modal */}
            {menuSliderOpen && (
                <div
                    className="fixed inset-0 z-[10000] bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={() => setMenuSliderOpen(false)}
                >
                    <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
                    <div
                        className="absolute bottom-0 left-0 right-0 h-full w-full bg-white transform transition-transform duration-300 ease-out"
                        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header – orange gradient with logo, name, rating (same as therapist) */}
                        <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0 z-10">
                            <div className="flex items-center gap-3 flex-1">
                                <img
                                    src={(clinic.logo || '').trim() || DEFAULT_HERO_IMAGE}
                                    alt={clinic.name}
                                    className="w-11 h-11 rounded-full border-2 border-white object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_HERO_IMAGE; }}
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-tight">{clinic.name}</h2>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                                        <span className="font-bold text-black bg-white/90 rounded px-1.5 py-0.5 shadow-sm">{clinic.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMenuSliderOpen(false)}
                                className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        {/* Service Prices row (same as therapist, no arrival for facial) */}
                        <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100">
                            <div className="text-sm sm:text-base font-bold text-gray-900">Service Prices</div>
                        </div>

                        {/* Price list content – card layout like therapist */}
                        <div className="flex-1 p-4 max-h-[70vh] overflow-y-auto">
                            <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                                <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        {language === 'id' ? 'Menu Facial' : 'Facial Menu'}
                                    </h2>
                                    <p className="text-gray-600">
                                        {language === 'id' ? 'Pilih layanan dan durasi, lalu pilih opsi pemesanan' : 'Select service and duration, then choose your booking option'}
                                    </p>
                                </div>

                                <div className="space-y-6 p-4">
                                    {clinic.treatments.map((t, index) => {
                                        const isRowSelected = menuSliderServiceIndex === index;
                                        const durations = (['60', '90', '120'] as const).filter(d => (t.prices as any)[`min${d}`] != null && (t.prices as any)[`min${d}`] > 0);

                                        return (
                                            <div
                                                key={t.id}
                                                className={`relative bg-white rounded-xl border-2 p-4 transition-all ${
                                                    isRowSelected ? 'border-orange-400 shadow-lg bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                                                }`}
                                            >
                                                <div className="mb-4 text-center">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t.name}</h3>
                                                    {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
                                                </div>

                                                <div className="mb-6">
                                                    <div className="flex flex-wrap justify-center gap-3">
                                                        {(['60', '90', '120'] as const).map((d) => {
                                                            const price = (t.prices as any)[`min${d}`];
                                                            const isSelected = isRowSelected && menuSliderDuration === d;
                                                            if (price == null || price === 0) return null;
                                                            return (
                                                                <button
                                                                    key={d}
                                                                    type="button"
                                                                    onClick={() => handleMenuSliderSelectService(index, d)}
                                                                    className={`flex-1 min-w-[100px] max-w-[140px] px-4 py-3 rounded-xl border-2 transition-all ${
                                                                        isSelected
                                                                            ? 'border-orange-500 bg-orange-500 text-white shadow-lg transform scale-105'
                                                                            : 'border-orange-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50'
                                                                    }`}
                                                                >
                                                                    <div className="text-center">
                                                                        <div className="text-sm font-semibold mb-1">{d} min</div>
                                                                        <div className="text-sm font-bold">Rp {Number(price).toLocaleString('id-ID')}</div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                        <a
                                                            href={buildWhatsAppUrl(
                                                                isRowSelected && menuSliderDuration
                                                                    ? `Hi, I would like to book ${t.name} (${menuSliderDuration} min) at ${clinic.name}.`
                                                                    : `Hi, I would like to book ${t.name} at ${clinic.name}.`
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-6 py-3 font-semibold rounded-lg transition-all duration-200 bg-orange-600 text-white hover:bg-orange-700 shadow-lg text-center"
                                                        >
                                                            {language === 'id' ? 'Book Now' : 'Book Now'}
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setMenuSliderOpen(false); setMenuSliderServiceIndex(null); setMenuSliderDuration(null); handleScheduleAppointment(t); }}
                                                            className="px-6 py-3 font-semibold rounded-lg border-2 border-orange-500 bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
                                                        >
                                                            <Calendar className="w-5 h-5" />
                                                            {language === 'id' ? 'Schedule' : 'Schedule'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5️⃣ Schedule appointment modal – calendar + time slots */}
            {scheduleModalOpen && scheduleForTreatment && (
                <>
                    <div className="fixed inset-0 bg-stone-900/40 z-40" onClick={() => setScheduleModalOpen(false)} aria-hidden />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-lg font-bold text-stone-800">Schedule: {scheduleForTreatment.name}</h3>
                            <button type="button" onClick={() => setScheduleModalOpen(false)} className="p-2 rounded-full hover:bg-stone-100">
                                <X className="w-5 h-5 text-stone-500" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <div className="text-sm font-semibold text-stone-700 mb-2">Select date</div>
                            <div className="flex flex-wrap gap-2">
                                {nextDays.map((d) => (
                                    <button
                                        key={d.toISOString()}
                                        type="button"
                                        onClick={() => setScheduleDate(d)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                                            scheduleDate?.toDateString() === d.toDateString()
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                        }`}
                                    >
                                        {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="text-sm font-semibold text-stone-700 mb-2">Select time</div>
                            <div className="flex flex-wrap gap-2">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setScheduleTime(time)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                                            scheduleTime === time ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleConfirmSchedule}
                            disabled={!scheduleDate || !scheduleTime}
                            className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-50"
                        >
                            Confirm & open WhatsApp
                        </button>
                    </div>
                </>
            )}

            {/* Booking Modal (legacy – duration select) */}
            {showBookingModal && selectedTreatment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] ">
                        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Book Treatment</h3>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <img
                                    src={selectedTreatment.image}
                                    alt={selectedTreatment.name}
                                    className="w-full h-48 object-cover rounded-xl mb-4"
                                />
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                                    {selectedTreatment.name}
                                </h4>
                                <p className="text-gray-600">{selectedTreatment.description}</p>
                            </div>

                            {/* Duration Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Select Duration
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[60, 90, 120].map((duration) => (
                                        <button
                                            key={duration}
                                            onClick={() => setSelectedDuration(duration as 60 | 90 | 120)}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                selectedDuration === duration
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                        >
                                            <div className="text-sm text-gray-600 mb-1">{duration} Min</div>
                                            <div className="font-bold text-orange-600">
                                                Rp {selectedTreatment.prices[`min${duration}` as keyof typeof selectedTreatment.prices].toLocaleString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={confirmBooking}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
                                >
                                    Confirm Booking
                                </button>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="max-w-4xl w-full">
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.caption}
                            className="w-full h-auto rounded-xl"
                        />
                        <p className="text-white text-center mt-4 text-lg">
                            {selectedImage.caption}
                        </p>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default FacialClinicProfilePage;
