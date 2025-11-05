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
    | 'place-pricing'
    | 'place-schedule'
    | 'place-gallery'
    | 'hotel-villa-services'
    | 'customer-feedback'
    | 'place-bookings'
    | 'place-payments'
    | 'place-staff'
    | 'place-settings'
    | 'coin-history'
    | 'coin-shop';

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
        // First check if place is activated by admin
        if (!place.isLive) {
            return false; // Admin has deactivated this place
        }
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
        
        // Parse opening and closing times (assuming format like "09:00")
        const parseTime = (timeStr: string) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        };
        
        const openingMinutes = parseTime(place.openingTime || "09:00");
        const closingMinutes = parseTime(place.closingTime || "18:00");
        
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
    }, [place.openingTime, place.closingTime, place.isLive]);

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
            label: 'Analytics',
            icon: BarChart,
            description: 'View performance metrics and insights'
        },
        {
            id: 'place-profile',
            label: 'Profile',
            icon: Building,
            description: 'Manage place information and details'
        },
        {
            id: 'place-services',
            label: 'Services',
            icon: Scissors,
            description: 'Manage massage types and additional services'
        },
        {
            id: 'place-pricing',
            label: 'Pricing',
            icon: DollarSign,
            description: 'Set pricing for different services and durations'
        },
        {
            id: 'hotel-villa-services',
            label: 'Hotel/Villa Services',
            icon: Hotel,
            description: 'Manage hotel and villa service offerings'
        },
        {
            id: 'place-schedule',
            label: 'Schedule',
            icon: Clock,
            description: 'Manage operating hours and availability'
        },
        {
            id: 'place-gallery',
            label: 'Gallery',
            icon: Camera,
            description: 'Manage photos and facility images'
        },
        {
            id: 'place-bookings',
            label: 'Bookings',
            icon: Calendar,
            description: 'View and manage customer bookings'
        },
        {
            id: 'customer-feedback',
            label: 'Feedback',
            icon: Star,
            description: 'View customer reviews and ratings'
        },
        {
            id: 'place-staff',
            label: 'Staff',
            icon: Users,
            description: 'Manage therapist staff and schedules'
        },
        {
            id: 'place-payments',
            label: 'Payments',
            icon: CreditCard,
            description: 'Manage payment methods and transactions'
        },
        {
            id: 'coin-history',
            label: 'Coin History',
            icon: History,
            description: 'View your coin rewards and transaction history'
        },
        {
            id: 'coin-shop',
            label: 'Coin Shop',
            icon: Coins,
            description: 'Redeem coins for rewards and products'
        },
        {
            id: 'place-settings',
            label: 'Settings',
            icon: Settings,
            description: 'General settings and preferences'
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
            case 'place-pricing':
                return <PlacePricingPage place={place} />;
            case 'hotel-villa-services':
                return <HotelVillaServicesPage place={place} />;
            case 'place-schedule':
                return <PlaceSchedulePage place={place} />;
            case 'place-gallery':
                return <PlaceGalleryPage place={place} />;
            case 'place-bookings':
                return <PlaceBookingsPage place={place} />;
            case 'customer-feedback':
                return <CustomerFeedbackPage place={place} />;
            case 'place-staff':
                return <PlaceStaffPage place={place} />;
            case 'place-payments':
                return <PlacePaymentsPage place={place} />;
            case 'coin-history':
                return onNavigate ? <CoinHistoryPage onNavigate={onNavigate} /> : null;
            case 'coin-shop':
                return onNavigate ? <CoinShopPage onNavigate={onNavigate} /> : null;
            case 'place-settings':
                return <PlaceSettingsPage place={place} />;
            default:
                return <PlaceAnalyticsPage place={place} />;
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
                        <h2 className="text-xl font-bold text-white">Massage Place Dashboard</h2>
                        <p className="text-orange-100 text-sm">{place.name}</p>
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
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">{place.name} Dashboard</h1>
                        
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
                        
                        <div className="text-xs text-gray-500">
                            {place.openingTime} - {place.closingTime}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSideDrawerOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                        <Menu className="w-5 h-5" />
                        <span>Menu</span>
                    </button>
                </header>

                {/* Reward Banner Display */}
                <RewardBannerDisplay />

                {/* Page Content */}
                <main className="flex-1 p-6 pb-20">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// Placeholder components for different pages
const PlaceAnalyticsPage: React.FC<{ place: Place; onNavigate?: (page: string) => void }> = ({ place, onNavigate }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">234</p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-500" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{place.rating.toFixed(1)}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">$12,450</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Hotel/Villa Orders</p>
                        <p className="text-2xl font-bold text-gray-900">45</p>
                    </div>
                    <Hotel className="w-8 h-8 text-blue-500" />
                </div>
            </div>
        </div>

        {/* Coin History Button */}
        {onNavigate && (
            <button
                onClick={() => onNavigate('coin-history')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-orange-200 hover:border-orange-400 mt-6"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl">
                        💰
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900">Coin History</h3>
                        <p className="text-sm text-gray-600">View your coin rewards and transactions</p>
                    </div>
                </div>
                <History className="w-6 h-6 text-orange-600" />
            </button>
        )}

        {/* Coin Shop Button */}
        {onNavigate && (
            <button
                onClick={() => onNavigate('coin-shop')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-green-200 hover:border-green-400 mt-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl">
                        🛍️
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900">Coin Rewards Shop</h3>
                        <p className="text-sm text-gray-600">Redeem coins for rewards</p>
                    </div>
                </div>
                <Coins className="w-6 h-6 text-green-600" />
            </button>
        )}
    </div>
);

const PlaceProfilePage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Place Profile</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage your massage place profile, description, location, and contact information.</p>
            {/* Profile management form would go here */}
        </div>

        {/* Website Information Section - For Indastreet Partners Directory */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🤝 Indastreet Partners Directory (Optional)
            </h3>
            <p className="text-gray-700 mb-4">
                Add your website to be featured in our <strong>Indastreet Partners</strong> directory for better SEO ranking and exposure.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-orange-300 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">📈 Benefits of Partnership:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>✅ <strong>Additional Traffic:</strong> Being part of the Indastreet Partnership will drive additional traffic to your website</li>
                    <li>✅ <strong>SEO Boost:</strong> Live website previews with direct links improve your search rankings</li>
                    <li>✅ <strong>Professional Directory:</strong> Professional showcase with hotel and villa services</li>
                    <li>✅ <strong>Enhanced Visibility:</strong> Featured in our partners directory with verification badges</li>
                </ul>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        🌐 Website URL (Optional)
                    </label>
                    <input
                        type="url"
                        placeholder="https://your-massage-place-website.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        Add your website to be featured in our Indastreet Partners directory
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        🏢 Business Category
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900">
                        <option value="">Select your primary service type</option>
                        <option value="massage-place">Massage Place</option>
                        <option value="hotel">Hotel with Spa Services</option>
                        <option value="villa">Villa with Wellness Services</option>
                        <option value="wellness-center">Wellness Center</option>
                    </select>
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

const PlacePricingPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Pricing Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Set pricing for different service durations and manage promotional discounts.</p>
            {/* Pricing management form would go here */}
        </div>
    </div>
);

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

const PlaceBookingsPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Bookings Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">View and manage customer bookings, schedules, and appointments.</p>
            {/* Bookings management would go here */}
        </div>
    </div>
);

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

const PlaceStaffPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage therapist staff, schedules, and assignments.</p>
            {/* Staff management would go here */}
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

const PlaceSettingsPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">General settings, notifications, and account preferences.</p>
            {/* Settings would go here */}
        </div>
    </div>
);

export default MassagePlaceAdminDashboard;