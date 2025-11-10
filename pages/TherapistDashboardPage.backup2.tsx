import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Therapist, Pricing, Booking, Notification } from '../types';
import type { Page } from '../types/pageTypes';
import { AvailabilityStatus, BookingStatus, HotelVillaServiceStatus } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages, stringifyPricing, stringifyCoordinates, stringifyMassageTypes, stringifyAnalytics } from '../utils/appwriteHelpers';
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
// Removed import - Job Opportunities page removed as it's available in live app
// import TherapistJobOpportunitiesPage from './TherapistJobOpportunitiesPage';
import PushNotificationSettings from '../components/PushNotificationSettings';
import Footer from '../components/Footer';
import TherapistNotifications from '../components/TherapistNotifications';
import BusyTimerModal from '../components/BusyTimerModal';
// Removed chat import - chat system removed
// import MemberChatWindow from '../components/MemberChatWindow';
import '../utils/pricingHelper'; // Load pricing helper for console access


interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => void;
    onLogout: () => void;
    onNavigateToNotifications: () => void;
    onNavigate?: (page: Page) => void;
    onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void;
    onStatusChange?: (status: AvailabilityStatus) => void; // Add status change handler
    handleNavigateToAdminLogin?: () => void;
    therapistId: number | string; // Support both for Appwrite compatibility
    existingTherapistData?: Therapist; // 🔥 NEW: Pre-loaded therapist data from home page
    bookings?: Booking[]; // Make optional to handle undefined cases
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

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications: _onNavigateToNotifications, onNavigate, onUpdateBookingStatus, onStatusChange, handleNavigateToAdminLogin, therapistId, existingTherapistData, bookings, notifications, t }) => {
    const { t: t_new } = useTranslations(); // New translation system
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
    const [discountDuration, setDiscountDuration] = useState<number>(0); // Hours for discount duration
    const [discountEndTime, setDiscountEndTime] = useState<Date | null>(null); // When discount expires
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [isLicensed, setIsLicensed] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('status'); // Start with Online Status tab
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); // Notifications modal state
    const [showBusyTimerModal, setShowBusyTimerModal] = useState(false);

    const locationInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sideDrawerRef = useRef<HTMLDivElement>(null);
    
    const fetchTherapistData = useCallback(async () => {
        setIsLoading(true);
        
        try {
            console.log('📖 Fetching therapist data for ID:', therapistId);
            
            // � NEW: First check local database for saved data
            let existingTherapist = null;
            
            // 🔥 CRITICAL FIX: Handle both documentId and userId
            console.log('🔍 CRITICAL FIX: Therapist ID Resolution');
            console.log('� Provided therapistId:', therapistId);
            console.log('📍 existingTherapistData:', existingTherapistData);
            
            // 🎯 PRIORITY 1: Use existingTherapistData from AppRouter (best source)
            if (existingTherapistData) {
                console.log('✅ Using existingTherapistData from AppRouter (live home data)');
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
                        
                        // 🔍 DETAILED FIELD ANALYSIS
                        console.log('🔍 DETAILED FIELD ANALYSIS:');
                        console.log('   📝 Name:', existingTherapist.name || 'EMPTY');
                        console.log('   📄 Description:', existingTherapist.description || 'EMPTY');
                        console.log('   📱 WhatsApp:', existingTherapist.whatsappNumber || 'EMPTY');
                        console.log('   📍 Location:', existingTherapist.location || 'EMPTY');
                        console.log('   🎯 Years Experience:', existingTherapist.yearsOfExperience || 'EMPTY/0');
                        console.log('   💰 Pricing:', existingTherapist.pricing || 'EMPTY');
                        console.log('   🏷️ Profile Picture:', existingTherapist.profilePicture || 'EMPTY');
                        console.log('   🗣️ Languages:', existingTherapist.languages || 'EMPTY');
                        console.log('   💼 Massage Types:', existingTherapist.massageTypes || 'EMPTY');
                    } else {
                        console.log('⚠️ No therapist profile found for email:', currentUser.email);
                        console.log('🔍 Will try other lookup methods...');
                        console.log('📋 Therapist profiles response was:', therapistProfiles);
                    }
                } else {
                    console.log('⚠️ No authenticated user found');
                }
            } catch (appwriteError: any) {
                console.log('⚠️ Authentication or profile search failed:', appwriteError?.message || appwriteError);
            }
            
            // Fallback 1: Try with therapistId prop if provided
            if (!existingTherapist && therapistId) {
                try {
                    console.log('📡 Fallback: Loading therapist data by ID:', therapistId);
                    existingTherapist = await therapistService.getById(therapistId.toString());
                    if (existingTherapist) {
                        console.log('✅ Found therapist data by ID:', existingTherapist.name);
                    }
                } catch (idError: any) {
                    console.log('⚠️ ID-based fetch failed:', idError?.message || idError);
                }
            }
            
            // 🔥 CRITICAL FALLBACK: Use existing data from AppRouter (homepage data)
            if (!existingTherapist && existingTherapistData) {
                console.log('🎯 FALLBACK: Using existing therapist data from AppRouter props:', {
                    name: existingTherapistData.name,
                    email: existingTherapistData.email,
                    hasProfile: !!existingTherapistData.profilePicture,
                    hasDescription: !!existingTherapistData.description,
                    source: 'AppRouter-existingTherapistData'
                });
                existingTherapist = existingTherapistData;
            }
            
            // 🚨 CRITICAL FIX: Force email lookup if no therapist found by ID
            if (!existingTherapist) {
                try {
                    console.log('🆘 CRITICAL FIX: No therapist found by ID, forcing email lookup...');
                    console.log('🔍 This commonly happens after login when therapistId is document ID but homepage array uses different IDs');
                    
                    const currentUser = await therapistService.getCurrentUser();
                    if (currentUser?.email) {
                        console.log('📧 FORCE: Fetching therapist by authenticated user email:', currentUser.email);
                        const emailTherapists = await therapistService.getByEmail(currentUser.email);
                        if (emailTherapists && emailTherapists.length > 0) {
                            existingTherapist = emailTherapists[0];
                            console.log('✅ CRITICAL SUCCESS: Found therapist by email:', {
                                name: existingTherapist.name,
                                id: existingTherapist.$id,
                                email: existingTherapist.email,
                                hasFullProfile: !!(existingTherapist.description && existingTherapist.whatsappNumber)
                            });
                        } else {
                            console.error('❌ CRITICAL ERROR: No therapist profile exists for authenticated email:', currentUser.email);
                            console.log('💡 This suggests the therapist document was not created during registration');
                        }
                    } else {
                        console.error('❌ CRITICAL ERROR: No authenticated user session found');
                    }
                } catch (criticalError: any) {
                    console.error('❌ CRITICAL ERROR in email lookup:', criticalError?.message || criticalError);
                }
            }
            
            // REMOVED: localStorage database loading (now using Appwrite only)
            /* COMMENTED OUT localStorage CODE:
            try {
                const localDB = localStorage.getItem('localDatabase');
                if (localDB) {
                    const data = JSON.parse(localDB);
                    console.log('📊 Checking local database for therapist data...');
                    
                    // Find therapist by current user session
                    const userSession = localStorage.getItem('userSession');
                    if (userSession) {
                        const session = JSON.parse(userSession);
                        const userId = session.userId || session.id;
                        
                        // Look for therapist with matching email or ID
                        existingTherapist = data.therapists?.find(t => 
                            t.email === session.email || 
                            t.id === userId.toString() ||
                            t.id === `local_${userId}` ||
                            t.email?.includes(userId.toString())
                        );
                        
                        if (existingTherapist) {
                            console.log('✅ Found therapist data in local database:', existingTherapist.name);
                        } else {
                            console.log('� No matching therapist found in local database');
                            console.log('   - Session email:', session.email);
                            console.log('   - Session ID:', userId);
                            console.log('   - Available therapists:', data.therapists?.length || 0);
                        }
                    }
                }
            } catch (localError) {
                console.log('⚠️ Local database check failed:', localError);
            }
            
            // Fallback: Use existing data from props
            if (!existingTherapist && existingTherapistData) {
                console.log('✅ Using existing therapist data from home page:', {
                    name: existingTherapistData.name,
                    description: existingTherapistData.description?.substring(0, 50) + '...',
                    whatsappNumber: existingTherapistData.whatsappNumber,
                    location: existingTherapistData.location,
                    dataSource: 'Live Card Data'
                });
                existingTherapist = existingTherapistData;
            }
            
            // Last resort: Try Appwrite (for backward compatibility)
            if (!existingTherapist) {
                console.log('📡 No local data found, trying Appwrite as fallback...');
                try {
                    existingTherapist = await therapistService.getById(therapistId.toString());
                } catch (appwriteError) {
                    console.log('⚠️ Appwrite fetch failed (expected with local database):', appwriteError);
                }
            }
            */ // END COMMENTED OUT localStorage CODE
        
        if (existingTherapist) {
            console.log('✅ Found existing therapist profile:', existingTherapist);
            console.log('📋 Profile data breakdown:', {
                name: existingTherapist.name,
                description: existingTherapist.description?.substring(0, 50) + '...',
                profilePicture: existingTherapist.profilePicture?.substring(0, 50) + '...',
                location: existingTherapist.location,
                whatsappNumber: existingTherapist.whatsappNumber,
                yearsOfExperience: (existingTherapist as any).yearsOfExperience,
                massageTypes: existingTherapist.massageTypes,
                isLive: existingTherapist.isLive // 🔍 TROUBLESHOOTING: Check live status
            });
            
            // 🔍 TROUBLESHOOTING: Store profile load info
            localStorage.setItem('debug_therapist_load', JSON.stringify({
                timestamp: new Date().toISOString(),
                therapistId: therapistId,
                profileFound: true,
                isLive: existingTherapist.isLive,
                hasRequiredFields: {
                    name: !!existingTherapist.name,
                    profilePicture: !!existingTherapist.profilePicture,
                    location: !!existingTherapist.location,
                    whatsappNumber: !!existingTherapist.whatsappNumber
                }
            }));
            
            setTherapist(existingTherapist);
            
            // Only set form fields if they're currently empty to prevent overwriting user input
            console.log('🔄 About to set form fields. Current state:', {
                currentName: name,
                loadedName: existingTherapist.name,
                currentDescription: description?.substring(0, 30) + '...',
                loadedDescription: existingTherapist.description?.substring(0, 30) + '...'
            });
            
            console.log('📋 ALL LOADED DATA FOR FORM FIELDS:');
            console.log('   Name: "' + (existingTherapist.name || 'EMPTY') + '"');
            console.log('   Description: "' + (existingTherapist.description || 'EMPTY') + '"');
            console.log('   WhatsApp: "' + (existingTherapist.whatsappNumber || 'EMPTY') + '"');
            console.log('   Location: "' + (existingTherapist.location || 'EMPTY') + '"');
            console.log('   Years Exp: ' + (existingTherapist.yearsOfExperience || 0));
            console.log('   Profile Pic: "' + (existingTherapist.profilePicture || 'EMPTY') + '"');
            
            if (!name || name === '') {
                console.log('📝 Setting name from loaded data:', existingTherapist.name);
                setName(existingTherapist.name || '');
            } else {
                console.log('⚠️ Skipping name set - current name exists:', name);
            }
            
            if (!description || description === '') {
                console.log('📝 Setting description from loaded data:', existingTherapist.description);
                setDescription(existingTherapist.description || '');
            } else {
                console.log('⚠️ Skipping description set - current description exists:', description);
            }
            
            if (!profilePicture || profilePicture === '') {
                console.log('📝 Setting profile picture from loaded data:', existingTherapist.profilePicture);
                setProfilePicture(existingTherapist.profilePicture || '');
            } else {
                console.log('⚠️ Skipping profile picture set - current picture exists:', profilePicture);
            }
            
            // Set other fields with logging
            console.log('📱 Setting WhatsApp number:', existingTherapist.whatsappNumber);
            setWhatsappNumber(existingTherapist.whatsappNumber || '');
            
            console.log('📍 Setting location:', existingTherapist.location);
            setLocation(existingTherapist.location || '');
            
            console.log('🎯 Setting years of experience:', existingTherapist.yearsOfExperience);
            setYearsOfExperience((existingTherapist as any).yearsOfExperience || 0);
            
            // Set remaining complex fields  
            console.log('🎭 Setting massage types:', existingTherapist.massageTypes);
            setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
            
            console.log('🗣️ Setting languages:', existingTherapist.languages);
            setLanguages(existingTherapist.languages 
                ? (typeof existingTherapist.languages === 'string' 
                    ? parseLanguages(existingTherapist.languages) 
                    : existingTherapist.languages)
                : []);
            // Load pricing - try new format first, fallback to old format
            console.log('💰 Loading pricing data...');
            const loadedPricing = (() => {
                // Try new separate fields first
                if (existingTherapist.price60 !== undefined || existingTherapist.price90 !== undefined || existingTherapist.price120 !== undefined) {
                    console.log('💰 Using new price format:', {
                        price60: existingTherapist.price60,
                        price90: existingTherapist.price90,
                        price120: existingTherapist.price120
                    });
                    return {
                        "60": existingTherapist.price60 ? parseInt(existingTherapist.price60) * 1000 : 0,
                        "90": existingTherapist.price90 ? parseInt(existingTherapist.price90) * 1000 : 0,
                        "120": existingTherapist.price120 ? parseInt(existingTherapist.price120) * 1000 : 0
                    };
                }
                // Fallback to old JSON format
                console.log('💰 Using old pricing format:', existingTherapist.pricing);
                return parsePricing(existingTherapist.pricing);
            })();
            console.log('💰 Final pricing set:', loadedPricing);
            setPricing(loadedPricing);
            
            // 🎯 Load discount data
            console.log('🎯 Loading discount data...');
            setDiscountPercentage((existingTherapist as any).discountPercentage || 0);
            setDiscountDuration((existingTherapist as any).discountDuration || 0);
            
            // Check if discount is still active
            if ((existingTherapist as any).discountEndTime) {
                const endTime = new Date((existingTherapist as any).discountEndTime);
                const now = new Date();
                if (endTime > now) {
                    setDiscountEndTime(endTime);
                    setIsDiscountActive(true);
                    console.log('✅ Active discount found:', {
                        percentage: (existingTherapist as any).discountPercentage,
                        endTime: endTime.toISOString(),
                        timeLeft: Math.round((endTime.getTime() - now.getTime()) / (1000 * 60 * 60)) + 'h'
                    });
                } else {
                    console.log('⏰ Discount expired, clearing...');
                    setDiscountEndTime(null);
                    setIsDiscountActive(false);
                }
            } else {
                setDiscountEndTime(null);
                setIsDiscountActive(false);
            }
            
            // Load hotel/villa pricing if exists
            if ((existingTherapist as any).hotelVillaPricing) {
                setHotelVillaPricing(parsePricing((existingTherapist as any).hotelVillaPricing));
                setUseSamePricing(false);
            } else {
                setHotelVillaPricing(parsePricing(existingTherapist.pricing));
                setUseSamePricing(true);
            }
            
            // Set remaining fields
            console.log('📍 Setting coordinates:', existingTherapist.coordinates);
            setCoordinates(parseCoordinates(existingTherapist.coordinates));
            
            const therapistStatus = existingTherapist.status || AvailabilityStatus.Offline;
            console.log('🎯 Setting therapist status:', therapistStatus);
            setStatus(therapistStatus);
            
            console.log('🎓 Setting license info:', existingTherapist.isLicensed, existingTherapist.licenseNumber);
            setIsLicensed((existingTherapist as any).isLicensed || false);
            setLicenseNumber((existingTherapist as any).licenseNumber || '');
            
            // Mark data as loaded to prevent future overwrites
            console.log('✅ All profile data loaded successfully');
            setDataLoaded(true);
            
            // Load discount data from analytics field
            try {
                const analyticsData = existingTherapist.analytics ? 
                    (typeof existingTherapist.analytics === 'string' ? JSON.parse(existingTherapist.analytics) : existingTherapist.analytics) : 
                    {};
                
                if (analyticsData.discountData) {
                    const discountData = analyticsData.discountData;
                    const endTime = new Date(discountData.endTime);
                    const now = new Date();
                    
                    // Check if discount is still active (hasn't expired)
                    if (discountData.isActive && endTime > now) {
                        setDiscountPercentage(discountData.percentage);
                        setDiscountDuration(discountData.duration);
                        setDiscountEndTime(endTime);
                        setIsDiscountActive(true);
                        console.log('📊 Loaded active discount:', discountData.percentage + '%');
                    } else if (discountData.isActive && endTime <= now) {
                        // Discount has expired, auto-deactivate
                        console.log('⏰ Discount expired, auto-deactivating...');
                        setDiscountPercentage(0);
                        setDiscountDuration(0);
                        setDiscountEndTime(null);
                        setIsDiscountActive(false);
                        
                        // Update database to mark as inactive
                        const updatedAnalytics = {
                            ...analyticsData,
                            discountData: {
                                ...discountData,
                                isActive: false
                            }
                        };
                        therapistService.update(therapistId.toString(), { 
                            analytics: JSON.stringify(updatedAnalytics)
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Error loading discount data:', error);
            }
        } else {
            console.log('📝 No existing profile found, starting with empty form');
            // No existing profile - start with empty data
            const emptyTherapist = {
                id: therapistId,
                name: '',
                description: '',
                profilePicture: '',
                whatsappNumber: '',
                massageTypes: stringifyMassageTypes([]),
                pricing: stringifyPricing({ "60": 0, "90": 0, "120": 0 }),
                location: '',
                coordinates: stringifyCoordinates({ lat: 0, lng: 0 }),
                status: AvailabilityStatus.Offline,
                isLive: true, // 🚀 AUTO-ACTIVE: New therapists go live automatically
                rating: 0,
                reviewCount: 0,
                activeMembershipDate: new Date().toISOString().split('T')[0],
                email: `therapist${therapistId}@indostreet.com`,
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
            };
            
            setTherapist(emptyTherapist);
            setName('');
            setDescription('');
            setProfilePicture('');
            setWhatsappNumber('');
            setYearsOfExperience(0);
            setMassageTypes([]);
            setLanguages([]);
            setPricing({ "60": 0, "90": 0, "120": 0 });
            setHotelVillaPricing({ "60": 0, "90": 0, "120": 0 });
            setUseSamePricing(true);
            setLocation('');
            setCoordinates({ lat: 0, lng: 0 });
            setStatus(AvailabilityStatus.Offline);
            setIsLicensed(false);
            setLicenseNumber('');
        }
        
        // Mark data as loaded after processing
        setDataLoaded(true);
        setIsLoading(false);
    }, [therapistId, existingTherapistData]);

    useEffect(() => {
        // Add delay to ensure authentication is ready and check if data already exists
        const timer = setTimeout(async () => {
            console.log('⏰ Delayed fetch triggered - checking if data needs to be loaded...');
            console.log('📊 Current state - dataLoaded:', dataLoaded, 'name:', name, 'therapistId:', therapistId);
            console.log('📊 Component props - existingTherapistData:', existingTherapistData);
            
            // Only fetch if data hasn't been loaded yet
            if (!dataLoaded && (!name || name === '')) {
                console.log('🔄 No data loaded yet, fetching from server...');
                console.log('🔄 Calling fetchTherapistData...');
                await fetchTherapistData();
                console.log('✅ fetchTherapistData completed');
            } else {
                console.log('✅ Data already loaded or available, name:', name);
                console.log('📊 Skipping fetch - dataLoaded:', dataLoaded);
            }
        }, 200); // Increased delay to ensure auth is fully ready

        return () => clearTimeout(timer);
    }, [fetchTherapistData, dataLoaded, name]);

    // Sync status with prop changes
    useEffect(() => {
        if (existingTherapistData?.status) {
            console.log('🔄 Syncing status from props:', existingTherapistData.status);
            setStatus(existingTherapistData.status);
        }
    }, [existingTherapistData?.status]);

    // Debug status changes
    useEffect(() => {
        console.log('💡 Current status state:', status);
        console.log('💡 Button highlighting should show:', {
            Available: status === AvailabilityStatus.Available,
            Busy: status === AvailabilityStatus.Busy, 
            Offline: status === AvailabilityStatus.Offline
        });
    }, [status]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Close side drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target as Node)) {
                setIsSideDrawerOpen(false);
            }
        };

        if (isSideDrawerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSideDrawerOpen]);

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

    // Poll for WhatsApp contact notifications
    useEffect(() => {
        if (!therapistId) return;

        let lastNotificationCount = 0;

        const checkForWhatsAppNotifications = async () => {
            try {
                const unreadNotifications = await notificationService.getUnread(Number(therapistId));
                
                // Filter for WhatsApp contact notifications
                const whatsappNotifications = unreadNotifications.filter(
                    (n: any) => n.type === 'whatsapp_contact'
                );

                // If we have more WhatsApp notifications than before, play sound
                if (whatsappNotifications.length > lastNotificationCount) {
                    console.log('📱 New WhatsApp contact notification received!');
                    await soundNotificationService.showWhatsAppContactNotification();
                }

                lastNotificationCount = whatsappNotifications.length;
            } catch (error) {
                // Silently handle missing notifications collection - don't log error
                if (!(error as any)?.message?.includes('Collection with the requested ID could not be found')) {
                    console.error('Error checking notifications:', error);
                }
            }
        };

        // Check immediately
        checkForWhatsAppNotifications();

        // Then poll every 10 seconds
        const interval = setInterval(checkForWhatsAppNotifications, 10000);

        return () => clearInterval(interval);
    }, [therapistId]);

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

    // Use effect to check discount expiry periodically - moved here to maintain hooks order
    useEffect(() => {
        const checkDiscountExpiry = async () => {
            if (isDiscountActive && discountEndTime) {
                const now = new Date();
                if (now >= discountEndTime) {
                    console.log('⏰ Discount expired, auto-deactivating...');
                    setIsDiscountActive(false);
                    setDiscountPercentage(0);
                    setDiscountEndTime(null);
                    setDiscountDuration(0);
                    
                    // Update database to mark discount as inactive
                    try {
                        const therapistIdString = typeof therapistId === 'string' ? therapistId : therapistId.toString();
                        const currentAnalytics = therapist?.analytics ? 
                            (typeof therapist.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist.analytics) : 
                            {};
                        
                        const updatedAnalytics = {
                            ...currentAnalytics,
                            discountData: {
                                ...currentAnalytics.discountData,
                                isActive: false
                            }
                        };
                        
                        await therapistService.update(therapistIdString, { 
                            analytics: JSON.stringify(updatedAnalytics)
                        });
                        
                        setToast({ message: 'Discount expired and deactivated automatically', type: 'warning' });
                    } catch (error) {
                        console.error('❌ Error updating expired discount:', error);
                    }
                }
            }
        };

        const interval = setInterval(checkDiscountExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isDiscountActive, discountEndTime, discountDuration, therapistId, therapist?.analytics]); // Include all dependencies

    // Early returns moved here after all hooks are declared to fix Rules of Hooks violation
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div></div>;
    }

    if (!therapist) {
        return <div className="p-4 text-center text-red-500">Could not load therapist data. Please try logging in again.</div>
    }

    const handleSave = () => {
        console.log('💾 SAVE BUTTON CLICKED - Starting save process...');
        console.log('📋 Profile data being saved:', {
            name,
            whatsappNumber,
            yearsOfExperience,
            location,
            status,
            pricing: pricing,
            hotelVillaPricing: useSamePricing ? 'Same as home pricing' : hotelVillaPricing,
            useSamePricing
        });
        
        // Validate required fields
        if (!name || !whatsappNumber) {
            alert('Name and WhatsApp number are required!');
            return;
        }
        
        // Validate profile image requirement
        if (!profilePicture || profilePicture.trim() === '') {
            alert('Profile Image Required!\n\nYou must upload a profile image before saving your profile.\n\nPlease add:\n• A clear front or side view of your face\n• Well-lit, professional appearance\n• Recent photo (within 6 months)\n\nThis helps customers identify you and builds trust.');
            return;
        }
        
        // Validate required pricing fields (all three must be filled)
        const hasPrice60 = pricing["60"] && pricing["60"] > 0;
        const hasPrice90 = pricing["90"] && pricing["90"] > 0;  
        const hasPrice120 = pricing["120"] && pricing["120"] > 0;
        
        if (!hasPrice60 || !hasPrice90 || !hasPrice120) {
            alert('All Pricing Fields Required!\n\nYou must fill in ALL three pricing options:\n\n• 60 minutes price\n• 90 minutes price\n• 120 minutes price\n\nExample: 250, 350, 450 (numbers only)\n\nThese prices will be displayed on your profile card.');
            return;
        }
        
        try {
            const saveData = {
                name,
                description,
                profilePicture,
                whatsappNumber,
                yearsOfExperience,
                isLicensed,
                // NEW: Save pricing in both formats for compatibility
                pricing: stringifyPricing(pricing), // Keep old format for backward compatibility
                price60: pricing["60"] ? Math.round(pricing["60"] / 1000).toString() : '',
                price90: pricing["90"] ? Math.round(pricing["90"] / 1000).toString() : '',
                price120: pricing["120"] ? Math.round(pricing["120"] / 1000).toString() : '',
                hotelVillaPricing: useSamePricing ? undefined : stringifyPricing(hotelVillaPricing),
                discountPercentage,
                location,
                coordinates: stringifyCoordinates(coordinates),
                // AUTO-LIVE SYSTEM: All new/updated profiles are automatically set to Available
                status: 'available', // Always set to available when saving profile
                availability: 'Available', // Always set to Available when saving profile
                isOnline: true, // Mark as online when saving profile
                isLive: true, // Mark as live when saving profile
                analytics: therapist?.analytics || stringifyAnalytics({ 
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
                languages,
                // Rating system - start new therapists with 4.8 rating
                ...(!therapist?.rating || therapist?.reviewCount === 0 ? getInitialRatingData() : {}),
                // Required Appwrite fields that were missing
                specialization: massageTypes.length > 0 ? massageTypes[0] : 'General Massage'
            };
            
            console.log('💾 Calling onSave with data:', saveData);
            console.log('🔍 TROUBLESHOOTING - Save data includes:', {
                name: saveData.name,
                hasProfilePicture: !!saveData.profilePicture,
                hasLocation: !!saveData.location,
                massageTypesCount: Array.isArray(massageTypes) ? massageTypes.length : 0,
                therapistId: therapistId
            });
            
            // Store debug info for troubleshooting
            localStorage.setItem('debug_therapist_save', JSON.stringify({
                timestamp: new Date().toISOString(),
                therapistId: therapistId,
                saveData: saveData,
                onSaveExists: !!onSave
            }));
            
            if (!onSave) {
                console.error('❌ CRITICAL ERROR: onSave prop is missing!');
                alert('Save function is not available. Please refresh the page and try again.');
                return;
            }
            
            onSave(saveData as any);
            console.log('✅ Save function called successfully');
            
            // AUTO-LIVE SYSTEM: Update local status to Available after successful save
            setStatus(AvailabilityStatus.Available);
            console.log('🟢 Profile saved! Status automatically set to Available - therapist is now live!');
            
            setShowConfirmation(true);
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            // Use alert as fallback since toast causes DOM errors
            alert('Error saving profile. Please try again.');
        }
    };
    
    // 🎯 Discount Management Functions
    const activateDiscount = async () => {
        if (!discountPercentage || !discountDuration) {
            console.warn('Missing discount percentage or duration');
            return;
        }

        try {
            const endTime = new Date();
            endTime.setHours(endTime.getHours() + discountDuration);
            
            setDiscountEndTime(endTime);
            setIsDiscountActive(true);
            
            console.log(`🎯 Activated ${discountPercentage}% discount for ${discountDuration} hours`);
            
            // Update therapist profile with discount
            if (onSave) {
                const saveData = {
                    name: name.trim(),
                    description,
                    profilePicture,
                    whatsappNumber,
                    location,
                    coordinates,
                    yearsOfExperience,
                    massageTypes,
                    languages,
                    pricing: { 60: pricing[60], 90: pricing[90], 120: pricing[120] },
                    hotelVillaPricing: useSamePricing ? pricing : hotelVillaPricing,
                    useSamePricing,
                    discountPercentage, // 🎯 Include discount in save
                    discountEndTime: endTime,
                    isLicensed,
                    licenseNumber,
                    status
                };
                onSave(saveData as any);
            }
            
            // Auto-deactivate after duration
            setTimeout(() => {
                deactivateDiscount();
            }, discountDuration * 60 * 60 * 1000);

        } catch (error) {
            console.error('Error activating discount:', error);
        }
    };

    const deactivateDiscount = async () => {
        try {
            setIsDiscountActive(false);
            setDiscountEndTime(null);
            setDiscountPercentage(0);
            
            console.log('🔚 Discount deactivated');
            
            // Update therapist profile to remove discount
            if (onSave) {
                const saveData = {
                    name: name.trim(),
                    description,
                    profilePicture,
                    whatsappNumber,
                    location,
                    coordinates,
                    yearsOfExperience,
                    massageTypes,
                    languages,
                    pricing: { 60: pricing[60], 90: pricing[90], 120: pricing[120] },
                    hotelVillaPricing: useSamePricing ? pricing : hotelVillaPricing,
                    useSamePricing,
                    discountPercentage: 0, // 🎯 Remove discount
                    discountEndTime: null,
                    isLicensed,
                    licenseNumber,
                    status
                };
                onSave(saveData as any);
            }
        } catch (error) {
            console.error('Error deactivating discount:', error);
        }
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

    // Handle notifications from footer
    const handleShowNotifications = () => {
        setShowNotifications(true);
    };

    const handleCloseNotifications = () => {
        setShowNotifications(false);
    };

    // Handle busy timer functionality
    const handleBusyTimerConfirm = async (durationMinutes: number) => {
        try {
            console.log('⏰ Setting busy timer for', durationMinutes, 'minutes');
            
            const user = await therapistService.getCurrentUser();
            const therapists = await therapistService.getByEmail(user.email);
            
            if (!therapists || therapists.length === 0) {
                throw new Error('Therapist profile not found');
            }
            
            const currentTherapist = therapists[0];
            
            // Calculate busy until time
            const busyUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
            
            // Update status to busy with timer
            const updateResult = await therapistService.update(currentTherapist.$id, {
                status: 'busy', // lowercase for database
                availability: AvailabilityStatus.Busy, // capitalized for availability field
                busyUntil: busyUntil,
                busyDuration: durationMinutes,
                isOnline: false,
                isLive: true
            });
            
            if (updateResult._fallback) {
                console.warn('⚠️ Busy timer update used fallback mode:', updateResult._error);
                setToast({ 
                    message: `Status updated locally (Database: ${updateResult._error})`, 
                    type: 'warning' 
                });
            } else {
                console.log('✅ Busy timer saved successfully:', currentTherapist.$id);
                setToast({ 
                    message: `Busy status set for ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m!`, 
                    type: 'success' 
                });
            }
            
            // Update local state
            setStatus(AvailabilityStatus.Busy);
            
            // Set timer to automatically return to Available
            setTimeout(() => {
                handleAutoReturnToAvailable(currentTherapist.$id);
            }, durationMinutes * 60 * 1000);
            
        } catch (error) {
            console.error('❌ Error setting busy timer:', error);
            setToast({ 
                message: 'Failed to set busy timer. Please try again.', 
                type: 'error' 
            });
        }
    };

    const handleAutoReturnToAvailable = async (therapistId: string) => {
        try {
            console.log('⏰ Auto-returning therapist to Available status');
            
            await therapistService.update(therapistId, {
                status: 'available',
                availability: AvailabilityStatus.Available,
                busyUntil: null,
                busyDuration: null,
                isOnline: true,
                isLive: true
            });
            
            setStatus(AvailabilityStatus.Available);
            setToast({ 
                message: 'You are now Available again!', 
                type: 'success' 
            });
            
        } catch (error) {
            console.error('❌ Error auto-returning to available:', error);
        }
    };

    const now = new Date();
    const upcomingBookings = (bookings || []).filter(b => new Date(b.startTime) >= now).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const pastBookings = (bookings || []).filter(b => new Date(b.startTime) < now).sort((_, b) => new Date(b.startTime).getTime() - new Date(b.startTime).getTime());

    // Discount management functions
    const renderContent = () => {
        switch (activeTab) {
            case 'status': {
                const handleStatusChange = async (newStatus: AvailabilityStatus) => {
                    // Don't change if already the same status
                    if (status === newStatus) {
                        console.log('🔄 Status is already', newStatus);
                        return;
                    }
                    
                    // Special handling for Busy status - show timer modal
                    if (newStatus === AvailabilityStatus.Busy) {
                        setShowBusyTimerModal(true);
                        return;
                    }
                    
                    // Add confirmation for Available/Offline status changes
                    const statusLabels = {
                        [AvailabilityStatus.Available]: 'Available',
                        [AvailabilityStatus.Busy]: 'Busy',
                        [AvailabilityStatus.Offline]: 'Offline'
                    };
                    
                    const currentLabel = statusLabels[status];
                    const newLabel = statusLabels[newStatus];
                    
                    const confirmed = window.confirm(
                        `Change your status from "${currentLabel}" to "${newLabel}"?\n\nThis will update your availability for customers immediately.`
                    );
                    
                    if (!confirmed) {
                        console.log('📵 Status change cancelled by user');
                        return;
                    }
                    
                    setStatus(newStatus);
                    
                    // Auto-save status to database after confirmation
                    try {
                        console.log('💾 Auto-saving status:', newStatus);
                        
                        // Get current user and find therapist document
                        const user = await therapistService.getCurrentUser();
                        const therapists = await therapistService.getByEmail(user.email);
                        
                        if (!therapists || therapists.length === 0) {
                            throw new Error('Therapist profile not found');
                        }
                        
                        const currentTherapist = therapists[0];
                        console.log('📋 Found therapist document:', currentTherapist.$id);
                        
                        // Update status using new comprehensive preservation method
                        const lowercaseStatus = newStatus.toLowerCase(); // Convert to lowercase for database
                        const updateResult = await therapistService.update(currentTherapist.$id, {
                            status: lowercaseStatus,
                            availability: newStatus, // Keep capitalized for availability field
                            isOnline: newStatus === 'Available',
                            isLive: true
                        });
                        
                        if (updateResult._fallback) {
                            console.warn('⚠️ Status update used fallback mode:', updateResult._error);
                            setToast({ 
                                message: `Status updated locally (Database: ${updateResult._error})`, 
                                type: 'warning' 
                            });
                        } else {
                            console.log('✅ Status saved successfully to document:', currentTherapist.$id);
                            setToast({ 
                                message: 'Status updated successfully!', 
                                type: 'success' 
                            });
                        }
                        
                        // Call parent handler if provided
                        if (onStatusChange) {
                            onStatusChange(newStatus);
                        }
                    } catch (error) {
                        console.error('❌ Error saving status:', error);
                        // Revert status on error
                        setStatus(status);
                        setToast({ 
                            message: 'Failed to update status. Please try again.', 
                            type: 'error' 
                        });
                    }
                };
                
                return (
                    <div className="max-w-3xl mx-auto h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-100 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute top-1/4 right-8 w-16 h-16 bg-blue-100 rounded-full opacity-20 animate-bounce"></div>
                            <div className="absolute bottom-1/4 left-8 w-12 h-12 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col p-6 space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-200/50">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            Online Status
                                        </h1>
                                        <p className="text-sm text-gray-600">Manage your availability</p>
                                    </div>
                                </div>
                            </div>

                            {/* Free Unlimited Account Banner */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-lg border border-green-200">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-green-800">Free Unlimited Account</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Status Buttons with Animated Borders */}
                            <div className="space-y-4">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Your Status</h2>
                                    <p className="text-sm text-gray-600">Let clients know your availability</p>
                                </div>

                                {/* Available Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => handleStatusChange(AvailabilityStatus.Available)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            status === AvailabilityStatus.Available
                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                                                : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-green-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated Border for Selected State */}
                                        {status === AvailabilityStatus.Available && (
                                            <div className="absolute inset-0 rounded-2xl">
                                                <div className="absolute inset-0 rounded-2xl border-2 border-green-500 opacity-50"></div>
                                                <div className="absolute inset-0 rounded-2xl border-2 border-green-400 animate-ping opacity-30"></div>
                                                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                status === AvailabilityStatus.Available 
                                                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full ${
                                                    status === AvailabilityStatus.Available ? 'bg-white' : 'bg-gray-400'
                                                } ${status === AvailabilityStatus.Available ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Available</h3>
                                                <p className="text-sm text-gray-600">Ready to accept new bookings</p>
                                            </div>
                                            {status === AvailabilityStatus.Available && (
                                                <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full animate-bounce">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Busy Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => handleStatusChange(AvailabilityStatus.Busy)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            status === AvailabilityStatus.Busy
                                                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-lg'
                                                : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-yellow-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated Border for Selected State */}
                                        {status === AvailabilityStatus.Busy && (
                                            <div className="absolute inset-0 rounded-2xl">
                                                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500 opacity-50"></div>
                                                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 animate-ping opacity-30"></div>
                                                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                status === AvailabilityStatus.Busy 
                                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full ${
                                                    status === AvailabilityStatus.Busy ? 'bg-white' : 'bg-gray-400'
                                                } ${status === AvailabilityStatus.Busy ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Busy</h3>
                                                <p className="text-sm text-gray-600">Currently with a client</p>
                                            </div>
                                            {status === AvailabilityStatus.Busy && (
                                                <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full animate-bounce">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Offline Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => handleStatusChange(AvailabilityStatus.Offline)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            status === AvailabilityStatus.Offline
                                                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-lg'
                                                : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-red-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated Border for Selected State */}
                                        {status === AvailabilityStatus.Offline && (
                                            <div className="absolute inset-0 rounded-2xl">
                                                <div className="absolute inset-0 rounded-2xl border-2 border-red-500 opacity-50"></div>
                                                <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-30"></div>
                                                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200 to-transparent opacity-20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                status === AvailabilityStatus.Offline 
                                                    ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full ${
                                                    status === AvailabilityStatus.Offline ? 'bg-white' : 'bg-gray-400'
                                                }`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Offline</h3>
                                                <p className="text-sm text-gray-600">Not accepting bookings</p>
                                            </div>
                                            {status === AvailabilityStatus.Offline && (
                                                <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Live Card Discount Controls */}
                            <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl border border-indigo-300/50 backdrop-blur-sm">
                                <div className="text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">� Live Card Discounts</h3>
                                            <p className="text-sm text-white/80">Set instant discounts for your live therapist card</p>
                                        </div>
                                    </div>
                                    
                                    {/* Active Discount Display */}
                                    {isDiscountActive && discountEndTime && (
                                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-bold text-lg">Active: {discountPercentage}% OFF</span>
                                                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                                    LIVE
                                                </div>
                                            </div>
                                            <p className="text-white/90 text-sm">
                                                Expires: {discountEndTime.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {/* Discount percentages */}
                                        {[5, 10, 15, 20].map((percentage) => (
                                            <button
                                                key={percentage}
                                                onClick={() => setDiscountPercentage(percentage)}
                                                className={`p-3 rounded-lg font-bold text-sm transition-all ${
                                                    discountPercentage === percentage 
                                                        ? 'bg-white text-orange-600 shadow-lg scale-105 ring-2 ring-orange-500' 
                                                        : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-200'
                                                }`}
                                            >
                                                {percentage}% OFF
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {/* Time duration */}
                                        {[
                                            { hours: 4, label: '4h' },
                                            { hours: 8, label: '8h' }, 
                                            { hours: 12, label: '12h' },
                                            { hours: 24, label: '24h' }
                                        ].map(({ hours, label }) => (
                                            <button
                                                key={hours}
                                                onClick={() => setDiscountDuration(hours)}
                                                className={`p-2 rounded-lg font-bold text-xs transition-all ${
                                                    discountDuration === hours 
                                                        ? 'bg-white text-orange-600 shadow-lg scale-105 ring-2 ring-orange-500' 
                                                        : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-200'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {!isDiscountActive ? (
                                        <button
                                            onClick={activateDiscount}
                                            disabled={!discountPercentage || !discountDuration}
                                            className="w-full bg-white text-purple-600 py-3 px-6 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                                            </svg>
                                            Activate Live Discount
                                        </button>
                                    ) : (
                                        <button
                                            onClick={deactivateDiscount}
                                            className="w-full bg-red-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                            </svg>
                                            Deactivate Discount
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Current Status Footer */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gray-200/50 mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-600 font-medium">Current Status:</div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${
                                                status === AvailabilityStatus.Available ? 'bg-green-500 animate-pulse' :
                                                status === AvailabilityStatus.Busy ? 'bg-yellow-500 animate-pulse' : 
                                                'bg-red-500'
                                            }`} />
                                            <span className="font-bold text-gray-900">{status}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'bookings':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t_new('bookings.upcoming')}</h2>
                                <p className="text-xs text-gray-500">Manage your upcoming bookings</p>
                            </div>
                        </div>
                        {upcomingBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t_new('bookings')} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t_new('bookings.noUpcoming')}</p>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-8">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t_new('bookings.past')}</h2>
                                <p className="text-xs text-gray-500">View past bookings</p>
                            </div>
                        </div>
                        {pastBookings.length > 0 ? (
                            <div className="grid gap-4">
                                {pastBookings.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateBookingStatus} t={t_new('bookings')} />)}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                <p className="text-gray-500">{t_new('bookings.noPast')}</p>
                            </div>
                        )}
                    </div>
                );
            case 'analytics':
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
                            <AnalyticsCard title={t?.analytics?.impressions || 'Impressions'} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.impressions ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.impressionsDesc || 'Number of profile impressions'} />
                            <AnalyticsCard title={t?.analytics?.profileViews || 'Profile Views'} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.profileViews ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.profileViewsDesc || 'Number of profile views'} />
                            <AnalyticsCard title={t?.analytics?.whatsappClicks || 'WhatsApp Clicks'} value={(() => {
                                try {
                                    const analytics = typeof therapist?.analytics === 'string' ? JSON.parse(therapist.analytics) : therapist?.analytics;
                                    return analytics?.whatsappClicks ?? 0;
                                } catch { return 0; }
                            })()} description={t?.analytics?.whatsappClicksDesc || 'Number of WhatsApp clicks'} />
                        </div>

                        {/* Coin History Button */}
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('coin-history')}
                                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-orange-200 hover:border-orange-400 mt-6"
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
                        )}

                        {/* Coin Shop Button */}
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('coin-shop')}
                                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-yellow-200 hover:border-yellow-400 mt-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl">
                                        🪙
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900">Coin Rewards Shop</h3>
                                        <p className="text-sm text-gray-600">Redeem coins for rewards</p>
                                    </div>
                                </div>
                                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            case 'hotelVilla': {
                const handleHotelVillaUpdate = (status: HotelVillaServiceStatus, hotelDiscount: number, villaDiscount: number, serviceRadius: number) => {
                    // Update therapist data with hotel-villa preferences
                    console.log('Hotel-Villa preferences updated:', { status, hotelDiscount, villaDiscount, serviceRadius });
                    // In a real app, this would save to the backend
                };
                
                return (
                    <HotelVillaOptIn
                        currentStatus={therapist?.hotelVillaServiceStatus || HotelVillaServiceStatus.NotOptedIn}
                        hotelDiscount={therapist?.hotelDiscount || 20}
                        villaDiscount={therapist?.villaDiscount || 20}
                        serviceRadius={therapist?.serviceRadius || 7}
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
                            providerId={typeof therapistId === 'string' ? parseInt(therapistId) : therapistId} 
                            providerType="therapist" 
                        />
                    </div>
                );

            case 'membership':
                return (
                    <MembershipPlansPage 
                        onBack={() => setActiveTab('profile')}
                        userType="therapist"
                        currentPlan="free"
                    />
                );
            case 'terms':
                return <TherapistTermsPage />;
            case 'profile':
            default:
                return (
                    <TherapistProfileForm
                        // Profile data
                        profilePicture={profilePicture}
                        name={name}
                        yearsOfExperience={yearsOfExperience}
                        description={description}
                        whatsappNumber={whatsappNumber}
                        massageTypes={massageTypes}
                        languages={languages}
                        location={location}
                        coordinates={coordinates}
                        pricing={pricing}
                        hotelVillaPricing={hotelVillaPricing}
                        useSamePricing={useSamePricing}
                        isLicensed={isLicensed}
                        licenseNumber={licenseNumber}
                        
                        // Setters
                        setProfilePicture={setProfilePicture}
                        setName={setName}
                        setYearsOfExperience={setYearsOfExperience}
                        setDescription={setDescription}
                        setWhatsappNumber={setWhatsappNumber}
                        setMassageTypes={setMassageTypes}
                        setLanguages={setLanguages}
                        setLocation={setLocation}
                        setCoordinates={setCoordinates}
                        setPricing={setPricing}
                        setHotelVillaPricing={setHotelVillaPricing}
                        setUseSamePricing={setUseSamePricing}
                        setLicenseNumber={setLicenseNumber}
                        
                        // Modal state
                        showImageRequirementModal={showImageRequirementModal}
                        setShowImageRequirementModal={setShowImageRequirementModal}
                        pendingImageUrl={pendingImageUrl}
                        setPendingImageUrl={setPendingImageUrl}
                        
                        // Additional props
                        therapistId={therapistId}
                        t={t_new}
                        locationInputRef={locationInputRef}
                        mapsApiLoaded={mapsApiLoaded}
                        setToast={setToast}
                        
                        // Handlers
                        handleSave={handleSave}
                        handleSetLocation={handleSetLocation}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm px-3 sm:px-4 py-3 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-bold flex-shrink-0">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-600">Street</span>
                    </h1>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Burger Menu - Moved to right */}
                        <button 
                            onClick={() => setIsSideDrawerOpen(true)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <Menu className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Side Drawer */}
            {isSideDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                        onClick={() => setIsSideDrawerOpen(false)}
                    ></div>
                    
                    {/* Drawer */}
                    <div 
                        ref={sideDrawerRef}
                        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
                    >
                        {/* Drawer Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Menu</h2>
                                    <p className="text-sm text-orange-100">{therapist?.name || 'Therapist'}</p>
                                </div>
                                <button 
                                    onClick={() => setIsSideDrawerOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Drawer Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    setActiveTab('status');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'status' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <Activity className="w-5 h-5" />
                                <span className="font-medium">{t_new('onlineStatus')}</span>
                            </button>
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
                                <span className="font-medium">{t_new('profile')}</span>
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
                                    setActiveTab('notifications');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'notifications' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <ColoredBellIcon className="w-6 h-6" />
                                <span className="font-medium">Notifications</span>
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-bold">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </button>

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
                                    setActiveTab('terms');
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-colors border-l-4 ${
                                    activeTab === 'terms' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-700 border-transparent'
                                }`}
                            >
                                <ColoredDocumentIcon className="w-6 h-6" />
                                <span className="font-medium">Terms & Conditions</span>
                            </button>

                            {/* Website Management Menu Item */}
                            {onNavigate && (
                                <button
                                    onClick={() => {
                                        setIsSideDrawerOpen(false);
                                        onNavigate('website-management');
                                    }}
                                    className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-indigo-50 transition-colors border-l-4 border-transparent hover:border-indigo-500"
                                >
                                    <ColoredGlobeIcon className="w-6 h-6" />
                                    <span className="font-medium">Website Management</span>
                                </button>
                            )}

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

                            {/* Admin Link */}
                            {handleNavigateToAdminLogin && (
                                <div className="pt-2 mt-2 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setIsSideDrawerOpen(false);
                                            handleNavigateToAdminLogin();
                                        }}
                                        className="w-full flex items-center justify-center px-6 py-3 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Admin
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Content Area */}
            <main className={`max-w-7xl mx-auto px-3 sm:px-4 w-full ${
                activeTab === 'status' ? 'h-[calc(100vh-120px)] overflow-y-auto py-2' : 'py-4 sm:py-6'
            }`}>
                {renderContent()}
            </main>
            

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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h3>
                        <p className="text-gray-600 mb-6">Your Profile Is Live</p>
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white transition-opacity duration-300 ${
                    toast.type === 'success' ? 'bg-green-500' :
                    toast.type === 'error' ? 'bg-red-500' : 'bg-orange-500'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Footer */}
            <Footer
                userRole="therapist"
                currentPage="dashboard"
                t={t}
                onNotificationsClick={handleShowNotifications}
                onHomeClick={() => onNavigate?.('home')}
                onProfileClick={() => setActiveTab('profile')}
                onChatClick={() => {/* Add chat handler if needed */}}
                unreadNotifications={notifications?.length || 0}
            />

            {/* Notifications Modal */}
            {showNotifications && (
                <TherapistNotifications
                    notifications={notifications}
                    onMarkAsRead={() => {}}
                    onBack={handleCloseNotifications}
                    t={t}
                    userRole="therapist"
                />
            )}

            {/* Busy Timer Modal */}
            <BusyTimerModal
                isOpen={showBusyTimerModal}
                onClose={() => setShowBusyTimerModal(false)}
                onConfirm={handleBusyTimerConfirm}
                t={t}
            />
        </div>
    );
};

export default TherapistDashboardPage;
