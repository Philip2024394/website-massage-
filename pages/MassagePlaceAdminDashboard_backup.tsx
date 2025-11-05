import React, { useState, useEffect } from 'react';
import { 
    BarChart, 
    Users, 
    Building, 
    Settings, 
    LogOut, 
    CreditCard, 
    DollarSign, 
    Menu, 
    X, 
    Clock,
    Star,
    Camera,
    Scissors,
    Hotel,
    Calendar,
    Coins,
    History
} from 'lucide-react';
import { authService } from '../lib/appwriteService';
import { Place } from '../types';
import CoinHistoryPage from './CoinHistoryPage';
import CoinShopPage from './CoinShopPage';
import RewardBannerDisplay from '../components/RewardBannerDisplay';
import { soundNotificationService } from '../utils/soundNotificationService';

interface MassagePlaceAdminDashboardProps {
    place: Place;
    onLogout: () => void;
    onNavigate?: (page: string) => void;
    initialTab?: PlaceDashboardPage;
}

type PlaceDashboardPage = 
    | 'place-analytics' 
    | 'place-profile'
    | 'place-services'
    | 'place-rooms'
    | 'place-staff'
    | 'place-bookings'
    | 'place-pricing'
    | 'place-schedule'
    | 'place-gallery'
    | 'customer-feedback'
    | 'place-payments'
    | 'place-marketing'
    | 'place-reports'
    | 'place-settings';

const MassagePlaceAdminDashboard: React.FC<MassagePlaceAdminDashboardProps> = ({ 
    place, 
    onLogout, 
    onNavigate,
    initialTab 
}) => {
    const [activePage, setActivePage] = useState<PlaceDashboardPage>(initialTab || 'place-analytics');
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

    // Function to check if place is currently open based on opening/closing times
    const isCurrentlyOpen = () => {
        // First check if place exists and is activated by admin
        if (!place || !place.isLive) {
            return false; // Admin has deactivated this place or place doesn't exist
        }
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
        
        // Parse opening and closing times (assuming format like "09:00")
        const parseTime = (timeStr: string) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        };
        
        const openingMinutes = parseTime(place?.openingTime || "09:00");
        const closingMinutes = parseTime(place?.closingTime || "18:00");
        
        // Handle overnight business hours (e.g., 22:00 to 06:00)
        if (closingMinutes < openingMinutes) {
            return currentTime >= openingMinutes || currentTime <= closingMinutes;
        }
        
        return currentTime >= openingMinutes && currentTime <= closingMinutes;
    };

    const [isOpen, setIsOpen] = useState(isCurrentlyOpen());

    // Update online status every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setIsOpen(isCurrentlyOpen());
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [place?.openingTime, place?.closingTime, place?.isLive]);

    // WhatsApp contact notification monitoring for massage places
    useEffect(() => {
        const checkWhatsAppNotifications = async () => {
            try {
                // Simulate checking for new WhatsApp contact notifications
                // In real implementation, this would check your backend/notification service
                const currentNotifications = Math.random() > 0.95 ? 1 : 0; // Random simulation
                
                if (currentNotifications > 0) {
                    console.log('🔔 New WhatsApp contact detected for massage place!');
                    await soundNotificationService.showWhatsAppContactNotification();
                }
            } catch (error) {
                console.error('Error checking notifications:', error);
            }
        };

        // Check every 30 seconds for new WhatsApp contacts
        const notificationInterval = setInterval(checkWhatsAppNotifications, 30000);
        
        return () => clearInterval(notificationInterval);
    }, []);

    // Booking notification monitoring 
    useEffect(() => {
        const checkBookingNotifications = async () => {
            try {
                // Simulate checking for new booking notifications
                const newBookings = Math.random() > 0.98 ? 1 : 0; // Random simulation
                
                if (newBookings > 0) {
                    console.log('🔔 New booking received for massage place!');
                    await soundNotificationService.showBookingNotification(
                        'Customer Name',
                        'Swedish Massage',
                        'booking123'
                    );
                }
            } catch (error) {
                console.error('Error checking booking notifications:', error);
            }
        };

        // Check every 45 seconds for new bookings
        const bookingInterval = setInterval(checkBookingNotifications, 45000);
        
        return () => clearInterval(bookingInterval);
    }, []);

    useEffect(() => {
        // Initialize anonymous session for Appwrite access
        const initSession = async () => {
            try {
                await authService.createAnonymousSession();
            } catch (error) {
                console.error('Failed to create session:', error);
            }
        };
        initSession();
    }, []);

    const navigationItems = [
        {
            id: 'place-analytics',
            label: 'Business Analytics',
            icon: BarChart,
            description: 'Track revenue, bookings, and business performance'
        },
        {
            id: 'place-profile',
            label: 'Spa Profile',
            icon: Building,
            description: 'Manage your spa/massage place information'
        },
        {
            id: 'place-services',
            label: 'Service Menu',
            icon: Scissors,
            description: 'Manage massage services, packages, and offerings'
        },
        {
            id: 'place-rooms',
            label: 'Treatment Rooms',
            icon: Hotel,
            description: 'Manage treatment rooms and facilities'
        },
        {
            id: 'place-staff',
            label: 'Staff Management',
            icon: Users,
            description: 'Manage therapists, schedules, and staff'
        },
        {
            id: 'place-bookings',
            label: 'Reservations',
            icon: Calendar,
            description: 'View and manage customer bookings'
        },
        {
            id: 'place-pricing',
            label: 'Pricing & Packages',
            icon: DollarSign,
            description: 'Set pricing for services and create packages'
        },
        {
            id: 'place-schedule',
            label: 'Operating Hours',
            icon: Clock,
            description: 'Manage business hours and availability'
        },
        {
            id: 'place-gallery',
            label: 'Spa Gallery',
            icon: Camera,
            description: 'Showcase your facilities and ambiance'
        },
        {
            id: 'customer-feedback',
            label: 'Customer Reviews',
            icon: Star,
            description: 'View and manage customer feedback'
        },
        {
            id: 'place-payments',
            label: 'Payment Management',
            icon: CreditCard,
            description: 'Handle payments, refunds, and financial records'
        },
        {
            id: 'place-marketing',
            label: 'Marketing & Promotions',
            icon: Coins,
            description: 'Manage discounts, loyalty programs, and promotions'
        },
        {
            id: 'place-reports',
            label: 'Business Reports',
            icon: History,
            description: 'Generate detailed business and financial reports'
        },
        {
            id: 'place-settings',
            label: 'Business Settings',
            icon: Settings,
            description: 'Configure business policies and preferences'
        }
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'place-analytics':
                return <PlaceAnalyticsPage place={place} onNavigate={onNavigate} />;
            case 'place-profile':
                return <PlaceProfilePage place={place} />;
            case 'place-services':
                return <PlaceServicesPage place={place} />;
            case 'place-rooms':
                return <PlaceRoomsPage place={place} />;
            case 'place-staff':
                return <PlaceStaffPage place={place} />;
            case 'place-bookings':
                return <PlaceBookingsPage place={place} />;
            case 'place-pricing':
                return <PlacePricingPage place={place} />;
            case 'place-schedule':
                return <PlaceSchedulePage place={place} />;
            case 'place-gallery':
                return <PlaceGalleryPage place={place} />;
            case 'customer-feedback':
                return <CustomerFeedbackPage place={place} />;
            case 'place-payments':
                return <PlacePaymentsPage place={place} />;
            case 'place-marketing':
                return <PlaceMarketingPage place={place} />;
            case 'place-reports':
                return <PlaceReportsPage place={place} />;
            case 'place-settings':
                return <PlaceSettingsPage place={place} />;
            default:
                return <PlaceAnalyticsPage place={place} onNavigate={onNavigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Side Drawer Overlay */}
            {isSideDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsSideDrawerOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                isSideDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Drawer Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Spa Business Manager</h2>
                        <p className="text-orange-100 text-sm">{place?.name || 'Your Massage Place'}</p>
                    </div>
                    <button
                        onClick={() => setIsSideDrawerOpen(false)}
                        className="text-white hover:bg-orange-600 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawer Navigation Items */}
                <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
                    {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActivePage(item.id as PlaceDashboardPage);
                                    setIsSideDrawerOpen(false);
                                }}
                                className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                                    activePage === item.id
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-medium block">{item.label}</span>
                                    <span className={`text-xs ${
                                        activePage === item.id ? 'text-orange-100' : 'text-gray-500'
                                    }`}>
                                        {item.description}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Drawer Footer - Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
                    <button
                        onClick={() => {
                            onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col min-h-screen">
                {/* Top Header - Same as Home Page */}
                <header className="bg-white p-4 shadow-md sticky top-0 z-20">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                        <div className="flex items-center gap-3 text-gray-600">
                            {/* Dashboard Status Indicators */}
                            <div className="flex items-center gap-2">
                                {/* Admin Activation Status */}
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                    place.isLive 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        place.isLive ? 'bg-blue-500' : 'bg-gray-500'
                                    }`}></div>
                                    {place.isLive ? 'Active' : 'Deactivated'}
                                </div>

                                {/* Opening Hours Status */}
                                {place.isLive && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                        isOpen 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full ${
                                            isOpen ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                        {isOpen ? 'Open' : 'Closed'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Menu Button */}
                            <button
                                onClick={() => setIsSideDrawerOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Dashboard Menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Place Name and Hours - Secondary Row */}
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{place.name} Dashboard</span>
                        <span>
                            {place.openingTime} - {place.closingTime}
                        </span>
                    </div>
                </header>

                {/* Reward Banner Display */}
                <RewardBannerDisplay />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>

                {/* Footer - Same styling as rest of app */}
                <footer className="bg-white border-t border-gray-200 px-4 py-6 mt-auto">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Company Info */}
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    <span className="text-black">Inda</span>
                                    <span className="text-orange-500">Street</span>
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Your trusted massage place dashboard. Manage your business, track analytics, and grow your customer base.
                                </p>
                                <div className="text-xs text-gray-500">
                                    © 2024 IndaStreet. All rights reserved.
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Quick Access</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <button 
                                            onClick={() => setActivePage('place-analytics')}
                                            className="text-gray-600 hover:text-orange-500 transition-colors"
                                        >
                                            Business Analytics
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => setActivePage('place-profile')}
                                            className="text-gray-600 hover:text-orange-500 transition-colors"
                                        >
                                            Spa Profile
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => setActivePage('place-bookings')}
                                            className="text-gray-600 hover:text-orange-500 transition-colors"
                                        >
                                            Reservations
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => setActivePage('place-staff')}
                                            className="text-gray-600 hover:text-orange-500 transition-colors"
                                        >
                                            Staff Management
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <button 
                                            onClick={() => {
                                                if (onNavigate) {
                                                    onNavigate('service-terms');
                                                }
                                            }}
                                            className="text-gray-600 hover:text-orange-500 transition-colors"
                                        >
                                            Terms of Service
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => {
                                                if (onNavigate) {
                                                    onNavigate('privacy-policy');
                                                }
                                            }}
                                            className="text-gray-600 hover:text-orange-500 transition-colors"
                                        >
                                            Privacy Policy
                                        </button>
                                    </li>
                                    <li>
                                        <span className="text-gray-600">Help Center</span>
                                    </li>
                                    <li>
                                        <span className="text-gray-600">Contact Support</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// Business-focused components for massage place dashboard
const PlaceAnalyticsPage: React.FC<{ place: Place; onNavigate?: (page: string) => void }> = ({ place, onNavigate }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">Business Analytics</h2>
            <span className="text-sm text-gray-500">Spa Performance Dashboard</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                        <p className="text-2xl font-bold text-gray-900">1,247</p>
                        <p className="text-xs text-green-600 mt-1">+12% this month</p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-500" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{place?.rating?.toFixed(1) || '4.8'}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on 89 reviews</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">$28,450</p>
                        <p className="text-xs text-green-600 mt-1">+18% vs last month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Active Staff</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-xs text-gray-500 mt-1">Professional therapists</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
            </div>
        </div>

        {/* Business Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-48 flex items-center justify-center text-gray-500">
                    <BarChart className="w-12 h-12 mb-2" />
                    <p>Revenue analytics chart</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Traditional Thai Massage</span>
                        <span className="text-sm font-medium">156 bookings</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Aromatherapy Massage</span>
                        <span className="text-sm font-medium">134 bookings</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hot Stone Massage</span>
                        <span className="text-sm font-medium">98 bookings</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Deep Tissue Massage</span>
                        <span className="text-sm font-medium">87 bookings</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Business-focused components for spa management
const PlaceProfilePage: React.FC<{ place: Place }> = ({ place }) => {
    // State for profile form fields
    const [placeName, setPlaceName] = useState(place?.name || '');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [location, setLocation] = useState(place?.location || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [openingTime, setOpeningTime] = useState(place?.openingTime || '09:00');
    const [closingTime, setClosingTime] = useState(place?.closingTime || '21:00');
    const [pricing, setPricing] = useState({ 60: 0, 90: 0, 120: 0 });
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [additionalServices, setAdditionalServices] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [isLicensed, setIsLicensed] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [rooms, setRooms] = useState<number>(1);
    const [staff, setStaff] = useState<number>(1);
    const [parkingAvailable, setParkingAvailable] = useState(false);
    const [wifiAvailable, setWifiAvailable] = useState(false);
    const [acAvailable, setAcAvailable] = useState(false);
    const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState('');

    const availableMassageTypes = [
        'Traditional Thai Massage', 'Swedish Massage', 'Deep Tissue Massage', 'Hot Stone Massage',
        'Aromatherapy Massage', 'Reflexology', 'Balinese Massage', 'Sports Massage',
        'Prenatal Massage', 'Couples Massage', 'Head & Shoulder Massage', 'Full Body Massage'
    ];

    const availableServices = [
        'Steam Bath', 'Sauna', 'Jacuzzi', 'Body Scrub', 'Facial Treatment',
        'Manicure & Pedicure', 'Hair Spa', 'Meditation Session', 'Yoga Classes',
        'Healthy Refreshments', 'Private Treatment Rooms', 'Couple Packages'
    ];

    const availableLanguages = [
        'English', 'Indonesian', 'Mandarin', 'Japanese', 'Korean', 'Thai', 'Hindi', 'Arabic'
    ];

    const handleSave = async () => {
        // Here you would save to your backend/Appwrite
        console.log('Saving place profile:', {
            placeName, description, profilePicture, mainImage, whatsappNumber,
            location, phoneNumber, email, website, openingTime, closingTime,
            pricing, massageTypes, additionalServices, languages,
            isLicensed, licenseNumber, rooms, staff, parkingAvailable, wifiAvailable, acAvailable
        });
        // TODO: Integrate with actual save functionality
    };

    const formatPriceDisplay = (price: number) => {
        if (price === 0) return '';
        return `${(price / 1000).toFixed(0)}k`;
    };

    const handlePriceChange = (duration: string, value: string) => {
        const numericValue = parseInt(value.replace(/[^\d]/g, '')) * 1000;
        setPricing({ ...pricing, [duration]: numericValue });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Spa Profile Management</h2>
                <button
                    onClick={handleSave}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Save Profile
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                {/* Profile Picture Upload */}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Spa Profile Picture</label>
                    <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        {profilePicture ? (
                            <img src={profilePicture} alt="Spa" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <span className="text-gray-500">Upload Photo</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Upload your spa's main photo</p>
                </div>

                {/* Main Image Upload */}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Main Cover Image</label>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        {mainImage ? (
                            <img src={mainImage} alt="Spa Cover" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <span className="text-gray-500">Upload Cover Image</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Main image displayed on your spa card</p>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Spa/Business Name</label>
                        <input
                            type="text"
                            value={placeName}
                            onChange={(e) => setPlaceName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Your Spa Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="spa@example.com"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setDescription(e.target.value);
                            }
                        }}
                        rows={4}
                        maxLength={500}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Describe your spa services, ambiance, and what makes you special..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">+62</span>
                            <input
                                type="tel"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="81234567890"
                                className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="021-1234567"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="https://yoursite.com"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location Address</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Full address of your spa"
                    />
                </div>

                {/* Operating Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                        <input
                            type="time"
                            value={openingTime}
                            onChange={(e) => setOpeningTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                        <input
                            type="time"
                            value={closingTime}
                            onChange={(e) => setClosingTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                {/* Pricing */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Service Pricing</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-600">60 minutes</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="text"
                                    value={formatPriceDisplay(pricing[60])}
                                    onChange={(e) => handlePriceChange('60', e.target.value)}
                                    placeholder="250k"
                                    className="block w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600">90 minutes</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="text"
                                    value={formatPriceDisplay(pricing[90])}
                                    onChange={(e) => handlePriceChange('90', e.target.value)}
                                    placeholder="350k"
                                    className="block w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600">120 minutes</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="text"
                                    value={formatPriceDisplay(pricing[120])}
                                    onChange={(e) => handlePriceChange('120', e.target.value)}
                                    placeholder="450k"
                                    className="block w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Massage Types */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Massage Types Offered</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableMassageTypes.map((type) => (
                            <label key={type} className="flex items-center">
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
                                    className="mr-2"
                                />
                                <span className="text-sm">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional Services */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Additional Services</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableServices.map((service) => (
                            <label key={service} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={additionalServices.includes(service)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setAdditionalServices([...additionalServices, service]);
                                        } else {
                                            setAdditionalServices(additionalServices.filter(s => s !== service));
                                        }
                                    }}
                                    className="mr-2"
                                />
                                <span className="text-sm">{service}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Languages */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Languages Spoken</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableLanguages.map((language) => (
                            <label key={language} className="flex items-center">
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
                                    className="mr-2"
                                />
                                <span className="text-sm">{language}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Treatment Rooms</label>
                        <div className="flex items-center gap-3 mt-1">
                            <button
                                type="button"
                                onClick={() => setRooms(Math.max(1, rooms - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                                -
                            </button>
                            <span className="text-xl font-bold text-gray-900">{rooms}</span>
                            <button
                                type="button"
                                onClick={() => setRooms(Math.min(20, rooms + 1))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Staff</label>
                        <div className="flex items-center gap-3 mt-1">
                            <button
                                type="button"
                                onClick={() => setStaff(Math.max(1, staff - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                                -
                            </button>
                            <span className="text-xl font-bold text-gray-900">{staff}</span>
                            <button
                                type="button"
                                onClick={() => setStaff(Math.min(50, staff + 1))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Facilities */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Facilities Available</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={parkingAvailable}
                                onChange={(e) => setParkingAvailable(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm">Parking Available</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={wifiAvailable}
                                onChange={(e) => setWifiAvailable(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm">Free WiFi</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={acAvailable}
                                onChange={(e) => setAcAvailable(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm">Air Conditioning</span>
                        </label>
                    </div>
                </div>

                {/* License Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <label className="text-sm font-semibold text-green-800">Licensed Business Badge</label>
                        </div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isLicensed}
                                onChange={(e) => setIsLicensed(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-green-800">Licensed Business</span>
                        </label>
                    </div>
                    {isLicensed && (
                        <div className="mt-3">
                            <label className="block text-xs font-medium text-green-700 mb-1">Business License Number</label>
                            <input
                                type="text"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                placeholder="Enter your business license number"
                                className="block w-full px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PlaceRoomsPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Treatment Rooms</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage your treatment rooms, facilities, and equipment.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">Room 1 - VIP Suite</h3>
                    <p className="text-sm text-gray-600">Private room with jacuzzi</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Available</span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">Room 2 - Couples Room</h3>
                    <p className="text-sm text-gray-600">Double massage beds</p>
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Occupied</span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">Room 3 - Standard</h3>
                    <p className="text-sm text-gray-600">Single massage room</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Available</span>
                </div>
            </div>
        </div>
    </div>
);

const PlaceServicesPage: React.FC<{ place: Place }> = ({ place }) => {
    const [services, setServices] = useState<string[]>(
        typeof place.massageTypes === 'string' 
            ? place.massageTypes.split(',').map(s => s.trim()).filter(Boolean)
            : Array.isArray(place.massageTypes) 
                ? place.massageTypes 
                : []
    );
    const [additionalServices, setAdditionalServices] = useState<string[]>([]);
    const [description, setDescription] = useState(place.description || '');
    const [isEditing, setIsEditing] = useState(false);

    const availableMassageTypes = [
        'Balinese Massage', 'Swedish Massage', 'Deep Tissue Massage', 'Hot Stone Massage',
        'Thai Massage', 'Aromatherapy Massage', 'Sports Massage', 'Reflexology',
        'Prenatal Massage', 'Couples Massage', 'Traditional Indonesian Massage'
    ];

    const availableAdditionalServices = [
        'Steam Bath', 'Sauna', 'Jacuzzi', 'Body Scrub', 'Facial Treatment',
        'Manicure & Pedicure', 'Hair Spa', 'Meditation Session', 'Yoga Classes',
        'Healthy Refreshments', 'Private Treatment Rooms', 'Couple Packages',
        'Steam Room', 'Hair Salon Services', 'Nail Art', 'Hot Tub', 'Cold Plunge Pool',
        'Oxygen Bar', 'Chromotherapy', 'Himalayan Salt Room', 'Infrared Sauna',
        'Hydrotherapy', 'Mud Bath', 'Waxing Services', 'Eyebrow Threading',
        'Foot Reflexology', 'Head Massage', 'Scalp Treatment', 'Body Wraps',
        'Detox Programs', 'Wellness Consultation', 'Nutrition Counseling'
    ];

    const handleServiceToggle = (service: string) => {
        setServices(prev => 
            prev.includes(service) 
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleAdditionalServiceToggle = (service: string) => {
        setAdditionalServices(prev => 
            prev.includes(service) 
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleSave = async () => {
        // Here you would save to your backend/Appwrite
        console.log('Saving services:', { services, additionalServices, description });
        setIsEditing(false);
        // TODO: Integrate with actual save functionality
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Services Management</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {isEditing ? 'Cancel' : 'Edit Services'}
                </button>
            </div>

            {/* Place Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Place Description</h3>
                {isEditing ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={4}
                        placeholder="Describe your massage place, ambiance, and what makes it special..."
                    />
                ) : (
                    <p className="text-gray-700">{description || 'No description provided yet.'}</p>
                )}
            </div>

            {/* Massage Types */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Massage Types Offered</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableMassageTypes.map(massageType => (
                        <label key={massageType} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={services.includes(massageType)}
                                onChange={() => handleServiceToggle(massageType)}
                                disabled={!isEditing}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className={`text-sm ${!isEditing ? 'text-gray-600' : 'text-gray-900'}`}>
                                {massageType}
                            </span>
                        </label>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                    Selected: {services.length} massage types
                </p>
            </div>

            {/* Additional Services */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Services & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableAdditionalServices.map(service => (
                        <label key={service} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={additionalServices.includes(service)}
                                onChange={() => handleAdditionalServiceToggle(service)}
                                disabled={!isEditing}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className={`text-sm ${!isEditing ? 'text-gray-600' : 'text-gray-900'}`}>
                                {service}
                            </span>
                        </label>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                    Selected: {additionalServices.length} additional services
                </p>
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

const HotelVillaServicesPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Hotel & Villa Services</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Hotel Services</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            place.hotelVillaServiceStatus === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {place.hotelVillaServiceStatus || 'Not Opted In'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Villa Services</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            place.hotelVillaServiceStatus === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {place.hotelVillaServiceStatus || 'Not Opted In'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Pricing</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Hotel Discount</span>
                        <span className="text-gray-900 font-semibold">{place.hotelDiscount || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Villa Discount</span>
                        <span className="text-gray-900 font-semibold">{place.villaDiscount || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Service Radius</span>
                        <span className="text-gray-900 font-semibold">{place.serviceRadius || 7} km</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PlaceSchedulePage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Schedule Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h3>
                    <p className="text-gray-600">Opening: {place.openingTime}</p>
                    <p className="text-gray-600">Closing: {place.closingTime}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability Settings</h3>
                    <p className="text-gray-600">Manage daily schedules and special hours.</p>
                </div>
            </div>
        </div>
    </div>
);

const PlaceGalleryPage: React.FC<{ place: Place }> = ({ place }) => {
    const [mainImage, setMainImage] = useState(place.profilePicture || '');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const maxGalleryImages = 6; // Massage places get 6 additional images plus main image

    const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // TODO: Implement actual image upload to Appwrite Storage
            // For now, create a placeholder URL
            const imageUrl = URL.createObjectURL(file);
            setMainImage(imageUrl);
            console.log('Main image uploaded:', imageUrl);
        } catch (error) {
            console.error('Failed to upload main image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || galleryImages.length >= maxGalleryImages) return;

        setIsUploading(true);
        try {
            // TODO: Implement actual image upload to Appwrite Storage
            const imageUrl = URL.createObjectURL(file);
            setGalleryImages(prev => [...prev, imageUrl]);
            console.log('Gallery image uploaded:', imageUrl);
        } catch (error) {
            console.error('Failed to upload gallery image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            // TODO: Save to backend/Appwrite
            console.log('Saving gallery:', { mainImage, galleryImages });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save gallery:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Gallery Management</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {isEditing ? 'Cancel' : 'Edit Gallery'}
                </button>
            </div>

            {/* Main Image Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Main Display Image</h3>
                <p className="text-gray-600 mb-4">This image will be displayed as the primary image on your business card in search results.</p>
                
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                            {mainImage ? (
                                <img src={mainImage} alt="Main" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageUpload}
                                disabled={isUploading}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Recommended: 800x600px, JPG or PNG, max 5MB
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Images Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Additional Gallery Images ({galleryImages.length}/{maxGalleryImages})
                </h3>
                <p className="text-gray-600 mb-4">
                    Showcase your facilities, treatment rooms, ambiance, and services. You can upload up to {maxGalleryImages} additional images.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <div className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden">
                                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => handleRemoveGalleryImage(index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add New Image Slot */}
                    {isEditing && galleryImages.length < maxGalleryImages && (
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            <label className="cursor-pointer flex flex-col items-center space-y-2">
                                <Camera className="w-8 h-8 text-gray-400" />
                                <span className="text-sm text-gray-500">Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleGalleryImageUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {isEditing && galleryImages.length >= maxGalleryImages && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                        You've reached the maximum of {maxGalleryImages} gallery images. Remove an image to add a new one.
                    </p>
                )}
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isUploading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isUploading ? 'Uploading...' : 'Save Gallery'}
                    </button>
                </div>
            )}
        </div>
    );
};

const CustomerFeedbackPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Customer Feedback</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center py-8">
                <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Average Rating: {place.rating.toFixed(1)}</h3>
                <p className="text-gray-600">Based on {place.reviewCount} reviews</p>
            </div>
            {/* Customer reviews and feedback would go here */}
        </div>
    </div>
);

const PlacePaymentsPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage payment methods, transaction history, and financial reports.</p>
            {/* Payment management would go here */}
        </div>
    </div>
);

const PlaceStaffPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage your therapist staff, schedules, and performance.</p>
            <div className="mt-4 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Sarah Johnson</h3>
                        <p className="text-sm text-gray-600">Senior Therapist - 5 years experience</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Mike Chen</h3>
                        <p className="text-sm text-gray-600">Massage Therapist - 3 years experience</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                </div>
            </div>
        </div>
    </div>
);

const PlaceBookingsPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Reservations & Bookings</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">View and manage customer appointments and reservations.</p>
            <div className="mt-4 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold">Emma Watson</h3>
                            <p className="text-sm text-gray-600">Thai Massage - 90 minutes</p>
                            <p className="text-sm text-gray-500">Today, 2:00 PM</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Confirmed</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PlacePricingPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Pricing & Packages</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Set pricing for your services and create special packages.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">Standard Pricing</h3>
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm">60 minutes</span>
                            <span className="text-sm font-medium">$50</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">90 minutes</span>
                            <span className="text-sm font-medium">$75</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">120 minutes</span>
                            <span className="text-sm font-medium">$100</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PlaceMarketingPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Marketing & Promotions</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Create discounts, loyalty programs, and promotional campaigns.</p>
            <div className="mt-4 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">First Visit Discount</h3>
                    <p className="text-sm text-gray-600">20% off for new customers</p>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                </div>
            </div>
        </div>
    </div>
);

const PlaceReportsPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Business Reports</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Generate detailed financial and operational reports.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50">
                    <h3 className="font-semibold">Monthly Revenue Report</h3>
                    <p className="text-sm text-gray-600">Download revenue analysis</p>
                </button>
                <button className="border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50">
                    <h3 className="font-semibold">Staff Performance Report</h3>
                    <p className="text-sm text-gray-600">View staff metrics</p>
                </button>
            </div>
        </div>
    </div>
);

const PlaceSettingsPage: React.FC<{ place: Place }> = ({ place }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Business Settings</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Configure business policies, notifications, and account preferences.</p>
            <div className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Hours</label>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                        <input type="time" defaultValue="09:00" className="block w-full border border-gray-300 rounded-md px-3 py-2" />
                        <input type="time" defaultValue="21:00" className="block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                </div>
                <div>
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Enable email notifications</span>
                    </label>
                </div>
            </div>
        </div>
    </div>
    );

export default MassagePlaceAdminDashboard;