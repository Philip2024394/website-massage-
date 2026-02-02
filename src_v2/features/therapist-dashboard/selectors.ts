/**
 * ============================================================================
 * 🎯 THERAPIST DASHBOARD SELECTORS - FEATURE BOUNDARY
 * ============================================================================
 * 
 * BOUNDARIES ENFORCED:
 * ✅ Contains only data transformation/selection logic
 * 🚫 No side effects
 * 🚫 No API calls
 * 🚫 No state mutations
 * 🚫 No routing logic
 * 
 * PURPOSE:
 * Transform raw data into view-ready format
 * 
 * ============================================================================
 */

export interface TherapistStats {
  totalBookings: number;
  earnings: number;
  rating: number;
  upcomingAppointments: number;
  completedThisMonth: number;
  pendingRequests: number;
}

export interface BookingData {
  id: string;
  clientName: string;
  serviceType: string;
  time: string;
  date: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed';
  amount?: number;
}

// Selector functions
export const selectTherapistStats = (rawData: any): TherapistStats => {
  // Transform raw API data into stats format
  return {
    totalBookings: rawData?.bookings?.total || 0,
    earnings: rawData?.earnings?.total || 0,
    rating: rawData?.reviews?.averageRating || 0,
    upcomingAppointments: rawData?.bookings?.upcoming?.length || 0,
    completedThisMonth: rawData?.bookings?.completedThisMonth || 0,
    pendingRequests: rawData?.bookings?.pending?.length || 0
  };
};

export const selectUpcomingBookings = (rawBookings: any[]): BookingData[] => {
  if (!Array.isArray(rawBookings)) return [];
  
  return rawBookings
    .filter(booking => booking.status !== 'completed')
    .map(booking => ({
      id: booking.id || '',
      clientName: booking.client?.name || 'Unknown Client',
      serviceType: booking.service?.name || 'Massage Service',
      time: formatTime(booking.scheduledTime),
      date: formatDate(booking.scheduledDate),
      location: booking.location?.address || 'Location TBD',
      status: booking.status || 'pending',
      amount: booking.amount || 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const selectTodaysBookings = (bookings: BookingData[]): BookingData[] => {
  const today = new Date().toDateString();
  return bookings.filter(booking => 
    booking.date === 'Today' || new Date(booking.date).toDateString() === today
  );
};

export const selectEarningsData = (rawEarnings: any) => {
  return {
    total: rawEarnings?.total || 0,
    thisMonth: rawEarnings?.thisMonth || 0,
    lastMonth: rawEarnings?.lastMonth || 0,
    growth: calculateGrowthPercentage(
      rawEarnings?.thisMonth || 0,
      rawEarnings?.lastMonth || 0
    ),
    breakdown: rawEarnings?.breakdown || []
  };
};

export const selectDashboardSummary = (rawData: any) => {
  return {
    stats: selectTherapistStats(rawData),
    upcomingBookings: selectUpcomingBookings(rawData?.bookings || []),
    earnings: selectEarningsData(rawData?.earnings),
    recentActivity: rawData?.activity || []
  };
};

// Utility functions
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  try {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return timeString;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateString;
  }
};

const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Export utility functions for external use
export const dashboardUtils = {
  formatTime,
  formatDate,
  calculateGrowthPercentage
};