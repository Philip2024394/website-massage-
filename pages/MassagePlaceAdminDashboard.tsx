import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Place, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages } from '../utils/appwriteHelpers';
import '../lib/appwriteService';
import { User, Calendar, TrendingUp, Hotel, FileCheck, LogOut, Bell, Tag, Menu, Crown, Coins, History } from 'lucide-react';
import { useTranslations } from '../lib/useTranslations';
import DiscountSharePage from './DiscountSharePage';
import MembershipPlansPage from './MembershipPlansPage';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import { TherapistProfileForm } from '../components/therapist/TherapistProfileForm';
import TherapistTermsPage from './TherapistTermsPage';
// Removed import - Job Opportunities page removed as it's available in live app
// import TherapistJobOpportunitiesPage from './TherapistJobOpportunitiesPage';
import PushNotificationSettings from '../components/PushNotificationSettings';
import Footer from '../components/Footer';
import TherapistNotifications from '../components/TherapistNotifications';
// Removed chat import - chat system removed
// import MemberChatWindow from '../components/MemberChatWindow';
import '../utils/pricingHelper'; // Load pricing helper for console access


interface MassagePlaceAdminDashboardProps {
    place: Place;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigate?: (page: Page) => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    onSave?: (data: any) => void; // Add onSave prop
    handleNavigateToAdminLogin?: () => void;
    bookings?: Booking[]; // Make optional to handle undefined cases
    notifications: Notification[];
    t: any;
}

const AnalyticsCard: React.FC<{ title: string; value: number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-4xl font-bold text-orange-600 mt-2">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);

const BookingCard: React.FC<{ booking: Booking; onUpdateStatus: (id: number, status: BookingStatus) => void; t: any }> = ({ booking, onUpdateStatus, t }) => {
    const isPending = booking.status === BookingStatus.Pending;
    const isUpcoming = new Date(booking.startTime) > new Date();

    const statusColors = {
        [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        [BookingStatus.Confirmed]: 'bg-green-100 text-green-800 border-green-300',
        [BookingStatus.OnTheWay]: 'bg-blue-100 text-blue-800 border-blue-300',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-300',
        [BookingStatus.Completed]: 'bg-gray-100 text-gray-800 border-gray-300',
        [BookingStatus.TimedOut]: 'bg-red-100 text-red-800 border-red-300',
        [BookingStatus.Reassigned]: 'bg-purple-100 text-purple-800 border-purple-300',
    };

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-bold text-gray-900 text-lg">{booking.userName}</p>
                    <p className="text-sm text-gray-600 mt-1">{t.service}: {booking.service} min</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[booking.status]}`}>{booking.status}</span>
            </div>
            <p className="text-sm text-gray-600">{t.date}: {new Date(booking.startTime).toLocaleString()}</p>
            {isPending && isUpcoming && (
                 <div className="flex flex-col sm:flex-row gap-2 pt-4 mt-4 border-t">
                    <button onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)} className="flex-1 bg-orange-500 text-white font-semibold py-2.5 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-all text-sm">
                        {t.confirm}
                    </button>
                    <button onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)} className="flex-1 bg-white text-gray-700 font-semibold py-2.5 px-3 sm:px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all text-sm">
                        {t.cancel}
                    </button>
                </div>
            )}
        </div>
    );
}

const MassagePlaceAdminDashboard: React.FC<MassagePlaceAdminDashboardProps> = ({ 
    place, 
    onLogout, 
    onNavigateToNotifications: _onNavigateToNotifications, 
    onNavigate, 
    onUpdateBookingStatus, 
    onSave: _onSave,
    handleNavigateToAdminLogin, 
    bookings, 
    notifications, 
    t 
}) => {
    const { t: t_new } = useTranslations(); // New translation system
    const [placeData, setPlaceData] = useState<Place | null>(place);
    const [isLoading, setIsLoading] = useState(true);

    // Form state variables - temporarily unused but required for restoration from localStorage
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [hotelVillaPricing, setHotelVillaPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [useSamePricing, setUseSamePricing] = useState(true);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [isLicensed, setIsLicensed] = useState(false);
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // Start with Profile tab since places use "open now" status
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); // Notifications modal state

    const locationInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sideDrawerRef = useRef<HTMLDivElement>(null);
    
    const fetchPlaceData = useCallback(async () => {
        setIsLoading(true);
        
        console.log('📖 Loading place data:', place);
        
        // First, try to restore from localStorage
        const profileKey = `massage_place_profile_${place?.id || 'temp'}`;
        const savedProfileData = localStorage.getItem(profileKey);
        
        if (savedProfileData) {
            try {
                const parsedData = JSON.parse(savedProfileData);
                console.log('🔄 Restored profile data from localStorage:', parsedData);
                
                // Restore all form fields from saved data
                setName(parsedData.name || '');
                setDescription(parsedData.description || '');
                setProfilePicture(parsedData.profilePicture || '');
                setWhatsappNumber(parsedData.whatsappNumber || '');
                setYearsOfExperience(parsedData.yearsOfExperience || 0);
                setMassageTypes(parsedData.massageTypes ? parseMassageTypes(parsedData.massageTypes) : []);
                setLanguages(parsedData.languages || []);
                setPricing(parsedData.pricing ? parsePricing(parsedData.pricing) : { 60: 0, 90: 0, 120: 0 });
                setDiscountPercentage(parsedData.discountPercentage || 0);
                setHotelVillaPricing(parsedData.hotelVillaPricing ? parsePricing(parsedData.hotelVillaPricing) : { 60: 0, 90: 0, 120: 0 });
                setUseSamePricing(!parsedData.hotelVillaPricing); // If no hotel pricing, use same pricing
                setLocation(parsedData.location || '');
                setCoordinates(parsedData.coordinates ? parseCoordinates(parsedData.coordinates) : { lat: 0, lng: 0 });
                setIsLicensed(parsedData.isLicensed || false);
                
                setIsLoading(false);
                return; // Exit early since we have saved data
            } catch (error) {
                console.warn('⚠️ Failed to restore saved profile data:', error);
                // Continue with normal flow if restoration fails
            }
        }
        
        if (place) {
            console.log('✅ Found existing place profile:', place);
            setPlaceData(place);
            setName(place.name || '');
            setDescription(place.description || '');
            setProfilePicture(place.profilePicture || '');
            setWhatsappNumber(place.whatsappNumber || '');
            setYearsOfExperience(0); // Places don't have experience
            setMassageTypes(place.massageTypes ? parseMassageTypes(place.massageTypes) : []);
            setLanguages(place.languages 
                ? (typeof place.languages === 'string' 
                    ? parseLanguages(place.languages) 
                    : place.languages)
                : []);
            setPricing(place.pricing ? parsePricing(place.pricing) : { 60: 0, 90: 0, 120: 0 });
            setDiscountPercentage(0); // Initialize discount percentage
            
            setHotelVillaPricing(place.pricing ? parsePricing(place.pricing) : { 60: 0, 90: 0, 120: 0 });
            setUseSamePricing(true);
            
            setLocation(place.location || '');
            setCoordinates(place.coordinates ? parseCoordinates(place.coordinates) : { lat: 0, lng: 0 });
            setIsLicensed(false); // Places don't have individual licenses
        } else {
            console.log('📝 No place data provided, starting with empty form');
            // No place data - start with empty data
            setPlaceData(null);
            setName('');
            setDescription('');
            setProfilePicture('');
            setWhatsappNumber('');
            setYearsOfExperience(0);
            setMassageTypes([]);
            setLanguages([]);
            setPricing({ "60": 0, "90": 0, "120": 0 });
            setHotelVillaPricing({ "60": 0, "90": 0, "120": 0 });
            setUseSamePricing(true);
            setLocation('');
            setCoordinates({ lat: 0, lng: 0 });
            setIsLicensed(false);
        }
        
        setIsLoading(false);
    }, [place]);

    useEffect(() => {
        fetchPlaceData();
    }, [fetchPlaceData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Close side drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target as Node)) {
                setIsSideDrawerOpen(false);
            }
        };

        if (isSideDrawerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSideDrawerOpen]);

    useEffect(() => {
        const checkGoogleMaps = () => {
             if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                setMapsApiLoaded(true);
                return true;
            }
            return false;
        };

        if (!checkGoogleMaps()) {
            const interval = setInterval(() => {
                if (checkGoogleMaps()) {
                    clearInterval(interval);
                }
            }, 500);
            
            const timeout = setTimeout(() => {
                clearInterval(interval);
            }, 5000);

            return () => {
                clearInterval(interval)
                clearTimeout(timeout);
            };
        }
    }, []);

    // Poll for WhatsApp contact notifications - adapted for places
    useEffect(() => {
        if (!place?.id) return;

        const checkForWhatsAppNotifications = async () => {
            try {
                // For places, we might implement place-specific notifications later
                console.log('📱 Checking place notifications...');
            } catch (error) {
                console.error('Error checking notifications:', error);
            }
        };

        // Check immediately
        checkForWhatsAppNotifications();

        // Then poll every 10 seconds
        const interval = setInterval(checkForWhatsAppNotifications, 10000);

        return () => clearInterval(interval);
    }, [place?.id]);

    useEffect(() => {
        if (mapsApiLoaded && locationInputRef.current) {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(locationInputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'id' } 
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setLocation(place.formatted_address);
                }
                if (place.geometry && place.geometry.location) {
                    setCoordinates({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                }
            });
        }
    }, [mapsApiLoaded]);

    // Early returns moved here after all hooks are declared to fix Rules of Hooks violation
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div></div>;
    }

    if (!place) {
        return <div className="p-4 text-center text-red-500">Could not load place data. Please try logging in again.</div>
    }

    // Handle notifications from footer
    const handleShowNotifications = () => {
        setShowNotifications(true);
    };

    const handleCloseNotifications = () => {
        setShowNotifications(false);
    };

    const now = new Date();
    const upcomingBookings = (bookings || []).filter(b => new Date(b.startTime) >= now).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const pastBookings = (bookings || []).filter(b => new Date(b.startTime) < now).sort((_, b) => new Date(b.startTime).getTime() - new Date(b.startTime).getTime());

    // Discount management functions
    const renderContent = () => {
        switch (activeTab) {
            case 'bookings':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t_new('bookings.upcoming')}</h2>
                                <p className="text-xs text-gray-500">Manage your upcoming bookings</p>
                            </div>
                        </div>
                        {upcomingBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t_new('bookings')} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t_new('bookings.noUpcoming')}</p>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-8">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t_new('bookings.past')}</h2>
                                <p className="text-xs text-gray-500">View past bookings</p>
                            </div>
                        </div>
                        {pastBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {pastBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t_new('bookings')} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t_new('bookings.noPast')}</p>
                            </div>
                        )}
                    </div>
                );
            case 'analytics':
                 return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t?.analytics?.title || 'Analytics'}</h2>
                                <p className="text-xs text-gray-500">Track your performance metrics</p>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <AnalyticsCard title={t?.analytics?.impressions || 'Impressions'} value={(() => {
                                try {
                                    const analytics = typeof placeData?.analytics === 'string' ? JSON.parse(placeData.analytics) : placeData?.analytics;
                                    return analytics?.impressions ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.impressionsDesc || 'Number of profile impressions'} />
                            <AnalyticsCard title={t?.analytics?.profileViews || 'Profile Views'} value={(() => {
                                try {
                                    const analytics = typeof placeData?.analytics === 'string' ? JSON.parse(placeData.analytics) : placeData?.analytics;
                                    return analytics?.profileViews ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.profileViewsDesc || 'Number of profile views'} />
                            <AnalyticsCard title={t?.analytics?.whatsappClicks || 'WhatsApp Clicks'} value={(() => {
                                try {
                                    const analytics = typeof placeData?.analytics === 'string' ? JSON.parse(placeData.analytics) : placeData?.analytics;
                                    return analytics?.whatsappClicks ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.whatsappClicksDesc || 'Number of WhatsApp clicks'} />
                        </div>

                        {/* Coin History Button */}
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('coin-history')}
                                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-orange-200 hover:border-orange-400 mt-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl">
                                        📊
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900">Coin History</h3>
                                        <p className="text-sm text-gray-600">View transactions & expiration</p>
                                    </div>
                                </div>
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {/* Coin Shop Button */}
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('coin-shop')}
                                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-yellow-200 hover:border-yellow-400 mt-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl">
                                        🪙
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900">Coin Rewards Shop</h3>
                                        <p className="text-sm text-gray-600">Redeem coins for rewards</p>
                                    </div>
                                </div>
                                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            case 'hotelVilla': {
                const handleHotelVillaUpdate = (status: HotelVillaServiceStatus, hotelDiscount: number, villaDiscount: number, serviceRadius: number) => {
                    // Update place data with hotel-villa preferences
                    console.log('Hotel-Villa preferences updated:', { status, hotelDiscount, villaDiscount, serviceRadius });
                    // In a real app, this would save to the backend
                };
                
                return (
                    <HotelVillaOptIn
                        currentStatus={place?.hotelVillaServiceStatus || HotelVillaServiceStatus.NotOptedIn}
                        hotelDiscount={place?.hotelDiscount || 20}
                        villaDiscount={place?.villaDiscount || 20}
                        serviceRadius={place?.serviceRadius || 7}
                        onUpdate={handleHotelVillaUpdate}
                    />
                );
            }
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
                            providerId={typeof place?.id === 'string' ? parseInt(place.id) : place?.id} 
                            providerType="place" 
                        />
                    </div>
                );
            case 'discounts':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Discount Management</h2>
                                <p className="text-xs text-gray-500">Create and manage promotional offers</p>
                            </div>
                        </div>
                        <DiscountSharePage 
                            // Pass place data adapted as therapist data
                            therapist={{
                                ...place,
                                id: place?.id || 'place1',
                                name: place?.name || '',
                                description: place?.description || '',
                                profilePicture: place?.profilePicture || '',
                                whatsappNumber: place?.whatsappNumber || '',
                                massageTypes: place?.massageTypes || '[]',
                                pricing: place?.pricing || '{"60":0,"90":0,"120":0}',
                                location: place?.location || '',
                                coordinates: place?.coordinates || '{"lat":0,"lng":0}',
                                isLive: place?.isLive || false,
                                rating: place?.rating || 0,
                                reviewCount: place?.reviewCount || 0,
                                activeMembershipDate: new Date().toISOString().split('T')[0],
                                email: `place${place?.id}@indostreet.com`,
                                distance: 0,
                                analytics: '{"impressions":0,"views":0,"profileViews":0,"whatsappClicks":0,"bookings":0}',
                                languages: place?.languages || '[]'
                            }}
                            t={t}
                        />
                    </div>
                );
            case 'membership':
                return (
                    <MembershipPlansPage 
                        onBack={() => setActiveTab('profile')}
                        userType="therapist"
                        currentPlan="free"
                    />
                );
            case 'terms':
                return <TherapistTermsPage />;
            case 'profile':
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                                <p className="text-xs text-gray-500">Manage your massage place profile</p>
                            </div>
                        </div>
                        <TherapistProfileForm
                            // Pass place data adapted as therapist data
                            therapist={{
                                ...place,
                                id: place?.id || 'place1',
                                name: place?.name || '',
                                description: place?.description || '',
                                profilePicture: place?.profilePicture || '',
                                whatsappNumber: place?.whatsappNumber || '',
                                massageTypes: place?.massageTypes || '[]',
                                pricing: place?.pricing || '{"60":0,"90":0,"120":0}',
                                location: place?.location || '',
                                coordinates: place?.coordinates || '{"lat":0,"lng":0}',
                                isLive: place?.isLive || false,
                                rating: place?.rating || 0,
                                reviewCount: place?.reviewCount || 0,
                                activeMembershipDate: new Date().toISOString().split('T')[0],
                                email: `place${place?.id}@indostreet.com`,
                                distance: 0,
                                analytics: '{"impressions":0,"views":0,"profileViews":0,"whatsappClicks":0,"bookings":0}',
                                languages: place?.languages || '[]'
                            }}
                            onSave={(data) => {
                                console.log('Saving place profile:', data);
                                setToast({ message: 'Profile saved successfully!', type: 'success' });
                            }}
                            onNavigateToLocationPicker={() => console.log('Navigate to location picker')}
                            isEditMode={true}
                            t={t}
                            onLocationChange={(loc, coords) => {
                                setLocation(loc);
                                setCoordinates(coords);
                            }}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm px-3 sm:px-4 py-3 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-bold flex-shrink-0">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-600">Street</span>
                    </h1>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Burger Menu - Moved to right */}
                        <button 
                            onClick={() => setIsSideDrawerOpen(true)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <Menu className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Side Drawer */}
            {isSideDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                        onClick={() => setIsSideDrawerOpen(false)}
                    ></div>
                    
                    {/* Drawer */}
                    <div 
                        ref={sideDrawerRef}
                        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
                    >
                        {/* Drawer Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Menu</h2>
                                    <p className="text-sm text-orange-100">{place?.name || 'Massage Place'}</p>
                                </div>
                                <button 
                                    onClick={() => setIsSideDrawerOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Drawer Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    setActiveTab('profile');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'profile' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">{t_new('profile')}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('bookings');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'bookings' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">Bookings</span>
                                {upcomingBookings.length > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-bold">
                                        {upcomingBookings.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('analytics');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'analytics' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-medium">Analytics</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('hotelVilla');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'hotelVilla' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Hotel className="w-5 h-5" />
                                <span className="font-medium">Hotel & Villa</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('notifications');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'notifications' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="font-medium">Notifications</span>
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-bold">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('discounts');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'discounts' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Tag className="w-5 h-5" />
                                <span className="font-medium">Discounts</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('membership');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'membership' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Crown className="w-5 h-5" />
                                <span className="font-medium">Membership Plans</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('terms');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'terms' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <FileCheck className="w-5 h-5" />
                                <span className="font-medium">Terms & Conditions</span>
                            </button>

                            {/* Coin Rewards Menu Items */}
                            {onNavigate && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsSideDrawerOpen(false);
                                            onNavigate('coin-history');
                                        }}
                                        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 border-transparent hover:border-orange-500"
                                    >
                                        <History className="w-5 h-5" />
                                        <span className="font-medium">💰 Coin History</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsSideDrawerOpen(false);
                                            onNavigate('coin-shop');
                                        }}
                                        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-green-50 transition-colors border-l-4 border-transparent hover:border-green-500"
                                    >
                                        <Coins className="w-5 h-5" />
                                        <span className="font-medium">🛍️ Coin Shop</span>
                                    </button>
                                </>
                            )}

                            {/* Divider */}
                            <div className="my-2 border-t border-gray-200"></div>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    setIsSideDrawerOpen(false);
                                    onLogout();
                                }}
                                className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-red-50 transition-colors text-red-600 border-l-4 border-transparent hover:border-red-500"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Log Out</span>
                            </button>

                            {/* Admin Link */}
                            {handleNavigateToAdminLogin && (
                                <div className="pt-2 mt-2 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setIsSideDrawerOpen(false);
                                            handleNavigateToAdminLogin();
                                        }}
                                        className="w-full flex items-center justify-center px-6 py-3 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Admin
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Content Area */}
            <main className={`max-w-7xl mx-auto px-3 sm:px-4 w-full ${
                'py-4 sm:py-6'
            }`}>
                {renderContent()}
            </main>
            

            {/* Confirmation Popup */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Saved!</h3>
                        <p className="text-gray-600 mb-6">Admin Will Confirm Your Profile Soon</p>
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white transition-opacity duration-300 ${
                    toast.type === 'success' ? 'bg-green-500' :
                    toast.type === 'error' ? 'bg-red-500' : 'bg-orange-500'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Footer */}
            <Footer
                userRole="therapist"
                currentPage="dashboard"
                t={t}
                onNotificationsClick={handleShowNotifications}
            />

            {/* Notifications Modal */}
            {showNotifications && (
                <TherapistNotifications
                    notifications={notifications}
                    onMarkAsRead={() => {}} // Placeholder function
                    onBack={handleCloseNotifications}
                    t={t}
                />
            )}
        </div>
    );
};

export default MassagePlaceAdminDashboard;
