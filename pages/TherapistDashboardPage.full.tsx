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
import PushNotificationSettings from '../components/PushNotificationSettings';
import Footer from '../components/Footer';
import TherapistNotifications from '../components/TherapistNotifications';
import BusyTimerModal from '../components/BusyTimerModal';
import '../utils/pricingHelper';

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

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onLogout, onNavigateToNotifications: _onNavigateToNotifications, onNavigate, onUpdateBookingStatus, onStatusChange, handleNavigateToAdminLogin, therapistId, existingTherapistData, bookings, notifications, t }) => {
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
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('status');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showBusyTimerModal, setShowBusyTimerModal] = useState(false);

    const locationInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sideDrawerRef = useRef<HTMLDivElement>(null);
    
    // 🔥 CRITICAL ID MISMATCH FIX - Three-tier priority system
    const fetchTherapistData = useCallback(async () => {
        setIsLoading(true);
        
        try {
            console.log('📖 Fetching therapist data for ID:', therapistId);
            
            let existingTherapist = null;
            
            console.log('🔍 CRITICAL FIX: Therapist ID Resolution');
            console.log('🎯 Provided therapistId:', therapistId);
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
                
                // 🎯 PRIORITY 3: Get current user and find by email (CRITICAL FALLBACK)
                if (!existingTherapist) {
                    try {
                        console.log('🔐 CRITICAL FALLBACK: Getting current user for email lookup...');
                        const currentUser = await therapistService.getCurrentUser();
                        console.log('🔍 Current user result:', currentUser);
                        console.log('📧 User email for lookup:', currentUser?.email);
                
                        if (currentUser && currentUser.email) {
                            console.log('✅ Found logged-in user:', currentUser.email);
                            
                            const therapistProfiles = await therapistService.getByEmail(currentUser.email);
                            console.log('📋 Therapist profiles found:', therapistProfiles);
                            
                            if (therapistProfiles && therapistProfiles.length > 0) {
                                existingTherapist = therapistProfiles[0];
                                console.log('✅ CRITICAL SUCCESS: Found therapist profile by email:', existingTherapist.name);
                            } else {
                                console.log('⚠️ No therapist profile found for email:', currentUser.email);
                            }
                        } else {
                            console.log('⚠️ No authenticated user found');
                        }
                    } catch (appwriteError: any) {
                        console.log('⚠️ Authentication or profile search failed:', appwriteError?.message || appwriteError);
                    }
                }
            }

            if (existingTherapist) {
                console.log('🎉 SUCCESS: Therapist data loaded successfully');
                setTherapist(existingTherapist);
                
                // Load data into form fields
                setName(existingTherapist.name || '');
                setDescription(existingTherapist.description || '');
                setProfilePicture(existingTherapist.profilePicture || '');
                setWhatsappNumber(existingTherapist.whatsappNumber || '');
                setYearsOfExperience(existingTherapist.yearsOfExperience || 0);
                setPricing(parsePricing(existingTherapist.pricing) || { 60: 0, 90: 0, 120: 0 });
                setHotelVillaPricing(parsePricing(existingTherapist.hotelVillaPricing) || { 60: 0, 90: 0, 120: 0 });
                setUseSamePricing(existingTherapist.useSamePricing ?? true);
                setDiscountPercentage(existingTherapist.discountPercentage || 0);
                setDiscountDuration(existingTherapist.discountDuration || 0);
                setIsDiscountActive(existingTherapist.isDiscountActive || false);
                setLocation(existingTherapist.location || '');
                setStatus(existingTherapist.status || AvailabilityStatus.Offline);
                setIsLicensed(existingTherapist.isLicensed || false);
                setLicenseNumber(existingTherapist.licenseNumber || '');
                
                if (existingTherapist.coordinates) {
                    const coords = parseCoordinates(existingTherapist.coordinates);
                    setCoordinates(coords);
                }
                
                if (existingTherapist.massageTypes) {
                    setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
                }
                
                if (existingTherapist.languages) {
                    setLanguages(parseLanguages(existingTherapist.languages));
                }
                
                setDataLoaded(true);
            } else {
                console.log('❌ No therapist data found - creating new profile');
                setDataLoaded(false);
            }
        } catch (error: any) {
            console.error('❌ Error fetching therapist data:', error);
            setToast({
                message: 'Error loading therapist data',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [therapistId, existingTherapistData]);

    useEffect(() => {
        fetchTherapistData();
    }, [fetchTherapistData]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target as Node)) {
                setIsSideDrawerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Header with burger menu */}
            <div className="bg-white shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSideDrawerOpen(true)}
                                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 lg:hidden"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="ml-4 lg:ml-0">
                                <h1 className="text-2xl font-bold text-gray-900">IndaStreet</h1>
                                <p className="text-sm text-gray-600">Therapist Dashboard</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="h-6 w-6" />
                                {notifications && notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>
                            
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {name ? name[0].toUpperCase() : 'T'}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium">{name || 'Therapist'}</span>
                                </button>
                                
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <button
                                            onClick={() => {
                                                setActiveTab('profile');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onLogout();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Drawer Backdrop */}
            {isSideDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSideDrawerOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div 
                ref={sideDrawerRef}
                className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isSideDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                        <button
                            onClick={() => setIsSideDrawerOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                <nav className="p-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                setActiveTab('status');
                                setIsSideDrawerOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === 'status' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <Activity className="h-5 w-5 mr-3" />
                            Online Status
                        </button>
                        
                        <button
                            onClick={() => {
                                setActiveTab('profile');
                                setIsSideDrawerOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === 'profile' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <ColoredProfileIcon className="h-5 w-5 mr-3" />
                            Profile & Pricing
                        </button>
                        
                        <button
                            onClick={() => {
                                setActiveTab('bookings');
                                setIsSideDrawerOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === 'bookings' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <Calendar className="h-5 w-5 mr-3" />
                            Bookings
                        </button>
                        
                        <button
                            onClick={() => {
                                setActiveTab('analytics');
                                setIsSideDrawerOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === 'analytics' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <TrendingUp className="h-5 w-5 mr-3" />
                            Analytics
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-80 bg-white shadow-lg h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-6">
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('status')}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                    activeTab === 'status' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <Activity className="h-5 w-5 mr-3" />
                                Online Status
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                    activeTab === 'profile' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <ColoredProfileIcon className="h-5 w-5 mr-3" />
                                Profile & Pricing
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                    activeTab === 'bookings' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <Calendar className="h-5 w-5 mr-3" />
                                Bookings ({bookings?.length || 0})
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                    activeTab === 'analytics' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <TrendingUp className="h-5 w-5 mr-3" />
                                Analytics
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6">
                    {/* Tab Content */}
                    {activeTab === 'status' && (
                        <div className="max-w-4xl">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Online Status</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value as AvailabilityStatus;
                                                setStatus(newStatus);
                                                if (onStatusChange) {
                                                    onStatusChange(newStatus);
                                                }
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value={AvailabilityStatus.Available}>Available</option>
                                            <option value={AvailabilityStatus.Busy}>Busy</option>
                                            <option value={AvailabilityStatus.Offline}>Offline</option>
                                        </select>
                                    </div>
                                    
                                    {status === AvailabilityStatus.Busy && (
                                        <button
                                            onClick={() => setShowBusyTimerModal(true)}
                                            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                                        >
                                            Set Busy Timer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-4xl">
                            <TherapistProfileForm
                                therapist={therapist}
                                onSave={onSave}
                                existingTherapistData={existingTherapistData}
                                therapistId={therapistId}
                            />
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="max-w-6xl">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
                                <p className="text-gray-600 mt-2">Manage your upcoming and past bookings</p>
                            </div>
                            
                            {bookings && bookings.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2">
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
                                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                                    <p className="text-gray-600">Your upcoming bookings will appear here</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="max-w-6xl">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                                <p className="text-gray-600 mt-2">Track your performance and earnings</p>
                            </div>
                            
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                                <AnalyticsCard
                                    title="Total Bookings"
                                    value={bookings?.length || 0}
                                    description="All time bookings"
                                />
                                <AnalyticsCard
                                    title="This Month"
                                    value={bookings?.filter(b => new Date(b.startTime).getMonth() === new Date().getMonth()).length || 0}
                                    description="Bookings this month"
                                />
                                <AnalyticsCard
                                    title="Rating"
                                    value={therapist?.rating || 0}
                                    description={`Based on ${therapist?.reviewCount || 0} reviews`}
                                />
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <p className="text-gray-600">Detailed analytics coming soon...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications Modal */}
            {showNotifications && (
                <TherapistNotifications
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    t={t}
                />
            )}

            {/* Busy Timer Modal */}
            {showBusyTimerModal && (
                <BusyTimerModal
                    onClose={() => setShowBusyTimerModal(false)}
                    onSetTimer={(minutes) => {
                        console.log(`Set busy timer for ${minutes} minutes`);
                        setShowBusyTimerModal(false);
                    }}
                />
            )}

            {/* Toast Notifications */}
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                    toast.type === 'success' ? 'bg-green-500 text-white' :
                    toast.type === 'error' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-white'
                }`}>
                    {toast.message}
                    <button
                        onClick={() => setToast(null)}
                        className="ml-4 text-white hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default TherapistDashboardPage;