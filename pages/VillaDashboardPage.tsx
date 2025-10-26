import React, { useMemo, useState } from 'react';
import { Building, Image as ImageIcon, Link as LinkIcon, LogOut, Menu, MessageSquare, Phone, QrCode, Star, Tag, User, Users, X } from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import ImageUpload from '../components/ImageUpload';
import Header from '../components/dashboard/Header';
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

interface VillaDashboardPageProps {
    onLogout: () => void;
    therapists?: Therapist[];
    places?: Place[];
}

const VillaDashboardPage: React.FC<VillaDashboardPageProps> = ({ onLogout, therapists = [], places = [] }) => {
    const [activeTab, setActiveTab] = useState<'branding' | 'menu'>('branding');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const placeholderImage =
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop';

    const providers = useMemo<ProviderCard[]>(() => {
        const list: ProviderCard[] = [];
        const add = (item: Therapist | Place, type: ProviderType) => {
            const status = item.hotelVillaServiceStatus ?? HotelVillaServiceStatus.NotOptedIn;
            const discount = (item as any).villaDiscount || 0;
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

    const mockProviders: ProviderCard[] = [
        {
            id: 't-001',
            name: 'Made Sari',
            type: 'therapist',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
            location: 'Canggu, Bali',
            rating: 4.8,
            reviewCount: 92,
            pricing: { '60': 260000, '90': 360000, '120': 460000 },
            discount: 10,
            description: 'Experienced therapist offering Balinese and Swedish techniques for deep relaxation.',
        },
        {
            id: 'p-001',
            name: 'Lotus Spa Ubud',
            type: 'place',
            image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1200&auto=format&fit=crop',
            location: 'Ubud, Bali',
            rating: 4.6,
            reviewCount: 187,
            pricing: { '60': 320000, '90': 430000, '120': 540000 },
            discount: 18,
            description: 'Tranquil spa with private rooms and signature aromatherapy rituals.',
        },
    ];

    const displayProviders = providers.length ? providers : mockProviders;

    const stats = useMemo(() => {
        const count = providers.length;
        const avg = count ? Math.round(providers.reduce((s, p) => s + p.discount, 0) / count) : 0;
        const top = count ? Math.max(...providers.map(p => p.discount)) : 0;
        return { partners: count, avgDiscount: avg, topDiscount: top };
    }, [providers]);

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [villaName, setVillaName] = useState<string>('Your Villa Name');
    const [villaAddress, setVillaAddress] = useState<string>('Your Villa Address');
    const [villaPhone, setVillaPhone] = useState<string>('+62 123 456 789');

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
        link.download = `${villaName.replace(/\s+/g, '-')}-menu-qr.png`;
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
            case 'branding':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Section title="Branding Controls" description="Customize the look of your shared guest menu.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUpload id="villa-main" label="Banner Image" currentImage={mainImage} onImageChange={setMainImage} heightClass="h-48" />
                                    <ImageUpload id="villa-profile" label="Logo / Profile Picture" currentImage={profileImage} onImageChange={setProfileImage} heightClass="h-48" />
                                </div>
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input className="w-full p-3 border rounded-lg" placeholder="Villa Name" value={villaName} onChange={(e) => setVillaName(e.target.value)} />
                                    <input className="w-full p-3 border rounded-lg" placeholder="Address or Location" value={villaAddress} onChange={(e) => setVillaAddress(e.target.value)} />
                                </div>
                                <div className="mt-4">
                                    <input className="w-full p-3 border rounded-lg" placeholder="Contact Phone (optional)" value={villaPhone} onChange={(e) => setVillaPhone(e.target.value)} />
                                </div>
                                <div className="mt-6 text-right">
                                    <button className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-600">Save Changes</button>
                                </div>
                            </Section>
                        </div>
                        <div className="lg:col-span-1">
                            <Section title="Live Preview" description="This is how your menu header will appear to guests.">
                                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                    <div className="w-full h-32 rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                                        {mainImage ? <img src={mainImage} alt="main" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-4 border-white -mt-10 shadow-md flex-shrink-0">
                                            {profileImage ? <img src={profileImage} alt="profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24}/></div>}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="font-bold text-gray-900 text-lg truncate">{villaName}</div>
                                            <div className="text-xs text-gray-600 flex items-center gap-1.5"><Building size={12}/> {villaAddress}</div>
                                            {villaPhone && <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5"><Phone size={12}/> {villaPhone}</div>}
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    </div>
                );
            case 'menu':
                return (
                    <Section
                        title="Guest Menu & Providers"
                        description="A preview of the full menu that your guests will see, with all available partners and discounts."
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
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white w-64 p-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 shadow-lg md:shadow-none`}>
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-gray-900">Indo</span><span className="text-brand-500">street</span>
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex flex-col space-y-2">
                    <TabButton
                        icon={<ImageIcon size={20} />}
                        label="Branding"
                        isActive={activeTab === 'branding'}
                        onClick={() => setActiveTab('branding')}
                    />
                    <TabButton
                        icon={<Menu size={20} />}
                        label="Guest Menu"
                        isActive={activeTab === 'menu'}
                        onClick={() => setActiveTab('menu')}
                        badge={providers.length}
                    />
                </nav>
                <div className="mt-auto absolute bottom-6 left-6 right-6">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header
                    title={activeTab === 'branding' ? 'Branding & Menu Customization' : 'Guest Menu Preview'}
                    onMenuClick={() => setSidebarOpen(true)}
                >
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold text-gray-800">{villaName}</p>
                            <p className="text-xs text-gray-500">Villa Partner</p>
                        </div>
                        <img
                            src={profileImage || 'https://ui.shadcn.com/avatars/02.png'}
                            alt="Villa Logo"
                            className="w-10 h-10 rounded-full object-cover border-2 border-brand-100"
                        />
                    </div>
                </Header>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard icon={<Users size={24} />} label="Available Partners" value={stats.partners} color="blue" />
                        <StatCard icon={<Tag size={24} />} label="Average Discount" value={`${stats.avgDiscount}%`} color="green" />
                        <StatCard icon={<Star size={24} />} label="Top Discount" value={`${stats.topDiscount}%`} color="orange" />
                    </div>
                    {renderTabContent()}
                </main>
            </div>

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

export default VillaDashboardPage;