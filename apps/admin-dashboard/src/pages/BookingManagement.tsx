// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, User, Phone, MessageSquare, CheckCircle, XCircle,
    AlertCircle, RefreshCw, Search, Filter, MapPin, DollarSign,
    Send, Ban, Archive, Eye, MoreVertical, Users, Timer
} from 'lucide-react';

interface Booking {
    $id: string;
    customerName: string;
    customerWhatsApp: string;
    therapistId?: string;
    therapistName?: string;
    placeId?: string;
    placeName?: string;
    serviceType: string;
    duration: number; // minutes
    price: number;
    status: 'pending' | 'accepted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'expired';
    createdAt: string;
    acceptedAt?: string;
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    expiresAt?: string; // Time limit for response
    location?: string;
    notes?: string;
    chatWindowOpen: boolean;
    attemptedMembers?: string[]; // IDs of members who were offered this booking
    currentMemberOffered?: string; // Current member ID the booking is offered to
}

interface BookingManagementProps {
    onBack?: () => void;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ onBack }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Booking['status']>('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const [showReassignModal, setShowReassignModal] = useState(false);

    useEffect(() => {
        fetchBookings();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchBookings, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            // ✅ AUDIT FIX: Replaced mock data with real Appwrite queries
            const { bookingService } = await import('@/lib/appwriteService');
            const bookingsData = await bookingService.getAll();
            
            // Map Appwrite documents to Booking interface
            const mappedBookings: Booking[] = bookingsData.map((doc: any) => ({
                $id: doc.$id,
                customerName: doc.userName || doc.customerName || 'Unknown',
                customerWhatsApp: doc.customerWhatsApp || doc.userWhatsApp || 'N/A',
                therapistId: doc.providerType === 'therapist' ? doc.providerId : undefined,
                therapistName: doc.providerType === 'therapist' ? doc.providerName : undefined,
                placeId: doc.providerType === 'place' ? doc.providerId : undefined,
                placeName: doc.providerType === 'place' ? doc.providerName : undefined,
                serviceType: doc.service ? `${doc.service} min massage` : 'Massage',
                duration: doc.duration || parseInt(doc.service) || 60,
                price: doc.totalCost || doc.price * 1000 || 0,
                status: doc.status?.toLowerCase() || 'pending',
                createdAt: doc.$createdAt || doc.createdAt,
                acceptedAt: doc.acceptedAt,
                expiresAt: doc.responseDeadline || doc.expiresAt,
                location: doc.location || 'Not specified',
                chatWindowOpen: false, // Default - can be enhanced with chat_rooms lookup
                attemptedMembers: doc.attemptedMembers || [],
                currentMemberOffered: doc.currentMemberOffered || doc.providerId
            }));
            
            setBookings(mappedBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredBookings = () => {
        return bookings.filter(booking => {
            const matchesSearch = 
                booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.customerWhatsApp.includes(searchQuery) ||
                booking.therapistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.placeName?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    };

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'accepted': return <CheckCircle className="w-4 h-4" />;
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'in-progress': return <Timer className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            case 'expired': return <AlertCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getTimeRemaining = (expiresAt?: string) => {
        if (!expiresAt) return null;
        
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const diff = expiry - now;
        
        if (diff <= 0) return 'Expired';
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        return `${minutes}m ${seconds}s`;
    };

    const handleReassignBooking = async (bookingId: string, newMemberId: string) => {
        try {
            // TODO: Integrate with Appwrite
            // Update booking with new member
            // Send notification to new member
            // Update attemptedMembers list
            // Reset expiry timer
            
            console.log('Reassigning booking', bookingId, 'to member', newMemberId);
            
            setBookings(prev => prev.map(b => 
                b.$id === bookingId 
                    ? {
                        ...b,
                        currentMemberOffered: newMemberId,
                        attemptedMembers: [...(b.attemptedMembers || []), b.currentMemberOffered!],
                        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                        chatWindowOpen: true
                    }
                    : b
            ));
            
            setShowReassignModal(false);
            alert('Booking reassigned successfully');
        } catch (error) {
            console.error('Error reassigning booking:', error);
            alert('Failed to reassign booking');
        }
    };

    const handleCancelBooking = async (bookingId: string, reason: string) => {
        try {
            // TODO: Integrate with Appwrite
            // Update booking status to cancelled
            // Send notification to customer
            // Close chat window
            
            setBookings(prev => prev.map(b => 
                b.$id === bookingId 
                    ? {
                        ...b,
                        status: 'cancelled',
                        cancelledAt: new Date().toISOString(),
                        chatWindowOpen: false,
                        notes: (b.notes || '') + `\nCancelled by admin: ${reason}`
                    }
                    : b
            ));
            
            alert('Booking cancelled successfully');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking');
        }
    };

    const handleCloseChatWindow = async (bookingId: string) => {
        try {
            setBookings(prev => prev.map(b => 
                b.$id === bookingId 
                    ? { ...b, chatWindowOpen: false }
                    : b
            ));
        } catch (error) {
            console.error('Error closing chat:', error);
        }
    };

    const openWhatsApp = (phone: string, message: string) => {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${encodedMessage}`, '_blank');
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + b.price, 0)
    };

    const filteredBookings = getFilteredBookings();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                ←
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
                            <p className="text-gray-600">Manage customer bookings and assignments</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                        <div className="text-sm text-yellow-700">Pending</div>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-900">{stats.confirmed}</div>
                        <div className="text-sm text-green-700">Confirmed</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-900">{stats.completed}</div>
                        <div className="text-sm text-blue-700">Completed</div>
                    </div>
                    <div className="bg-red-50 rounded-xl shadow-sm p-4 border border-red-200">
                        <div className="text-2xl font-bold text-red-900">{stats.cancelled}</div>
                        <div className="text-sm text-red-700">Cancelled</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl shadow-sm p-4 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-900">
                            Rp {(stats.totalRevenue / 1000).toFixed(0)}k
                        </div>
                        <div className="text-sm text-purple-700">Revenue</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or therapist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time Remaining
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Chat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                                        <p className="text-gray-600">Loading bookings...</p>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-600">No bookings found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.$id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-8 h-8 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="w-3 h-3" />
                                                        {booking.customerWhatsApp}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{booking.serviceType}</div>
                                            <div className="text-sm text-gray-600">{booking.duration} min • Rp {booking.price.toLocaleString()}</div>
                                            {booking.location && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {booking.location}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.therapistName || booking.placeName ? (
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {booking.therapistName || booking.placeName}
                                                    </div>
                                                    {booking.attemptedMembers && booking.attemptedMembers.length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {booking.attemptedMembers.length} attempted
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.status === 'pending' && booking.expiresAt ? (
                                                <div className="text-sm font-medium text-orange-600">
                                                    {getTimeRemaining(booking.expiresAt)}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.chatWindowOpen ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Open
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                    Closed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowDetails(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openWhatsApp(
                                                        booking.customerWhatsApp,
                                                        `Hi ${booking.customerName}, this is IndaStreet regarding your ${booking.serviceType} booking.`
                                                    )}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="WhatsApp Customer"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setShowReassignModal(true);
                                                        }}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                        title="Reassign to Another Member"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {showDetails && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedBooking.customerName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">WhatsApp:</span>
                                        <button
                                            onClick={() => openWhatsApp(
                                                selectedBooking.customerWhatsApp,
                                                `Hi ${selectedBooking.customerName}, this is IndaStreet.`
                                            )}
                                            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {selectedBooking.customerWhatsApp}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{selectedBooking.serviceType}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{selectedBooking.duration} minutes</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-medium text-green-600">Rp {selectedBooking.price.toLocaleString()}</span>
                                    </div>
                                    {selectedBooking.location && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">{selectedBooking.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Member Info */}
                            {(selectedBooking.therapistName || selectedBooking.placeName) && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned Member</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-medium">{selectedBooking.therapistName || selectedBooking.placeName}</div>
                                        {selectedBooking.attemptedMembers && selectedBooking.attemptedMembers.length > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Previously attempted: {selectedBooking.attemptedMembers.length} member(s)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Status & Timeline */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status & Timeline</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Current Status:</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                                            {selectedBooking.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                                    </div>
                                    {selectedBooking.expiresAt && selectedBooking.status === 'pending' && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Expires In:</span>
                                            <span className="font-medium text-orange-600">{getTimeRemaining(selectedBooking.expiresAt)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Chat Window:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedBooking.chatWindowOpen ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                            {selectedBooking.chatWindowOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedBooking.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedBooking.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                {selectedBooking.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowDetails(false);
                                                setShowReassignModal(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                                        >
                                            <Users className="w-5 h-5" />
                                            Reassign to Another Member
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for cancellation:');
                                                if (reason) {
                                                    handleCancelBooking(selectedBooking.$id, reason);
                                                    setShowDetails(false);
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                                        >
                                            <Ban className="w-5 h-5" />
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {selectedBooking.chatWindowOpen && (
                                    <button
                                        onClick={() => {
                                            handleCloseChatWindow(selectedBooking.$id);
                                            setShowDetails(false);
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Close Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Modal */}
            {showReassignModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Reassign Booking</h2>
                            <p className="text-sm text-gray-600 mt-1">Select a new member for this booking</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    This will notify the new member and reset the 15-minute response timer.
                                </p>
                            </div>
                            
                            {/* TODO: List available members */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleReassignBooking(selectedBooking.$id, 'member2')}
                                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="font-medium">Available Member 1</div>
                                    <div className="text-sm text-gray-600">4.8★ • 150 bookings</div>
                                </button>
                                <button
                                    onClick={() => handleReassignBooking(selectedBooking.$id, 'member3')}
                                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="font-medium">Available Member 2</div>
                                    <div className="text-sm text-gray-600">4.9★ • 200 bookings</div>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowReassignModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
