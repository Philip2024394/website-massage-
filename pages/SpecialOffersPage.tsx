import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface SpecialOffersPageProps {
    t: any;
    language?: 'en' | 'id';
    onNavigate?: (page: string) => void;
}

const SpecialOffersPage: React.FC<SpecialOffersPageProps> = ({ t, language = 'en', onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language);

    const handleLanguageChange = (newLang: string) => {
        setCurrentLanguage(newLang as 'en' | 'id');
        console.log('Language changed to:', newLang);
    };

    // Translation object
    const translations = {
        en: {
            title: 'Special Offers',
            subtitle: 'Exclusive Discounts for New Customers',
            banners: {
                first120min: {
                    title: '7% OFF First 120min Booking',
                    subtitle: 'New Customer Special',
                    description: 'Get 7% discount on your first 120-minute massage booking - Book now or schedule for later',
                    code: 'FIRST120',
                    discount: 7,
                    terms: 'Valid for first-time 120min bookings only. Book now or schedule.',
                },
                firstScheduled: {
                    title: '10% OFF First Scheduled Booking',
                    subtitle: 'Plan Ahead & Save',
                    description: 'Book in advance and get 10% off your first scheduled massage session',
                    code: 'SCHEDULE10',
                    discount: 10,
                    terms: 'Valid for first scheduled booking only. Must be booked in advance.',
                },
                hotelVilla: {
                    title: '8% OFF Hotel & Villa Service',
                    subtitle: 'Location Service Discount',
                    description: 'Special discount for your first hotel or villa massage booking service',
                    code: 'LOCATION8',
                    discount: 8,
                    terms: 'Valid for first hotel or villa booking service only.',
                },
                coming1: {
                    title: '5% OFF First Time User Booking',
                    subtitle: 'New User Welcome',
                    description: 'Special 5% discount for your very first booking with us',
                    code: 'NEWUSER5',
                    discount: 5,
                    terms: 'Valid for first-time users only. One-time use per account.',
                },
                coming2: {
                    title: '5% OFF First Coin Rub Service',
                    subtitle: 'Traditional Wellness',
                    description: 'Get 5% discount on your first traditional coin rub massage therapy',
                    code: 'COINRUB5',
                    discount: 5,
                    terms: 'Valid for first coin rub service booking only.',
                },
                coming3: {
                    title: '10% OFF Traditional Massage',
                    subtitle: 'Heritage Therapy',
                    description: 'Enjoy 10% discount on authentic traditional massage treatments',
                    code: 'TRADITIONAL10',
                    discount: 10,
                    terms: 'Valid for traditional massage bookings only.',
                }
            },
            viewDetails: 'View Details',
            copyCode: 'Copy Code',
            codeCopied: 'Code Copied!',
            bookNow: 'Book Now',
            terms: 'Terms & Conditions',
            validUntil: 'Valid Until',
            originalPrice: 'Original Price',
            discountedPrice: 'Your Price',
            savings: 'You Save',
            comingSoon: 'Coming Soon',
            howItWorks: 'How Our Discounts Work'
        },
        id: {
            title: 'Penawaran Khusus',
            subtitle: 'Diskon Eksklusif untuk Pelanggan Baru',
            banners: {
                first120min: {
                    title: 'DISKON 7% Pemesanan 120min Pertama',
                    subtitle: 'Khusus Pelanggan Baru',
                    description: 'Dapatkan diskon 7% untuk pemesanan pijat 120 menit pertama - Pesan sekarang atau jadwalkan nanti',
                    code: 'FIRST120',
                    discount: 7,
                    terms: 'Berlaku untuk pemesanan 120min pertama saja. Pesan sekarang atau jadwalkan.',
                },
                firstScheduled: {
                    title: 'DISKON 10% Pemesanan Terjadwal Pertama',
                    subtitle: 'Rencanakan & Hemat',
                    description: 'Pesan di muka dan dapatkan diskon 10% untuk sesi pijat terjadwal pertama',
                    code: 'SCHEDULE10',
                    discount: 10,
                    terms: 'Berlaku untuk pemesanan terjadwal pertama saja. Harus dipesan di muka.',
                },
                hotelVilla: {
                    title: 'DISKON 8% Layanan Hotel & Villa',
                    subtitle: 'Diskon Layanan Lokasi',
                    description: 'Diskon khusus untuk pemesanan layanan pijat hotel atau villa pertama',
                    code: 'LOCATION8',
                    discount: 8,
                    terms: 'Berlaku untuk layanan pemesanan hotel atau villa pertama saja.',
                },
                coming1: {
                    title: 'DISKON 5% Pengguna Baru Pertama',
                    subtitle: 'Selamat Datang Pengguna Baru',
                    description: 'Diskon khusus 5% untuk pemesanan pertama Anda bersama kami',
                    code: 'NEWUSER5',
                    discount: 5,
                    terms: 'Berlaku untuk pengguna baru saja. Sekali pakai per akun.',
                },
                coming2: {
                    title: 'DISKON 5% Kerokan Pertama',
                    subtitle: 'Terapi Tradisional',
                    description: 'Dapatkan diskon 5% untuk layanan kerokan tradisional pertama Anda',
                    code: 'COINRUB5',
                    discount: 5,
                    terms: 'Berlaku untuk pemesanan kerokan pertama saja.',
                },
                coming3: {
                    title: 'DISKON 10% Pijat Tradisional',
                    subtitle: 'Terapi Warisan',
                    description: 'Nikmati diskon 10% untuk perawatan pijat tradisional otentik',
                    code: 'TRADITIONAL10',
                    discount: 10,
                    terms: 'Berlaku untuk pemesanan pijat tradisional saja.',
                }
            },
            viewDetails: 'Lihat Detail',
            copyCode: 'Salin Kode',
            codeCopied: 'Kode Tersalin!',
            bookNow: 'Pesan Sekarang',
            terms: 'Syarat & Ketentuan',
            validUntil: 'Berlaku Hingga',
            originalPrice: 'Harga Asli',
            discountedPrice: 'Harga Anda',
            savings: 'Anda Hemat',
            comingSoon: 'Segera Hadir',
            howItWorks: 'Cara Kerja Diskon Kami'
        }
    };

    // Base prices in IDR
    const basePrices = {
        '60min': 250000,
        '90min': 350000,
        '120min': 450000
    };

    // Banner configurations - 3 active + 3 coming soon
    const banners = [
        {
            id: 'first120min',
            ...translations[currentLanguage].banners.first120min,
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%206.png?updatedAt=1768188016171',
            gradient: 'from-orange-500 to-red-500',
            validUntil: 'Dec 31, 2025',
            isActive: true
        },
        {
            id: 'firstScheduled',
            ...translations[currentLanguage].banners.firstScheduled,
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%205.png?updatedAt=1768187997348',
            gradient: 'from-blue-500 to-purple-500',
            validUntil: 'Dec 31, 2025',
            isActive: true
        },
        {
            id: 'hotelVilla',
            ...translations[currentLanguage].banners.hotelVilla,
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%204.png?updatedAt=1768187976606',
            gradient: 'from-green-500 to-emerald-500',
            validUntil: 'Dec 31, 2025',
            isActive: true
        },
        {
            id: 'coming1',
            ...translations[currentLanguage].banners.coming1,
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%203.png?updatedAt=1768187957138',
            gradient: 'from-purple-500 to-indigo-500',
            validUntil: 'Dec 31, 2025',
            isActive: true
        },
        {
            id: 'coming2',
            ...translations[currentLanguage].banners.coming2,
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%202.png?updatedAt=1768187936659',
            gradient: 'from-teal-500 to-cyan-500',
            validUntil: 'Dec 31, 2025',
            isActive: true
        },
        {
            id: 'coming3',
            ...translations[currentLanguage].banners.coming3,
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%201.png?updatedAt=1768187912094',
            gradient: 'from-amber-500 to-yellow-500',
            validUntil: 'Dec 31, 2025',
            isActive: true
        }
    ];

    const calculatePrice = (duration: string, discount: number) => {
        const basePrice = basePrices[duration as keyof typeof basePrices] || 250000;
        const discountAmount = Math.floor(basePrice * discount / 100);
        const finalPrice = basePrice - discountAmount;
        
        // Admin commission: 30% deducted from discount amount
        const adminCommission = Math.floor(discountAmount * 0.3);
        const therapistReceives = basePrice - adminCommission;
        
        return {
            original: basePrice,
            discount: discountAmount,
            final: finalPrice,
            adminCommission,
            therapistReceives
        };
    };

    const handleCopyCode = (code: string) => {
        if (code === 'COMING') return; // Don't copy placeholder codes
        
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen bg-white w-full max-w-[100vw] overflow-x-hidden">
            {/* Universal Header */}
            <UniversalHeader 
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* App Drawer */}
            {isMenuOpen && (
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    currentLanguage={currentLanguage}
                    onNavigate={onNavigate}
                />
            )}

            {/* Main Content */}
            <div className="pt-[60px] px-3 sm:px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Arrow Button */}
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="mt-5 mb-4 ml-2 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 will-change-transform"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Header Section - Minimalistic */}
                    <div className="text-center mb-8 -mt-10">
                        {/* Logo Image */}
                        <div className="mb-4">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258"
                                alt="IndasStreet Massage Logo"
                                className="w-60 h-60 mx-auto object-contain"
                            />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{translations[currentLanguage].title}</h1>
                        <p className="text-gray-600">{translations[currentLanguage].subtitle}</p>
                    </div>

                    {/* Banners Grid - Clean Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {banners.map((banner, index) => (
                            <div 
                                key={banner.id} 
                                className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
                                    banner.isActive 
                                        ? 'hover:shadow-md hover:border-orange-200' 
                                        : 'opacity-75'
                                }`}
                            >
                                {/* Banner Image */}
                                <div className="relative h-40 sm:h-48 overflow-hidden">
                                    <img 
                                        src={banner.image} 
                                        alt={banner.title}
                                        className={`w-full h-full object-cover transition-transform duration-300 ${
                                            banner.isActive ? 'hover:scale-105' : 'grayscale'
                                        }`}
                                    />
                                    {banner.isActive ? (
                                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            {banner.discount}% OFF
                                        </div>
                                    ) : (
                                        <div className="absolute top-3 left-3 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            {translations[language].comingSoon}
                                        </div>
                                    )}
                                </div>

                                {/* Banner Content - Clean Spacing */}
                                <div className="p-4 sm:p-5">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{banner.title}</h3>
                                    <p className="text-orange-600 font-medium text-sm mb-2">{banner.subtitle}</p>
                                    <p className="text-gray-600 text-sm mb-4">{banner.description}</p>
                                    
                                    {banner.isActive && (
                                        <>
                                            {/* Discount Code - Prominent Display */}
                                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                                                <div className="text-xs text-gray-600 mb-1">{translations[language].copyCode}</div>
                                                <div className="text-xl font-bold text-orange-600 mb-2">{banner.code}</div>
                                                <button
                                                    onClick={() => handleCopyCode(banner.code)}
                                                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                                        copiedCode === banner.code 
                                                            ? 'bg-green-500 text-white border-2 border-green-600' 
                                                            : 'bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-600'
                                                    }`}
                                                >
                                                    {copiedCode === banner.code ? translations[language].codeCopied : translations[language].copyCode}
                                                </button>
                                            </div>

                                            {/* Terms */}
                                            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-600">
                                                    <strong>{translations[language].terms}:</strong> {banner.terms}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {!banner.isActive && (
                                        <div className="text-center py-4">
                                            <div className="text-gray-400 text-sm">{translations[language].comingSoon}</div>
                                        </div>
                                    )}

                                    {/* Valid Until - Subtle */}
                                    <div className="mt-3 text-xs text-gray-500 text-center">
                                        {banner.isActive ? `${translations[language].validUntil}: ${banner.validUntil}` : banner.validUntil}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16">
                    <FloatingPageFooter 
                        currentLanguage={currentLanguage}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>
        </div>
    );
};

export default SpecialOffersPage;
