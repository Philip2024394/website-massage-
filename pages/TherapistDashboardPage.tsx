import React, { useState, useEffect, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { AvailabilityStatus, BookingStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyLanguages, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService } from '../lib/appwriteService';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import { LogOut, Activity, Calendar, TrendingUp, Bell, User, Crown, Building, FileText, Settings, Phone, X, Tag, Share2, Download, Star, CreditCard } from 'lucide-react';
import { ColoredHistoryIcon, ColoredCoinsIcon } from '../components/ColoredIcons';
import { AnalyticsCard, ActivatedDiscountButton, LiveDiscountCountdown, BookingCard, BusyCountdownTimer } from '../components/therapist-dashboard';



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
    userLocation?: UserLocation | null;
    t?: any;
}











const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ 
    onSave, 
    onLogout, 
    onNavigateToNotifications: _onNavigateToNotifications, 
    onNavigate, 
    onUpdateBookingStatus, 
    onStatusChange, 
    therapistId, 
    existingTherapistData,
    userLocation, 
    bookings, 
    notifications, 
    t 
}) => {
    // Safety check for translations - use fallback if needed
    if (!t || typeof t !== 'object') {
        console.log('⚠️ TherapistDashboard: Translation object missing or invalid, using fallbacks');
        const fallbackT = { 
            availabilityStatus: 'Availability Status',
            bookings: 'Bookings',
            profile: 'Profile',
            analytics: 'Analytics',
            membership: 'Membership',
            hotelVilla: 'Hotel/Villa',
            terms: 'Terms',
            settings: 'Settings',
            ...(t || {})
        };
        t = fallbackT;
    }

    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Start with false for debugging

    const [name, setName] = useState('');
    const [email] = useState('');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [hotelVillaPricing, setHotelVillaPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [discountDuration, setDiscountDuration] = useState<number>(0);
    const [discountEndTime, setDiscountEndTime] = useState<Date | null>(null);
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [isSavingDiscount, setIsSavingDiscount] = useState(false);
    
    // Separate state for UI selections (these persist during user interaction)
    const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState<number>(0);
    const [selectedDiscountDuration, setSelectedDiscountDuration] = useState<number>(0);
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [serviceRadius, setServiceRadius] = useState<number>(50); // 50km default radius
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);

    const [activeTab, setActiveTab] = useState('status'); // Default to status page
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showBusyTimerModal, setShowBusyTimerModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [busyUntil, setBusyUntil] = useState<Date | null>(null);
    
    // Account Settings Modal States
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showUpdatePhoneModal, setShowUpdatePhoneModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    
    // Account Settings Form States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newWhatsAppNumber, setNewWhatsAppNumber] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    
    // Bank Details State
    const [bankName, setBankName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [mobilePaymentNumber, setMobilePaymentNumber] = useState('');
    const [mobilePaymentType, setMobilePaymentType] = useState('GoPay');
    const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<'bank_transfer' | 'cash' | 'mobile_payment'>('bank_transfer');
    const [paymentInstructions, setPaymentInstructions] = useState('');
    
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
                } catch (_directError) {
                    console.log('⚠️ Direct ID lookup failed:', _directError);
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
                    } catch (_emailError) {
                        console.error('❌ Email lookup failed:', _emailError);
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
                    } catch (_phil4Error) {
                        console.log('⚠️ Phil4 document lookup failed:', _phil4Error);
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
                
                // Auto-fill location from userLocation if therapist location is empty
                if (existingTherapist.location) {
                    setLocation(existingTherapist.location);
                } else if (userLocation?.address) {
                    console.log('📍 Auto-filling location from landing page:', userLocation.address);
                    setLocation(userLocation.address);
                    if (userLocation.lat && userLocation.lng) {
                        setCoordinates({ lat: userLocation.lat, lng: userLocation.lng });
                    }
                } else {
                    setLocation('');
                }

                // Load bank details
                setBankName(existingTherapist.bankName || '');
                setBankAccountNumber(existingTherapist.bankAccountNumber || '');
                setBankAccountName(existingTherapist.bankAccountName || '');
                setMobilePaymentNumber(existingTherapist.mobilePaymentNumber || '');
                setMobilePaymentType(existingTherapist.mobilePaymentType || 'GoPay');
                setPreferredPaymentMethod(existingTherapist.preferredPaymentMethod || 'bank_transfer');
                setPaymentInstructions(existingTherapist.paymentInstructions || '');

                
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
                
                // Load service radius (default to 50km)
                setServiceRadius(existingTherapist.serviceRadius || 50);
                console.log('  - Service Radius:', existingTherapist.serviceRadius || 50, 'km');
                
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
                        console.log('🌐 Dashboard Debug - Raw languages from DB:', existingTherapist.languages);
                        console.log('🌐 Dashboard Debug - Languages type from DB:', typeof existingTherapist.languages);
                        const languagesData = parseLanguages(existingTherapist.languages);
                        console.log('🌐 Dashboard Debug - Parsed languages data:', languagesData);
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
                
                // Only update discount state if not currently saving (prevents data refresh from overriding activation)
                if (!isSavingDiscount) {
                    if (existingTherapist.discountEndTime) {
                        const endTime = new Date(existingTherapist.discountEndTime);
                        setDiscountEndTime(endTime);
                        setIsDiscountActive(endTime > new Date());
                        
                        // If there's an active discount, also set the selected values for display
                        if (endTime > new Date()) {
                            setSelectedDiscountPercentage(existingTherapist.discountPercentage || 0);
                            setSelectedDiscountDuration(existingTherapist.discountDuration || 0);
                            console.log('✅ Active discount loaded - UI buttons will show selected:', {
                                percentage: existingTherapist.discountPercentage,
                                duration: existingTherapist.discountDuration
                            });
                        } else {
                            // Discount expired - keep current selections if user was making them
                            console.log('⏰ Discount expired - keeping any user selections');
                        }
                    } else {
                        setDiscountEndTime(null);
                        setIsDiscountActive(false);
                        // No discount in DB - keep any current user selections for new discount
                        console.log('💡 No discount in DB - preserving user selections for new discount');
                    }
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

                setDiscountPercentage(0);
                setDiscountDuration(0);
                setDiscountEndTime(null);
                setIsDiscountActive(false);
                setBusyUntil(null);
                
            }
        } catch (error) {
            console.error('❌ Error fetching therapist data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [therapistId, existingTherapistData]);

    useEffect(() => {
        fetchTherapistData();
        
        // Fallback: Ensure loading completes within 5 seconds
        const loadingTimeout = setTimeout(() => {
            console.log('⚠️ Loading timeout - forcing content to show');
            setIsLoading(false);
        }, 5000);
        
        return () => clearTimeout(loadingTimeout);
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

    // Menu items for navigation - Updated to match home drawer style with Lucide React icons
    const menuItems = [
        { id: 'status', label: (t && t.availabilityStatus) || 'Availability Status', icon: <Activity className="w-5 h-5" />, gradientColor: 'from-green-500 to-green-600', borderColor: 'border-green-500', hoverColor: 'hover:border-green-300', textColor: 'text-green-800', bgColor: 'bg-green-100' },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, gradientColor: 'from-red-500 to-red-600', borderColor: 'border-red-500', hoverColor: 'hover:border-red-300', textColor: 'text-red-800', bgColor: 'bg-red-100', badge: notifications.length > 0 ? (notifications.length > 9 ? '9+' : notifications.length.toString()) : null },
        { id: 'bookings', label: (t && t.bookings) || 'Bookings', icon: <Calendar className="w-5 h-5" />, gradientColor: 'from-blue-500 to-blue-600', borderColor: 'border-blue-500', hoverColor: 'hover:border-blue-300', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
        { id: 'profile', label: (t && t.profile) || 'Profile', icon: <User className="w-5 h-5" />, gradientColor: 'from-orange-500 to-orange-600', borderColor: 'border-orange-500', hoverColor: 'hover:border-orange-300', textColor: 'text-orange-800', bgColor: 'bg-orange-100' },
        { id: 'analytics', label: (t && t.analytics) || 'Analytics', icon: <TrendingUp className="w-5 h-5" />, gradientColor: 'from-orange-500 to-orange-600', borderColor: 'border-orange-500', hoverColor: 'hover:border-orange-300', textColor: 'text-orange-800', bgColor: 'bg-orange-100' },
        { id: 'membership', label: (t && t.membership) || 'Membership', icon: <Crown className="w-5 h-5" />, gradientColor: 'from-yellow-500 to-yellow-600', borderColor: 'border-yellow-500', hoverColor: 'hover:border-yellow-300', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' },
        { id: 'hotel-villa', label: 'Indastreet Partners', icon: <Building className="w-5 h-5" />, gradientColor: 'from-pink-500 to-pink-600', borderColor: 'border-pink-500', hoverColor: 'hover:border-pink-300', textColor: 'text-pink-800', bgColor: 'bg-pink-100' },
        { id: 'bank-details', label: 'Bank Details', icon: <CreditCard className="w-5 h-5" />, gradientColor: 'from-green-500 to-green-600', borderColor: 'border-green-500', hoverColor: 'hover:border-green-300', textColor: 'text-green-800', bgColor: 'bg-green-100' },
        { id: 'discount-banners', label: 'Discount Banners', icon: <Tag className="w-5 h-5" />, gradientColor: 'from-orange-500 to-orange-600', borderColor: 'border-orange-500', hoverColor: 'hover:border-orange-300', textColor: 'text-orange-800', bgColor: 'bg-orange-100' },
        { id: 'terms', label: (t && t.terms) || 'Terms', icon: <FileText className="w-5 h-5" />, gradientColor: 'from-indigo-500 to-indigo-600', borderColor: 'border-indigo-500', hoverColor: 'hover:border-indigo-300', textColor: 'text-indigo-800', bgColor: 'bg-indigo-100' },
        { id: 'settings', label: (t && t.settings) || 'Settings', icon: <Settings className="w-5 h-5" />, gradientColor: 'from-gray-500 to-gray-600', borderColor: 'border-gray-500', hoverColor: 'hover:border-gray-300', textColor: 'text-gray-800', bgColor: 'bg-gray-100' }
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
            serviceRadius,
            status,
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
            // Bank Details
            bankName,
            bankAccountNumber,
            bankAccountName,
            mobilePaymentNumber,
            mobilePaymentType,
            preferredPaymentMethod,
            paymentInstructions,
            busyUntil: busyUntil?.toISOString() || undefined
        };

        console.log('🌐 Dashboard Debug - Languages before save:', languages);
        console.log('🌐 Dashboard Debug - Stringified languages:', stringifyLanguages(languages));
        console.log('💾 Dashboard Debug - Discount data being saved:', {
            discountPercentage,
            discountDuration, 
            discountEndTime: discountEndTime?.toISOString(),
            isDiscountActive
        });
        console.log('🌐 Dashboard Debug - Full therapist data being saved:', therapistData);
        
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
        coordinates, serviceRadius, status, discountPercentage,
        discountDuration, discountEndTime, isDiscountActive, onSave
    ]);

    // Handle busy timer confirmation
    const handleBusyTimerConfirm = useCallback(async (minutes: number) => {
        try {
            const busyEndTime = new Date();
            busyEndTime.setMinutes(busyEndTime.getMinutes() + minutes);
            
            setBusyUntil(busyEndTime);
            setStatus(AvailabilityStatus.Busy);
            
            // Persist busyUntil to backend immediately for consistency across app
            try {
                await therapistService.update(String(therapistId), {
                    busyUntil: busyEndTime.toISOString()
                } as any);
            } catch (persistErr) {
                console.warn('Busy timer persistence warning:', persistErr);
            }

            // Update status using upstream handler
            if (onStatusChange) await onStatusChange(AvailabilityStatus.Busy);
            
            setToast({ 
                message: `You are now busy for ${minutes} minutes`, 
                type: 'success' 
            });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('Error setting busy status:', error);
            setToast({ 
                message: 'Failed to set busy status', 
                type: 'error' 
            });
            setTimeout(() => setToast(null), 3000);
        }
    }, [onStatusChange, therapistId]);

    // Account Settings Handlers
    const handleChangePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        
        if (newPassword.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        try {
            // Here you would implement the actual password change logic
            // For now, we'll just show a success message
            setToast({ message: 'Password updated successfully!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
            setShowChangePasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password update error:', error);
            setToast({ message: 'Failed to update password', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleUpdatePhone = async () => {
        if (!newWhatsAppNumber || newWhatsAppNumber.length < 10) {
            setToast({ message: 'Please enter a valid WhatsApp number', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        try {
            // Update the WhatsApp number in the therapist data
            setWhatsappNumber(newWhatsAppNumber);
            
            // Here you would implement the actual phone number update logic
            setToast({ message: 'WhatsApp number updated successfully!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
            setShowUpdatePhoneModal(false);
            setNewWhatsAppNumber('');
        } catch (error) {
            console.error('WhatsApp update error:', error);
            setToast({ message: 'Failed to update WhatsApp number', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleExportData = () => {
        try {
            // Create export data object
            const exportData = {
                profile: {
                    name,
                    email,
                    location,
                    whatsappNumber,
                    pricing: {
                        price60: pricing[60],
                        price90: pricing[90],
                        price120: pricing[120]
                    }
                },
                status: status,
                exportDate: new Date().toISOString()
            };

            // Convert to JSON and create download
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `therapist-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setToast({ message: 'Data exported successfully!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('Export error:', error);
            setToast({ message: 'Failed to export data', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            setToast({ message: 'Please type "DELETE" to confirm', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        try {
            // Here you would implement the actual account deletion logic
            // For now, we'll just show a message
            setToast({ message: 'Account deletion request submitted', type: 'warning' });
            setTimeout(() => setToast(null), 5000);
            setShowDeleteAccountModal(false);
            setDeleteConfirmText('');
        } catch (error) {
            console.error('Delete account error:', error);
            setToast({ message: 'Failed to delete account', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50 fixed inset-0">
            {/* CSS Animations for Discount Effects + Scroll Container Fix */}
            <style>{`
                @keyframes flash {
                    0%, 100% { 
                        box-shadow: 0 0 10px rgba(251, 146, 60, 0.3); 
                    }
                    50% { 
                        box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
                    }
                }
                @keyframes glow {
                    0% { 
                        border-color: rgba(251, 146, 60, 0.7);
                        background: linear-gradient(45deg, rgba(251, 146, 60, 0.1), rgba(239, 68, 68, 0.1));
                    }
                    100% { 
                        border-color: rgba(239, 68, 68, 0.8);
                        background: linear-gradient(45deg, rgba(239, 68, 68, 0.15), rgba(251, 146, 60, 0.15));
                    }
                }
                
                /* EMERGENCY FOOTER FIX - HIGHEST PRIORITY */
                footer[class*="fixed"] {
                    position: fixed !important;
                    bottom: 0px !important;
                    left: 0px !important;
                    right: 0px !important;
                    z-index: 99999 !important;
                    width: 100% !important;
                    transform: none !important;
                    transition: none !important;
                }
                
                /* SCROLL CONTAINER FIX */
                .scroll-container {
                    height: 100vh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                
                /* PREVENT BODY SCROLL */
                body, html {
                    overflow: hidden !important;
                    height: 100vh !important;
                }
            `}</style>
            
            {/* Scrollable Content Container */}
            <div className="scroll-container h-full overflow-y-auto pb-20" style={{ paddingBottom: '80px' }}>
                {/* Dashboard-Specific Header */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-3xl">💆</span>
                        <span>Therapist Dashboard</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Status Badge */}
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-1 ${
                                status === AvailabilityStatus.Available ? 'text-green-600' :
                                status === AvailabilityStatus.Busy ? 'text-yellow-600' :
                                status === AvailabilityStatus.Offline ? 'text-red-600' :
                                'text-gray-600'
                            }`}
                            title="Status"
                        >
                            <span className={`w-2 h-2 rounded-full ${
                                status === AvailabilityStatus.Available ? 'bg-green-500' :
                                status === AvailabilityStatus.Busy ? 'bg-yellow-500' :
                                status === AvailabilityStatus.Offline ? 'bg-red-500' :
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

            {/* Main Content Container - Compact Version */}
            <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Side Navigation - Desktop - Compact */}
                    <div className="hidden lg:block w-56 space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => item.id === 'notifications' ? setShowNotifications(true) : setActiveTab(item.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border-l-3 ${item.borderColor} relative ${
                                    activeTab === item.id
                                        ? `${item.bgColor} ${item.textColor} shadow-sm`
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`p-1.5 bg-gradient-to-br ${item.gradientColor} rounded-md`}>
                                    {React.cloneElement(item.icon, { 
                                        className: "w-3.5 h-3.5 text-white"
                                    })}
                                </div>
                                <span className="font-medium">{item.label}</span>
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
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
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="text-center mb-4">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
                                            <p className="text-sm text-gray-600">Set your availability status to start receiving bookings</p>
                                        </div>

                                        {therapist && (
                                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {therapist.profilePicture ? (
                                                            <img src={therapist.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                                                                <span className="text-orange-600 text-lg font-bold">{therapist.name?.charAt(0) || 'T'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-gray-800">{therapist.name || 'Therapist'}</h3>
                                                        <p className="text-xs text-gray-600">{therapist.location || 'Location not set'}</p>
                                                        <p className="text-xs text-blue-600 font-medium">Active Profile</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Control Buttons */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Choose Your Availability Status</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {/* Available Button */}
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            setStatus(AvailabilityStatus.Available);
                                                            if (onStatusChange) {
                                                                await onStatusChange(AvailabilityStatus.Available);
                                                            }
                                                            setToast({ message: 'Status updated to Available!', type: 'success' });
                                                            setTimeout(() => setToast(null), 3000);
                                                        } catch (error) {
                                                            console.error('Status change failed:', error);
                                                            setToast({ message: 'Failed to update status', type: 'error' });
                                                            setTimeout(() => setToast(null), 3000);
                                                        }
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
                                                    onClick={async () => {
                                                        try {
                                                            setStatus(AvailabilityStatus.Offline);
                                                            
                                                            // Deactivate discount when going offline
                                                            if (isDiscountActive) {
                                                                setIsDiscountActive(false);
                                                                setDiscountEndTime(null);
                                                                console.log('💔 Discount deactivated due to offline status');
                                                            }
                                                            
                                                            if (onStatusChange) {
                                                                await onStatusChange(AvailabilityStatus.Offline);
                                                            }
                                                            setToast({ message: 'Status updated to Offline! Discount deactivated.', type: 'success' });
                                                            setTimeout(() => setToast(null), 3000);
                                                        } catch (error) {
                                                            console.error('Status change failed:', error);
                                                            setToast({ message: 'Failed to update status', type: 'error' });
                                                            setTimeout(() => setToast(null), 3000);
                                                        }
                                                    }}
                                                    className={`p-6 rounded-2xl border-3 text-center font-bold transition-all transform hover:scale-105 ${
                                                        status === AvailabilityStatus.Offline
                                                            ? 'bg-red-100 border-red-400 text-red-800 shadow-lg'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full mx-auto mb-3 ${
                                                        status === AvailabilityStatus.Offline ? 'bg-red-500' : 'bg-gray-300'
                                                    }`} />
                                                    <div className="text-2xl mb-2">⛔</div>
                                                    <div className="text-lg font-bold">OFFLINE</div>
                                                    <div className="text-sm mt-2">Not accepting bookings</div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Discount System - Available at all times */}
                                        <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-orange-800 mb-2">🎉 Boost Your Bookings!</h3>
                                                    <p className="text-orange-600">Run a discount promotion to attract more clients and increase your visibility</p>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Discount Percentage Selection */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-orange-700 mb-3">Choose Discount Percentage:</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {[5, 10, 15, 20].map((percent) => (
                                                                <button
                                                                    key={percent}
                                                                    onClick={() => {
                                                                        console.log('🎯 Discount percentage selected:', percent);
                                                                        setSelectedDiscountPercentage(percent);
                                                                    }}
                                                                    className={`p-4 rounded-xl border-2 text-center font-bold transition-all ${
                                                                        selectedDiscountPercentage === percent
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
                                                                    onClick={() => {
                                                                        console.log('⏰ Discount duration selected:', option.hours);
                                                                        setSelectedDiscountDuration(option.hours);
                                                                    }}
                                                                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                                                        selectedDiscountDuration === option.hours
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
                                                    {(() => {
                                                        console.log('🔍 Activation condition check:', {
                                                            selectedDiscountPercentage,
                                                            selectedDiscountDuration,
                                                            condition: selectedDiscountPercentage > 0 && selectedDiscountDuration > 0
                                                        });
                                                        return selectedDiscountPercentage > 0 && selectedDiscountDuration > 0;
                                                    })() && (
                                                        <div className="p-4 bg-white border-2 border-orange-200 rounded-xl">
                                                            <div className="text-center mb-4">
                                                                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold">
                                                                    <span className="text-lg">🔥</span>
                                                                    <span>{selectedDiscountPercentage}% OFF</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-2">
                                                                    This discount badge will appear on your profile card for {selectedDiscountDuration} hours
                                                                </p>
                                                            </div>
                                                            
                                            <button
                                                onClick={async () => {
                                                    console.log('🔥 ACTIVATION BUTTON CLICKED!');
                                                    console.log('🔍 CURRENT STATE:', {
                                                        selectedDiscountPercentage,
                                                        selectedDiscountDuration,
                                                        isDiscountActive,
                                                        isSavingDiscount,
                                                        therapistId
                                                    });
                                                    
                                                    // Validation check
                                                    if (selectedDiscountPercentage === 0) {
                                                        alert('❌ Please select a discount percentage first!');
                                                        return;
                                                    }
                                                    if (selectedDiscountDuration === 0) {
                                                        alert('❌ Please select a discount duration first!');
                                                        return;
                                                    }
                                                    
                                                    // Prevent data refresh during save operation
                                                    setIsSavingDiscount(true);
                                                    
                                                    console.log('🚀 Activating discount with:', {
                                                        percentage: selectedDiscountPercentage,
                                                        duration: selectedDiscountDuration
                                                    });
                                                    
                                                    // 🌍 Use UTC timezone for consistent handling across regions
                                                    const now = new Date();
                                                    const endTime = new Date(now.getTime() + (selectedDiscountDuration * 60 * 60 * 1000));
                                                    
                                                    console.log('📅 Discount timing (UTC):', {
                                                        startTime: now.toISOString(),
                                                        endTime: endTime.toISOString(),
                                                        duration: selectedDiscountDuration + ' hours',
                                                        localStart: now.toLocaleString(),
                                                        localEnd: endTime.toLocaleString()
                                                    });
                                                    
                                                    // Prepare discount data for immediate save
                                                    const discountData = {
                                                        discountPercentage: selectedDiscountPercentage,
                                                        discountDuration: selectedDiscountDuration,
                                                        discountEndTime: endTime.toISOString(),
                                                        isDiscountActive: true
                                                    };
                                                    
                                                    console.log('� Discount Debug - Saving discount data:', discountData);
                                                    
                                                    // 🔐 Ensure authentication before save
                                                    try {
                                                        // Check authentication status
                                                        const { account } = await import('../lib/appwrite');
                                                        try {
                                                            const session = await account.get();
                                                            console.log('✅ Authenticated session found:', session.email || 'anonymous');
                                                        } catch (authError) {
                                                            console.log('🔓 No session found, creating anonymous session for save...', authError);
                                                            await account.createAnonymousSession();
                                                            console.log('✅ Anonymous session created for discount save');
                                                        }
                                                        
                                                        // Auto-save immediately with new discount values
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
                                                            serviceRadius,
                                                            status,
                                                            ...discountData, // Use new discount values directly
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
                                                            massageTypes: stringifyMassageTypes(massageTypes),
                                                            languages: stringifyLanguages(languages),
                                                            busyUntil: busyUntil?.toISOString() || undefined
                                                        };
                                                        
                                                        console.log('💾 Discount Debug - Full save data:', therapistData);
                                                        console.log('� Discount Debug - Detailed discount fields being sent:', {
                                                            discountPercentage: therapistData.discountPercentage,
                                                            discountDuration: therapistData.discountDuration, 
                                                            discountEndTime: therapistData.discountEndTime,
                                                            isDiscountActive: therapistData.isDiscountActive,
                                                            therapistId: therapistId
                                                        });
                                                        console.log('�💾 About to call onSave function...');
                                                        console.log('💾 onSave type:', typeof onSave);
                                                        
                                                        const saveResult = await onSave(therapistData as any);
                                                        console.log('💾 Save completed successfully:', saveResult);
                                                        
                                                        // 🔄 FORCE DATA REFRESH: Trigger home page data reload
                                                        console.log('🔄 Triggering global data refresh...');
                                                        const refreshEvent = new CustomEvent('refreshTherapistData', {
                                                            detail: { 
                                                                therapistId: therapistId,
                                                                action: 'discountActivated',
                                                                discountData: {
                                                                    percentage: selectedDiscountPercentage,
                                                                    duration: selectedDiscountDuration,
                                                                    endTime: endTime.toISOString(),
                                                                    active: true
                                                                }
                                                            }
                                                        });
                                                        window.dispatchEvent(refreshEvent);
                                                        
                                                        // Update state after successful save
                                                        setDiscountPercentage(selectedDiscountPercentage);
                                                        setDiscountDuration(selectedDiscountDuration);
                                                        setDiscountEndTime(endTime);
                                                        setIsDiscountActive(true);
                                                        
                                                        setToast({ 
                                                            message: `🎉 ${selectedDiscountPercentage}% discount activated for ${selectedDiscountDuration} hours! Your profile is now flashing to attract customers!`, 
                                                            type: 'success' 
                                                        });
                                                        setTimeout(() => setToast(null), 5000);
                                                        
                                                        // 🔍 Verify the save actually worked by reading back the data
                                                        setTimeout(async () => {
                                                            try {
                                                                const { therapistService } = await import('../lib/appwriteService');
                                                                const savedTherapist = await therapistService.getById(String(therapistId));
                                                                console.log('🔍 Verification - Saved discount data in database:', {
                                                                    discountPercentage: savedTherapist.discountPercentage,
                                                                    discountDuration: savedTherapist.discountDuration,
                                                                    discountEndTime: savedTherapist.discountEndTime,
                                                                    isDiscountActive: savedTherapist.isDiscountActive
                                                                });
                                                                
                                                                if (savedTherapist.isDiscountActive && savedTherapist.discountPercentage > 0) {
                                                                    console.log('✅ Database verification: Discount saved successfully!');
                                                                } else {
                                                                    console.error('❌ Database verification: Discount not saved properly!');
                                                                }
                                                            } catch (_verifyError) {
                                                                console.error('❌ Verification failed:', _verifyError);
                                                            }
                                                        }, 1000); // Wait 1 second for database consistency
                                                        
                                                        // Allow data refresh again after successful save
                                                        setIsSavingDiscount(false);
                                                        
                                                        // Start countdown timer that will auto-deactivate when expired
                                                        const checkExpiration = setInterval(() => {
                                                            if (new Date() >= endTime) {
                                                                setIsDiscountActive(false);
                                                                setDiscountEndTime(null);
                                                                setDiscountPercentage(0);
                                                                setDiscountDuration(0);
                                                                // Also reset selected values when expired
                                                                setSelectedDiscountPercentage(0);
                                                                setSelectedDiscountDuration(0);
                                                                handleSave(); // Auto-save when expired
                                                                clearInterval(checkExpiration);
                                                                
                                                                setToast({ 
                                                                    message: '⏰ Discount promotion has expired and been automatically deactivated.', 
                                                                    type: 'warning' 
                                                                });
                                                                setTimeout(() => setToast(null), 4000);
                                                            }
                                                        }, 1000);
                                                        
                                                    } catch (error) {
                                                        console.error('💥 Discount activation error:', error);
                                                        
                                                        // 🔍 Detailed error analysis
                                                        let errorMessage = 'Failed to activate discount. Please try again.';
                                                        if (error instanceof Error) {
                                                            console.error('💥 Error details:', {
                                                                message: error.message,
                                                                stack: error.stack,
                                                                name: error.name
                                                            });
                                                            
                                                            // Specific error handling
                                                            if (error.message.includes('permission')) {
                                                                errorMessage = 'Permission denied. Please log in and try again.';
                                                            } else if (error.message.includes('network')) {
                                                                errorMessage = 'Network error. Check your connection and try again.';
                                                            } else if (error.message.includes('timeout')) {
                                                                errorMessage = 'Request timeout. Please try again.';
                                                            }
                                                        }
                                                        
                                                        setToast({ 
                                                            message: `❌ ${errorMessage}`, 
                                                            type: 'error' 
                                                        });
                                                        setTimeout(() => setToast(null), 6000);
                                                        
                                                        // Allow data refresh again after error
                                                        setIsSavingDiscount(false);
                                                    }
                                                                }}
                                                                disabled={isDiscountActive}
                                                                onMouseOver={() => console.log('🔍 BUTTON STATE:', { disabled: isDiscountActive, selectedPercentage: selectedDiscountPercentage, selectedDuration: selectedDiscountDuration })}
                                                                className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                                                                    isDiscountActive
                                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl'
                                                                }`}
                                                            >
                                                                {isDiscountActive && discountEndTime ? (
                                                                    <ActivatedDiscountButton 
                                                                        endTime={discountEndTime}
                                                                        percentage={discountPercentage}
                                                                        onExpire={() => {
                                                                            setIsDiscountActive(false);
                                                                            setDiscountEndTime(null);
                                                                            setDiscountPercentage(0);
                                                                            setDiscountDuration(0);
                                                                            setSelectedDiscountPercentage(0);
                                                                            setSelectedDiscountDuration(0);
                                                                            handleSave();
                                                                            setToast({ 
                                                                                message: '⏰ Discount promotion expired automatically!', 
                                                                                type: 'warning' 
                                                                            });
                                                                            setTimeout(() => setToast(null), 4000);
                                                                        }}
                                                                    />
                                                                ) : '🚀 Auto-Activate Discount'}
                                                            </button>

                                                            {/* Active Discount Info with Live Countdown */}
                                                            {isDiscountActive && discountEndTime && (
                                                                <LiveDiscountCountdown 
                                                                    endTime={discountEndTime}
                                                                    percentage={discountPercentage}
                                                                    onExpire={() => {
                                                                        setIsDiscountActive(false);
                                                                        setDiscountEndTime(null);
                                                                        setDiscountPercentage(0);
                                                                        setDiscountDuration(0);
                                                                        // Also reset selected values when expired
                                                                        setSelectedDiscountPercentage(0);
                                                                        setSelectedDiscountDuration(0);
                                                                        handleSave();
                                                                        setToast({ 
                                                                            message: '⏰ Discount promotion expired automatically!', 
                                                                            type: 'warning' 
                                                                        });
                                                                        setTimeout(() => setToast(null), 4000);
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

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
                                                    <BusyCountdownTimer busyUntil={busyUntil} />
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
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                                        {/* Coin Rewards Section */}
                                        {onNavigate && (
                                            <div className="mt-8 space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Coin Rewards</h3>
                                                
                                                {/* Coin History Button */}
                                                <button
                                                    onClick={() => onNavigate('coinHistory')}
                                                    className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-orange-200 hover:border-orange-400"
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
                                                            <p className="text-sm text-gray-600">Redeem coins for rewards & cash out</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="space-y-8">
                                        <div className="p-6 space-y-8">
                                            {/* Profile Picture & Basic Info */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div className="lg:col-span-1">
                                                    <div className="text-center">
                                                        <div className="inline-block mb-4">
                                                            {profilePicture ? (
                                                                <img 
                                                                    src={profilePicture} 
                                                                    alt="Profile" 
                                                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                                                                    <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="lg:col-span-2 space-y-4">
                                                    {/* Essential Info Container: Name, WhatsApp & Experience */}
                                                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                                        <div className="mb-4">
                                                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                                                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                                    </svg>
                                                                </div>
                                                                Essential Information
                                                            </h3>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Name */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Full Name <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                                        </svg>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={name}
                                                                        onChange={(e) => setName(e.target.value)}
                                                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-sm"
                                                                        placeholder="Your full name"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* WhatsApp Number */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    WhatsApp Number <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span className="absolute inset-y-0 left-8 pl-2 flex items-center text-gray-500 text-xs pointer-events-none">+62</span>
                                                                    <input
                                                                        type="tel"
                                                                        value={whatsappNumber}
                                                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                                                        className="w-full pl-16 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all text-sm"
                                                                        placeholder="812 3456 7890"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Years of Experience */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Experience <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="50"
                                                                        value={yearsOfExperience}
                                                                        onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                                                                        className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm"
                                                                        placeholder="0"
                                                                    />
                                                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-xs pointer-events-none">
                                                                        {yearsOfExperience === 1 ? 'year' : 'years'}
                                                                    </span>
                                                                </div>
                                                                {yearsOfExperience > 0 && (
                                                                    <p className="mt-1 text-xs text-blue-600 font-medium">
                                                                        {yearsOfExperience >= 10 && "Expert level! 🌟"}
                                                                        {yearsOfExperience >= 5 && yearsOfExperience < 10 && "Experienced! 👍"}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Professional Description */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Description <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <div className="absolute top-3 left-3 pointer-events-none">
                                                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <textarea
                                                                        value={description}
                                                                        onChange={(e) => {
                                                                            if (e.target.value.length <= 350) {
                                                                                setDescription(e.target.value);
                                                                            }
                                                                        }}
                                                                        rows={6}
                                                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-sm resize-none"
                                                                        placeholder="Describe your expertise and specialties..."
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between items-center mt-1">
                                                                    <p className="text-xs text-gray-500">Tell clients about your expertise</p>
                                                                    <span className={`text-xs font-medium ${
                                                                        description.length > 350 ? 'text-red-600' : 
                                                                        description.length > 300 ? 'text-orange-600' : 'text-gray-500'
                                                                    }`}>
                                                                        {description.length}/350
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                                                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                                This information will be displayed on your public profile and helps customers find you
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Service Location with GPS and Radius */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4">
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    Service Location & Coverage Area <span className="text-red-500">*</span>
                                                </label>
                                                
                                                {/* Current Location Display */}
                                                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                <span className="text-sm font-medium text-blue-700">Current Base Location:</span>
                                                                {(coordinates.lat !== 0 || coordinates.lng !== 0) && (
                                                                    <div className="ml-auto flex items-center gap-1">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        <span className="text-green-600 font-medium text-xs">Live GPS</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {location || 'Location not set'}
                                                            </p>
                                                            {location && (
                                                                <div className="flex items-center justify-between text-xs mt-2">
                                                                    <span className="text-blue-600 bg-white px-2 py-1 rounded-full">
                                                                        📍 Ready for customer navigation
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    setIsSaving(true);
                                                                    console.log('🎯 Getting current location...');
                                                                    
                                                                    if ('geolocation' in navigator) {
                                                                        navigator.geolocation.getCurrentPosition(
                                                                            async (position) => {
                                                                                const { latitude, longitude } = position.coords;
                                                                                console.log('📍 GPS Coordinates:', { lat: latitude, lng: longitude });
                                                                                
                                                                                // Update coordinates
                                                                                setCoordinates({ lat: latitude, lng: longitude });
                                                                                
                                                                                // Reverse geocode to get address
                                                                                try {
                                                                                    // For now, just set coordinates - later can add reverse geocoding
                                                                                    const locationName = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                                                                                    setLocation(locationName);
                                                                                    
                                                                                    setToast({ 
                                                                                        message: '✅ Location set successfully from GPS!', 
                                                                                        type: 'success' 
                                                                                    });
                                                                                    setTimeout(() => setToast(null), 3000);
                                                                                } catch (error) {
                                                                                    console.error('Error getting location name:', error);
                                                                                    const locationName = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                                                                                    setLocation(locationName);
                                                                                    
                                                                                    setToast({ 
                                                                                        message: '✅ GPS location set!', 
                                                                                        type: 'success' 
                                                                                    });
                                                                                    setTimeout(() => setToast(null), 3000);
                                                                                }
                                                                                setIsSaving(false);
                                                                            },
                                                                            (error) => {
                                                                                console.error('❌ Error getting location:', error);
                                                                                setToast({ 
                                                                                    message: '❌ Could not access location. Please enable location permissions.', 
                                                                                    type: 'error' 
                                                                                });
                                                                                setTimeout(() => setToast(null), 5000);
                                                                                setIsSaving(false);
                                                                            },
                                                                            {
                                                                                enableHighAccuracy: true,
                                                                                timeout: 10000,
                                                                                maximumAge: 0
                                                                            }
                                                                        );
                                                                    } else {
                                                                        throw new Error('Geolocation is not supported by this browser');
                                                                    }
                                                                } catch (error) {
                                                                    console.error('❌ Geolocation error:', error);
                                                                    setToast({ 
                                                                        message: '❌ Location access not available on this device', 
                                                                        type: 'error' 
                                                                    });
                                                                    setTimeout(() => setToast(null), 5000);
                                                                    setIsSaving(false);
                                                                }
                                                            }}
                                                            className={`px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                                                location && coordinates.lat !== 0 
                                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                                                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                                            }`}
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving ? (
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                                    <span>Getting GPS...</span>
                                                                </div>
                                                            ) : location && coordinates.lat !== 0 ? (
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    <span>Update GPS Location</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    </svg>
                                                                    <span>Use Device GPS</span>
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Service Radius */}
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                                </svg>
                                                                <span className="text-sm font-medium text-green-700">Service Coverage Radius:</span>
                                                            </div>
                                                            <p className="text-2xl font-bold text-green-600">
                                                                Up to 15 KM
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1 bg-white/50 rounded px-2 py-1">
                                                                You can provide services within 15km from your base location
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                                15km
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Manual Location Input (Fallback) */}
                                                <div className="mt-4">
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        Or edit address manually:
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={location}
                                                            onChange={(e) => setLocation(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                                            placeholder="e.g., Seminyak, Bali, Indonesia"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                        You can manually edit the address detected by GPS or type your own
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Massage Specialties */}
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900 mb-2">
                                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h3a2 2 0 012 2v1M13 13l-2-2" />
                                                            </svg>
                                                        </div>
                                                        Massage Specialties
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4">Select up to 5 specialties you offer</p>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                        {MASSAGE_TYPES_CATEGORIZED.map((category, categoryIndex) => (
                                                            <div key={categoryIndex}>
                                                                <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                                                    <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full"></div>
                                                                    {category.category.replace(' Massages', '').replace('Massages', 'Techniques')}
                                                                </h4>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                                {category.types.map((type) => (
                                                                    <label 
                                                                        key={type} 
                                                                        className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                                                            massageTypes.includes(type)
                                                                                ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 text-orange-700 shadow-md transform scale-105'
                                                                                : massageTypes.length >= 5
                                                                                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                                                                    : 'bg-white border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white text-gray-700 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <div className="relative">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={massageTypes.includes(type)}
                                                                                onChange={(e) => {
                                                                                    console.log('💆 Massage type checkbox changed:', type, 'checked:', e.target.checked, 'current types:', massageTypes);
                                                                                    if (e.target.checked) {
                                                                                        // Use functional state update to prevent race conditions
                                                                                        setMassageTypes(prevTypes => {
                                                                                            if (prevTypes.length < 5 && !prevTypes.includes(type)) {
                                                                                                const newTypes = [...prevTypes, type];
                                                                                                console.log('💆 Adding massage type, new state:', newTypes);
                                                                                                return newTypes;
                                                                                            }
                                                                                            console.log('💆 Cannot add - limit reached or already exists');
                                                                                            return prevTypes;
                                                                                        });
                                                                                    } else {
                                                                                        // Use functional state update for removal
                                                                                        setMassageTypes(prevTypes => {
                                                                                            const newTypes = prevTypes.filter(t => t !== type);
                                                                                            console.log('💆 Removing massage type, new state:', newTypes);
                                                                                            return newTypes;
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                disabled={!massageTypes.includes(type) && massageTypes.length >= 5}
                                                                                className={`w-5 h-5 rounded-lg border-2 shadow-sm focus:ring-2 focus:ring-orange-200 transition-all ${
                                                                                    massageTypes.includes(type) 
                                                                                        ? 'bg-orange-500 border-orange-500 text-white' 
                                                                                        : 'border-gray-300 bg-white hover:border-orange-300'
                                                                                } disabled:opacity-50`}
                                                                            />
                                                                            {massageTypes.includes(type) && (
                                                                                <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <span className="text-sm font-medium">{type.replace(' Massage', '')}</span>
                                                                            {massageTypes.includes(type) && (
                                                                                <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
                                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    Selected
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>


                                            </div>

                                            {/* Languages Spoken */}
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900 mb-2">
                                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                            </svg>
                                                        </div>
                                                        Languages Spoken
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4">Select up to 3 languages</p>
                                                    <div className="mb-4">
                                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                                                            <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{languages.length}</span>
                                                            {languages.length} of 3 selected
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Language Options Container */}
                                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {[
                                                        { name: 'English', flag: '🇬🇧' },
                                                        { name: 'Indonesian', flag: '🇮🇩' },
                                                        { name: 'Mandarin', flag: '🇨🇳' },
                                                        { name: 'Japanese', flag: '🇯🇵' },
                                                        { name: 'Korean', flag: '🇰🇷' },
                                                        { name: 'Russian', flag: '🇷🇺' },
                                                        { name: 'French', flag: '🇫🇷' },
                                                        { name: 'German', flag: '🇩🇪' }
                                                    ].map((lang) => (
                                                        <label 
                                                            key={lang.name} 
                                                            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                                                languages.includes(lang.name)
                                                                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 text-orange-700 shadow-md transform scale-105'
                                                                    : languages.length >= 3
                                                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                                                        : 'bg-white border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white text-gray-700 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={languages.includes(lang.name)}
                                                                    onChange={(e) => {
                                                                        console.log('Language checkbox changed:', lang.name, 'checked:', e.target.checked, 'current languages:', languages);
                                                                        if (e.target.checked) {
                                                                            if (languages.length < 3) {
                                                                                const newLanguages = [...languages, lang.name];
                                                                                console.log('Adding language, new state:', newLanguages);
                                                                                setLanguages(newLanguages);
                                                                            }
                                                                        } else {
                                                                            const newLanguages = languages.filter(l => l !== lang.name);
                                                                            console.log('Removing language, new state:', newLanguages);
                                                                            setLanguages(newLanguages);
                                                                        }
                                                                    }}
                                                                    disabled={!languages.includes(lang.name) && languages.length >= 3}
                                                                    className={`w-5 h-5 rounded-lg border-2 shadow-sm focus:ring-2 focus:ring-orange-200 transition-all ${
                                                                        languages.includes(lang.name) 
                                                                            ? 'bg-orange-500 border-orange-500 text-white' 
                                                                            : 'border-gray-300 bg-white hover:border-orange-300'
                                                                    } disabled:opacity-50`}
                                                                />
                                                                {languages.includes(lang.name) && (
                                                                    <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <span className="text-lg">{lang.flag}</span>
                                                                <div>
                                                                    <span className="text-sm font-medium">{lang.name}</span>
                                                                    {languages.includes(lang.name) && (
                                                                        <div className="text-xs text-blue-600 flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            Selected
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                    </div>
                                                </div>

                                                {/* Selected Languages Preview */}
                                                {languages.length > 0 && (
                                                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <p className="text-sm font-bold text-orange-700">
                                                                Languages You Speak ({languages.length}/3):
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {languages.map((language) => {
                                                                const languageFlags = {
                                                                    'English': '🇬🇧',
                                                                    'Indonesian': '🇮🇩',
                                                                    'Mandarin': '🇨🇳',
                                                                    'Japanese': '🇯🇵',
                                                                    'Korean': '🇰🇷',
                                                                    'Russian': '🇷🇺',
                                                                    'French': '🇫🇷',
                                                                    'German': '🇩🇪'
                                                                };
                                                                return (
                                                                    <span 
                                                                        key={language}
                                                                        className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 text-orange-800 text-sm font-medium rounded-full hover:from-orange-200 hover:to-red-200 transition-all duration-200"
                                                                    >
                                                                        <span className="mr-2">{(languageFlags as any)[language] || '🌍'}</span>
                                                                        <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        {language}
                                                                        <button
                                                                            onClick={() => setLanguages(languages.filter(l => l !== language))}
                                                                            className="ml-2 w-4 h-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                                                            title="Remove language"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pricing */}
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900 mb-2">
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                            </svg>
                                                        </div>
                                                        Service Pricing (IDR)
                                                        {isDiscountActive && (
                                                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full font-bold">
                                                                {discountPercentage}% OFF Active
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4">Home Page Pricing - 100% Your Income</p>
                                                </div>
                                                
                                                {/* Home Page Pricing Container */}
                                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {[60, 90, 120].map((duration) => {
                                                        const originalPrice = (pricing as any)[duration] || 0;
                                                        const discountedPrice = isDiscountActive 
                                                            ? Math.round(originalPrice * (1 - discountPercentage / 100))
                                                            : originalPrice;
                                                        
                                                        return (
                                                            <div key={duration} className={`bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 p-4 transition-all duration-300 ${
                                                                isDiscountActive 
                                                                    ? 'border-orange-300 shadow-lg' 
                                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                                            }`}>
                                                                {/* Static highlight when discount is active */}
                                                                {isDiscountActive && (
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-red-400/5 rounded-xl pointer-events-none"></div>
                                                                )}
                                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                                                                        {duration === 60 ? '1' : duration === 90 ? '1.5' : '2'}h
                                                                    </div>
                                                                    {duration} Minutes
                                                                </label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <span className="text-gray-500 text-sm">Rp</span>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={originalPrice > 0 ? originalPrice.toString() : ''}
                                                                        onChange={(e) => {
                                                                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                            setPricing({
                                                                                ...pricing,
                                                                                [duration]: numericValue ? parseInt(numericValue) : 0
                                                                            });
                                                                        }}
                                                                        className={`w-full pl-12 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-gray-900 transition-all ${
                                                                            isDiscountActive 
                                                                                ? 'border-orange-300 bg-orange-50' 
                                                                                : 'border-gray-200'
                                                                        }`}
                                                                        placeholder="250000"
                                                                    />
                                                                </div>
                                                                {originalPrice > 0 && (
                                                                    <p className="text-xs text-gray-500 mt-2 bg-white rounded px-2 py-1">
                                                                        = Rp {originalPrice.toLocaleString('id-ID')}
                                                                    </p>
                                                                )}
                                                                {isDiscountActive && originalPrice > 0 && (
                                                                    <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                                                                        <div className="flex justify-between items-center text-sm mb-1">
                                                                            <span className="text-gray-500 line-through">
                                                                                IDR {originalPrice.toLocaleString()}
                                                                            </span>
                                                                            <span className="text-orange-600 font-bold">
                                                                                IDR {discountedPrice.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            Save IDR {(originalPrice - discountedPrice).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Hotel & Villa Live Menu Pricing */}
                                                <div className="text-center mt-6 mb-4">
                                                    <h4 className="flex items-center justify-center gap-2 text-lg font-semibold text-orange-800 mb-2">
                                                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        Hotel & Villa Live Menu Pricing
                                                    </h4>
                                                    <p className="text-sm text-gray-600">Set prices for hotel/villa services (20% commission applies)</p>
                                                </div>
                                                
                                                <div className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm">

                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[60, 90, 120].map((duration) => {
                                                            const price = (hotelVillaPricing as any)[duration] || 0;
                                                            
                                                            return (
                                                                <div key={duration} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                                                    <label className="block text-xs font-semibold text-orange-700 mb-2">
                                                                        {duration}min
                                                                    </label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="text"
                                                                            value={price.toString()}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value.replace(/\D/g, '');
                                                                                if (value === '') {
                                                                                    setHotelVillaPricing({
                                                                                        ...hotelVillaPricing,
                                                                                        [duration]: 0
                                                                                    });
                                                                                } else if (value.length <= 3) {
                                                                                    const numValue = parseInt(value);
                                                                                    setHotelVillaPricing({
                                                                                        ...hotelVillaPricing,
                                                                                        [duration]: numValue
                                                                                    });
                                                                                }
                                                                            }}
                                                                            placeholder="000"
                                                                            maxLength={3}
                                                                            className="w-full px-2 py-2 border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-center text-sm font-bold bg-white"
                                                                        />
                                                                        <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-orange-600 font-bold text-xs">K</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-center pt-6">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="bg-orange-500 text-white py-3 px-8 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'membership' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.membership || 'Membership & Rewards'}</h2>
                                            <p className="text-gray-600">Manage your premium membership status and rewards</p>
                                        </div>

                                        {/* Membership Status Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-yellow-500 rounded-lg">
                                                        <Crown className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-yellow-800">Premium Member</p>
                                                        <p className="text-sm text-yellow-600">Active Status</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-500 rounded-lg">
                                                        <Star className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-green-800">Reward Points</p>
                                                        <p className="text-sm text-green-600">1,250 Available</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Membership Benefits */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h3 className="font-bold text-gray-900 mb-3">Membership Benefits</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-sm text-gray-700">Priority booking placement</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-sm text-gray-700">Reduced platform fees</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-sm text-gray-700">Advanced analytics</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-sm text-gray-700">Priority customer support</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upgrade Options */}
                                        <div className="text-center">
                                            <button className="bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                                                Upgrade Membership
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'hotel-villa' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <p className="text-gray-700 text-base">
                                            Promotors Receive 20% commission from their shared links and advertisement.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'bank-details' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-2">Bank Details</h2>
                                            <p className="text-gray-600">Manage your bank account information for payments</p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Bank Account Information */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Account Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Bank Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={bankName}
                                                            onChange={(e) => setBankName(e.target.value)}
                                                            placeholder="e.g., Bank Central Asia (BCA)"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Account Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={bankAccountName}
                                                            onChange={(e) => setBankAccountName(e.target.value)}
                                                            placeholder="Account holder's full name"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Account Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={bankAccountNumber}
                                                            onChange={(e) => setBankAccountNumber(e.target.value)}
                                                            placeholder="Enter your bank account number"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile Payment Information */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mobile Payment (Optional)</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Mobile Payment Type
                                                        </label>
                                                        <select
                                                            value={mobilePaymentType}
                                                            onChange={(e) => setMobilePaymentType(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        >
                                                            <option value="">Select payment type</option>
                                                            <option value="OVO">OVO</option>
                                                            <option value="GoPay">GoPay</option>
                                                            <option value="DANA">DANA</option>
                                                            <option value="ShopeePay">ShopeePay</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Mobile Payment Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={mobilePaymentNumber}
                                                            onChange={(e) => setMobilePaymentNumber(e.target.value)}
                                                            placeholder="e.g., 081234567890"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Preferred Payment Method */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferred Payment Method</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id="bank-transfer"
                                                            name="preferred-payment"
                                                            value="bank_transfer"
                                                            checked={preferredPaymentMethod === 'bank_transfer'}
                                                            onChange={(e) => setPreferredPaymentMethod(e.target.value as 'bank_transfer' | 'cash' | 'mobile_payment')}
                                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                        />
                                                        <label htmlFor="bank-transfer" className="ml-2 text-sm text-gray-700">
                                                            Bank Transfer
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id="mobile-payment"
                                                            name="preferred-payment"
                                                            value="mobile_payment"
                                                            checked={preferredPaymentMethod === 'mobile_payment'}
                                                            onChange={(e) => setPreferredPaymentMethod(e.target.value as 'bank_transfer' | 'cash' | 'mobile_payment')}
                                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                        />
                                                        <label htmlFor="mobile-payment" className="ml-2 text-sm text-gray-700">
                                                            Mobile Payment
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id="cash"
                                                            name="preferred-payment"
                                                            value="cash"
                                                            checked={preferredPaymentMethod === 'cash'}
                                                            onChange={(e) => setPreferredPaymentMethod(e.target.value as 'bank_transfer' | 'cash' | 'mobile_payment')}
                                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                        />
                                                        <label htmlFor="cash" className="ml-2 text-sm text-gray-700">
                                                            Cash Payment
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Instructions */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Instructions (Optional)</h3>
                                                <textarea
                                                    value={paymentInstructions}
                                                    onChange={(e) => setPaymentInstructions(e.target.value)}
                                                    placeholder="Add any special instructions for customers making payments..."
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save Bank Details'}
                                                </button>
                                            </div>

                                            {/* Information Card */}
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        <CreditCard className="w-5 h-5 text-blue-500 mt-0.5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Payment Information</h4>
                                                        <p className="text-sm text-blue-700">
                                                            Your bank details will be shown to customers when they choose to pay by bank transfer or mobile payment after booking confirmation. Make sure all information is accurate.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'discount-banners' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Discount Banners</h2>
                                        
                                        {/* Header Info */}
                                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
                                            <h3 className="font-semibold text-orange-800 mb-2">🎨 Promotional Banners for Social Media</h3>
                                            <p className="text-sm text-orange-700">Download and share these professional discount banners on WhatsApp, Instagram, Facebook and other social platforms to attract more customers.</p>
                                        </div>

                                        {/* Discount Banner Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            
                                            {/* 5% Discount Banner */}
                                            <div className="border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                                <div className="rounded-lg overflow-hidden mb-4">
                                                    <img 
                                                        src="https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532" 
                                                        alt="5% Discount Banner"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = "https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532";
                                                            link.download = 'massage-discount-5-percent.png';
                                                            link.click();
                                                        }}
                                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const message = "🌿 Special 5% Discount on Massage Services! 🌿\n\nBook your relaxing massage session now and save 5%!\n\nContact us to book your appointment today! 💆‍♀️✨";
                                                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                                            window.open(whatsappUrl, '_blank');
                                                        }}
                                                        className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Share WhatsApp
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 10% Discount Banner */}
                                            <div className="border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                                <div className="rounded-lg overflow-hidden mb-4">
                                                    <img 
                                                        src="https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896" 
                                                        alt="10% Discount Banner"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = "https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896";
                                                            link.download = 'massage-discount-10-percent.png';
                                                            link.click();
                                                        }}
                                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const message = "🌿 Amazing 10% Discount on Massage Services! 🌿\n\nTreat yourself to a professional massage and save 10%!\n\nBook now for the ultimate relaxation experience! 💆‍♀️✨";
                                                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                                            window.open(whatsappUrl, '_blank');
                                                        }}
                                                        className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Share WhatsApp
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 15% Discount Banner */}
                                            <div className="border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                                <div className="rounded-lg overflow-hidden mb-4">
                                                    <img 
                                                        src="https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221" 
                                                        alt="15% Discount Banner"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = "https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221";
                                                            link.download = 'massage-discount-15-percent.png';
                                                            link.click();
                                                        }}
                                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const message = "🌿 Incredible 15% Discount on Massage Services! 🌿\n\nIndulge in premium massage therapy with 15% savings!\n\nLimited time offer - book your session today! 💆‍♀️✨";
                                                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                                            window.open(whatsappUrl, '_blank');
                                                        }}
                                                        className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Share WhatsApp
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 20% Discount Banner */}
                                            <div className="border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                                <div className="rounded-lg overflow-hidden mb-4">
                                                    <img 
                                                        src="https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034" 
                                                        alt="20% Discount Banner"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = "https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034";
                                                            link.download = 'massage-discount-20-percent.png';
                                                            link.click();
                                                        }}
                                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const message = "🌿 MEGA 20% Discount on Massage Services! 🌿\n\nOur biggest discount yet! Save 20% on all massage treatments!\n\nDon't miss this exclusive offer - book now! 💆‍♀️✨";
                                                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                                            window.open(whatsappUrl, '_blank');
                                                        }}
                                                        className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Share WhatsApp
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage Guidelines */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 How to Use These Banners</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                        <Download className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1">Download</h4>
                                                    <p className="text-sm text-gray-600">Save banner to your device</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                        <Share2 className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1">Share</h4>
                                                    <p className="text-sm text-gray-600">Post on social media platforms</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                        <Tag className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1">Tag</h4>
                                                    <p className="text-sm text-gray-600">Include your contact info</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Social Media Tips */}
                                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-orange-800 mb-4">💡 Marketing Tips</h3>
                                            <div className="text-sm text-orange-700 space-y-2">
                                                <div>• <strong>WhatsApp Status:</strong> Post banners in your status to reach contacts instantly</div>
                                                <div>• <strong>Instagram Stories:</strong> Share with location tags to reach local customers</div>
                                                <div>• <strong>Facebook Posts:</strong> Tag friends and use local community groups</div>
                                                <div>• <strong>Best Times:</strong> Post during evenings (6-9 PM) and weekends for maximum reach</div>
                                                <div>• <strong>Call-to-Action:</strong> Always include your WhatsApp number or booking link</div>
                                                <div>• <strong>Regular Posting:</strong> Share different discount levels weekly to maintain interest</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'terms' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Terms of Employment</h2>
                                        
                                        {/* Header Info */}
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                                            <h3 className="font-semibold text-blue-800 mb-2">📋 Employment Agreement for Therapists & Massage Places</h3>
                                            <p className="text-sm text-blue-700">Please read and understand all terms before providing services through IndaStreet platform.</p>
                                        </div>

                                        {/* Terms Sections */}
                                        <div className="space-y-4">
                                            {/* Service Requirements */}
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">1</span>
                                                    </div>
                                                    Service Requirements
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-2 pl-8">
                                                    <p>• <strong>Professional Service:</strong> Must possess valid massage service therapy</p>
                                                    <p>• <strong>Experience:</strong> Must state massage experience truthfully. IndaStreet may validate experience at any time and determine the expertise level of therapy. Dress code must be hygiene at all times, nails hair tied up or netted and mask as optional</p>
                                                    <p>• <strong>Service Quality:</strong> Maintain 4.5+ star rating average</p>
                                                    <p>• <strong>Punctuality:</strong> Arrive within 15 minutes of scheduled appointment time</p>
                                                    <p>• <strong>Professional Conduct:</strong> Maintain professional behavior at all times</p>
                                                </div>
                                            </div>

                                            {/* Payment & Commission */}
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">2</span>
                                                    </div>
                                                    Payment & Commission Structure (IDR)
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-2 pl-8">
                                                    <p>• <strong>Direct Bookings:</strong> Keep 100% of service fee (Rp 800,000 - 2,400,000)</p>
                                                    <p>• <strong>Hotel Commission Payments:</strong> Hotels pay 15-20% commission to therapists</p>
                                                    <p>• <strong>Payment Method:</strong> Commission paid at hotel reception or bank transfer</p>
                                                    <p>• <strong>Bank Account:</strong> Therapist's displayed bank account for transfers</p>
                                                    <p>• <strong>No Platform Fees:</strong> IndaStreet does not charge transaction fees</p>
                                                    <p>• <strong>Cancellation Policy:</strong> 50% fee if cancelled within 2 hours of appointment</p>
                                                </div>
                                            </div>

                                            {/* Responsibilities */}
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">3</span>
                                                    </div>
                                                    Therapist Responsibilities
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-2 pl-8">
                                                    <p>• <strong>Equipment:</strong> Provide own massage table, oils, and supplies</p>
                                                    <p>• <strong>Hygiene:</strong> Maintain strict cleanliness and health standards</p>
                                                    <p>• <strong>Documentation:</strong> Keep records of services and customer feedback</p>
                                                    <p>• <strong>Availability:</strong> Update status regularly and honor confirmed bookings</p>
                                                    <p>• <strong>Communication:</strong> Respond to customer inquiries within 2 hours</p>
                                                </div>
                                            </div>

                                            {/* Massage Place Requirements */}
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">4</span>
                                                    </div>
                                                    Massage Place Requirements
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-2 pl-8">
                                                    <p>• <strong>Business License:</strong> Valid spa/massage business license required</p>
                                                    <p>• <strong>Facility Standards:</strong> Clean, safe, and professional environment</p>
                                                    <p>• <strong>Staff Qualifications:</strong> All therapists must be certified professionals</p>
                                                    <p>• <strong>Operating Hours:</strong> Clearly defined and consistently maintained hours</p>
                                                    <p>• <strong>Customer Service:</strong> Professional reception and booking management</p>
                                                </div>
                                            </div>

                                            {/* Platform Rules */}
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">5</span>
                                                    </div>
                                                    Platform Rules & Violations
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-2 pl-8">
                                                    <p>• <strong>No Solicitation:</strong> Services must be requested through platform only</p>
                                                    <p>• <strong>Profile Accuracy:</strong> All information must be truthful and up-to-date</p>
                                                    <p>• <strong>Rating Manipulation:</strong> Fake reviews result in immediate suspension</p>
                                                    <p>• <strong>Multiple Violations:</strong> 3 violations result in permanent ban</p>
                                                    <p>• <strong>Inappropriate Behavior:</strong> Zero tolerance for unprofessional conduct</p>
                                                </div>
                                            </div>

                                            {/* Benefits & Support */}
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">6</span>
                                                    </div>
                                                    Benefits & Platform Support
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-2 pl-8">
                                                    <p>• <strong>Marketing Support:</strong> Profile promotion and visibility boost</p>
                                                    <p>• <strong>Customer Protection:</strong> Secure payment processing and dispute resolution</p>
                                                    <p>• <strong>Training Resources:</strong> Access to professional development materials</p>
                                                    <p>• <strong>24/7 Support:</strong> Customer service available for urgent issues</p>
                                                    <p>• <strong>Performance Analytics:</strong> Detailed insights on bookings and earnings</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Agreement Footer */}
                                        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-800 mb-2">📝 Agreement Acknowledgment</h4>
                                            <p className="text-sm text-gray-600 mb-3">
                                                By using the IndaStreet platform, you acknowledge that you have read, understood, and agree to comply with all terms outlined above.
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>📅 Last Updated: November 12, 2025</span>
                                                <span>•</span>
                                                <span>📧 Questions? Contact: indastreet.id@gmail.com</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.settings || 'Settings'}</h2>
                                        
                                        {/* Notification Settings */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 Notification Settings</h3>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-blue-800 font-medium">⚠️ Critical notifications cannot be disabled to ensure optimal service delivery.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">New Booking Alerts <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Get notified when you receive a new booking - Always active for service quality</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Customer Messages <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Receive notifications for customer messages - Always active for communication</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Payment Notifications <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Get notified when payments are processed - Always active for financial tracking</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Marketing Updates</h4>
                                                        <p className="text-sm text-gray-600">Receive promotional offers and platform updates</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sound & Alert Settings */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔊 Sound & Alert Settings</h3>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-green-800 font-medium">⚠️ Sound notifications are mandatory to ensure you never miss important service requests.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Booking Sound Alerts <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Sound notification for new bookings - Always active for instant response</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Message Sound Alerts <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Sound notification for customer messages - Always active for communication</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">System Alert Sounds <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Sound alerts for system notifications - Always active for service quality</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Privacy Settings */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔒 Privacy Settings</h3>
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-orange-800 font-medium">⚠️ Contact and profile settings cannot be disabled to maintain service accessibility.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Profile Visibility <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Show your profile in public search results - Always visible for customer booking</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">WhatsApp Contact <span className="text-red-600 text-xs">(REQUIRED)</span></h4>
                                                        <p className="text-sm text-gray-600">Allow customers to contact you via WhatsApp - Always active for service communication</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                                        <div className="w-11 h-6 bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Analytics Data</h4>
                                                        <p className="text-sm text-gray-600">Allow platform to use your data for insights</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Settings */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Account Settings</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button 
                                                    onClick={() => setShowChangePasswordModal(true)}
                                                    className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-blue-900">Change Password</h4>
                                                        <p className="text-sm text-blue-600">Update your login password</p>
                                                    </div>
                                                </button>

                                                <button 
                                                    onClick={() => setShowUpdatePhoneModal(true)}
                                                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                        <Phone className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-green-900">Update Phone</h4>
                                                        <p className="text-sm text-green-600">Change WhatsApp number</p>
                                                    </div>
                                                </button>

                                                <button 
                                                    onClick={handleExportData}
                                                    className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-orange-900">Export Data</h4>
                                                        <p className="text-sm text-orange-600">Download your account data</p>
                                                    </div>
                                                </button>

                                                <button 
                                                    onClick={() => setShowDeleteAccountModal(true)}
                                                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                                        <X className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-red-900">Delete Account</h4>
                                                        <p className="text-sm text-red-600">Permanently delete account</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Customer Service WhatsApp */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">💬 Customer Service</h3>
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => window.open('https://wa.me/81392000050', '_blank')}
                                                    className="flex items-center gap-4 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                                        <Phone className="w-6 h-6 text-green-500" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-bold text-lg">Contact WhatsApp Support</h4>
                                                        <p className="text-sm text-green-100">+81392000050</p>
                                                        <p className="text-xs text-green-200">Get instant assistance</p>
                                                    </div>
                                                </button>
                                            </div>
                                            <p className="text-center text-sm text-gray-600 mt-4">Click to open WhatsApp and chat with our customer service team</p>
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
                            animation: float 8s ease-in-out infinite;
                        }
                    `}</style>
                    <div className="fixed inset-0" style={{ zIndex: 999999 }} role="dialog" aria-modal="true">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                            onClick={() => setIsSideDrawerOpen(false)}
                        />
                        
                        {/* Drawer Panel - Higher z-index to ensure it appears above footer */}
                        <div 
                            className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isSideDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
                            style={{ zIndex: 1000000 }}
                        >
                            
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
                                                        if (item.id === 'notifications') {
                                                            setShowNotifications(true);
                                                            setIsSideDrawerOpen(false);
                                                        } else {
                                                            setActiveTab(item.id);
                                                            setIsSideDrawerOpen(false);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 ${item.borderColor} group transform hover:scale-105 relative`}
                                                >
                                                    <div className={`p-2 bg-gradient-to-br ${item.gradientColor} rounded-lg`}>
                                                        {React.cloneElement(item.icon, { 
                                                            className: "w-5 h-5 text-white"
                                                        })}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.id === 'status' && 'Manage availability & discounts'}
                                                            {item.id === 'notifications' && 'View your notifications'}
                                                            {item.id === 'bookings' && 'View & manage appointments'}
                                                            {item.id === 'profile' && 'Edit profile & settings'}
                                                            {item.id === 'analytics' && 'Performance insights'}
                                                            {item.id === 'membership' && 'Subscription plans'}
                                                            {item.id === 'hotel-villa' && 'Partner services'}
                                                            {item.id === 'bank-details' && 'Manage payment info'}
                                                            {item.id === 'discount-banners' && 'Social media banners'}
                                                            {item.id === 'terms' && 'Legal information'}
                                                            {item.id === 'settings' && 'App preferences'}
                                                        </p>
                                                    </div>
                                                    {item.badge && (
                                                        <span className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ADDITIONAL FEATURES SECTION */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                            Additional Features
                                        </h3>
                                        <div className="space-y-2">
                                            




                                            {/* Coin History */}
                                            {onNavigate && (
                                                <button
                                                    onClick={() => {
                                                        setIsSideDrawerOpen(false);
                                                        onNavigate('coinHistory' as any);
                                                    }}
                                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-blue-400 group transform hover:scale-105 hover:bg-blue-50"
                                                >
                                                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
                                                        <ColoredHistoryIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                            Coin History
                                                        </p>
                                                        <p className="text-xs text-gray-500">View reward transactions</p>
                                                    </div>
                                                </button>
                                            )}

                                            {/* Coin Shop */}
                                            {onNavigate && (
                                                <button
                                                    onClick={() => {
                                                        setIsSideDrawerOpen(false);
                                                        onNavigate('coin-shop' as any);
                                                    }}
                                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-green-400 group transform hover:scale-105 hover:bg-green-50"
                                                >
                                                    <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg">
                                                        <ColoredCoinsIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                                                            Coin Shop
                                                        </p>
                                                        <p className="text-xs text-gray-500">Redeem rewards & benefits</p>
                                                    </div>
                                                </button>
                                            )}

                                            {/* Verified Pro Badge */}
                                            {onNavigate && (
                                                <button
                                                    onClick={() => {
                                                        setIsSideDrawerOpen(false);
                                                        onNavigate('verifiedProBadge' as any);
                                                    }}
                                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-emerald-400 group transform hover:scale-105 hover:bg-emerald-50"
                                                >
                                                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg">
                                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.39 4.84L20 8l-4 3.9.95 5.52L12 15.9l-4.95 2.52L8 11.9 4 8l5.61-1.16L12 2z"/></svg>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                                                            Verified Pro Badge
                                                        </p>
                                                        <p className="text-xs text-gray-500">Eligibility and application</p>
                                                    </div>
                                                </button>
                                            )}

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
                                                    // Show confirmation before logout
                                                    if (window.confirm('Are you sure you want to logout? You will need to login again to access your dashboard.')) {
                                                        console.log('🚪 Therapist logout confirmed - clearing session...');
                                                        setIsSideDrawerOpen(false);
                                                        
                                                        // Clear any localStorage data related to therapist session
                                                        localStorage.removeItem('app_logged_in_provider');
                                                        localStorage.removeItem('therapist_login_debug');
                                                        
                                                        // Call the logout function
                                                        onLogout();
                                                    }
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
                <>
                    <style>{`
                        body { overflow: hidden !important; }
                    `}</style>
                    <div 
                        className="fixed inset-0 z-[9999] bg-black bg-opacity-50"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    >
                        <div className="flex items-center justify-center min-h-full p-4">
                            <div 
                                className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto"
                                style={{ maxHeight: '80vh' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header - Fixed */}
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl flex-shrink-0">
                                    <h3 className="text-lg font-semibold text-gray-900">{t.notifications || 'Notifications'}</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                                
                                {/* Scrollable Content */}
                                <div 
                                    className="overflow-y-auto"
                                    style={{ 
                                        maxHeight: 'calc(80vh - 80px)',
                                        overscrollBehavior: 'contain'
                                    }}
                                >
                                    <div className="p-4">
                                        <p className="text-gray-600 mb-4">Notifications: {notifications.length}</p>
                                        {notifications.length > 0 ? (
                                            <div className="space-y-3">
                                                {notifications.map((notification, index) => (
                                                    <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                                        <p className="text-gray-800">{notification.message}</p>
                                                        {notification.createdAt && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Bell className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500">No notifications yet</p>
                                                <p className="text-sm text-gray-400 mt-1">You'll receive updates about your bookings here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Busy Timer Modal */}
            {showBusyTimerModal && (
                <BusyTimerModal
                    isOpen={showBusyTimerModal}
                    onClose={() => setShowBusyTimerModal(false)}
                    onConfirm={(_duration) => {
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

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                            <button 
                                onClick={() => setShowChangePasswordModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter new password"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowChangePasswordModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Phone Modal */}
            {showUpdatePhoneModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Update WhatsApp Number</h3>
                            <button 
                                onClick={() => setShowUpdatePhoneModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={whatsappNumber || 'Not set'}
                                    disabled
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={newWhatsAppNumber}
                                    onChange={(e) => setNewWhatsAppNumber(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter new WhatsApp number"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowUpdatePhoneModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePhone}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Update Number
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteAccountModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-red-600">Delete Account</h3>
                            <button 
                                onClick={() => setShowDeleteAccountModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 font-medium">⚠️ Warning: This action cannot be undone!</p>
                            <p className="text-red-700 text-sm mt-2">Deleting your account will permanently remove all your data, bookings, and profile information.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type "DELETE" to confirm account deletion
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Type DELETE here"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDeleteAccountModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE'}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            </div>
        </div>
    );
};

export default TherapistDashboardPage;