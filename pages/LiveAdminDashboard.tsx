import React, { useState, useEffect } from 'react';
import { 
    BarChart, Users, MessageSquare, 
    DollarSign, Calendar, Activity,
    LogOut, RefreshCw, AlertCircle, 
    UserCheck, CheckCircle, Menu, X,
    Home, Settings, TrendingUp, Building
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

type AdminView = 'dashboard' | 'chat' | 'users' | 'bookings' | 'analytics' | 'settings';

const LiveAdminDashboard: React.FC<LiveAdminDashboardProps> = ({ onLogout }) => {
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
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fetch live data from Appwrite
    const fetchLiveData = async () => {
        try {
            setLoading(true);
            
            // Parallel fetch all data
            const [
                therapists,
                places,
                bookings
            ] = await Promise.all([
                therapistService.getAll(),
                placeService.getAll(),
                bookingService.getAll()
            ]);

            // Use analytics service to get additional platform data
            const platformAnalytics = await analyticsService.getPlatformAnalytics(
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            );

            // Calculate today's date for filtering
            const today = new Date().toDateString();
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();

            // Process therapists data
            const activeTherapists = therapists.filter((t: any) => t.status === 'active').length;
            const pendingTherapists = therapists.filter((t: any) => t.status === 'pending').length;

            // Process places data
            const activePlaces = places.filter((p: any) => p.status === 'active').length;
            const pendingPlaces = places.filter((p: any) => p.status === 'pending').length;

            // Process bookings data
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

            // Calculate new registrations (last 7 days)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const newTherapists = therapists.filter((t: any) => 
                new Date(t.$createdAt) > weekAgo
            ).length;
            const newPlaces = places.filter((p: any) => 
                new Date(p.$createdAt) > weekAgo
            ).length;

            // Calculate total revenue
            const totalRevenue = bookings.reduce((sum: number, booking: any) => 
                sum + (booking.totalAmount || 0), 0
            );

            // Update stats
            setStats({
                totalUsers: platformAnalytics.totalUsers || 0,
                totalTherapists: therapists.length,
                totalPlaces: places.length,
                totalBookings: bookings.length,
                totalRevenue,
                activeTherapists,
                activePlaces,
                pendingApprovals: pendingTherapists + pendingPlaces,
                todayBookings,
                monthlyRevenue,
                newRegistrations: newTherapists + newPlaces,
                liveMembers: activeTherapists + activePlaces
            });

            // Generate recent activity from real data
            const activity: RecentActivity[] = [];
            
            // Add recent bookings
            const recentBookings = bookings
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 3);
            
            recentBookings.forEach((booking: any) => {
                activity.push({
                    id: booking.$id,
                    type: 'booking',
                    message: `New booking for ${booking.therapistName || 'Provider'} - ${booking.totalAmount ? `Rp ${booking.totalAmount.toLocaleString()}` : 'Amount TBD'}`,
                    timestamp: booking.createdAt,
                    status: booking.status === 'Completed' ? 'success' : 'pending'
                });
            });

            // Add recent registrations
            const recentProviders = [...therapists, ...places]
                .sort((a: any, b: any) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
                .slice(0, 3);

            recentProviders.forEach((provider: any) => {
                activity.push({
                    id: provider.$id,
                    type: 'registration',
                    message: `New ${provider.serviceType ? 'place' : 'therapist'} registration: ${provider.name}`,
                    timestamp: provider.$createdAt,
                    status: provider.status === 'active' ? 'success' : 'pending'
                });
            });

            setRecentActivity(activity.slice(0, 10));
            setLastUpdated(new Date().toLocaleTimeString());
            
        } catch (error) {
            console.error('Error fetching live data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchLiveData();
        
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchLiveData, 30000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
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

    if (activeView === 'chat') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveView('dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <BarChart className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Admin Chat Center</h1>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
                {/* <AdminChatListPage /> */}
                <div className="p-6 text-center text-gray-500">
                    Chat system is currently disabled
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div className={`fixed lg:static inset-y-0 left-0 w-80 bg-gradient-to-b from-gray-900 to-black transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } transition-transform duration-300 ease-in-out z-50 lg:z-0`}>
                
                {/* Header */}
                <div className="bg-orange-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                <span className="text-white">Inda</span>
                                <span className="text-orange-100">Street</span>
                            </h1>
                            <p className="text-orange-100 text-sm">Admin Dashboard</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white hover:text-orange-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-4 flex-1">
                    <nav className="space-y-2">
                        <button
                            onClick={() => {
                                setActiveView('dashboard');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                activeView === 'dashboard'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </button>

                        <button
                            onClick={() => {
                                setActiveView('analytics');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                activeView === 'analytics'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <BarChart className="w-5 h-5" />
                            Analytics
                        </button>

                        <button
                            onClick={() => {
                                setActiveView('users');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                activeView === 'users'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            Users & Members
                        </button>

                        <button
                            onClick={() => {
                                setActiveView('bookings');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                activeView === 'bookings'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            Bookings
                        </button>

                        <button
                            onClick={() => {
                                setActiveView('chat');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                (activeView as AdminView) === 'chat'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            Chat Center
                        </button>

                        <button
                            onClick={() => {
                                setActiveView('settings');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                activeView === 'settings'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </nav>

                    {/* Logout button at bottom */}
                    <div className="absolute bottom-6 left-4 right-4">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
                {/* Top Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden text-gray-600 hover:text-gray-800"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                                        {activeView === 'dashboard' ? 'Dashboard Overview' : activeView}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Live data • Last updated: {lastUpdated}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Auto-refresh toggle */}
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        autoRefresh 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                    Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                                </button>

                                {/* Manual refresh */}
                                <button
                                    onClick={fetchLiveData}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {(activeView as AdminView) === 'chat' ? (
                        <div className="text-center text-gray-500 py-8">
                            Chat system is currently disabled
                        </div>
                    ) : activeView === 'dashboard' ? (
                        <>
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                                {/* Total Bookings */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                                            <p className="text-sm text-purple-600 mt-1">
                                                Today: {stats.todayBookings}
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
                                                New: {stats.newRegistrations} this week
                                            </p>
                                        </div>
                                        <div className="p-3 bg-orange-100 rounded-lg">
                                            <AlertCircle className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Therapists */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Therapists</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Therapists</span>
                                            <span className="font-semibold">{stats.totalTherapists}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Active</span>
                                            <span className="font-semibold text-green-600">{stats.activeTherapists}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Inactive</span>
                                            <span className="font-semibold text-gray-500">
                                                {stats.totalTherapists - stats.activeTherapists}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Places */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Places</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Places</span>
                                            <span className="font-semibold">{stats.totalPlaces}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Active</span>
                                            <span className="font-semibold text-green-600">{stats.activePlaces}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Inactive</span>
                                            <span className="font-semibold text-gray-500">
                                                {stats.totalPlaces - stats.activePlaces}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Users */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Users</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Users</span>
                                            <span className="font-semibold">{stats.totalUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">New This Week</span>
                                            <span className="font-semibold text-blue-600">{stats.newRegistrations}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Active Members</span>
                                            <span className="font-semibold text-green-600">{stats.liveMembers}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
                                <div className="space-y-4">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)} bg-current bg-opacity-10`}>
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-800 font-medium">{activity.message}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    activity.status === 'success' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : activity.status === 'pending'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {activity.status}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{activeView}</h3>
                            <p className="text-gray-600">
                                {activeView === 'analytics' && 'Analytics and reporting tools will be available here.'}
                                {activeView === 'users' && 'User management and member administration tools.'}
                                {activeView === 'bookings' && 'Booking management and scheduling overview.'}
                                {activeView === 'settings' && 'System settings and configuration options.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveAdminDashboard;