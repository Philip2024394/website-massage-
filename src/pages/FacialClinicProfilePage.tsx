// Award-winning luxury skin clinic profile UI – conversion-focused, mobile-first
import React, { useState } from 'react';
import {
    MapPin, Phone, Star, Sparkles, Calendar, X, TrendingUp, Building,
    Clock, Award, Shield, CreditCard, FileText, Globe, Zap
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import CityLocationDropdown from '../components/CityLocationDropdown';
import MusicPlayer from '../components/MusicPlayer';
import RotatingReviews from '../components/RotatingReviews';
import SocialMediaLinks from '../components/SocialMediaLinks';
import IndastreetAchievements from '../components/IndastreetAchievements';
import HomeIcon from '../components/icons/HomeIcon';
import { getAuthAppUrl } from '../utils/therapistCardHelpers';

const DEFAULT_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1761918521382';

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
    const [menuSliderBookingType, setMenuSliderBookingType] = useState<'book-now' | 'scheduled'>('book-now');
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
                            onClick={() => { setActiveTab('facial-places'); onNavigate?.('facialProviders'); }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'facial-places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{language === 'id' ? 'Tempat Facial' : 'Facial Places'}</span>
                        </button>
                    </div>
                    <div className="flex flex-row gap-2 sm:gap-3 items-center max-w-2xl mx-auto mt-4 min-h-[54px]">
                        <button
                            type="button"
                            onClick={() => onNavigate?.('home')}
                            title={language === 'id' ? 'Pijat & tempat pijat' : 'Massage & massage places'}
                            aria-label="Massage"
                            className="flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300"
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
                            onClick={() => onNavigate?.('facialProviders')}
                            title={language === 'id' ? 'Facial Indonesia' : 'Facials Indonesia'}
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
                <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
                    {/* 1️⃣ Hero Profile Card – premium, clean, trust */}
                    <div className="bg-white rounded-[20px] shadow-lg shadow-stone-200/60 overflow-hidden mb-6 border border-stone-100">
                        <div className="relative aspect-[16/10] max-h-52 bg-stone-100">
                            <img
                                src={mainDisplayImages[selectedMainImageIndex]}
                                alt=""
                                className="w-full h-full object-cover object-center"
                                loading="eager"
                                onError={(e) => {
                                    const el = e.currentTarget;
                                    if (el.src !== DEFAULT_HERO_IMAGE) el.src = DEFAULT_HERO_IMAGE;
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-medium rounded-full px-2.5 py-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {joinedDisplay}
                            </div>
                        </div>
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
                                        src="https://ik.imagekit.io/7grri5v7d/body%20part%205.png?updatedAt=1770240547579"
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
                                        src="https://ik.imagekit.io/7grri5v7d/body%20part%204.png?updatedAt=1770240670476"
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
                                    Contact & languages
                                </div>
                                <p className="text-stone-600">
                                    {clinic.phone && <a href={`tel:${clinic.phone}`} className="text-amber-600 underline">{clinic.phone}</a>}
                                    {clinic.email && ` · ${clinic.email}`}
                                    {' · English, Indonesian'}
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

            {/* 4️⃣ Bottom slider – same as therapist: orange header, Book Now / Scheduled, then menu with Book Now + Schedule per item */}
            {menuSliderOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setMenuSliderOpen(false)} aria-hidden />
                    <div
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out_forwards]"
                        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
                        {/* Orange header – same as therapist price list modal */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-3xl sticky top-0 z-10">
                            <h3 className="text-lg font-bold text-white">{clinic.name} – Menu</h3>
                            <button type="button" onClick={() => setMenuSliderOpen(false)} className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black rounded-full transition-colors" aria-label="Close">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        {/* Book Now / Scheduled toggle – same as therapist slider */}
                        <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                            <div className="relative bg-gray-200 rounded-lg p-1">
                                <div
                                    className={`absolute top-1 left-1 w-1/2 h-[calc(100%-8px)] rounded-lg shadow transition-transform duration-300 ${
                                        menuSliderBookingType === 'scheduled'
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 translate-x-full'
                                            : 'bg-gradient-to-r from-orange-500 to-red-500 translate-x-0'
                                    }`}
                                />
                                <div className="relative grid grid-cols-2 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setMenuSliderBookingType('book-now')}
                                        className={`relative z-10 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                                            menuSliderBookingType === 'book-now' ? 'text-white' : 'text-gray-700 bg-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Zap className="w-5 h-5" />
                                            <span>Pesan Sekarang</span>
                                        </span>
                                        <span className="block text-xs opacity-90">Langsung</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMenuSliderBookingType('scheduled')}
                                        className={`relative z-10 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                                            menuSliderBookingType === 'scheduled' ? 'text-white' : 'text-gray-700 bg-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            <span>Terjadwal</span>
                                        </span>
                                        <span className="block text-xs opacity-90">Rencanakan</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 px-4 pb-6">
                            <div className="text-sm font-bold text-gray-900 py-2">Service Prices</div>
                            {clinic.treatments.map((t) => (
                                <div key={t.id} className="py-4 border-b border-stone-100 last:border-0">
                                    <div className="font-semibold text-stone-800">{t.name}</div>
                                    <p className="text-stone-500 text-sm mt-0.5">{t.description}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-stone-600">
                                        <span>60m: Rp {(t.prices.min60 || 0).toLocaleString()}</span>
                                        <span>90m: Rp {(t.prices.min90 || 0).toLocaleString()}</span>
                                        <span>120m: Rp {(t.prices.min120 || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {menuSliderBookingType === 'book-now' ? (
                                            <a
                                                href={buildWhatsAppUrl(`Hi, I would like to book ${t.name} at ${clinic.name}.`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition"
                                            >
                                                <Zap className="w-4 h-4" />
                                                Book Now
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => { setMenuSliderOpen(false); handleScheduleAppointment(t); }}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Schedule
                                            </button>
                                        )}
                                        {menuSliderBookingType === 'book-now' ? (
                                            <button
                                                type="button"
                                                onClick={() => { setMenuSliderOpen(false); handleScheduleAppointment(t); }}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold text-sm hover:bg-orange-50 transition"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Schedule
                                            </button>
                                        ) : (
                                            <a
                                                href={buildWhatsAppUrl(`Hi, I would like to book ${t.name} at ${clinic.name}.`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold text-sm hover:bg-orange-50 transition"
                                            >
                                                <Phone className="w-4 h-4" />
                                                Book Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
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
