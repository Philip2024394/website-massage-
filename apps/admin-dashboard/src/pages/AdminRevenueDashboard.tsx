// @ts-nocheck - Temporary fix for React 19 type incompatibility
/**
 * 🔴 ADMIN REVENUE DASHBOARD
 * Real-time display of ACCEPTED bookings with commission tracking
 * 
 * Displays:
 * - Booking ID, Therapist/Business, Service, Duration, Total Value
 * - Admin Commission (30%), Commission Status
 * - Countdown timers to payment deadline
 * - Account status (AVAILABLE, BUSY, RESTRICTED)
 * 
 * Rules:
 * - Only ACCEPTED/CONFIRMED/COMPLETED bookings appear in revenue stats
 * - DECLINED and EXPIRED are excluded from revenue calculations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Clock, User, Building2, Timer, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, TrendingUp, Ban, Activity,
  Calendar, CreditCard, ArrowRight, Shield
} from 'lucide-react';
import {
  adminRevenueTrackerService,
  AdminBookingEntry,
  AdminRevenueStats
} from '@/lib/services/adminRevenueTrackerService';
import { CommissionStatus } from '@/lib/services/adminCommissionService';
import { BookingLifecycleStatus } from '@/lib/services/bookingLifecycleService';

// ============================================================================
// COUNTDOWN TIMER COMPONENT
// ============================================================================

interface CountdownTimerProps {
  milliseconds: number;
  label: string;
  urgentThreshold?: number; // Show warning color below this ms
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  milliseconds, 
  label, 
  urgentThreshold = 30 * 60 * 1000 // 30 minutes
}) => {
  if (milliseconds <= 0) {
    return (
      <span className="text-red-600 font-bold flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        OVERDUE
      </span>
    );
  }
  
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  
  const isUrgent = milliseconds < urgentThreshold;
  const colorClass = isUrgent ? 'text-red-600' : 'text-amber-600';
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Timer className="w-3 h-3" />
      <span className="font-mono text-xs">
        {hours > 0 && `${hours}h `}
        {minutes}m {seconds}s
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
};

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: string;
  type: 'booking' | 'commission' | 'account';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getColors = () => {
    if (type === 'booking') {
      switch (status) {
        case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800';
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'DECLINED': return 'bg-red-100 text-red-800';
        case 'EXPIRED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    
    if (type === 'commission') {
      switch (status) {
        case 'PENDING': return 'bg-amber-100 text-amber-800';
        case 'PAID': return 'bg-green-100 text-green-800';
        case 'OVERDUE': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    
    if (type === 'account') {
      switch (status) {
        case 'AVAILABLE': return 'bg-green-100 text-green-800';
        case 'BUSY': return 'bg-yellow-100 text-yellow-800';
        case 'CLOSED': return 'bg-gray-100 text-gray-800';
        case 'RESTRICTED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    
    return 'bg-gray-100 text-gray-600';
  };
  
  const getIcon = () => {
    if (type === 'commission') {
      switch (status) {
        case 'PENDING': return <Clock className="w-3 h-3" />;
        case 'PAID': return <CheckCircle className="w-3 h-3" />;
        case 'OVERDUE': return <AlertTriangle className="w-3 h-3" />;
      }
    }
    if (type === 'account' && status === 'RESTRICTED') {
      return <Ban className="w-3 h-3" />;
    }
    return null;
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getColors()}`}>
      {getIcon()}
      {status}
    </span>
  );
};

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className={`bg-white rounded-lg border p-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-full bg-gray-100">
        {icon}
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface AdminRevenueDashboardProps {
  onBack?: () => void;
}

const AdminRevenueDashboard: React.FC<AdminRevenueDashboardProps> = ({ onBack }) => {
  const [stats, setStats] = useState<AdminRevenueStats | null>(null);
  const [bookings, setBookings] = useState<AdminBookingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'revenue' | 'pending' | 'overdue'>('revenue');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Initialize real-time tracking
  useEffect(() => {
    const initTracker = async () => {
      setLoading(true);
      await adminRevenueTrackerService.initialize();
      setLoading(false);
    };
    
    initTracker();
    
    // Subscribe to updates
    const unsubscribe = adminRevenueTrackerService.subscribe((newStats, newBookings) => {
      setStats(newStats);
      setBookings(newBookings);
      setLastUpdated(new Date().toLocaleTimeString());
    });
    
    return () => {
      unsubscribe();
      adminRevenueTrackerService.cleanup();
    };
  }, []);

  // Format currency
  const formatIDR = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Get filtered bookings
  const getFilteredBookings = useCallback(() => {
    switch (filter) {
      case 'revenue':
        return bookings.filter(b => 
          ['ACCEPTED', 'CONFIRMED', 'COMPLETED'].includes(b.bookingStatus)
        );
      case 'pending':
        return bookings.filter(b => 
          b.commissionStatus === CommissionStatus.PENDING &&
          b.bookingStatus === BookingLifecycleStatus.COMPLETED
        );
      case 'overdue':
        return bookings.filter(b => b.commissionStatus === CommissionStatus.OVERDUE);
      default:
        return bookings;
    }
  }, [bookings, filter]);

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await adminRevenueTrackerService.refresh();
    setLoading(false);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading revenue data...</span>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Revenue Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Real-time booking & commission tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Last updated: {lastUpdated || 'Never'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Revenue"
            value={formatIDR(stats.totalRevenue)}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            color="border-l-4 border-l-green-500"
            subtitle="ACCEPTED/CONFIRMED/COMPLETED only"
          />
          <StatsCard
            title="Admin Commission"
            value={formatIDR(stats.totalCommission)}
            icon={<CreditCard className="w-5 h-5 text-blue-600" />}
            color="border-l-4 border-l-blue-500"
            subtitle="30% of revenue"
          />
          <StatsCard
            title="Pending Collection"
            value={stats.commissionPending}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            color="border-l-4 border-l-amber-500"
            subtitle="Awaiting payment"
          />
          <StatsCard
            title="Overdue"
            value={stats.commissionOverdue}
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            color="border-l-4 border-l-red-500"
            subtitle={`${stats.restrictedProviders} restricted`}
          />
        </div>
      )}

      {/* Booking Status Summary */}
      {stats && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Booking Status Summary</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm">Accepted: {stats.acceptedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-sm">Confirmed: {stats.confirmedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm">Completed: {stats.completedCount}</span>
            </div>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-3 h-3 rounded-full bg-red-300"></span>
              <span className="text-sm line-through">Declined: {stats.declinedCount}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              <span className="text-sm line-through">Expired: {stats.expiredCount}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ⚠️ Declined and Expired bookings are excluded from revenue calculations
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: 'revenue', label: 'Revenue Bookings', count: stats?.acceptedCount || 0 + (stats?.confirmedCount || 0) + (stats?.completedCount || 0) },
          { key: 'pending', label: 'Pending Commission', count: stats?.commissionPending || 0 },
          { key: 'overdue', label: '🔴 Overdue', count: stats?.commissionOverdue || 0 },
          { key: 'all', label: 'All Bookings', count: bookings.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Admin (30%)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Countdown</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Account</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No bookings found for this filter
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr 
                    key={booking.bookingDocId} 
                    className={`hover:bg-gray-50 ${
                      booking.commissionStatus === CommissionStatus.OVERDUE ? 'bg-red-50' : ''
                    }`}
                  >
                    {/* Booking ID */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {booking.bookingId}
                        </span>
                        <StatusBadge status={booking.bookingStatus} type="booking" />
                      </div>
                    </td>
                    
                    {/* Provider */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {booking.providerType === 'therapist' ? (
                          <User className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Building2 className="w-4 h-4 text-purple-500" />
                        )}
                        <div>
                          <span className="text-sm font-medium">
                            {booking.therapistName || booking.businessName || 'Unknown'}
                          </span>
                          <p className="text-xs text-gray-400">
                            {booking.providerType === 'therapist' ? 'Therapist' : 'Business'}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Service */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking.serviceName}
                    </td>
                    
                    {/* Duration */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking.duration} min
                    </td>
                    
                    {/* Total Value */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatIDR(booking.totalValue)}
                      </span>
                    </td>
                    
                    {/* Admin Commission */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-blue-600">
                        {formatIDR(booking.adminCommission)}
                      </span>
                      {booking.reactivationFeeRequired && (
                        <p className="text-xs text-red-600">
                          +{formatIDR(booking.reactivationFeeAmount)} fee
                        </p>
                      )}
                    </td>
                    
                    {/* Commission Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={booking.commissionStatus} type="commission" />
                    </td>
                    
                    {/* Countdown */}
                    <td className="px-4 py-3 text-center">
                      {booking.bookingStatus === BookingLifecycleStatus.COMPLETED &&
                       booking.commissionStatus === CommissionStatus.PENDING && (
                        <CountdownTimer
                          milliseconds={booking.restrictionCountdown || 0}
                          label="to restrict"
                        />
                      )}
                      {booking.commissionStatus === CommissionStatus.OVERDUE && (
                        <span className="text-red-600 text-xs font-bold">RESTRICTED</span>
                      )}
                      {booking.commissionStatus === CommissionStatus.PAID && (
                        <span className="text-green-600 text-xs">✓ Paid</span>
                      )}
                    </td>
                    
                    {/* Account Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={booking.accountStatus} type="account" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Revenue Rules
        </h4>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Revenue Stats:</strong> Only includes ACCEPTED, CONFIRMED, and COMPLETED bookings</li>
          <li><strong>Excluded:</strong> DECLINED and EXPIRED bookings are NOT counted in revenue</li>
          <li><strong>Commission:</strong> 30% admin fee on all completed bookings</li>
          <li><strong>Payment Deadline:</strong> 3 hours from booking completion</li>
          <li><strong>Restriction:</strong> Account blocked at 3h 30m if unpaid + Rp 25,000 reactivation fee</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminRevenueDashboard;
