import React, { useState, useEffect } from 'react';
import { 
    BarChart, Users, MessageSquare, Settings, Menu, X,
    DollarSign, Calendar, Activity, Search, Bell, Home,
    LogOut, RefreshCw, AlertCircle, UserCheck, CheckCircle,
    FileText, Package, CreditCard, TrendingUp, Eye,
    Edit3, MapPin, Star, Filter
} from 'lucide-react';
import { 
    therapistService, 
    placeService, 
    bookingService
} from '../lib/appwriteService';
import { analyticsService } from '../services/analyticsService';
// import AdminChatListPage from './AdminChatListPage'; // Chat system removed

interface LiveStats {
    totalUsers: number;
    totalTherapists: number;
    totalPlaces: number;
    totalBookings: number;
    totalRevenue: number;
    activeTherapists: number;
    activePlaces: number;
    pendingApprovals: number;
    todayBookings: number;
    monthlyRevenue: number;
    newRegistrations: number;
    liveMembers: number;
}

interface RecentActivity {
    id: string;
    type: 'booking' | 'registration' | 'approval' | 'payment';
    message: string;
    timestamp: string;
    status: 'success' | 'pending' | 'warning';
}

interface LiveAdminDashboardProps {
    onLogout: () => void;
}

const LiveAdminDashboardSideDrawer: React.FC<LiveAdminDashboardProps> = ({ onLogout }) => {
    const [stats, setStats] = useState<LiveStats>({
        totalUsers: 0,
        totalTherapists: 0,
        totalPlaces: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeTherapists: 0,
        activePlaces: 0,
        pendingApprovals: 0,
        todayBookings: 0,
        monthlyRevenue: 0,
        newRegistrations: 0,
        liveMembers: 0
    });
    
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'therapists' | 'places' | 'users' | 'bookings' | 'reports' | 'settings'>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fetch live data from Appwrite
    const fetchLiveData = async () => {
        try {
            setLoading(true);
            
            // Parallel fetch all data
            const [therapists, places, bookings] = await Promise.all([
                therapistService.getAll(),
                placeService.getAll(),
                bookingService.getAll()
            ]);

            // Calculate stats from real data
            const today = new Date().toDateString();
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();

            const activeTherapists = therapists.filter((t: any) => t.status === 'active').length;
            const activePlaces = places.filter((p: any) => p.status === 'active').length;
            const pendingTherapists = therapists.filter((t: any) => t.status === 'pending').length;
            const pendingPlaces = places.filter((p: any) => p.status === 'pending').length;

            const todayBookings = bookings.filter((b: any) => 
                new Date(b.createdAt).toDateString() === today
            ).length;

            const monthlyBookings = bookings.filter((b: any) => {
                const bookingDate = new Date(b.createdAt);
                return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
            });

            const monthlyRevenue = monthlyBookings.reduce((sum: number, booking: any) => 
                sum + (booking.totalAmount || 0), 0
            );

            const totalRevenue = bookings.reduce((sum: number, booking: any) => 
                sum + (booking.totalAmount || 0), 0
            );

            setStats({
                totalUsers: therapists.length + places.length,
                totalTherapists: therapists.length,
                totalPlaces: places.length,
                totalBookings: bookings.length,
                totalRevenue,
                activeTherapists,
                activePlaces,
                pendingApprovals: pendingTherapists + pendingPlaces,
                todayBookings,
                monthlyRevenue,
                newRegistrations: 12,
                liveMembers: activeTherapists + activePlaces
            });

            // Generate mock recent activity
            const mockActivity: RecentActivity[] = [
                {
                    id: '1',
                    type: 'booking',
                    message: 'New booking received from John Doe',
                    timestamp: new Date().toLocaleTimeString(),
                    status: 'success'
                },
                {
                    id: '2',
                    type: 'registration',
                    message: 'New therapist registered: Maria Silva',
                    timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
                    status: 'pending'
                },
                {
                    id: '3',
                    type: 'payment',
                    message: 'Payment received: Rp 350,000',
                    timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
                    status: 'success'
                }
            ];

            setRecentActivity(mockActivity);
            setLastUpdated(new Date().toLocaleTimeString());
            
        } catch (error) {
            console.error('Error fetching live data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveData();
        
        if (autoRefresh) {
            const interval = setInterval(fetchLiveData, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Calendar className="w-4 h-4" />;
            case 'registration': return <UserCheck className="w-4 h-4" />;
            case 'approval': return <CheckCircle className="w-4 h-4" />;
            case 'payment': return <DollarSign className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-500';
            case 'warning': return 'text-yellow-500';
            case 'pending': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    // Sidebar navigation items
    const navigationItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: <Home className="w-5 h-5" />, 
            active: activeView === 'dashboard' 
        },
        { 
            id: 'therapists', 
            label: 'Therapists', 
            icon: <Users className="w-5 h-5" />, 
            active: activeView === 'therapists' 
        },
        { 
            id: 'places', 
            label: 'Massage Places', 
            icon: <MapPin className="w-5 h-5" />, 
            active: activeView === 'places' 
        },
        { 
            id: 'bookings', 
            label: 'Bookings', 
            icon: <Calendar className="w-5 h-5" />, 
            active: activeView === 'bookings' 
        },
        { 
            id: 'users', 
            label: 'Users', 
            icon: <UserCheck className="w-5 h-5" />, 
            active: activeView === 'users' 
        },
        { 
            id: 'reports', 
            label: 'Reports', 
            icon: <BarChart className="w-5 h-5" />, 
            active: activeView === 'reports' 
        },
        { 
            id: 'chat', 
            label: 'Chat Center', 
            icon: <MessageSquare className="w-5 h-5" />, 
            active: activeView === 'chat' 
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: <Settings className="w-5 h-5" />, 
            active: activeView === 'settings' 
        }
    ];

    // Sidebar Component
    const Sidebar = () => (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <h1 className="text-xl font-bold">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </h1>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <nav className="mt-6">
                <div className="px-3">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id as any);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                                item.active
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <div className="absolute bottom-0 w-full p-3 border-t border-gray-200">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="ml-3">Logout</span>
                </button>
            </div>
        </div>
    );

    // Main Content Component
    const MainContent = () => {
        if (activeView === 'chat') {
            return (
                <div className="p-6 text-center text-gray-500">
                    Chat system is currently disabled
                </div>
            );
        }

        if (activeView === 'dashboard') {
            return (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Revenue */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(stats.totalRevenue)}
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Monthly: {formatCurrency(stats.monthlyRevenue)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Members */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalTherapists + stats.totalPlaces}
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Live: {stats.liveMembers}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Today's Bookings */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
                                    <p className="text-sm text-purple-600 mt-1">
                                        Total: {stats.totalBookings}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Approvals */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                                    <p className="text-sm text-orange-600 mt-1">
                                        New: {stats.newRegistrations}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveView('therapists')}
                                        className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Edit3 className="w-5 h-5 text-blue-600 mr-3" />
                                            <span className="font-medium text-blue-900">Manage Therapists</span>
                                        </div>
                                        <span className="text-blue-600 text-sm">{stats.totalTherapists}</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveView('places')}
                                        className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 text-green-600 mr-3" />
                                            <span className="font-medium text-green-900">Manage Places</span>
                                        </div>
                                        <span className="text-green-600 text-sm">{stats.totalPlaces}</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveView('bookings')}
                                        className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                                            <span className="font-medium text-purple-900">View Bookings</span>
                                        </div>
                                        <span className="text-purple-600 text-sm">{stats.totalBookings}</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveView('chat')}
                                        className="w-full flex items-center justify-between p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <MessageSquare className="w-5 h-5 text-orange-600 mr-3" />
                                            <span className="font-medium text-orange-900">Chat Center</span>
                                        </div>
                                        <span className="text-orange-600 text-sm">Live</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setAutoRefresh(!autoRefresh)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                                                autoRefresh 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className={`p-2 rounded-lg ${getStatusColor(activity.status)} bg-opacity-20`}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                                activity.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {recentActivity.length === 0 && (
                                    <div className="text-center py-8">
                                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Placeholder content for other views
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h2>
                <p className="text-gray-600">Content for {activeView} will be implemented here.</p>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mr-4"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {navigationItems.find(item => item.id === activeView)?.label || 'Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Last updated: {lastUpdated}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchLiveData}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <MainContent />
                </main>
            </div>
        </div>
    );
};

export default LiveAdminDashboardSideDrawer;