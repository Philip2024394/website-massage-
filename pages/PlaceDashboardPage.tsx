import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Place, Pricing, Booking, Notification } from '../types';
import { BookingStatus, HotelVillaServiceStatus, AvailabilityStatus } from '../types';
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
import { PLACE_SERVICES } from '../constants';

interface PlaceDashboardPageProps {
    onSave: (data: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    placeId: number | string; // Support both for Appwrite compatibility
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


const PlaceDashboardPage: React.FC<PlaceDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications, onUpdateBookingStatus, placeId, bookings, notifications, t }) => {
    const [place, setPlace] = useState<Place | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [thumbnailImages, setThumbnailImages] = useState(['', '', '']);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('21:00');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const locationInputRef = useRef<HTMLInputElement>(null);

    const fetchPlaceData = useCallback(async () => {
        setIsLoading(true);
        
        // Mock place data for demonstration
        // In production, this would fetch from your data service
        const mockPlaceData = {
            id: 1,
            name: 'Sample Place',
            description: 'A beautiful wellness center',
            mainImage: 'https://via.placeholder.com/400x250/F97316/FFFFFF?text=Sample+Place',
            thumbnailImages: ['https://via.placeholder.com/150/F97316/FFFFFF?text=1'],
            whatsappNumber: '6281234567890',
            pricing: JSON.stringify({ 60: 200000, 90: 280000, 120: 360000 }),
            location: 'Jakarta',
            coordinates: JSON.stringify({ lat: -6.2088, lng: 106.8456 }),
            massageTypes: 'Relaxation,Deep Tissue',
            openingTime: '09:00',
            closingTime: '21:00',
            email: 'info@sampleplace.com',
            distance: 0,
            rating: 4.5,
            reviewCount: 32,
            isLive: true,
            status: AvailabilityStatus.Available,
            analytics: '{ "impressions": 245, "profileViews": 89, "whatsappClicks": 23 }',
            activeMembershipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setPlace(mockPlaceData);
        setName(mockPlaceData.name || '');
        setDescription(mockPlaceData.description || '');
        setMainImage(mockPlaceData.mainImage || '');
        setThumbnailImages([...(mockPlaceData.thumbnailImages || []), '', '', ''].slice(0, 3));
        setWhatsappNumber(mockPlaceData.whatsappNumber || '');
        setPricing(JSON.parse(mockPlaceData.pricing) || { 60: 0, 90: 0, 120: 0 });
        setLocation(mockPlaceData.location || '');
        setCoordinates(JSON.parse(mockPlaceData.coordinates) || { lat: 0, lng: 0 });
        setMassageTypes(mockPlaceData.massageTypes.split(',') || []);
        setOpeningTime(mockPlaceData.openingTime || '09:00');
        setClosingTime(mockPlaceData.closingTime || '21:00');
        
        setIsLoading(false);
    }, [placeId]);

    useEffect(() => {
        fetchPlaceData();
    }, [fetchPlaceData]);


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
            openingTime,
            closingTime,
            distance: 0, // dummy value
            activeMembershipDate: place?.activeMembershipDate || '',
            password: place?.password,
            analytics: typeof place?.analytics === 'string' ? place.analytics : JSON.stringify(place?.analytics || { impressions: 0, profileViews: 0, whatsappClicks: 0 }),
        });
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
                                const analytics = typeof place?.analytics === 'string' ? JSON.parse(place.analytics) : place?.analytics;
                                return analytics?.impressions ?? 0;
                            } catch { return 0; }
                        })()} description={t.analytics.impressionsDesc} />
                        <AnalyticsCard title={t.analytics.profileViews} value={(() => {
                            try {
                                const analytics = typeof place?.analytics === 'string' ? JSON.parse(place.analytics) : place?.analytics;
                                return analytics?.profileViews ?? 0;
                            } catch { return 0; }
                        })()} description={t.analytics.profileViewsDesc} />
                        <AnalyticsCard title={t.analytics.whatsappClicks} value={(() => {
                            try {
                                const analytics = typeof place?.analytics === 'string' ? JSON.parse(place.analytics) : place?.analytics;
                                return analytics?.whatsappClicks ?? 0;
                            } catch { return 0; }
                        })()} description={t.analytics.whatsappClicksDesc} />
                    </div>
                );
            case 'hotelVilla':
                const handleHotelVillaUpdate = (status: HotelVillaServiceStatus, hotelDiscount: number, villaDiscount: number) => {
                    // Update place data with hotel-villa preferences
                    console.log('Hotel-Villa preferences updated:', { status, hotelDiscount, villaDiscount });
                    // In a real app, this would save to the backend
                };
                
                return (
                    <HotelVillaOptIn
                        currentStatus={place?.hotelVillaServiceStatus || HotelVillaServiceStatus.NotOptedIn}
                        hotelDiscount={place?.hotelDiscount || 20}
                        villaDiscount={place?.villaDiscount || 20}
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
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
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
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {PLACE_SERVICES.map(type => (
                                        <CustomCheckbox
                                            key={type}
                                            label={type}
                                            checked={massageTypes.includes(type)}
                                            onChange={() => handleMassageTypeChange(type)}
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
                                <label className="block text-xs font-medium text-gray-900">{t['60min']}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input type="text" value={formatPriceDisplay(pricing['60'])} onChange={e => handlePriceChange('60', e.target.value)} placeholder="e.g., 250k" className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['90min']}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input type="text" value={formatPriceDisplay(pricing['90'])} onChange={e => handlePriceChange('90', e.target.value)} placeholder="e.g., 350k" className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['120min']}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input type="text" value={formatPriceDisplay(pricing['120'])} onChange={e => handlePriceChange('120', e.target.value)} placeholder="e.g., 450k" className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
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
        <div className="min-h-screen bg-gray-50 p-4">
             <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.placeTitle}</h1>
                 <div className="flex items-center gap-4">
                    <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
                    <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logoutButton}</Button>
                </div>
            </header>

            <div className={`p-4 rounded-lg mb-6 text-center text-sm font-medium ${place?.isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {place?.isLive ? t.profileLive : t.pendingApproval}
            </div>
            
            <div className="mb-6">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>{t.tabs.profile}</button>
                    <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'bookings' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>{t.tabs.bookings}</button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'analytics' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>{t.tabs.analytics}</button>
                    <button onClick={() => setActiveTab('hotelVilla')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'hotelVilla' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>Hotel & Villa</button>
                </div>
            </div>

            {renderContent()}

        </div>
    );
};

export default PlaceDashboardPage;
