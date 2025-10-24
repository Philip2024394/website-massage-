import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import { AvailabilityStatus, BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyAnalytics } from '../utils/appwriteHelpers';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import NotificationBell from '../components/NotificationBell';
import CustomCheckbox from '../components/CustomCheckbox';
import LogoutIcon from '../components/icons/LogoutIcon';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';
import TherapistTermsPage from './TherapistTermsPage';


interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    therapistId: number | string; // Support both for Appwrite compatibility
    bookings: Booking[];
    notifications: Notification[];
    t: any;
}

const AnalyticsCard: React.FC<{ title: string; value: number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
);

const BookingCard: React.FC<{ booking: Booking; onUpdateStatus: (id: number, status: BookingStatus) => void; t: any }> = ({ booking, onUpdateStatus, t }) => {
    const isPending = booking.status === BookingStatus.Pending;
    const isUpcoming = new Date(booking.startTime) > new Date();

    const statusColors = {
        [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [BookingStatus.Confirmed]: 'bg-green-100 text-green-800',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800',
        [BookingStatus.Completed]: 'bg-blue-100 text-blue-800',
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">{booking.userName}</p>
                    <p className="text-sm text-gray-600">{t.service}: {booking.service} min</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>{booking.status}</span>
            </div>
            <p className="text-sm text-gray-600">{t.date}: {new Date(booking.startTime).toLocaleString()}</p>
            {isPending && isUpcoming && (
                 <div className="flex gap-2 pt-2 border-t">
                    <Button onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)} className="text-sm py-1.5">{t.confirm}</Button>
                    <Button onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)} variant="secondary" className="text-sm py-1.5">{t.cancel}</Button>
                </div>
            )}
        </div>
    );
}

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications, onUpdateBookingStatus, therapistId, bookings, notifications, t }) => {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [isLicensed, setIsLicensed] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const locationInputRef = useRef<HTMLInputElement>(null);
    
    const fetchTherapistData = useCallback(async () => {
        // Mock implementation - replace with your actual data fetching logic
        setIsLoading(true);
        
        // Mock therapist data
        const mockTherapist = {
            id: therapistId,
            name: 'Sample Therapist',
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
            email: 'sample@email.com',
            distance: 0,
            analytics: stringifyAnalytics({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
        };
        
        setTherapist(mockTherapist);
        setName(mockTherapist.name || '');
        setDescription(mockTherapist.description || '');
        setProfilePicture(mockTherapist.profilePicture || '');
        console.log('📷 Initial profilePicture from mockTherapist:', mockTherapist.profilePicture);
        setWhatsappNumber(mockTherapist.whatsappNumber || '');
        setYearsOfExperience((mockTherapist as any).yearsOfExperience || 0);
        setMassageTypes(parseMassageTypes(mockTherapist.massageTypes));
        setPricing(parsePricing(mockTherapist.pricing));
        setLocation(mockTherapist.location || '');
        setCoordinates(parseCoordinates(mockTherapist.coordinates));
        setStatus(mockTherapist.status || AvailabilityStatus.Offline);
        setIsLicensed((mockTherapist as any).isLicensed || false);
        setLicenseNumber((mockTherapist as any).licenseNumber || '');
        
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
            whatsappNumber,
            yearsOfExperience,
            isLicensed,
            pricing: stringifyPricing(pricing),
           
            location,
            coordinates: stringifyCoordinates(coordinates),
            status,
            analytics: therapist?.analytics || stringifyAnalytics({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
            massageTypes: stringifyMassageTypes(massageTypes),
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
    
    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
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
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.bookings.upcoming}</h3>
                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t.bookings} />)}
                                </div>
                            ) : <p className="text-sm text-gray-500">{t.bookings.noUpcoming}</p>}
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.bookings.past}</h3>
                            {pastBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {pastBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t.bookings} />)}
                                </div>
                            ) : <p className="text-sm text-gray-500">{t.bookings.noPast}</p>}
                        </div>
                    </div>
                );
            case 'analytics':
                 return (
                    <div className="space-y-4">
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
                );
            case 'hotelVilla':
                const handleHotelVillaUpdate = (status: HotelVillaServiceStatus, hotelDiscount: number, villaDiscount: number) => {
                    // Update therapist data with hotel-villa preferences
                    console.log('Hotel-Villa preferences updated:', { status, hotelDiscount, villaDiscount });
                    // In a real app, this would save to the backend
                };
                
                return (
                    <HotelVillaOptIn
                        currentStatus={therapist?.hotelVillaServiceStatus || HotelVillaServiceStatus.NotOptedIn}
                        hotelDiscount={therapist?.hotelDiscount || 20}
                        villaDiscount={therapist?.villaDiscount || 20}
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
                    setProfilePicture(imageUrl);
                };
                
                return (
                     <div className="space-y-6">
                         <ImageUpload
                            id="profile-picture-upload"
                            label={t.uploadProfilePic}
                            currentImage={profilePicture}
                            onImageChange={handleProfilePictureChange}
                            variant="profile"
                        />
                         
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                            {renderInput(name, setName, UserSolidIcon)}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                            <input 
                                type="number" 
                                value={yearsOfExperience || ''} 
                                onChange={e => setYearsOfExperience(parseInt(e.target.value) || 0)} 
                                min="0"
                                max="50"
                                placeholder="Enter years of experience"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" 
                            />
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <label className="text-sm font-semibold text-green-800">Qualified Therapist Badge</label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsLicensed(!isLicensed)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isLicensed ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isLicensed ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            {isLicensed && (
                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-green-700 mb-1">License Number</label>
                                    <input
                                        type="text"
                                        value={licenseNumber}
                                        onChange={e => setLicenseNumber(e.target.value)}
                                        placeholder="Enter your license number"
                                        className="block w-full px-3 py-2 bg-white border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                                    />
                                    <p className="text-xs text-green-600 mt-1">✓ Your profile will display a Qualified Therapist badge</p>
                                </div>
                            )}
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
                                        if (e.target.value.length <= 500) {
                                            setDescription(e.target.value);
                                        }
                                    }} 
                                    rows={3} 
                                    maxLength={500}
                                    className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/500 characters
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
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-orange text-white hover:bg-orange-600 border-0"
                                >
                                    <MapPinIcon className="w-5 h-5" />
                                    <span className="font-semibold">Set Location from Device</span>
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
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center p-3 sm:p-4">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t.therapistTitle}</h1>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={() => setActiveTab('terms')} className="relative text-yellow-500 hover:text-yellow-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                                1
                            </span>
                        </button>
                        <button 
                            onClick={onLogout}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all"
                            aria-label="Logout"
                        >
                            <LogoutIcon className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="p-3 sm:p-4">
                    <div className="mb-4 sm:mb-6">
                        <div className="flex overflow-x-auto border-b border-gray-200 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                            <button onClick={() => setActiveTab('profile')} className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'profile' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>{t.tabs?.profile || 'Profile'}</button>
                            <button onClick={() => setActiveTab('bookings')} className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'bookings' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>{t.tabs?.bookings || 'Bookings'}</button>
                            <button onClick={() => setActiveTab('analytics')} className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'analytics' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>{t.tabs?.analytics || 'Analytics'}</button>
                            <button onClick={() => setActiveTab('terms')} className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'terms' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>Terms</button>
                            <button onClick={() => setActiveTab('hotelVilla')} className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'hotelVilla' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>Hotel/Villa</button>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            

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
        </div>
    );
};

export default TherapistDashboardPage;
