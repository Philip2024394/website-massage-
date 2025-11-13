import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Place, Pricing, Booking, Notification } from '../types';
import { BookingStatus, HotelVillaServiceStatus } from '../types';
import { Calendar, TrendingUp, LogOut, Bell, MessageSquare, X, Megaphone, Menu } from 'lucide-react';
import { loadGoogleMapsScript } from '../constants/appConstants';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import Button from '../components/Button';
import DiscountSharePage from './DiscountSharePage';
import MembershipPlansPage from './MembershipPlansPage';
import ImageUpload from '../components/ImageUpload';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import Footer from '../components/Footer';
import { placeService } from '../lib/appwriteService';
import TherapistTermsPage from './TherapistTermsPage';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
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
    onSave: (data: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigate?: (page: any) => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    placeId: number | string;
    place?: Place | null;
    bookings?: Booking[];
    notifications?: Notification[];
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


const PlaceDashboardPage: React.FC<PlaceDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications, onNavigate, onUpdateBookingStatus, placeId: _placeId, place: placeProp, bookings, notifications, t }) => {
    const [place] = useState<Place | null>(placeProp || null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Use _placeId consistently
    const placeId = _placeId;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [galleryImages, setGalleryImages] = useState<Array<{ imageUrl: string; caption: string; description: string }>>([
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' },
        { imageUrl: '', caption: '', description: '' }
    ]);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [hotelVillaPricing, setHotelVillaPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [useSamePricing, setUseSamePricing] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [discountDuration, setDiscountDuration] = useState<number>(24); // hours
    const [isDiscountActive, setIsDiscountActive] = useState<boolean>(false);
    const [discountEndTime, setDiscountEndTime] = useState<string>('');
    const [location, setLocation] = useState('');
    const [isLocationManuallyEdited, setIsLocationManuallyEdited] = useState(false);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [additionalServices, setAdditionalServices] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });

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

    const locationInputRef = useRef<HTMLInputElement>(null);

    // Load place data from database or use passed prop
    useEffect(() => {
        const loadPlaceData = async () => {
            setIsLoading(true);
            
            try {
                // Check if place prop has actual data or just default values
                const hasActualData = place && (place.name || place.description || place.mainImage);
                
                if (hasActualData) {
                    console.log('📋 Using passed place data:', place);
                    initializeWithPlaceData(place);
                } else if (place?.id) {
                    console.log('🔄 Loading place data from database for provider ID:', place.id);
                    // Lookup by provider id attribute instead of assuming Appwrite document id
                    const loadedPlace = await placeService.getByProviderId(place.id.toString());
                    if (loadedPlace) {
                        console.log('✅ Loaded place data from database:', loadedPlace);
                        initializeWithPlaceData(loadedPlace);
                    } else {
                        console.log('⚠️ No saved data found, using defaults');
                        initializeWithDefaults();
                    }
                } else {
                    console.log('⚠️ No place ID available, using defaults');
                    initializeWithDefaults();
                }
            } catch (error) {
                console.error('❌ Error loading place data:', error);
                initializeWithDefaults();
            }
            
            setIsLoading(false);
        };
        
        loadPlaceData();
    }, [place]);
    
    const initializeWithPlaceData = (placeData: Place) => {
        setName(placeData.name || '');
        setDescription(placeData.description || '');
        setMainImage(placeData.mainImage || '');
        setProfilePicture((placeData as any).profilePicture || placeData.mainImage || '');
        
        // Load gallery images with captions and descriptions
        if ((placeData as any).galleryImages && Array.isArray((placeData as any).galleryImages)) {
            const loadedGallery = [...(placeData as any).galleryImages].map((item: any) => ({
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
        
        setWhatsappNumber(placeData.whatsappNumber || '');
        
        // Parse JSON strings from Appwrite
        try {
            setPricing(typeof placeData.pricing === 'string' ? JSON.parse(placeData.pricing) : placeData.pricing || { '60': 0, '90': 0, '120': 0 });
            
            // Load hotel/villa pricing if exists
            if ((placeData as any).hotelVillaPricing) {
                setHotelVillaPricing(typeof (placeData as any).hotelVillaPricing === 'string' ? JSON.parse((placeData as any).hotelVillaPricing) : (placeData as any).hotelVillaPricing);
                setUseSamePricing(false);
            } else {
                setHotelVillaPricing(typeof placeData.pricing === 'string' ? JSON.parse(placeData.pricing) : placeData.pricing || { '60': 0, '90': 0, '120': 0 });
                setUseSamePricing(true);
            }
            
            setDiscountPercentage((placeData as any).discountPercentage || 0);
            setDiscountDuration((placeData as any).discountDuration || 24);
            setIsDiscountActive((placeData as any).isDiscountActive || false);
            setDiscountEndTime((placeData as any).discountEndTime || '');
            
            setCoordinates(typeof placeData.coordinates === 'string' ? JSON.parse(placeData.coordinates) : placeData.coordinates || { lat: 0, lng: 0 });
            setMassageTypes(typeof placeData.massageTypes === 'string' ? JSON.parse(placeData.massageTypes) : placeData.massageTypes || []);
        } catch (_e) {
            console.error('Error parsing place data:', _e);
        }
        
        setLanguages(placeData.languages || []);
        setAdditionalServices((placeData as any).additionalServices || []);
        setLocation(placeData.location || '');
        setOpeningTime(placeData.openingTime || '09:00');
        setClosingTime(placeData.closingTime || '21:00');
        
        // Initialize website information
        setWebsiteUrl((placeData as any).websiteUrl || '');
        setWebsiteTitle((placeData as any).websiteTitle || '');
        setWebsiteDescription((placeData as any).websiteDescription || '');
    };
    
    const initializeWithDefaults = () => {
        setName('');
        setDescription('');
        setMainImage('');
        setProfilePicture('');
        setGalleryImages(Array(6).fill({ imageUrl: '', caption: '', description: '' }));
        setWhatsappNumber('');
        setPricing({ '60': 0, '90': 0, '120': 0 });
        setHotelVillaPricing({ '60': 0, '90': 0, '120': 0 });
        setUseSamePricing(true);
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

    // 🔄 AUTO-SAVE FUNCTIONALITY: Save form data to localStorage whenever it changes
    const autoSaveFormData = useCallback(() => {
        const formData = {
            name,
            description,
            mainImage,
            profilePicture,
            galleryImages,
            whatsappNumber,
            pricing,
            hotelVillaPricing,
            useSamePricing,
            discountPercentage,
            discountDuration,
            isDiscountActive,
            discountEndTime,
            location,
            isLocationManuallyEdited,
            coordinates,
            massageTypes,
            languages,
            additionalServices,
            openingTime,
            closingTime,
            websiteUrl,
            websiteTitle,
            websiteDescription,
            lastAutoSaved: new Date().toISOString()
        };
        
        try {
            const storageKey = `place_profile_autosave_${placeId}`;
            localStorage.setItem(storageKey, JSON.stringify(formData));
            console.log('💾 Auto-saved place form data to localStorage');
        } catch (error) {
            console.error('❌ Failed to auto-save place form data:', error);
        }
    }, [name, description, mainImage, profilePicture, galleryImages, whatsappNumber, pricing, hotelVillaPricing, useSamePricing, discountPercentage, discountDuration, isDiscountActive, discountEndTime, location, coordinates, massageTypes, languages, additionalServices, openingTime, closingTime, websiteUrl, websiteTitle, websiteDescription, isLocationManuallyEdited, placeId]);

    // Auto-save form data whenever any field changes (with 2 second debounce)
    useEffect(() => {
        const timeoutId = setTimeout(autoSaveFormData, 2000);
        return () => clearTimeout(timeoutId);
    }, [autoSaveFormData]);

    // 🔄 RESTORE AUTO-SAVED DATA: Load form data from localStorage on component mount
    useEffect(() => {
        const restoreAutoSavedData = async () => {
            try {
                const storageKey = `place_profile_autosave_${placeId}`;
                const savedData = localStorage.getItem(storageKey);
                
                if (savedData && !place) { // Only restore if no existing place data
                    const parsedData = JSON.parse(savedData);
                    console.log('🔄 Restoring auto-saved place form data');
                    
                    setName(parsedData.name || '');
                    setDescription(parsedData.description || '');
                    setMainImage(parsedData.mainImage || '');
                    setProfilePicture(parsedData.profilePicture || '');
                    setGalleryImages(parsedData.galleryImages || Array(6).fill({ imageUrl: '', caption: '', description: '' }));
                    setWhatsappNumber(parsedData.whatsappNumber || '');
                    setPricing(parsedData.pricing || { '60': 0, '90': 0, '120': 0 });
                    setHotelVillaPricing(parsedData.hotelVillaPricing || { '60': 0, '90': 0, '120': 0 });
                    setUseSamePricing(parsedData.useSamePricing !== undefined ? parsedData.useSamePricing : true);
                    setDiscountPercentage(parsedData.discountPercentage || 0);
                    setDiscountDuration(parsedData.discountDuration || 24);
                    setIsDiscountActive(parsedData.isDiscountActive || false);
                    setDiscountEndTime(parsedData.discountEndTime || '');
                    setLocation(parsedData.location || '');
                    setIsLocationManuallyEdited(parsedData.isLocationManuallyEdited || false);
                    setCoordinates(parsedData.coordinates || { lat: 0, lng: 0 });
                    setMassageTypes(parsedData.massageTypes || []);
                    setLanguages(parsedData.languages || []);
                    setAdditionalServices(parsedData.additionalServices || []);
                    setOpeningTime(parsedData.openingTime || '09:00');
                    setClosingTime(parsedData.closingTime || '21:00');
                    setWebsiteUrl(parsedData.websiteUrl || '');
                    setWebsiteTitle(parsedData.websiteTitle || '');
                    setWebsiteDescription(parsedData.websiteDescription || '');
                    
                    console.log('✅ Auto-saved place data restored successfully');
                }
            } catch (error) {
                console.error('❌ Failed to restore auto-saved place data:', error);
            }
        };
        
        // Only restore auto-saved data if we don't have existing place data
        if (!place && placeId) {
            restoreAutoSavedData();
        }
    }, [placeId]); // Only depend on placeId to avoid infinite loops

    const handleSave = () => {
        // Comprehensive validation with detailed error messages
        const missingFields = [];
        
        if (!name || name.trim() === '') missingFields.push('• Business/Place Name');
        if (!whatsappNumber || whatsappNumber.trim() === '') missingFields.push('• WhatsApp Number');
        if (!location || location.trim() === '') missingFields.push('• Full Address/Location');
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
        
        onSave({
            placeId: placeId, // Add missing required field
            name,
            description,
            mainImage,
            profilePicture,
            galleryImages: filteredGallery.length > 0 ? filteredGallery : undefined,
            whatsappNumber,
            pricing: JSON.stringify(pricing),
            hotelVillaPricing: useSamePricing ? undefined : JSON.stringify(hotelVillaPricing),
            discountPercentage,
            discountDuration,
            isDiscountActive,
            discountEndTime,
            location,
            coordinates: JSON.stringify(coordinates),
            massageTypes: JSON.stringify(massageTypes),
            languages,
            additionalServices,
            openingTime,
            closingTime,
            distance: 0, // dummy value
            activeMembershipDate: place?.activeMembershipDate || '',
            password: place?.password,
            analytics: JSON.stringify(place?.analytics || { impressions: 0, profileViews: 0, whatsappClicks: 0 }),
            websiteUrl,
            websiteTitle,
            websiteDescription,
        } as any);

        // Show admin approval message
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="fixed top-4 left-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-2xl z-50 max-w-md mx-auto">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg mb-1">Profile Saved Successfully!</h3>
                        <p class="text-orange-100 text-sm leading-relaxed">
                            Thank you for updating your profile. The <strong>IndaStreet Team</strong> will review and confirm your changes for approval soon.
                        </p>
                        <div class="mt-3 flex items-center gap-2 text-xs text-orange-200">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                            </svg>
                            <span>Usually processed within 24 hours</span>
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
        }, 6000);

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

        if (!mapsApiLoaded || !(window as any).google || !(window as any).google.maps) {
            alert('Google Maps is not loaded yet. Please wait a moment and try again.');
            return;
        }

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
                        console.error('Geocoder failed due to: ' + status);
                        alert('Could not find address for your location.');
                    }
                });
            } catch (error) {
                setIsGettingLocation(false);
                console.error('Error in location detection:', error);
                alert('Failed to get location. Please ensure Google Maps is loaded and try again.');
            }
        }, (error) => {
                setIsGettingLocation(false);
                let errorMessage = 'Could not get your location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable. Please try again.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                }
                alert(errorMessage);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
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
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
    }

    if (!place) {
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {/* Coin Rewards Shop Section */}
                            {onNavigate && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Rewards & Incentives</h3>
                                            <p className="text-sm text-gray-600">Manage your coin rewards and loyalty programs</p>
                                        </div>
                                    </div>

                                    {/* Coin Shop Button */}
                                    <button
                                        onClick={() => onNavigate('coin-shop')}
                                        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-yellow-200 hover:border-yellow-400"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl">
                                                🪙
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-900">Coin Rewards Shop</h3>
                                                <p className="text-sm text-gray-600">Redeem coins for rewards and cash out</p>
                                            </div>
                                        </div>
                                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-sm text-yellow-700">
                                            🎯 <strong>Earn Coins:</strong> Complete bookings, get positive reviews, and maintain active status to earn reward coins that can be redeemed for cash and prizes!
                                        </p>
                                    </div>
                                </div>
                            )}
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
                            providerId={typeof placeId === 'string' ? parseInt(placeId) : placeId} 
                            providerType="place" 
                        />
                    </div>
                );
            case 'profile':
            default:
                return (
                    <div className="space-y-6">
                        
                        <ImageUpload
                            id="main-image-upload"
                            label={t?.uploadMainImage || 'Upload Main Image'}
                            currentImage={mainImage}
                            onImageChange={setMainImage}
                        />
                        
                        {/* Profile Picture Upload (Circular Logo) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                {t?.uploadProfilePicture || "Upload Profile Picture (Circular Logo)"}
                            </label>
                            
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
                                                    <h3 className="text-xl font-bold text-white">Business Logo Requirements</h3>
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
                                                    Required for Business Profile
                                                </p>
                                            </div>
                                            
                                            {/* Requirements Section */}
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <p className="font-semibold text-gray-900 text-sm">✓ Your business logo must include:</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Clear, professional business logo or name</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>High quality image (min 400x400px)</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Represents your actual business</span>
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
                                                        <span>Fake or misleading business information</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-red-600">•</span>
                                                        <span>Using another business's logo</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-red-600">•</span>
                                                        <span>Inappropriate or unrelated images</span>
                                                    </li>
                                                </ul>
                                                <p className="text-xs text-red-900 font-semibold pt-1">
                                                    May result in immediate account suspension
                                                </p>
                                            </div>
                                            
                                            {/* Confirmation Text */}
                                            <p className="text-xs text-gray-500 italic text-center pt-2">
                                                By confirming, you verify this is your authentic business logo and meets all requirements
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
                            
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <ImageUpload
                                        id="profile-picture-upload"
                                        label=""
                                        currentImage={profilePicture}
                                        onImageChange={handleProfilePictureChange}
                                        heightClass="h-40 w-40 rounded-full mx-auto border-4 border-orange-200 shadow-lg hover:border-orange-300 transition-all"
                                    />
                                    {profilePicture && (
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
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
                            <label className="block text-sm font-medium text-gray-900">{t?.whatsappLabel || 'WhatsApp Number'}</label>
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
                            <label className="block text-sm font-medium text-gray-900">{t?.locationLabel || 'Location'}</label>
                            
                            {/* Coordinates Display */}
                            <div className="mt-1 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span className="font-medium">Coordinates:</span>
                                    <span className="font-mono">
                                        {coordinates.lat !== 0 || coordinates.lng !== 0 
                                            ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
                                            : 'Not set'
                                        }
                                    </span>
                                    {(coordinates.lat !== 0 || coordinates.lng !== 0) && (
                                        <div className="ml-auto flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-green-600 font-medium">Live</span>
                                        </div>
                                    )}
                                </div>
                                {/* Debug Button - Remove in production */}
                                <button 
                                    onClick={debugLocationSystem}
                                    className="mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                    🔍 Debug Location System
                                </button>
                            </div>
                            
                            {mapsApiLoaded ? (
                                <>
                                    {/* Location Display */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPinIcon className="h-5 w-5 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-700">Current Location:</span>
                                            {(coordinates.lat !== 0 || coordinates.lng !== 0) && (
                                                <div className="ml-auto flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-green-600 font-medium text-xs">Live</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {location || 'No location set'}
                                        </p>
                                        {location && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    📍 Ready for customer navigation
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${isLocationManuallyEdited ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                                    <span className="font-medium text-gray-600">
                                                        {isLocationManuallyEdited ? 'Manual' : 'GPS'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Mobile Location Button */}
                                    <Button 
                                        onClick={handleSetLocation} 
                                        disabled={isGettingLocation}
                                        variant="secondary" 
                                        className={`w-full flex items-center justify-center gap-3 py-4 text-base font-semibold rounded-xl transition-all duration-200 ${
                                            isGettingLocation
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : coordinates.lat !== 0 || coordinates.lng !== 0
                                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg' 
                                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg'
                                        }`}
                                        >
                                            <div className={`w-6 h-6 ${isGettingLocation ? 'animate-spin' : coordinates.lat !== 0 || coordinates.lng !== 0 ? 'animate-pulse' : ''}`}>
                                                {isGettingLocation ? (
                                                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                ) : (
                                                    <MapPinIcon className="w-full h-full" />
                                                )}
                                            </div>
                                            <span>
                                                {isGettingLocation
                                                    ? '🔍 Getting your location...'
                                                    : coordinates.lat !== 0 || coordinates.lng !== 0 
                                                    ? '📍 Update GPS Location' 
                                                    : '📱 Use My Device Location'
                                                }
                                            </span>
                                            {coordinates.lat === 0 && coordinates.lng === 0 && (
                                                <div className="ml-2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                            )}
                                        </Button>
                                        
                                        {/* Mobile Location Tips */}
                                        <div className="text-center mt-3">
                                            <p className="text-xs text-gray-500">
                                                {coordinates.lat !== 0 || coordinates.lng !== 0 
                                                    ? '✅ GPS coordinates active - customers can navigate directly to you'
                                                    : '💡 Enable device location for accurate customer navigation'
                                                }
                                            </p>
                                        </div>

                                        {/* Manual Address Edit Field */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                📝 Edit Address (if needed)
                                            </label>
                                            <div className="relative">
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
                                                    placeholder="Enter your business address..."
                                                    className="block w-full pl-10 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-gray-500">
                                                    💡 You can manually edit the address detected by GPS or type your own
                                                </p>
                                                {location && (
                                                    <div className="flex items-center gap-1">
                                                        <div className={`w-2 h-2 rounded-full ${isLocationManuallyEdited ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {isLocationManuallyEdited ? 'Manual' : 'GPS'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">Google Maps Not Available</span>
                                        </div>
                                        <p className="text-xs mb-3">
                                            Google Maps API is required for location features. Please configure the API key in the admin settings or enter your address manually below.
                                        </p>
                                    </div>
                                    
                                    {/* Manual Address Input (Fallback) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            📝 Enter Business Address Manually
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => {
                                                    setLocation(e.target.value);
                                                    setIsLocationManuallyEdited(true);
                                                }}
                                                placeholder="Enter your full business address..."
                                                className="block w-full pl-10 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            💡 Without Google Maps, you'll need to enter your address manually
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-md font-medium text-gray-800">{t?.pricingTitle || 'Pricing'}</h3>
                            <p className="text-xs text-gray-500 mt-1">Enter prices as: 345k for 345,000 or full amount like 400000</p>
                            
                            {/* 100% Income Notice */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg mt-2">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-green-800">
                                            💰 100% Your Income
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            These prices are for <strong>direct bookings from the home page</strong>. You keep <strong>100% of the income</strong> - no commission deducted!
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t?.['60min'] || '60 min'}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={formatPriceForDisplay(pricing['60'])} 
                                        onChange={e => handlePriceChange('60', e.target.value)} 
                                        placeholder="345k"
                                        className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono"
                                    />
                                    </div>
                                    {pricing['60'] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            = Rp {pricing['60'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t?.['90min'] || '90 min'}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={formatPriceForDisplay(pricing['90'])} 
                                        onChange={e => handlePriceChange('90', e.target.value)} 
                                        placeholder="450k"
                                        className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono"
                                    />
                                    </div>
                                    {pricing['90'] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            = Rp {pricing['90'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t?.['120min'] || '120 min'}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={formatPriceForDisplay(pricing['120'])} 
                                        onChange={e => handlePriceChange('120', e.target.value)} 
                                        placeholder="600k"
                                        className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono"
                                    />
                                    </div>
                                    {pricing['120'] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            = Rp {pricing['120'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hotel/Villa Special Pricing Section */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-md font-medium text-gray-800">Hotel/Villa Live Menu Pricing</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Set special prices for hotel/villa guests (max 20% increase, or lower)
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={useSamePricing}
                                        onChange={(e) => handleUseSamePricingChange(e.target.checked)}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-xs text-gray-600">Same as regular</span>
                                </label>
                            </div>
                            
                            {/* Commission Notice */}
                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.732 16c-.77.833.19 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-yellow-800">
                                            ⚠️ Commission Information - Hotel & Villa Only
                                        </p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            <strong>20% commission</strong> will be deducted from your earnings for hotel and villa bookings. This covers platform fees, payment processing, and hotel/villa partnership costs.
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-2 font-medium">
                                            Example: If you charge IDR 250K, you'll receive IDR 200K after commission.
                                        </p>
                                        <p className="text-xs text-green-700 mt-2 font-bold bg-green-100 px-2 py-1 rounded">
                                            💡 Remember: Your regular home page prices above are 100% commission-free!
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['60min']}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={useSamePricing ? formatPriceForDisplay(pricing['60']) : formatPriceForDisplay(hotelVillaPricing['60'])} 
                                        onChange={e => handleHotelVillaPriceChange('60', e.target.value)} 
                                        disabled={useSamePricing}
                                        placeholder="365k"
                                        className={`mt-1 block w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono ${
                                            useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                        }`}
                                    />
                                </div>
                                {!useSamePricing && pricing['60'] > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max: {formatPriceForDisplay(Math.floor(pricing['60'] * 1.2))} (Rp {Math.floor(pricing['60'] * 1.2).toLocaleString('id-ID')})
                                    </p>
                                )}
                                {hotelVillaPricing['60'] > 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        = Rp {hotelVillaPricing['60'].toLocaleString('id-ID')}
                                    </p>
                                )}
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['90min']}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={useSamePricing ? formatPriceForDisplay(pricing['90']) : formatPriceForDisplay(hotelVillaPricing['90'])} 
                                        onChange={e => handleHotelVillaPriceChange('90', e.target.value)} 
                                        disabled={useSamePricing}
                                        placeholder="480k"
                                        className={`mt-1 block w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono ${
                                            useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                        }`}
                                    />
                                    </div>
                                    {!useSamePricing && pricing['90'] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {formatPriceForDisplay(Math.floor(pricing['90'] * 1.2))} (Rp {Math.floor(pricing['90'] * 1.2).toLocaleString('id-ID')})
                                        </p>
                                    )}
                                    {hotelVillaPricing['90'] > 0 && (
                                        <p className="text-xs text-green-600 mt-1">
                                            = Rp {hotelVillaPricing['90'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-900">{t['120min']}</label>
                                    <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                                    <input 
                                        type="text" 
                                        value={useSamePricing ? formatPriceForDisplay(pricing['120']) : formatPriceForDisplay(hotelVillaPricing['120'])} 
                                        onChange={e => handleHotelVillaPriceChange('120', e.target.value)} 
                                        disabled={useSamePricing}
                                        placeholder="650k"
                                        className={`mt-1 block w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono ${
                                            useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                        }`}
                                    />
                                    </div>
                                    {!useSamePricing && pricing['120'] > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {formatPriceForDisplay(Math.floor(pricing['120'] * 1.2))} (Rp {Math.floor(pricing['120'] * 1.2).toLocaleString('id-ID')})
                                        </p>
                                    )}
                                    {hotelVillaPricing['120'] > 0 && (
                                        <p className="text-xs text-green-600 mt-1">
                                            = Rp {hotelVillaPricing['120'].toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                                💾 Save Profile
                            </Button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header with Burger Menu */}
            <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
                        <button
                            onClick={() => setIsSideDrawerOpen(true)}
                            className="p-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Side Drawer */}
            {isSideDrawerOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsSideDrawerOpen(false)}
                    ></div>
                    
                    {/* Drawer */}
                    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                        {/* Drawer Header */}
                        <div className="bg-orange-500 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Menu</h2>
                                </div>
                                <button
                                    onClick={() => setIsSideDrawerOpen(false)}
                                    className="text-white hover:text-orange-200 transition-colors"
                                >
                                    <X size={24} />
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
                                <ColoredProfileIcon className="w-6 h-6" />
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
                                <ColoredCalendarIcon className="w-6 h-6" />
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
                                <ColoredAnalyticsIcon className="w-6 h-6" />
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
                                <ColoredHotelIcon className="w-6 h-6" />
                                <span className="font-medium">Hotel & Villa</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (onNavigate) onNavigate('place-discount-system');
                                    setIsSideDrawerOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 border-transparent text-gray-700"
                            >
                                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                    %
                                </div>
                                <span className="font-medium">Discount System</span>
                                <div className="ml-auto">
                                    <span className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        NEW
                                    </span>
                                </div>
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
                                <ColoredBellIcon className="w-6 h-6" />
                                <span className="font-medium">Notifications</span>
                                {(notifications || []).filter(n => !n.isRead).length > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-bold">
                                        {(notifications || []).filter(n => !n.isRead).length}
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
                                <ColoredTagIcon className="w-6 h-6" />
                                <span className="font-medium">Discounts</span>
                            </button>
                            
                            {/* Discount Badge Management */}
                            {onNavigate && (
                                <button
                                    onClick={() => {
                                        setIsSideDrawerOpen(false);
                                        onNavigate('placeDiscountBadge');
                                    }}
                                    className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-purple-50 transition-colors border-l-4 border-transparent hover:border-purple-500"
                                >
                                    <ColoredTagIcon className="w-6 h-6" />
                                    <span className="font-medium">Discount Badges</span>
                                </button>
                            )}
                            
                            <button
                                onClick={() => {
                                    setActiveTab('membership');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'membership' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <ColoredCrownIcon className="w-6 h-6" />
                                <span className="font-medium">Membership Plans</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsSideDrawerOpen(false);
                                    if (onNavigate) {
                                        onNavigate('placeTerms');
                                    }
                                }}
                                className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 border-transparent hover:border-orange-500"
                            >
                                <ColoredDocumentIcon className="w-6 h-6" />
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
                                        <ColoredHistoryIcon className="w-6 h-6" />
                                        <span className="font-medium">Coin History</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsSideDrawerOpen(false);
                                            onNavigate('coin-shop');
                                        }}
                                        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-green-50 transition-colors border-l-4 border-transparent hover:border-green-500"
                                    >
                                        <ColoredCoinsIcon className="w-6 h-6" />
                                        <span className="font-medium">Coin Shop</span>
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
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-20">
                {renderContent()}
            </main>

            {/* Footer */}
            <Footer
                currentPage="profile"
                userRole="place"
                onProfileClick={() => setActiveTab('profile')}
                onNotificationsClick={onNavigateToNotifications}
                unreadNotifications={(notifications || []).filter(n => !n.isRead).length}
                t={t}
            />

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
