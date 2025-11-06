import { useState, useEffect, useMemo } from 'react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import { getAllTherapistImages } from '../utils/therapistImageUtils';
import { analyticsService } from '../services/analyticsService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import QRCodeGenerator from 'qrcode';

export interface ProviderCard {
    id: string | number;
    name: string;
    type: 'therapist' | 'place';
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    pricing: Record<string, number>;
    discount: number;
    whatsappNumber?: string;
    description: string;
    massageTypes: string[];
    status?: 'Available' | 'Busy' | 'Offline';
    languages?: string[];
}

export const useDashboardLogic = (
    type: 'hotel' | 'villa',
    entityId: string,
    therapists: Therapist[] = [],
    places: Place[] = [],
    initialTab: string = 'analytics'
) => {
    // State management
    const [activeTab, setActiveTab] = useState(initialTab);
    const [customWelcomeMessage, setCustomWelcomeMessage] = useState('Welcome to our exclusive wellness experience');
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    
    // Real analytics state
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    
    // Profile data
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [entityName, setEntityName] = useState<string>('');
    const [entityAddress, setEntityAddress] = useState<string>('');
    const [entityPhone, setEntityPhone] = useState<string>('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [entityDocumentId, setEntityDocumentId] = useState<string | null>(null);

    // QR and modal states
    const [qrOpen, setQrOpen] = useState(false);
    const [qrLink, setQrLink] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [showLandingPage, setShowLandingPage] = useState(true);
    
    // Booking modal state
    const [bookingOpen, setBookingOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<ProviderCard | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<string>('60');
    const [guestName, setGuestName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Constants
    const therapistBannerImages = getAllTherapistImages();
    const placeholderImage = 'https://images.unsplash.com/photo-1600959907703-125ba1374a12?q=80&w=1200&auto=format&fit=crop';

    // Providers logic
    const providers = useMemo<ProviderCard[]>(() => {
        const list: ProviderCard[] = [];
        const add = (item: Therapist | Place, itemType: 'therapist' | 'place') => {
            const status = item.hotelVillaServiceStatus ?? HotelVillaServiceStatus.NotOptedIn;
            const discount = (item as any).hotelDiscount || 0;
            if (status === HotelVillaServiceStatus.OptedIn && discount > 0) {
                const pricing = parsePricing(item.pricing) as unknown as Record<string, number>;
                let massageTypes: string[] = [];
                try {
                    massageTypes = JSON.parse(item.massageTypes || '[]');
                } catch {
                    massageTypes = [];
                }
                let image = (item as any).mainImage || placeholderImage;
                if (!image || image === placeholderImage) {
                    image = therapistBannerImages[Math.floor(Math.random() * therapistBannerImages.length)];
                }
                list.push({
                    id: item.id,
                    name: item.name,
                    type: itemType,
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

    // Mock providers for preview
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
            languages: ['id', 'en'],
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
            languages: ['id', 'en'],
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
            languages: ['id', 'en'],
        },
    ], [therapistBannerImages]);

    // Display providers (sorted by availability)
    const displayProviders = useMemo(() => {
        const providerList = providers.length ? providers : mockProviders;
        return [...providerList].sort((a, b) => {
            if (a.status === 'Available' && b.status !== 'Available') return -1;
            if (a.status !== 'Available' && b.status === 'Available') return 1;
            return 0;
        });
    }, [providers, mockProviders]);

    // Effects
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoadingAnalytics(true);
                const endDate = new Date().toISOString();
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                
                const data = await analyticsService.getHotelVillaAnalytics(
                    parseInt(entityId),
                    type,
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
    }, [activeTab, entityId, type]);

    // Generate unique QR link
    useEffect(() => {
        const baseUrl = window.location.origin;
        const uniqueLink = `${baseUrl}/${type}/${entityId}/menu`;
        setQrLink(uniqueLink);
    }, [entityId, type]);

    // Generate QR code
    useEffect(() => {
        if (qrLink) {
            QRCodeGenerator.toDataURL(qrLink, {
                width: 500,
                margin: 2,
                color: {
                    dark: '#f97316',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'H'
            })
            .then(url => setQrCodeDataUrl(url))
            .catch(err => console.error('Error generating QR code:', err));
        }
    }, [qrLink]);

    // Load profile data
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoadingProfile(true);
                
                const response = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    []
                );
                
                if (response.documents.length > 0) {
                    const data = response.documents[0];
                    setEntityDocumentId(data.$id);
                    setEntityName(data.name || '');
                    setEntityAddress(data.address || '');
                    setEntityPhone(data.contactNumber || '');
                    setMainImage(data.bannerImage || null);
                    setProfileImage(data.logoImage || null);
                    setCustomWelcomeMessage(data.welcomeMessage || 'Welcome to our exclusive wellness experience');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        
        loadProfile();
    }, [entityId]);

    // Handler functions
    const handleSaveAndPreview = async () => {
        try {
            setIsProcessing(true);
            
            const data = {
                name: entityName || (type === 'hotel' ? 'Hotel' : 'Villa'),
                address: entityAddress || '',
                contactNumber: entityPhone || '',
                bannerImage: mainImage || '',
                logoImage: profileImage || '',
                welcomeMessage: customWelcomeMessage,
                type: type,
                updatedAt: new Date().toISOString()
            };
            
            if (entityDocumentId) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    entityDocumentId,
                    data
                );
            } else {
                const newDoc = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    ID.unique(),
                    {
                        ...data,
                        [`${type}Id`]: entityId,
                        createdAt: new Date().toISOString()
                    }
                );
                setEntityDocumentId(newDoc.$id);
            }
            
            alert('✅ Profile saved successfully!');
            setShowLandingPage(true);
            setPreviewOpen(true);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('❌ Error saving profile. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOrderNow = (provider: ProviderCard, duration: string) => {
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

            const bookingData = {
                bookingId: newBookingId,
                therapistId: String(selectedProvider.id),
                therapistName: selectedProvider.name,
                userId: '1',
                [`${type}Id`]: '1',
                [`${type}Name`]: entityName || (type === 'hotel' ? 'Hotel' : 'Villa'),
                [`${type}Location`]: entityAddress || 'Address not set',
                guestName,
                roomNumber,
                roomType: 'Standard',
                numberOfGuests: 1,
                duration: selectedDuration,
                price: selectedProvider.pricing[selectedDuration],
                bookingTime: currentTime,
                bookingDateTime: new Date().toISOString(),
                checkInDate: new Date().toISOString(),
                checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                createdAt: new Date().toISOString(),
                confirmedAt: null,
                completedAt: null
            };

            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                ID.unique(),
                bookingData
            );

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

    return {
        // State
        activeTab,
        setActiveTab,
        customWelcomeMessage,
        setCustomWelcomeMessage,
        isSideDrawerOpen,
        setIsSideDrawerOpen,
        analytics,
        isLoadingAnalytics,
        mainImage,
        setMainImage,
        profileImage,
        setProfileImage,
        entityName,
        setEntityName,
        entityAddress,
        setEntityAddress,
        entityPhone,
        setEntityPhone,
        isLoadingProfile,
        entityDocumentId,
        qrOpen,
        setQrOpen,
        qrLink,
        qrCodeDataUrl,
        previewOpen,
        setPreviewOpen,
        showLandingPage,
        setShowLandingPage,
        bookingOpen,
        selectedProvider,
        selectedDuration,
        setSelectedDuration,
        guestName,
        setGuestName,
        roomNumber,
        setRoomNumber,
        bookingConfirmed,
        bookingId,
        bookingTime,
        isProcessing,
        
        // Data
        providers,
        displayProviders,
        placeholderImage,
        
        // Handlers
        handleSaveAndPreview,
        handleOrderNow,
        handleProceedBooking,
        closeBookingModal,
        openQrFor,
    };
};