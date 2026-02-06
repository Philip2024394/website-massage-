/**
 * TherapistAnalyticsPage - Comprehensive analytics dashboard
 * Shows bookings, earnings, ratings, and performance metrics
 */
import React, { useState, useEffect } from 'react';
import { BarChart as BarChart3, TrendingUp, DollarSign, Calendar, Star, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { bookingService } from '../../lib/bookingService';

interface AnalyticsData {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  canceledBookings: number;
  totalEarnings: number;
  avgRating: number;
  totalReviews: number;
  thisWeekBookings: number;
  thisMonthBookings: number;
}

interface TherapistAnalyticsPageProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistAnalyticsPage: React.FC<TherapistAnalyticsPageProps> = ({
  therapist,
  onBack,
  onNavigate,
  onLogout,
  language = 'id'
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    canceledBookings: 0,
    totalEarnings: 0,
    avgRating: 0,
    totalReviews: 0,
    thisWeekBookings: 0,
    thisMonthBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('✅ Analytics page mounted');
    loadAnalyticsData();
  }, [therapist]);

  const loadAnalyticsData = async () => {
    if (!therapist?.$id) {
      console.error('No therapist ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all bookings for this therapist
      const allBookings = await bookingService.getBookingsByProviderId(therapist.$id);
      
      // Calculate analytics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const completed = allBookings.filter((b: any) => b.status === 'completed');
      const pending = allBookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed');
      const canceled = allBookings.filter((b: any) => b.status === 'cancelled');
      
      const thisWeek = allBookings.filter((b: any) => {
        const bookingDate = new Date(b.createdAt || b.date);
        return bookingDate >= weekAgo;
      });
      
      const thisMonth = allBookings.filter((b: any) => {
        const bookingDate = new Date(b.createdAt || b.date);
        return bookingDate >= monthAgo;
      });
      
      // Calculate total earnings (70% of total price after 30% commission)
      const totalEarnings = completed.reduce((sum: number, booking: any) => {
        const price = booking.price || 0;
        const therapistShare = price * 0.7; // 70% after 30% commission
        return sum + therapistShare;
      }, 0);
      
      setAnalytics({
        totalBookings: allBookings.length,
        completedBookings: completed.length,
        pendingBookings: pending.length,
        canceledBookings: canceled.length,
        totalEarnings,
        avgRating: therapist.rating || 0,
        totalReviews: therapist.reviewCount || 0,
        thisWeekBookings: thisWeek.length,
        thisMonthBookings: thisMonth.length
      });
      
      console.log('📊 Analytics loaded:', analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="analytics"
      onNavigate={onNavigate || (() => {})}
      onLogout={onLogout}
      language={language}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'id' ? 'Analitik & Performa' : 'Analytics & Performance'}
              </h1>
              <p className="text-sm text-gray-600">
                {language === 'id' 
                  ? 'Statistik booking dan pendapatan Anda' 
                  : 'Your booking statistics and earnings'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {language === 'id' ? 'Memuat analitik...' : 'Loading analytics...'}
                </p>
              </div>
            </div>
          ) : analytics.totalBookings === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'id' ? 'Belum Ada Data' : 'No Data Yet'}
              </h3>
              <p className="text-gray-600">
                {language === 'id' 
                  ? 'Data analitik akan muncul setelah Anda menyelesaikan booking pertama' 
                  : 'Analytics data will appear after your first completed booking'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'id' ? 'Ringkasan' : 'Overview'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Calendar}
                    title={language === 'id' ? 'Total Booking' : 'Total Bookings'}
                    value={analytics.totalBookings}
                    subtitle={language === 'id' ? 'Semua waktu' : 'All time'}
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={CheckCircle}
                    title={language === 'id' ? 'Selesai' : 'Completed'}
                    value={analytics.completedBookings}
                    subtitle={`${analytics.totalBookings > 0 ? Math.round((analytics.completedBookings / analytics.totalBookings) * 100) : 0}% completion rate`}
                    color="text-green-600"
                  />
                  <StatCard
                    icon={Clock}
                    title={language === 'id' ? 'Pending' : 'Pending'}
                    value={analytics.pendingBookings}
                    subtitle={language === 'id' ? 'Menunggu konfirmasi' : 'Awaiting confirmation'}
                    color="text-yellow-600"
                  />
                  <StatCard
                    icon={XCircle}
                    title={language === 'id' ? 'Dibatalkan' : 'Canceled'}
                    value={analytics.canceledBookings}
                    subtitle={`${analytics.totalBookings > 0 ? Math.round((analytics.canceledBookings / analytics.totalBookings) * 100) : 0}% cancellation rate`}
                    color="text-red-600"
                  />
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'id' ? 'Pendapatan' : 'Earnings'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon={DollarSign}
                    title={language === 'id' ? 'Total Pendapatan' : 'Total Earnings'}
                    value={formatCurrency(analytics.totalEarnings)}
                    subtitle={language === 'id' ? 'Setelah komisi 30%' : 'After 30% commission'}
                    color="text-green-600"
                  />
                  <StatCard
                    icon={TrendingUp}
                    title={language === 'id' ? 'Rata-rata per Booking' : 'Average per Booking'}
                    value={formatCurrency(analytics.completedBookings > 0 ? analytics.totalEarnings / analytics.completedBookings : 0)}
                    subtitle={language === 'id' ? 'Pendapatan rata-rata' : 'Average earnings'}
                    color="text-purple-600"
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'id' ? 'Aktivitas Terkini' : 'Recent Activity'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon={Calendar}
                    title={language === 'id' ? '7 Hari Terakhir' : 'Last 7 Days'}
                    value={analytics.thisWeekBookings}
                    subtitle={language === 'id' ? 'Booking minggu ini' : 'Bookings this week'}
                    color="text-indigo-600"
                  />
                  <StatCard
                    icon={Calendar}
                    title={language === 'id' ? '30 Hari Terakhir' : 'Last 30 Days'}
                    value={analytics.thisMonthBookings}
                    subtitle={language === 'id' ? 'Booking bulan ini' : 'Bookings this month'}
                    color="text-pink-600"
                  />
                </div>
              </div>

              {/* Rating & Reviews */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'id' ? 'Rating & Ulasan' : 'Ratings & Reviews'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon={Star}
                    title={language === 'id' ? 'Rating Rata-rata' : 'Average Rating'}
                    value={analytics.avgRating.toFixed(1)}
                    subtitle={`${analytics.totalReviews} ${language === 'id' ? 'ulasan' : 'reviews'}`}
                    color="text-yellow-600"
                  />
                  <StatCard
                    icon={Users}
                    title={language === 'id' ? 'Total Ulasan' : 'Total Reviews'}
                    value={analytics.totalReviews}
                    subtitle={language === 'id' ? 'Dari pelanggan' : 'From customers'}
                    color="text-orange-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistAnalyticsPage;
