import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { AvailabilityStatus, BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService, notificationService } from '../lib/appwriteService';
import { soundNotificationService } from '../utils/soundNotificationService';
import { User, Calendar, TrendingUp, Hotel, FileCheck, LogOut, Bell, Tag, Activity, Menu, Crown, Coins, History } from 'lucide-react';
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
// Removed chat import - chat system removed
// import MemberChatWindow from '../components/MemberChatWindow';
import '../utils/pricingHelper'; // Load pricing helper for console access


interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigate?: (page: Page) => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    onStatusChange?: (status: AvailabilityStatus) => void; // Add status change handler
    handleNavigateToAdminLogin?: () => void;
    therapistId: number | string; // Support both for Appwrite compatibility
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

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications: _onNavigateToNotifications, onNavigate, onUpdateBookingStatus, onStatusChange, handleNavigateToAdminLogin, therapistId, bookings, notifications, t }) => {
    const { t: t_new } = useTranslations(); // New translation system
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
    const [discountDuration, setDiscountDuration] = useState<number>(0); // Hours for discount duration
    const [discountEndTime, setDiscountEndTime] = useState<Date | null>(null); // When discount expires
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [isLicensed, setIsLicensed] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('status'); // Start with Online Status tab
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

    const locationInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sideDrawerRef = useRef<HTMLDivElement>(null);
    
    const fetchTherapistData = useCallback(async () => {
        setIsLoading(true);
        
        console.log('📖 Fetching therapist data for ID:', therapistId);
        // Try to fetch existing therapist data from Appwrite
        const existingTherapist = await therapistService.getById(therapistId.toString());
        
        if (existingTherapist) {
            console.log('✅ Found existing therapist profile:', existingTherapist);
            console.log('📋 Profile data breakdown:', {
                name: existingTherapist.name,
                description: existingTherapist.description?.substring(0, 50) + '...',
                profilePicture: existingTherapist.profilePicture?.substring(0, 50) + '...',
                location: existingTherapist.location,
                whatsappNumber: existingTherapist.whatsappNumber,
                yearsOfExperience: (existingTherapist as any).yearsOfExperience,
                massageTypes: existingTherapist.massageTypes
            });
            setTherapist(existingTherapist);
            setName(existingTherapist.name || '');
            setDescription(existingTherapist.description || '');
            setProfilePicture(existingTherapist.profilePicture || '');
            console.log('📷 Loaded profilePicture from database:', existingTherapist.profilePicture);
            console.log('ℹ️ Main image is automatically assigned from curated collection');
            console.log('🔄 State updated - name:', existingTherapist.name, 'description length:', existingTherapist.description?.length);
            setWhatsappNumber(existingTherapist.whatsappNumber || '');
            setYearsOfExperience((existingTherapist as any).yearsOfExperience || 0);
            setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
            setLanguages(existingTherapist.languages 
                ? (typeof existingTherapist.languages === 'string' 
                    ? parseLanguages(existingTherapist.languages) 
                    : existingTherapist.languages)
                : []);
            setPricing(parsePricing(existingTherapist.pricing));
            setDiscountPercentage((existingTherapist as any).discountPercentage || 0);
            
            // Load hotel/villa pricing if exists
            if ((existingTherapist as any).hotelVillaPricing) {
                setHotelVillaPricing(parsePricing((existingTherapist as any).hotelVillaPricing));
                setUseSamePricing(false);
            } else {
                setHotelVillaPricing(parsePricing(existingTherapist.pricing));
                setUseSamePricing(true);
            }
            
            setLocation(existingTherapist.location || '');
            setCoordinates(parseCoordinates(existingTherapist.coordinates));
            setStatus(existingTherapist.status || AvailabilityStatus.Offline);
            setIsLicensed((existingTherapist as any).isLicensed || false);
            setLicenseNumber((existingTherapist as any).licenseNumber || '');
            
            // Load discount data from analytics field
            try {
                const analyticsData = existingTherapist.analytics ? 
                    (typeof existingTherapist.analytics === 'string' ? JSON.parse(existingTherapist.analytics) : existingTherapist.analytics) : 
                    {};
                
                if (analyticsData.discountData) {
                    const discountData = analyticsData.discountData;
                    const endTime = new Date(discountData.endTime);
                    const now = new Date();
                    
                    // Check if discount is still active (hasn't expired)
                    if (discountData.isActive && endTime > now) {
                        setDiscountPercentage(discountData.percentage);
                        setDiscountDuration(discountData.duration);
                        setDiscountEndTime(endTime);
                        setIsDiscountActive(true);
                        console.log('📊 Loaded active discount:', discountData.percentage + '%');
                    } else if (discountData.isActive && endTime <= now) {
                        // Discount has expired, auto-deactivate
                        console.log('⏰ Discount expired, auto-deactivating...');
                        setDiscountPercentage(0);
                        setDiscountDuration(0);
                        setDiscountEndTime(null);
                        setIsDiscountActive(false);
                        
                        // Update database to mark as inactive
                        const updatedAnalytics = {
                            ...analyticsData,
                            discountData: {
                                ...discountData,
                                isActive: false
                            }
                        };
                        therapistService.update(therapistId.toString(), { 
                            analytics: JSON.stringify(updatedAnalytics)
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Error loading discount data:', error);
            }
        } else {
            console.log('📝 No existing profile found, starting with empty form');
            // No existing profile - start with empty data
            const emptyTherapist = {
                id: therapistId,
                name: '',
                description: '',
                profilePicture: '',
                whatsappNumber: '',
                massageTypes: stringifyMassageTypes([]),
                pricing: stringifyPricing({ "60": 0, "90": 0, "120": 0 }),
                location: '',
                coordinates: stringifyCoordinates({ lat: 0, lng: 0 }),
                status: AvailabilityStatus.Offline,
                isLive: false,
                rating: 0,
                reviewCount: 0,
                activeMembershipDate: new Date().toISOString().split('T')[0],
                email: `therapist${therapistId}@indostreet.com`,
                distance: 0,
                analytics: stringifyAnalytics({ 
                  impressions: 0, 
                  views: 0, 
                  profileViews: 0,
                  whatsapp_clicks: 0, 
                  whatsappClicks: 0,
                  phone_clicks: 0, 
                  directions_clicks: 0, 
                  bookings: 0 
                }),
            };
            
            setTherapist(emptyTherapist);
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
            setStatus(AvailabilityStatus.Offline);
            setIsLicensed(false);
            setLicenseNumber('');
        }
        
        setIsLoading(false);
    }, [therapistId]);

    useEffect(() => {
        fetchTherapistData();
    }, [fetchTherapistData]);

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

    // Poll for WhatsApp contact notifications
    useEffect(() => {
        if (!therapistId) return;

        let lastNotificationCount = 0;

        const checkForWhatsAppNotifications = async () => {
            try {
                const unreadNotifications = await notificationService.getUnread(Number(therapistId));
                
                // Filter for WhatsApp contact notifications
                const whatsappNotifications = unreadNotifications.filter(
                    (n: any) => n.type === 'whatsapp_contact'
                );

                // If we have more WhatsApp notifications than before, play sound
                if (whatsappNotifications.length > lastNotificationCount) {
                    console.log('📱 New WhatsApp contact notification received!');
                    await soundNotificationService.showWhatsAppContactNotification();
                }

                lastNotificationCount = whatsappNotifications.length;
            } catch (error) {
                console.error('Error checking notifications:', error);
            }
        };

        // Check immediately
        checkForWhatsAppNotifications();

        // Then poll every 10 seconds
        const interval = setInterval(checkForWhatsAppNotifications, 10000);

        return () => clearInterval(interval);
    }, [therapistId]);

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

    // Use effect to check discount expiry periodically - moved here to maintain hooks order
    useEffect(() => {
        const checkDiscountExpiry = async () => {
            if (isDiscountActive && discountEndTime) {
                const now = new Date();
                if (now >= discountEndTime) {
                    console.log('⏰ Discount expired, auto-deactivating...');
                    setIsDiscountActive(false);
                    setDiscountPercentage(0);
                    setDiscountEndTime(null);
                    setDiscountDuration(0);
                    
                    // Update database to mark discount as inactive
                    try {
                        const therapistIdString = typeof therapistId === 'string' ? therapistId : therapistId.toString();
                        const currentAnalytics = therapist?.analytics ? 
                            (typeof therapist.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist.analytics) : 
                            {};
                        
                        const updatedAnalytics = {
                            ...currentAnalytics,
                            discountData: {
                                ...currentAnalytics.discountData,
                                isActive: false
                            }
                        };
                        
                        await therapistService.update(therapistIdString, { 
                            analytics: JSON.stringify(updatedAnalytics)
                        });
                        
                        setToast({ message: 'Discount expired and deactivated automatically', type: 'warning' });
                    } catch (error) {
                        console.error('❌ Error updating expired discount:', error);
                    }
                }
            }
        };

        const interval = setInterval(checkDiscountExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isDiscountActive, discountEndTime, discountDuration, therapistId, therapist?.analytics]); // Include all dependencies

    // Early returns moved here after all hooks are declared to fix Rules of Hooks violation
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div></div>;
    }

    if (!therapist) {
        return <div className="p-4 text-center text-red-500">Could not load therapist data. Please try logging in again.</div>
    }

    const handleSave = () => {
        console.log('💾 SAVE BUTTON CLICKED - Starting save process...');
        console.log('📋 Profile data being saved:', {
            name,
            whatsappNumber,
            yearsOfExperience,
            location,
            status,
            pricing: pricing,
            hotelVillaPricing: useSamePricing ? 'Same as home pricing' : hotelVillaPricing,
            useSamePricing
        });
        
        // Validate required fields
        if (!name || !whatsappNumber) {
            alert('Name and WhatsApp number are required!');
            return;
        }
        
        try {
            const saveData = {
                name,
                description,
                profilePicture,
                whatsappNumber,
                yearsOfExperience,
                isLicensed,
                pricing: stringifyPricing(pricing),
                hotelVillaPricing: useSamePricing ? undefined : stringifyPricing(hotelVillaPricing),
                discountPercentage,
                location,
                coordinates: stringifyCoordinates(coordinates),
                status,
                analytics: therapist?.analytics || stringifyAnalytics({ 
                  impressions: 0, 
                  views: 0, 
                  profileViews: 0,
                  whatsapp_clicks: 0, 
                  whatsappClicks: 0,
                  phone_clicks: 0, 
                  directions_clicks: 0, 
                  bookings: 0 
                }),
                massageTypes: stringifyMassageTypes(massageTypes),
                languages,
            };
            
            console.log('💾 Calling onSave with data:', saveData);
            onSave(saveData as any);
            console.log('✅ Save function called successfully');
            setShowConfirmation(true);
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            // Use alert as fallback since toast causes DOM errors
            alert('Error saving profile. Please try again.');
        }
    };
    
    const handleSetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const geocoder = new (window as any).google.maps.Geocoder();
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCoordinates(latlng);
                geocoder.geocode({ location: latlng }, (results: any, status: string) => {
                    if (status === 'OK' && results[0]) {
                        setLocation(results[0].formatted_address);
                        alert(t.locationSetConfirmation);
                    } else {
                        console.error('Geocoder failed due to: ' + status);
                        alert('Could not find address for your location.');
                    }
                });
            }, () => {
                alert('Could not get your location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const now = new Date();
    const upcomingBookings = (bookings || []).filter(b => new Date(b.startTime) >= now).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const pastBookings = (bookings || []).filter(b => new Date(b.startTime) < now).sort((_, b) => new Date(b.startTime).getTime() - new Date(b.startTime).getTime());

    // Discount management functions
    const renderContent = () => {
        switch (activeTab) {
            case 'status':
                const handleStatusChange = async (newStatus: AvailabilityStatus) => {
                    setStatus(newStatus);
                    
                    // Auto-save status to database
                    try {
                        console.log('💾 Auto-saving status:', newStatus);
                        const therapistIdString = typeof therapistId === 'string' ? therapistId : therapistId.toString();
                        await therapistService.update(therapistIdString, { status: newStatus });
                        console.log('✅ Status saved successfully');
                        
                        // Call parent handler if provided
                        if (onStatusChange) {
                            onStatusChange(newStatus);
                        }
                    } catch (error) {
                        console.error('❌ Error saving status:', error);
                    }
                };
                
                return (
                    <div className="max-w-3xl mx-auto h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-100 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute top-1/4 right-8 w-16 h-16 bg-blue-100 rounded-full opacity-20 animate-bounce"></div>
                            <div className="absolute bottom-1/4 left-8 w-12 h-12 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col p-6 space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-200/50">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            Online Status
                                        </h1>
                                        <p className="text-sm text-gray-600">Manage your availability</p>
                                    </div>
                                </div>
                            </div>

                            {/* Membership Timer */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Membership Status</h3>
                                    </div>
                                    
                                    {therapist?.activeMembershipDate ? (
                                        <div className="space-y-2">
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                                <p className="text-sm font-semibold text-green-800 mb-1">Premium Membership</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <p className="text-xs text-green-700">
                                                        Expires: {new Date(therapist.activeMembershipDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                                                <p className="text-xs text-blue-800 font-medium">
                                                    ⏰ {Math.max(0, Math.ceil((new Date(therapist.activeMembershipDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                                                </p>
                                            </div>
                                            
                                            {/* Profile Activation Status */}
                                            <div className={`rounded-lg p-3 border ${
                                                therapist?.isLive 
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                                            }`}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        therapist?.isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                                    }`}></div>
                                                    <p className={`text-xs font-medium ${
                                                        therapist?.isLive ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                        {therapist?.isLive ? '✅ Profile Activated' : '🔒 Awaiting Admin Approval'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                                                    <p className="text-sm font-bold text-orange-800">Free Membership Trial</p>
                                                </div>
                                                <p className="text-xs text-orange-700">Unlimited access during trial period</p>
                                            </div>
                                            
                                            {/* Profile Activation Status for Free Trial */}
                                            <div className={`rounded-lg p-3 border ${
                                                therapist?.isLive 
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                                            }`}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        therapist?.isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                                    }`}></div>
                                                    <p className={`text-xs font-medium ${
                                                        therapist?.isLive ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                        {therapist?.isLive ? '✅ Profile Activated' : '🔒 Awaiting Admin Approval'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Buttons with Animated Borders */}
                            <div className="space-y-4">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Your Status</h2>
                                    <p className="text-sm text-gray-600">Let clients know your availability</p>
                                </div>

                                {/* Available Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => handleStatusChange(AvailabilityStatus.Available)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            status === AvailabilityStatus.Available
                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                                                : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-green-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated Border for Selected State */}
                                        {status === AvailabilityStatus.Available && (
                                            <div className="absolute inset-0 rounded-2xl">
                                                <div className="absolute inset-0 rounded-2xl border-2 border-green-500 opacity-50"></div>
                                                <div className="absolute inset-0 rounded-2xl border-2 border-green-400 animate-ping opacity-30"></div>
                                                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                status === AvailabilityStatus.Available 
                                                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full ${
                                                    status === AvailabilityStatus.Available ? 'bg-white' : 'bg-gray-400'
                                                } ${status === AvailabilityStatus.Available ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Available</h3>
                                                <p className="text-sm text-gray-600">Ready to accept new bookings</p>
                                            </div>
                                            {status === AvailabilityStatus.Available && (
                                                <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full animate-bounce">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Busy Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => handleStatusChange(AvailabilityStatus.Busy)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            status === AvailabilityStatus.Busy
                                                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-lg'
                                                : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-yellow-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated Border for Selected State */}
                                        {status === AvailabilityStatus.Busy && (
                                            <div className="absolute inset-0 rounded-2xl">
                                                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500 opacity-50"></div>
                                                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 animate-ping opacity-30"></div>
                                                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                status === AvailabilityStatus.Busy 
                                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full ${
                                                    status === AvailabilityStatus.Busy ? 'bg-white' : 'bg-gray-400'
                                                } ${status === AvailabilityStatus.Busy ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Busy</h3>
                                                <p className="text-sm text-gray-600">Currently with a client</p>
                                            </div>
                                            {status === AvailabilityStatus.Busy && (
                                                <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full animate-bounce">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Offline Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => handleStatusChange(AvailabilityStatus.Offline)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            status === AvailabilityStatus.Offline
                                                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-lg'
                                                : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-red-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated Border for Selected State */}
                                        {status === AvailabilityStatus.Offline && (
                                            <div className="absolute inset-0 rounded-2xl">
                                                <div className="absolute inset-0 rounded-2xl border-2 border-red-500 opacity-50"></div>
                                                <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-30"></div>
                                                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200 to-transparent opacity-20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                status === AvailabilityStatus.Offline 
                                                    ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full ${
                                                    status === AvailabilityStatus.Offline ? 'bg-white' : 'bg-gray-400'
                                                }`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Offline</h3>
                                                <p className="text-sm text-gray-600">Not accepting bookings</p>
                                            </div>
                                            {status === AvailabilityStatus.Offline && (
                                                <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Promotional Banners Redirect Section */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-orange-800">🎁 Promotional Discount Banners</h3>
                                            <p className="text-sm text-orange-600">Professional 5%, 10%, 15%, 20% discount campaigns</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-4">
                                        <div className="grid grid-cols-2 gap-4 text-center mb-4">
                                            <div>
                                                <p className="text-2xl font-bold text-orange-600">4</p>
                                                <p className="text-xs text-orange-700">Banner Options</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">📱</p>
                                                <p className="text-xs text-orange-700">WhatsApp Ready</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-orange-700 font-medium">
                                            ✨ Create professional discount banners that link directly to your therapist profile on the Indastreet app
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setActiveTab('discounts')}
                                        className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:via-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                                        </svg>
                                        Create & Share Promotional Banners
                                    </button>
                                </div>
                            </div>

                            {/* Current Status Footer */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gray-200/50 mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-600 font-medium">Current Status:</div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${
                                                status === AvailabilityStatus.Available ? 'bg-green-500 animate-pulse' :
                                                status === AvailabilityStatus.Busy ? 'bg-yellow-500 animate-pulse' : 
                                                'bg-red-500'
                                            }`} />
                                            <span className="font-bold text-gray-900">{status}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
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
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.impressions ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.impressionsDesc || 'Number of profile impressions'} />
                            <AnalyticsCard title={t?.analytics?.profileViews || 'Profile Views'} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.profileViews ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.profileViewsDesc || 'Number of profile views'} />
                            <AnalyticsCard title={t?.analytics?.whatsappClicks || 'WhatsApp Clicks'} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
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
            case 'hotelVilla':
                const handleHotelVillaUpdate = (status: HotelVillaServiceStatus, hotelDiscount: number, villaDiscount: number, serviceRadius: number) => {
                    // Update therapist data with hotel-villa preferences
                    console.log('Hotel-Villa preferences updated:', { status, hotelDiscount, villaDiscount, serviceRadius });
                    // In a real app, this would save to the backend
                };
                
                return (
                    <HotelVillaOptIn
                        currentStatus={therapist?.hotelVillaServiceStatus || HotelVillaServiceStatus.NotOptedIn}
                        hotelDiscount={therapist?.hotelDiscount || 20}
                        villaDiscount={therapist?.villaDiscount || 20}
                        serviceRadius={therapist?.serviceRadius || 7}
                        onUpdate={handleHotelVillaUpdate}
                    />
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
                            providerId={typeof therapistId === 'string' ? parseInt(therapistId) : therapistId} 
                            providerType="therapist" 
                        />
                    </div>
                );
            case 'discounts':
                return (
                    <DiscountSharePage
                        providerId={String(therapistId)}
                        providerName={therapist?.name || 'Therapist'}
                        providerType="therapist"
                    />
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
                    <TherapistProfileForm
                        // Profile data
                        profilePicture={profilePicture}
                        name={name}
                        yearsOfExperience={yearsOfExperience}
                        description={description}
                        whatsappNumber={whatsappNumber}
                        massageTypes={massageTypes}
                        languages={languages}
                        location={location}
                        coordinates={coordinates}
                        pricing={pricing}
                        hotelVillaPricing={hotelVillaPricing}
                        useSamePricing={useSamePricing}
                        isLicensed={isLicensed}
                        licenseNumber={licenseNumber}
                        
                        // Setters
                        setProfilePicture={setProfilePicture}
                        setName={setName}
                        setYearsOfExperience={setYearsOfExperience}
                        setDescription={setDescription}
                        setWhatsappNumber={setWhatsappNumber}
                        setMassageTypes={setMassageTypes}
                        setLanguages={setLanguages}
                        setLocation={setLocation}
                        setCoordinates={setCoordinates}
                        setPricing={setPricing}
                        setHotelVillaPricing={setHotelVillaPricing}
                        setUseSamePricing={setUseSamePricing}
                        setLicenseNumber={setLicenseNumber}
                        
                        // Modal state
                        showImageRequirementModal={showImageRequirementModal}
                        setShowImageRequirementModal={setShowImageRequirementModal}
                        pendingImageUrl={pendingImageUrl}
                        setPendingImageUrl={setPendingImageUrl}
                        
                        // Additional props
                        therapistId={therapistId}
                        t={t_new}
                        locationInputRef={locationInputRef}
                        mapsApiLoaded={mapsApiLoaded}
                        setToast={setToast}
                        
                        // Handlers
                        handleSave={handleSave}
                        handleSetLocation={handleSetLocation}
                    />
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
                                    <p className="text-sm text-orange-100">{therapist?.name || 'Therapist'}</p>
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
                                    setActiveTab('status');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'status' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Activity className="w-5 h-5" />
                                <span className="font-medium">{t_new('onlineStatus')}</span>
                            </button>
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
                activeTab === 'status' ? 'h-[calc(100vh-120px)] overflow-y-auto py-2' : 'py-4 sm:py-6'
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
            />
        </div>
    );
};

export default TherapistDashboardPage;
