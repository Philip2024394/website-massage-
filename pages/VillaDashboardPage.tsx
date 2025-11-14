import React, { useMemo, useState, useEffect } from 'react';
import { Building, Image as ImageIcon, LogOut, Menu, Phone, QrCode, Star, Tag, User, X, Bell, 
    BarChart3, Percent, ClipboardList, MessageSquare, DollarSign, BellRing, CreditCard, Coins } from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import { getAllTherapistImages } from '../utils/therapistImageUtils';
import { analyticsService } from '../services/analyticsService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import QRCodeGenerator from 'qrcode';
import { useTranslations } from '../lib/useTranslations';
import PushNotificationSettings from '../components/PushNotificationSettings';
import HotelVillaServicesSettingsPage from './HotelVillaServicesSettingsPage';
import HotelVillaBankDetailsPage from './HotelVillaBankDetailsPage';
import HotelBookingModal from '../components/hotel/PropertyBookingModal';
import HotelAnalyticsSection from '../components/hotel/PropertyAnalyticsSection';
import { safeDownload } from '../utils/domSafeHelpers';
import Footer from '../components/Footer';

// External component: DiscountCard
const DiscountCard: React.FC<{ 
    data: ProviderCard;
    onShareClick: (qrLink: string) => void;
}> = ({ data: p, onShareClick }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-transform hover:scale-[1.02]">
        <div className="relative">
            <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                {p.discount}% OFF
            </div>
            <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full p-4">
                <h3 className="font-bold text-white text-xl">{p.name}</h3>
                <p className="text-xs text-gray-200">{p.location}</p>
            </div>
        </div>
        <div className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5" fill="currentColor" />
                    <span className="text-sm font-bold ml-1.5">{p.rating}</span>
                    <span className="text-xs text-gray-500 ml-2">({p.reviewCount} reviews)</span>
                </div>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{p.type}</span>
            </div>
            <p className="text-sm text-gray-600 mb-5">{p.description}</p>
            <div className="grid grid-cols-3 gap-3 text-sm mb-5">
                {(['60','90','120'] as DurationKey[]).map((d) => (
                    <div key={d} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">{d} min</div>
                        <div className="line-through text-gray-400 text-xs">Rp {p.pricing[d].toLocaleString()}</div>
                        <div className="font-bold text-orange-600">Rp {Math.round(p.pricing[d] * (1 - p.discount/100)).toLocaleString()}</div>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => onShareClick(`${globalThis.location.href}?provider=${p.type}-${p.id}`)}
                className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
                <QrCode size={16} /><span>Share</span>
            </button>
        </div>
    </div>
);

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
    discount: number;
    whatsappNumber?: string;
    description: string;
    massageTypes: string[];
    status?: 'Available' | 'Busy' | 'Offline';
    languages?: string[];
}

interface VillaDashboardPageProps {
    onLogout: () => void;
    therapists?: Therapist[];
    places?: Place[];
    villaId?: string;
    initialTab?: 'analytics' | 'discounts' | 'profile' | 'menu' | 'feedback' | 'concierge' | 'commissions' | 'notifications' | 'membership' | 'services-settings';
    setPage?: (page: any) => void;
    onNavigate?: (page: string) => void;
}

const VillaDashboardPage: React.FC<VillaDashboardPageProps> = ({ 
    onLogout, 
    therapists = [], 
    places = [], 
    villaId = '1', 
    initialTab = 'analytics',
    setPage,
    onNavigate
}) => {
    const { t } = useTranslations();
    
    // State consolidation
    const [state, setState] = useState({
        activeTab: initialTab as string,
        isSideDrawerOpen: false,
        villaName: '',
        villaAddress: '',
        villaPhone: '',
        mainImage: null as string | null,
        profileImage: null as string | null,
        qrOpen: false,
        qrLink: '',
        qrCodeDataUrl: '',
        bookingOpen: false,
        selectedProvider: null as ProviderCard | null,
        selectedDuration: '60' as DurationKey,
        guestName: '',
        roomNumber: '',
        isProcessing: false,
        bookingConfirmed: false,
        bookingId: '',
        bookingTime: '',
    });
    
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    const [villaDocumentId, setVillaDocumentId] = useState<string | null>(null);

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Constants
    const therapistBannerImages = getAllTherapistImages();

    // Providers logic
    const providers = useMemo<ProviderCard[]>(() => {
        const list: ProviderCard[] = [];
        const allProviders = [...therapists, ...places];
        for (let index = 0; index < allProviders.length; index++) {
            const item = allProviders[index];
            const isTherapist = index < therapists.length;
            const status = item.hotelVillaServiceStatus ?? HotelVillaServiceStatus.NotOptedIn;
            const discount = (item as any).hotelDiscount || 0;
            
            if (status === HotelVillaServiceStatus.OptedIn && discount > 0) {
                const pricing = parsePricing(item.pricing) as unknown as Record<DurationKey, number>;
                const massageTypes = JSON.parse(item.massageTypes || '[]');
                const image = (item as any).mainImage || therapistBannerImages[Math.floor(Math.random() * therapistBannerImages.length)];
                
                list.push({
                    id: item.id,
                    name: item.name,
                    type: isTherapist ? 'therapist' : 'place',
                    image,
                    location: (item as any).location,
                    rating: (item as any).rating,
                    reviewCount: (item as any).reviewCount,
                    pricing,
                    discount,
                    whatsappNumber: (item as any).whatsappNumber,
                    description: (item as any).description,
                    massageTypes,
                    status: (item as any).status || 'Available',
                    languages: item.languages || [],
                });
            }
        }
        return list.sort((a, b) => {
            if (a.status === 'Available') return -1;
            if (b.status === 'Available') return 1;
            return 0;
        });
    }, [therapists, places, therapistBannerImages]);

    // Mock providers for preview
    const mockProviders: ProviderCard[] = useMemo(() => [
        {
            id: 't-001', name: 'Ayu Prameswari', type: 'therapist', image: therapistBannerImages[0],
            location: 'Kuta, Bali', rating: 4.9, reviewCount: 128,
            pricing: { '60': 250000, '90': 350000, '120': 450000 }, discount: 15,
            description: 'Certified Balinese therapist specializing in deep tissue and relaxation massage.',
            massageTypes: ['Deep Tissue', 'Swedish', 'Hot Stone'], status: 'Available', languages: ['id', 'en'],
        },
        {
            id: 'p-001', name: 'Serenity Spa', type: 'place', image: therapistBannerImages[2],
            location: 'Seminyak, Bali', rating: 4.7, reviewCount: 256,
            pricing: { '60': 300000, '90': 420000, '120': 520000 }, discount: 20,
            description: 'Modern wellness center offering aromatherapy treatments.',
            massageTypes: ['Aromatherapy', 'Balinese'], status: 'Available', languages: ['id', 'en'],
        },
    ], [therapistBannerImages]);

    const displayProviders = providers.length ? providers : mockProviders;

    // Effects
    useEffect(() => {
        if (state.activeTab === 'analytics') {
            analyticsService.getHotelVillaAnalytics(1, 'villa', 
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            ).then(setAnalytics).catch(console.error).finally(() => setIsLoadingAnalytics(false));
        }
    }, [state.activeTab]);

    useEffect(() => {
        const qrLink = `${globalThis.location.origin}/?page=hotelVillaMenu&venueId=${villaId}&venueType=villa`;
        updateState({ qrLink });
        
        QRCodeGenerator.toDataURL(qrLink, {
            width: 500, margin: 2,
            color: { dark: '#f97316', light: '#FFFFFF' },
            errorCorrectionLevel: 'H'
        }).then(url => updateState({ qrCodeDataUrl: url })).catch(console.error);
    }, [villaId]);

    // Handlers
    const handleSaveAndPreview = async () => {
        try {
            updateState({ isProcessing: true });
            const data = {
                name: state.villaName || 'Villa',
                address: state.villaAddress || '',
                contactNumber: state.villaPhone || '',
                bannerImage: state.mainImage || '',
                logoImage: state.profileImage || '',
                type: 'villa',
                updatedAt: new Date().toISOString()
            };
            
            if (villaDocumentId) {
                await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotels, villaDocumentId, data);
            } else {
                const newDoc = await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotels, ID.unique(), {
                    ...data, villaId, createdAt: new Date().toISOString()
                });
                setVillaDocumentId(newDoc.$id);
            }
            alert('✅ Profile saved successfully!');
        } catch (_error) {
            console.error('Error saving profile:', _error);
            alert('❌ Error saving profile. Please try again.');
        } finally {
            updateState({ isProcessing: false });
        }
    };

    const handleProceedBooking = async () => {
        if (!state.guestName || !state.roomNumber || !state.selectedProvider) return;

        updateState({ isProcessing: true });
        try {
            const bookingId = `BK${Date.now().toString().slice(-8)}`;
            const bookingTime = new Date().toLocaleString();
            
            await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotelBookings, ID.unique(), {
                bookingId, therapistId: String(state.selectedProvider.id), therapistName: state.selectedProvider.name,
                userId: '1', villaId: '1', villaName: state.villaName || 'Villa', villaLocation: state.villaAddress,
                guestName: state.guestName, roomNumber: state.roomNumber, duration: state.selectedDuration,
                price: state.selectedProvider.pricing[state.selectedDuration], bookingTime,
                bookingDateTime: new Date().toISOString(), status: 'pending', createdAt: new Date().toISOString()
            });
            
            updateState({ bookingConfirmed: true, bookingId, bookingTime });
        } catch (_error) {
            console.error('Booking error:', _error);
            alert('Booking failed. Please try again.');
        } finally {
            updateState({ isProcessing: false });
        }
    };

    // Tab content renderer
    const renderTabContent = () => {
        switch (state.activeTab) {
            case 'analytics':
                return <HotelAnalyticsSection analytics={analytics} isLoadingAnalytics={isLoadingAnalytics} />;
            
            case 'discounts':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.discounts')}</h2>
                                <p className="text-xs text-gray-500">All providers offering discounts for your guests</p>
                            </div>
                        </div>
                        {providers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayProviders.map((p) => (
                                    <DiscountCard 
                                        key={`${p.type}-${p.id}`} 
                                        data={p} 
                                        onShareClick={(qrLink) => updateState({ qrLink, qrOpen: true })}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-xl font-semibold text-gray-800">No Discounted Partners Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">
                                    When therapists or massage places offer discounts for your guests, they will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Building className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.profile')}</h2>
                        </div>
                        
                        {/* Banner and Profile Image */}
                        <div className="relative">
                            <input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateState({ mainImage: reader.result as string });
                                    reader.readAsDataURL(file);
                                }
                            }} className="hidden" id="villa-banner" />
                            <label htmlFor="villa-banner" className="block w-full h-48 cursor-pointer relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 hover:bg-orange-50 transition-all group">
                                {state.mainImage ? (
                                    <>
                                        <img src={state.mainImage} alt="Banner" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Click to change banner</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                                        <p className="text-sm font-medium text-gray-700">Upload Banner Image</p>
                                    </div>
                                )}
                            </label>
                            
                            <div className="absolute top-32 left-6 z-10">
                                <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => updateState({ profileImage: reader.result as string });
                                        reader.readAsDataURL(file);
                                    }
                                }} className="hidden" id="villa-profile" />
                                <label htmlFor="villa-profile" className="block w-24 h-24 rounded-full border-4 border-white shadow-lg cursor-pointer bg-white overflow-hidden hover:ring-4 hover:ring-orange-500 hover:ring-opacity-50 transition-all">
                                    {state.profileImage ? (
                                        <img src={state.profileImage} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <User className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        <div className="mt-20"></div>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="villa-name" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                    <Building className="w-4 h-4" />Villa Name
                                </label>
                                <input 
                                    id="villa-name"
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                    placeholder="Your Villa Name"
                                    value={state.villaName}
                                    onChange={(e) => updateState({ villaName: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="villa-address" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>Address
                                </label>
                                <textarea 
                                    id="villa-address"
                                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px] resize-none"
                                    placeholder="Your Address / Location"
                                    value={state.villaAddress}
                                    onChange={(e) => updateState({ villaAddress: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="villa-phone" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                    <Phone className="w-4 h-4" />Contact Phone
                                </label>
                                <input 
                                    id="villa-phone"
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Your Phone Number"
                                    value={state.villaPhone}
                                    onChange={(e) => updateState({ villaPhone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button 
                                onClick={handleSaveAndPreview}
                                disabled={state.isProcessing}
                                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-md disabled:opacity-50"
                            >
                                {state.isProcessing ? 'Saving...' : t('dashboard.savePreviewMenu')}
                            </button>
                        </div>
                    </div>
                );

            case 'menu':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Menu className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.guestMenuPreview')}</h2>
                        </div>
                        
                        {/* Primary Action Buttons */}
                        <div className="flex gap-2 flex-wrap mb-4">
                            <button onClick={() => window.open(state.qrLink, '_blank')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Preview Live
                            </button>
                            <button onClick={() => updateState({ qrOpen: true })} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                <QrCode size={16} />
                                QR Code
                            </button>
                            <button onClick={() => navigator.clipboard.writeText(state.qrLink)} className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-orange-500 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy Link
                            </button>
                        </div>

                        {/* QR Code for Villa - Share with Guests */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <QrCode className="w-4 h-4" />
                                Share Your Menu QR Code with Guests
                            </h3>
                            
                            {/* QR Code Display */}
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                                    {state.qrCodeDataUrl ? (
                                        <img src={state.qrCodeDataUrl} alt="Villa Menu QR Code" className="w-24 h-24 object-contain" />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                                            <QrCode className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600 mb-3">Print this QR code or share it digitally for guests to access your live menu</p>
                                    
                                    {/* Action Buttons for Villa Staff */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <button 
                                            onClick={() => safeDownload(`https://chart.googleapis.com/chart?chs=800x800&cht=qr&chl=${encodeURIComponent(state.qrLink)}`, `${state.villaName.replace(/\s+/g, '-')}-menu-qr.png`)}
                                            className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download
                                        </button>
                                        <button onClick={() => window.print()} className="bg-gray-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-700 transition-colors flex items-center justify-center gap-1">
                                            �️ Print
                                        </button>
                                        <button onClick={() => {
                                            const villaMessage = `🏡 ${state.villaName} Menu\n\nScan this QR code to view our wellness services:\n${state.qrLink}\n\nBook your relaxing massage today! 💆‍♀️`;
                                            globalThis.open(`https://wa.me/?text=${encodeURIComponent(villaMessage)}`, '_blank');
                                        }} className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                                            � Share
                                        </button>
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(state.qrLink);
                                            alert('Menu link copied! Share this with your guests.');
                                        }} className="bg-blue-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                                            📋 Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                            <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-gray-100">
                                {state.mainImage ? <img src={state.mainImage} alt="main" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-4 border-white -mt-10 shadow-md">
                                    {state.profileImage ? <img src={state.profileImage} alt="profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24}/></div>}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-lg">{state.villaName}</div>
                                    <div className="text-xs text-gray-600 flex items-center gap-1.5"><Building size={12}/> {state.villaAddress}</div>
                                    {state.villaPhone && <div className="text-xs text-gray-600 flex items-center gap-1.5"><Phone size={12}/> {state.villaPhone}</div>}
                                </div>
                            </div>
                        </div>

                        {providers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayProviders.map((p) => (
                                    <DiscountCard 
                                        key={`${p.type}-${p.id}`} 
                                        data={p} 
                                        onShareClick={(qrLink) => updateState({ qrLink, qrOpen: true })}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-xl font-semibold text-gray-800">No Providers Available</h3>
                            </div>
                        )}
                    </div>
                );

            case 'qr-code':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">QR Code Menu</h2>
                        </div>

                        {/* Large QR Code Display */}
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="text-center space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800">Share Your Live Menu with Guests</h3>
                                
                                <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                                    {/* Large QR Code */}
                                    <div className="bg-white p-6 rounded-xl border-4 border-gray-200 shadow-lg">
                                        {state.qrCodeDataUrl ? (
                                            <img src={state.qrCodeDataUrl} alt="Villa Menu QR Code" className="w-64 h-64 object-contain" />
                                        ) : (
                                            <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
                                                <QrCode className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* QR Code Information */}
                                    <div className="flex-1 max-w-md space-y-6">
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-3">How to use this QR Code:</h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-orange-500 font-bold">1.</span>
                                                    <span>Download and print this QR code for display in your villa</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-orange-500 font-bold">2.</span>
                                                    <span>Place it in common areas, rooms, or reception</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-orange-500 font-bold">3.</span>
                                                    <span>Guests scan to access your live wellness menu</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-orange-500 font-bold">4.</span>
                                                    <span>All bookings are automatically tracked to your villa</span>
                                                </li>
                                            </ul>
                                        </div>
                                        
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <p className="text-sm text-orange-800">
                                                <strong>Menu URL:</strong><br />
                                                <span className="font-mono text-xs break-all">{state.qrLink}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                    <button 
                                        onClick={() => safeDownload(`https://chart.googleapis.com/chart?chs=1000x1000&cht=qr&chl=${encodeURIComponent(state.qrLink)}`, `${state.villaName.replace(/\s+/g, '-')}-menu-qr-large.png`)}
                                        className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors flex flex-col items-center gap-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm font-semibold">Download Large QR</span>
                                        <span className="text-xs opacity-90">For printing</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => window.print()} 
                                        className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center gap-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        <span className="text-sm font-semibold">Print Now</span>
                                        <span className="text-xs opacity-90">Direct print</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            const villaMessage = `🏡 ${state.villaName} Wellness Menu\n\nScan this QR code to view our massage services:\n${state.qrLink}\n\nRelax and unwind with us! 💆‍♀️✨`;
                                            globalThis.open(`https://wa.me/?text=${encodeURIComponent(villaMessage)}`, '_blank');
                                        }} 
                                        className="bg-green-500 text-white px-6 py-4 rounded-lg hover:bg-green-600 transition-colors flex flex-col items-center gap-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span className="text-sm font-semibold">Share WhatsApp</span>
                                        <span className="text-xs opacity-90">Send to guests</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(state.qrLink);
                                            alert('Menu link copied! Share this with your guests.');
                                        }} 
                                        className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors flex flex-col items-center gap-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-semibold">Copy Link</span>
                                        <span className="text-xs opacity-90">Share anywhere</span>
                                    </button>
                                </div>

                                {/* Live Menu Preview */}
                                <div className="mt-8">
                                    <button 
                                        onClick={() => {
                                            // Navigate to live menu using internal routing
                                            if (setPage) {
                                                setPage('hotelVillaMenu');
                                            } else {
                                                // Fallback to URL navigation for QR code sharing
                                                window.open(state.qrLink, '_blank');
                                            }
                                        }} 
                                        className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-3 mx-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Preview Your Live Menu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'feedback':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Star className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.feedback')}</h2>
                        </div>
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-800">Guest Feedback</h3>
                            <p className="text-gray-500 mt-2">Guest reviews and feedback will appear here.</p>
                        </div>
                    </div>
                );

            case 'concierge':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.concierge')}</h2>
                        </div>
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-800">Concierge Services</h3>
                            <p className="text-gray-500 mt-2">Manage your concierge team and services.</p>
                        </div>
                    </div>
                );

            case 'commissions':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.commissions')}</h2>
                        </div>
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-800">Commission Management</h3>
                            <p className="text-gray-500 mt-2">Track earnings and commissions from bookings.</p>
                        </div>
                    </div>
                );

            case 'membership':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.membership')}</h2>
                        </div>
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-800">Membership Program</h3>
                            <p className="text-gray-500 mt-2">Manage villa guest membership benefits and rewards.</p>
                        </div>
                    </div>
                );

            case 'bank-details':
                return (
                    <HotelVillaBankDetailsPage
                        hotelVilla={{
                            id: parseInt(villaId),
                            name: state.villaName || 'Villa',
                            address: state.villaAddress || '',
                            phone: state.villaPhone || '',
                            email: '',
                            bankName: '',
                            bankAccountNumber: '',
                            bankAccountName: '',
                        }}
                        hotelVillaType="villa"
                        onSave={async (updatedDetails) => {
                            console.log('Villa bank details saved:', updatedDetails);
                            // Update local state if needed
                            updateState({ 
                                villaName: updatedDetails.name || state.villaName,
                                villaAddress: updatedDetails.address || state.villaAddress,
                                villaPhone: updatedDetails.phone || state.villaPhone 
                            });
                        }}
                        onBack={() => updateState({ activeTab: 'analytics' })}
                    />
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Push Notification Settings</h2>
                        </div>
                        <PushNotificationSettings providerId={Number.parseInt(villaId)} providerType="place" />
                    </div>
                );

            case 'services-settings':
                return (
                    <HotelVillaServicesSettingsPage
                        type="villa"
                        hotelVillaId={villaId}
                        onBack={() => updateState({ activeTab: 'analytics' })}
                        onSave={async (settings) => console.log('Saving villa settings:', settings)}
                    />
                );

            default:
                return (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-semibold text-gray-800">Feature Coming Soon</h3>
                        <p className="text-gray-500 mt-2">This feature is under development.</p>
                    </div>
                );
        }
    };

    // Navigation items for sidebar
    const navItems = [
        { id: 'analytics', icon: '📊', label: t('dashboard.analytics') },
        { id: 'discounts', icon: '🏷️', label: t('dashboard.discounts') },
        { id: 'profile', icon: '🏢', label: t('dashboard.profile') },
        { id: 'menu', icon: '📋', label: t('dashboard.menu'), badge: providers.length },
        { id: 'qr-code', icon: '📱', label: 'QR Code' },
        { id: 'feedback', icon: '⭐', label: t('dashboard.feedback') },
        { id: 'concierge', icon: '👥', label: t('dashboard.concierge') },
        { id: 'commissions', icon: '💰', label: t('dashboard.commissions') },
        { id: 'coin-history', icon: '📊', label: 'Coin History' },
        { id: 'coin-shop', icon: '🪙', label: 'Coin Shop' },
        { id: 'bank-details', icon: '🏦', label: 'Bank Details' },
        { id: 'notifications', icon: '🔔', label: 'Push Settings' },
        { id: 'membership', icon: '📦', label: t('dashboard.membership') },
        { id: 'services-settings', icon: '⚙️', label: t('dashboard.services') },
    ];

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Dashboard-Specific Header */}
            <header className="bg-white shadow-sm px-4 py-3 z-30 flex-shrink-0">
                <div className="flex items-center justify-between max-w-[430px] sm:max-w-5xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-2xl">🏡</span>
                        <span>Villa Dashboard</span>
                    </h1>
                    <button 
                        onClick={() => updateState({ isSideDrawerOpen: true })} 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Open side menu"
                    >
                        <Menu className="w-5 h-5 text-orange-500" />
                    </button>
                </div>
            </header>

            {/* Side Drawer */}
            {state.isSideDrawerOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
                        onClick={() => updateState({ isSideDrawerOpen: false })}
                        onKeyDown={(e) => e.key === 'Escape' && updateState({ isSideDrawerOpen: false })}
                        role="button"
                        tabIndex={0}
                        aria-label="Close side menu"
                    />
                    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Villa Menu</h2>
                            <button 
                                onClick={() => updateState({ isSideDrawerOpen: false })} 
                                className="text-white hover:bg-orange-600 rounded-lg p-2"
                                aria-label="Close side menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="p-4 space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'coin-history' && onNavigate) {
                                            onNavigate('coinHistory');
                                        } else if (item.id === 'coin-shop' && onNavigate) {
                                            onNavigate('coin-shop');
                                        } else {
                                            updateState({ activeTab: item.id, isSideDrawerOpen: false });
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                        state.activeTab === item.id ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
                            <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">{t('dashboard.logout')}</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="w-full max-w-5xl mx-auto px-2 py-3 sm:p-4 md:p-6 lg:p-8 pb-4">
                    {renderTabContent()}
                </div>
            </main>

            {/* Footer Navigation */}
            <Footer 
                userRole="villa"
                currentPage="dashboard"
                t={t}
                onDashboardClick={() => {/* Already on dashboard */}}
                onNotificationsClick={() => setPage && setPage('notifications')}
                onChatClick={() => {/* TODO: Add chat functionality */}}
                onMenuClick={() => {/* TODO: Add menu functionality */}}
                onHomeClick={() => setPage && setPage('home')}
            />

            {/* QR Modal */}
            {state.qrOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" 
                    onClick={() => updateState({ qrOpen: false })}
                    onKeyDown={(e) => e.key === 'Escape' && updateState({ qrOpen: false })}
                    role="dialog"
                    tabIndex={0}
                    aria-label="QR code modal"
                >
                    <div 
                        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        role="dialog"
                        tabIndex={-1}
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Guest Menu QR Code</h3>
                            <button 
                                onClick={() => updateState({ qrOpen: false })} 
                                className="text-white hover:bg-white/20 rounded-lg p-1"
                                aria-label="Close QR code modal"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            {state.qrCodeDataUrl ? (
                                <div className="space-y-4">
                                    <img src={state.qrCodeDataUrl} alt="QR code" className="w-64 h-64 mx-auto object-contain" />
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => safeDownload(`https://chart.googleapis.com/chart?chs=600x600&cht=qr&chl=${encodeURIComponent(state.qrLink)}`, `${state.villaName.replace(/\s+/g, '-')}-menu-qr.png`)}
                                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
                                        >
                                            Download QR Code
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => { navigator.clipboard.writeText(state.qrLink); alert('Link copied!'); }} className="bg-gray-100 text-gray-800 py-2 rounded-lg text-sm">Copy Link</button>
                                            <button onClick={() => window.print()} className="bg-blue-600 text-white py-2 rounded-lg text-sm">Print QR</button>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-2">Share on Social Media:</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                <button onClick={() => {
                                                    const whatsappMessage = `Check out our wellness menu: ${state.qrLink}`;
                                                    globalThis.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                                                }} className="bg-green-500 text-white py-2 rounded-lg text-xs">WhatsApp</button>
                                                <button onClick={() => {
                                                    const text = `Check out this amazing wellness menu!`;
                                                    globalThis.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(state.qrLink)}&quote=${encodeURIComponent(text)}`, '_blank');
                                                }} className="bg-blue-600 text-white py-2 rounded-lg text-xs">Facebook</button>
                                                <button onClick={() => {
                                                    const text = `Check out this wellness menu: ${state.qrLink}`;
                                                    globalThis.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                                                }} className="bg-sky-500 text-white py-2 rounded-lg text-xs">Twitter</button>
                                                <button onClick={() => {
                                                    const subject = 'Wellness Menu';
                                                    const body = `Check out our wellness menu: ${state.qrLink}`;
                                                    globalThis.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                                                }} className="bg-gray-600 text-white py-2 rounded-lg text-xs">Email</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-64 h-64 mx-auto flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            <HotelBookingModal
                isOpen={state.bookingOpen}
                onClose={() => updateState({ bookingOpen: false, selectedProvider: null, guestName: '', roomNumber: '', bookingConfirmed: false })}
                selectedProvider={state.selectedProvider}
                selectedDuration={state.selectedDuration}
                onDurationChange={(duration) => updateState({ selectedDuration: duration })}
                guestName={state.guestName}
                onGuestNameChange={(name) => updateState({ guestName: name })}
                roomNumber={state.roomNumber}
                onRoomNumberChange={(room) => updateState({ roomNumber: room })}
                onProceedBooking={handleProceedBooking}
                isProcessing={state.isProcessing}
                bookingConfirmed={state.bookingConfirmed}
                bookingId={state.bookingId}
                bookingTime={state.bookingTime}
                onCloseBookingModal={() => updateState({ bookingOpen: false, selectedProvider: null, guestName: '', roomNumber: '', bookingConfirmed: false })}
            />
        </div>
    );
};

export default VillaDashboardPage;