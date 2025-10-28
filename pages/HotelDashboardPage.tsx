import React, { useMemo, useState, useEffect } from 'react';
import { Building, Image as ImageIcon, Link as LinkIcon, LogOut, Menu, MessageSquare, Phone, QrCode, Star, Tag, User, Users, X, Bell } from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import { analyticsService } from '../services/analyticsService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import QRCodeGenerator from 'qrcode';
// import Header from '../components/dashboard/Header';
import TabButton from '../components/dashboard/TabButton';
import PushNotificationSettings from '../components/PushNotificationSettings';

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
    massageTypes: string[];
    status?: 'Available' | 'Busy' | 'Offline';
    languages?: string[];
}

interface HotelDashboardPageProps {
    onLogout: () => void;
    therapists?: Therapist[];
    places?: Place[];
    hotelId?: string;
}

const HotelDashboardPage: React.FC<HotelDashboardPageProps> = ({ onLogout, therapists = [], places = [], hotelId = '1' }) => {
    // Therapist banner images pool for randomization (must be defined before useMemo)
    const therapistBannerImages = [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600959907703-125ba1374a12?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
    ];

    const [activeTab, setActiveTab] = useState<'analytics' | 'discounts' | 'profile' | 'menu' | 'feedback' | 'concierge' | 'commissions' | 'notifications'>('analytics');
    const [customWelcomeMessage, setCustomWelcomeMessage] = useState('Welcome to our exclusive wellness experience');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    
    // Real analytics state
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    
    // Fetch real analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoadingAnalytics(true);
                const hotelId = 1; // TODO: Get actual hotel ID from props/auth
                const endDate = new Date().toISOString();
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days
                
                const data = await analyticsService.getHotelVillaAnalytics(
                    hotelId,
                    'hotel',
                    startDate,
                    endDate
                );
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoadingAnalytics(false);
            }
        };
        
        if (activeTab === 'analytics') {
            fetchAnalytics();
        }
    }, [activeTab]);

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
                let massageTypes: string[] = [];
                try {
                    massageTypes = JSON.parse(item.massageTypes || '[]');
                } catch (e) {
                    massageTypes = [];
                }
                // Get image - use mainImage for both therapists and places (same as home page)
                let image = (item as any).mainImage || placeholderImage;
                // If no image, assign random from banner pool
                if (!image || image === placeholderImage) {
                    image = therapistBannerImages[Math.floor(Math.random() * therapistBannerImages.length)];
                }
                list.push({
                    id: item.id,
                    name: item.name,
                    type,
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
        };
        therapists.forEach(t => add(t, 'therapist'));
        places.forEach(p => add(p, 'place'));
        return list;
    }, [therapists, places, therapistBannerImages]);

    // Mock providers for preview when no data is available
    const mockProviders: ProviderCard[] = useMemo(() => [
        {
            id: 't-001',
            name: 'Ayu Prameswari',
            type: 'therapist',
            image: therapistBannerImages[0],
            location: 'Kuta, Bali',
            rating: 4.9,
            reviewCount: 128,
            pricing: { '60': 250000, '90': 350000, '120': 450000 },
            discount: 15,
            whatsappNumber: '+628123456789',
            description: 'Certified Balinese therapist specializing in deep tissue and relaxation massage.',
            massageTypes: ['Deep Tissue', 'Swedish', 'Hot Stone', 'Aromatherapy', 'Balinese'],
            status: 'Available',
            languages: ['id', 'en', 'ja'],
        },
        {
            id: 't-002',
            name: 'Made Santika',
            type: 'therapist',
            image: therapistBannerImages[1],
            location: 'Ubud, Bali',
            rating: 4.8,
            reviewCount: 95,
            pricing: { '60': 280000, '90': 380000, '120': 480000 },
            discount: 20,
            whatsappNumber: '+628123456790',
            description: 'Expert in traditional Balinese massage with 10 years experience.',
            massageTypes: ['Balinese', 'Deep Tissue', 'Reflexology'],
            status: 'Busy',
            languages: ['id', 'en', 'zh', 'ko'],
        },
        {
            id: 'p-001',
            name: 'Serenity Spa & Wellness',
            type: 'place',
            image: therapistBannerImages[2],
            location: 'Seminyak, Bali',
            rating: 4.7,
            reviewCount: 256,
            pricing: { '60': 300000, '90': 420000, '120': 520000 },
            discount: 20,
            description: 'Modern wellness center offering aromatherapy and traditional Balinese treatments.',
            massageTypes: ['Aromatherapy', 'Balinese', 'Reflexology', 'Thai Massage'],
            status: 'Available',
            languages: ['id', 'en', 'zh', 'ja', 'ko', 'ru'],
        },
    ], [therapistBannerImages]);

    // Sort providers: Available first, then Busy
    const displayProviders = useMemo(() => {
        const providerList = providers.length ? providers : mockProviders;
        return [...providerList].sort((a, b) => {
            if (a.status === 'Available' && b.status !== 'Available') return -1;
            if (a.status !== 'Available' && b.status === 'Available') return 1;
            return 0;
        });
    }, [providers, mockProviders]);

    // Hotel profile / shared menu header data (persisted in Appwrite)
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [hotelName, setHotelName] = useState<string>('');
    const [hotelAddress, setHotelAddress] = useState<string>('');
    const [hotelPhone, setHotelPhone] = useState<string>('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [hotelDocumentId, setHotelDocumentId] = useState<string | null>(null);

    const [qrOpen, setQrOpen] = useState(false);
    const [qrLink, setQrLink] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [showLandingPage, setShowLandingPage] = useState(true);

    // Generate unique QR link for this hotel
    useEffect(() => {
        const baseUrl = window.location.origin;
        const uniqueLink = `${baseUrl}/hotel/${hotelId}/menu`;
        setQrLink(uniqueLink);
    }, [hotelId]);

    // Generate QR code when qrLink changes with orange branding
    useEffect(() => {
        if (qrLink) {
            QRCodeGenerator.toDataURL(qrLink, {
                width: 500,
                margin: 2,
                color: {
                    dark: '#f97316', // Orange-500 for brand consistency
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'H' // High error correction for logo overlay
            })
            .then(url => {
                setQrCodeDataUrl(url);
            })
            .catch(err => {
                console.error('Error generating QR code:', err);
            });
        }
    }, [qrLink]);

    // Load hotel profile data from Appwrite on mount
    useEffect(() => {
        const loadHotelProfile = async () => {
            try {
                setIsLoadingProfile(true);
                
                // Try to fetch existing hotel document by hotelId
                const response = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    [
                        // Query.equal('hotelId', hotelId) // Uncomment when you add hotelId field
                    ]
                );
                
                if (response.documents.length > 0) {
                    // Load existing data
                    const hotelData = response.documents[0];
                    setHotelDocumentId(hotelData.$id);
                    setHotelName(hotelData.name || '');
                    setHotelAddress(hotelData.address || '');
                    setHotelPhone(hotelData.contactNumber || '');
                    setMainImage(hotelData.bannerImage || null);
                    setProfileImage(hotelData.logoImage || null);
                    setCustomWelcomeMessage(hotelData.welcomeMessage || 'Welcome to our exclusive wellness experience');
                    setSelectedLanguage(hotelData.defaultLanguage || 'en');
                    console.log('✅ Loaded hotel profile from Appwrite:', hotelData);
                } else {
                    console.log('ℹ️ No existing hotel profile found, will create on first save');
                }
            } catch (error) {
                console.error('❌ Error loading hotel profile:', error);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        
        loadHotelProfile();
    }, [hotelId]);
    
    // Booking modal state
    const [bookingOpen, setBookingOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<ProviderCard | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<DurationKey>('60');
    const [guestName, setGuestName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSaveAndPreview = async () => {
        try {
            setIsProcessing(true);
            
            const hotelData = {
                name: hotelName || 'Hotel',
                address: hotelAddress || '',
                contactNumber: hotelPhone || '',
                bannerImage: mainImage || '',
                logoImage: profileImage || '',
                welcomeMessage: customWelcomeMessage,
                defaultLanguage: selectedLanguage,
                type: 'hotel',
                updatedAt: new Date().toISOString()
            };
            
            if (hotelDocumentId) {
                // Update existing document
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    hotelDocumentId,
                    hotelData
                );
                console.log('✅ Hotel profile updated successfully');
            } else {
                // Create new document
                const newDoc = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    ID.unique(),
                    {
                        ...hotelData,
                        hotelId: hotelId,
                        createdAt: new Date().toISOString()
                    }
                );
                setHotelDocumentId(newDoc.$id);
                console.log('✅ Hotel profile created successfully');
            }
            
            // Show success message
            alert('✅ Profile saved successfully!');
            
            // Open preview
            setShowLandingPage(true);
            setPreviewOpen(true);
        } catch (error) {
            console.error('❌ Error saving hotel profile:', error);
            alert('❌ Error saving profile. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOrderNow = (provider: ProviderCard, duration: DurationKey) => {
        setSelectedProvider(provider);
        setSelectedDuration(duration);
        setBookingOpen(true);
        setBookingConfirmed(false);
        setGuestName('');
        setRoomNumber('');
    };

    const handleProceedBooking = async () => {
        if (!guestName || !roomNumber || !selectedProvider) return;

        setIsProcessing(true);

        try {
            // Generate booking ID and timestamp
            const newBookingId = `BK${Date.now().toString().slice(-8)}`;
            const currentTime = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            setBookingId(newBookingId);
            setBookingTime(currentTime);

            // Create booking in Appwrite database
            // This will automatically notify the therapist through your app
            const bookingData = {
                bookingId: newBookingId,
                therapistId: String(selectedProvider.id),
                therapistName: selectedProvider.name,
                userId: '1', // TODO: Get actual guest/user ID from session
                hotelId: '1', // TODO: Get actual hotel ID from auth/props
                hotelName: hotelName || 'Hotel',
                hotelLocation: hotelAddress || 'Address not set',
                guestName,
                roomNumber,
                roomType: 'Standard', // TODO: Get actual room type if available
                numberOfGuests: 1, // Default to 1, can be updated if needed
                duration: selectedDuration,
                price: selectedProvider.pricing[selectedDuration],
                bookingTime: currentTime,
                bookingDateTime: new Date().toISOString(),
                checkInDate: new Date().toISOString(), // Booking date
                checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
                status: 'pending', // Therapist needs to confirm
                createdAt: new Date().toISOString(),
                confirmedAt: null,
                completedAt: null
            };

            // Save to Appwrite
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                ID.unique(),
                bookingData
            );

            console.log('Booking created successfully:', newBookingId);
            
            // The therapist will see this booking in their app dashboard
            // They'll get a real-time notification to confirm "On The Way"
            
            // Show success to guest
            setBookingConfirmed(true);
        } catch (error) {
            console.error('Booking error:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const closeBookingModal = () => {
        setBookingOpen(false);
        setSelectedProvider(null);
        setGuestName('');
        setRoomNumber('');
        setBookingConfirmed(false);
        setBookingId('');
        setBookingTime('');
    };

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
                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">
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
                                <div className="font-bold text-orange-600 text-base">Rp {Math.round(p.pricing[d] * (1 - p.discount/100)).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                        <button onClick={() => openQrFor(providerMenuUrl)} className="flex-1 text-center px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
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
                        {/* Page Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                                <p className="text-xs text-gray-500">Track your guest engagement and service usage</p>
                            </div>
                        </div>

                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <QrCode className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">This Month</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {isLoadingAnalytics ? '...' : (analytics?.totalQRScans || 0).toLocaleString()}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">QR Code Scans</p>
                                <div className="mt-4 flex items-center text-xs">
                                    <span className="text-orange-600 font-semibold">Real-time</span>
                                    <span className="text-gray-400 ml-2">Last 30 days</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Unique</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {isLoadingAnalytics ? '...' : (analytics?.uniqueGuestViews || 0).toLocaleString()}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Guest Views</p>
                                <div className="mt-4 flex items-center text-xs">
                                    <span className="text-orange-600 font-semibold">Real-time</span>
                                    <span className="text-gray-400 ml-2">Last 30 days</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Total</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {isLoadingAnalytics ? '...' : (analytics?.totalBookings || 0).toLocaleString()}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Bookings Made</p>
                                <div className="mt-4 flex items-center text-xs">
                                    <span className="text-orange-600 font-semibold">Real-time</span>
                                    <span className="text-gray-400 ml-2">Last 30 days</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <Star className="w-6 h-6 text-orange-600" fill="currentColor" />
                                    </div>
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Average</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
                                <p className="text-sm text-gray-600 mt-1">Guest Rating</p>
                                <div className="mt-4 flex items-center text-xs">
                                    <span className="text-green-600 font-semibold">↑ 0.2</span>
                                    <span className="text-gray-400 ml-2">vs last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Providers */}
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Providers</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Ayu Prameswari', type: 'Therapist', bookings: 45, rating: 4.9 },
                                    { name: 'Serenity Spa', type: 'Place', bookings: 38, rating: 4.8 },
                                    { name: 'Made Wijaya', type: 'Therapist', bookings: 32, rating: 4.7 },
                                ].map((provider, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{provider.name}</p>
                                                <p className="text-xs text-gray-500">{provider.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">{provider.bookings} bookings</p>
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
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Booking Hours</h3>
                            <div className="grid grid-cols-12 gap-2 items-end h-40">
                                {[20, 35, 45, 60, 80, 95, 100, 85, 70, 50, 30, 15].map((height, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div 
                                            className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg hover:from-orange-600 hover:to-orange-400 transition-all cursor-pointer"
                                            style={{ height: `${height}%` }}
                                        />
                                        <span className="text-xs text-gray-500 mt-2">{idx + 9}h</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'discounts':
                return (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Tag className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Discounted Therapists & Places</h2>
                                <p className="text-xs text-gray-500">All providers offering discounts for your guests</p>
                            </div>
                        </div>

                        {providers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayProviders.map((p) => (
                                    <DiscountCard key={`${p.type}-${p.id}`} data={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-xl font-semibold text-gray-800">No Discounted Partners Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">When therapists or massage places in the IndoStreet network offer a special discount for your guests, they will automatically appear here.</p>
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Building className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Hotel Profile</h2>
                                <p className="text-xs text-gray-500">Set up your hotel branding</p>
                            </div>
                        </div>
                        
                        {/* Loading State */}
                        {isLoadingProfile ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading profile data...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                        {/* Banner and Profile Image - Like Therapist Card */}
                        <div className="relative">
                            {/* Banner Image Upload - Full Width */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setMainImage(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                    id="hotel-banner"
                                />
                                <label
                                    htmlFor="hotel-banner"
                                    className="block w-full h-48 cursor-pointer relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 hover:bg-orange-50 transition-all group"
                                >
                                    {mainImage ? (
                                        <>
                                            <img src={mainImage} alt="Banner" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Click to change banner</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <p className="text-sm font-medium text-gray-700">Upload Banner Image</p>
                                            <p className="text-xs text-gray-500 mt-1">Click to select your hotel's banner image</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            
                            {/* Profile Image - Overlapping on Left Side */}
                            <div className="absolute top-32 left-6 z-10">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setProfileImage(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                    id="hotel-profile-round"
                                />
                                <label
                                    htmlFor="hotel-profile-round"
                                    className="block w-24 h-24 rounded-full border-4 border-white shadow-lg cursor-pointer bg-white overflow-hidden hover:ring-4 hover:ring-orange-500 hover:ring-opacity-50 transition-all group"
                                    title="Click to upload logo"
                                >
                                    {profileImage ? (
                                        <img src={profileImage} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-orange-50 transition-colors">
                                            <User className="w-10 h-10 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        {/* Add spacing for overlapping profile image */}
                        <div className="mt-16"></div>
                        
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Building className="w-4 h-4 text-orange-500" />
                                Hotel/Villa Name
                            </label>
                            <input 
                                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                placeholder="Enter your hotel or villa name" 
                                value={hotelName} 
                                onChange={(e) => setHotelName(e.target.value)} 
                            />
                        </div>
                        
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Address or Location
                            </label>
                            <textarea 
                                className="w-full p-4 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px] resize-none" 
                                placeholder="Enter complete address&#10;Street, District, City, Postal Code&#10;Include landmarks if helpful" 
                                value={hotelAddress} 
                                onChange={(e) => setHotelAddress(e.target.value)} 
                            />
                        </div>
                        
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 text-orange-500" />
                                Contact Phone (optional)
                            </label>
                            <input 
                                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                placeholder="+62 123 456 789" 
                                value={hotelPhone} 
                                onChange={(e) => setHotelPhone(e.target.value)} 
                            />
                        </div>

                        {/* Multi-Language Support */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Language Support</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Select languages to enable for your guest menu
                            </p>
                            <div className="grid grid-cols-4 gap-3">
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
                                        className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                                            selectedLanguage === lang.code
                                                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                                : 'border-gray-300 bg-white hover:border-orange-300'
                                        }`}
                                    >
                                        <div className="text-xl mb-1">{lang.flag}</div>
                                        <div className="text-[10px] font-medium text-gray-700 text-center">{lang.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button 
                                onClick={handleSaveAndPreview}
                                disabled={isProcessing}
                                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Save & Preview Menu
                                    </>
                                )}
                            </button>
                        </div>
                        </>
                        )}
                    </div>
                );
            case 'menu':
                return (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <Menu className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Guest Menu Preview</h2>
                                    <p className="text-xs text-gray-500">How your menu appears to guests</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setQrOpen(true)}
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold flex items-center gap-2"
                                >
                                    <QrCode size={16} />
                                    QR Code
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(qrLink)}
                                    className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-orange-500 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <LinkIcon size={16} />
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        {/* Menu Preview Card */}
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
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

                        {/* Providers List */}
                        {providers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayProviders.map((p) => (
                                    <DiscountCard key={`${p.type}-${p.id}`} data={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-xl font-semibold text-gray-800">No Providers Available</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">Therapists and places will appear here when they join the network.</p>
                            </div>
                        )}
                    </div>
                );
            case 'feedback':
                return (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Guest Feedback & Ratings</h2>
                                <p className="text-xs text-gray-500">Monitor guest satisfaction and provider performance</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <Star className="w-6 h-6 text-orange-600" fill="currentColor" />
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
                                                    className="h-full bg-orange-500 rounded-full"
                                                    style={{ width: `${stars === 5 ? 85 : stars === 4 ? 10 : 3}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{stars === 5 ? '85%' : stars === 4 ? '10%' : '3%'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-xl p-6">
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

                        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Provider Performance Summary</h3>
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
                    </div>
                );
            case 'concierge':
                return (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Concierge Dashboard</h2>
                                <p className="text-xs text-gray-500">Manage guest requests and coordinate with providers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Actions */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button className="w-full p-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            New Booking Request
                                        </button>
                                        <button className="w-full p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2">
                                            <Phone className="w-5 h-5" />
                                            Call Provider
                                        </button>
                                        <button className="w-full p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            Send Message
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
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
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
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
                                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
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
                    </div>
                );
            case 'commissions':
                return (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Commission Tracking</h2>
                                <p className="text-xs text-gray-500">Monitor your earnings from service bookings</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">This Month</p>
                                        <h3 className="text-2xl font-bold text-gray-900">Rp 4.2M</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-orange-600 font-medium">↑ 18% vs last month</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Avg Commission</p>
                                        <h3 className="text-2xl font-bold text-gray-900">20%</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Per booking</p>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Recent Commission Transactions</h3>
                                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
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
                                            { date: 'Oct 25, 2025', provider: 'Ayu Prameswari', service: '90 min', amount: 350000, rate: 20, commission: 70000, status: 'paid' },
                                            { date: 'Oct 25, 2025', provider: 'Serenity Spa', service: '120 min', amount: 520000, rate: 20, commission: 104000, status: 'paid' },
                                            { date: 'Oct 26, 2025', provider: 'Made Wijaya', service: '60 min', amount: 250000, rate: 20, commission: 50000, status: 'pending' },
                                            { date: 'Oct 26, 2025', provider: 'Ayu Prameswari', service: '120 min', amount: 450000, rate: 20, commission: 90000, status: 'pending' },
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
                                            You earn <strong className="text-orange-600">20% commission</strong> on all completed bookings. Commissions are calculated automatically and paid immediately after each therapist completes their service with the guest.
                                        </p>
                                    </div>
                                </div>
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
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Push Notifications</h2>
                                <p className="text-xs text-gray-500">Get alerts even when browsing other apps or phone is locked</p>
                            </div>
                        </div>
                        <PushNotificationSettings 
                            providerId={parseInt(hotelId)} 
                            providerType="place" 
                        />
                    </div>
                );
        }
    };

    return (

        <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] sm:max-w-none mx-auto">
            {/* Top Navigation Bar - Mobile Optimized */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                {/* Mobile: Hotel Name & Logo */}
                <div className="flex items-center justify-between mb-2 sm:mb-0">
                    <h1 className="text-base sm:text-2xl font-bold text-gray-800">
                        <span className="text-orange-500">IndaStreet</span>
                    </h1>
                    <div className="flex items-center gap-1 sm:gap-4">
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center text-gray-900 hover:text-gray-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Navigation Buttons - Two Rows */}
                <div className="space-y-1">
                    {/* First Row */}
                    <div 
                        className="flex gap-1 overflow-x-auto pb-1" 
                        style={{
                            scrollbarWidth: 'none', 
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <TabButton
                            icon={<svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            label="Analytics"
                            isActive={activeTab === 'analytics'}
                            onClick={() => setActiveTab('analytics')}
                        />
                        <TabButton
                            icon={<Tag size={14} className="sm:w-5 sm:h-5" />}
                            label="Discounts"
                            isActive={activeTab === 'discounts'}
                            onClick={() => setActiveTab('discounts')}
                        />
                        <TabButton
                            icon={<User size={14} className="sm:w-5 sm:h-5" />}
                            label="Profile"
                            isActive={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <TabButton
                            icon={<Menu size={14} className="sm:w-5 sm:h-5" />}
                            label="Menu"
                            isActive={activeTab === 'menu'}
                            onClick={() => setActiveTab('menu')}
                            badge={providers.length}
                        />
                    </div>
                    
                    {/* Second Row */}
                    <div 
                        className="flex gap-1 overflow-x-auto pb-1" 
                        style={{
                            scrollbarWidth: 'none', 
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <TabButton
                            icon={<Star size={14} className="sm:w-5 sm:h-5" />}
                            label="Feedback"
                            isActive={activeTab === 'feedback'}
                            onClick={() => setActiveTab('feedback')}
                        />
                        <TabButton
                            icon={<Users size={14} className="sm:w-5 sm:h-5" />}
                            label="Concierge"
                            isActive={activeTab === 'concierge'}
                            onClick={() => setActiveTab('concierge')}
                        />
                        <TabButton
                            icon={<svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            label="Commissions"
                            isActive={activeTab === 'commissions'}
                            onClick={() => setActiveTab('commissions')}
                        />
                        <TabButton
                            icon={<Bell size={14} className="sm:w-5 sm:h-5" />}
                            label="Notifications"
                            isActive={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-2 py-3 sm:p-4 md:p-6 lg:p-8">{renderTabContent()}
            </main>

            {/* QR Modal - Professional Design with Hotel Branding */}
            {qrOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setQrOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header with Orange Gradient */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Guest Menu QR Code</h3>
                                    <p className="text-orange-100 text-xs mt-0.5">Share with your guests</p>
                                </div>
                                <button 
                                    onClick={() => setQrOpen(false)} 
                                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                        </div>

                        {/* QR Code Display Area */}
                        <div className="p-6">
                            <div className="flex flex-col items-center">
                                {/* QR Code Container with Brand Design */}
                                <div className="relative">
                                    {/* Decorative corners */}
                                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl"></div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl"></div>
                                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl"></div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl"></div>
                                    
                                    {/* QR Code with White Background */}
                                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                                        {qrCodeDataUrl ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-center">
                                                    <img 
                                                        src={qrCodeDataUrl} 
                                                        alt="QR code" 
                                                        className="w-64 h-64 object-contain" 
                                                        style={{ imageRendering: 'pixelated' }}
                                                    />
                                                </div>
                                                {/* Hotel Name Below QR Code */}
                                                <div className="text-center pt-3 border-t-2 border-gray-200">
                                                    <div className="text-xs text-gray-500 mb-1">Scan to view menu for</div>
                                                    <div className="text-lg font-bold">
                                                        <span className="text-gray-900">Inda</span>
                                                        <span className="text-orange-500">Street</span>
                                                    </div>
                                                    <div className="text-base font-semibold text-gray-700 mt-0.5">
                                                        {hotelName || 'Your Hotel'}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-64 h-64 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                                                    <p className="text-sm text-gray-500 mt-4">Generating...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-5 w-full space-y-2">
                                    <button 
                                        onClick={downloadQR} 
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <QrCode size={18} /> 
                                        <span>Download QR Code</span>
                                    </button>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(qrLink);
                                                alert('Link copied!');
                                            }} 
                                            className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors border-2 border-gray-200"
                                        >
                                            <LinkIcon size={16} />
                                            <span className="text-xs">Copy</span>
                                        </button>
                                        <button 
                                            onClick={shareWhatsApp} 
                                            className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                        >
                                            <MessageSquare size={16} />
                                            <span className="text-xs">WhatsApp</span>
                                        </button>
                                        <button 
                                            onClick={() => window.open(`mailto:?subject=Menu%20-%20${encodeURIComponent(hotelName || 'Hotel')}&body=${encodeURIComponent(qrLink)}`)} 
                                            className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            <span className="text-xs">Email</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Preview Modal */}
            {previewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl relative">
                        {/* Floating Close Button */}
                        <button 
                            onClick={() => {
                                setPreviewOpen(false);
                                setShowLandingPage(true);
                            }}
                            className="absolute top-4 right-4 z-50 p-2 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
                        >
                            <X size={20} className="text-gray-900" />
                        </button>
                        
                        {/* Preview Content - Scrollable */}
                        <div className="overflow-y-auto max-h-[90vh]">
                            {showLandingPage ? (
                                /* Landing Page - Language Selection */
                                <div className="relative min-h-screen">
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <img 
                                            src="https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4199000d2acdf338/view?project=68f23b11000d25eb3664"
                                            alt="Massage background"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="relative p-4 sm:p-8">

                                    {/* Hotel Info */}
                                    <div className="text-center mb-6 sm:mb-8 mt-20 sm:mt-32">
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                                            {hotelName || 'Hotel Massage'}
                                        </h1>
                                        <h2 className="text-2xl sm:text-3xl font-semibold text-yellow-600">
                                            Massage Directory Room Service
                                        </h2>
                                    </div>

                                    {/* Language Selection */}
                                    <div className="mb-6">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
                                            Select Your Language
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
                                            {[
                                                { code: 'en', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe465d0003abec873e/view?project=68f23b11000d25eb3664', name: 'English' },
                                                { code: 'id', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe465e001e949c568b/view?project=68f23b11000d25eb3664', name: 'Indonesian' },
                                                { code: 'zh', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe465f002a12d99ed7/view?project=68f23b11000d25eb3664', name: 'Chinese' },
                                                { code: 'ja', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe46600031867275b5/view?project=68f23b11000d25eb3664', name: 'Japanese' },
                                                { code: 'kp', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4661003cb293c3b6/view?project=68f23b11000d25eb3664', name: 'North Korean' },
                                                { code: 'ko', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4663000b35ef92d7/view?project=68f23b11000d25eb3664', name: 'Korean' },
                                                { code: 'ru', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4664001947c227e6/view?project=68f23b11000d25eb3664', name: 'Russian' },
                                                { code: 'fr', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe46650025458f2175/view?project=68f23b11000d25eb3664', name: 'French' },
                                                { code: 'de', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe466600307d55fcb3/view?project=68f23b11000d25eb3664', name: 'German' },
                                                { code: 'es', flag: 'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4667003c1bf2059c/view?project=68f23b11000d25eb3664', name: 'Spanish' }
                                            ].map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setSelectedLanguage(lang.code);
                                                        setShowLandingPage(false);
                                                    }}
                                                    className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-transparent hover:bg-yellow-50/30 rounded-xl transition-all transform hover:scale-105"
                                                >
                                                    <img src={lang.flag} alt={lang.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg" />
                                                    <span className="text-xs font-medium text-yellow-600">{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            Please Allow 1 Hour For Therapist Arrival
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-2 italic">
                                            Enjoy Your Massage
                                        </p>
                                    </div>
                                    </div>
                                </div>
                            ) : (
                                /* Therapist Menu */
                                <>
                            {/* Hotel Info */}
                            <div className="p-4 pt-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
                                    Massage Therapist
                                </h2>
                                <p className="text-xs text-gray-500 text-center mb-6">
                                    Please Allow 1 Hour For Therapist Arrival To Your Room
                                </p>

                                {/* Menu Title */}
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Hotel Therapist</h3>

                                {/* Sample Service Cards - Same Style as Home Page */}
                                <div className="space-y-6">
                                    {displayProviders.slice(0, 10).map((provider, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 relative">
                                            {/* Banner Image */}
                                            <div className="relative h-48">
                                                <img 
                                                    src={provider.image} 
                                                    alt={provider.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Star Rating Badge */}
                                                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                                    <span className="font-bold text-white text-sm">{provider.rating.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-300">({provider.reviewCount})</span>
                                                </div>
                                                
                                                {/* Status Badge - Top Right */}
                                                <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg ${
                                                    provider.status === 'Available' 
                                                        ? 'bg-green-500/90 backdrop-blur-md' 
                                                        : 'bg-red-500/90 backdrop-blur-md'
                                                }`}>
                                                    {provider.status === 'Available' ? (
                                                        <>
                                                            <span className="relative flex h-2.5 w-2.5">
                                                                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                            </span>
                                                            <span className="text-xs font-bold text-white">Available</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="h-2.5 w-2.5 rounded-full bg-white"></span>
                                                            <span className="text-xs font-bold text-white">Busy</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Profile Picture Overlay */}
                                            <div className="absolute top-40 left-4 z-10">
                                                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden relative">
                                                    <img 
                                                        src={provider.image}
                                                        alt={provider.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Name Only */}
                                            <div className="absolute top-52 left-28 right-4 z-10">
                                                <h4 className="text-lg font-bold text-gray-900">{provider.name}</h4>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-4 pt-14">
                                                <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
                                                
                                                {/* Massage Types */}
                                                {provider.massageTypes && provider.massageTypes.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">Services Offered:</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {provider.massageTypes.map((type, idx) => (
                                                                <span 
                                                                    key={idx}
                                                                    className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium"
                                                                >
                                                                    {type}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Languages Spoken */}
                                                {provider.languages && Array.isArray(provider.languages) && provider.languages.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">Therapist Speaks:</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {provider.languages.map((lang, idx) => {
                                                                const langMap: Record<string, {flag: string, name: string}> = {
                                                                    'en': {flag: '🇬🇧', name: 'English'},
                                                                    'id': {flag: '🇮🇩', name: 'Indonesian'},
                                                                    'zh': {flag: '🇨🇳', name: 'Chinese'},
                                                                    'ja': {flag: '🇯🇵', name: 'Japanese'},
                                                                    'ko': {flag: '🇰🇷', name: 'Korean'},
                                                                    'ru': {flag: '🇷🇺', name: 'Russian'},
                                                                    'fr': {flag: '🇫🇷', name: 'French'},
                                                                    'de': {flag: '🇩🇪', name: 'German'},
                                                                    'es': {flag: '🇪🇸', name: 'Spanish'}
                                                                };
                                                                const langInfo = langMap[lang] || {flag: '🌐', name: lang};
                                                                return (
                                                                    <span 
                                                                        key={idx}
                                                                        className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1"
                                                                    >
                                                                        <span className="text-sm">{langInfo.flag}</span>
                                                                        <span>{langInfo.name}</span>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Pricing - Clickable */}
                                                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                                                    <button 
                                                        onClick={() => handleOrderNow(provider, '60')}
                                                        className="bg-black/70 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 transition-all border-2 border-yellow-400 shadow-lg shadow-yellow-400/50"
                                                    >
                                                        <p className="text-yellow-400">60 min</p>
                                                        <p className="font-bold text-white">Rp {(provider.pricing['60'] / 1000).toFixed(0)}K</p>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOrderNow(provider, '90')}
                                                        className="bg-black/70 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 transition-all border-2 border-yellow-400 shadow-lg shadow-yellow-400/50"
                                                    >
                                                        <p className="text-yellow-400">90 min</p>
                                                        <p className="font-bold text-white">Rp {(provider.pricing['90'] / 1000).toFixed(0)}K</p>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOrderNow(provider, '120')}
                                                        className="bg-black/70 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 transition-all border-2 border-yellow-400 shadow-lg shadow-yellow-400/50"
                                                    >
                                                        <p className="text-yellow-400">120 min</p>
                                                        <p className="font-bold text-white">Rp {(provider.pricing['120'] / 1000).toFixed(0)}K</p>
                                                    </button>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleOrderNow(provider, '60')}
                                                        className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                        </svg>
                                                        Order Now
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOrderNow(provider, '60')}
                                                        className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Schedule
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Language Indicator */}
                                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                                    <p className="text-xs text-gray-500">
                                        Language: {selectedLanguage.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            </>
                            )}
                        </div>

                        {/* Preview Footer */}
                        {!showLandingPage && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <button 
                                onClick={() => setPreviewOpen(false)}
                                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {bookingOpen && selectedProvider && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        {!bookingConfirmed ? (
                            <>
                                {/* Booking Form */}
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">Complete Booking</h2>
                                        <button 
                                            onClick={closeBookingModal}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="w-6 h-6 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Therapist Info */}
                                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                        <img 
                                            src={selectedProvider.image} 
                                            alt={selectedProvider.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900">{selectedProvider.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                                <span className="text-sm text-gray-600">{selectedProvider.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Service */}
                                    <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">Duration</p>
                                                <p className="font-bold text-lg text-orange-600">{selectedDuration} minutes</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Price</p>
                                                <p className="font-bold text-lg text-orange-600">
                                                    Rp {(selectedProvider.pricing[selectedDuration] / 1000).toFixed(0)}K
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guest Information Form */}
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Guest Name
                                            </label>
                                            <input 
                                                type="text"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Room Number
                                            </label>
                                            <input 
                                                type="text"
                                                value={roomNumber}
                                                onChange={(e) => setRoomNumber(e.target.value)}
                                                placeholder="Enter your room number"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Proceed Button */}
                                    <button 
                                        onClick={handleProceedBooking}
                                        disabled={!guestName || !roomNumber || isProcessing}
                                        className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Proceed'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Confirmation Message */}
                                <div className="p-8 text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Massage Booked Successfully!
                                    </h2>
                                    
                                    <p className="text-gray-600 mb-6">
                                        Your massage therapist will arrive at your room shortly.
                                    </p>

                                    {/* Booking Details */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                                            <span className="text-sm text-gray-600">Booking ID:</span>
                                            <span className="font-bold text-gray-900">{bookingId}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Booking Time:</span>
                                            <span className="font-semibold text-gray-900 text-sm">{bookingTime}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={closeBookingModal}
                                        className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelDashboardPage;