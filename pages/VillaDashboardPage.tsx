import React, { useMemo, useState, useEffect } from 'react';
import { Building, Image as ImageIcon, LogOut, Menu, Phone, QrCode, Star, Tag, User, X, Bell, 
    BarChart3, Percent, ClipboardList, MessageSquare, DollarSign, BellRing, CreditCard, Coins, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import { getAllTherapistImages } from '../utils/therapistImageUtils';
import { analyticsService } from '../services/analyticsService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import QRCodeGenerator from 'qrcode';
import PartnersDrawer from '../components/PartnersDrawer';
import { useTranslations } from '../lib/useTranslations';
import PushNotificationSettings from '../components/PushNotificationSettings';
// import HotelVillaServicesSettingsPage from './HotelVillaServicesSettingsPage';
import HotelVillaBankDetailsPage from './HotelVillaBankDetailsPage';
import HotelBookingModal from '../components/hotel/PropertyBookingModal';
import HotelAnalyticsSection from '../components/hotel/PropertyAnalyticsSection';
import { safeDownload } from '../utils/domSafeHelpers';
import { affiliateAnalyticsService } from '../lib/affiliateAnalyticsService';
import { getCode as getCapturedAffiliateCode } from '../lib/affiliateAttribution';


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
    initialTab?: 'analytics' | 'discounts' | 'menu' | 'feedback' | 'commissions' | 'notifications';
    setPage?: (page: any) => void;
    onNavigate?: (page: string) => void;
}

const VillaDashboardPage: React.FC<VillaDashboardPageProps> = ({ 
    onLogout, 
    therapists = [], 
    places = [], 
    villaId = '1', 
    initialTab = 'menu',
    setPage,
    onNavigate
}) => {
    const { t } = useTranslations();
    
    // Derive affiliate code for this account (fallback to VILLA-<id>)
    const affiliateCode = useMemo(() => {
        const stored = (globalThis as any).my_affiliate_code as string | undefined;
        return stored && stored.trim() ? stored.trim() : `VILLA-${villaId}`;
    }, [villaId]);
    
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
    const [commissionSummary, setCommissionSummary] = useState<any>(null);
    const [attributions, setAttributions] = useState<any[]>([]);
    const [clicks, setClicks] = useState<any[]>([]);

    // Commission structure (Indastreet Partners)
    const NEW_MEMBER_RATE = 0.20; // 20% membership signup
    const RENEWAL_RATE = 0.10;    // 10% recurring membership
    const BONUS_RATE = 0.03;      // 3% account bonus

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Export a fully-branded QR as an image (canvas render)
    const downloadBrandedQR = (filename?: string) => {
        try {
            if (!state.qrCodeDataUrl) return;
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const padding = 40; // outer padding
                const header = 90;  // space for brand title
                const footer = 120; // space for partner code + caption
                const border = 12;  // orange border
                const qrW = img.width;
                const qrH = img.height;
                const canvas = document.createElement('canvas');
                canvas.width = qrW + padding * 2 + border * 2;
                canvas.height = header + qrH + footer + padding * 2 + border * 2;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Border frame
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = border;
                ctx.strokeRect(border / 2, border / 2, canvas.width - border, canvas.height - border);

                // Brand header
                ctx.textAlign = 'center';
                ctx.font = 'bold 28px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
                ctx.fillStyle = '#f97316';
                ctx.fillText('Indastreet Partners', canvas.width / 2, border + padding + 28);

                // Draw QR centered
                const qrX = (canvas.width - qrW) / 2;
                const qrY = border + padding + header - 20; // small optical adjustment
                ctx.drawImage(img, qrX, qrY, qrW, qrH);

                // Partner code
                ctx.font = 'bold 20px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
                ctx.fillStyle = '#f97316';
                ctx.fillText(`Partner Code: ${affiliateCode}`, canvas.width / 2, qrY + qrH + 36);

                // Caption
                ctx.font = '16px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
                ctx.fillStyle = '#6b7280';
                ctx.fillText('Scan to view your live wellness menu', canvas.width / 2, qrY + qrH + 64);

                // Save
                const a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                const base = (state.villaName || 'villa').replace(/\s+/g, '-');
                a.download = filename || `${base}-menu-qr-branded.png`;
                a.click();
            };
            img.src = state.qrCodeDataUrl;
        } catch (e) {
            console.error('QR export failed', e);
        }
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
            const applicableDiscount = (
                (item as any).villaDiscount ?? (item as any).hotelDiscount ?? 0
            );
            
            if ((status === HotelVillaServiceStatus.OptedIn || status === HotelVillaServiceStatus.Active) && applicableDiscount > 0) {
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
                    discount: applicableDiscount,
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
        if (state.activeTab === 'commissions' || state.activeTab === 'links' || state.activeTab === 'banners') {
            (async () => {
                try {
                    const summary = await affiliateAnalyticsService.getSummary(affiliateCode);
                    const [atts, cls] = await Promise.all([
                        affiliateAnalyticsService.getAttributionsByCode(affiliateCode),
                        affiliateAnalyticsService.getClicksByCode(affiliateCode)
                    ]);
                    setCommissionSummary(summary);
                    setAttributions(atts);
                    setClicks(cls);
                } catch (e) {
                    console.warn('Affiliate metrics load failed', e);
                }
            })();
        }
    }, [state.activeTab]);

    useEffect(() => {
        const qrLink = `${globalThis.location.origin}/?page=hotelVillaMenu&venueId=${villaId}&venueType=villa&auto=1&aff=${encodeURIComponent(affiliateCode)}`;
        updateState({ qrLink });

        // High-contrast, high-resolution QR for reliable scanning
        QRCodeGenerator.toDataURL(qrLink, {
            width: 800,
            margin: 4,
            color: { dark: '#000000', light: '#FFFFFF' },
            errorCorrectionLevel: 'H'
        })
            .then(url => updateState({ qrCodeDataUrl: url }))
            .catch(console.error);
    }, [villaId, affiliateCode]);

    // Handlers (currently unused)
    // const handleSaveAndPreview = async () => {
    //     try {
    //         updateState({ isProcessing: true });
    //         const data = {
    //             name: state.villaName || 'Villa',
    //             address: state.villaAddress || '',
    //             contactNumber: state.villaPhone || '',
    //             bannerImage: state.mainImage || '',
    //             logoImage: state.profileImage || '',
    //             type: 'villa',
    //             updatedAt: new Date().toISOString()
    //         };
    //         
    //         if (villaDocumentId) {
    //             await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotels, villaDocumentId, data);
    //         } else {
    //             const newDoc = await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotels, ID.unique(), {
    //                 ...data, villaId, createdAt: new Date().toISOString()
    //             });
    //             setVillaDocumentId(newDoc.$id);
    //         }
    //         alert('✅ Profile saved successfully!');
    //     } catch (_error) {
    //         console.error('Error saving profile:', _error);
    //         alert('❌ Error saving profile. Please try again.');
    //     } finally {
    //         updateState({ isProcessing: false });
    //     }
    // };

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
                                <h2 className="text-2xl font-bold text-gray-900">Therapist Partners</h2>
                                <p className="text-xs text-gray-500">Invite and view therapists and places offering guest benefits</p>
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
                            
                            {/* QR Code Display (Branded) */}
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="bg-white p-3 rounded-lg border-2 border-orange-500 shadow-sm">
                                    <div className="text-xs font-bold text-orange-600 text-center mb-2">Inda<span className="text-black">street</span> Partners</div>
                                    {state.qrCodeDataUrl ? (
                                        <>
                                            <img src={state.qrCodeDataUrl} alt="Villa Menu QR Code" className="w-24 h-24 object-contain mx-auto" />
                                            <div className="text-[11px] text-orange-600 font-mono text-center mt-2">Partner Code: {affiliateCode}</div>
                                            <div className="text-[10px] text-gray-500 text-center">Scan to view menu</div>
                                        </>
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
                                            onClick={() => downloadBrandedQR(`${(state.villaName || 'villa').replace(/\s+/g, '-')}-menu-qr.png`)}
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
                                    {/* Large QR Code (Branded) */}
                                    <div className="bg-white p-6 rounded-xl border-4 border-orange-500 shadow-lg">
                                        <div className="text-base font-bold text-orange-600 text-center mb-3">Inda<span className="text-black">street</span> Partners</div>
                                        {state.qrCodeDataUrl ? (
                                            <div className="flex flex-col items-center">
                                                <img src={state.qrCodeDataUrl} alt="Villa Menu QR Code" className="w-64 h-64 object-contain" />
                                                <div className="text-sm text-orange-600 font-mono text-center mt-3">Partner Code: {affiliateCode}</div>
                                                <div className="text-xs text-gray-500 text-center">Scan to view your live wellness menu</div>
                                            </div>
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
                                        onClick={() => downloadBrandedQR(`${(state.villaName || 'villa').replace(/\s+/g, '-')}-menu-qr-large.png`)}
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
                                            // Ensure venueId is available to the router via URL params
                                            try {
                                                const url = new URL(window.location.href);
                                                url.searchParams.set('page', 'hotelVillaMenu');
                                                url.searchParams.set('venueId', String(villaId));
                                                url.searchParams.set('venueType', 'villa');
                                                window.history.replaceState({}, '', url.toString());
                                            } catch {}

                                            // Navigate to live menu using internal routing if available
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

            case 'links': {
                const origin = globalThis.location?.origin || '';
                const shareLink = `${origin}/?aff=${affiliateCode}`;
                const captured = getCapturedAffiliateCode() || 'none';
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <LinkIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
                                <p className="text-xs text-gray-500">Share this link or QR. All clicks and bookings are tracked.</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border space-y-3">
                            <div className="text-xs text-gray-500">Affiliate code</div>
                            <div className="font-mono text-sm">{affiliateCode}</div>
                            <div className="text-xs text-gray-500">Share URL</div>
                            <div className="flex items-center gap-2">
                                <input className="flex-1 border rounded-lg px-3 py-2 text-sm" readOnly value={shareLink} />
                                <button onClick={() => navigator.clipboard.writeText(shareLink)} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm">Copy</button>
                                <a href={`https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${encodeURIComponent(shareLink)}`} target="_blank" className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm" rel="noreferrer">QR</a>
                            </div>
                            <div className="text-xs text-gray-400">Debug: current captured code = {captured}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800">Recent Clicks</h3>
                                <div className="text-xs text-gray-500">Last 500</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500">
                                            <th className="py-2 pr-4">Time</th>
                                            <th className="py-2 pr-4">Path</th>
                                            <th className="py-2 pr-4">Referrer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(clicks || []).map((c: any) => (
                                            <tr key={c.$id} className="border-t">
                                                <td className="py-2 pr-4">{new Date(c.createdAt || c.$createdAt).toLocaleString()}</td>
                                                <td className="py-2 pr-4 font-mono text-xs">{c.path}</td>
                                                <td className="py-2 pr-4 font-mono text-xs text-gray-500">{c.referrer || '-'}</td>
                                            </tr>
                                        ))}
                                        {(!clicks || clicks.length === 0) && (
                                            <tr><td colSpan={3} className="py-6 text-center text-gray-500">No clicks yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'banners': {
                const origin = globalThis.location?.origin || '';
                const target = `${origin}/?aff=${affiliateCode}`;
                const banners = [
                    { id: 'wide', label: 'Wide 728x90', src: 'https://ik.imagekit.io/7grri5v7d/aff/wide-728x90.png', w: 728, h: 90 },
                    { id: 'rect', label: 'Rectangle 300x250', src: 'https://ik.imagekit.io/7grri5v7d/aff/rect-300x250.png', w: 300, h: 250 },
                    { id: 'square', label: 'Square 250x250', src: 'https://ik.imagekit.io/7grri5v7d/aff/sq-250x250.png', w: 250, h: 250 }
                ];
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Banners & Creatives</h2>
                                <p className="text-xs text-gray-500">Embed code includes your affiliate code automatically.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banners.map(b => (
                                <div key={b.id} className="bg-white rounded-xl p-4 border space-y-3">
                                    <div className="text-sm font-semibold">{b.label}</div>
                                    <div className="border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{height: b.h}}>
                                        <img src={b.src} alt={b.label} className="object-contain" style={{maxWidth: '100%', maxHeight: '100%'}} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Embed code</div>
<pre className="text-xs bg-gray-900 text-green-200 rounded-lg p-3 overflow-x-auto"><code>{`<a href="${target}" target="_blank" rel="nofollow"><img src="${b.src}" width="${b.w}" height="${b.h}" alt="IndaStreet" /></a>`}</code></pre>
                                        <button onClick={() => navigator.clipboard.writeText(`<a href="${target}" target="_blank" rel="nofollow"><img src="${b.src}" width="${b.w}" height="${b.h}" alt="IndaStreet" /></a>`)} className="mt-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm">Copy Embed</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }


            case 'commissions':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Commissions</h2>
                                <p className="text-xs text-gray-500">Affiliate code: <span className="font-mono">{affiliateCode}</span></p>
                            </div>
                        </div>

                        {/* Commission Structure */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-bold text-blue-900 mb-2">Commission Structure</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-blue-800">New Membership Signup</p>
                                    <p className="text-blue-700">{Math.round(NEW_MEMBER_RATE * 100)}% of membership price</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-blue-800">Recurring Membership</p>
                                    <p className="text-blue-700">{Math.round(RENEWAL_RATE * 100)}% per renewal</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-blue-800">Account Bonus</p>
                                    <p className="text-blue-700">{Math.round(BONUS_RATE * 100)}% bonus on eligible totals</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Clicks</div>
                                <div className="text-2xl font-bold">{commissionSummary?.clicks ?? 0}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Bookings</div>
                                <div className="text-2xl font-bold">{commissionSummary?.bookings ?? 0}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Conversion</div>
                                <div className="text-2xl font-bold">{commissionSummary?.conversionRate ?? 0}%</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Pending</div>
                                <div className="text-2xl font-bold">Rp {(commissionSummary?.pendingAmount ?? 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Approved</div>
                                <div className="text-2xl font-bold">Rp {(commissionSummary?.approvedAmount ?? 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Paid</div>
                                <div className="text-2xl font-bold">Rp {(commissionSummary?.paidAmount ?? 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border">
                                <div className="text-xs text-gray-500">Projected Bonus (3%)</div>
                                <div className="text-2xl font-bold">Rp {Math.round(((commissionSummary?.approvedAmount ?? 0) * BONUS_RATE)).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Provider Registration Link (for membership signups) */}
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800">Invite Providers to Join</h3>
                                <div className="text-xs text-gray-500">Earn {Math.round(NEW_MEMBER_RATE * 100)}% + {Math.round(RENEWAL_RATE * 100)}% recurring</div>
                            </div>
                            {(() => {
                                const origin = globalThis.location?.origin || '';
                                // Attach both affiliate code and partner id so attribution is unquestionably tied to this dashboard
                                const regLink = `${origin}/?page=providerAuth&aff=${encodeURIComponent(affiliateCode)}&pid=${encodeURIComponent(String(villaId))}`;
                                const inputId = 'provider-reg-link-input';
                                return (
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500">Registration link</div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id={inputId}
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm select-all"
                                                readOnly
                                                value={regLink}
                                                onFocus={(e) => e.currentTarget.select()}
                                            />
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById(inputId) as HTMLInputElement | null;
                                                    if (el) { el.select(); }
                                                    navigator.clipboard.writeText(regLink);
                                                }}
                                                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm"
                                            >Copy</button>
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById(inputId) as HTMLInputElement | null;
                                                    if (el) { el.select(); }
                                                }}
                                                className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm"
                                            >Select</button>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            <div className="mb-1">Direct link:</div>
                                            <a href={regLink} target="_blank" rel="noreferrer" className="font-mono break-all text-blue-600 hover:underline">{regLink}</a>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 leading-relaxed">
                                            <p className="mb-1"><strong>How it works:</strong></p>
                                            <ul className="list-disc ml-5 space-y-1">
                                                <li>Share this link with therapists or massage places you invite to Indastreet.</li>
                                                <li>When they click and register, your partner code <span className="font-mono">{affiliateCode}</span> is automatically attached to their account.</li>
                                                <li>All eligible memberships and renewals are attributed to your dashboard account (Partner ID <span className="font-mono">{String(villaId)}</span>).</li>
                                                <li>You earn {Math.round(NEW_MEMBER_RATE * 100)}% on their first membership and {Math.round(RENEWAL_RATE * 100)}% on renewals, plus a {Math.round(BONUS_RATE * 100)}% bonus where applicable.</li>
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800">Attributed Bookings</h3>
                                <div className="text-xs text-gray-500">Last 500</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500">
                                            <th className="py-2 pr-4">Date</th>
                                            <th className="py-2 pr-4">Provider</th>
                                            <th className="py-2 pr-4">Type</th>
                                            <th className="py-2 pr-4">Amount</th>
                                            <th className="py-2 pr-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(attributions || []).map((a) => (
                                            <tr key={a.$id} className="border-t">
                                                <td className="py-2 pr-4 text-gray-700">{new Date(a.createdAt || a.$createdAt).toLocaleString()}</td>
                                                <td className="py-2 pr-4">{a.providerName || a.providerId}</td>
                                                <td className="py-2 pr-4 capitalize">{a.providerType}</td>
                                                <td className="py-2 pr-4 font-medium">Rp {(a.commissionAmount || 0).toLocaleString()}</td>
                                                <td className="py-2 pr-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        (a.commissionStatus === 'paid') ? 'bg-green-100 text-green-700' :
                                                        (a.commissionStatus === 'approved') ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>{a.commissionStatus || 'pending'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!attributions || attributions.length === 0) && (
                                            <tr><td colSpan={5} className="py-6 text-center text-gray-500">No attributed bookings yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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

            case 'terms':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
                        </div>
                        <div className="bg-white rounded-xl border p-5 space-y-3">
                            <p className="text-sm text-gray-700">Review Indastreet’s Terms of Service governing partner use of the platform, commissions, conduct, intellectual property, and dispute resolution.</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => {
                                    if (setPage) setPage('serviceTerms' as any);
                                    else {
                                        const origin = globalThis.location?.origin || '';
                                        window.open(`${origin}/?page=serviceTerms`, '_blank');
                                    }
                                }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Open Full Terms</button>
                                <button onClick={() => {
                                    const origin = globalThis.location?.origin || '';
                                    navigator.clipboard.writeText(`${origin}/?page=serviceTerms`);
                                }} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm">Copy Terms Link</button>
                            </div>
                        </div>
                    </div>
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



            default:
                return (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-semibold text-gray-800">Feature Coming Soon</h3>
                        <p className="text-gray-500 mt-2">This feature is under development.</p>
                    </div>
                );
        }
    };

    // Navigation items for sidebar - SYNCHRONIZED WITH HOTEL DASHBOARD
    const navItems = [
        { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'blue', description: 'View performance metrics' },
        { id: 'discounts', icon: Percent, label: 'Therapist Partners', color: 'green', description: 'Invite and manage partners' },
        { id: 'menu', icon: ClipboardList, label: 'Menu', badge: providers.length, color: 'indigo', description: 'Service providers' },
        { id: 'qr-code', icon: QrCode, label: 'QR Code', color: 'purple', description: 'Share menu with guests' },
        { id: 'feedback', icon: MessageSquare, label: 'Feedback', color: 'yellow', description: 'Customer reviews' },
        { id: 'links', icon: LinkIcon, label: 'Links', color: 'blue', description: 'Your referral links' },
        { id: 'banners', icon: ImageIcon, label: 'Banners', color: 'purple', description: 'Creatives & embeds' },
        { id: 'commissions', icon: DollarSign, label: 'Commissions', color: 'orange', description: 'Payment tracking' },
        { id: 'coin-history', icon: BarChart3, label: 'Coin History', color: 'orange', description: 'View coin balance & transactions' },
        { id: 'coin-shop', icon: Coins, label: 'Coin Shop', color: 'yellow', description: 'Redeem rewards & cashout' },
        { id: 'bank-details', icon: CreditCard, label: 'Bank Details', color: 'green', description: 'Payment information' },
        { id: 'terms', icon: ShieldCheck, label: 'Terms', color: 'emerald', description: 'View terms & conditions' },
        { id: 'notifications', icon: BellRing, label: 'Push Settings', color: 'red', description: 'Notification preferences' },
    ];

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Dashboard-Specific Header */}
            <header className="bg-white shadow-sm px-4 py-3 z-30 flex-shrink-0">
                <div className="flex items-center justify-between max-w-[430px] sm:max-w-5xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-2xl">🏡</span>
                        <span>Indastreet Partners</span>
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

            <PartnersDrawer 
                isOpen={state.isSideDrawerOpen}
                onClose={() => updateState({ isSideDrawerOpen: false })}
                onLogout={onLogout}
                items={navItems as any}
                onSelect={(id) => {
                    if ((id === 'coin-history' || id === 'coin-shop') && onNavigate) {
                        onNavigate(id === 'coin-history' ? 'coinHistory' : 'coin-shop');
                        return;
                    }
                    updateState({ activeTab: id, isSideDrawerOpen: false });
                }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="w-full max-w-5xl mx-auto px-2 py-3 sm:p-4 md:p-6 lg:p-8 pb-4">
                    {renderTabContent()}
                </div>
            </main>



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
                                    <div className="bg-white p-4 rounded-xl border-4 border-orange-500 shadow flex flex-col items-center">
                                        <div className="text-base font-bold text-orange-600 text-center mb-2">Inda<span className="text-black">street</span> Partners</div>
                                        <img src={state.qrCodeDataUrl} alt="QR code" className="w-64 h-64 mx-auto object-contain" />
                                        <div className="text-sm text-orange-600 font-mono text-center mt-2">Partner Code: {affiliateCode}</div>
                                        <div className="text-xs text-gray-500 text-center">Scan to view menu</div>
                                    </div>
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => downloadBrandedQR(`${(state.villaName || 'villa').replace(/\s+/g, '-')}-menu-qr.png`)}
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