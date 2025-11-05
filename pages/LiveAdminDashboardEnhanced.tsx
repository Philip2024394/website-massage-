import React, { useState, useEffect } from 'react';
import { 
    BarChart, Users, MessageSquare, Edit3, Save, X, Upload,
    DollarSign, Calendar, Activity, Search, Filter, Eye, EyeOff,
    LogOut, RefreshCw, AlertCircle, UserCheck, CheckCircle, Star,
    MapPin, Image as ImageIcon
} from 'lucide-react';
import { 
    therapistService, 
    placeService, 
    bookingService
} from '../lib/appwriteService';
import { analyticsService } from '../services/analyticsService';
// import AdminChatListPage from './AdminChatListPage'; // Chat system removed

// Add custom styles for better mobile experience
const mobileStyles = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    @media (max-width: 640px) {
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
    }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = mobileStyles;
    if (!document.head.querySelector('style[data-mobile-dashboard]')) {
        styleElement.setAttribute('data-mobile-dashboard', 'true');
        document.head.appendChild(styleElement);
    }
}

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

interface CardData {
    $id: string;
    name: string;
    description: string;
    price60?: number;
    price90?: number;
    price120?: number;
    location?: string;
    phone?: string;
    email?: string;
    website?: string;
    images?: string[];
    profileImage?: string;
    status: 'active' | 'inactive' | 'pending';
    rating?: number;
    reviews?: number;
    specialties?: string[];
    services?: string[];
    availability?: string;
    experience?: string;
    serviceType?: string;
    amenities?: string[];
}

interface LiveAdminDashboardProps {
    onLogout: () => void;
}

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
    const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'therapists' | 'places'>('dashboard');
    
    // Card editing states
    const [therapists, setTherapists] = useState<CardData[]>([]);
    const [places, setPlaces] = useState<CardData[]>([]);
    const [editingCard, setEditingCard] = useState<CardData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

    // Fetch live data from Appwrite
    const fetchLiveData = async () => {
        try {
            setLoading(true);
            
            // Parallel fetch all data
            const [
                therapistsData,
                placesData,
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
            const activeTherapists = therapistsData.filter((t: any) => t.status === 'active').length;
            const pendingTherapists = therapistsData.filter((t: any) => t.status === 'pending').length;

            // Process places data
            const activePlaces = placesData.filter((p: any) => p.status === 'active').length;
            const pendingPlaces = placesData.filter((p: any) => p.status === 'pending').length;

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
            const newTherapists = therapistsData.filter((t: any) => 
                new Date(t.$createdAt) > weekAgo
            ).length;
            const newPlaces = placesData.filter((p: any) => 
                new Date(p.$createdAt) > weekAgo
            ).length;

            // Calculate total revenue
            const totalRevenue = bookings.reduce((sum: number, booking: any) => 
                sum + (booking.totalAmount || 0), 0
            );

            // Update stats
            setStats({
                totalUsers: platformAnalytics.totalUsers || 0,
                totalTherapists: therapistsData.length,
                totalPlaces: placesData.length,
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

            // Set card data for editing
            setTherapists(therapistsData);
            setPlaces(placesData);

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
            const recentProviders = [...therapistsData, ...placesData]
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

    // Handle card editing
    const handleEditCard = (card: CardData) => {
        setEditingCard({ ...card });
    };

    const handleSaveCard = async () => {
        if (!editingCard) return;

        try {
            const isTherapist = activeView === 'therapists';
            const service = isTherapist ? therapistService : placeService;
            
            await service.update(editingCard.$id, {
                name: editingCard.name,
                description: editingCard.description,
                price60: editingCard.price60,
                price90: editingCard.price90,
                price120: editingCard.price120,
                location: editingCard.location,
                phone: editingCard.phone,
                email: editingCard.email,
                website: editingCard.website,
                profileImage: editingCard.profileImage,
                images: editingCard.images,
                specialties: editingCard.specialties,
                services: editingCard.services,
                availability: editingCard.availability,
                experience: editingCard.experience,
                serviceType: editingCard.serviceType,
                amenities: editingCard.amenities,
                status: editingCard.status
            });

            // Update local state
            if (isTherapist) {
                setTherapists(prev => prev.map(t => 
                    t.$id === editingCard.$id ? editingCard : t
                ));
            } else {
                setPlaces(prev => prev.map(p => 
                    p.$id === editingCard.$id ? editingCard : p
                ));
            }

            setEditingCard(null);
            
            // Refresh data
            fetchLiveData();
        } catch (error) {
            console.error('Error saving card:', error);
        }
    };

    const handleStatusToggle = async (card: CardData) => {
        const newStatus = card.status === 'active' ? 'inactive' : 'active';
        const isTherapist = activeView === 'therapists';
        const service = isTherapist ? therapistService : placeService;
        
        try {
            await service.update(card.$id, { status: newStatus });
            
            // Update local state
            if (isTherapist) {
                setTherapists(prev => prev.map(t => 
                    t.$id === card.$id ? { ...t, status: newStatus } : t
                ));
            } else {
                setPlaces(prev => prev.map(p => 
                    p.$id === card.$id ? { ...p, status: newStatus } : p
                ));
            }
            
            fetchLiveData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

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

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    // Filter cards based on search and status
    const filterCards = (cards: CardData[]) => {
        return cards.filter(card => {
            const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                card.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                card.location?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    };

    if (activeView === 'chat') {
        return (
            <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
                <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setActiveView('dashboard')}
                            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <BarChart className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Admin Chat Center</h1>
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

    if (activeView === 'therapists' || activeView === 'places') {
        const cards = filterCards(activeView === 'therapists' ? therapists : places);
        const title = activeView === 'therapists' ? 'Therapist Cards' : 'Massage Place Cards';

        return (
            <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button
                                    onClick={() => setActiveView('dashboard')}
                                    className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800"
                                >
                                    <BarChart className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Back to Dashboard</span>
                                    <span className="sm:hidden">Back</span>
                                </button>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    <span className="text-black">Inda</span>
                                    <span className="text-orange-500">Street</span> {title}
                                </h1>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onLogout}
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search cards..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div className="relative w-full sm:w-auto">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {cards.map((card) => (
                            <div key={card.$id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Card Image */}
                                <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                                    {card.profileImage ? (
                                        <img 
                                            src={card.profileImage} 
                                            alt={card.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ImageIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(card.status)}`}>
                                        {card.status}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{card.name}</h3>
                                            {card.location && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{card.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {card.rating && (
                                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-gray-600">{card.rating}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{card.description}</p>

                                    {/* Pricing */}
                                    {(card.price60 || card.price90 || card.price120) && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Pricing:</p>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                {card.price60 && <div>60 min: {formatCurrency(card.price60)}</div>}
                                                {card.price90 && <div>90 min: {formatCurrency(card.price90)}</div>}
                                                {card.price120 && <div>120 min: {formatCurrency(card.price120)}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => handleEditCard(card)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        
                                        <button
                                            onClick={() => handleStatusToggle(card)}
                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                                                card.status === 'active' 
                                                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                        >
                                            {card.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            <span className="hidden sm:inline">
                                                {card.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </span>
                                            <span className="sm:hidden">
                                                {card.status === 'active' ? 'Hide' : 'Show'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {cards.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Users className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {editingCard && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                        <div className="bg-white rounded-lg sm:rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        Edit {activeView === 'therapists' ? 'Therapist' : 'Place'} Card
                                    </h2>
                                    <button
                                        onClick={() => setEditingCard(null)}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={editingCard.name}
                                            onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={editingCard.status}
                                            onChange={(e) => setEditingCard({ ...editingCard, status: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={editingCard.description}
                                        onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={editingCard.location || ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, location: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="text"
                                            value={editingCard.phone || ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editingCard.email || ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={editingCard.website || ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">60 Min Price (Rp)</label>
                                            <input
                                                type="number"
                                                value={editingCard.price60 || ''}
                                                onChange={(e) => setEditingCard({ ...editingCard, price60: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">90 Min Price (Rp)</label>
                                            <input
                                                type="number"
                                                value={editingCard.price90 || ''}
                                                onChange={(e) => setEditingCard({ ...editingCard, price90: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">120 Min Price (Rp)</label>
                                            <input
                                                type="number"
                                                value={editingCard.price120 || ''}
                                                onChange={(e) => setEditingCard({ ...editingCard, price120: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={editingCard.profileImage || ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, profileImage: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            <Upload className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Additional Fields for Therapists */}
                                {activeView === 'therapists' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                                            <input
                                                type="text"
                                                value={editingCard.experience || ''}
                                                onChange={(e) => setEditingCard({ ...editingCard, experience: e.target.value })}
                                                placeholder="e.g. 5 years experience"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma separated)</label>
                                            <input
                                                type="text"
                                                value={editingCard.specialties?.join(', ') || ''}
                                                onChange={(e) => setEditingCard({ 
                                                    ...editingCard, 
                                                    specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                })}
                                                placeholder="e.g. Deep Tissue, Swedish, Thai Massage"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Additional Fields for Places */}
                                {activeView === 'places' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                                            <input
                                                type="text"
                                                value={editingCard.serviceType || ''}
                                                onChange={(e) => setEditingCard({ ...editingCard, serviceType: e.target.value })}
                                                placeholder="e.g. Spa, Clinic, Home Service"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma separated)</label>
                                            <input
                                                type="text"
                                                value={editingCard.amenities?.join(', ') || ''}
                                                onChange={(e) => setEditingCard({ 
                                                    ...editingCard, 
                                                    amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                })}
                                                placeholder="e.g. Parking, WiFi, Refreshments"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                                <button
                                    onClick={() => setEditingCard(null)}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg sm:border-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveCard}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span> Admin Dashboard
                            </h1>
                            <p className="text-sm text-gray-600">
                                Live data • Last updated: {lastUpdated}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
                            {/* Auto-refresh toggle */}
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                    autoRefresh 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
                                <span className="sm:hidden">{autoRefresh ? 'ON' : 'OFF'}</span>
                            </button>

                            {/* Manual refresh */}
                            <button
                                onClick={fetchLiveData}
                                disabled={loading}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-xs sm:text-sm"
                            >
                                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            {/* Navigation buttons */}
                            <button
                                onClick={() => setActiveView('therapists')}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm"
                            >
                                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Edit Therapists</span>
                                <span className="sm:hidden">Therapists</span>
                            </button>

                            <button
                                onClick={() => setActiveView('places')}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm"
                            >
                                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Edit Places</span>
                                <span className="sm:hidden">Places</span>
                            </button>

                            {/* Chat button */}
                            <button
                                onClick={() => setActiveView('chat')}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xs sm:text-sm"
                            >
                                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Chat Center</span>
                                <span className="sm:hidden">Chat</span>
                            </button>

                            {/* Logout */}
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
                            >
                                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                                <p className="text-xs sm:text-sm text-green-600 mt-1">
                                    Monthly: {formatCurrency(stats.monthlyRevenue)}
                                </p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0 ml-2">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Members */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Members</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Therapists</h3>
                            <button
                                onClick={() => setActiveView('therapists')}
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                                Edit Cards →
                            </button>
                        </div>
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Places</h3>
                            <button
                                onClick={() => setActiveView('places')}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                                Edit Cards →
                            </button>
                        </div>
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
            </div>
        </div>
    );
};

export default LiveAdminDashboard;