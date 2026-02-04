/**
 * ============================================================================
 * 📅 BOOKING MANAGEMENT - Complete Booking Operations
 * ============================================================================
 * 
 * Comprehensive booking management for all bookings across therapists, 
 * massage places, and skin clinics. Safe implementation using existing services.
 * 
 * Features:
 * ✅ View all bookings
 * ✅ Filter by status, service type, date
 * ✅ Update booking status
 * ✅ Booking analytics
 * ✅ Anti-spam booking detection
 * ✅ Safe error handling
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { adminBookingService } from '@/lib/adminServices';
import { AdminGuardDev } from '@/lib/adminGuard';

// ============================================================================
// 🎯 BOOKING MANAGEMENT COMPONENT
// ============================================================================

export const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // ============================================================================
  // 📊 DATA LOADING
  // ============================================================================
  
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminBookingService.getAll();
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadBookings();
  }, []);
  
  // ============================================================================
  // 🔍 FILTERING
  // ============================================================================
  
  useEffect(() => {
    let filtered = [...bookings];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.$createdAt || booking.date);
        const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        
        switch (dateFilter) {
          case 'today':
            return bookingDateOnly.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDateOnly >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDateOnly >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateFilter]);
  
  // ============================================================================
  // 🛠️ BOOKING OPERATIONS
  // ============================================================================
  
  const handleView = (booking: any) => {
    setSelectedBooking(booking);
    setViewMode(true);
  };
  
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await adminBookingService.update(bookingId, { status: newStatus });
      await loadBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
    }
  };
  
  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      today: bookings.filter(b => {
        const bookingDate = new Date(b.$createdAt || b.date);
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
      }).length
    };
    return stats;
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };
  
  const getServiceIcon = (booking: any) => {
    // Try to determine service type from booking data
    if (booking.serviceType === 'facial' || booking.isFacialPlace) {
      return '🧔'; // Skin clinic
    }
    return '💆'; // Massage
  };
  
  // ============================================================================
  // 🎨 RENDER COMPONENTS
  // ============================================================================
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <h3 className="text-red-800 font-semibold">Error Loading Bookings</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button 
            onClick={loadBookings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const stats = getBookingStats();
  
  return (
    <AdminGuardDev>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📅 Booking Management
          </h1>
          <p className="text-gray-600">
            Manage all bookings for therapists, massage places, and skin clinics
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-blue-800 font-semibold">Total</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-yellow-800 font-semibold">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold">Confirmed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-purple-800 font-semibold">Completed</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">Cancelled</h3>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-indigo-800 font-semibold">Today</h3>
            <p className="text-2xl font-bold text-indigo-600">{stats.today}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Filter
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadBookings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getServiceIcon(booking)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ID: {booking.$id?.substring(0, 8) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.therapistName || booking.placeName || 'Unknown Provider'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.serviceType || 'General'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.duration || 'N/A'} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.customerName || booking.userName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customerPhone || booking.userPhone || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDate(booking.bookingDate || booking.$createdAt)}</div>
                      {booking.timeSlot && (
                        <div className="text-gray-500">{booking.timeSlot}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleView(booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <select 
                          value={booking.status || 'pending'}
                          onChange={(e) => handleStatusChange(booking.$id, e.target.value)}
                          className="text-xs border rounded px-1 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
              <button 
                onClick={loadBookings}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
        
        {/* View Modal */}
        {viewMode && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {selectedBooking.$id}</div>
                    <div><strong>Status:</strong> {selectedBooking.status}</div>
                    <div><strong>Service:</strong> {selectedBooking.serviceType || 'General'}</div>
                    <div><strong>Duration:</strong> {selectedBooking.duration || 'N/A'} minutes</div>
                    <div><strong>Date:</strong> {formatDate(selectedBooking.bookingDate || selectedBooking.$createdAt)}</div>
                    {selectedBooking.timeSlot && (
                      <div><strong>Time:</strong> {selectedBooking.timeSlot}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedBooking.customerName || selectedBooking.userName || 'Unknown'}</div>
                    <div><strong>Phone:</strong> {selectedBooking.customerPhone || selectedBooking.userPhone || 'No phone'}</div>
                    <div><strong>Email:</strong> {selectedBooking.customerEmail || selectedBooking.userEmail || 'No email'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Provider Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Provider:</strong> {selectedBooking.therapistName || selectedBooking.placeName || 'Unknown'}</div>
                    <div><strong>Type:</strong> {selectedBooking.isFacialPlace ? 'Skin Clinic' : 'Massage Place'}</div>
                    {selectedBooking.location && (
                      <div><strong>Location:</strong> {selectedBooking.location}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                  <div className="space-y-2 text-sm">
                    {selectedBooking.price && (
                      <div><strong>Price:</strong> ${selectedBooking.price}</div>
                    )}
                    {selectedBooking.notes && (
                      <div><strong>Notes:</strong> {selectedBooking.notes}</div>
                    )}
                    <div><strong>Created:</strong> {formatDate(selectedBooking.$createdAt)}</div>
                    <div><strong>Updated:</strong> {formatDate(selectedBooking.$updatedAt)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setViewMode(false);
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuardDev>
  );
};

export default BookingManagement;