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
    Calendar
} from 'lucide-react';
import AdminFooter from '../components/footers/AdminFooter';
import { authService } from '../lib/appwriteService';
import { Place } from '../types';

interface MassagePlaceAdminDashboardProps {
    place: Place;
    onLogout: () => void;
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
    | 'place-settings';

const MassagePlaceAdminDashboard: React.FC<MassagePlaceAdminDashboardProps> = ({ 
    place, 
    onLogout, 
    initialTab 
}) => {
    const [activePage, setActivePage] = useState<PlaceDashboardPage>(initialTab || 'place-analytics');
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

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
            id: 'place-settings',
            label: 'Settings',
            icon: Settings,
            description: 'General settings and preferences'
        }
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'place-analytics':
                return <PlaceAnalyticsPage place={place} />;
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
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {place.isLive ? 'Live' : 'Offline'}
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

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>

                {/* Footer */}
                <AdminFooter />
            </div>
        </div>
    );
};

// Placeholder components for different pages
const PlaceAnalyticsPage: React.FC<{ place: Place }> = ({ place }) => (
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
    </div>
);

const PlaceProfilePage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Place Profile</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage your massage place profile, description, location, and contact information.</p>
            {/* Profile management form would go here */}
        </div>
    </div>
);

const PlaceServicesPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Services Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Massage Types</h3>
                <p className="text-gray-600">Configure available massage types and specialties.</p>
                {/* Massage types management would go here */}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Services</h3>
                <p className="text-gray-600">Manage additional amenities and services offered.</p>
                {/* Additional services management would go here */}
            </div>
        </div>
    </div>
);

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

const PlaceGalleryPage: React.FC<{ place: Place }> = ({ place: _ }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Gallery Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Manage facility photos, treatment room images, and promotional gallery.</p>
            {/* Gallery management would go here */}
        </div>
    </div>
);

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