import React, { useState, useEffect, useRef } from 'react';
import type { Place, Pricing, Booking, Notification } from '../types';
import { BookingStatus, HotelVillaServiceStatus } from '../types';
import { User, Calendar, TrendingUp, Hotel, FileCheck, LogOut } from 'lucide-react';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import ClockIcon from '../components/icons/ClockIcon';
import NotificationBell from '../components/NotificationBell';
import CustomCheckbox from '../components/CustomCheckbox';
import { MASSAGE_TYPES_CATEGORIZED, ADDITIONAL_SERVICES } from '../constants/rootConstants';
import TabButton from '../components/dashboard/TabButton';


interface PlaceDashboardPageProps {
    onSave: (data: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    placeId: number;
    place?: Place | null;
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


const PlaceDashboardPage: React.FC<PlaceDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications, onUpdateBookingStatus, placeId: _placeId, place: placeProp, bookings, notifications, t }) => {
    const [place] = useState<Place | null>(placeProp || null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [thumbnailImages, setThumbnailImages] = useState(['', '', '']);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [additionalServices, setAdditionalServices] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('21:00');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const locationInputRef = useRef<HTMLInputElement>(null);

    // Note: Place data should be passed via props or fetched from Appwrite
    // For now, using mock data structure
    useEffect(() => {
        // Initialize with default values if place prop exists
        if (place) {
            setName(place.name || '');
            setDescription(place.description || '');
            setMainImage(place.mainImage || '');
            setThumbnailImages([...(place.thumbnailImages || []), '', '', ''].slice(0, 3));
            setWhatsappNumber(place.whatsappNumber || '');
            
            // Parse JSON strings from Appwrite
            try {
                setPricing(typeof place.pricing === 'string' ? JSON.parse(place.pricing) : place.pricing || { '60': 0, '90': 0, '120': 0 });
                setCoordinates(typeof place.coordinates === 'string' ? JSON.parse(place.coordinates) : place.coordinates || { lat: 0, lng: 0 });
                setMassageTypes(typeof place.massageTypes === 'string' ? JSON.parse(place.massageTypes) : place.massageTypes || []);
            } catch (e) {
                console.error('Error parsing place data:', e);
            }
            
            setLanguages(place.languages || []);
            setLocation(place.location || '');
            setOpeningTime(place.openingTime || '09:00');
            setClosingTime(place.closingTime || '21:00');
        }
        setIsLoading(false);
    }, [place]);


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
                types: ['establishment', 'geocode'],
                componentRestrictions: { country: 'id' }
            });
            autocomplete.addListener('place_changed', () => {
                const placeResult = autocomplete.getPlace();
                if (placeResult.formatted_address) {
                    setLocation(placeResult.formatted_address);
                }
                if (placeResult.geometry && placeResult.geometry.location) {
                    setCoordinates({
                        lat: placeResult.geometry.location.lat(),
                        lng: placeResult.geometry.location.lng(),
                    });
                }
            });
        }
    }, [mapsApiLoaded]);

    const handleSave = () => {
        onSave({
            name,
            description,
            mainImage,
            thumbnailImages: thumbnailImages.filter(img => img), // remove empty strings
            whatsappNumber,
            pricing: JSON.stringify(pricing),
            location,
            coordinates: JSON.stringify(coordinates),
            massageTypes: JSON.stringify(massageTypes),
            languages,
            openingTime,
            closingTime,
            distance: 0, // dummy value
            activeMembershipDate: place?.activeMembershipDate || '',
            password: place?.password,
            analytics: JSON.stringify(place?.analytics || { impressions: 0, profileViews: 0, whatsappClicks: 0 }),
        });
    };
    
    const handlePriceChange = (duration: keyof Pricing, value: string) => {
        const numValue = parseInt(value, 10);
        setPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
    };
    
    const handleThumbnailChange = (index: number, value: string) => {
        const newThumbs = [...thumbnailImages];
        newThumbs[index] = value;
        setThumbnailImages(newThumbs);
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

    const handleAdditionalServiceChange = (service: string) => {
        setAdditionalServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
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
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
        </div>
    );
    
    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) >= now).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const pastBookings = bookings.filter(b => new Date(b.startTime) < now).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
    }

    if (!place) {
        return <div className="p-4 text-center text-red-500">Could not load place data. Please try logging in again.</div>
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'terms':
                return (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
                        <p className="text-gray-600">Terms content will be displayed here.</p>
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
                const analytics = (() => {
                    try {
                        return typeof place?.analytics === 'string' 
                            ? JSON.parse(place.analytics) 
                            : (place?.analytics || { impressions: 0, profileViews: 0, whatsappClicks: 0 });
                    } catch {
                        return { impressions: 0, profileViews: 0, whatsappClicks: 0 };
                    }
                })();
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
                            <AnalyticsCard title={t.analytics.impressions} value={analytics.impressions ?? 0} description={t.analytics.impressionsDesc} />
                            <AnalyticsCard title={t.analytics.profileViews} value={analytics.profileViews ?? 0} description={t.analytics.profileViewsDesc} />
                            <AnalyticsCard title={t.analytics.whatsappClicks} value={analytics.whatsappClicks ?? 0} description={t.analytics.whatsappClicksDesc} />
                        </div>
                    </div>
                );
            case 'hotelVilla':
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
            case 'profile':
            default:
                return (
                    <div className="space-y-6">
                        <ImageUpload
                            id="main-image-upload"
                            label={t.uploadMainImage}
                            currentImage={mainImage}
                            onImageChange={setMainImage}
                        />
                        <div className="grid grid-cols-3 gap-4">
                            {thumbnailImages.map((thumb, index) => (
                                <ImageUpload
                                    key={index}
                                    id={`thumb-upload-${index}`}
                                    label={`${t.uploadThumb} ${index + 1}`}
                                    currentImage={thumb}
                                    onImageChange={(dataUrl) => handleThumbnailChange(index, dataUrl)}
                                    heightClass="h-28"
                                />
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t.nameLabel}</label>
                            {renderInput(name, setName, UserSolidIcon)}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t.descriptionLabel}</label>
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
                                    className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/250 characters
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <label className="text-sm font-semibold text-green-800">Qualified Business Badge</label>
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
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t.whatsappLabel}</label>
                            {renderInput(whatsappNumber, setWhatsappNumber, PhoneIcon, '6281234567890')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Business Hours</label>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                    <label className="block text-xs font-medium text-gray-900">Opening Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon className="h-5 w-5 text-gray-400" /></div>
                                        <input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-900">Closing Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon className="h-5 w-5 text-gray-400" /></div>
                                        <input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t.massageTypesLabel}</label>
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
                            <label className="block text-sm font-medium text-gray-900 mb-2">Languages Spoken at Your Place</label>
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
                        
                        {/* Additional Services Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Additional Services</label>
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {ADDITIONAL_SERVICES.map((service: string) => (
                                        <CustomCheckbox
                                            key={service}
                                            label={service}
                                            checked={additionalServices.includes(service)}
                                            onChange={() => handleAdditionalServiceChange(service)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t.locationLabel}</label>
                            {mapsApiLoaded ? (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input ref={locationInputRef} type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t.locationPlaceholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
                                    </div>
                                    <Button 
                                        onClick={handleSetLocation} 
                                        variant="secondary" 
                                        className={`flex items-center justify-center gap-2 mt-2 text-sm py-2 ${
                                            location ? 'bg-green-500 hover:bg-green-600 text-white' : ''
                                        }`}
                                    >
                                        <MapPinIcon className="w-4 h-4" />
                                        <span>{location ? 'Location Set ✓' : t.setLocation}</span>
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
                                <label className="block text-xs font-medium text-gray-900">{t['60min']}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input type="number" value={pricing['60']} onChange={e => handlePriceChange('60', e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['90min']}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input type="number" value={pricing['90']} onChange={e => handlePriceChange('90', e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['120min']}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input type="number" value={pricing['120']} onChange={e => handlePriceChange('120', e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSave}>{t.saveButton}</Button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-base sm:text-2xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
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

            {/* Status Banner */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-4">
                <div className={`rounded-xl p-4 text-center text-sm font-medium ${place?.isLive ? 'bg-green-100 border-2 border-green-300 text-green-800' : 'bg-yellow-100 border-2 border-yellow-300 text-yellow-800'}`}>
                    {place?.isLive ? t.profileLive : t.pendingApproval}
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
                {renderContent()}
            </main>
        </div>
    );
};

export default PlaceDashboardPage;
