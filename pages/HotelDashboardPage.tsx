import React, { useMemo, useState } from 'react';
import { Building, Image as ImageIcon, Link as LinkIcon, LogOut, Menu, MessageSquare, Phone, QrCode, Star, Tag, User, Users, X } from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import ImageUpload from '../components/ImageUpload';
// import Header from '../components/dashboard/Header';
import StatCard from '../components/dashboard/StatCard';
import TabButton from '../components/dashboard/TabButton';
import Section from '../components/dashboard/Section';

type DurationKey = '60' | '90' | '120';
type ProviderType = 'therapist' | 'place';
interface ProviderCard {
    id: string | number;
    name: string;
    type: ProviderType;
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    pricing: Record<DurationKey, number>;
    discount: number; // percent
    whatsappNumber?: string;
    description: string;
}

interface HotelDashboardPageProps {
    onLogout: () => void;
    therapists?: Therapist[];
    places?: Place[];
}

const HotelDashboardPage: React.FC<HotelDashboardPageProps> = ({ onLogout, therapists = [], places = [] }) => {
    const [activeTab, setActiveTab] = useState<'analytics' | 'discounts' | 'profile' | 'menu' | 'feedback' | 'concierge' | 'commissions'>('analytics');
    const [allowRoomCharges, setAllowRoomCharges] = useState(false);
    const [customWelcomeMessage, setCustomWelcomeMessage] = useState('Welcome to our exclusive wellness experience');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    // Removed sidebar state as sidebar is no longer used

    const placeholderImage =
        'https://images.unsplash.com/photo-1600959907703-125ba1374a12?q=80&w=1200&auto=format&fit=crop';

    // Build a read-only list of providers that offer hotel discounts (no editing here)
    const providers = useMemo<ProviderCard[]>(() => {
        const list: ProviderCard[] = [];
        const add = (item: Therapist | Place, type: ProviderType) => {
            const status = item.hotelVillaServiceStatus ?? HotelVillaServiceStatus.NotOptedIn;
            const discount = (item as any).hotelDiscount || 0;
            if (status === HotelVillaServiceStatus.OptedIn && discount > 0) {
                const pricing = parsePricing(item.pricing) as Record<DurationKey, number>;
                list.push({
                    id: item.id,
                    name: item.name,
                    type,
                    image: (type === 'therapist' ? (item as any).profilePicture : (item as any).mainImage) || placeholderImage,
                    location: (item as any).location,
                    rating: (item as any).rating,
                    reviewCount: (item as any).reviewCount,
                    pricing,
                    discount,
                    whatsappNumber: (item as any).whatsappNumber,
                    description: (item as any).description,
                });
            }
        };
        therapists.forEach(t => add(t, 'therapist'));
        places.forEach(p => add(p, 'place'));
        return list;
    }, [therapists, places]);

    // Mock providers for preview when no data is available
    const mockProviders: ProviderCard[] = [
        {
            id: 't-001',
            name: 'Ayu Prameswari',
            type: 'therapist',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
            location: 'Kuta, Bali',
            rating: 4.9,
            reviewCount: 128,
            pricing: { '60': 250000, '90': 350000, '120': 450000 },
            discount: 15,
            whatsappNumber: '+628123456789',
            description: 'Certified Balinese therapist specializing in deep tissue and relaxation massage.',
        },
        {
            id: 'p-001',
            name: 'Serenity Spa & Wellness',
            type: 'place',
            image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1200&auto=format&fit=crop',
            location: 'Seminyak, Bali',
            rating: 4.7,
            reviewCount: 256,
            pricing: { '60': 300000, '90': 420000, '120': 520000 },
            discount: 20,
            description: 'Modern wellness center offering aromatherapy and traditional Balinese treatments.',
        },
    ];

    const displayProviders = providers.length ? providers : mockProviders;

    const stats = useMemo(() => {
        const count = providers.length;
        const avg = count ? Math.round(providers.reduce((s, p) => s + p.discount, 0) / count) : 0;
        const top = count ? Math.max(...providers.map(p => p.discount)) : 0;
        return { partners: count, avgDiscount: avg, topDiscount: top };
    }, [providers]);

    // Hotel profile / shared menu header data (local preview)
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [hotelName, setHotelName] = useState<string>('Your Hotel Name');
    const [hotelAddress, setHotelAddress] = useState<string>('Your Hotel Address');
    const [hotelPhone, setHotelPhone] = useState<string>('+62 123 456 789');

    const [qrOpen, setQrOpen] = useState(false);
    const [qrLink, setQrLink] = useState('');

    const openQrFor = (link: string) => {
        setQrLink(link);
        setQrOpen(true);
    };

    const downloadQR = () => {
        const qrUrl = `https://chart.googleapis.com/chart?chs=600x600&cht=qr&chl=${encodeURIComponent(qrLink)}&choe=UTF-8`;
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `${hotelName.replace(/\s+/g, '-')}-menu-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareWhatsApp = () => {
        const message = `Check out our wellness menu: ${qrLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const DiscountCard: React.FC<{ data: ProviderCard }> = ({ data: p }) => {
        const menuUrl = typeof window !== 'undefined' ? window.location.href : '';
        const providerMenuUrl = `${menuUrl}?provider=${encodeURIComponent(`${p.type}-${p.id}`)}`;

        return (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col transition-transform transform hover:scale-[1.02]">
                <div className="relative">
                    <img src={p.image || placeholderImage} alt={p.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 right-4 bg-brand-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">
                        {p.discount}% OFF
                    </div>
                    <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full p-4">
                        <h3 className="font-bold text-white text-xl">{p.name}</h3>
                        <p className="text-xs text-gray-200">{p.location}</p>
                    </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-yellow-500">
                            <Star className="w-5 h-5" fill="currentColor" />
                            <span className="text-sm font-bold ml-1.5">{p.rating}</span>
                            <span className="text-xs text-gray-500 ml-2">({p.reviewCount} reviews)</span>
                        </div>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                            {p.type}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-5 flex-grow">{p.description}</p>

                    <div className="grid grid-cols-3 gap-3 text-sm mb-5">
                        {(['60','90','120'] as DurationKey[]).map((d) => (
                            <div key={d} className="text-center p-3 bg-gray-50 rounded-lg border">
                                <div className="text-xs text-gray-500">{d} min</div>
                                <div className="line-through text-gray-400 text-xs">Rp {p.pricing[d].toLocaleString()}</div>
                                <div className="font-bold text-brand-600 text-base">Rp {Math.round(p.pricing[d] * (1 - p.discount/100)).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                        <button onClick={() => openQrFor(providerMenuUrl)} className="flex-1 text-center px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-all flex items-center justify-center gap-2">
                            <QrCode size={16} />
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'analytics':
                return (
                    <div className="space-y-6">
                        {/* Analytics Overview */}
                        <Section title="Performance Analytics" description="Track your guest engagement and service usage">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                            <QrCode className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-3 py-1 rounded-full">This Month</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900">1,247</h3>
                                    <p className="text-sm text-gray-600 mt-1">QR Code Scans</p>
                                    <div className="mt-4 flex items-center text-sm">
                                        <span className="text-green-600 font-semibold">↑ 12%</span>
                                        <span className="text-gray-500 ml-2">vs last month</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xs font-semibold text-purple-600 bg-purple-200 px-3 py-1 rounded-full">Unique</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900">892</h3>
                                    <p className="text-sm text-gray-600 mt-1">Guest Views</p>
                                    <div className="mt-4 flex items-center text-sm">
                                        <span className="text-green-600 font-semibold">↑ 8%</span>
                                        <span className="text-gray-500 ml-2">vs last month</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-orange-600 bg-orange-200 px-3 py-1 rounded-full">Total</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900">143</h3>
                                    <p className="text-sm text-gray-600 mt-1">Bookings Made</p>
                                    <div className="mt-4 flex items-center text-sm">
                                        <span className="text-green-600 font-semibold">↑ 24%</span>
                                        <span className="text-gray-500 ml-2">vs last month</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                            <Star className="w-6 h-6 text-white" fill="currentColor" />
                                        </div>
                                        <span className="text-xs font-semibold text-green-600 bg-green-200 px-3 py-1 rounded-full">Average</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
                                    <p className="text-sm text-gray-600 mt-1">Guest Rating</p>
                                    <div className="mt-4 flex items-center text-sm">
                                        <span className="text-green-600 font-semibold">↑ 0.2</span>
                                        <span className="text-gray-500 ml-2">vs last month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Top Providers */}
                            <div className="mt-8 bg-white border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Providers</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Ayu Prameswari', type: 'Therapist', bookings: 45, rating: 4.9 },
                                        { name: 'Serenity Spa', type: 'Place', bookings: 38, rating: 4.8 },
                                        { name: 'Made Wijaya', type: 'Therapist', bookings: 32, rating: 4.7 },
                                    ].map((provider, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{provider.name}</p>
                                                    <p className="text-xs text-gray-500">{provider.type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{provider.bookings} bookings</p>
                                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="font-semibold">{provider.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Peak Hours Chart */}
                            <div className="mt-8 bg-white border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Booking Hours</h3>
                                <div className="grid grid-cols-12 gap-2 items-end h-40">
                                    {[20, 35, 45, 60, 80, 95, 100, 85, 70, 50, 30, 15].map((height, idx) => (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div 
                                                className="w-full bg-gradient-to-t from-brand-500 to-brand-300 rounded-t-lg hover:from-brand-600 hover:to-brand-400 transition-all cursor-pointer"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="text-xs text-gray-500 mt-2">{idx + 9}h</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Section>
                    </div>
                );
            case 'discounts':
                return (
                    <Section
                        title="Discounted Therapists & Places"
                        description="All available massage therapists and places offering discounts for your guests."
                    >
                        {providers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {displayProviders.map((p) => (
                                    <DiscountCard key={`${p.type}-${p.id}`} data={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-xl font-semibold text-gray-800">No Discounted Partners Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">When therapists or massage places in the IndoStreet network offer a special discount for your guests, they will automatically appear here.</p>
                            </div>
                        )}
                    </Section>
                );
            case 'profile':
                return (
                    <Section title="Hotel Profile Setup" description="Set up your hotel branding and contact details.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUpload id="hotel-main" label="Banner Image" currentImage={mainImage} onImageChange={setMainImage} heightClass="h-48" />
                            <ImageUpload id="hotel-profile" label="Logo / Profile Picture" currentImage={profileImage} onImageChange={setProfileImage} heightClass="h-48" />
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="w-full p-3 border rounded-lg" placeholder="Hotel/Villa Name" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
                            <input className="w-full p-3 border rounded-lg" placeholder="Address or Location" value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} />
                        </div>
                        <div className="mt-4">
                            <input className="w-full p-3 border rounded-lg" placeholder="Contact Phone (optional)" value={hotelPhone} onChange={(e) => setHotelPhone(e.target.value)} />
                        </div>

                        {/* Custom Welcome Message */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl border border-orange-500/30 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                            {/* Glass effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg ring-2 ring-orange-500/20">
                                        <MessageSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">
                                        Custom Welcome Message
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                    Create a personalized greeting that appears on your guest menu. Make your guests feel special with a warm, customized welcome.
                                </p>
                                <textarea
                                    className="w-full p-4 bg-white/5 backdrop-blur-md border border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px] text-white placeholder-gray-400 shadow-inner"
                                    placeholder="e.g., Welcome to Paradise Resort! Enjoy exclusive wellness services designed just for you..."
                                    value={customWelcomeMessage}
                                    onChange={(e) => setCustomWelcomeMessage(e.target.value)}
                                />
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 font-medium">{customWelcomeMessage.length} / 500 characters</span>
                                    <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/50 transform hover:scale-105">
                                        Preview Message
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Multi-Language Support */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Multi-Language Support</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Automatically translate your menu into multiple languages for international guests. Select which languages to enable:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { code: 'en', name: 'English', flag: '🇬🇧' },
                                    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
                                    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
                                    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
                                    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
                                    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
                                    { code: 'fr', name: 'French', flag: '🇫🇷' },
                                    { code: 'de', name: 'German', flag: '🇩🇪' },
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setSelectedLanguage(lang.code)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            selectedLanguage === lang.code
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{lang.flag}</div>
                                        <div className="text-xs font-semibold text-gray-700">{lang.name}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-xs text-gray-600">
                                        <strong className="text-green-700">Currently Active:</strong> English, Indonesian • Guest menus will auto-detect browser language and display accordingly.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Room Billing Toggle */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Room Billing Integration</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Allow guests to charge massage services directly to their room bill. When enabled, guests can select their room number during booking and the charges will be added to their account.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">Requires integration with your Property Management System (PMS)</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => setAllowRoomCharges(!allowRoomCharges)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shadow-inner ${
                                            allowRoomCharges ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                                                allowRoomCharges ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <div className={`mt-2 text-xs font-semibold text-center ${allowRoomCharges ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {allowRoomCharges ? 'Enabled' : 'Disabled'}
                                    </div>
                                </div>
                            </div>
                            {allowRoomCharges && (
                                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Integration Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="PMS System Name (e.g., Opera, Mews)" 
                                            className="p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="API Endpoint URL" 
                                            className="p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="API Key" 
                                            className="p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Department Code" 
                                            className="p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                        Test Connection
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-right">
                            <button className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-600">Save Changes</button>
                        </div>
                    </Section>
                );
            case 'menu':
                return (
                    <Section
                        title="Guest Menu"
                        description="This is the menu your guests will see, with your branding and all available therapists and places."
                        actions={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <LinkIcon size={16} />
                                    Copy Link
                                </button>
                                <button onClick={() => openQrFor(window.location.href)} className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium flex items-center gap-2">
                                    <QrCode size={16} />
                                    Show QR
                                </button>
                            </div>
                        }
                    >
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-8">
                            <div className="w-full h-32 rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                                {mainImage ? <img src={mainImage} alt="main" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-4 border-white -mt-10 shadow-md flex-shrink-0">
                                    {profileImage ? <img src={profileImage} alt="profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24}/></div>}
                                </div>
                                <div className="flex-grow">
                                    <div className="font-bold text-gray-900 text-lg truncate">{hotelName}</div>
                                    <div className="text-xs text-gray-600 flex items-center gap-1.5"><Building size={12}/> {hotelAddress}</div>
                                    {hotelPhone && <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5"><Phone size={12}/> {hotelPhone}</div>}
                                </div>
                            </div>
                        </div>
                        {providers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {displayProviders.map((p) => (
                                    <DiscountCard key={`${p.type}-${p.id}`} data={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-xl font-semibold text-gray-800">No Discounted Partners Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">When therapists or massage places in the IndoStreet network offer a special discount for your guests, they will automatically appear here.</p>
                            </div>
                        )}
                    </Section>
                );
            case 'feedback':
                return (
                    <Section title="Guest Feedback & Ratings" description="Monitor guest satisfaction and provider performance">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                                        <Star className="w-6 h-6 text-white" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
                                        <p className="text-xs text-gray-600">Average Rating</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <div key={stars} className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600 w-6">{stars}★</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    style={{ width: `${stars === 5 ? 85 : stars === 4 ? 10 : 3}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{stars === 5 ? '85%' : stars === 4 ? '10%' : '3%'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Recent Guest Feedback</h3>
                                <div className="space-y-4">
                                    {[
                                        { guest: 'Room 302', provider: 'Ayu Prameswari', rating: 5, comment: 'Absolutely wonderful massage! Very professional and relaxing.', date: '2 hours ago' },
                                        { guest: 'Room 105', provider: 'Serenity Spa', rating: 5, comment: 'Best spa experience in Bali. Highly recommend!', date: '5 hours ago' },
                                        { guest: 'Room 218', provider: 'Made Wijaya', rating: 4, comment: 'Great massage, arrived on time and very skilled.', date: '1 day ago' },
                                    ].map((feedback, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{feedback.provider}</p>
                                                    <p className="text-xs text-gray-500">{feedback.guest} • {feedback.date}</p>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}
                                                            fill="currentColor"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700">{feedback.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Provider Performance Summary</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Provider</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Services</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Rating</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Reviews</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'Ayu Prameswari', type: 'Therapist', services: 45, rating: 4.9, reviews: 42, status: 'excellent' },
                                            { name: 'Serenity Spa', type: 'Place', services: 38, rating: 4.8, reviews: 35, status: 'excellent' },
                                            { name: 'Made Wijaya', type: 'Therapist', services: 32, rating: 4.7, reviews: 28, status: 'good' },
                                        ].map((provider, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{provider.name}</p>
                                                        <p className="text-xs text-gray-500">{provider.type}</p>
                                                    </div>
                                                </td>
                                                <td className="text-center py-4 px-4 font-semibold text-gray-900">{provider.services}</td>
                                                <td className="text-center py-4 px-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Star size={14} className="text-yellow-400" fill="currentColor" />
                                                        <span className="font-semibold text-gray-900">{provider.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center py-4 px-4 text-gray-600">{provider.reviews}</td>
                                                <td className="text-center py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        provider.status === 'excellent' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {provider.status === 'excellent' ? '⭐ Excellent' : '👍 Good'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Section>
                );
            case 'concierge':
                return (
                    <Section title="Concierge Dashboard" description="Manage guest requests and coordinate with service providers">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Actions */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="bg-white border rounded-2xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button className="w-full p-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg font-medium hover:from-brand-600 hover:to-brand-700 transition-all flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            New Booking Request
                                        </button>
                                        <button className="w-full p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                                            <Phone className="w-5 h-5" />
                                            Call Provider
                                        </button>
                                        <button className="w-full p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            Send Message
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-3">Today's Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Pending</span>
                                            <span className="font-bold text-orange-600">3</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Confirmed</span>
                                            <span className="font-bold text-green-600">8</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">In Progress</span>
                                            <span className="font-bold text-blue-600">2</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Completed</span>
                                            <span className="font-bold text-gray-600">12</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Requests */}
                            <div className="lg:col-span-2">
                                <div className="bg-white border rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900">Active Service Requests</h3>
                                        <select className="px-3 py-1.5 border rounded-lg text-sm">
                                            <option>All Status</option>
                                            <option>Pending</option>
                                            <option>Confirmed</option>
                                            <option>In Progress</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { room: '302', guest: 'John Smith', provider: 'Ayu Prameswari', time: '14:00', service: '90 min', status: 'pending' },
                                            { room: '105', guest: 'Maria Garcia', provider: 'Serenity Spa', time: '15:30', service: '120 min', status: 'confirmed' },
                                            { room: '218', guest: 'David Chen', provider: 'Made Wijaya', time: 'Now', service: '60 min', status: 'inprogress' },
                                        ].map((request, idx) => (
                                            <div key={idx} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 font-bold">
                                                            {request.room}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{request.guest}</p>
                                                            <p className="text-sm text-gray-600">{request.provider}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{request.time} • {request.service}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        request.status === 'pending' 
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : request.status === 'confirmed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {request.status === 'pending' ? '⏳ Pending' : request.status === 'confirmed' ? '✓ Confirmed' : '🔄 In Progress'}
                                                    </span>
                                                </div>
                                                {request.status === 'pending' && (
                                                    <div className="flex gap-2 mt-3 pt-3 border-t">
                                                        <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                                                            Confirm
                                                        </button>
                                                        <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                                                            Reschedule
                                                        </button>
                                                        <button className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>
                );
            case 'commissions':
                return (
                    <Section title="Commission Tracking" description="Monitor your earnings from service bookings">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">This Month</p>
                                        <h3 className="text-2xl font-bold text-gray-900">Rp 4.2M</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-green-600 font-medium">↑ 18% vs last month</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Pending</p>
                                        <h3 className="text-2xl font-bold text-gray-900">Rp 890K</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">From 12 bookings</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Avg Commission</p>
                                        <h3 className="text-2xl font-bold text-gray-900">12%</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Per booking</p>
                            </div>
                        </div>

                        <div className="bg-white border rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Recent Commission Transactions</h3>
                                <button className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                                    Export Report
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Provider</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Service Amount</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Commission</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { date: 'Oct 25, 2025', provider: 'Ayu Prameswari', service: '90 min', amount: 350000, rate: 12, commission: 42000, status: 'paid' },
                                            { date: 'Oct 25, 2025', provider: 'Serenity Spa', service: '120 min', amount: 520000, rate: 12, commission: 62400, status: 'paid' },
                                            { date: 'Oct 26, 2025', provider: 'Made Wijaya', service: '60 min', amount: 250000, rate: 12, commission: 30000, status: 'pending' },
                                            { date: 'Oct 26, 2025', provider: 'Ayu Prameswari', service: '120 min', amount: 450000, rate: 12, commission: 54000, status: 'pending' },
                                        ].map((transaction, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="py-4 px-4 text-sm text-gray-600">{transaction.date}</td>
                                                <td className="py-4 px-4 text-sm font-medium text-gray-900">{transaction.provider}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{transaction.service}</td>
                                                <td className="py-4 px-4 text-sm text-right text-gray-900">Rp {transaction.amount.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-sm text-center text-gray-600">{transaction.rate}%</td>
                                                <td className="py-4 px-4 text-sm text-right font-semibold text-green-600">Rp {transaction.commission.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        transaction.status === 'paid' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {transaction.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Commission Structure</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            You earn <strong className="text-brand-600">12% commission</strong> on all completed bookings. Commissions are calculated automatically and paid out monthly. Pending commissions will be processed within 48 hours of service completion.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>
                );
        }
    };

    return (

        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-gray-900">Indo</span><span className="text-brand-500">street</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <TabButton
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            label="Analytics"
                            isActive={activeTab === 'analytics'}
                            onClick={() => setActiveTab('analytics')}
                        />
                        <TabButton
                            icon={<Tag size={20} />}
                            label="Discounts"
                            isActive={activeTab === 'discounts'}
                            onClick={() => setActiveTab('discounts')}
                        />
                        <TabButton
                            icon={<User size={20} />}
                            label="Profile"
                            isActive={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <TabButton
                            icon={<Menu size={20} />}
                            label="Menu"
                            isActive={activeTab === 'menu'}
                            onClick={() => setActiveTab('menu')}
                            badge={providers.length}
                        />
                        <TabButton
                            icon={<Star size={20} />}
                            label="Feedback"
                            isActive={activeTab === 'feedback'}
                            onClick={() => setActiveTab('feedback')}
                        />
                        <TabButton
                            icon={<Users size={20} />}
                            label="Concierge"
                            isActive={activeTab === 'concierge'}
                            onClick={() => setActiveTab('concierge')}
                        />
                        <TabButton
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            label="Commissions"
                            isActive={activeTab === 'commissions'}
                            onClick={() => setActiveTab('commissions')}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-gray-800">{hotelName}</p>
                        <p className="text-xs text-gray-500">Hotel Partner</p>
                    </div>
                    <img
                        src={profileImage || 'https://ui.shadcn.com/avatars/01.png'}
                        alt="Hotel Logo"
                        className="w-10 h-10 rounded-full object-cover border-2 border-brand-100"
                    />
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    <StatCard icon={<Users size={24} />} label="Available Partners" value={stats.partners} color="blue" />
                    <StatCard icon={<Tag size={24} />} label="Average Discount" value={`${stats.avgDiscount}%`} color="green" />
                    <StatCard icon={<Star size={24} />} label="Top Discount" value={`${stats.topDiscount}%`} color="orange" />
                </div>
                {renderTabContent()}
            </main>

            {/* QR Modal */}
            {qrOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setQrOpen(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Share Your Menu</h3>
                                <p className="text-sm text-gray-500 mt-1">Scan or share this QR code with guests</p>
                            </div>
                            <button onClick={() => setQrOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24}/>
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border-4 border-orange-100 shadow-lg">
                                <img 
                                    src={`https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=${encodeURIComponent(qrLink)}&choe=UTF-8`} 
                                    alt="QR code" 
                                    className="w-64 h-64 md:w-80 md:h-80" 
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center break-all bg-gray-50 p-3 rounded-lg max-w-full">
                                {qrLink}
                            </p>
                            <div className="mt-6 w-full space-y-3">
                                <button 
                                    onClick={downloadQR} 
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                >
                                    <QrCode size={20} /> Download QR Code
                                </button>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(qrLink)} 
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        <LinkIcon size={16} /> Copy
                                    </button>
                                    <button 
                                        onClick={shareWhatsApp} 
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                                    >
                                        <MessageSquare size={16} /> WhatsApp
                                    </button>
                                    <button 
                                        onClick={() => window.open(`mailto:?subject=Guest%20Menu&body=${encodeURIComponent(qrLink)}`)} 
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                                    >
                                        <MessageSquare size={16} /> Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelDashboardPage;