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
    const [activeTab, setActiveTab] = useState('status');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showBusyTimerModal, setShowBusyTimerModal] = useState(false);

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
            }
            
            if (existingTherapist) {
                console.log('✅ Successfully loaded therapist data:', existingTherapist.name);
                setTherapist(existingTherapist);
                
                // Populate all form fields
                setName(existingTherapist.name || '');
                setDescription(existingTherapist.description || '');
                setProfilePicture(existingTherapist.profilePicture || '');
                setWhatsappNumber(existingTherapist.whatsappNumber || '');
                setYearsOfExperience(existingTherapist.yearsOfExperience || 0);
                setLocation(existingTherapist.location || '');
                setIsLicensed(existingTherapist.isLicensed || false);
                setLicenseNumber(existingTherapist.licenseNumber || '');
                
                // Parse complex fields safely
                if (existingTherapist.coordinates) {
                    const coords = parseCoordinates(existingTherapist.coordinates);
                    setCoordinates(coords);
                }
                
                if (existingTherapist.pricing) {
                    const pricingData = parsePricing(existingTherapist.pricing);
                    setPricing(pricingData);
                }
                
                if (existingTherapist.hotelVillaPricing) {
                    const hotelPricingData = parsePricing(existingTherapist.hotelVillaPricing);
                    setHotelVillaPricing(hotelPricingData);
                }
                
                if (existingTherapist.massageTypes) {
                    setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
                }
                
                if (existingTherapist.languages) {
                    setLanguages(parseLanguages(existingTherapist.languages));
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

    // Menu items for navigation
    const menuItems = [
        { id: 'status', label: t.onlineStatus || 'Online Status', icon: <Activity className="w-5 h-5" />, coloredIcon: <ColoredAnalyticsIcon /> },
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
        const therapistData = {
            name,
            description,
            profilePicture,
            whatsappNumber,
            yearsOfExperience,
            massageTypes: stringifyMassageTypes(massageTypes),
            languages,
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
            }) // Add required field
        };

        try {
            await onSave(therapistData);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error saving:', error);
            setToast({ message: 'Failed to update profile', type: 'error' });
        }
    }, [
        name, description, profilePicture, whatsappNumber, yearsOfExperience,
        massageTypes, languages, pricing, hotelVillaPricing, location,
        coordinates, status, isLicensed, licenseNumber, discountPercentage,
        discountDuration, discountEndTime, isDiscountActive, onSave
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Burger Menu */}
                            <button
                                onClick={() => setIsSideDrawerOpen(!isSideDrawerOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                {t.therapistDashboard || 'Therapist Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Notifications */}
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications.length > 9 ? '9+' : notifications.length}
                                    </span>
                                )}
                            </button>

                            {/* Status Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        status === AvailabilityStatus.Available ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                        status === AvailabilityStatus.Busy ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                        'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${
                                        status === AvailabilityStatus.Available ? 'bg-green-500' :
                                        status === AvailabilityStatus.Busy ? 'bg-yellow-500' :
                                        'bg-gray-500'
                                    }`} />
                                    <span>{status}</span>
                                </button>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.logout || 'Logout'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Side Navigation - Desktop */}
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
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.onlineStatus || 'Online Status'}</h2>
                                        
                                        {/* Debug Info */}
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h3 className="font-semibold text-blue-800 mb-2">🔧 ID Mismatch Fix Status</h3>
                                            <p className="text-sm text-blue-700">
                                                Therapist ID: <code className="bg-blue-100 px-1 rounded">{therapistId}</code> | 
                                                Data Loaded: <span className="font-medium">{therapist ? '✅ Yes' : '❌ No'}</span>
                                            </p>
                                        </div>

                                        {therapist ? (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <h3 className="font-semibold text-green-800 mb-2">✅ Profile Loaded Successfully</h3>
                                                    <div className="text-sm text-green-700 grid grid-cols-2 gap-2">
                                                        <div><strong>Name:</strong> {therapist.name || 'Not set'}</div>
                                                        <div><strong>Email:</strong> {therapist.email || 'Not set'}</div>
                                                        <div><strong>WhatsApp:</strong> {therapist.whatsappNumber || 'Not set'}</div>
                                                        <div><strong>Location:</strong> {therapist.location || 'Not set'}</div>
                                                    </div>
                                                </div>

                                                {/* Status Controls */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {Object.values(AvailabilityStatus).map((statusOption) => (
                                                        <button
                                                            key={statusOption}
                                                            onClick={() => {
                                                                setStatus(statusOption);
                                                                if (onStatusChange) onStatusChange(statusOption);
                                                                if (statusOption === AvailabilityStatus.Busy) {
                                                                    setShowBusyTimerModal(true);
                                                                }
                                                            }}
                                                            className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                                                status === statusOption
                                                                    ? statusOption === AvailabilityStatus.Available 
                                                                        ? 'bg-green-100 border-green-300 text-green-800'
                                                                        : statusOption === AvailabilityStatus.Busy
                                                                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                                                                        : 'bg-gray-100 border-gray-300 text-gray-800'
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                                                                statusOption === AvailabilityStatus.Available ? 'bg-green-500' :
                                                                statusOption === AvailabilityStatus.Busy ? 'bg-yellow-500' :
                                                                'bg-gray-500'
                                                            }`} />
                                                            {statusOption}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ No Profile Found</h3>
                                                <p className="text-yellow-700 mb-4">Please complete your profile setup first.</p>
                                                <button
                                                    onClick={() => setActiveTab('profile')}
                                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                                >
                                                    Setup Profile
                                                </button>
                                            </div>
                                        )}
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
                                        <TherapistProfileForm
                                            therapist={therapist}
                                            onSave={handleSave}
                                            t={t}
                                        />
                                    </div>
                                )}

                                {activeTab === 'membership' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <MembershipPlansPage 
                                            therapist={therapist}
                                            onSave={handleSave}
                                            t={t}
                                        />
                                    </div>
                                )}

                                {activeTab === 'hotel-villa' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.hotelVilla || 'Hotel & Villa Services'}</h2>
                                        <HotelVillaOptIn 
                                            therapist={therapist}
                                            onSave={handleSave}
                                            t={t}
                                        />
                                    </div>
                                )}

                                {activeTab === 'terms' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <TherapistTermsPage t={t} />
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.settings || 'Settings'}</h2>
                                        <PushNotificationSettings />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Drawer - Mobile */}
            {isSideDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setIsSideDrawerOpen(false)} />
                    <div className="relative flex flex-col w-64 max-w-xs bg-white shadow-xl" ref={sideDrawerRef}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">{t.menu || 'Menu'}</h2>
                            <button
                                onClick={() => setIsSideDrawerOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsSideDrawerOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                        activeTab === item.id
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {activeTab === item.id ? item.coloredIcon : item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
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
                            <TherapistNotifications 
                                notifications={notifications}
                                t={t}
                            />
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

            <Footer />
        </div>
    );
};

export default TherapistDashboardPage;