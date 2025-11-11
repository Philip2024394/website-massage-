import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { AvailabilityStatus, BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyLanguages, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService, notificationService } from '../lib/appwriteService';
import { soundNotificationService } from '../utils/soundNotificationService';
import { getInitialRatingData } from '../utils/ratingUtils';
import { LogOut, Activity, Menu, Calendar, TrendingUp, Bell } from 'lucide-react';
import { ColoredProfileIcon, ColoredCalendarIcon, ColoredAnalyticsIcon, ColoredHotelIcon, ColoredTagIcon, ColoredCrownIcon, ColoredDocumentIcon, ColoredGlobeIcon, ColoredHistoryIcon, ColoredCoinsIcon, ColoredBellIcon } from '../components/ColoredIcons';
import { useTranslations } from '../lib/useTranslations';

import MembershipPlansPage from './MembershipPlansPage';
import HotelVillaOptIn from '../components/HotelVillaOptIn';
import { TherapistProfileForm } from '../components/therapist/TherapistProfileForm';
import TherapistTermsPage from './TherapistTermsPage';
import PushNotificationSettings from '../components/PushNotificationSettings';
import Footer from '../components/Footer';
import TherapistNotifications from '../components/TherapistNotifications';
import BusyTimerModal from '../components/BusyTimerModal';


interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigate?: (page: Page) => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    onStatusChange?: (status: AvailabilityStatus) => void;
    handleNavigateToAdminLogin?: () => void;
    therapistId: number | string;
    existingTherapistData?: Therapist;
    bookings?: Booking[];
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

const BusyCountdown: React.FC<{ busyUntil: Date }> = ({ busyUntil }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const timeDiff = busyUntil.getTime() - now.getTime();

            if (timeDiff <= 0) {
                setTimeLeft('Available now');
                return;
            }

            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [busyUntil]);

    return (
        <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-bold animate-pulse">
            ⏱️ {timeLeft}
        </span>
    );
};

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

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ 
    onSave, 
    onLogout, 
    onNavigateToNotifications: _onNavigateToNotifications, 
    onNavigate, 
    onUpdateBookingStatus, 
    onStatusChange, 
    handleNavigateToAdminLogin, 
    therapistId, 
    existingTherapistData, 
    bookings, 
    notifications, 
    t 
}) => {
    const { t: t_new } = useTranslations();
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);

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
    const [discountDuration, setDiscountDuration] = useState<number>(0);
    const [discountEndTime, setDiscountEndTime] = useState<Date | null>(null);
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [isLicensed, setIsLicensed] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [activeTab, setActiveTab] = useState('status'); // Default to status page
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showBusyTimerModal, setShowBusyTimerModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [busyUntil, setBusyUntil] = useState<Date | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const sideDrawerRef = useRef<HTMLDivElement>(null);
    
    const fetchTherapistData = useCallback(async () => {
        setIsLoading(true);
        
        try {
            console.log('📖 Fetching therapist data for ID:', therapistId);
            
            let existingTherapist = null;
            
            // 🔥 CRITICAL FIX: Handle both documentId and userId
            console.log('🔍 CRITICAL FIX: Therapist ID Resolution');
            console.log('📍 Provided therapistId:', therapistId);
            console.log('📊 existingTherapistData:', existingTherapistData);
            
            // 🎯 PRIORITY 1: Use existingTherapistData from AppRouter (best source)
            if (existingTherapistData) {
                console.log('✅ Using existingTherapistData from AppRouter (live home data)');
                console.log('📊 Existing therapist data preview:', {
                    id: existingTherapistData.$id,
                    name: existingTherapistData.name,
                    email: existingTherapistData.email,
                    hasDescription: !!existingTherapistData.description,
                    hasWhatsApp: !!existingTherapistData.whatsappNumber,
                    hasPricing: !!existingTherapistData.pricing,
                    hasLocation: !!existingTherapistData.location
                });
                existingTherapist = existingTherapistData;
            } else {
                // 🎯 PRIORITY 2: Try direct document lookup by therapistId 
                try {
                    console.log('🔍 Trying direct document lookup by ID:', therapistId);
                    existingTherapist = await therapistService.getById(therapistId.toString());
                    if (existingTherapist) {
                        console.log('✅ Found therapist by direct ID lookup:', existingTherapist.name);
                    }
                } catch (directError) {
                    console.log('⚠️ Direct ID lookup failed:', directError);
                }
                
                // 🎯 PRIORITY 3: Get current user and find by email (fallback)
                if (!existingTherapist) {
                    try {
                        console.log('🔐 Fallback: Getting current user for email lookup...');
                        const currentUser = await therapistService.getCurrentUser();
                        console.log('🔍 Current user result:', currentUser);
                        console.log('📧 User email for lookup:', currentUser?.email);
                
                        if (currentUser && currentUser.email) {
                            console.log('✅ Found logged-in user:', currentUser.email);
                            
                            // Find therapist profile by email
                            console.log('🔍 Searching for therapist profile by email...');
                            const therapistProfiles = await therapistService.getByEmail(currentUser.email);
                            console.log('📋 Therapist profiles found:', therapistProfiles);
                            
                            if (therapistProfiles && therapistProfiles.length > 0) {
                                existingTherapist = therapistProfiles[0];
                                console.log('✅ Found therapist profile by email:', existingTherapist.name);
                                console.log('🔧 Document ID from profile:', existingTherapist.$id);
                                console.log('🔧 User Account ID (therapistId prop):', therapistId);
                                console.log('📊 Profile data preview:', {
                                    id: existingTherapist.$id,
                                    name: existingTherapist.name,
                                    email: existingTherapist.email,
                                    description: existingTherapist.description?.substring(0, 50) + '...',
                                    whatsappNumber: existingTherapist.whatsappNumber
                                });
                            } else {
                                console.log('⚠️ No therapist profile found for email:', currentUser.email);
                            }
                        } else {
                            console.log('❌ No current user found - authentication may be invalid');
                        }
                    } catch (emailError) {
                        console.error('❌ Email lookup failed:', emailError);
                    }
                }

                // 🎯 PRIORITY 4: Try phil4 specific lookup if this is phil4
                if (!existingTherapist && (
                    therapistId.toString().includes('phil') || 
                    therapistId === 'phil4' || 
                    therapistId === '6911bfa1003cdb9a26c2'
                )) {
                    try {
                        console.log('🔍 Special case: Trying phil4 document ID lookup...');
                        existingTherapist = await therapistService.getById('6911bfa1003cdb9a26c2');
                        if (existingTherapist) {
                            console.log('✅ Found phil4 by document ID:', existingTherapist.name);
                        }
                    } catch (phil4Error) {
                        console.log('⚠️ Phil4 document lookup failed:', phil4Error);
                    }
                }
            }
            
            if (existingTherapist) {
                console.log('✅ Successfully loaded therapist data:', existingTherapist.name);
                console.log('🔍 Populating form fields with data...');
                setTherapist(existingTherapist);
                
                // Populate all form fields with better logging
                console.log('📝 Setting basic fields:');
                console.log('  - Name:', existingTherapist.name || '(empty)');
                console.log('  - Description length:', (existingTherapist.description || '').length);
                console.log('  - WhatsApp:', existingTherapist.whatsappNumber || '(empty)');
                console.log('  - Years Experience:', existingTherapist.yearsOfExperience || 0);
                console.log('  - Location:', existingTherapist.location || '(empty)');
                
                setName(existingTherapist.name || '');
                setDescription(existingTherapist.description || '');
                setProfilePicture(existingTherapist.profilePicture || '');
                setWhatsappNumber(existingTherapist.whatsappNumber || '');
                setYearsOfExperience(existingTherapist.yearsOfExperience || 0);
                setLocation(existingTherapist.location || '');
                setIsLicensed(existingTherapist.isLicensed || false);
                setLicenseNumber(existingTherapist.licenseNumber || '');
                
                // Parse complex fields safely with detailed logging
                console.log('🔄 Parsing complex fields:');
                
                if (existingTherapist.coordinates) {
                    try {
                        const coords = parseCoordinates(existingTherapist.coordinates);
                        console.log('  - Coordinates:', coords);
                        setCoordinates(coords);
                    } catch (error) {
                        console.error('❌ Error parsing coordinates:', error);
                        setCoordinates({ lat: 0, lng: 0 });
                    }
                } else {
                    console.log('  - Coordinates: not set, using default');
                    setCoordinates({ lat: 0, lng: 0 });
                }
                
                if (existingTherapist.pricing) {
                    try {
                        const pricingData = parsePricing(existingTherapist.pricing);
                        console.log('  - Pricing:', pricingData);
                        setPricing(pricingData);
                    } catch (error) {
                        console.error('❌ Error parsing pricing:', error);
                        setPricing({ 60: 0, 90: 0, 120: 0 });
                    }
                } else {
                    console.log('  - Pricing: not set, using default');
                    setPricing({ 60: 0, 90: 0, 120: 0 });
                }
                
                if (existingTherapist.hotelVillaPricing) {
                    try {
                        const hotelPricingData = parsePricing(existingTherapist.hotelVillaPricing);
                        console.log('  - Hotel pricing:', hotelPricingData);
                        setHotelVillaPricing(hotelPricingData);
                    } catch (error) {
                        console.error('❌ Error parsing hotel pricing:', error);
                        setHotelVillaPricing({ 60: 0, 90: 0, 120: 0 });
                    }
                } else {
                    console.log('  - Hotel pricing: not set, using default');
                    setHotelVillaPricing({ 60: 0, 90: 0, 120: 0 });
                }
                
                if (existingTherapist.massageTypes) {
                    try {
                        const massageTypesData = parseMassageTypes(existingTherapist.massageTypes);
                        console.log('  - Massage types:', massageTypesData);
                        setMassageTypes(massageTypesData);
                    } catch (error) {
                        console.error('❌ Error parsing massage types:', error);
                        setMassageTypes([]);
                    }
                } else {
                    console.log('  - Massage types: not set, using empty array');
                    setMassageTypes([]);
                }
                
                if (existingTherapist.languages) {
                    try {
                        const languagesData = parseLanguages(existingTherapist.languages);
                        console.log('  - Languages:', languagesData);
                        setLanguages(languagesData);
                    } catch (error) {
                        console.error('❌ Error parsing languages:', error);
                        setLanguages([]);
                    }
                } else {
                    console.log('  - Languages: not set, using empty array');
                    setLanguages([]);
                }
                
                // Handle discount system fields
                setDiscountPercentage(existingTherapist.discountPercentage || 0);
                setDiscountDuration(existingTherapist.discountDuration || 0);
                
                if (existingTherapist.discountEndTime) {
                    const endTime = new Date(existingTherapist.discountEndTime);
                    setDiscountEndTime(endTime);
                    setIsDiscountActive(endTime > new Date());
                } else {
                    setDiscountEndTime(null);
                    setIsDiscountActive(false);
                }
                
                // Set availability status
                setStatus(existingTherapist.status || AvailabilityStatus.Offline);
                
                // Handle busy timer
                if (existingTherapist.busyUntil) {
                    const busyEndTime = new Date(existingTherapist.busyUntil);
                    if (busyEndTime > new Date()) {
                        setBusyUntil(busyEndTime);
                    } else {
                        // Busy time has expired, reset status to available
                        setBusyUntil(null);
                        if (existingTherapist.status === AvailabilityStatus.Busy) {
                            setStatus(AvailabilityStatus.Available);
                        }
                    }
                } else {
                    setBusyUntil(null);
                }
                
                setDataLoaded(true);
            } else {
                console.log('⚠️ No therapist data found - creating new profile');
                
                // Initialize with default data for new therapists
                setTherapist(null);
                setName('');
                setDescription('');
                setProfilePicture('');
                setWhatsappNumber('');
                setYearsOfExperience(0);
                setLocation('');
                setCoordinates({ lat: 0, lng: 0 });
                setPricing({ 60: 0, 90: 0, 120: 0 });
                setHotelVillaPricing({ 60: 0, 90: 0, 120: 0 });
                setMassageTypes([]);
                setLanguages([]);
                setStatus(AvailabilityStatus.Offline);
                setIsLicensed(false);
                setLicenseNumber('');
                setDiscountPercentage(0);
                setDiscountDuration(0);
                setDiscountEndTime(null);
                setIsDiscountActive(false);
                setBusyUntil(null);
                
                setDataLoaded(false);
            }
        } catch (error) {
            console.error('❌ Error fetching therapist data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [therapistId, existingTherapistData]);

    useEffect(() => {
        fetchTherapistData();
    }, [fetchTherapistData]);

    // Auto-check discount expiration and busy timer
    useEffect(() => {
        const checkTimers = () => {
            const now = new Date();
            
            // Check discount expiration
            if (isDiscountActive && discountEndTime && now >= discountEndTime) {
                setIsDiscountActive(false);
                setDiscountEndTime(null);
                setToast({ 
                    message: 'Your discount promotion has expired', 
                    type: 'warning' 
                });
                setTimeout(() => setToast(null), 3000);
            }
            
            // Check busy timer expiration
            if (busyUntil && now >= busyUntil && status === AvailabilityStatus.Busy) {
                setStatus(AvailabilityStatus.Available);
                setBusyUntil(null);
                // Status change will trigger a save through onStatusChange
                if (onStatusChange) onStatusChange(AvailabilityStatus.Available);
                setToast({ 
                    message: 'You are now available again!', 
                    type: 'success' 
                });
                setTimeout(() => setToast(null), 3000);
            }
        };

        const interval = setInterval(checkTimers, 1000); // Check every second for busy timer accuracy
        return () => clearInterval(interval);
    }, [isDiscountActive, discountEndTime, busyUntil, status, onStatusChange]);

    // Menu items for navigation
    const menuItems = [
        { id: 'status', label: t.availabilityStatus || 'Availability Status', icon: <Activity className="w-5 h-5" />, coloredIcon: <ColoredAnalyticsIcon /> },
        { id: 'bookings', label: t.bookings || 'Bookings', icon: <Calendar className="w-5 h-5" />, coloredIcon: <ColoredCalendarIcon /> },
        { id: 'profile', label: t.profile || 'Profile', icon: <ColoredProfileIcon />, coloredIcon: <ColoredProfileIcon /> },
        { id: 'analytics', label: t.analytics || 'Analytics', icon: <TrendingUp className="w-5 h-5" />, coloredIcon: <ColoredAnalyticsIcon /> },
        { id: 'membership', label: t.membership || 'Membership', icon: <ColoredCrownIcon />, coloredIcon: <ColoredCrownIcon /> },
        { id: 'hotel-villa', label: t.hotelVilla || 'Hotel/Villa', icon: <ColoredHotelIcon />, coloredIcon: <ColoredHotelIcon /> },
        { id: 'terms', label: t.terms || 'Terms', icon: <ColoredDocumentIcon />, coloredIcon: <ColoredDocumentIcon /> },
        { id: 'settings', label: t.settings || 'Settings', icon: <ColoredGlobeIcon />, coloredIcon: <ColoredGlobeIcon /> }
    ];

    // Handle save with comprehensive data structure
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        
        const therapistData = {
            name,
            description,
            profilePicture,
            whatsappNumber,
            yearsOfExperience,
            pricing: stringifyPricing(pricing),
            hotelVillaPricing: stringifyPricing(hotelVillaPricing),
            location,
            coordinates: stringifyCoordinates(coordinates),
            status,
            isLicensed,
            licenseNumber,
            discountPercentage,
            discountDuration,
            discountEndTime: discountEndTime?.toISOString() || undefined,
            isDiscountActive,
            distance: 0, // Add required field
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
            massageTypes: stringifyMassageTypes(massageTypes),
            languages: stringifyLanguages(languages),
            busyUntil: busyUntil?.toISOString() || undefined
        };

        try {
            await onSave(therapistData as any);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('Error saving:', error);
            setToast({ message: 'Failed to update profile', type: 'error' });
            setTimeout(() => setToast(null), 5000);
        } finally {
            setIsSaving(false);
        }
    }, [
        name, description, profilePicture, whatsappNumber, yearsOfExperience,
        massageTypes, languages, pricing, hotelVillaPricing, location,
        coordinates, status, isLicensed, licenseNumber, discountPercentage,
        discountDuration, discountEndTime, isDiscountActive, onSave
    ]);

    // Handle busy timer confirmation
    const handleBusyTimerConfirm = useCallback((minutes: number) => {
        const busyEndTime = new Date();
        busyEndTime.setMinutes(busyEndTime.getMinutes() + minutes);
        
        setBusyUntil(busyEndTime);
        setStatus(AvailabilityStatus.Busy);
        handleSave(); // Save the new status and busy time
        
        if (onStatusChange) onStatusChange(AvailabilityStatus.Busy);
        
        setToast({ 
            message: `You are now busy for ${minutes} minutes`, 
            type: 'success' 
        });
        setTimeout(() => setToast(null), 3000);
    }, [handleSave, onStatusChange]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Same as Home Page */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Notifications */}
                        <button 
                            onClick={() => setShowNotifications(true)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative" 
                            title="Notifications"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            )}
                        </button>
                        
                        {/* Status Badge */}
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-1 ${
                                status === AvailabilityStatus.Available ? 'text-green-600' :
                                status === AvailabilityStatus.Busy ? 'text-yellow-600' :
                                'text-gray-600'
                            }`}
                            title="Status"
                        >
                            <span className={`w-2 h-2 rounded-full ${
                                status === AvailabilityStatus.Available ? 'bg-green-500' :
                                status === AvailabilityStatus.Busy ? 'bg-yellow-500' :
                                'bg-gray-500'
                            }`} />
                            <span className="text-sm font-medium hidden sm:inline">{status}</span>
                        </button>

                        {/* Burger Menu - Same Icon as Home Page */}
                        <button 
                            onClick={() => {
                                console.log('🍔 Therapist burger menu clicked! Current isSideDrawerOpen:', isSideDrawerOpen);
                                setIsSideDrawerOpen(true);
                            }} 
                            title="Menu" 
                            style={{ zIndex: 9999, position: 'relative' }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Container - Same as Home Page */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Side Navigation - Desktop - Hidden on Mobile like Home Page */}
                    <div className="hidden lg:block w-64 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                                    activeTab === item.id
                                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-200 shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                                }`}
                            >
                                {activeTab === item.id ? item.coloredIcon : item.icon}
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                                <p className="ml-4 text-gray-600">{t.loading || 'Loading...'}</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'status' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                        <div className="text-center mb-8">
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                                            <p className="text-lg text-gray-600">Set your availability status to start receiving bookings</p>
                                        </div>

                                        {therapist && (
                                            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-xl">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        {therapist.profilePicture ? (
                                                            <img src={therapist.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg" />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center">
                                                                <span className="text-orange-600 text-xl font-bold">{therapist.name?.charAt(0) || 'T'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-xl font-bold text-gray-800">{therapist.name || 'Therapist'}</h3>
                                                        <p className="text-sm text-gray-600">{therapist.location || 'Location not set'}</p>
                                                        <p className="text-xs text-blue-600 font-medium">Active Profile</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Control Buttons */}
                                        <div className="mb-8">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Choose Your Availability Status</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Available Button */}
                                                <button
                                                    onClick={() => {
                                                        setStatus(AvailabilityStatus.Available);
                                                        // Save status change to update therapist card
                                                        handleSave();
                                                        if (onStatusChange) onStatusChange(AvailabilityStatus.Available);
                                                    }}
                                                    className={`p-6 rounded-2xl border-3 text-center font-bold transition-all transform hover:scale-105 ${
                                                        status === AvailabilityStatus.Available
                                                            ? 'bg-green-100 border-green-400 text-green-800 shadow-lg'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-200'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full mx-auto mb-3 ${
                                                        status === AvailabilityStatus.Available ? 'bg-green-500' : 'bg-gray-300'
                                                    }`} />
                                                    <div className="text-2xl mb-2">✅</div>
                                                    <div className="text-lg font-bold">AVAILABLE</div>
                                                    <div className="text-sm mt-2">Ready to accept bookings</div>
                                                </button>

                                                {/* Busy Button */}
                                                <button
                                                    onClick={() => {
                                                        setShowBusyTimerModal(true);
                                                    }}
                                                    className={`p-6 rounded-2xl border-3 text-center font-bold transition-all transform hover:scale-105 ${
                                                        status === AvailabilityStatus.Busy
                                                            ? 'bg-yellow-100 border-yellow-400 text-yellow-800 shadow-lg'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-yellow-50 hover:border-yellow-200'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full mx-auto mb-3 ${
                                                        status === AvailabilityStatus.Busy ? 'bg-yellow-500' : 'bg-gray-300'
                                                    }`} />
                                                    <div className="text-2xl mb-2">⏳</div>
                                                    <div className="text-lg font-bold">BUSY</div>
                                                    <div className="text-sm mt-2">Currently with client</div>
                                                </button>

                                                {/* Offline Button */}
                                                <button
                                                    onClick={() => {
                                                        setStatus(AvailabilityStatus.Offline);
                                                        // Save status change to update therapist card
                                                        handleSave();
                                                        if (onStatusChange) onStatusChange(AvailabilityStatus.Offline);
                                                    }}
                                                    className={`p-6 rounded-2xl border-3 text-center font-bold transition-all transform hover:scale-105 ${
                                                        status === AvailabilityStatus.Offline
                                                            ? 'bg-gray-100 border-gray-400 text-gray-800 shadow-lg'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full mx-auto mb-3 ${
                                                        status === AvailabilityStatus.Offline ? 'bg-gray-500' : 'bg-gray-300'
                                                    }`} />
                                                    <div className="text-2xl mb-2">⛔</div>
                                                    <div className="text-lg font-bold">OFFLINE</div>
                                                    <div className="text-sm mt-2">Not accepting bookings</div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Discount System - Only visible when Offline */}
                                        {status === AvailabilityStatus.Offline && (
                                            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-orange-800 mb-2">🎉 Boost Your Bookings!</h3>
                                                    <p className="text-orange-600">Run a discount promotion to attract more clients when you're back online</p>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Discount Percentage Selection */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-orange-700 mb-3">Choose Discount Percentage:</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {[5, 10, 15, 20].map((percent) => (
                                                                <button
                                                                    key={percent}
                                                                    onClick={() => {
                                                                        setDiscountPercentage(percent);
                                                                        // Update therapist data immediately for live preview
                                                                        if (onStatusChange) {
                                                                            onStatusChange(status);
                                                                        }
                                                                    }}
                                                                    className={`p-4 rounded-xl border-2 text-center font-bold transition-all ${
                                                                        discountPercentage === percent
                                                                            ? 'bg-orange-100 border-orange-400 text-orange-800 shadow-md'
                                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                                                                    }`}
                                                                >
                                                                    <div className="text-2xl font-bold">{percent}%</div>
                                                                    <div className="text-xs">OFF</div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Time Duration Selection */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-orange-700 mb-3">Choose Duration:</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {[
                                                                { hours: 4, label: '4 Hours' },
                                                                { hours: 8, label: '8 Hours' },
                                                                { hours: 12, label: '12 Hours' },
                                                                { hours: 24, label: '24 Hours' }
                                                            ].map((option) => (
                                                                <button
                                                                    key={option.hours}
                                                                    onClick={() => setDiscountDuration(option.hours)}
                                                                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                                                        discountDuration === option.hours
                                                                            ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-md'
                                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-200'
                                                                    }`}
                                                                >
                                                                    <div className="text-lg font-bold">{option.label}</div>
                                                                    <div className="text-xs text-gray-500">Duration</div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Discount Preview & Activation */}
                                                    {discountPercentage > 0 && discountDuration > 0 && (
                                                        <div className="p-4 bg-white border-2 border-orange-200 rounded-xl">
                                                            <div className="text-center mb-4">
                                                                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold">
                                                                    <span className="text-lg">🔥</span>
                                                                    <span>{discountPercentage}% OFF</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-2">
                                                                    This discount badge will appear on your profile card for {discountDuration} hours
                                                                </p>
                                                            </div>
                                                            
                                                            <button
                                                                onClick={() => {
                                                                    const endTime = new Date();
                                                                    endTime.setHours(endTime.getHours() + discountDuration);
                                                                    setDiscountEndTime(endTime);
                                                                    setIsDiscountActive(true);
                                                                    // Save immediately to update therapist card
                                                                    handleSave();
                                                                    setToast({ 
                                                                        message: `${discountPercentage}% discount activated for ${discountDuration} hours!`, 
                                                                        type: 'success' 
                                                                    });
                                                                    setTimeout(() => setToast(null), 4000);
                                                                }}
                                                                disabled={isDiscountActive}
                                                                className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                                                                    isDiscountActive
                                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl'
                                                                }`}
                                                            >
                                                                {isDiscountActive ? '✅ Discount Active' : '🚀 Activate Discount'}
                                                            </button>

                                                            {/* Active Discount Info */}
                                                            {isDiscountActive && discountEndTime && (
                                                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                    <div className="text-center">
                                                                        <p className="text-sm font-medium text-green-800">
                                                                            🎊 Discount is live on your profile!
                                                                        </p>
                                                                        <p className="text-xs text-green-600 mt-1">
                                                                            Expires: {discountEndTime.toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Current Status Display with Countdown */}
                                        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                                            <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    status === AvailabilityStatus.Available ? 'bg-green-500' :
                                                    status === AvailabilityStatus.Busy ? 'bg-yellow-500' :
                                                    'bg-gray-500'
                                                }`} />
                                                <span className="font-bold text-lg">{status.toUpperCase()}</span>
                                                
                                                {/* Busy Countdown Timer */}
                                                {status === AvailabilityStatus.Busy && busyUntil && (
                                                    <BusyCountdown busyUntil={busyUntil} />
                                                )}
                                                
                                                {isDiscountActive && (
                                                    <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                                                        {discountPercentage}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'bookings' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.bookings || 'Bookings'}</h2>
                                        
                                        {bookings && bookings.length > 0 ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {bookings.map((booking) => (
                                                    <BookingCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        onUpdateStatus={onUpdateBookingStatus}
                                                        t={t}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="text-gray-400 mb-4">
                                                    <Calendar className="w-16 h-16 mx-auto" />
                                                </div>
                                                <p className="text-gray-600">{t.noBookings || 'No bookings yet'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'analytics' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.analytics || 'Analytics'}</h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <AnalyticsCard
                                                title="Total Bookings"
                                                value={bookings?.length || 0}
                                                description="All time bookings"
                                            />
                                            <AnalyticsCard
                                                title="This Week"
                                                value={0}
                                                description="Weekly bookings"
                                            />
                                            <AnalyticsCard
                                                title="Rating"
                                                value={therapist?.rating || 0}
                                                description="Average rating"
                                            />
                                            <AnalyticsCard
                                                title="Reviews"
                                                value={therapist?.reviewCount || 0}
                                                description="Total reviews"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.profile || 'Profile'}</h2>
                                        
                                        {/* Profile Form */}
                                        <div className="space-y-8">
                                            {/* Profile Picture & Basic Info */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-1">
                                                    <div className="flex flex-col items-center space-y-4">
                                                        <div className="relative">
                                                            {profilePicture ? (
                                                                <img 
                                                                    src={profilePicture} 
                                                                    alt="Profile" 
                                                                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                                                                />
                                                            ) : (
                                                                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                                                    <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.onchange = (e: any) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onload = (e) => {
                                                                            setProfilePicture(e.target?.result as string);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                };
                                                                input.click();
                                                            }}
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                                        >
                                                            {profilePicture ? 'Change Photo' : 'Upload Photo'}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="lg:col-span-2 space-y-6">
                                                    {/* Name */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Full Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>

                                                    {/* WhatsApp Number */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            WhatsApp Number *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={whatsappNumber}
                                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                            placeholder="e.g., +62 812 3456 7890"
                                                        />
                                                    </div>

                                                    {/* Years of Experience */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Years of Experience
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={yearsOfExperience}
                                                            onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                            min="0"
                                                            max="50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Professional Description *
                                                </label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="Tell clients about your services, expertise, and experience..."
                                                />
                                            </div>

                                            {/* Location */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Service Location *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="e.g., Seminyak, Bali"
                                                />
                                            </div>

                                            {/* Massage Types */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Massage Specialties
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {['Swedish', 'Deep Tissue', 'Hot Stone', 'Thai Massage', 'Aromatherapy', 'Sports Massage', 'Couples Massage', 'Prenatal', 'Reflexology'].map((type) => (
                                                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={massageTypes.includes(type)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setMassageTypes([...massageTypes, type]);
                                                                    } else {
                                                                        setMassageTypes(massageTypes.filter(t => t !== type));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200"
                                                            />
                                                            <span className="text-sm text-gray-700">{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Languages */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Languages Spoken
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {['English', 'Indonesian', 'Mandarin', 'Japanese', 'Korean', 'Russian', 'French', 'German'].map((language) => (
                                                        <label key={language} className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={languages.includes(language)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setLanguages([...languages, language]);
                                                                    } else {
                                                                        setLanguages(languages.filter(l => l !== language));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200"
                                                            />
                                                            <span className="text-sm text-gray-700">{language}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Pricing */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                                    Service Pricing (IDR)
                                                    {isDiscountActive && (
                                                        <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                                                            {discountPercentage}% OFF Active
                                                        </span>
                                                    )}
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {[60, 90, 120].map((duration) => {
                                                        const originalPrice = (pricing as any)[duration] || 0;
                                                        const discountedPrice = isDiscountActive 
                                                            ? Math.round(originalPrice * (1 - discountPercentage / 100))
                                                            : originalPrice;
                                                        
                                                        return (
                                                            <div key={duration} className={`relative ${
                                                                isDiscountActive 
                                                                    ? 'ring-2 ring-orange-300 ring-opacity-50 shadow-lg shadow-orange-200/50 animate-pulse' 
                                                                    : ''
                                                            }`}>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                    {duration} Minutes
                                                                </label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={originalPrice}
                                                                        onChange={(e) => setPricing({
                                                                            ...pricing,
                                                                            [duration]: parseInt(e.target.value) || 0
                                                                        })}
                                                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                                                            isDiscountActive 
                                                                                ? 'border-orange-300 bg-orange-50' 
                                                                                : 'border-gray-300'
                                                                        }`}
                                                                        placeholder="0"
                                                                    />
                                                                    {isDiscountActive && originalPrice > 0 && (
                                                                        <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded">
                                                                            <div className="flex justify-between items-center text-sm">
                                                                                <span className="text-gray-500 line-through">
                                                                                    IDR {originalPrice.toLocaleString()}
                                                                                </span>
                                                                                <span className="text-orange-600 font-bold">
                                                                                    IDR {discountedPrice.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-xs text-orange-600 font-medium mt-1">
                                                                                Save IDR {(originalPrice - discountedPrice).toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Certification */}
                                            <div>
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <input
                                                        type="checkbox"
                                                        id="isLicensed"
                                                        checked={isLicensed}
                                                        onChange={(e) => setIsLicensed(e.target.checked)}
                                                        className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200"
                                                    />
                                                    <label htmlFor="isLicensed" className="text-sm font-medium text-gray-700">
                                                        I have professional certification/license
                                                    </label>
                                                </div>
                                                {isLicensed && (
                                                    <input
                                                        type="text"
                                                        value={licenseNumber}
                                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                        placeholder="License/Certification Number"
                                                    />
                                                )}
                                            </div>

                                            {/* Data Source Info */}
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h3 className="font-semibold text-blue-800 mb-2">📊 Data Connection Status</h3>
                                                <div className="text-sm text-blue-700 space-y-1">
                                                    <p><strong>Therapist ID:</strong> {therapistId}</p>
                                                    <p><strong>Data Source:</strong> {therapist ? 'Appwrite Database' : 'New Profile'}</p>
                                                    <p><strong>Profile Status:</strong> {therapist ? '✅ Connected' : '⚠️ Not Found'}</p>
                                                    {therapist && (
                                                        <p><strong>Document ID:</strong> {therapist.$id || 'N/A'}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save Profile'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={fetchTherapistData}
                                                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                >
                                                    Refresh Data
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'membership' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600">Membership plans will be integrated here.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'hotel-villa' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.hotelVilla || 'Hotel & Villa Services'}</h2>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600">Hotel & Villa services will be integrated here.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'terms' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600">Terms & Conditions will be shown here.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.settings || 'Settings'}</h2>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600">Push notification settings will be available here.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Therapist Side Drawer - Same Style as AppDrawer */}
            {isSideDrawerOpen && (
                <>
                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-10px); }
                        }
                        .animate-float {
                            animation: float 3s ease-in-out infinite;
                        }
                    `}</style>
                    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                            onClick={() => setIsSideDrawerOpen(false)}
                        />
                        
                        {/* Drawer Panel */}
                        <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isSideDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            
                            {/* Header */}
                            <div className="p-6 flex justify-between items-center border-b border-gray-200">
                                <h2 className="font-bold text-2xl">
                                    <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                                </h2>
                                <button 
                                    onClick={() => setIsSideDrawerOpen(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    aria-label="Close menu"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Scrollable Menu Content */}
                            <nav className="flex-grow overflow-y-auto p-4">
                                <div className="space-y-2">
                                    
                                    {/* THERAPIST DASHBOARD SECTION */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                            Therapist Dashboard
                                        </h3>
                                        <div className="space-y-2">
                                            {menuItems.map((item) => (
                                                <button 
                                                    key={item.id}
                                                    onClick={() => {
                                                        setActiveTab(item.id);
                                                        setIsSideDrawerOpen(false);
                                                    }}
                                                    className={`flex items-center gap-4 w-full text-left p-4 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 group transform hover:scale-105 ${
                                                        activeTab === item.id
                                                            ? 'bg-orange-100 border-orange-500 text-orange-800'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-lg ${
                                                        activeTab === item.id
                                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                                            : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-orange-400 group-hover:to-orange-500'
                                                    }`}>
                                                        {React.cloneElement(item.icon, { 
                                                            className: "w-5 h-5 text-white"
                                                        })}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className={`font-semibold transition-colors ${
                                                            activeTab === item.id
                                                                ? 'text-orange-800'
                                                                : 'text-gray-800 group-hover:text-orange-600'
                                                        }`}>
                                                            {item.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.id === 'status' && 'Manage availability & discounts'}
                                                            {item.id === 'bookings' && 'View & manage appointments'}
                                                            {item.id === 'profile' && 'Edit profile & settings'}
                                                            {item.id === 'analytics' && 'Performance insights'}
                                                            {item.id === 'membership' && 'Subscription plans'}
                                                            {item.id === 'hotel-villa' && 'Partner services'}
                                                            {item.id === 'terms' && 'Legal information'}
                                                            {item.id === 'settings' && 'App preferences'}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ACCOUNT SECTION */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                            Account
                                        </h3>
                                        <div className="space-y-2">
                                            {/* Current Status Display */}
                                            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        status === AvailabilityStatus.Available ? 'bg-green-500' :
                                                        status === AvailabilityStatus.Busy ? 'bg-yellow-500' :
                                                        'bg-gray-500'
                                                    }`} />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">Status: {status}</p>
                                                        <p className="text-xs text-gray-500">Current availability</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Logout Button */}
                                            <button 
                                                onClick={() => {
                                                    setIsSideDrawerOpen(false);
                                                    onLogout();
                                                }}
                                                className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-red-500 group transform hover:scale-105"
                                            >
                                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                                    <LogOut className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                                                        Logout
                                                    </p>
                                                    <p className="text-xs text-gray-500">Sign out of account</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </nav>

                            {/* Footer with Therapist Info */}
                            {therapist && (
                                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-orange-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            {therapist.profilePicture ? (
                                                <img src={therapist.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                                                    <span className="text-orange-600 text-sm font-bold">{therapist.name?.charAt(0) || 'T'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{therapist.name || 'Therapist'}</p>
                                            <p className="text-xs text-gray-500 truncate">{therapist.location || 'Location not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Notifications Modal */}
            {showNotifications && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-96 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{t.notifications || 'Notifications'}</h3>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-80">
                            <div className="p-4">
                                <p className="text-gray-600">Notifications: {notifications.length}</p>
                                {notifications.map((notification, index) => (
                                    <div key={index} className="p-2 border-b border-gray-200">
                                        {notification.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Busy Timer Modal */}
            {showBusyTimerModal && (
                <BusyTimerModal
                    isOpen={showBusyTimerModal}
                    onClose={() => setShowBusyTimerModal(false)}
                    onConfirm={(duration) => {
                        setShowBusyTimerModal(false);
                        // Handle busy timer logic here
                    }}
                    t={t}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-500' :
                    toast.type === 'error' ? 'bg-red-500' :
                    'bg-yellow-500'
                } text-white`}>
                    <p>{toast.message}</p>
                </div>
            )}

            {/* Busy Timer Modal */}
            <BusyTimerModal
                isOpen={showBusyTimerModal}
                onClose={() => setShowBusyTimerModal(false)}
                onConfirm={handleBusyTimerConfirm}
                t={t}
            />

            <Footer t={t} />
        </div>
    );
};

export default TherapistDashboardPage;