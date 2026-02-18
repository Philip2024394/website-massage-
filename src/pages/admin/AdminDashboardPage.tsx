// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
/**
 * =====================================================================
 * UNIFIED ADMIN DASHBOARD - Full Implementation
 * =====================================================================
 *
 * DATA FLOW (100% connected):
 * - Stats & list data: adminServices.ts (adminTherapistService, adminPlacesService,
 *   adminBookingService) → appwriteClient.ts (databases, DATABASE_ID, COLLECTIONS).
 * - Commission verification: this page uses appwriteClient directly (same as adminServices)
 *   for commission_records and therapists collection updates.
 * - Support tickets: AdminSupportDashboard uses appwrite.config (contactInquiries).
 * - Auth: AdminGuard uses appwriteClient account for admin session.
 * - Main app: receives onNavigateHome from AppRouter → setPage('home').
 *
 * All admin Appwrite access uses the same client (appwriteClient) and database so
 * data flow is consistent with the rest of the app.
 *
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { AdminGuardDev, adminLogout } from '../../lib/adminGuard';
import { adminTherapistService, adminPlacesService, adminBookingService } from '../../lib/adminServices';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../../lib/appwriteClient';
import AdminSupportDashboard from '../../components/admin/AdminSupportDashboard';
import TherapistManager from '../../components/admin/TherapistManager';
import AdminTranslationConsole from '../../components/admin/AdminTranslationConsole';
import DashboardPWABanner from '../../components/pwa/DashboardPWABanner';

// =====================================================================
// ICON COMPONENTS (Emoji fallbacks for lucide-react compatibility)
// =====================================================================

const IconWrapper = ({ emoji, className }: { emoji: string; className?: string }) => (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{emoji}</span>
);

const BarChart = ({ className }: { className?: string }) => <IconWrapper emoji="📊" className={className} />;
const Users = ({ className }: { className?: string }) => <IconWrapper emoji="👥" className={className} />;
const MessageSquare = ({ className }: { className?: string }) => <IconWrapper emoji="💬" className={className} />;
const DollarSign = ({ className }: { className?: string }) => <IconWrapper emoji="💰" className={className} />;
const Calendar = ({ className }: { className?: string }) => <IconWrapper emoji="📅" className={className} />;
const Activity = ({ className }: { className?: string }) => <IconWrapper emoji="📈" className={className} />;
const Settings = ({ className }: { className?: string }) => <IconWrapper emoji="⚙️" className={className} />;
const FileCheck = ({ className }: { className?: string }) => <IconWrapper emoji="📋" className={className} />;
const Award = ({ className }: { className?: string }) => <IconWrapper emoji="🏆" className={className} />;
const Database = ({ className }: { className?: string }) => <IconWrapper emoji="💾" className={className} />;
const ShieldCheck = ({ className }: { className?: string }) => <IconWrapper emoji="🛡️" className={className} />;
const RefreshCw = ({ className }: { className?: string }) => <IconWrapper emoji="🔄" className={className} />;
const LogOut = ({ className }: { className?: string }) => <IconWrapper emoji="🚪" className={className} />;
const Home = ({ className }: { className?: string }) => <IconWrapper emoji="🏠" className={className} />;
const Headphones = ({ className }: { className?: string }) => <IconWrapper emoji="🎧" className={className} />;

// =====================================================================
// TYPES
// =====================================================================

interface LiveStats {
    totalTherapists: number;
    totalPlaces: number;
    totalBookings: number;
    totalRevenue: number;
    activeTherapists: number;
    activePlaces: number;
    pendingApprovals: number;
    todayBookings: number;
    monthlyRevenue: number;
}

type AdminView = 
    | 'dashboard'
    | 'therapists'
    | 'places'
    | 'bookings'
    | 'chat'
    | 'revenue'
    | 'commissions'
    | 'reviews'
    | 'ktp-verification'
    | 'settings'
    | 'achievements'
    | 'system-health'
    | 'analytics'
    | 'support'
    | 'translation-console';

// =====================================================================
// ADMIN DASHBOARD COMPONENT
// =====================================================================

interface AdminDashboardPageProps {
    onNavigateHome?: () => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome }) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [stats, setStats] = useState<LiveStats>({
        totalTherapists: 0,
        totalPlaces: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeTherapists: 0,
        activePlaces: 0,
        pendingApprovals: 0,
        todayBookings: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch live data
    const fetchLiveData = async () => {
        try {
            console.log('📊 [ADMIN DASHBOARD] Fetching live data...');
            setLoading(true);

            const [therapists, places, bookings] = await Promise.all([
                adminTherapistService.getAll(),
                adminPlacesService.getAll(),
                adminBookingService.getAll()
            ]);

            // Auto-revert therapists whose busyUntil has passed (admin override → available)
            const reverted = await adminTherapistService.revertExpiredBusyTherapists().catch(() => 0);
            const therapistsFinal = reverted > 0 ? await adminTherapistService.getAll() : therapists;

            // Calculate stats
            const today = new Date().toDateString();
            const activeTherapists = therapistsFinal.filter((t: any) => 
                t.status === 'active' || t.status === 'available' || t.status === 'busy'
            ).length;
            const pendingTherapists = therapistsFinal.filter((t: any) => t.status === 'pending').length;
            const activePlaces = places.filter((p: any) => p.status === 'active').length;
            const pendingPlaces = places.filter((p: any) => p.status === 'pending').length;
            const todayBookings = bookings.filter((b: any) =>
                new Date(b.$createdAt).toDateString() === today
            ).length;
            const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalCost || 0), 0);

            setStats({
                totalTherapists: therapistsFinal.length,
                totalPlaces: places.length,
                totalBookings: bookings.length,
                totalRevenue,
                activeTherapists,
                activePlaces,
                pendingApprovals: pendingTherapists + pendingPlaces,
                todayBookings,
                monthlyRevenue: totalRevenue * 0.3 // 30% commission
            });

            setLastUpdated(new Date());
            console.log('✅ [ADMIN DASHBOARD] Data loaded successfully');
        } catch (error) {
            console.error('❌ [ADMIN DASHBOARD] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveData();

        // Auto-refresh every 30 seconds
        if (autoRefresh) {
            const interval = setInterval(fetchLiveData, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const handleLogout = async () => {
        await adminLogout();
        if (onNavigateHome) {
            onNavigateHome();
        } else {
            window.location.hash = '#/';
        }
    };

    const handleNavigateHome = () => {
        if (onNavigateHome) {
            onNavigateHome();
        } else {
            window.location.hash = '#/';
        }
    };

    // Navigation items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart className="w-5 h-5" /> },
        { id: 'therapists', label: 'Therapists', icon: <Users className="w-5 h-5" /> },
        { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
        { id: 'chat', label: 'Chat Center', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'support', label: 'Support Tickets', icon: <Headphones className="w-5 h-5" /> },
        { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-5 h-5" /> },
        { id: 'commissions', label: 'Commissions', icon: <Activity className="w-5 h-5" /> },
        { id: 'ktp-verification', label: 'KTP Verification', icon: <FileCheck className="w-5 h-5" /> },
        { id: 'achievements', label: 'Achievements', icon: <Award className="w-5 h-5" /> },
        { id: 'system-health', label: 'System Health', icon: <ShieldCheck className="w-5 h-5" /> },
        { id: 'translation-console', label: 'Translation Console', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    // Render dashboard overview – mobile-first, app theme
    const renderDashboard = () => (
        <div className="space-y-5">
            {/* Download app – MP3 notifications, sound, vibrate (app theme) */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl border border-orange-400/50 shadow-sm p-4 text-white">
                <h3 className="text-sm font-bold mb-2">📱 Download app to your phone</h3>
                <p className="text-xs opacity-95 mb-3">
                    Get MP3 notifications, sound alerts and vibration so you never miss updates.
                </p>
                <ul className="text-xs opacity-95 space-y-1 mb-3">
                    <li>• MP3 notification sounds</li>
                    <li>• Sound alerts for new activity</li>
                    <li>• Vibration on alerts</li>
                </ul>
                <p className="text-xs opacity-80">Install for the best admin experience on mobile.</p>
            </div>

            {/* Stats Grid – 2 cols on mobile */}
            <div className="grid grid-cols-2 gap-3 w-full">
                <StatCard
                    title="Total Therapists"
                    value={stats.totalTherapists}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    color="blue"
                />
                <StatCard
                    title="Active Therapists"
                    value={stats.activeTherapists}
                    icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
                    color="green"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={<Calendar className="w-6 h-6 text-purple-500" />}
                    color="purple"
                />
                <StatCard
                    title="Today's Bookings"
                    value={stats.todayBookings}
                    icon={<Activity className="w-6 h-6 text-orange-500" />}
                    color="orange"
                />
                <StatCard
                    title="Total Revenue"
                    value={`IDR ${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
                    color="emerald"
                />
                <StatCard
                    title="Commission (30%)"
                    value={`IDR ${Math.round(stats.totalRevenue * 0.3).toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6 text-teal-500" />}
                    color="teal"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={<FileCheck className="w-6 h-6 text-yellow-500" />}
                    color="yellow"
                />
                <StatCard
                    title="Total Places"
                    value={stats.totalPlaces}
                    icon={<Database className="w-6 h-6 text-indigo-500" />}
                    color="indigo"
                />
            </div>

            {/* Quick Actions – 2 cols mobile */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <QuickActionButton
                        label="View Therapists"
                        onClick={() => setActiveView('therapists')}
                        color="blue"
                    />
                    <QuickActionButton
                        label="Check Bookings"
                        onClick={() => setActiveView('bookings')}
                        color="purple"
                    />
                    <QuickActionButton
                        label="Chat Monitor"
                        onClick={() => setActiveView('chat')}
                        color="green"
                    />
                    <QuickActionButton
                        label="KTP Verification"
                        onClick={() => setActiveView('ktp-verification')}
                        color="orange"
                    />
                </div>
            </div>
        </div>
    );

    // Render content based on active view
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return renderDashboard();
            case 'therapists':
                return <TherapistManager />;
            case 'bookings':
                return <BookingManagement />;
            case 'chat':
                return <ChatCenter />;
            case 'revenue':
                return <RevenueDashboard />;
            case 'commissions':
                return <CommissionManagement />;
            case 'ktp-verification':
                return <KtpVerification />;
            case 'achievements':
                return <AchievementManager />;
            case 'system-health':
                return <SystemHealth />;
            case 'settings':
                return <SettingsPanel />;
            case 'support':
                return <AdminSupportDashboard />;
            case 'translation-console':
                return <AdminTranslationConsole />;
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 max-w-md mx-auto shadow-lg admin-dashboard-mobile" style={{
            width: '100%',
            minHeight: '100vh',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}>
            {/* Mobile header – app theme */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 safe-area-padding">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <h1 className="text-lg font-bold text-slate-800 truncate">
                            Admin
                        </h1>
                        <span className="text-xs text-slate-500 hidden sm:inline">
                            {lastUpdated.toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={fetchLiveData}
                            className="p-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors touch-manipulation"
                            title="Refresh data"
                            aria-label="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleNavigateHome}
                            className="p-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors touch-manipulation"
                            title="Home"
                            aria-label="Home"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-800 text-sm font-medium touch-manipulation"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile: horizontal nav tabs (scrollable) */}
            <nav className="bg-white border-b border-slate-200 sticky top-[52px] z-10 overflow-x-auto no-scrollbar" aria-label="Admin sections">
                <div className="flex gap-1 px-3 py-2 min-w-max">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as AdminView)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors touch-manipulation ${
                                activeView === item.id
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-orange-600'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main content – single column, mobile-first */}
            <main className="p-4 pb-24 bg-slate-50 min-h-[60vh]">
                {loading && activeView === 'dashboard' ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <RefreshCw className="w-12 h-12 text-orange-500 animate-spin" />
                        <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>
            {/* PWA install banner – same app theme when in admin */}
            <div className="admin-pwa-banner-wrapper">
                <DashboardPWABanner />
            </div>
            <style>{`
                .admin-dashboard-mobile .no-scrollbar { -webkit-overflow-scrolling: touch; scrollbar-width: none; }
                .admin-dashboard-mobile .no-scrollbar::-webkit-scrollbar { display: none; }
                .admin-pwa-banner-wrapper [class*="from-blue"] { background: linear-gradient(to right, rgb(249 115 22), rgb(234 88 12)) !important; }
                .admin-pwa-banner-wrapper .bg-white.text-blue-600 { color: rgb(249 115 22) !important; }
            `}</style>
        </div>
    );
};

// =====================================================================
// SUB-COMPONENTS
// =====================================================================

const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}> = ({ title, value, icon }) => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 truncate">{title}</p>
                <p className="text-xl font-bold text-slate-800 truncate mt-0.5">{value}</p>
            </div>
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                {icon}
            </span>
        </div>
    </div>
);

const QuickActionButton: React.FC<{
    label: string;
    onClick: () => void;
    color: string;
}> = ({ label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full py-3.5 px-4 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/80 text-sm font-medium transition-colors touch-manipulation text-center"
    >
        {label}
    </button>
);

// Placeholder sub-pages – mobile-friendly, app theme
const BookingManagement = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">📅 Booking Management</h2>
        <p className="text-sm text-slate-600">View and manage all bookings.</p>
    </div>
);

const ChatCenter = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">💬 Chat Center</h2>
        <p className="text-sm text-slate-600">Monitor and manage chat conversations.</p>
    </div>
);

const RevenueDashboard = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">💰 Revenue Dashboard</h2>
        <p className="text-sm text-slate-600">Track revenue, commissions, and payments.</p>
    </div>
);

const CommissionManagement = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'awaiting_verification' | 'verified' | 'rejected'>('awaiting_verification');

    useEffect(() => {
        loadPayments();
    }, [filter]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const collectionId = COLLECTIONS.COMMISSION_RECORDS;
            if (!collectionId) {
                console.warn('[ADMIN] Commission records collection not configured');
                setPayments([]);
                return;
            }
            const queries = filter === 'all'
                ? [Query.orderDesc('$createdAt'), Query.limit(100)]
                : [Query.equal('status', filter), Query.orderDesc('$createdAt'), Query.limit(100)];

            const response = await databases.listDocuments(
                DATABASE_ID,
                collectionId,
                queries
            );

            setPayments(response.documents);
        } catch (error) {
            console.error('Failed to load commission payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId: string, approved: boolean, reason?: string) => {
        try {
            const commissionCollectionId = COLLECTIONS.COMMISSION_RECORDS;
            const therapistsCollectionId = COLLECTIONS.THERAPISTS;
            if (!commissionCollectionId) {
                console.error('[ADMIN] Commission records collection not configured');
                return;
            }

            await databases.updateDocument(
                DATABASE_ID,
                commissionCollectionId,
                paymentId,
                {
                    status: approved ? 'verified' : 'rejected',
                    verifiedAt: new Date().toISOString(),
                    verifiedBy: 'admin',
                    rejectionReason: reason || null,
                    updatedAt: new Date().toISOString()
                }
            );

            if (approved && therapistsCollectionId) {
                const payment = payments.find(p => p.$id === paymentId);
                if (payment?.therapistId) {
                    await databases.updateDocument(
                        DATABASE_ID,
                        therapistsCollectionId,
                        payment.therapistId,
                        {
                            status: 'available',
                            bookingEnabled: true,
                            scheduleEnabled: true,
                            deactivationReason: null,
                            updatedAt: new Date().toISOString()
                        }
                    );
                }
            }

            loadPayments();
        } catch (error) {
            console.error('Failed to verify payment:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filterTabs = [
        { key: 'awaiting_verification' as const, label: '🔍 Awaiting', activeClass: 'bg-orange-500 text-white', inactiveClass: 'bg-orange-50 text-orange-700 border border-orange-200' },
        { key: 'pending' as const, label: '⏳ Pending', activeClass: 'bg-amber-500 text-white', inactiveClass: 'bg-amber-50 text-amber-700 border border-amber-200' },
        { key: 'verified' as const, label: '✅ Verified', activeClass: 'bg-emerald-600 text-white', inactiveClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
        { key: 'rejected' as const, label: '❌ Rejected', activeClass: 'bg-red-500 text-white', inactiveClass: 'bg-red-50 text-red-700 border border-red-200' },
        { key: 'all' as const, label: '📋 All', activeClass: 'bg-slate-600 text-white', inactiveClass: 'bg-slate-100 text-slate-700 border border-slate-200' },
    ];

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="text-base font-bold text-slate-800">📈 Commission Verification</h2>
                    <button
                        type="button"
                        onClick={loadPayments}
                        className="px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 touch-manipulation"
                    >
                        🔄 Refresh
                    </button>
                </div>
                {/* Filter Tabs – horizontal scroll mobile */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors touch-manipulation ${filter === tab.key ? tab.activeClass : tab.inactiveClass}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
                    <div className="animate-spin text-4xl mb-2">🔄</div>
                    <p className="text-slate-600 text-sm">Loading payments...</p>
                </div>
            ) : payments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-slate-600 text-sm">No payments found for this filter</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => {
                        const LATE_PAYMENT_FEE = 50000;
                        const isOverdue = payment.status === 'overdue';
                        const totalDue = (payment.commissionAmount || 0) + (isOverdue ? LATE_PAYMENT_FEE : 0);
                        
                        return (
                        <div key={payment.$id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className={`px-4 py-3 ${
                                payment.status === 'awaiting_verification' ? 'bg-blue-500' :
                                payment.status === 'verified' ? 'bg-green-500' :
                                payment.status === 'rejected' ? 'bg-red-500' :
                                payment.status === 'overdue' ? 'bg-red-600' :
                                'bg-amber-500'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="text-white">
                                        <p className="font-bold">{payment.therapistName || 'Therapist'}</p>
                                        <p className="text-sm opacity-80">ID: {payment.$id?.slice(-8)}</p>
                                    </div>
                                    <div className="text-right text-white">
                                        <p className="text-2xl font-bold">IDR {totalDue.toLocaleString()}</p>
                                        <p className="text-sm opacity-80">
                                            {isOverdue ? '30% + Late Fee' : '30% Commission'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Late Fee Warning Banner */}
                            {isOverdue && (
                                <div className="bg-red-100 border-b-2 border-red-300 px-4 py-2">
                                    <p className="text-red-800 font-bold text-sm text-center">
                                        ⚠️ LATE FEE APPLIED: IDR {LATE_PAYMENT_FEE.toLocaleString()} added (Total: IDR {totalDue.toLocaleString()})
                                    </p>
                                </div>
                            )}

                            <div className="p-4 space-y-4">
                                {/* Booking Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Customer</p>
                                        <p className="font-semibold">{payment.customerName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Massage Type</p>
                                        <p className="font-semibold">{payment.massageType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Duration</p>
                                        <p className="font-semibold">{payment.duration || 60} min</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Service Price</p>
                                        <p className="font-semibold">IDR {(payment.serviceAmount || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Booking Date</p>
                                        <p className="font-semibold">{formatDate(payment.bookingDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Payment Deadline</p>
                                        <p className="font-semibold">{formatDate(payment.paymentDeadline)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Proof Uploaded</p>
                                        <p className="font-semibold">{payment.paymentProofUploadedAt ? formatDate(payment.paymentProofUploadedAt) : 'Not yet'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            payment.status === 'awaiting_verification' ? 'bg-blue-100 text-blue-800' :
                                            payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                                            payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                            {payment.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Proof Image */}
                                {(payment.paymentProofImage || payment.paymentProofUrl) && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-bold text-gray-700 mb-2">📷 Payment Proof:</p>
                                        <img 
                                            src={payment.paymentProofImage || payment.paymentProofUrl} 
                                            alt="Payment Proof" 
                                            className="w-full max-w-md rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-90"
                                            onClick={() => window.open(payment.paymentProofImage || payment.paymentProofUrl, '_blank')}
                                        />
                                    </div>
                                )}

                                {/* Admin Actions - Only for awaiting_verification */}
                                {payment.status === 'awaiting_verification' && (
                                    <div className="border-t pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleVerify(payment.$id, true)}
                                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors touch-manipulation"
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const reason = prompt('Rejection reason:');
                                                if (reason) handleVerify(payment.$id, false, reason);
                                            }}
                                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors touch-manipulation"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {payment.status === 'rejected' && payment.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm font-bold text-red-800">Rejection Reason:</p>
                                        <p className="text-red-700">{payment.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Verified Info */}
                                {payment.status === 'verified' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                        <p className="text-green-800">
                                            ✅ Verified by {payment.verifiedBy || 'Admin'} on {formatDate(payment.verifiedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                    })}
                </div>
            )}
        </div>
    );
};

const KtpVerification = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">📋 KTP Verification</h2>
        <p className="text-sm text-slate-600">Review and verify KTP documents.</p>
    </div>
);

const AchievementManager = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">🏆 Achievement Manager</h2>
        <p className="text-sm text-slate-600">Manage therapist achievements and badges.</p>
    </div>
);

const SystemHealth = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">🛡️ System Health</h2>
        <p className="text-sm text-slate-600">Monitor system health and performance.</p>
    </div>
);

const SettingsPanel = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">⚙️ Settings</h2>
        <p className="text-sm text-slate-600">Configure system settings.</p>
    </div>
);

// =====================================================================
// WRAPPED EXPORT WITH ROLE-BASED ACCESS CONTROL
// =====================================================================

/**
 * Admin Dashboard wrapped with AdminGuard for role-based access control.
 * Only users with admin role (verified email in ADMIN_EMAILS list) can access.
 * Unauthorized users are redirected to home page with error message.
 */
const AdminDashboardWithGuard: React.FC<AdminDashboardPageProps> = (props) => (
    <AdminGuardDev
        fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-slate-50 px-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
                    <div className="text-5xl mb-3">🔒</div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Admin Access Required
                    </h2>
                    <p className="text-sm text-slate-600 mb-5">
                        Log in with an authorized admin account to access this dashboard.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            if (props.onNavigateHome) {
                                props.onNavigateHome();
                            } else {
                                window.location.hash = '#/';
                            }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors touch-manipulation"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        }
        onUnauthorized={() => {
            console.log('⚠️ [ADMIN DASHBOARD] Unauthorized access attempt');
            if (props.onNavigateHome) {
                props.onNavigateHome();
            } else {
                window.location.hash = '#/';
            }
        }}
    >
        <AdminDashboardPage {...props} />
    </AdminGuardDev>
);

export default AdminDashboardWithGuard;
