import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import { AvailabilityStatus, BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService } from '../lib/appwriteService';
import { User, FileText, Phone, DollarSign, MapPin, Calendar, TrendingUp, Hotel, FileCheck, LogOut, Bell } from 'lucide-react';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import Footer from '../components/Footer';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import CustomCheckbox from '../components/CustomCheckbox';
import LogoutIcon from '../components/icons/LogoutIcon';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import TherapistTermsPage from './TherapistTermsPage';
import TabButton from '../components/dashboard/TabButton';


interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigateToHome?: () => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
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
                 <div className="flex gap-2 pt-4 mt-4 border-t">
                    <button onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)} className="flex-1 bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-all">{t.confirm}</button>
                    <button onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)} className="flex-1 bg-white text-gray-700 font-semibold py-2.5 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all">{t.cancel}</button>
                </div>
            )}
        </div>
    );
}

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications, onNavigateToHome, onUpdateBookingStatus, therapistId, bookings, notifications, t }) => {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [isLicensed, setIsLicensed] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState('');

    const locationInputRef = useRef<HTMLInputElement>(null);
    
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
                mainImage: existingTherapist.mainImage?.substring(0, 50) + '...',
                location: existingTherapist.location,
                whatsappNumber: existingTherapist.whatsappNumber,
                yearsOfExperience: (existingTherapist as any).yearsOfExperience,
                massageTypes: existingTherapist.massageTypes
            });
            setTherapist(existingTherapist);
            setName(existingTherapist.name || '');
            setDescription(existingTherapist.description || '');
            setProfilePicture(existingTherapist.profilePicture || '');
            setMainImage(existingTherapist.mainImage || '');
            console.log('📷 Loaded profilePicture from database:', existingTherapist.profilePicture);
            console.log('📷 Loaded mainImage from database:', existingTherapist.mainImage);
            console.log('🔄 State updated - name:', existingTherapist.name, 'description length:', existingTherapist.description?.length);
            setWhatsappNumber(existingTherapist.whatsappNumber || '');
            setYearsOfExperience((existingTherapist as any).yearsOfExperience || 0);
            setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
            setLanguages(existingTherapist.languages || []);
            setPricing(parsePricing(existingTherapist.pricing));
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
                analytics: stringifyAnalytics({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
            };
            
            setTherapist(emptyTherapist);
            setName('');
            setDescription('');
            setProfilePicture('');
            setMainImage('');
            setWhatsappNumber('');
            setYearsOfExperience(0);
            setMassageTypes([]);
            setLanguages([]);
            setPricing({ "60": 0, "90": 0, "120": 0 });
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
        onSave({
            name,
            description,
            profilePicture,
            mainImage,
            whatsappNumber,
            yearsOfExperience,
            isLicensed,
            pricing: stringifyPricing(pricing),
           
            location,
            coordinates: stringifyCoordinates(coordinates),
            status,
            analytics: therapist?.analytics || stringifyAnalytics({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
            massageTypes: stringifyMassageTypes(massageTypes),
            languages,
        } as any);
        setShowConfirmation(true);
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

                const handleAcceptImageRequirement = () => {
                    setProfilePicture(pendingImageUrl);
                    setShowImageRequirementModal(false);
                    setPendingImageUrl('');
                };

                const handleRejectImageRequirement = () => {
                    setShowImageRequirementModal(false);
                    setPendingImageUrl('');
                    // Image is not set if they reject
                };
                
                return (
                     <div className="space-y-6">
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
                        
                        <ImageUpload
                            id="main-image-upload"
                            label="Main Banner Image (Optional)"
                            currentImage={mainImage}
                            onImageChange={(imageUrl) => setMainImage(imageUrl)}
                            variant="default"
                        />
                         
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
                                    const adminNumber = '6281392000050';
                                    const message = `Hello IndoStreet Admin, this is a test message from therapist ${name || 'Therapist'} (ID: ${therapistId}). My WhatsApp number is +62${whatsappNumber}.`;
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
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        📍 {location.substring(0, 50)}{location.length > 50 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-md font-medium text-gray-800 mb-2">{t.pricingTitle || 'Pricing'}</h3>
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
                        
                        <div className="pt-4">
                            <Button onClick={handleSave} className="w-full py-3 text-base font-semibold">{t.saveButton || 'Save Profile'}</Button>
                        </div>
                    </div>
                )
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-base sm:text-2xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveTab('terms')} className="relative p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <Bell className="w-5 h-5 text-orange-500" />
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="bg-white border-b sticky top-[52px] sm:top-[60px] z-20">
                <div className="max-w-7xl mx-auto px-2 sm:px-3 flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-2">
                    <TabButton
                        icon={<User className="w-4 h-4" />}
                        label={t.tabs?.profile || 'Profile'}
                        isActive={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    />
                    <TabButton
                        icon={<Calendar className="w-4 h-4" />}
                        label={t.tabs?.bookings || 'Bookings'}
                        isActive={activeTab === 'bookings'}
                        onClick={() => setActiveTab('bookings')}
                        badge={upcomingBookings.length}
                    />
                    <TabButton
                        icon={<TrendingUp className="w-4 h-4" />}
                        label={t.tabs?.analytics || 'Analytics'}
                        isActive={activeTab === 'analytics'}
                        onClick={() => setActiveTab('analytics')}
                    />
                    <TabButton
                        icon={<Hotel className="w-4 h-4" />}
                        label="Hotel/Villa"
                        isActive={activeTab === 'hotelVilla'}
                        onClick={() => setActiveTab('hotelVilla')}
                    />
                    <TabButton
                        icon={<FileCheck className="w-4 h-4" />}
                        label="Terms"
                        isActive={activeTab === 'terms'}
                        onClick={() => setActiveTab('terms')}
                    />
                </div>
            </nav>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
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

            {/* Footer */}
            <Footer
                currentPage="profile"
                userRole="therapist"
                onHomeClick={onNavigateToHome || (() => {})}
                onNotificationsClick={onNavigateToNotifications}
                onProfileClick={() => setActiveTab('profile')}
                unreadNotifications={notifications.filter(n => !n.isRead).length}
                t={t}
            />
        </div>
    );
};

export default TherapistDashboardPage;
