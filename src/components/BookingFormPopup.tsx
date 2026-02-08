// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * ⚠️ DEPRECATED - NOT CURRENTLY USED
 * This component is not actively imported in the main booking flows.
 * Current active booking flows use:
 * 1. BookingPopup.tsx (Menu slider "Book Now")
 * 2. ScheduleBookingPopup.tsx (Scheduled bookings)
 * 3. PersistentChatWindow.tsx (Direct "Book Now" chat)
 */
import React, { useState, useEffect } from 'react';
import { MapPin, Home, Building2, X } from 'lucide-react';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { logger } from '../utils/logger';

interface BookingFormPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (bookingData: BookingData) => void;
    therapistName: string;
    therapistId: string;
    pricing: {
        price60?: string;
        price90?: string;
        price120?: string;
    };
    rating?: number;
    reviewCount?: number;
    language: 'en' | 'id';
}

export interface BookingData {
    customerName: string;
    phoneNumber?: string;
    locationType: 'home' | 'hotel';
    address: string;
    roomNumber?: string;
    coordinates?: { lat: number; lng: number };
    duration: 60 | 90 | 120;
    price: string;
    selectedDate?: string;
    selectedTime?: string;
    massageType?: string;
    specialRequests?: string;
}

const BookingFormPopup: React.FC<BookingFormPopupProps> = ({
    isOpen,
    onClose,
    onSubmit,
    therapistName,
    therapistId,
    pricing,
    rating,
    reviewCount,
    language
}) => {
    // 🔥 CRITICAL: Check isOpen FIRST before ANY other logic
    if (!isOpen) {
        logger.debug('🚫 BookingFormPopup: isOpen=false, not rendering');
        return null;
    }

    // 🔥 CRITICAL GUARD: CRASH if no therapist context
    if (!therapistId || !therapistName) {
        logger.error('🚨🚨🚨 FATAL: BookingFormPopup rendered WITHOUT therapist context!', {
            therapistId,
            therapistName,
            isOpen
        });
        // HARD CRASH - This should NEVER happen
        throw new Error(`🚨 BOOKING MODAL BLOCKED: Missing therapist context (ID: ${therapistId}, Name: ${therapistName})`);
    }

    logger.debug('✅ BookingFormPopup mounting with valid therapist:', {
        therapistId,
        therapistName,
        isOpen
    });

    // 🔥 DEBUG ASSERTION: Ensure modal only opens via user click (not auto-open)
    useEffect(() => {
        console.assert(
            isOpen === true, 
            '🚨 ASSERTION FAILED: Booking modal opened but isOpen !== true'
        );
        logger.debug('✅ ASSERTION PASSED: Booking modal opened via user action (isOpen=true)');
    }, [isOpen]);

    const [customerName, setCustomerName] = useState('');
    const [locationType, setLocationType] = useState<'home' | 'hotel'>('home');
    const [address, setAddress] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [duration, setDuration] = useState<60 | 90 | 120>(60);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [gettingLocation, setGettingLocation] = useState(false);

    const translations = {
        en: {
            title: 'Book Massage Session',
            subtitle: `with ${therapistName}`,
            customerName: 'Your Name',
            customerNamePlaceholder: 'Enter your full name',
            locationType: 'Location Type',
            home: 'Home Address',
            hotel: 'Hotel/Villa',
            address: 'Address',
            addressPlaceholder: 'Enter your address',
            roomNumber: 'Room Number',
            roomNumberPlaceholder: 'e.g., 305',
            setLocation: 'Set Location',
            locationSet: 'Location Set',
            duration: 'Massage Duration',
            minutes: 'minutes',
            bookMassage: 'Book Massage',
            cancel: 'Cancel',
            requiredField: 'This field is required',
            gettingLocation: 'Getting location...',
            locationError: 'Could not get location. Please try again.'
        },
        id: {
            title: 'Pesan Sesi Pijat',
            subtitle: `dengan ${therapistName}`,
            customerName: 'Nama Anda',
            customerNamePlaceholder: 'Masukkan nama lengkap',
            locationType: 'Jenis Lokasi',
            home: 'Alamat Rumah',
            hotel: 'Hotel/Vila',
            address: 'Alamat',
            addressPlaceholder: 'Masukkan alamat Anda',
            roomNumber: 'Nomor Kamar',
            roomNumberPlaceholder: 'contoh: 305',
            setLocation: 'Set Lokasi',
            locationSet: 'Lokasi Diatur',
            duration: 'Durasi Pijat',
            minutes: 'menit',
            bookMassage: 'Pesan Pijat',
            cancel: 'Batal',
            requiredField: 'Kolom ini wajib diisi',
            gettingLocation: 'Mengambil lokasi...',
            locationError: 'Tidak dapat mengambil lokasi. Silakan coba lagi.'
        }
    };

    const t = translations[language];

    const handleSetLocation = async () => {
        if (!navigator.geolocation) {
            alert(t.locationError);
            return;
        }

        setGettingLocation(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                setCoordinates(coords);
                
                // Try to get human-readable address from Google Geocoding
                try {
                    const { GOOGLE_MAPS_API_KEY } = await import('../lib/appwrite.config');
                    
                    if (!GOOGLE_MAPS_API_KEY) {
                        setGettingLocation(false);
                        return;
                    }

                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}&language=${language === 'id' ? 'id' : 'en'}`;
                    const response = await fetch(geocodeUrl);
                    const data = await response.json();
                    
                    if (data.status === 'OK' && data.results && data.results.length > 0) {
                        // Auto-fill address field with Google result
                        const formattedAddress = data.results[0].formatted_address;
                        setAddress(formattedAddress);
                        
                        logger.debug('📍 Location set from Google:', formattedAddress);
                    }
                } catch (geocodeError) {
                    logger.error('Geocoding error:', geocodeError);
                }
                
                setGettingLocation(false);
            },
            (error) => {
                logger.error('Geolocation error:', error);
                alert(t.locationError);
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!customerName.trim()) {
            newErrors.customerName = t.requiredField;
        }

        if (!address.trim()) {
            newErrors.address = t.requiredField;
        }

        if (locationType === 'hotel' && !roomNumber.trim()) {
            newErrors.roomNumber = t.requiredField;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const priceMap = {
            60: pricing.price60 || '0',
            90: pricing.price90 || '0',
            120: pricing.price120 || '0'
        };

        const bookingData: BookingData = {
            customerName: customerName.trim(),
            locationType,
            address: address.trim(),
            roomNumber: locationType === 'hotel' ? roomNumber.trim() : undefined,
            coordinates: coordinates || undefined,
            duration,
            price: priceMap[duration]
        };

        onSubmit(bookingData);
        
        // Reset form
        setCustomerName('');
        setAddress('');
        setRoomNumber('');
        setCoordinates(null);
        setDuration(60);
        setErrors({});
    };

    // ✅ isOpen check already done at component start
    // ✅ Render inline (no fixed overlay) - parent controls visibility

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">{t.title}</h2>
                    <p className="text-green-100 mt-1">{t.subtitle}</p>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Customer Name */}
                    {/* <EnhancedFormField
                        label={t.customerName}
                        required={true}
                        error={errors.customerName}
                    >
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={t.customerNamePlaceholder}
                            className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-gray-300"
                        />
                    </EnhancedFormField> */}

                    {/* Location Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.locationType} *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setLocationType('home')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    locationType === 'home'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <Home className="w-5 h-5" />
                                <span className="font-medium">{t.home}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocationType('hotel')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    locationType === 'hotel'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <Building2 className="w-5 h-5" />
                                <span className="font-medium">{t.hotel}</span>
                            </button>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.address} *
                        </label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={t.addressPlaceholder}
                            rows={3}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* Room Number (only for hotel) */}
                    {locationType === 'hotel' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t.roomNumber} *
                            </label>
                            <input
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                placeholder={t.roomNumberPlaceholder}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.roomNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.roomNumber}</p>
                            )}
                        </div>
                    )}

                    {/* Set Location Button */}
                    <button
                        type="button"
                        onClick={handleSetLocation}
                        disabled={gettingLocation}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                            coordinates
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                        }`}
                    >
                        <MapPin className="w-5 h-5" />
                        <span>
                            {gettingLocation
                                ? t.gettingLocation
                                : coordinates
                                ? t.locationSet
                                : t.setLocation}
                        </span>
                    </button>

                    {/* Duration Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            {t.duration} *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[60, 90, 120].map((mins) => {
                                const priceMap: { [key: number]: string } = {
                                    60: pricing.price60 || '0',
                                    90: pricing.price90 || '0',
                                    120: pricing.price120 || '0'
                                };
                                const price = priceMap[mins];

                                return (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setDuration(mins as 60 | 90 | 120)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center relative ${
                                            duration === mins
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {/* Star Rating - Top Right */}
                                        {rating && reviewCount && getDisplayRating(rating, reviewCount) > 0 && (
                                            <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                                ★{formatRating(getDisplayRating(rating, reviewCount))}
                                            </div>
                                        )}
                                        <div className={`text-2xl font-bold ${
                                            duration === mins ? 'text-green-700' : 'text-gray-800'
                                        }`}>
                                            {mins}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">{t.minutes}</div>
                                        <div className={`text-sm font-semibold mt-2 ${
                                            duration === mins ? 'text-green-700' : 'text-gray-700'
                                        }`}>
                                            {price}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                        >
                            {t.bookMassage}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFormPopup;
