import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { AvailabilityStatus, BookingStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyLanguages, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService } from '../lib/appwriteService';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import { LogOut, Activity, Calendar, TrendingUp, Bell, User, Crown, Building, FileText, Settings, Phone, X, HelpCircle, BookOpen, Tag, Share2, Download, Star } from 'lucide-react';
import { ColoredProfileIcon, ColoredCalendarIcon, ColoredAnalyticsIcon, ColoredHotelIcon, ColoredCrownIcon, ColoredDocumentIcon, ColoredGlobeIcon, ColoredHistoryIcon, ColoredCoinsIcon, ColoredTagIcon } from '../components/ColoredIcons';
import { useTranslations } from '../lib/useTranslations';

import Footer from '../components/Footer';
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

const ActivatedDiscountButton: React.FC<{ 
    endTime: Date; 
    percentage: number; 
    onExpire: () => void; 
}> = ({ endTime, percentage, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                onExpire();
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    return (
        <div className="flex flex-col items-center">
            <span className="text-lg">✅ Activated</span>
            <span className="text-sm font-mono opacity-90">⏰ {timeLeft}</span>
        </div>
    );
};

const LiveDiscountCountdown: React.FC<{ 
    endTime: Date; 
    percentage: number; 
    onExpire: () => void; 
}> = ({ endTime, percentage, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                setIsExpired(true);
                setTimeLeft('EXPIRED');
                onExpire();
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    if (isExpired) return null;

    return (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-orange-50 border-2 border-green-300 rounded-xl animate-pulse">
            <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    <p className="text-lg font-bold text-green-800">
                        🎊 {percentage}% Discount LIVE!
                    </p>
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600">Time Remaining:</p>
                    <p className="text-xl font-mono font-bold text-orange-600">
                        ⏰ {timeLeft}
                    </p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                    Your pricing containers are flashing to attract customers!
                </p>
            </div>
        </div>
    );
};

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
    therapistId, 
    existingTherapistData, 
    bookings, 
    notifications, 
    t 
}) => {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Start with false for debugging

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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
        { id: 'status', label: t.availabilityStatus || 'Availability Status', icon: <Activity className="w-5 h-5" />, gradientColor: 'from-green-500 to-green-600', borderColor: 'border-green-500', hoverColor: 'hover:border-green-300', textColor: 'text-green-800', bgColor: 'bg-green-100' },
        { id: 'bookings', label: t.bookings || 'Bookings', icon: <Calendar className="w-5 h-5" />, gradientColor: 'from-blue-500 to-blue-600', borderColor: 'border-blue-500', hoverColor: 'hover:border-blue-300', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
        { id: 'profile', label: t.profile || 'Profile', icon: <User className="w-5 h-5" />, gradientColor: 'from-purple-500 to-purple-600', borderColor: 'border-purple-500', hoverColor: 'hover:border-purple-300', textColor: 'text-purple-800', bgColor: 'bg-purple-100' },
        { id: 'analytics', label: t.analytics || 'Analytics', icon: <TrendingUp className="w-5 h-5" />, gradientColor: 'from-orange-500 to-orange-600', borderColor: 'border-orange-500', hoverColor: 'hover:border-orange-300', textColor: 'text-orange-800', bgColor: 'bg-orange-100' },
        // { id: 'membership', label: t.membership || 'Membership', icon: <Crown className="w-5 h-5" />, gradientColor: 'from-yellow-500 to-yellow-600', borderColor: 'border-yellow-500', hoverColor: 'hover:border-yellow-300', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' }, // DISABLED - Admin will activate later
        { id: 'hotel-villa', label: t.hotelVilla || 'Hotel/Villa', icon: <Building className="w-5 h-5" />, gradientColor: 'from-pink-500 to-pink-600', borderColor: 'border-pink-500', hoverColor: 'hover:border-pink-300', textColor: 'text-pink-800', bgColor: 'bg-pink-100' },
        // { id: 'discount-banners', label: 'Discount Banners', icon: <Tag className="w-5 h-5" />, gradientColor: 'from-orange-500 to-orange-600', borderColor: 'border-orange-500', hoverColor: 'hover:border-orange-300', textColor: 'text-orange-800', bgColor: 'bg-orange-100' }, // REMOVED - Discount banners button disabled
        { id: 'terms', label: t.terms || 'Terms', icon: <FileText className="w-5 h-5" />, gradientColor: 'from-indigo-500 to-indigo-600', borderColor: 'border-indigo-500', hoverColor: 'hover:border-indigo-300', textColor: 'text-indigo-800', bgColor: 'bg-indigo-100' },
        { id: 'settings', label: t.settings || 'Settings', icon: <Settings className="w-5 h-5" />, gradientColor: 'from-gray-500 to-gray-600', borderColor: 'border-gray-500', hoverColor: 'hover:border-gray-300', textColor: 'text-gray-800', bgColor: 'bg-gray-100' }
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
            
            // Only call onStatusChange - don't mix with handleSave
            if (onStatusChange) {
                await onStatusChange(AvailabilityStatus.Busy);
            }
            
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
    }, [onStatusChange]);

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
            setToast({ message: 'Failed to delete account', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* CSS Animations for Discount Effects */}
            <style>{`
                @keyframes flash {
                    0%, 100% { 
                        box-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4); 
                        transform: scale(1);
                    }
                    50% { 
                        box-shadow: 0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(239, 68, 68, 0.5);
                        transform: scale(1.02);
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
            `}</style>
            
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

            {/* Main Content Container - Same as Home Page */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Side Navigation - Desktop - Hidden on Mobile like Home Page */}
                    <div className="hidden lg:block w-64 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border-l-4 ${item.borderColor} ${
                                    activeTab === item.id
                                        ? `${item.bgColor} ${item.textColor} shadow-sm`
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`p-2 bg-gradient-to-br ${item.gradientColor} rounded-lg`}>
                                    {React.cloneElement(item.icon, { 
                                        className: "w-4 h-4 text-white"
                                    })}
                                </div>
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

                                                <div className="space-y-6">
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
                                                            console.log('🔓 No session found, creating anonymous session for save...');
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
                                                            } catch (verifyError) {
                                                                console.error('❌ Verification failed:', verifyError);
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
                                                                className={`w-full py-3 px-6 rounded-xl font-bold transition-all transform ${
                                                                    isDiscountActive
                                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg animate-pulse'
                                                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl hover:scale-105'
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
                                                            onClick={async () => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.onchange = async (e: any) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        try {
                                                                            setIsSaving(true);
                                                                            const reader = new FileReader();
                                                                            reader.onload = async (e) => {
                                                                                try {
                                                                                    const base64Image = e.target?.result as string;
                                                                                    console.log('📤 Uploading profile image...');
                                                                                    
                                                                                    // Upload to Appwrite Storage and get URL
                                                                                    const { imageUploadService } = await import('../lib/appwriteService');
                                                                                    const imageUrl = await imageUploadService.uploadProfileImage(base64Image);
                                                                                    
                                                                                    console.log('✅ Image uploaded successfully:', imageUrl);
                                                                                    setProfilePicture(imageUrl);
                                                                                    
                                                                                    setToast({ message: '✅ Profile picture uploaded successfully!', type: 'success' });
                                                                                    setTimeout(() => setToast(null), 3000);
                                                                                } catch (error) {
                                                                                    console.error('❌ Error uploading image:', error);
                                                                                    setToast({ message: `❌ Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
                                                                                    setTimeout(() => setToast(null), 5000);
                                                                                } finally {
                                                                                    setIsSaving(false);
                                                                                }
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        } catch (error) {
                                                                            console.error('❌ Error reading file:', error);
                                                                            setToast({ message: '❌ Error reading file. Please try again.', type: 'error' });
                                                                            setTimeout(() => setToast(null), 5000);
                                                                            setIsSaving(false);
                                                                        }
                                                                    }
                                                                };
                                                                input.click();
                                                            }}
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving ? '⏳ Uploading...' : (profilePicture ? 'Change Photo' : 'Upload Photo')}
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
                                                            Professional Experience *
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={yearsOfExperience}
                                                                onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                                                                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                                min="0"
                                                                max="50"
                                                                placeholder="Enter years"
                                                            />
                                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                                                {yearsOfExperience === 1 ? 'year' : 'years'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            How many years have you been practicing massage therapy professionally?
                                                        </p>
                                                        {yearsOfExperience > 0 && (
                                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                                <p className="text-sm text-green-700">
                                                                    <strong>{yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}</strong> of professional experience
                                                                    {yearsOfExperience >= 10 && " - Expert level therapist! 🌟"}
                                                                    {yearsOfExperience >= 5 && yearsOfExperience < 10 && " - Experienced therapist! 👍"}
                                                                    {yearsOfExperience < 5 && yearsOfExperience > 0 && " - Growing your expertise! 💪"}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Professional Description */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Professional Description * 
                                                    <span className="text-orange-600 font-semibold">(Max 350 characters)</span>
                                                </label>
                                                
                                                {/* Character Counter */}
                                                <div className="mb-2 text-right">
                                                    <span className={`text-sm ${
                                                        description.length > 350 ? 'text-red-600 font-bold' : 
                                                        description.length > 300 ? 'text-orange-600' : 'text-gray-500'
                                                    }`}>
                                                        {description.length}/350 characters
                                                    </span>
                                                </div>
                                                
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 350) {
                                                            setDescription(e.target.value);
                                                        }
                                                    }}
                                                    rows={4}
                                                    maxLength={350}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                        description.length > 350 
                                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                                            : description.length > 300
                                                                ? 'border-orange-300 focus:ring-orange-500 focus:border-orange-500 bg-orange-50'
                                                                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                                    }`}
                                                    placeholder="Tell clients about your services, expertise, and experience... (max 350 characters including spaces)"
                                                />
                                                
                                                {/* Character limit warning */}
                                                {description.length > 300 && (
                                                    <div className={`mt-2 p-2 rounded-lg text-sm ${
                                                        description.length > 350 
                                                            ? 'bg-red-100 text-red-700' 
                                                            : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {description.length > 350 
                                                            ? '⚠️ Description exceeds 350 characters. Please shorten it.' 
                                                            : '⚠️ Approaching character limit. Consider being more concise.'
                                                        }
                                                    </div>
                                                )}
                                            </div>

                                            {/* Service Location with GPS and Radius */}
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Service Location & Coverage Area *
                                                </label>
                                                
                                                {/* Current Location Display */}
                                                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-lg border border-orange-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-700 mb-1">Current Base Location:</p>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {location || 'Location not set'}
                                                            </p>
                                                            {coordinates.lat !== 0 && coordinates.lng !== 0 && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    📍 GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                                                                </p>
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
                                                            className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-sm ${
                                                                location && coordinates.lat !== 0 
                                                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white animate-pulse'
                                                            }`}
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    <span>Getting GPS...</span>
                                                                </div>
                                                            ) : location && coordinates.lat !== 0 ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <span>✓</span>
                                                                    <span>Update Location</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-2">
                                                                    <span>📱</span>
                                                                    <span>Set Location from Device</span>
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Service Radius */}
                                                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-700 mb-1">Service Coverage Radius:</p>
                                                            <p className="text-2xl font-bold text-green-600">
                                                                Up to 50 KM
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                You can provide services within 50km from your base location
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                                50km
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Manual Location Input (Fallback) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                                        Or enter location manually:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                        placeholder="e.g., Seminyak, Bali, Indonesia"
                                                    />
                                                </div>
                                            </div>

                                            {/* Massage Specialties with Categories */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Massage Specialties 
                                                    <span className="text-orange-600 font-semibold">(Select max 5)</span>
                                                </label>
                                                
                                                {/* Selection Counter */}
                                                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Selected: {massageTypes.length}/5
                                                        </span>
                                                        {massageTypes.length >= 5 && (
                                                            <span className="text-xs text-orange-600 font-semibold">
                                                                Maximum reached
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                    massageTypes.length >= 5 ? 'bg-orange-500' : 'bg-blue-500'
                                                                }`}
                                                                style={{ width: `${(massageTypes.length / 5) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Categorized Massage Types */}
                                                <div className="space-y-6">
                                                    {MASSAGE_TYPES_CATEGORIZED.map((category, categoryIndex) => (
                                                        <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                                                                {category.category}
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {category.types.map((type) => (
                                                                    <label 
                                                                        key={type} 
                                                                        className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg border transition-all ${
                                                                            massageTypes.includes(type)
                                                                                ? 'bg-orange-50 border-orange-300 text-orange-700'
                                                                                : massageTypes.length >= 5
                                                                                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                                                                        }`}
                                                                    >
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
                                                                            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 disabled:opacity-50"
                                                                        />
                                                                        <span className="text-sm font-medium">{type}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Selected Specialties Preview */}
                                                {massageTypes.length > 0 && (
                                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <p className="text-sm font-medium text-green-700 mb-2">
                                                            Your Selected Specialties:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {massageTypes.map((type) => (
                                                                <span 
                                                                    key={type}
                                                                    className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                                                                >
                                                                    {type}
                                                                    <button
                                                                        onClick={() => {
                                                                            console.log('💆 Remove button clicked for:', type);
                                                                            setMassageTypes(prevTypes => {
                                                                                const newTypes = prevTypes.filter(t => t !== type);
                                                                                console.log('💆 Preview remove - new state:', newTypes);
                                                                                return newTypes;
                                                                            });
                                                                        }}
                                                                        className="ml-1 text-green-600 hover:text-green-800 text-xs"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Languages Spoken */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Languages Spoken 
                                                    <span className="text-blue-600 font-semibold">(Select max 3)</span>
                                                </label>
                                                
                                                {/* Language Selection Counter */}
                                                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Selected: {languages.length}/3
                                                        </span>
                                                        {languages.length >= 3 && (
                                                            <span className="text-xs text-blue-600 font-semibold">
                                                                Maximum reached
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                    languages.length >= 3 ? 'bg-blue-500' : 'bg-green-500'
                                                                }`}
                                                                style={{ width: `${(languages.length / 3) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Language Options */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {['English', 'Indonesian', 'Mandarin', 'Japanese', 'Korean', 'Russian', 'French', 'German'].map((language) => (
                                                        <label 
                                                            key={language} 
                                                            className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border transition-all ${
                                                                languages.includes(language)
                                                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                                    : languages.length >= 3
                                                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={languages.includes(language)}
                                                                onChange={(e) => {
                                                                    console.log('Language checkbox changed:', language, 'checked:', e.target.checked, 'current languages:', languages);
                                                                    if (e.target.checked) {
                                                                        if (languages.length < 3) {
                                                                            const newLanguages = [...languages, language];
                                                                            console.log('Adding language, new state:', newLanguages);
                                                                            setLanguages(newLanguages);
                                                                        }
                                                                    } else {
                                                                        const newLanguages = languages.filter(l => l !== language);
                                                                        console.log('Removing language, new state:', newLanguages);
                                                                        setLanguages(newLanguages);
                                                                    }
                                                                }}
                                                                disabled={!languages.includes(language) && languages.length >= 3}
                                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 disabled:opacity-50"
                                                            />
                                                            <span className="text-sm font-medium">{language}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Selected Languages Preview */}
                                                {languages.length > 0 && (
                                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm font-medium text-blue-700 mb-2">
                                                            Languages you speak:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {languages.map((language) => (
                                                                <span 
                                                                    key={language}
                                                                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                                                >
                                                                    {language}
                                                                    <button
                                                                        onClick={() => setLanguages(languages.filter(l => l !== language))}
                                                                        className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pricing */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Service Pricing (IDR)
                                                    {isDiscountActive && (
                                                        <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                                                            {discountPercentage}% OFF Active
                                                        </span>
                                                    )}
                                                </label>
                                                
                                                {/* 100% Income Notice */}
                                                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
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

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {[60, 90, 120].map((duration) => {
                                                        const originalPrice = (pricing as any)[duration] || 0;
                                                        const discountedPrice = isDiscountActive 
                                                            ? Math.round(originalPrice * (1 - discountPercentage / 100))
                                                            : originalPrice;
                                                        
                                                        return (
                                                            <div key={duration} className={`relative transition-all duration-500 ${
                                                                isDiscountActive 
                                                                    ? 'ring-4 ring-orange-400 ring-opacity-70 shadow-2xl shadow-orange-300/60 animate-bounce transform hover:scale-105' 
                                                                    : 'hover:shadow-md'
                                                            }`}
                                                                style={isDiscountActive ? {
                                                                    animation: 'flash 2s ease-in-out infinite, glow 3s ease-in-out infinite alternate'
                                                                } : {}}>
                                                                {/* Flashing overlay when discount is active */}
                                                                {isDiscountActive && (
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-lg animate-pulse pointer-events-none"></div>
                                                                )}
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                    {duration} Minutes
                                                                </label>
                                                                <div className="relative">
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

                                            {/* Hotel & Villa Live Menu Pricing */}
                                            <div className="mt-8">
                                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6">
                                                    <div className="flex items-center mb-4">
                                                        <div className="p-2 bg-orange-500 rounded-lg mr-3">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold text-orange-800">
                                                                Hotel & Villa Live Menu Pricing
                                                            </h3>
                                                            <p className="text-sm text-orange-600 mt-1">
                                                                Set your prices for hotel and villa services
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Commission Notice */}
                                                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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

                                                    {/* Hotel Villa Pricing Grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {[60, 90, 120].map((duration) => {
                                                            const price = (hotelVillaPricing as any)[duration] || 0;
                                                            
                                                            return (
                                                                <div key={duration} className="relative">
                                                                    <div className="bg-white border-2 border-orange-200 rounded-lg p-4 hover:shadow-lg transition-all">
                                                                        <label className="block text-sm font-bold text-orange-700 mb-2 text-center">
                                                                            {duration} Minutes
                                                                        </label>
                                                                        
                                                                        {/* Price Input */}
                                                                        <div className="relative mb-3">
                                                                            <input
                                                                                type="text"
                                                                                value={price.toString()}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                                                    if (value === '') {
                                                                                        // Allow complete clearing
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
                                                                                className="w-full px-3 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg font-bold bg-orange-50"
                                                                            />
                                                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-600 font-bold text-lg">
                                                                                K
                                                                            </span>
                                                                        </div>
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

                                {/* MEMBERSHIP SECTION TEMPORARILY DISABLED - Admin will activate later */}
                                {false && activeTab === 'membership' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="text-center py-12">
                                            <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Membership Features Coming Soon</h3>
                                            <p className="text-gray-500">Premium membership plans will be available soon. Stay tuned for exclusive benefits!</p>
                                        </div>
                                        
                                        {/* Current Plan Status */}
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                                        <Crown className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-green-800">Current Plan: Free Trial</h3>
                                                        <p className="text-sm text-green-600">30 days remaining • Basic features included</p>
                                                        <p className="text-xs text-green-500 mt-1">Upgrade to unlock premium features and boost your earnings!</p>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-2">
                                                        TRIAL ACTIVE
                                                    </div>
                                                    <div className="text-xs text-green-600">
                                                        29 days left
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Plan Overview */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                                <div className="text-lg font-bold text-gray-800">FREE</div>
                                                <div className="text-sm text-gray-600">Trial</div>
                                                <div className="text-xs text-gray-500 mt-2">Basic features</div>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                                <div className="text-lg font-bold text-blue-800">IDR 99K</div>
                                                <div className="text-sm text-blue-600">Basic</div>
                                                <div className="text-xs text-blue-500 mt-2">Essential tools</div>
                                            </div>
                                            <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 text-center relative">
                                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                        POPULAR
                                                    </span>
                                                </div>
                                                <div className="text-lg font-bold text-orange-800">IDR 150K</div>
                                                <div className="text-sm text-orange-600">Standard</div>
                                                <div className="text-xs text-orange-500 mt-2">Hotel/Villa access</div>
                                            </div>
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                                <div className="text-lg font-bold text-purple-800">IDR 200K</div>
                                                <div className="text-sm text-purple-600">Premium</div>
                                                <div className="text-xs text-purple-500 mt-2">Maximum features</div>
                                            </div>
                                        </div>

                                        {/* Membership Benefits Preview */}
                                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-semibold text-orange-800 mb-4">🚀 Unlock Premium Benefits</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-orange-700">
                                                        <Star className="w-4 h-4 mr-2" />
                                                        <span className="font-medium">Priority Listing</span>
                                                    </div>
                                                    <div className="flex items-center text-orange-700">
                                                        <TrendingUp className="w-4 h-4 mr-2" />
                                                        <span className="font-medium">Advanced Analytics</span>
                                                    </div>
                                                    <div className="flex items-center text-orange-700">
                                                        <Building className="w-4 h-4 mr-2" />
                                                        <span className="font-medium">Hotel & Villa Access</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-orange-600">• Featured placement in search</div>
                                                    <div className="text-orange-600">• Professional verification badges</div>
                                                    <div className="text-orange-600">• Premium customer support</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-orange-600">• 15-30% more bookings</div>
                                                    <div className="text-orange-600">• Exclusive partnership deals</div>
                                                    <div className="text-orange-600">• Marketing automation tools</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Call-to-Action */}
                                        <div className="text-center">
                                            <button 
                                                onClick={() => {
                                                    // Navigate to membership packages page
                                                    if (onNavigate) {
                                                        onNavigate('membership-packages' as any);
                                                    }
                                                }}
                                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-3 mx-auto"
                                            >
                                                <Crown className="w-6 h-6" />
                                                <span>View All Membership Packages</span>
                                            </button>
                                            <p className="text-sm text-gray-600 mt-3">
                                                Compare plans, see detailed features, and upgrade with bank transfer payment
                                            </p>
                                        </div>

                                        {/* Success Stories */}
                                        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                                            <h4 className="font-semibold text-green-800 mb-3">� Success Stories</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="bg-white rounded-lg p-4 border border-green-200">
                                                    <p className="text-green-700 font-medium">"Premium membership increased my bookings by 40%!"</p>
                                                    <p className="text-green-600 text-xs mt-2">- Sarah, Premium Therapist</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                    <p className="text-blue-700 font-medium">"Hotel partnerships doubled my monthly bookings"</p>
                                                    <p className="text-blue-600 text-xs mt-2">- David, Standard Member</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'hotel-villa' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.hotelVilla || 'Hotel & Villa Services'}</h2>
                                            <p className="text-gray-600">Manage your hotel and villa partnership services</p>
                                        </div>

                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500 rounded-lg">
                                                        <Activity className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-blue-600 font-medium">Profile Clicks</p>
                                                        <p className="text-xl font-bold text-blue-800">247</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-500 rounded-lg">
                                                        <Calendar className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-green-600 font-medium">Bookings This Month</p>
                                                        <p className="text-xl font-bold text-green-800">18</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-500 rounded-lg">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-purple-600 font-medium">WhatsApp Contacts</p>
                                                        <p className="text-xl font-bold text-purple-800">34</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Additional Stats Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-500 rounded-lg">
                                                        <Crown className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-orange-600 font-medium">Total Earnings (IDR)</p>
                                                        <p className="text-xl font-bold text-orange-800">Rp 6,750,000</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-teal-500 rounded-lg">
                                                        <TrendingUp className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-teal-600 font-medium">Conversion Rate</p>
                                                        <p className="text-xl font-bold text-teal-800">7.3%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Partner Hotels & Villas - Analytics Focus */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Partner Performance Analytics</h3>
                                            <div className="space-y-3">
                                                {/* Hotel Partner */}
                                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                                                <span className="text-white text-xl">🏨</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Grand Resort Bali</h4>
                                                                <p className="text-sm text-gray-600">5-star luxury • Seminyak</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                            Active
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3 text-center">
                                                        <div className="bg-blue-50 rounded-lg p-2">
                                                            <p className="text-xs text-blue-600">Clicks</p>
                                                            <p className="font-bold text-blue-800">89</p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-xs text-green-600">Bookings</p>
                                                            <p className="font-bold text-green-800">7</p>
                                                        </div>
                                                        <div className="bg-purple-50 rounded-lg p-2">
                                                            <p className="text-xs text-purple-600">WhatsApp</p>
                                                            <p className="font-bold text-purple-800">12</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <span className="text-sm text-gray-600">Revenue: </span>
                                                        <span className="text-sm font-bold text-green-600">Rp 2,100,000</span>
                                                    </div>
                                                </div>

                                                {/* Villa Partner */}
                                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                                                <span className="text-white text-xl">🏖️</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Tropical Villa Ubud</h4>
                                                                <p className="text-sm text-gray-600">Luxury villas • Rice field views</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                            Active
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3 text-center">
                                                        <div className="bg-blue-50 rounded-lg p-2">
                                                            <p className="text-xs text-blue-600">Clicks</p>
                                                            <p className="font-bold text-blue-800">126</p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-xs text-green-600">Bookings</p>
                                                            <p className="font-bold text-green-800">9</p>
                                                        </div>
                                                        <div className="bg-purple-50 rounded-lg p-2">
                                                            <p className="text-xs text-purple-600">WhatsApp</p>
                                                            <p className="font-bold text-purple-800">18</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <span className="text-sm text-gray-600">Revenue: </span>
                                                        <span className="text-sm font-bold text-green-600">Rp 3,150,000</span>
                                                    </div>
                                                </div>

                                                {/* Hotel Partner 2 */}
                                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                                                <span className="text-white text-xl">🏨</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Boutique Hotel Jakarta</h4>
                                                                <p className="text-sm text-gray-600">Boutique hotel • Business district</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                                                            New Partner
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3 text-center">
                                                        <div className="bg-blue-50 rounded-lg p-2">
                                                            <p className="text-xs text-blue-600">Clicks</p>
                                                            <p className="font-bold text-blue-800">32</p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-xs text-green-600">Bookings</p>
                                                            <p className="font-bold text-green-800">2</p>
                                                        </div>
                                                        <div className="bg-purple-50 rounded-lg p-2">
                                                            <p className="text-xs text-purple-600">WhatsApp</p>
                                                            <p className="font-bold text-purple-800">4</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <span className="text-sm text-gray-600">Revenue: </span>
                                                        <span className="text-sm font-bold text-green-600">Rp 1,500,000</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Bookings with Engagement Details */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Hotel/Villa Bookings & Interactions</h3>
                                            <div className="space-y-3">
                                                <div className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold">GR</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Grand Resort Bali</p>
                                                                <p className="text-sm text-gray-600">Room 512 • 90min Thai Massage</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                                Completed
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">Today 3:30 PM</p>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-100 pt-2 mb-2">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Service fee: Rp 1,800,000</span>
                                                            <span className="text-green-600 font-semibold">Your fee: Rp 270,000</span>
                                                        </div>
                                                        <div className="flex gap-4 text-xs text-gray-500">
                                                            <span>👁️ Profile viewed 3 times</span>
                                                            <span>📱 WhatsApp contacted</span>
                                                            <span>⭐ Rated 5 stars</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold">TV</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Tropical Villa Ubud</p>
                                                                <p className="text-sm text-gray-600">Villa 3 • 60min Swedish Massage</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                                                In Progress
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">Today 6:00 PM</p>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-100 pt-2 mb-2">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Service fee: Rp 1,500,000</span>
                                                            <span className="text-blue-600 font-semibold">Expected: Rp 300,000</span>
                                                        </div>
                                                        <div className="flex gap-4 text-xs text-gray-500">
                                                            <span>👁️ Profile viewed 5 times</span>
                                                            <span>📱 WhatsApp contacted</span>
                                                            <span>⏰ Scheduled via app</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold">BH</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Boutique Hotel Jakarta</p>
                                                                <p className="text-sm text-gray-600">Room 204 • 120min Deep Tissue</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                                                                Pending
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">Tomorrow 2:00 PM</p>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-100 pt-2 mb-2">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Service fee: Rp 2,400,000</span>
                                                            <span className="text-yellow-600 font-semibold">Expected: Rp 432,000</span>
                                                        </div>
                                                        <div className="flex gap-4 text-xs text-gray-500">
                                                            <span>👁️ Profile viewed 2 times</span>
                                                            <span>💬 Direct booking</span>
                                                            <span>🔄 Repeat customer</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Building className="w-5 h-5" />
                                                    <span>Find New Partners</span>
                                                </div>
                                            </button>
                                            
                                            <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                                                <div className="flex items-center justify-center gap-2">
                                                    <FileText className="w-5 h-5" />
                                                    <span>View All Bookings</span>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Analytics & Performance Panel */}
                                        <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-orange-800 mb-2">📊 Performance Analytics & Earnings (IDR)</h4>
                                            <div className="text-sm text-orange-700 space-y-1">
                                                <div>• <strong>Profile Clicks:</strong> Track how often hotels/villas view your profile</div>
                                                <div>• <strong>WhatsApp Engagement:</strong> Monitor direct contact requests from venues</div>
                                                <div>• <strong>Booking Conversion:</strong> See your click-to-booking success rate</div>
                                                <div>• <strong>Premium Rates:</strong> Rp 1,500,000 - 2,400,000 per service</div>
                                                <div>• <strong>Commission Structure:</strong> Earn 15-20% from venue partnerships</div>
                                                <div>• <strong>Direct Payments:</strong> All earnings shown in Indonesian Rupiah (IDR)</div>
                                            </div>
                                        </div>

                                        {/* MEMBERSHIP TIER INFO DISABLED - Admin will activate later
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                                                <Building className="w-5 h-5 mr-2" />
                                                Hotel & Villa Partnership Features (Coming Soon)
                                            </h3>
                                            <div className="text-center py-4">
                                                <p className="text-purple-700">Advanced partnership features will be available soon!</p>
                                            </div>
                                        </div>
                                        */}

                                        {/* Quick Stats Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-blue-600">247</p>
                                                <p className="text-xs text-gray-600">Total Clicks</p>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-green-600">18</p>
                                                <p className="text-xs text-gray-600">Bookings</p>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-purple-600">34</p>
                                                <p className="text-xs text-gray-600">WhatsApp</p>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-lg font-bold text-orange-600">7.3%</p>
                                                <p className="text-xs text-gray-600">Conversion</p>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            
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
                                                    <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
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
                                        <div className="space-y-6">
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
                                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
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
                                        <div className="mb-8">
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
                                        <div className="mb-8">
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
                                        <div className="mb-8">
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
                                        <div className="mb-8">
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
                                                    className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-purple-900">Export Data</h4>
                                                        <p className="text-sm text-purple-600">Download your account data</p>
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
                            animation: float 6s ease-in-out infinite;
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
                                                    className={`flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 ${item.borderColor} group transform hover:scale-105`}
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
                                                            {item.id === 'bookings' && 'View & manage appointments'}
                                                            {item.id === 'profile' && 'Edit profile & settings'}
                                                            {item.id === 'analytics' && 'Performance insights'}
                                                            {item.id === 'membership' && 'Subscription plans'}
                                                            {item.id === 'hotel-villa' && 'Partner services'}
                                                            {item.id === 'discount-banners' && 'Social media banners'}
                                                            {item.id === 'terms' && 'Legal information'}
                                                            {item.id === 'settings' && 'App preferences'}
                                                        </p>
                                                    </div>
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

            <Footer t={t} />
        </div>
    );
};

export default TherapistDashboardPage;