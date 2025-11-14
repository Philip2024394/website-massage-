import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
    Building, Image as ImageIcon, LogOut, Menu, Phone, QrCode, Star, Tag, User, X, Bell,
    BarChart3, Percent, Hotel as HotelIcon, ClipboardList, MessageSquare, Users, 
    DollarSign, BellRing, Package, CreditCard
} from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus, Hotel } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import { getAllTherapistImages } from '../utils/therapistImageUtils';
import { analyticsService } from '../services/analyticsService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { commissionPaymentService } from '../services/commissionPaymentService';
import QRCodeGenerator from 'qrcode';
import { useTranslations } from '../lib/useTranslations';
import PushNotificationSettings from '../components/PushNotificationSettings';
import HotelBookingModal from '../components/hotel/PropertyBookingModal';
import HotelAnalyticsSection from '../components/hotel/PropertyAnalyticsSection';
import HotelVillaBankDetailsPage from './HotelVillaBankDetailsPage';
import DashboardHeader from '../components/DashboardHeader';
import { safeDownload } from '../utils/domSafeHelpers';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

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

interface HotelDashboardPageProps {
    onLogout: () => void;
    therapists?: Therapist[];
    places?: Place[];
    hotelId?: string;
    initialTab?: 'analytics' | 'discounts' | 'menu' | 'feedback' | 'commissions' | 'notifications';
    setPage?: (page: any) => void;
}

const HotelDashboardPage: React.FC<HotelDashboardPageProps> = ({ 
    onLogout, 
    therapists = [], 
    places = [], 
    hotelId = '1', 
    initialTab = 'analytics',
    setPage
}) => {
    const { t } = useTranslations();
    
    // State consolidation
    const [state, setState] = useState({
        activeTab: initialTab as string,
        isSideDrawerOpen: false,
        hotelName: '',
        hotelAddress: '',
        hotelPhone: '',
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
    const [hotelDocumentId, setHotelDocumentId] = useState<string | null>(null);
    const [commissionRecords, setCommissionRecords] = useState<any[]>([]);
    const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

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
            analyticsService.getHotelVillaAnalytics(1, 'hotel', 
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            ).then(setAnalytics).catch(console.error).finally(() => setIsLoadingAnalytics(false));
        } else if (state.activeTab === 'commissions') {
            loadCommissionRecords();
        }
    }, [state.activeTab]);

    const loadCommissionRecords = async () => {
        setIsLoadingCommissions(true);
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId, 
                APPWRITE_CONFIG.collections.commissionRecords,
                [
                    // Filter by hotel ID to show only this hotel's commissions
                    `hotelVillaId=${hotelId}`
                ]
            );
            setCommissionRecords(response.documents);
            console.log(`📊 Loaded ${response.documents.length} commission records for hotel ${hotelId}`);
        } catch (error) {
            console.error('Error loading commission records:', error);
            setCommissionRecords([]);
        } finally {
            setIsLoadingCommissions(false);
        }
    };

    useEffect(() => {
        // 🔑 CRITICAL: QR code must include specific hotel ID for commission tracking
        const qrLink = `${globalThis.location.origin}/hotel/${hotelId}/menu`;
        updateState({ qrLink });
        
        QRCodeGenerator.toDataURL(qrLink, {
            width: 500, margin: 2,
            color: { dark: '#f97316', light: '#FFFFFF' },
            errorCorrectionLevel: 'H'
        }).then(url => updateState({ qrCodeDataUrl: url })).catch(console.error);
    }, [hotelId]);

    // Handlers
    const handleSaveAndPreview = async () => {
        try {
            updateState({ isProcessing: true });
            const data = {
                name: state.hotelName || 'Hotel',
                address: state.hotelAddress || '',
                contactNumber: state.hotelPhone || '',
                bannerImage: state.mainImage || '',
                logoImage: state.profileImage || '',
                type: 'hotel',
                updatedAt: new Date().toISOString()
            };
            
            if (hotelDocumentId) {
                await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotels, hotelDocumentId, data);
            } else {
                const newDoc = await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotels, ID.unique(), {
                    ...data, hotelId, createdAt: new Date().toISOString()
                });
                setHotelDocumentId(newDoc.$id);
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
            const serviceAmount = state.selectedProvider.pricing[state.selectedDuration];
            const commissionRate = 15; // 15% commission rate
            const commissionAmount = Math.round(serviceAmount * (commissionRate / 100));
            
            // 🔑 CRITICAL: Create booking with correct hotel ID for commission tracking
            const bookingDoc = await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.hotelBookings, ID.unique(), {
                bookingId, 
                therapistId: String(state.selectedProvider.id), 
                therapistName: state.selectedProvider.name,
                userId: '1', 
                hotelId: hotelId, // 🎯 Use actual hotel ID from props
                hotelName: state.hotelName || 'Hotel', 
                hotelLocation: state.hotelAddress,
                guestName: state.guestName, 
                roomNumber: state.roomNumber, 
                duration: state.selectedDuration,
                price: serviceAmount, 
                bookingTime,
                bookingDateTime: new Date().toISOString(), 
                status: 'pending', 
                createdAt: new Date().toISOString()
            });

            // 🔑 CRITICAL: Create commission record for tracking
            await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.commissionRecords, ID.unique(), {
                hotelVillaId: parseInt(hotelId),
                bookingId: bookingDoc.$id,
                providerId: parseInt(String(state.selectedProvider.id)),
                providerType: state.selectedProvider.type,
                providerName: state.selectedProvider.name,
                serviceAmount: serviceAmount,
                commissionRate: commissionRate,
                commissionAmount: commissionAmount,
                status: 'pending', // CommissionPaymentStatus.Pending
                bookingDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            updateState({ bookingConfirmed: true, bookingId, bookingTime });
            console.log(`✅ Booking created with commission tracking - Hotel: ${hotelId}, Commission: ${commissionAmount}`);
        } catch (_error) {
            console.error('Booking error:', _error);
            alert('Booking failed. Please try again.');
        } finally {
            updateState({ isProcessing: false });
        }
    };

    // 🔑 CRITICAL: Commission management functions - FIXED TO MANAGE THERAPIST STATUS
    const handleCommissionAction = async (recordId: string, action: 'verify' | 'reject', rejectionReason?: string) => {
        try {
            console.log(`🏨 Hotel ${hotelId} ${action}ing commission record ${recordId}`);
            
            if (action === 'verify') {
                // ✅ VERIFY: Use proper service that sets therapist back to Available
                await commissionPaymentService.verifyPayment(
                    parseInt(recordId),
                    parseInt(hotelId),
                    true // verified = true
                );
                console.log(`✅ Commission verified - Therapist is now Available again!`);
                alert('✅ Commission verified successfully!\n🟢 Therapist is now Available for new bookings.');
            } else {
                // ❌ REJECT: Use proper service that keeps therapist Busy
                await commissionPaymentService.verifyPayment(
                    parseInt(recordId),
                    parseInt(hotelId),
                    false, // verified = false
                    rejectionReason || 'Payment proof was unclear or invalid'
                );
                console.log(`❌ Commission rejected - Therapist remains Busy until reupload`);
                alert('❌ Commission rejected.\n🟡 Therapist remains Busy until they upload valid payment proof.');
            }

            // Reload commission records to reflect changes
            await loadCommissionRecords();
            
        } catch (error) {
            console.error(`Error ${action}ing commission:`, error);
            alert(`Failed to ${action} commission. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

            case 'menu':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Menu className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.guestMenuPreview')}</h2>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => window.open(state.qrLink, '_blank')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                Preview Live
                            </button>
                            <button onClick={() => updateState({ qrOpen: true })} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                                QR Code
                            </button>
                            <button onClick={() => navigator.clipboard.writeText(state.qrLink)} className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-orange-500 transition-colors">
                                Copy Link
                            </button>
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
                                    <div className="font-bold text-gray-900 text-lg">{state.hotelName}</div>
                                    <div className="text-xs text-gray-600 flex items-center gap-1.5"><Building size={12}/> {state.hotelAddress}</div>
                                    {state.hotelPhone && <div className="text-xs text-gray-600 flex items-center gap-1.5"><Phone size={12}/> {state.hotelPhone}</div>}
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

            case 'feedback':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Star className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
                        </div>
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-800">Guest Feedback</h3>
                            <p className="text-gray-500 mt-2">Guest reviews and feedback will appear here.</p>
                        </div>
                    </div>
                );

            case 'commissions':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Commissions</h2>
                                    <p className="text-sm text-gray-500">Hotel ID: {hotelId} • QR Code Connected</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => loadCommissionRecords()} 
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                                disabled={isLoadingCommissions}
                            >
                                {isLoadingCommissions ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {/* Commission Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Total Commissions</div>
                                <div className="text-2xl font-bold text-orange-600">
                                    Rp {commissionRecords.reduce((sum, record) => sum + (record.commissionAmount || 0), 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Pending</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {commissionRecords.filter(r => r.status === 'pending' || r.status === 'awaiting_verification').length}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Verified</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {commissionRecords.filter(r => r.status === 'verified').length}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Rejected</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {commissionRecords.filter(r => r.status === 'rejected').length}
                                </div>
                            </div>
                        </div>

                        {/* Bank Details for Commission Payments */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Payment Information for Therapists</h3>
                                        <p className="text-sm text-gray-600">Therapists use this information to pay commissions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateState({ activeTab: 'bank-details' })}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Manage Bank Details
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-600 mb-1">Hotel Name</p>
                                    <p className="font-semibold text-gray-900">{state.hotelName || 'Not set'}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-600 mb-1">WhatsApp</p>
                                    <p className="font-semibold text-gray-900">{state.hotelPhone || 'Not set'}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-600 mb-1">Address</p>
                                    <p className="font-semibold text-gray-900 text-xs">{state.hotelAddress || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-600">
                                    💡 <strong>Complete your bank details</strong> so therapists know where to send commission payments after service completion.
                                </p>
                            </div>
                        </div>

                        {/* Commission Records Table */}
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-800">Commission Records</h3>
                                <p className="text-xs text-gray-500">Bookings made through your QR code: {state.qrLink}</p>
                            </div>
                            
                            {isLoadingCommissions ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading commission records...</p>
                                </div>
                            ) : commissionRecords.length === 0 ? (
                                <div className="p-8 text-center">
                                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h4 className="font-semibold text-gray-800 mb-2">No Commission Records Yet</h4>
                                    <p className="text-gray-500 text-sm">Commission records will appear here when guests book services through your QR code.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {commissionRecords.map((record) => (
                                                <tr key={record.$id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{record.providerName}</div>
                                                            <div className="text-xs text-gray-500 capitalize">{record.providerType}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        Rp {record.serviceAmount?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-orange-600">Rp {record.commissionAmount?.toLocaleString()}</div>
                                                        <div className="text-xs text-gray-500">{record.commissionRate}%</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                record.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                                record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                record.status === 'awaiting_verification' ? 'bg-blue-100 text-blue-800' :
                                                                record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {record.status}
                                                            </span>
                                                            {/* Show therapist status impact */}
                                                            <div className="text-xs text-gray-500">
                                                                {record.status === 'verified' && record.providerType === 'therapist' && '🟢 Therapist: Available'}
                                                                {(record.status === 'pending' || record.status === 'awaiting_verification' || record.status === 'rejected') && record.providerType === 'therapist' && '🟡 Therapist: Busy'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(record.bookingDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {record.status === 'awaiting_verification' && (
                                                            <div className="space-y-1">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleCommissionAction(record.$id, 'verify')}
                                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                                        title={`Accept payment & set ${record.providerName} to Available`}
                                                                    >
                                                                        ✓ Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const reason = prompt('Rejection reason (optional):');
                                                                            if (reason !== null) { // User didn't cancel
                                                                                handleCommissionAction(record.$id, 'reject', reason);
                                                                            }
                                                                        }}
                                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                                        title={`Reject payment & keep ${record.providerName} Busy`}
                                                                    >
                                                                        ✗ Reject
                                                                    </button>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    💡 Accept = {record.providerType} becomes Available
                                                                </div>
                                                            </div>
                                                        )}
                                                        {record.status === 'verified' && (
                                                            <span className="text-green-600 text-xs font-medium">✓ Confirmed</span>
                                                        )}
                                                        {record.status === 'rejected' && (
                                                            <span className="text-red-600 text-xs font-medium">✗ Rejected</span>
                                                        )}
                                                        {record.status === 'pending' && (
                                                            <span className="text-yellow-600 text-xs font-medium">⏳ Pending</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
                                <div className="text-sm">
                                    <p className="font-medium text-blue-900 mb-1">How Commission Tracking Works:</p>
                                    <ul className="text-blue-800 space-y-1 text-xs">
                                        <li>• When guests scan your QR code and book services, commission records are automatically created</li>
                                        <li>• Therapists/Places upload payment proof after completing services</li>
                                        <li>• You can accept or reject commission payments based on proof verification</li>
                                        <li>• Each hotel/villa has its own unique QR code for accurate commission tracking</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bank-details':
                return (
                    <HotelVillaBankDetailsPage
                        hotelVilla={{
                            id: parseInt(hotelId),
                            name: state.hotelName || 'Hotel',
                            address: state.hotelAddress || '',
                            phone: state.hotelPhone || '',
                            email: '',
                            bankName: '',
                            bankAccountNumber: '',
                            bankAccountName: '',
                        }}
                        hotelVillaType="hotel"
                        onSave={async (updatedDetails) => {
                            console.log('Bank details saved:', updatedDetails);
                            // Update local state if needed
                            updateState({ 
                                hotelName: updatedDetails.name || state.hotelName,
                                hotelAddress: updatedDetails.address || state.hotelAddress,
                                hotelPhone: updatedDetails.phone || state.hotelPhone 
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
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.notifications')}</h2>
                        </div>
                        <PushNotificationSettings providerId={Number.parseInt(hotelId)} providerType="place" />
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

    // Navigation items for sidebar
    const navItems = [
        { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'blue', description: 'View performance metrics' },
        { id: 'discounts', icon: Percent, label: 'Discounts', color: 'green', description: 'Manage special offers' },
        { id: 'menu', icon: ClipboardList, label: 'Menu', badge: providers.length, color: 'indigo', description: 'Service providers' },
        { id: 'feedback', icon: MessageSquare, label: 'Feedback', color: 'yellow', description: 'Customer reviews' },
        { id: 'commissions', icon: DollarSign, label: 'Commissions', color: 'orange', description: 'Payment tracking' },
        { id: 'bank-details', icon: CreditCard, label: 'Bank Details', color: 'green', description: 'Payment information' },
        { id: 'notifications', icon: BellRing, label: 'Notifications', color: 'red', description: 'System alerts' },
    ];

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Global Header - IndaStreet Brand */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {/* Brand: Inda (black) + street (orange) */}
                        <span className="text-black">Inda</span><span className="text-orange-500">street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button 
                            onClick={() => updateState({ isSideDrawerOpen: true })} 
                            title="Menu" 
                            style={{ zIndex: 9999, position: 'relative' }}
                        >
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
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
                    <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl z-50 flex flex-col">
                        <div className="p-6 flex justify-between items-center border-b border-gray-200">
                            <h2 className="font-bold text-2xl text-gray-800">
                                Hotel Menu
                            </h2>
                            <button 
                                onClick={() => updateState({ isSideDrawerOpen: false })} 
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Close side menu"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                {navItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const colorClasses = {
                                        blue: 'border-blue-500 group-hover:text-blue-600 bg-gradient-to-br from-blue-500 to-blue-600',
                                        green: 'border-green-500 group-hover:text-green-600 bg-gradient-to-br from-green-500 to-green-600',
                                        orange: 'border-orange-500 group-hover:text-orange-600 bg-gradient-to-br from-orange-500 to-orange-600',
                                        indigo: 'border-indigo-500 group-hover:text-indigo-600 bg-gradient-to-br from-indigo-500 to-indigo-600',
                                        yellow: 'border-yellow-500 group-hover:text-yellow-600 bg-gradient-to-br from-yellow-500 to-yellow-600',
                                        teal: 'border-teal-500 group-hover:text-teal-600 bg-gradient-to-br from-teal-500 to-teal-600',
                                        emerald: 'border-emerald-500 group-hover:text-emerald-600 bg-gradient-to-br from-emerald-500 to-emerald-600',
                                        red: 'border-red-500 group-hover:text-red-600 bg-gradient-to-br from-red-500 to-red-600',
                                        purple: 'border-purple-500 group-hover:text-purple-600 bg-gradient-to-br from-purple-500 to-purple-600',
                                        gray: 'border-gray-500 group-hover:text-gray-600 bg-gradient-to-br from-gray-500 to-gray-600'
                                    }[item.color] || 'border-gray-500 group-hover:text-gray-600 bg-gradient-to-br from-gray-500 to-gray-600';
                                    
                                    const [borderClass, hoverTextClass, gradientClass] = colorClasses.split(' group-hover:');
                                    const [textHoverClass, bgGradientClass] = (hoverTextClass || '').split(' bg-gradient-to-br ');
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (item.id === 'menu' && setPage) {
                                                    // Navigate to live menu page instead of showing menu tab
                                                    setPage('hotelVillaMenu');
                                                } else {
                                                    updateState({ activeTab: item.id, isSideDrawerOpen: false });
                                                }
                                            }}
                                            className={`flex items-center gap-4 w-full text-left p-4 rounded-xl transition-all border-l-4 group transform hover:scale-105 ${
                                                state.activeTab === item.id 
                                                    ? `${borderClass} bg-gradient-to-r from-gray-50 to-white shadow-lg` 
                                                    : `${borderClass} bg-white shadow-sm hover:shadow-md`
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${bgGradientClass ? `from-${item.color}-500 to-${item.color}-600` : 'from-gray-500 to-gray-600'}`}>
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className={`font-semibold transition-colors ${
                                                    state.activeTab === item.id 
                                                        ? `text-${item.color}-600` 
                                                        : `text-gray-800 group-hover:text-${item.color}-600`
                                                }`}>
                                                    {item.label}
                                                </p>
                                                <p className="text-xs text-gray-500">{item.description}</p>
                                            </div>
                                            {item.badge && item.badge > 0 && (
                                                <span className={`ml-auto text-white text-xs rounded-full px-2.5 py-0.5 font-bold bg-gradient-to-br from-${item.color}-500 to-${item.color}-600`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                        <div className="p-4 bg-gray-50 border-t">
                            <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all transform hover:scale-105 shadow-sm hover:shadow-md">
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
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

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 z-20 mt-auto">
                <div className="px-4 py-3 max-w-[430px] sm:max-w-5xl mx-auto">
                    <p className="text-xs text-gray-500 text-center">
                        &copy; 2025 Hotel Dashboard
                    </p>
                </div>
            </footer>

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
                                            onClick={() => safeDownload(`https://chart.googleapis.com/chart?chs=600x600&cht=qr&chl=${encodeURIComponent(state.qrLink)}`, `${state.hotelName.replace(/\s+/g, '-')}-menu-qr.png`)}
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

export default HotelDashboardPage;