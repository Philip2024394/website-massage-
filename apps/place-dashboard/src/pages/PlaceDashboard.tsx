import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Place, Pricing, Booking, Notification, UserLocation } from '../types';
import { BookingStatus, HotelVillaServiceStatus } from '../types';
import { Calendar, TrendingUp, LogOut, Bell, MessageSquare, X, Megaphone, Menu, DollarSign, Home } from 'lucide-react';
import { loadGoogleMapsScript } from '../constants/appConstants';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import Button from '../components/Button';
import DiscountSharePage from './DiscountSharePage';
import MembershipPlansPage from './MembershipPlansPage';
import ImageUpload from '../components/ImageUpload';
import MainImageCropper from '../components/MainImageCropper';
import HotelVillaOptIn from '../components/HotelVillaOptIn';

import { placeService } from '../lib/appwriteService';
import { sanitizePlacePayload } from '../schemas/placeSchema';
import TherapistTermsPage from './TherapistTermsPage';
import LoadingSpinner from '../components/LoadingSpinner';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import CityLocationDropdown from '../components/CityLocationDropdown';
import ClockIcon from '../components/icons/ClockIcon';
import NotificationBell from '../components/NotificationBell';
import CustomCheckbox from '../components/CustomCheckbox';
import ValidationPopup from '../components/ValidationPopup';
import { MASSAGE_TYPES_CATEGORIZED, ADDITIONAL_SERVICES } from '../constants/rootConstants';
import { notificationService } from '../lib/appwriteService';
import { soundNotificationService } from '../utils/soundNotificationService';
import PushNotificationSettings from '../components/PushNotificationSettings';
import { 
    ColoredProfileIcon, 
    ColoredCalendarIcon, 
    ColoredAnalyticsIcon, 
    ColoredHotelIcon, 
    ColoredBellIcon, 
    ColoredTagIcon, 
    ColoredCrownIcon, 
    ColoredDocumentIcon, 
    ColoredHistoryIcon, 
    ColoredCoinsIcon 
} from '../components/ColoredIcons';
// Removed chat import - chat system removed
// import MemberChatWindow from '../components/MemberChatWindow';


interface PlaceDashboardPageProps {
    // Accept sanitized place payload rather than strict Place subset to avoid schema mismatch errors
    onSave?: (data: any) => void;
    onLogout: () => void;
    onNavigateToNotifications?: () => void;
    onNavigate?: (page: any) => void;
    onUpdateBookingStatus?: (bookingId: number, status: BookingStatus) => void;
    placeId?: number | string;
    place?: Place | null;
    bookings?: Booking[];
    notifications?: Notification[];
    userLocation?: UserLocation | null;
    t?: any;
    onNavigateToChat?: () => void;
    onNavigateToPayment?: () => void;
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
                    <p className="text-sm text-gray-600 mt-1">{t?.service || 'Service'}: {booking.service} min</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[booking.status]}`}>{booking.status}</span>
            </div>
            <p className="text-sm text-gray-600">{t?.date || 'Date'}: {new Date(booking.startTime).toLocaleString()}</p>
            {isPending && isUpcoming && (
                 <div className="flex gap-2 pt-4 mt-4 border-t">
                    <button onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)} className="flex-1 bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-all">{t?.confirm || 'Confirm'}</button>
                    <button onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)} className="flex-1 bg-white text-gray-700 font-semibold py-2.5 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all">{t?.cancel || 'Cancel'}</button>
                </div>
            )}
        </div>
    );
}


const PlaceDashboardPage: React.FC<PlaceDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications, onNavigate, onUpdateBookingStatus, placeId: _placeId, place: placeProp, bookings, notifications, userLocation, t, onNavigateToChat, onNavigateToPayment }) => {
    const [place, setPlace] = useState<Place | null>(placeProp || null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Use _placeId consistently
    const placeId = _placeId;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [showImageCropper, setShowImageCropper] = useState(false);
    
    // Log main image changes for debugging
    useEffect(() => {
        console.log('🔄 Main image state changed:', mainImage?.substring(0, 100) + (mainImage?.length > 100 ? '...' : ''));
    }, [mainImage]);
    
    const [galleryImages, setGalleryImages] = useState<Array<{ imageUrl: string; caption: string; description: string }>>([
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' }
    ]);
    const [contactNumber, setContactNumber] = useState('');
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [hotelVillaPricing, setHotelVillaPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [useSamePricing, setUseSamePricing] = useState(true);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [discountDuration, setDiscountDuration] = useState<number>(24); // hours
    const [isDiscountActive, setIsDiscountActive] = useState<boolean>(false);
    const [discountEndTime, setDiscountEndTime] = useState<string>('');
    const [location, setLocation] = useState('');
    const [isLocationManuallyEdited, setIsLocationManuallyEdited] = useState(false);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [yearsEstablished, setYearsEstablished] = useState<number>(1);
    const [languages, setLanguages] = useState<string[]>([]);
    const [additionalServices, setAdditionalServices] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [selectedCity, setSelectedCity] = useState<string>('all');

    // Debug function to check location system status
    const debugLocationSystem = () => {
        console.log('🔍 Location System Debug Info:');
        console.log('- mapsApiLoaded:', mapsApiLoaded);
        console.log('- Google Maps available:', !!(window as any).google?.maps);
        console.log('- Current location:', location);
        console.log('- Coordinates:', coordinates);
        console.log('- Is manually edited:', isLocationManuallyEdited);
        console.log('- Navigator geolocation:', !!navigator.geolocation);
        console.log('- API Key configured:', !!getStoredGoogleMapsApiKey());
    };
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('21:00');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotificationsView, setShowNotificationsView] = useState(false);
    
    // Website information for Indastreet Partners Directory
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [websiteTitle, setWebsiteTitle] = useState('');
    const [websiteDescription, setWebsiteDescription] = useState('');
    
    // Image upload warning modal states
    const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState('');
    
    // Validation popup state
    const [showValidationPopup, setShowValidationPopup] = useState(false);
    const [validationMissingFields, setValidationMissingFields] = useState<string[]>([]);
    
    // Toast notification state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const locationInputRef = useRef<HTMLInputElement>(null);

    // Load place data from database or use passed prop
    useEffect(() => {
        const loadPlaceData = async () => {
            setIsLoading(true);

            try {
                // Prefer the explicit incoming prop data first
                if (placeProp && (placeProp.name || placeProp.description || placeProp.mainImage)) {
                    console.log('📋 Using passed placeProp data:', placeProp);
                    setPlace(placeProp);
                    initializeWithPlaceData(placeProp);
                } else if (_placeId) {
                    console.log('🔄 Loading place data from database for placeId:', _placeId);
                    const loadedPlace = await placeService.getByProviderId(String(_placeId));
                    if (loadedPlace) {
                        console.log('✅ Loaded place data from database:', loadedPlace);
                        setPlace(loadedPlace);
                        initializeWithPlaceData(loadedPlace);
                    } else {
                        console.log('⚠️ No saved data found for placeId, initializing defaults');
                        const basicPlace = {
                            id: _placeId,
                            name: '',
                            description: '',
                            rating: 0,
                            isLive: false
                        } as Place;
                        setPlace(basicPlace);
                        initializeWithDefaults();
                    }
                } else {
                    console.log('⚠️ No placeId provided, initializing defaults');
                    initializeWithDefaults();
                }
            } catch (error) {
                console.error('❌ Error loading place data:', error);
                initializeWithDefaults();
            }

            setIsLoading(false);
        };

        loadPlaceData();
        // Only re-run if the external identifier or prop changes, not when local place state updates
    }, [_placeId, placeProp]);
    
    const initializeWithPlaceData = (placeData: Place) => {
        setName(placeData.name || '');
        setDescription(placeData.description || '');
        
        // Load mainimage from Appwrite (lowercase attribute)
        const mainImageValue = (placeData as any).mainimage || placeData.mainImage || '';
        setMainImage(mainImageValue);
        setProfilePicture((placeData as any).profilePicture || mainImageValue || '');
        
        // Load gallery images - Appwrite uses 'galleryImages' (camelCase)
        const galleryData = (placeData as any).galleryImages || (placeData as any).galleryimages;
        if (galleryData) {
            let parsedGallery = [];
            
            // Parse if it's a JSON string
            if (typeof galleryData === 'string') {
                try {
                    parsedGallery = JSON.parse(galleryData);
                } catch (e) {
                    console.error('Error parsing gallery images:', e);
                    parsedGallery = [];
                }
            } else if (Array.isArray(galleryData)) {
                parsedGallery = galleryData;
            }
            
            const loadedGallery = parsedGallery.map((item: any) => ({
                imageUrl: item.imageUrl || '',
                caption: item.caption || '',
                description: item.description || ''
            }));
            
            // Ensure we always have 6 slots
            while (loadedGallery.length < 6) {
                loadedGallery.push({ imageUrl: '', caption: '', description: '' });
            }
            setGalleryImages(loadedGallery.slice(0, 6));
        }
        
        setContactNumber(placeData.contactNumber || '');
        
        // Parse JSON strings from Appwrite
        try {
            setPricing(typeof placeData.pricing === 'string' ? JSON.parse(placeData.pricing) : placeData.pricing || { '60': 0, '90': 0, '120': 0 });
            
            setDiscountPercentage((placeData as any).discountpercentage || 0);
            setDiscountDuration((placeData as any).discountduration || 24);
            setIsDiscountActive((placeData as any).isdiscountactive || false);
            setDiscountEndTime((placeData as any).discountendtime || '');
            
            setCoordinates(typeof placeData.coordinates === 'string' ? JSON.parse(placeData.coordinates) : placeData.coordinates || { lat: 0, lng: 0 });
            
            // Parse massage types - handle both JSON string and array
            const massageTypesRaw = (placeData as any).massagetypes || placeData.massageTypes;
            setMassageTypes(typeof massageTypesRaw === 'string' ? JSON.parse(massageTypesRaw) : massageTypesRaw || []);
            
            // Parse languages - handle both JSON string and array
            const languagesRaw = placeData.languages || (placeData as any).languagesspoken;
            setLanguages(typeof languagesRaw === 'string' ? JSON.parse(languagesRaw) : languagesRaw || []);
            
            // Parse additional services - handle both JSON string and array
            const servicesRaw = placeData.additionalServices || (placeData as any).additionalservices;
            setAdditionalServices(typeof servicesRaw === 'string' ? JSON.parse(servicesRaw) : servicesRaw || []);
            
            setYearsEstablished((placeData as any).yearsEstablished || placeData.yearsEstablished || 1);
            // Load saved city if present
            try {
                const savedCity = (placeData as any).city;
                if (savedCity && typeof savedCity === 'string') {
                    setSelectedCity(savedCity);
                }
            } catch {}
        } catch (_e) {
            console.error('Error parsing place data:', _e);
        }
        
        // Auto-fill location from userLocation if place location is empty
        if (placeData.location) {
            setLocation(placeData.location);
        } else if (userLocation?.address) {
            console.log('📍 Auto-filling location from landing page:', userLocation.address);
            setLocation(userLocation.address);
            if (userLocation.lat && userLocation.lng) {
                setCoordinates({ lat: userLocation.lat, lng: userLocation.lng });
            }
        } else {
            setLocation('');
        }
        
        setOpeningTime((placeData as any).openingtime || (placeData as any).openingTime || '09:00');
        setClosingTime((placeData as any).closingtime || (placeData as any).closingTime || '21:00');
        
        // Initialize website information
        setWebsiteUrl((placeData as any).websiteUrl || (placeData as any).websiteurl || '');
        setWebsiteTitle((placeData as any).websiteTitle || (placeData as any).websitetitle || '');
        setWebsiteDescription((placeData as any).websiteDescription || (placeData as any).websitedescription || '');
    };
    
    const initializeWithDefaults = () => {
        setName('');
        setDescription('');
        setMainImage('');
        setProfilePicture('');
        setGalleryImages(Array(6).fill({ imageUrl: '', caption: '', description: '' }));
        setContactNumber('');
        setPricing({ '60': 0, '90': 0, '120': 0 });
        setDiscountPercentage(0);
        setDiscountDuration(24);
        setIsDiscountActive(false);
        setDiscountEndTime('');
        setCoordinates({ lat: 0, lng: 0 });
        setMassageTypes([]);
        setLanguages([]);
        setAdditionalServices([]);
        setLocation('');
        setOpeningTime('09:00');
        setClosingTime('21:00');
        setWebsiteUrl('');
        setWebsiteTitle('');
        setWebsiteDescription('');
    };

    // Poll for WhatsApp contact notifications
    useEffect(() => {
        if (!placeId) return;

        let lastNotificationCount = 0;

        const checkForWhatsAppNotifications = async () => {
            try {
                const unreadNotifications = await notificationService.getUnread(placeId);
                
                // Filter for WhatsApp contact notifications with null safety
                const whatsappNotifications = (unreadNotifications || []).filter(
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
    }, [placeId]);


    useEffect(() => {
        const checkGoogleMaps = () => {
            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                setMapsApiLoaded(true);
                return true;
            }
            return false;
        };

        const loadMapsAPI = () => {
            const apiKey = getStoredGoogleMapsApiKey();
            if (!apiKey) {
                console.warn('⚠️ Google Maps API key not configured. Location features will be limited.');
                return;
            }

            console.log('🗺️ Loading Google Maps API for PlaceDashboardPage...');
            loadGoogleMapsScript(
                apiKey,
                () => {
                    console.log('✅ Google Maps API loaded successfully in PlaceDashboardPage');
                    setMapsApiLoaded(true);
                },
                () => {
                    console.error('❌ Failed to load Google Maps API in PlaceDashboardPage');
                }
            );
        };

        if (!checkGoogleMaps()) {
            loadMapsAPI();
            
            // Fallback: Keep checking for 10 seconds in case script loads externally
            const interval = setInterval(() => {
                if (checkGoogleMaps()) {
                    clearInterval(interval);
                }
            }, 500);
            
            const timeout = setTimeout(() => {
                clearInterval(interval);
            }, 10000);

            return () => {
                clearInterval(interval);
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
                    setIsLocationManuallyEdited(false); // Reset since this is from Google autocomplete
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

    // Note: All data is saved to Appwrite only - no localStorage usage

    const handleSave = () => {
        // Comprehensive validation with detailed error messages
        const missingFields = [];
        
        if (!name || name.trim() === '') missingFields.push('• Business/Place Name');
        if (!contactNumber || contactNumber.trim() === '') missingFields.push('• Contact Number');
        // Require either city or full address
        if ((selectedCity === 'all') && (!location || location.trim() === '')) {
            missingFields.push('• City/Location (choose a city or enter full address)');
        }
        if (!description || description.trim() === '') missingFields.push('• Business Description');
        if (!mainImage || mainImage.trim() === '') missingFields.push('• Main Business Photo');
        if (!profilePicture || profilePicture.trim() === '') missingFields.push('• Profile Picture');
        if (!openingTime || openingTime.trim() === '') missingFields.push('• Opening Time');
        if (!closingTime || closingTime.trim() === '') missingFields.push('• Closing Time');
        
        // Check if at least one pricing is set
        const hasPricing = Object.values(pricing).some(price => price > 0);
        if (!hasPricing) missingFields.push('• At least one service pricing (30, 60, 90, or 120 minutes)');
        
        // Check massage types
        if (!massageTypes || massageTypes.length === 0) missingFields.push('• At least one massage type/service offered');
        
        if (missingFields.length > 0) {
            setValidationMissingFields(missingFields);
            setShowValidationPopup(true);
            return;
        }
        
        // Filter out empty gallery images
        const safeGalleryImages = galleryImages || [];
        const filteredGallery = safeGalleryImages.filter(img => img && img.imageUrl && img.imageUrl.trim() !== '');
        
        console.log('💾 ========== SAVE PROFILE DEBUG ==========');
        console.log('📸 Main Image:', mainImage);
        console.log('📸 Main Image Length:', mainImage?.length || 0);
        console.log('📸 Main Image Type:', typeof mainImage);
        console.log('📸 Profile Picture:', profilePicture);
        console.log('📸 Gallery Images Count:', filteredGallery.length);
        console.log('🎯 Massage Types:', massageTypes);
        console.log('🌐 Languages:', languages);
        console.log('➕ Additional Services:', additionalServices);
        console.log('==========================================');
        
        // Calculate discount end time if discount is active
        const calculatedDiscountEndTime = isDiscountActive && discountDuration > 0 
            ? new Date(Date.now() + discountDuration * 60 * 60 * 1000).toISOString()
            : discountEndTime || null;
        
        // Send ALL fields to ensure 100% data persistence
        const rawData: any = {
            // System fields
            placeId: placeId,
            status: 'Open',
            category: 'wellness',
            password: place?.password,
            islive: true, // Profile goes live immediately
            
            // Basic info
            name,
            email: place?.email || '',
            description,
            
            // Contact
            whatsappnumber: contactNumber,
            
            // Images
            mainimage: mainImage,
            profilePicture: profilePicture,
            galleryImages: JSON.stringify(filteredGallery),
            
            // Pricing
            pricing: JSON.stringify(pricing),
            
            // Location
            location,
            coordinates: Array.isArray(coordinates) ? coordinates : [coordinates.lng || 106.8456, coordinates.lat || -6.2088],
            city: selectedCity !== 'all' ? selectedCity : null,
            
            // Hours
            openingtime: openingTime,
            closingtime: closingTime,
            
            // Services
            massagetypes: JSON.stringify(massageTypes),
            languages: JSON.stringify(languages),
            additionalServices: JSON.stringify(additionalServices),
            yearsEstablished: Number(yearsEstablished) || 1,
            
            // Website information
            websiteUrl: websiteUrl || '',
            websiteTitle: websiteTitle || '',
            websiteDescription: websiteDescription || '',
            
            // Discounts
            discountpercentage: isDiscountActive ? Number(discountPercentage) : 0,
            discountduration: isDiscountActive ? Number(discountDuration) : 0,
            isdiscountactive: Boolean(isDiscountActive),
            discountendtime: calculatedDiscountEndTime,
        };

        // Sanitize before sending to onSave
        const saveData = sanitizePlacePayload(rawData);
        
        console.log('📦 Raw Data Keys:', Object.keys(rawData));
        console.log('📦 Sanitized Data Keys:', Object.keys(saveData));
        console.log('📦 Sanitized mainimage:', (saveData as any).mainimage);
        console.log('📦 Sanitized massagetypes:', (saveData as any).massagetypes);
        console.log('📦 Sanitized languages:', (saveData as any).languages);
        console.log('📦 Sanitized additionalServices:', (saveData as any).additionalServices);

        onSave(saveData);

        // Show success message - profile goes live immediately
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="fixed top-4 left-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-2xl z-50 max-w-md mx-auto">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg mb-1">Profile Updated & Live!</h3>
                        <p class="text-green-100 text-sm leading-relaxed">
                            Your profile has been saved and is now <strong>live</strong> on IndaStreet. Customers can see your updates immediately.
                        </p>
                        <div class="mt-3 flex items-center gap-2 text-xs text-green-200">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            <span>Changes are visible to all users now</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        setTimeout(() => {
            try {
                if (notification && notification.parentNode && notification.parentNode.contains(notification)) {
                    notification.parentNode.removeChild(notification);
                }
            } catch (error) {
                console.warn('Failed to remove notification element:', error);
            }
        }, 5000);

        // Clear auto-saved data after successful save
        try {
            localStorage.removeItem('place-dashboard-autosave');
        } catch (error) {
            console.warn('Failed to clear auto-saved place data:', error);
        }
    };
    
    // Helper functions for pricing format (supporting 345k format)
    const formatPriceForDisplay = (value: number): string => {
        if (value === 0) return '';
        if (value >= 1000) {
            return Math.floor(value / 1000) + 'k';
        }
        return value.toString();
    };
    
    const parsePriceFromInput = (value: string): number => {
        if (!value) return 0;
        
        // Handle 'k' suffix (e.g., "345k" becomes 345000)
        if (value.toLowerCase().endsWith('k')) {
            const numPart = value.slice(0, -1);
            const num = parseInt(numPart, 10);
            return isNaN(num) ? 0 : num * 1000;
        }
        
        // Handle regular numbers
        const num = parseInt(value, 10);
        return isNaN(num) ? 0 : num;
    };
    
    const handlePriceChange = (duration: keyof Pricing, value: string) => {
        const numValue = parsePriceFromInput(value);
        setPricing(prev => ({ ...prev, [duration]: numValue }));
        
        // If "use same pricing" is checked, update hotel/villa pricing too
        if (useSamePricing) {
            setHotelVillaPricing(prev => ({ ...prev, [duration]: numValue }));
        }
    };
    
    const handleHotelVillaPriceChange = (duration: keyof Pricing, value: string) => {
        let numValue = parsePriceFromInput(value);
        
        // Validate: Hotel/villa price cannot be more than 20% higher than regular price
        const regularPrice = pricing[duration];
        const maxAllowedPrice = regularPrice * 1.2; // 20% increase max
        
        if (numValue > maxAllowedPrice && regularPrice > 0) {
            // Cap at 20% increase
            numValue = Math.floor(maxAllowedPrice);
        }
        
        setHotelVillaPricing(prev => ({ ...prev, [duration]: numValue }));
    };
    
    const handleUseSamePricingChange = (checked: boolean) => {
        setUseSamePricing(checked);
        if (checked) {
            // Copy regular pricing to hotel/villa pricing
            setHotelVillaPricing({ ...pricing });
        }
    };
    
    const handleGalleryImageChange = (index: number, imageUrl: string) => {
        const newGallery = [...galleryImages];
        newGallery[index] = { ...newGallery[index], imageUrl };
        setGalleryImages(newGallery);
    };

    const handleGalleryCaptionChange = (index: number, caption: string) => {
        const newGallery = [...galleryImages];
        newGallery[index] = { ...newGallery[index], caption };
        setGalleryImages(newGallery);
    };

    const handleGalleryDescriptionChange = (index: number, description: string) => {
        const newGallery = [...galleryImages];
        newGallery[index] = { ...newGallery[index], description };
        setGalleryImages(newGallery);
    };

    const handleMassageTypeChange = (type: string) => {
        setMassageTypes(prev => {
            // Additional safety check
            const currentTypes = prev || [];
            if (currentTypes.includes(type)) {
                // Remove if already selected
                return currentTypes.filter(t => t !== type);
            } else {
                // Add only if less than 5 are selected
                if (currentTypes.length < 5) {
                    return [...currentTypes, type];
                }
                // Silently ignore if trying to select more than 5
                return currentTypes;
            }
        });
    };

    const handleLanguageChange = (langCode: string) => {
        setLanguages(prev => {
            const currentLanguages = prev || [];
            return currentLanguages.includes(langCode)
                ? currentLanguages.filter(l => l !== langCode)
                : [...currentLanguages, langCode];
        });
    };

    const handleAdditionalServiceChange = (service: string) => {
        setAdditionalServices(prev => {
            const currentServices = prev || [];
            return currentServices.includes(service)
                ? currentServices.filter(s => s !== service)
                : [...currentServices, service];
        });
    };

    const [isGettingLocation, setIsGettingLocation] = useState(false);
    
    const handleSetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        // Check if Google Maps is loaded, if not wait for it
        const checkAndProceed = () => {
            if (!mapsApiLoaded || !(window as any).google || !(window as any).google.maps) {
                // Show loading state
                setIsGettingLocation(true);
                
                // Try again after a short delay (max 3 attempts)
                let attempts = 0;
                const maxAttempts = 3;
                
                const waitForMaps = setInterval(() => {
                    attempts++;
                    if ((window as any).google && (window as any).google.maps) {
                        clearInterval(waitForMaps);
                        setMapsApiLoaded(true);
                        proceedWithLocation();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(waitForMaps);
                        setIsGettingLocation(false);
                        alert('Google Maps is still loading. Please try again in a moment.');
                    }
                }, 1000);
                
                return;
            }
            
            proceedWithLocation();
        };

        const proceedWithLocation = () => {
            setIsGettingLocation(true);
            navigator.geolocation.getCurrentPosition(position => {
                try {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCoordinates(latlng);
                    geocoder.geocode({ location: latlng }, (results: any, status: string) => {
                        setIsGettingLocation(false);
                        if (status === 'OK' && results[0]) {
                            setLocation(results[0].formatted_address);
                            setIsLocationManuallyEdited(false);
                            // Mobile-friendly notification
                            if ('vibrate' in navigator) {
                                navigator.vibrate(200);
                            }
                            // Show a better mobile notification
                            const notification = document.createElement('div');
                            notification.innerHTML = `
                                <div class="fixed top-4 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
                                    <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                        <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span class="font-medium">📍 Location set successfully!</span>
                                </div>
                            `;
                            document.body.appendChild(notification);
                            setTimeout(() => {
                                try {
                                    if (notification && notification.parentNode && notification.parentNode.contains(notification)) {
                                        notification.parentNode.removeChild(notification);
                                    }
                                } catch (error) {
                                    console.warn('Failed to remove notification element:', error);
                                }
                            }, 3000);
                        } else {
                            alert('Geocoding failed: ' + status);
                        }
                    });
                } catch (error) {
                    setIsGettingLocation(false);
                    console.error('Geocoding error:', error);
                    alert('Error getting location. Please try again.');
                }
            }, error => {
                setIsGettingLocation(false);
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please check your browser permissions.');
            });
        };

        checkAndProceed();
    };

    // Profile image handling with warning modal
    const handleProfilePictureChange = (imageUrl: string) => {
        if (imageUrl && imageUrl.trim() !== '') {
            setPendingImageUrl(imageUrl);
            setShowImageRequirementModal(true);
        }
    };

    const handleAcceptImageRequirement = () => {
        setProfilePicture(pendingImageUrl);
        setShowImageRequirementModal(false);
        setPendingImageUrl('');
    };

    const handleRejectImageRequirement = () => {
        setShowImageRequirementModal(false);
        setPendingImageUrl('');
    };

    const renderInput = (value: string, onChange: (val: string) => void, Icon: React.FC<{className?:string}>, placeholder?: string, type: string = 'text') => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
        </div>
    );
    
    const unreadNotificationsCount = (notifications || []).filter(n => !n.isRead).length;
    const now = new Date();
    const upcomingBookings = (bookings || []).filter(b => new Date(b.startTime) >= now).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const pastBookings = (bookings || []).filter(b => new Date(b.startTime) < now).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    if (isLoading) {
        return <LoadingSpinner message="Loading dashboard..." />;
    }

    if (!place && !_placeId) {
        return <div className="p-4 text-center text-red-500">Could not load place data. Please try logging in again.</div>
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'promotional':
                return (
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Promotional Tools</h2>
                                    <p className="text-sm text-gray-600">Share discount banners to promote your services</p>
                                </div>
                            </div>

                            {/* Discount Banners */}
                            <div className="space-y-6">
                                {[
                                    { percentage: 5, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532' },
                                    { percentage: 10, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896' },
                                    { percentage: 15, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221' },
                                    { percentage: 20, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034' }
                                ].map((banner) => (
                                    <div key={banner.percentage} className="bg-gray-50 rounded-xl p-4">
                                        <div className="aspect-video bg-white rounded-lg mb-4 overflow-hidden">
                                            <img
                                                src={banner.url}
                                                alt={`${banner.percentage}% Discount Banner`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (nextElement) {
                                                        nextElement.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                            <div 
                                                className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 hidden items-center justify-center text-white font-bold text-xl"
                                                style={{ display: 'none' }}
                                            >
                                                {banner.percentage}% OFF
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{banner.percentage}% Discount Banner</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const whatsappText = `🌟 Special Offer! Get ${banner.percentage}% OFF on massage services! Book now through IndaStreet app. ${banner.url}`;
                                                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                                                    window.open(whatsappUrl, '_blank');
                                                }}
                                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                WhatsApp
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: `${banner.percentage}% Discount on Massage Services`,
                                                            text: `Special offer! Get ${banner.percentage}% OFF on massage services!`,
                                                            url: banner.url
                                                        });
                                                    } else {
                                                        navigator.clipboard.writeText(banner.url);
                                                        // Note: Place dashboard would need toast state for this
                                                        console.log('Banner URL copied to clipboard!');
                                                    }
                                                }}
                                                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                                </svg>
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-orange-700">
                                    💡 <strong>Tip:</strong> Share these banners on your social media, WhatsApp status, or send directly to customers to promote your massage services and attract more bookings!
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'discounts':
                return (
                    <DiscountSharePage
                        providerId={String(placeId)}
                        providerName={place?.name || 'Place'}
                        providerType="place"
                    />
                );
            case 'membership':
                return (
                    <MembershipPlansPage 
                        onBack={() => setActiveTab('profile')}
                        userType="place"
                        currentPlan="free"
                    />
                );
            case 'terms':
                return (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <TherapistTermsPage />
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
                                <h2 className="text-2xl font-bold text-gray-900">{t?.bookings?.upcoming || 'Upcoming Bookings'}</h2>
                                <p className="text-xs text-gray-500">Manage your upcoming bookings</p>
                            </div>
                        </div>
                        {upcomingBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t?.bookings || {}} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t?.bookings?.noUpcoming || 'No upcoming bookings'}</p>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-8">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t?.bookings?.past || 'Past Bookings'}</h2>
                                <p className="text-xs text-gray-500">View past bookings</p>
                            </div>
                        </div>
                        {pastBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {pastBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t?.bookings || {}} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t?.bookings?.noPast || 'No past bookings'}</p>
                            </div>
                        )}
                    </div>
                );
            case 'analytics': {
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
                                <h2 className="text-2xl font-bold text-gray-900">{t?.analytics?.title || 'Analytics'}</h2>
                                <p className="text-xs text-gray-500">Track your performance metrics</p>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <AnalyticsCard title={t?.analytics?.impressions || 'Impressions'} value={analytics.impressions ?? 0} description={t?.analytics?.impressionsDesc || 'Total profile impressions'} />
                            <AnalyticsCard title={t?.analytics?.profileViews || 'Profile Views'} value={analytics.profileViews ?? 0} description={t?.analytics?.profileViewsDesc || 'Profile view count'} />
                            <AnalyticsCard title={t?.analytics?.whatsappClicks || 'WhatsApp Clicks'} value={analytics.whatsappClicks ?? 0} description={t?.analytics?.whatsappClicksDesc || 'WhatsApp contact clicks'} />
                        </div>
                    </div>
                );
            }
            case 'hotelVilla': {
                return (
                    <div className="space-y-4">
                        <p className="text-gray-700 text-base">
                            Promotors Receive 20% commission from their shared links and advertisement.
                        </p>
                    </div>
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
                            providerId={typeof placeId === 'string' ? parseInt(placeId) : placeId} 
                            providerType="place" 
                        />
                    </div>
                );
            case 'profile':
            default:
                return (
                    <div className="space-y-6">
                        {/* Page Title */}
                        <div className="flex items-center gap-3 mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Massage Spa</h1>
                        </div>
                        
                        <ImageUpload
                            id="main-image-upload"
                            label={t?.uploadMainImage || 'Upload Main Image'}
                            currentImage={mainImage}
                            onImageChange={setMainImage}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                                Recommended: 1200×675px (16:9 ratio)
                            </div>
                            {mainImage && (
                                <button
                                    type="button"
                                    onClick={() => setShowImageCropper(true)}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline"
                                >
                                    Edit Banner
                                </button>
                            )}
                        </div>
                        
                        {/* Image Cropper Modal */}
                        {showImageCropper && mainImage && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Banner Image</h3>
                                        <MainImageCropper
                                            imageUrl={mainImage}
                                            aspect={16 / 9}
                                            onConfirm={(croppedImage) => {
                                                setMainImage(croppedImage);
                                                setShowImageCropper(false);
                                            }}
                                            onCancel={() => setShowImageCropper(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Profile Picture Upload (Circular Logo) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                {t?.uploadProfilePicture || "Upload Profile Picture (Circular Logo)"}
                            </label>
                            
                            {/* Image Requirement Modal - Compact Mobile Design */}
                            {showImageRequirementModal && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Logo Requirements</h3>
                                                    <p className="text-orange-100 text-xs sm:text-sm">Read before uploading</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                            {/* Important Notice */}
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
                                                <p className="font-semibold text-orange-900 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                    Required for Profile
                                                </p>
                                            </div>
                                            
                                            {/* Requirements Section */}
                                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                                                <p className="font-semibold text-gray-900 text-xs sm:text-sm">✓ Logo requirements:</p>
                                                <ul className="space-y-1">
                                                    <li className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Clear, professional business logo</span>
                                                    </li>
                                                    <li className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>High quality (min 400x400px)</span>
                                                    </li>
                                                    <li className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Authentic business image</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            
                                            {/* Warning Section */}
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 space-y-1">
                                                <p className="font-semibold text-red-900 text-xs sm:text-sm flex items-center gap-1">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Suspension Policy
                                                </p>
                                                <ul className="space-y-0.5 text-xs text-red-800">
                                                    <li className="flex items-start gap-1">
                                                        <span className="text-red-600">•</span>
                                                        <span>Fake business info</span>
                                                    </li>
                                                    <li className="flex items-start gap-1">
                                                        <span className="text-red-600">•</span>
                                                        <span>Using other's logos</span>
                                                    </li>
                                                    <li className="flex items-start gap-1">
                                                        <span className="text-red-600">•</span>
                                                        <span>Inappropriate images</span>
                                                    </li>
                                                </ul>
                                                <p className="text-xs text-red-900 font-semibold pt-0.5">
                                                    May cause suspension
                                                </p>
                                            </div>
                                            
                                            {/* Confirmation Text */}
                                            <p className="text-xs text-gray-500 italic text-center pt-1">
                                                Confirming verifies this is your authentic business logo
                                            </p>
                                        </div>
                                        
                                        {/* Footer Buttons */}
                                        <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex gap-2">
                                            <button
                                                onClick={handleRejectImageRequirement}
                                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[32px] sm:min-h-[36px]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAcceptImageRequirement}
                                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all min-h-[32px] sm:min-h-[36px]"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    {/* Circular profile picture container */}
                                    <div 
                                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-200 shadow-lg cursor-pointer hover:border-orange-400 transition-all bg-gray-100 relative"
                                        onClick={() => {
                                            const input = document.getElementById('profile-picture-upload') as HTMLInputElement;
                                            if (input) input.click();
                                        }}
                                    >
                                        {profilePicture ? (
                                            <>
                                                <img 
                                                    src={profilePicture} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Upload overlay on hover */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="text-center">
                                                        <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                        <span className="text-white text-xs font-semibold">Change</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                </svg>
                                                <span className="text-xs mt-1">Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Hidden ImageUpload component for file handling */}
                                    <div className="hidden">
                                        <ImageUpload
                                            id="profile-picture-upload"
                                            label=""
                                            currentImage={profilePicture}
                                            onImageChange={handleProfilePictureChange}
                                        />
                                    </div>
                                    {profilePicture && (
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('profile-picture-upload') as HTMLInputElement;
                                        if (input) input.click();
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {profilePicture ? 'Change Profile Picture' : 'Upload Profile Picture'}
                                </button>
                                <p className="text-xs text-gray-500 mt-3 text-center max-w-xs">
                                    This will appear as a circular logo overlapping your banner image
                                </p>
                            </div>
                        </div>
                        
                        {/* Gallery Images with Captions and Descriptions (6 images) */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Gallery Images (with Captions & Descriptions)
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Upload up to 6 images for your gallery. Add a caption (header name) and description (small bio) for each image to describe what it shows.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                {(galleryImages || []).map((galleryItem, index) => (
                                    <div key={index} className="space-y-2">
                                        <ImageUpload
                                            id={`gallery-upload-${index}`}
                                            label={`Gallery Image ${index + 1}`}
                                            currentImage={galleryItem.imageUrl}
                                            onImageChange={(dataUrl) => handleGalleryImageChange(index, dataUrl)}
                                            heightClass="h-40"
                                        />
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Caption for Image {index + 1}
                                            </label>
                                            <input
                                                type="text"
                                                value={galleryItem.caption}
                                                onChange={(e) => handleGalleryCaptionChange(index, e.target.value)}
                                                placeholder="e.g., Relaxation Room, Treatment Area"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                maxLength={50}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {(galleryItem.caption || '').length}/50 characters
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Description for Image {index + 1}
                                            </label>
                                            <textarea
                                                value={galleryItem.description}
                                                onChange={(e) => handleGalleryDescriptionChange(index, e.target.value)}
                                                placeholder="e.g., Our peaceful relaxation room with ambient lighting and comfortable seating where guests can unwind before and after their massage treatments..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                maxLength={350}
                                                rows={4}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {(galleryItem.description || '').length}/350 characters
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t?.nameLabel || 'Name'}</label>
                            {renderInput(name, setName, UserSolidIcon)}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t?.descriptionLabel || 'Description'}</label>
                            <div className="relative">
                                <div className="absolute top-3.5 left-0 pl-3 flex items-center pointer-events-none">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea 
                                    value={description} 
                                    onChange={e => {
                                        if (e.target.value.length <= 350) {
                                            setDescription(e.target.value);
                                        }
                                    }} 
                                    rows={3} 
                                    maxLength={350}
                                    className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/350 characters
                                </p>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900">{t?.whatsappLabel || 'Contact Number'}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                                    <span className="text-gray-600 font-medium">+62</span>
                                </div>
                                <input 
                                    type="text" 
                                    value={contactNumber} 
                                    onChange={e => setContactNumber(e.target.value)} 
                                    placeholder="81234567890" 
                                    className="mt-1 block w-full pl-20 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" 
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter number without +62 prefix (e.g., 81234567890)</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Website URL (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <input 
                                    type="url" 
                                    value={websiteUrl} 
                                    onChange={e => setWebsiteUrl(e.target.value)} 
                                    placeholder="https://www.yourwebsite.com" 
                                    className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" 
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Add your business website to show on your profile card</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Business Hours</label>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                    <label className="block text-xs font-medium text-gray-900">Opening Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon className="h-5 w-5 text-orange-500" /></div>
                                        <input 
                                            type="time" 
                                            value={openingTime} 
                                            onChange={e => setOpeningTime(e.target.value)} 
                                            className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border-2 border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-900">Closing Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon className="h-5 w-5 text-orange-500" /></div>
                                        <input 
                                            type="time" 
                                            value={closingTime} 
                                            onChange={e => setClosingTime(e.target.value)} 
                                            className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border-2 border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Years Established */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Years Established (1-50)</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={yearsEstablished}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setYearsEstablished(Math.min(50, Math.max(1, val)));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                placeholder="Enter years (1-50)"
                            />
                            <p className="text-xs text-gray-500 mt-1">How many years has your business been operating?</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900">
                                {t?.massageTypesLabel || 'Massage Types'}
                                <span className="text-xs text-gray-500 ml-2">
                                    (Select up to 5 specialties - {massageTypes.length}/5 selected)
                                </span>
                            </label>
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-4">
                                {(MASSAGE_TYPES_CATEGORIZED || []).map(category => (
                                    <div key={category.category}>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category.category}</h4>
                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                                            {(category.types || []).map(type => (
                                                <CustomCheckbox
                                                    key={type}
                                                    label={type}
                                                    checked={massageTypes.includes(type)}
                                                    onChange={() => handleMassageTypeChange(type)}
                                                    disabled={!massageTypes.includes(type) && massageTypes.length >= 5}
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
                                    {(ADDITIONAL_SERVICES || []).map((service: string) => (
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
                            <label className="block text-sm font-medium text-gray-900 mb-2">{t?.locationLabel || 'Location'}</label>
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                {/* City / Tourist Location */}
                                <div className="mb-4">
                                    <CityLocationDropdown
                                        selectedCity={selectedCity}
                                        onCityChange={setSelectedCity}
                                        placeholder="Select Your City/Location"
                                        label="🏙️ City / Tourist Location"
                                        showLabel={true}
                                        includeAll={false}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Choose your city or tourist area. Exact device location is optional.
                                    </p>
                                </div>
                                <div className="relative mb-3">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        ref={locationInputRef} 
                                        type="text" 
                                        value={location} 
                                        onChange={(e) => {
                                            setLocation(e.target.value);
                                            setIsLocationManuallyEdited(true);
                                        }} 
                                        placeholder={t?.locationPlaceholder || 'Enter your location'} 
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
                                    <span className="font-semibold">{location ? 'Location Set ✓' : 'Set Location from Device (optional)'}</span>
                                </Button>
                                {location && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs text-gray-500 text-center">
                                            📍 {location.substring(0, 50)}{location.length > 50 ? '...' : ''}
                                        </p>
                                        {coordinates && coordinates.lat && coordinates.lng && coordinates.lat !== 0 && coordinates.lng !== 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-xs font-medium text-gray-700 mb-2">Location Coordinates:</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="text-gray-500">Lat:</span>
                                                        <span className="font-mono ml-1 text-gray-900">{Number(coordinates.lat).toFixed(6)}</span>
                                                    </div>
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="text-gray-500">Lng:</span>
                                                        <span className="font-mono ml-1 text-gray-900">{Number(coordinates.lng).toFixed(6)}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded p-2 border">
                                                    <span className="text-gray-500 text-xs">Map ID:</span>
                                                    <div className="font-mono text-xs text-gray-900 mt-1 break-all">
                                                        {Number(coordinates.lat).toFixed(6)},{Number(coordinates.lng).toFixed(6)}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const coordString = `${Number(coordinates.lat).toFixed(6)},${Number(coordinates.lng).toFixed(6)}`;
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
                                                        className="text-xs text-orange-600 hover:text-orange-700 underline"
                                                    >
                                                        Open in Google Maps
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {!mapsApiLoaded && (
                                <div className="space-y-3">
                                    {/* Location is set via "Set Location" button above - no manual input needed */}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-md font-medium text-gray-800">{t?.pricingTitle || 'Pricing'}</h3>
                            <p className="text-xs text-gray-500 mt-1">Set your online massage prices</p>
                            
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                                <label className="block text-xs font-semibold text-orange-800 text-center mb-1">{t?.['60min'] || '60 min'}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={formatPriceForDisplay(pricing['60'])} 
                                        onChange={e => handlePriceChange('60', e.target.value)} 
                                        placeholder="345k"
                                        className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
                                    />
                                    </div>
                                    {pricing['60'] > 0 && (
                                        <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                                            Rp {pricing['60'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <label className="block text-xs font-semibold text-blue-800 text-center mb-1">{t?.['90min'] || '90 min'}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={formatPriceForDisplay(pricing['90'])} 
                                        onChange={e => handlePriceChange('90', e.target.value)} 
                                        placeholder="450k"
                                        className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
                                    />
                                    </div>
                                    {pricing['90'] > 0 && (
                                        <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                                            Rp {pricing['90'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                <label className="block text-xs font-semibold text-green-800 text-center mb-1">{t?.['120min'] || '120 min'}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={formatPriceForDisplay(pricing['120'])} 
                                        onChange={e => handlePriceChange('120', e.target.value)} 
                                        placeholder="600k"
                                        className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
                                    />
                                    </div>
                                    {pricing['120'] > 0 && (
                                        <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                                            Rp {pricing['120'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Discount Activation Section */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Activate Discount</h3>
                                    <p className="text-sm text-gray-600">Boost bookings with special offers</p>
                                </div>
                            </div>

                            {/* Discount Percentage Buttons */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Select Discount Percentage
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[10, 15, 20, 30].map((percent) => (
                                        <button
                                            key={percent}
                                            type="button"
                                            onClick={() => setDiscountPercentage(percent)}
                                            className={`py-3 rounded-lg font-bold text-lg transition-all ${
                                                discountPercentage === percent
                                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                                            }`}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Buttons */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Select Duration
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: '4 Hours', value: 4 },
                                        { label: '8 Hours', value: 8 },
                                        { label: '12 Hours', value: 12 }
                                    ].map((duration) => (
                                        <button
                                            key={duration.value}
                                            type="button"
                                            onClick={() => setDiscountDuration(duration.value)}
                                            className={`py-3 rounded-lg font-bold transition-all ${
                                                discountDuration === duration.value
                                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                                            }`}
                                        >
                                            {duration.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Activate Button */}
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!discountPercentage || !discountDuration) {
                                        setToast({ message: '⚠️ Please select discount percentage and duration', type: 'error' });
                                        setTimeout(() => setToast(null), 3000);
                                        return;
                                    }

                                    try {
                                        const endTime = new Date(Date.now() + discountDuration * 60 * 60 * 1000).toISOString();
                                        
                                        await placeService.update(String(placeId), {
                                            discountpercentage: discountPercentage,
                                            discountduration: discountDuration,
                                            isdiscountactive: true,
                                            discountendtime: endTime
                                        });

                                        setIsDiscountActive(true);
                                        setDiscountEndTime(endTime);
                                        
                                        setToast({ 
                                            message: `✅ ${discountPercentage}% discount activated for ${discountDuration} hours!`, 
                                            type: 'success' 
                                        });
                                        setTimeout(() => setToast(null), 3000);
                                    } catch (error) {
                                        console.error('Error activating discount:', error);
                                        setToast({ message: '❌ Failed to activate discount', type: 'error' });
                                        setTimeout(() => setToast(null), 3000);
                                    }
                                }}
                                disabled={!discountPercentage || !discountDuration}
                                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                                    discountPercentage && discountDuration
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:scale-105'
                                        : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                {discountPercentage && discountDuration
                                    ? `Activate ${discountPercentage}% OFF for ${discountDuration}h`
                                    : 'Select Options to Activate'}
                            </button>

                            {/* Active Discount Display */}
                            {isDiscountActive && discountEndTime && new Date(discountEndTime) > new Date() && (
                                <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-900 font-bold">🎉 Discount Active!</p>
                                            <p className="text-sm text-green-700">
                                                {discountPercentage}% OFF - Expires at {new Date(discountEndTime).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await placeService.update(String(placeId), {
                                                        isdiscountactive: false,
                                                        discountendtime: ''
                                                    });
                                                    setIsDiscountActive(false);
                                                    setDiscountEndTime('');
                                                    setToast({ message: '✅ Discount deactivated', type: 'success' });
                                                    setTimeout(() => setToast(null), 3000);
                                                } catch (error) {
                                                    console.error('Error deactivating discount:', error);
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                        >
                                            End Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-4 border-t border-gray-200 shadow-lg z-50">
                            <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md">
                                💾 Save Profile
                            </Button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Brand Header with Home Icon - Mobile Optimized */}
            <header className="bg-white shadow-md p-3 sm:p-4 sticky top-0 z-40">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Chat Button */}
                        {onNavigateToChat && (
                            <button
                                onClick={onNavigateToChat}
                                className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-pink-600 active:text-pink-700 active:bg-pink-50 rounded-full transition-colors touch-manipulation relative"
                                title="Customer Support Chat"
                                aria-label="Customer Support Chat"
                            >
                                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                                {(place as any)?.membershipTier === 'premium' && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                            </button>
                        )}
                        {/* Payment Info Button */}
                        {onNavigateToPayment && (
                            <button
                                onClick={onNavigateToPayment}
                                className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-blue-600 active:text-blue-700 active:bg-blue-50 rounded-full transition-colors touch-manipulation"
                                title="Payment Information"
                                aria-label="Payment Information"
                            >
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        )}
                        <NotificationBell 
                            count={unreadNotificationsCount} 
                            onClick={() => setShowNotificationsView(!showNotificationsView)} 
                        />
                        <button
                            onClick={() => {
                                if (showNotificationsView) {
                                    setShowNotificationsView(false);
                                } else {
                                    onNavigate && onNavigate('home');
                                }
                            }}
                            className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-gray-700 active:text-orange-500 active:bg-orange-50 rounded-full transition-colors touch-manipulation"
                            title={showNotificationsView ? "Back to Dashboard" : "Go to Home"}
                            aria-label={showNotificationsView ? "Back to Dashboard" : "Go to Home"}
                        >
                            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
            </header>


            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-40">
                {showNotificationsView ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Bookings & Notifications</h2>
                            <button
                                onClick={() => onNavigate && onNavigate('home')}
                                className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                                title="Go to Home"
                                aria-label="Go to Home"
                            >
                                <Home className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Upcoming Bookings Section */}
                        {upcomingBookings.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">📅</span>
                                    Upcoming Bookings
                                </h3>
                                <div className="space-y-3">
                                    {upcomingBookings.map((booking: any) => (
                                        <div key={booking.$id} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{booking.customerName || 'Customer'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {booking.duration} min - {booking.massageType}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Notifications Section */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="text-2xl">🔔</span>
                                Notifications
                            </h3>
                            <div className="space-y-3">
                                {(notifications || []).length > 0 ? (
                                    (notifications || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((notification: any) => (
                                        <div 
                                            key={notification.id} 
                                            className={`p-4 rounded-lg shadow-sm flex items-start gap-4 ${
                                                notification.isRead ? 'bg-white border border-gray-200' : 'bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-orange-500'
                                            }`}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <Bell className="w-5 h-5 text-orange-600" />
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <p className={`text-sm ${
                                                    notification.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No notifications yet</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            New updates and messages will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* No bookings message */}
                        {upcomingBookings.length === 0 && (notifications || []).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-600 font-medium">No upcoming bookings or notifications</p>
                                <p className="text-sm text-gray-400 mt-2">Check back later for updates</p>
                            </div>
                        )}
                    </div>
                ) : (
                    renderContent()
                )}
            </main>

            {/* Validation Popup */}
            <ValidationPopup
                isOpen={showValidationPopup}
                onClose={() => setShowValidationPopup(false)}
                title="Complete Your Business Profile"
                missingFields={validationMissingFields}
                type="error"
            />
        </div>
    );
};

export default PlaceDashboardPage;
