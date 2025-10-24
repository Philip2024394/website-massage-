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
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';


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
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

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
        setWhatsappNumber(mockTherapist.whatsappNumber || '');
        setMassageTypes(parseMassageTypes(mockTherapist.massageTypes));
        setPricing(parsePricing(mockTherapist.pricing));
        setLocation(mockTherapist.location || '');
        setCoordinates(parseCoordinates(mockTherapist.coordinates));
        setStatus(mockTherapist.status || AvailabilityStatus.Offline);
        
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
           
            pricing: stringifyPricing(pricing),
           
            location,
            coordinates: stringifyCoordinates(coordinates),
            status,
            distance: 0, // dummy value
            analytics: therapist?.analytics || stringifyAnalytics({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
            massageTypes: stringifyMassageTypes(massageTypes),
        });
    };
    
    const handlePriceChange = (duration: keyof Pricing, value: string) => {
        const numValue = parseInt(value, 10);
        setPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
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
            case 'profile':
            default:
                return (
                     <div className="space-y-6">
                         {/* Important Profile Image Requirements Notice */}
                         <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h3 className="text-red-800 font-bold text-lg mb-2">IMPORTANT: Profile Image Requirements</h3>
                                    <ul className="text-red-700 text-sm space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold">✓</span>
                                            <span><strong>REQUIRED:</strong> Your profile image MUST show your face - side view or front view only</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold">✗</span>
                                            <span><strong>NOT ALLOWED:</strong> Images that do not represent you as the therapist</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold">⚠</span>
                                            <span><strong>WARNING:</strong> Accounts with inappropriate or non-representative images will be <strong>BLOCKED</strong> until corrected</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold">📸</span>
                                            <span>Live profiles must display professional photos showing the therapist clearly</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                         <ImageUpload
                            id="profile-picture-upload"
                            label={t.uploadProfilePic}
                            currentImage={profilePicture}
                            onImageChange={setProfilePicture}
                        />
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t.onlineStatusLabel}</label>
                            <div className="mt-2 flex bg-gray-200 rounded-full p-1">
                                {Object.values(AvailabilityStatus).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`w-1/3 py-2 px-2 rounded-full text-sm font-semibold transition-colors duration-300 ${status === s ? 'bg-brand-orange text-white shadow' : 'text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                            {renderInput(name, setName, UserSolidIcon)}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t.descriptionLabel}</label>
                            <div className="relative">
                                <div className="absolute top-3.5 left-0 pl-3 flex items-center pointer-events-none">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" />
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
                            <label className="block text-sm font-medium text-gray-700">{t.locationLabel}</label>
                            {mapsApiLoaded ? (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input ref={locationInputRef} type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t.locationPlaceholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" />
                                    </div>
                                    <Button onClick={handleSetLocation} variant="secondary" className="flex items-center justify-center gap-2 mt-2 text-sm py-2">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span>{t.setLocation}</span>
                                    </Button>
                                </>
                            ) : (
                                <div className="mt-2 p-3 bg-yellow-100 text-yellow-800 text-sm rounded-md">
                                   {t.mapsApiError}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-md font-medium text-gray-800">{t.pricingTitle}</h3>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div>
                                   <label className="block text-xs font-medium text-gray-600">{t['60min']}</label>
                                   <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                       <input type="number" value={pricing["60"]} onChange={e => handlePriceChange("60", e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                   <label className="block text-xs font-medium text-gray-600">{t['90min']}</label>
                                     <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                       <input type="number" value={pricing["90"]} onChange={e => handlePriceChange("90", e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                                 <div>
                                   <label className="block text-xs font-medium text-gray-600">{t['120min']}</label>
                                    <div className="relative">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                       <input type="number" value={pricing["120"]} onChange={e => handlePriceChange("120", e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <Button onClick={handleSave}>{t.saveButton}</Button>
                        </div>
                    </div>
                )
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4">
             <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.therapistTitle}</h1>
                <div className="flex items-center gap-4">
                    <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
                    <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logoutButton}</Button>
                </div>
            </header>

            <div className={`p-4 rounded-lg mb-6 text-center text-sm font-medium ${therapist?.isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {therapist?.isLive ? t.profileLive : t.pendingApproval}
            </div>

             <div className="mb-6">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>{t.tabs.profile}</button>
                    <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'bookings' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>{t.tabs.bookings}</button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'analytics' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>{t.tabs.analytics}</button>
                    <button onClick={() => setActiveTab('hotelVilla')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'hotelVilla' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}>Hotel & Villa</button>
                </div>
            </div>

            {renderContent()}

        </div>
    );
};

export default TherapistDashboardPage;
