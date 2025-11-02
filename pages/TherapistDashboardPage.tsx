import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { AvailabilityStatus, BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService, notificationService } from '../lib/appwriteService';
import { soundNotificationService } from '../utils/soundNotificationService';
import { User, Calendar, TrendingUp, Hotel, FileCheck, LogOut, Bell, Briefcase, MessageSquare, Tag, Activity, Megaphone, Menu, Crown } from 'lucide-react';
import Button from '../components/Button';
import DiscountSharePage from './DiscountSharePage';
import MembershipPlansPage from './MembershipPlansPage';
import ImageUpload from '../components/ImageUpload';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import Footer from '../components/Footer';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import CustomCheckbox from '../components/CustomCheckbox';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import TherapistTermsPage from './TherapistTermsPage';
import TherapistJobOpportunitiesPage from './TherapistJobOpportunitiesPage';
import PushNotificationSettings from '../components/PushNotificationSettings';
import MemberChatWindow from '../components/MemberChatWindow';


interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigateToHome?: () => void;
    onNavigate?: (page: Page) => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    onStatusChange?: (status: AvailabilityStatus) => void; // Add status change handler
    handleNavigateToAdminLogin?: () => void;
    therapistId: number | string; // Support both for Appwrite compatibility
    bookings: Booking[];
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

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications: _onNavigateToNotifications, onNavigateToHome, onNavigate, onUpdateBookingStatus, onStatusChange, handleNavigateToAdminLogin, therapistId, bookings, notifications, t }) => {
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
            setLanguages(existingTherapist.languages || []);
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

    const handleSave = () => {
        console.log('💾 SAVE BUTTON CLICKED - Starting save process...');
        console.log('📋 Profile data:', {
            name,
            whatsappNumber,
            yearsOfExperience,
            location,
            status
        });
        
        try {
            onSave({
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
            } as any);
            console.log('✅ Save function called successfully');
            setShowConfirmation(true);
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            // Use alert as fallback since toast causes DOM errors
            alert('Error saving profile. Please try again.');
        }
    };
    
    const handlePriceChange = (duration: keyof Pricing, value: string) => {
        // Remove 'k' or 'K' and spaces
        let cleanValue = value.replace(/[kK\s]/g, '');
        
        // Remove leading zeros
        cleanValue = cleanValue.replace(/^0+/, '') || '0';
        
        // Parse the number
        let numValue = parseInt(cleanValue, 10);
        
        // If value ended with 'k', multiply by 1000
        if (/[kK]/.test(value)) {
            numValue = numValue * 1000;
        }
        
        setPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
        
        // If "use same pricing" is checked, update hotel/villa pricing too
        if (useSamePricing) {
            setHotelVillaPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
        }
    };
    
    const handleHotelVillaPriceChange = (duration: keyof Pricing, value: string) => {
        // Remove 'k' or 'K' and spaces
        let cleanValue = value.replace(/[kK\s]/g, '');
        
        // Remove leading zeros
        cleanValue = cleanValue.replace(/^0+/, '') || '0';
        
        // Parse the number
        let numValue = parseInt(cleanValue, 10);
        
        // If value ended with 'k', multiply by 1000
        if (/[kK]/.test(value)) {
            numValue = numValue * 1000;
        }
        
        // Validate: Hotel/villa price cannot be more than 20% higher than regular price
        const regularPrice = pricing[duration];
        const maxAllowedPrice = regularPrice * 1.2; // 20% increase max
        
        if (numValue > maxAllowedPrice && regularPrice > 0) {
            // Cap at 20% increase
            numValue = Math.floor(maxAllowedPrice);
        }
        
        setHotelVillaPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
    };
    
    const handleUseSamePricingChange = (checked: boolean) => {
        setUseSamePricing(checked);
        if (checked) {
            // Copy regular pricing to hotel/villa pricing
            setHotelVillaPricing({ ...pricing });
        }
    };
    
    const formatPriceDisplay = (value: number): string => {
        if (value === 0) return '';
        if (value >= 1000) {
            return (value / 1000).toString() + 'k';
        }
        return value.toString();
    };

    const handleMassageTypeChange = (type: string) => {
        setMassageTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleLanguageChange = (langCode: string) => {
        setLanguages(prev =>
            prev.includes(langCode)
                ? prev.filter(l => l !== langCode)
                : [...prev, langCode]
        );
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

    const renderInput = (value: string, onChange: (val: string) => void, Icon: React.FC<{className?:string}>, placeholder?: string, type: string = 'text') => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" />
        </div>
    );
    
    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) >= now).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const pastBookings = bookings.filter(b => new Date(b.startTime) < now).sort((_, b) => new Date(b.startTime).getTime() - new Date(b.startTime).getTime());

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div></div>;
    }

    if (!therapist) {
        return <div className="p-4 text-center text-red-500">Could not load therapist data. Please try logging in again.</div>
    }

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
                    <div className="max-w-2xl mx-auto h-full flex flex-col">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <Activity className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Online Status</h2>
                                    <p className="text-xs text-gray-600">Set your availability for customers</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {/* Available Option */}
                                <button
                                    onClick={() => handleStatusChange(AvailabilityStatus.Available)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        status === AvailabilityStatus.Available
                                            ? 'border-green-500 bg-green-100'
                                            : 'border-gray-200 hover:border-green-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full status-dot-satellite flex-shrink-0 ${
                                            status === AvailabilityStatus.Available ? 'bg-green-500 text-green-500' : 'bg-gray-300'
                                        }`} />
                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-bold text-gray-900">Available</h3>
                                            <p className="text-xs text-gray-600">You're ready to accept bookings</p>
                                        </div>
                                        {status === AvailabilityStatus.Available && (
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </button>

                                {/* Busy Option */}
                                <button
                                    onClick={() => handleStatusChange(AvailabilityStatus.Busy)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        status === AvailabilityStatus.Busy
                                            ? 'border-yellow-500 bg-yellow-100'
                                            : 'border-gray-200 hover:border-yellow-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full status-dot-satellite flex-shrink-0 ${
                                            status === AvailabilityStatus.Busy ? 'bg-yellow-500 text-yellow-500' : 'bg-gray-300'
                                        }`} />
                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-bold text-gray-900">Busy</h3>
                                            <p className="text-xs text-gray-600">You're currently occupied</p>
                                        </div>
                                        {status === AvailabilityStatus.Busy && (
                                            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </button>

                                {/* Offline Option */}
                                <button
                                    onClick={() => handleStatusChange(AvailabilityStatus.Offline)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        status === AvailabilityStatus.Offline
                                            ? 'border-red-500 bg-red-100'
                                            : 'border-gray-200 hover:border-red-400 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full status-dot-satellite flex-shrink-0 ${
                                            status === AvailabilityStatus.Offline ? 'bg-red-500 text-red-500' : 'bg-gray-300'
                                        }`} />
                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-bold text-gray-900">Offline</h3>
                                            <p className="text-xs text-gray-600">You're not accepting bookings</p>
                                        </div>
                                        {status === AvailabilityStatus.Offline && (
                                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Current Status Display */}
                            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Current Status:</p>
                                <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full status-dot-satellite ${
                                        status === AvailabilityStatus.Available ? 'bg-green-500 text-green-500' :
                                        status === AvailabilityStatus.Busy ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'
                                    }`} />
                                    {status}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'chat':
                return (
                    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat with Support</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Need help? Chat with our IndaStreet support team for assistance with bookings, 
                                payments, account issues, or any questions you may have.
                            </p>
                        </div>
                        <MemberChatWindow
                            userId={String(therapistId)}
                            userName={therapist?.name || 'Therapist'}
                            userType="therapist"
                            onClose={() => setActiveTab('profile')}
                        />
                    </div>
                );
            case 'jobOpportunities':
                return (
                    <TherapistJobOpportunitiesPage
                        therapistId={therapistId}
                        therapistName={therapist?.name || ''}
                        isActiveMember={therapist?.activeMembershipDate ? new Date(therapist.activeMembershipDate) > new Date() : false}
                        onClose={() => setActiveTab('profile')}
                    />
                );
            case 'bookings':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t.bookings.upcoming}</h2>
                                <p className="text-xs text-gray-500">Manage your upcoming bookings</p>
                            </div>
                        </div>
                        {upcomingBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t.bookings} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t.bookings.noUpcoming}</p>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-8">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t.bookings.past}</h2>
                                <p className="text-xs text-gray-500">View past bookings</p>
                            </div>
                        </div>
                        {pastBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {pastBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t.bookings} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t.bookings.noPast}</p>
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
                                <h2 className="text-2xl font-bold text-gray-900">{t.analytics.title || 'Analytics'}</h2>
                                <p className="text-xs text-gray-500">Track your performance metrics</p>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <AnalyticsCard title={t.analytics.impressions} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.impressions ?? 0;
                                } catch { return 0; }
                            })()} description={t.analytics.impressionsDesc} />
                            <AnalyticsCard title={t.analytics.profileViews} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.profileViews ?? 0;
                                } catch { return 0; }
                            })()} description={t.analytics.profileViewsDesc} />
                            <AnalyticsCard title={t.analytics.whatsappClicks} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.whatsappClicks ?? 0;
                                } catch { return 0; }
                            })()} description={t.analytics.whatsappClicksDesc} />
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
            case 'promotions':
                return (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Megaphone className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-orange-700">Promotional Tools</h2>
                                    <p className="text-sm text-gray-600">Create and share special offers with customers</p>
                                </div>
                            </div>

                            {/* Quick Action Buttons - 2 Rows */}
                            <div className="mb-6 space-y-2">
                                {/* First Row */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => {
                                            const message = discountPercentage > 0 
                                                ? `🌟 Special ${discountPercentage}% OFF! ${therapist?.name || 'Professional Massage'}\n\n60min: Rp ${Math.round(pricing["60"] * (1 - discountPercentage / 100))}k (was ${pricing["60"]}k)\n90min: Rp ${Math.round(pricing["90"] * (1 - discountPercentage / 100))}k (was ${pricing["90"]}k)\n120min: Rp ${Math.round(pricing["120"] * (1 - discountPercentage / 100))}k (was ${pricing["120"]}k)\n\nBook now! WhatsApp: ${therapist?.whatsappNumber || ''}`
                                                : `${therapist?.name || 'Professional Massage Services'}\n\n60min: Rp ${pricing["60"]}k\n90min: Rp ${pricing["90"]}k\n120min: Rp ${pricing["120"]}k\n\nWhatsApp: ${therapist?.whatsappNumber || ''}`;
                                            navigator.clipboard.writeText(message);
                                            setToast({ message: '✅ Promotional text copied!', type: 'success' });
                                            setTimeout(() => setToast(null), 3000);
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-xs">Copy Text</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            const message = discountPercentage > 0 
                                                ? `🌟 Special ${discountPercentage}% OFF! Book now!`
                                                : `Book professional massage services now!`;
                                            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-xs">WhatsApp</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            const message = discountPercentage > 0 
                                                ? `🌟 ${discountPercentage}% OFF Massage Services!`
                                                : `Professional Massage Services`;
                                            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
                                            window.open(url, '_blank', 'width=600,height=400');
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-xs">Facebook</span>
                                    </button>
                                </div>

                                {/* Second Row */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => {
                                            const url = `https://www.instagram.com/`;
                                            window.open(url, '_blank');
                                            setToast({ message: '📱 Opening Instagram - Paste your promo!', type: 'success' });
                                            setTimeout(() => setToast(null), 3000);
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2 px-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-xs">Instagram</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            const message = discountPercentage > 0 
                                                ? `🌟 Special ${discountPercentage}% OFF! ${therapist?.name || 'Massage'} - Book now!`
                                                : `${therapist?.name || 'Professional Massage Services'} - Book now!`;
                                            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
                                            window.open(url, '_blank', 'width=600,height=400');
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-2 px-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-xs">Twitter/X</span>
                                    </button>
                                    
                                    <button
                                        onClick={async () => {
                                            try {
                                                const therapistIdString = typeof therapistId === 'string' ? therapistId : therapistId.toString();
                                                await therapistService.update(therapistIdString, { discountPercentage });
                                                setToast({ message: '💾 Discount saved successfully!', type: 'success' });
                                                setTimeout(() => setToast(null), 3000);
                                            } catch (error) {
                                                console.error('Error saving discount:', error);
                                                setToast({ message: '❌ Failed to save discount', type: 'error' });
                                                setTimeout(() => setToast(null), 3000);
                                            }
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-xs">Save Promo</span>
                                    </button>
                                </div>
                            </div>

                            {/* Discount Promotion Section */}
                            <div className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-800">Special Discount Promotion</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Attract more customers by offering a limited-time discount on your services.
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-orange-700 mb-2">Promotional Discounts - Activate limited-time offers to attract customers</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                                            {[0, 5, 10, 15, 20].map((discount) => (
                                                <button
                                                    key={discount}
                                                    type="button"
                                                    onClick={() => setDiscountPercentage(discount)}
                                                    className={`px-2 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                                                        discountPercentage === discount
                                                            ? 'bg-orange-600 text-white shadow-lg transform scale-105 border-2 border-orange-600'
                                                            : 'bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 hover:shadow-md'
                                                    }`}
                                                >
                                                    {discount === 0 ? 'None' : `-${discount}%`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {discountPercentage > 0 && (
                                        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300">
                                            <div className="bg-orange-600 text-white px-4 py-2 rounded-lg mb-3 text-center">
                                                <p className="text-sm font-bold">🎉 {discountPercentage}% OFF Special Prices</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="bg-white p-3 rounded-lg text-center border-2 border-orange-200 shadow-sm">
                                                    <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold mb-2">1 Hour</div>
                                                    <p className="text-gray-400 line-through text-sm">Rp {pricing["60"]}k</p>
                                                    <p className="font-bold text-orange-600 text-lg">Rp {Math.round(pricing["60"] * (1 - discountPercentage / 100))}k</p>
                                                    <p className="text-xs text-gray-600">60 minutes</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg text-center border-2 border-orange-200 shadow-sm">
                                                    <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold mb-2">1.5 Hours</div>
                                                    <p className="text-gray-400 line-through text-sm">Rp {pricing["90"]}k</p>
                                                    <p className="font-bold text-orange-600 text-lg">Rp {Math.round(pricing["90"] * (1 - discountPercentage / 100))}k</p>
                                                    <p className="text-xs text-gray-600">90 minutes</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg text-center border-2 border-orange-200 shadow-sm">
                                                    <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold mb-2">2 Hours</div>
                                                    <p className="text-gray-400 line-through text-sm">Rp {pricing["120"]}k</p>
                                                    <p className="font-bold text-orange-600 text-lg">Rp {Math.round(pricing["120"] * (1 - discountPercentage / 100))}k</p>
                                                    <p className="text-xs text-gray-600">120 minutes</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shareable Discount Banner */}
                            <div 
                                className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 md:p-6"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/hotel%20staffs.png?updatedAt=1761578921097)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {/* Overlay for better text readability */}
                                <div className="bg-white/90 rounded-lg p-4 md:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                                        </svg>
                                        <h3 className="text-lg md:text-xl font-semibold text-orange-700">Share Your Discount</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Create a beautiful promotional banner to share on social media and with customers via chat.
                                    </p>
                                    
                                    {/* Discount Banner Preview */}
                                    <div className="bg-white rounded-xl p-4 md:p-6 mb-4 border-4 border-dashed border-orange-300">
                                        <div className="text-center">
                                            <div className={`text-white inline-block px-4 md:px-6 py-2 rounded-full text-lg md:text-2xl font-bold mb-3 ${
                                                discountPercentage > 0 
                                                    ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                            }`}>
                                                {discountPercentage > 0 ? `${discountPercentage}% OFF` : 'NO DISCOUNT SET'}
                                            </div>
                                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{therapist?.name || 'Your Name'}</h4>
                                            <p className="text-gray-600 mb-4">Professional Massage Services</p>
                                            {discountPercentage > 0 && (
                                                <div className="bg-orange-50 rounded-lg p-3 md:p-4 inline-block border-2 border-orange-200">
                                                    <div className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-bold mb-2">
                                                        💰 Special Prices
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
                                                        <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                                                            <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold mb-1">1 Hour</div>
                                                            <p className="text-xs text-gray-500 line-through">Rp {pricing["60"]}k</p>
                                                            <p className="text-base md:text-lg font-bold text-orange-600">Rp {Math.round(pricing["60"] * (1 - discountPercentage / 100))}k</p>
                                                            <p className="text-xs text-gray-600">60 minutes</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                                                            <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold mb-1">1.5 Hours</div>
                                                            <p className="text-xs text-gray-500 line-through">Rp {pricing["90"]}k</p>
                                                            <p className="text-base md:text-lg font-bold text-orange-600">Rp {Math.round(pricing["90"] * (1 - discountPercentage / 100))}k</p>
                                                            <p className="text-xs text-gray-600">90 minutes</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200">
                                                            <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold mb-1">2 Hours</div>
                                                            <p className="text-xs text-gray-500 line-through">Rp {pricing["120"]}k</p>
                                                            <p className="text-base md:text-lg font-bold text-orange-600">Rp {Math.round(pricing["120"] * (1 - discountPercentage / 100))}k</p>
                                                            <p className="text-xs text-gray-600">120 minutes</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-4">📱 WhatsApp: {therapist?.whatsappNumber || 'Not Set'}</p>
                                        </div>
                                    </div>

                                    {/* Share Buttons */}
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-orange-700 text-center">Share this promotion:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => {
                                                    const message = discountPercentage > 0 
                                                        ? `🌟 Special ${discountPercentage}% OFF! ${therapist?.name || 'Professional Massage'}\n\n1 Hour (60min): Rp ${Math.round(pricing["60"] * (1 - discountPercentage / 100))}k (was ${pricing["60"]}k)\n1.5 Hours (90min): Rp ${Math.round(pricing["90"] * (1 - discountPercentage / 100))}k (was ${pricing["90"]}k)\n2 Hours (120min): Rp ${Math.round(pricing["120"] * (1 - discountPercentage / 100))}k (was ${pricing["120"]}k)\n\nBook now! WhatsApp: ${therapist?.whatsappNumber || ''}`
                                                        : `${therapist?.name || 'Professional Massage Services'}\n\n1 Hour: Rp ${pricing["60"]}k\n1.5 Hours: Rp ${pricing["90"]}k\n2 Hours: Rp ${pricing["120"]}k\n\nWhatsApp: ${therapist?.whatsappNumber || ''}`;
                                                    navigator.clipboard.writeText(message);
                                                    setToast({ message: '✅ Promotional text copied! Paste it anywhere.', type: 'success' });
                                                    setTimeout(() => setToast(null), 3000);
                                                }}
                                                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                                </svg>
                                                <span className="text-sm md:text-base">Copy Text</span>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const message = discountPercentage > 0 
                                                        ? `🌟 Special ${discountPercentage}% OFF! Book now!`
                                                        : `Book professional massage services now!`;
                                                    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                                <span className="text-sm md:text-base">Share WhatsApp</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                const handleProfilePictureChange = (imageUrl: string) => {
                    console.log('🖼️ Profile picture changed to:', imageUrl);
                    console.log('🖼️ URL length:', imageUrl.length);
                    // Show warning modal when therapist uploads image
                    setPendingImageUrl(imageUrl);
                    setShowImageRequirementModal(true);
                };

                const handleAcceptImageRequirement = async () => {
                    const newImageUrl = pendingImageUrl;
                    setProfilePicture(newImageUrl);
                    setShowImageRequirementModal(false);
                    setPendingImageUrl('');
                    
                    // 🚀 AUTO-SAVE: Immediately save profile picture to database
                    try {
                        console.log('💾 Auto-saving profile picture to database...');
                        const therapistIdString = typeof therapistId === 'string' 
                            ? therapistId 
                            : therapistId.toString();
                        
                        // Check if therapist profile exists in database
                        const existingProfile = await therapistService.getById(therapistIdString);
                        
                        if (existingProfile) {
                            // Update existing profile
                            await therapistService.update(therapistIdString, {
                                profilePicture: newImageUrl
                            });
                            console.log('✅ Profile picture auto-saved to existing profile!');
                        } else {
                            // For new profiles, we'll update the therapist state but defer database creation to manual save
                            // This avoids issues with Appwrite's unique ID generation vs predefined IDs
                            console.log('🔄 New profile detected - profile picture set, use Save Profile for full creation');
                            setToast({ message: '📷 Profile picture set! Please click "Save Profile" to create your complete profile.', type: 'warning' });
                            setTimeout(() => setToast(null), 4000);
                            return; // Exit early, don't show success message
                        }
                        
                        setToast({ message: '✅ Profile picture saved automatically!', type: 'success' });
                        setTimeout(() => setToast(null), 3000);
                    } catch (error) {
                        console.error('❌ Error auto-saving profile picture:', error);
                        
                        // Provide more specific error messages based on error type
                        let errorMessage = '⚠️ Profile picture uploaded but auto-save failed. Please click "Save Profile" button.';
                        
                        if (error instanceof Error) {
                            if (error.message.includes('network') || error.message.includes('fetch')) {
                                errorMessage = '🌐 Network error during auto-save. Please check connection and use "Save Profile" button.';
                            } else if (error.message.includes('permission') || error.message.includes('auth')) {
                                errorMessage = '🔐 Permission error during auto-save. Please use "Save Profile" button.';
                            } else if (error.message.includes('not found') || error.message.includes('404')) {
                                errorMessage = '📄 Profile not found. Please use "Save Profile" button to create your profile.';
                            }
                        }
                        
                        setToast({ message: errorMessage, type: 'error' });
                        setTimeout(() => setToast(null), 6000);
                    }
                };

                const handleRejectImageRequirement = () => {
                    setShowImageRequirementModal(false);
                    setPendingImageUrl('');
                    // Image is not set if they reject
                };
                
                return (
                     <div className="space-y-6">
                         {/* Profile Header */}
                         <div className="border-b border-gray-200 pb-4">
                             <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h2>
                             <p className="text-sm text-gray-500 mt-1">Manage your therapist profile information</p>
                         </div>
                         
                         {/* Image Requirement Modal - Professional Design */}
                         {showImageRequirementModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Profile Photo Requirements</h3>
                                                <p className="text-orange-100 text-sm">Please read carefully before uploading</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Important Notice */}
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <p className="font-semibold text-orange-900 text-sm flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                Required for Active Account
                                            </p>
                                        </div>
                                        
                                        {/* Requirements Section */}
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <p className="font-semibold text-gray-900 text-sm">✓ Your photo must include:</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Clear front or side view of your face</span>
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Well-lit, professional appearance</span>
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Recent photo (within 6 months)</span>
                                                </li>
                                            </ul>
                                        </div>
                                        
                                        {/* Warning Section */}
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                                            <p className="font-semibold text-red-900 text-sm flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                </svg>
                                                Account Suspension Policy
                                            </p>
                                            <ul className="space-y-1.5 text-xs text-red-800">
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-red-600">•</span>
                                                    <span>Logos, graphics, or unrelated images</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-red-600">•</span>
                                                    <span>Photos not showing your face clearly</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-red-600">•</span>
                                                    <span>Using someone else's photo</span>
                                                </li>
                                            </ul>
                                            <p className="text-xs text-red-900 font-semibold pt-1">
                                                May result in immediate account suspension
                                            </p>
                                        </div>
                                        
                                        {/* Confirmation Text */}
                                        <p className="text-xs text-gray-500 italic text-center pt-2">
                                            By confirming, you verify this is a genuine photo of yourself that meets all requirements
                                        </p>
                                    </div>
                                    
                                    {/* Footer Buttons */}
                                    <div className="bg-gray-50 px-6 py-4 flex gap-3">
                                        <button
                                            onClick={handleRejectImageRequirement}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAcceptImageRequirement}
                                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all"
                                        >
                                            I Understand & Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                         )}
                         
                         <ImageUpload
                            id="profile-picture-upload"
                            label={t.uploadProfilePic}
                            currentImage={profilePicture}
                            onImageChange={handleProfilePictureChange}
                            variant="profile"
                        />
                        
                        {/* Profile Picture Guidelines */}
                        <div className="text-center -mt-2">
                            <p className="text-xs text-gray-500">Your Image front or Side Photo !</p>
                        </div>
                         
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                            {renderInput(name, setName, UserSolidIcon)}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setYearsOfExperience(Math.max(0, yearsOfExperience - 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-bold text-gray-900">{yearsOfExperience}</span>
                                    <span className="text-sm text-gray-500 ml-2">years</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setYearsOfExperience(Math.min(50, yearsOfExperience + 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <label className="text-sm font-semibold text-green-800">Qualified Therapist Badge</label>
                                </div>
                            </div>
                            <div className="bg-white/50 rounded-lg p-3 space-y-2">
                                <div className="text-xs text-green-800">
                                    <p className="font-semibold mb-2">Badge Requirements:</p>
                                    <ul className="space-y-1 ml-4 list-disc">
                                        <li>3 consecutive months of paid membership</li>
                                        <li>Maximum 5-day grace period between renewals</li>
                                        <li>Maintain a rating of 4.0 stars or higher</li>
                                    </ul>
                                </div>
                                <div className="text-xs text-green-700 bg-green-100 rounded p-2 mt-2">
                                    <p className="font-semibold">📢 Membership Reminder:</p>
                                    <p className="mt-1">You will receive a WhatsApp notification 7 days before your membership expires with renewal instructions and badge status.</p>
                                </div>
                                {isLicensed && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                        <label className="block text-xs font-medium text-green-700 mb-1">License Number (Optional)</label>
                                        <input
                                            type="text"
                                            value={licenseNumber}
                                            onChange={e => setLicenseNumber(e.target.value)}
                                            placeholder="Enter your license number"
                                            className="block w-full px-3 py-2 bg-white border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t.descriptionLabel}</label>
                            <div className="relative">
                                <div className="absolute top-3.5 left-0 pl-3 flex items-center pointer-events-none">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea 
                                    value={description} 
                                    onChange={e => {
                                        if (e.target.value.length <= 250) {
                                            setDescription(e.target.value);
                                        }
                                    }} 
                                    rows={3} 
                                    maxLength={250}
                                    className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/250 characters
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t.whatsappLabel}</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <span className="absolute inset-y-0 left-10 pl-2 flex items-center text-gray-500 text-sm pointer-events-none">+62</span>
                                <input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="81234567890" className="block w-full pl-20 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" />
                            </div>
                            <Button 
                                onClick={() => {
                                    // Play click sound
                                    const audio = new Audio('/sounds/success-notification.mp3');
                                    audio.volume = 0.3;
                                    audio.play().catch(err => console.log('Sound play failed:', err));
                                    
                                    const adminNumber = '6281392000050';
                                    const message = `Hello IndaStreet Admin, this is a test message from therapist ${name || 'Therapist'} (ID: ${therapistId}). My WhatsApp number is +62${whatsappNumber}.`;
                                    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                variant="secondary" 
                                className="flex items-center justify-center gap-2 mt-2 text-sm py-2 bg-green-500 hover:bg-green-600 text-white border-0"
                            >
                                <PhoneIcon className="w-4 h-4" />
                                <span>Test WhatsApp Connection</span>
                            </Button>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t.massageTypesLabel}</label>
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-4">
                                {MASSAGE_TYPES_CATEGORIZED.map(category => (
                                    <div key={category.category}>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category.category}</h4>
                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                                            {category.types.map(type => (
                                                <CustomCheckbox
                                                    key={type}
                                                    label={type}
                                                    checked={massageTypes.includes(type)}
                                                    onChange={() => handleMassageTypeChange(type)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Languages Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Languages You Speak</label>
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {[
                                        { code: 'en', flag: '🇬🇧', name: 'English' },
                                        { code: 'id', flag: '🇮🇩', name: 'Indonesian' },
                                        { code: 'zh', flag: '🇨🇳', name: 'Chinese' },
                                        { code: 'ja', flag: '🇯🇵', name: 'Japanese' },
                                        { code: 'ko', flag: '🇰🇷', name: 'Korean' },
                                        { code: 'ru', flag: '🇷🇺', name: 'Russian' },
                                        { code: 'fr', flag: '🇫🇷', name: 'French' },
                                        { code: 'de', flag: '🇩🇪', name: 'German' },
                                        { code: 'es', flag: '🇪🇸', name: 'Spanish' }
                                    ].map(lang => (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                                languages.includes(lang.code)
                                                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="text-sm font-medium">{lang.name}</span>
                                            {languages.includes(lang.code) && (
                                                <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.locationLabel || 'Location'}</label>
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                <div className="relative mb-3">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        ref={locationInputRef} 
                                        type="text" 
                                        value={location} 
                                        onChange={e => setLocation(e.target.value)} 
                                        placeholder={t.locationPlaceholder || 'Enter your location'} 
                                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-gray-900 text-sm" 
                                        readOnly={!mapsApiLoaded}
                                    />
                                </div>
                                <Button 
                                    onClick={handleSetLocation} 
                                    variant="secondary" 
                                    className={`w-full flex items-center justify-center gap-2 py-3 text-white border-0 ${
                                        location ? 'bg-green-500 hover:bg-green-600' : 'bg-brand-orange hover:bg-orange-600'
                                    }`}
                                >
                                    <MapPinIcon className="w-5 h-5" />
                                    <span className="font-semibold">{location ? 'Location Set ✓' : 'Set Location from Device'}</span>
                                </Button>
                                {location && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs text-gray-500 text-center">
                                            📍 {location.substring(0, 50)}{location.length > 50 ? '...' : ''}
                                        </p>
                                        {coordinates.lat !== 0 && coordinates.lng !== 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-xs font-medium text-gray-700 mb-2">Location Coordinates:</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="text-gray-500">Lat:</span>
                                                        <span className="font-mono ml-1 text-gray-900">{coordinates.lat.toFixed(6)}</span>
                                                    </div>
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="text-gray-500">Lng:</span>
                                                        <span className="font-mono ml-1 text-gray-900">{coordinates.lng.toFixed(6)}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded p-2 border">
                                                    <span className="text-gray-500 text-xs">Map ID:</span>
                                                    <div className="font-mono text-xs text-gray-900 mt-1 break-all">
                                                        {coordinates.lat.toFixed(6)},{coordinates.lng.toFixed(6)}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const coordString = `${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
                                                            navigator.clipboard.writeText(coordString);
                                                            setToast({ message: '📋 Coordinates copied to clipboard!', type: 'success' });
                                                            setTimeout(() => setToast(null), 2000);
                                                        }}
                                                        className="mt-1 mr-3 text-xs text-orange-600 hover:text-orange-700 underline"
                                                    >
                                                        Copy Coordinates
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
                                                            window.open(mapsUrl, '_blank');
                                                        }}
                                                        className="mt-1 text-xs text-blue-600 hover:text-blue-700 underline"
                                                    >
                                                        View on Google Maps
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-md font-medium text-gray-800 mb-1">Set Your Prices (Rp)</h3>
                            <p className="text-xs text-gray-500 mb-3">These Prices Displayed On The App</p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <div>
                                   <label className="block text-xs font-medium text-gray-600 mb-1">{t['60min'] || '60min'}</label>
                                   <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                                       <input type="text" value={formatPriceDisplay(pricing["60"])} onChange={e => handlePriceChange("60", e.target.value)} placeholder="250k" className="block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm" />
                                    </div>
                                </div>
                                <div>
                                   <label className="block text-xs font-medium text-gray-600 mb-1">{t['90min'] || '90min'}</label>
                                     <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                                       <input type="text" value={formatPriceDisplay(pricing["90"])} onChange={e => handlePriceChange("90", e.target.value)} placeholder="350k" className="block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm" />
                                    </div>
                                </div>
                                 <div>
                                   <label className="block text-xs font-medium text-gray-600 mb-1">{t['120min'] || '120min'}</label>
                                    <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                                       <input type="text" value={formatPriceDisplay(pricing["120"])} onChange={e => handlePriceChange("120", e.target.value)} placeholder="450k" className="block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Hotel/Villa Special Pricing Section */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="mb-3">
                                <h3 className="text-sm sm:text-md font-medium text-gray-800">Hotel/Villa Live Menu Pricing</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Set special prices for hotel/villa guest Menu
                                </p>
                                <div className="mt-3">
                                    <CustomCheckbox
                                        label="Same as regular"
                                        checked={useSamePricing}
                                        onChange={() => handleUseSamePricingChange(!useSamePricing)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <div>
                                   <label className="block text-xs font-medium text-gray-600 mb-1">{t['60min'] || '60min'}</label>
                                   <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                                       <input 
                                           type="text" 
                                           value={formatPriceDisplay(hotelVillaPricing["60"])} 
                                           onChange={e => handleHotelVillaPriceChange("60", e.target.value)} 
                                           placeholder="250k" 
                                           disabled={useSamePricing}
                                           className={`block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm ${
                                               useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                           }`}
                                       />
                                    </div>
                                    {!useSamePricing && pricing["60"] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {formatPriceDisplay(Math.floor(pricing["60"] * 1.2))}
                                        </p>
                                    )}
                                </div>
                                <div>
                                   <label className="block text-xs font-medium text-gray-600 mb-1">{t['90min'] || '90min'}</label>
                                     <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                                       <input 
                                           type="text" 
                                           value={formatPriceDisplay(hotelVillaPricing["90"])} 
                                           onChange={e => handleHotelVillaPriceChange("90", e.target.value)} 
                                           placeholder="350k" 
                                           disabled={useSamePricing}
                                           className={`block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm ${
                                               useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                           }`}
                                       />
                                    </div>
                                    {!useSamePricing && pricing["90"] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {formatPriceDisplay(Math.floor(pricing["90"] * 1.2))}
                                        </p>
                                    )}
                                </div>
                                 <div>
                                   <label className="block text-xs font-medium text-gray-600 mb-1">{t['120min'] || '120min'}</label>
                                    <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                                       <input 
                                           type="text" 
                                           value={formatPriceDisplay(hotelVillaPricing["120"])} 
                                           onChange={e => handleHotelVillaPriceChange("120", e.target.value)} 
                                           placeholder="450k" 
                                           disabled={useSamePricing}
                                           className={`block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm ${
                                               useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                           }`}
                                       />
                                    </div>
                                    {!useSamePricing && pricing["120"] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {formatPriceDisplay(Math.floor(pricing["120"] * 1.2))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <Button onClick={handleSave} className="w-full py-3 text-base font-semibold">{t.saveButton || 'Save Profile'}</Button>
                        </div>
                    </div>
                )
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm px-3 sm:px-4 py-3 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-bold flex-shrink-0">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Burger Menu - Moved to right */}
                        <button 
                            onClick={() => setIsSideDrawerOpen(true)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <Menu className="w-5 h-5 text-orange-500" />
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
                                <span className="font-medium">Online Status</span>
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
                                <span className="font-medium">Profile</span>
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
                                <span className="font-medium">Booking</span>
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
                                <span className="font-medium">Analytic</span>
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
                                <span className="font-medium">Hotel/Villa</span>
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
                                    setActiveTab('chat');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'chat' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="font-medium">Chat Support</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('promotions');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'promotions' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Megaphone className="w-5 h-5" />
                                <span className="font-medium">Promotions</span>
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
                                    setActiveTab('jobOpportunities');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'jobOpportunities' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Briefcase className="w-5 h-5" />
                                <span className="font-medium">Job Opportunities</span>
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
                                <span className="font-medium">Terms</span>
                            </button>

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
                                <span className="font-medium">Logout</span>
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
                currentPage={activeTab}
                userRole="therapist"
                onHomeClick={onNavigateToHome || (() => onNavigate?.('home')) || (() => {})}
                onNotificationsClick={() => setActiveTab('notifications')}
                onBookingsClick={() => setActiveTab('bookings')}
                onProfileClick={() => setActiveTab('profile')}
                onChatClick={() => setActiveTab('chat')}
                unreadNotifications={notifications.filter(n => !n.isRead).length}
                hasNewBookings={upcomingBookings.length > 0}
                t={t}
            />
        </div>
    );
};

export default TherapistDashboardPage;
