// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Banknote, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Crown, BarChart3, X, XCircle, DollarSign } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { analyticsService } from '../../lib/services/analyticsService';
import { paymentService, bookingService } from '../../lib/appwriteService';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { earningsHelp } from './constants/helpContent';

interface Payment {
  $id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  adminCommission: number;
  netEarning: number;
  status: 'pending' | 'paid' | 'processing';
  date: string;
  paymentMethod: string;
}

interface TherapistEarningsProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistEarnings: React.FC<TherapistEarningsProps> = ({ therapist, onBack, onNavigate, onLogout, language = 'id' }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [busiestDays, setBusiestDays] = useState<any[]>([]);
  const [selectedDaySlots, setSelectedDaySlots] = useState<any[]>([]);
  const membershipTier = therapist?.membershipTier || 'free'; // 'free' or 'plus'
  const commissionRate = membershipTier === 'plus' ? 0 : 0.30; // Premium: 0%, Pro: 30%

  // Translation labels
  const labels = {
    en: {
      title: 'Earnings & Payments',
      subtitle: 'Track your income and payment history',
      totalEarnings: 'Total Earnings',
      totalPaid: 'Total Paid',
      totalPending: 'Total Pending',
      thisMonth: 'This month',
      processed: 'Processed payments',
      awaitingPayout: 'Awaiting payout',
      bestTimesAnalytics: 'Best Times Analytics',
      premiumFeature: 'Premium Feature',
      peakBookingHours: 'Peak booking hours chart',
      busyDaysHeatmap: 'Busy days heatmap',
      customerDemographics: 'Customer demographics',
      optimalSchedule: 'Optimal schedule recommendations',
      upgradeToPremium: 'Upgrade to Premium',
      to: 'to',
      bookingCount: 'booking(s)',
      averageBooking: 'average/booking',
      clickToView: 'Click day to view time slots',
      noPayments: 'No payments found',
      newPayments: 'New payments will appear here',
      loadingPayments: 'Loading payment history...',
      pleaseWait: 'Please wait',
      status: 'Status',
      customer: 'Customer',
      amount: 'Amount',
      commission: 'Commission',
      netEarning: 'Net Earning',
      date: 'Date',
      method: 'Method',
      paid: 'Paid',
      pending: 'Pending',
      processing: 'Processing'
    },
    id: {
      title: 'Pendapatan & Pembayaran',
      subtitle: 'Lacak pendapatan dan riwayat pembayaran Anda',
      totalEarnings: 'Total Pendapatan',
      totalPaid: 'Total Dibayar',
      totalPending: 'Total Pending',
      lostEarnings: 'Kehilangan Pendapatan',
      missedBookings: 'Booking Terlewat',
      completedBookings: 'Booking Selesai',
      thisMonth: 'Bulan ini',
      processed: 'Pembayaran diproses',
      awaitingPayout: 'Menunggu pembayaran',
      serviceBreakdown: 'Rincian per Durasi',
      bookNowEarnings: 'Book Now',
      scheduledEarnings: 'Terjadwal',
      expired: 'Kedaluwarsa (5 menit)',
      declined: 'Ditolak',
      cancelled: 'Dibatalkan',
      bestTimesAnalytics: 'Analitik Waktu Terbaik',
      premiumFeature: 'Fitur Premium',
      peakBookingHours: 'Grafik jam booking puncak',
      busyDaysHeatmap: 'Heatmap hari sibuk',
      customerDemographics: 'Demografi pelanggan',
      optimalSchedule: 'Rekomendasi jadwal optimal',
      upgradeToPremium: 'Upgrade ke Premium',
      to: 'sampai',
      bookingCount: 'booking',
      averageBooking: 'rata-rata/booking',
      clickToView: 'Klik hari untuk lihat slot waktu',
      noPayments: 'Tidak ada pembayaran ditemukan',
      newPayments: 'Pembayaran baru akan muncul di sini',
      loadingPayments: 'Memuat riwayat pembayaran...',
      pleaseWait: 'Mohon tunggu',
      status: 'Status',
      customer: 'Pelanggan',
      amount: 'Jumlah',
      commission: 'Komisi',
      netEarning: 'Pendapatan Bersih',
      date: 'Tanggal',
      method: 'Metode',
      paid: 'Dibayar',
      pending: 'Pending',
      processing: 'Diproses'
    }
  };

  const currentLabels = labels[language];

  useEffect(() => {
    fetchPayments();
    fetchBookings();
    loadAnalyticsData();
  }, [therapist]);

  useEffect(() => {
    if (selectedDay) {
      loadDayTimeSlots();
    }
  }, [selectedDay, therapist]);

  const loadAnalyticsData = async () => {
    if (!therapist?.$id) return;
    
    try {
      // Load analytics data with better error handling
      const [hours, days] = await Promise.all([
        analyticsService.getPeakBookingHours(therapist.$id).catch(err => {
          console.log('ℹ️ Peak hours analytics unavailable:', err.message);
          return []; // Return empty array instead of failing
        }),
        analyticsService.getBusiestDays(therapist.$id).catch(err => {
          console.log('ℹ️ Busiest days analytics unavailable:', err.message);
          return []; // Return empty array instead of failing
        })
      ]);
      
      setPeakHours(hours);
      setBusiestDays(days);
      
      if (hours.length > 0 || days.length > 0) {
        console.log('✅ Analytics loaded successfully');
      } else {
        console.log('ℹ️ No analytics data available yet');
      }
      
    } catch (error) {
      // Graceful degradation - analytics are optional
      console.log('ℹ️ Analytics service unavailable (bookings collection may be disabled):', error.message);
      setPeakHours([]);
      setBusiestDays([]);
    }
  };

  const loadDayTimeSlots = async () => {
    if (!therapist?.$id || !selectedDay) return;
    
    try {
      const slots = await analyticsService.getDayTimeSlots(therapist.$id, selectedDay);
      setSelectedDaySlots(slots);
    } catch (error) {
      // Silently fail if bookings collection is disabled
      console.log('ℹ️ Day slots unavailable (bookings collection disabled)');
    }
  };

  const fetchPayments = async () => {
    try {
      // Fetch real payments from Appwrite
      const realPayments = await paymentService.getPaymentsByTherapist(therapist.$id);
      
      // Transform to match Payment interface
      const transformedPayments: Payment[] = realPayments.map((payment: any) => ({
        $id: payment.$id,
        bookingId: payment.bookingId,
        customerName: payment.customerName,
        amount: payment.paymentAmount, // Use paymentAmount (full amount in IDR)
        adminCommission: Math.round(payment.paymentAmount * 0.30), // Calculate from paymentAmount
        netEarning: Math.round(payment.paymentAmount * 0.70), // Calculate from paymentAmount
        status: payment.status,
        date: payment.date,
        paymentMethod: payment.paymentMethod || 'Cash'
      }));
      
      setPayments(transformedPayments);
      console.log('✅ Loaded', transformedPayments.length, 'real payments for therapist', therapist.$id);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      // Fallback to empty array on error
      setPayments([]);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch all bookings from Appwrite bookings collection
      console.log('📊 [EARNINGS] Fetching bookings from Appwrite for therapist:', therapist.$id);
      const realBookings = await bookingService.getProviderBookings(therapist.$id);
      
      console.log('✅ [EARNINGS] Loaded', realBookings.length, 'bookings from Appwrite');
      console.log('📊 [EARNINGS] Data source: Appwrite bookings collection (NOT localStorage)');
      
      // Store bookings with full details
      setBookings(realBookings.map((doc: any) => ({
        $id: doc.$id,
        customerName: doc.userName || doc.customerName || 'Unknown',
        service: doc.service || '60',
        duration: doc.duration || 60,
        totalAmount: doc.totalAmount || doc.price || 0,
        status: doc.status || 'pending',
        date: doc.date || doc.$createdAt,
        isScheduled: doc.isScheduled || false,
        depositAmount: doc.depositAmount || 0,
        expiresAt: doc.expiresAt,
        createdAt: doc.$createdAt
      })));
      
    } catch (error) {
      console.error('❌ [EARNINGS] Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive earnings from BOOKINGS (Appwrite collection)
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const expiredBookings = bookings.filter(b => b.status === 'expired');
  const declinedBookings = bookings.filter(b => b.status === 'declined' || b.status === 'rejected');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  
  const bookingStats = {
    // COMPLETED EARNINGS (actual revenue from finished bookings)
    totalRevenue: completedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    netEarnings: completedBookings.reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    adminCommission: completedBookings.reduce((sum, b) => sum + (b.totalAmount * 0.30), 0),
    
    // LOST EARNINGS (missed opportunities)
    lostFromExpired: expiredBookings.reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    lostFromDeclined: declinedBookings.reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    lostFromCancelled: cancelledBookings.reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    totalLost: [...expiredBookings, ...declinedBookings, ...cancelledBookings].reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    
    // BOOKING COUNTS
    completedCount: completedBookings.length,
    expiredCount: expiredBookings.length,
    declinedCount: declinedBookings.length,
    cancelledCount: cancelledBookings.length,
    
    // SERVICE BREAKDOWN (60/90/120 minutes)
    earnings60min: completedBookings.filter(b => b.service === '60').reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    earnings90min: completedBookings.filter(b => b.service === '90').reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    earnings120min: completedBookings.filter(b => b.service === '120').reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    
    count60min: completedBookings.filter(b => b.service === '60').length,
    count90min: completedBookings.filter(b => b.service === '90').length,
    count120min: completedBookings.filter(b => b.service === '120').length,
    
    // BOOK NOW vs SCHEDULED
    bookNowEarnings: completedBookings.filter(b => !b.isScheduled).reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    scheduledEarnings: completedBookings.filter(b => b.isScheduled).reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
    
    bookNowCount: completedBookings.filter(b => !b.isScheduled).length,
    scheduledCount: completedBookings.filter(b => b.isScheduled).length,
    
    // MONTHLY BREAKDOWN
    monthlyEarnings: completedBookings
      .filter(b => new Date(b.date).getMonth() === new Date().getMonth())
      .reduce((sum, b) => sum + (b.totalAmount * 0.70), 0),
  };

  // Legacy payment stats (kept for backward compatibility)
  const stats = {
    totalDue: payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.netEarning, 0),
    adminDue: payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.adminCommission, 0),
    totalPaid: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.netEarning, 0),
    monthlyEarnings: payments
      .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.netEarning, 0),
  };

  const getStatusBadge = (status: Payment['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
    };
    return badges[status];
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <TrendingUp className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="earnings"
      onNavigate={handleNavigate}
      language={language}
      onLogout={onLogout}
    >
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-sm mx-auto px-4 py-6">
        <div className="space-y-4">
        {/* Standardized Status Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{currentLabels.title}</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
              <span className="text-xs text-gray-500">bulan ini</span>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => console.log('Status change: available')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'bg-green-50 border-green-500'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-700'
                  : 'text-gray-600'
              }`}>Tersedia</p>
            </button>

            <button
              onClick={() => console.log('Status change: busy')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'busy'
                  ? 'bg-amber-50 border-amber-500'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'busy'
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'busy'
                  ? 'text-amber-700'
                  : 'text-gray-600'
              }`}>Sibuk</p>
            </button>

            <button
              onClick={() => console.log('Status change: offline')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.availability === 'offline'
                  ? 'bg-red-50 border-red-500'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.availability === 'offline'
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.availability === 'offline'
                  ? 'text-red-700'
                  : 'text-gray-600'
              }`}>Offline</p>
            </button>
          </div>
        </div>
        
        {/* Booking-Based Stats Cards */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-sm font-bold text-gray-900">Total Earnings (Completed)</h3>
              <HelpTooltip {...earningsHelp.completedEarnings} position="bottom" size="sm" />
            </div>
            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
              {bookingStats.completedCount} bookings
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700 mb-1">
            Rp {bookingStats.netEarnings.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-green-600">
            From Rp {bookingStats.totalRevenue.toLocaleString('id-ID')} (70% after commission)
          </p>
        </div>

        {/* Lost Earnings Alert */}
        {bookingStats.totalLost > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">Lost Earnings</h3>
                <HelpTooltip {...earningsHelp.lostEarnings} position="bottom" size="sm" />
              </div>
              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                {bookingStats.expiredCount + bookingStats.declinedCount + bookingStats.cancelledCount} missed
              </span>
            </div>
            <p className="text-2xl font-bold text-red-700 mb-2">
              Rp {bookingStats.totalLost.toLocaleString('id-ID')}
            </p>
            <div className="space-y-1 text-xs">
              {bookingStats.expiredCount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>⏰ Expired (5-min timeout):</span>
                  <span className="font-semibold">Rp {bookingStats.lostFromExpired.toLocaleString('id-ID')} ({bookingStats.expiredCount})</span>
                </div>
              )}
              {bookingStats.declinedCount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>❌ Declined:</span>
                  <span className="font-semibold">Rp {bookingStats.lostFromDeclined.toLocaleString('id-ID')} ({bookingStats.declinedCount})</span>
                </div>
              )}
              {bookingStats.cancelledCount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>🚫 Cancelled:</span>
                  <span className="font-semibold">Rp {bookingStats.lostFromCancelled.toLocaleString('id-ID')} ({bookingStats.cancelledCount})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Duration Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900">Service Duration Breakdown</h3>
            <HelpTooltip {...earningsHelp.serviceBreakdown} position="bottom" size="sm" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">60 minutes</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rp {bookingStats.earnings60min.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{bookingStats.count60min} bookings</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">90 minutes</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rp {bookingStats.earnings90min.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{bookingStats.count90min} bookings</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">120 minutes</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rp {bookingStats.earnings120min.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{bookingStats.count120min} bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Book Now vs Scheduled */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-gray-900">Booking Types</h3>
            <HelpTooltip {...earningsHelp.bookingTypes} position="bottom" size="sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600 font-semibold">Book Now</span>
              </div>
              <p className="text-base font-bold text-gray-900">
                Rp {bookingStats.bookNowEarnings.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500">{bookingStats.bookNowCount} bookings</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600 font-semibold">Scheduled</span>
              </div>
              <p className="text-base font-bold text-gray-900">
                Rp {bookingStats.scheduledEarnings.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500">{bookingStats.scheduledCount} bookings</p>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="text-xs text-gray-500 font-semibold">{currentLabels.thisMonth}</span>
            <HelpTooltip {...earningsHelp.monthlyEarnings} position="bottom" size="sm" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            Rp {bookingStats.monthlyEarnings.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-1">From completed bookings</p>
        </div>

        {/* Data Source Badge */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <p className="text-xs text-blue-800 flex-1">
              <span className="font-bold">✅ Connected to Appwrite:</span> All earnings calculated from bookings collection in real-time
            </p>
            <HelpTooltip {...earningsHelp.dataSource} position="left" size="sm" />
          </div>
        </div>

        {/* Premium Analytics Upsell */}
        {membershipTier === 'free' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">{currentLabels.bestTimesAnalytics}</h3>
                  <p className="text-xs text-gray-500">{currentLabels.premiumFeature}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-400 rounded-lg">
                <Crown className="w-4 h-4 text-gray-900" />
                <span className="text-xs font-bold text-gray-900">Premium</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
                  <span className="text-sm text-gray-700">{currentLabels.peakBookingHours}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
                  <span className="text-sm text-gray-700">{currentLabels.busyDaysHeatmap}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
                  <span className="text-sm text-gray-700">{currentLabels.customerDemographics}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
                  <span className="text-sm text-gray-700">{currentLabels.optimalSchedule}</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm">
              {currentLabels.upgradeToPremium}
            </button>
          </div>
        )}

        {/* Premium/Elite Analytics */}
        {(membershipTier === 'premium' || membershipTier === 'elite' || membershipTier === 'plus') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-bold text-gray-900">{currentLabels.bestTimesAnalytics}</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-400 rounded-lg">
                <Crown className="w-4 h-4 text-gray-900" />
                <span className="text-xs font-bold text-gray-900">Premium</span>
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Peak Booking Hours</h3>
                <HelpTooltip {...earningsHelp.peakHours} position="bottom" size="sm" />
              </div>
              <div className="space-y-2">
                {(peakHours.length > 0 ? peakHours : [
                  { hour: '9:00 - 11:00 AM', bookings: 12, percentage: 85 },
                  { hour: '2:00 - 4:00 PM', bookings: 10, percentage: 70 },
                  { hour: '5:00 - 7:00 PM', bookings: 8, percentage: 55 },
                  { hour: '11:00 - 1:00 PM', bookings: 5, percentage: 35 },
                ]).map((slot, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{slot.hour}</span>
                      <span className="text-gray-500">{slot.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                        style={{ width: `${slot.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Busy Days */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Busiest Days</h3>
                <HelpTooltip {...earningsHelp.busiestDays} position="bottom" size="sm" />
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {(busiestDays.length > 0 ? busiestDays : [
                  { day: 'Mon', intensity: 90 },
                  { day: 'Tue', intensity: 75 },
                  { day: 'Wed', intensity: 80 },
                  { day: 'Thu', intensity: 85 },
                  { day: 'Fri', intensity: 95 },
                  { day: 'Sat', intensity: 60 },
                  { day: 'Sun', intensity: 40 },
                ]).map((dayData, index) => {
                  const day = dayData.day;
                  const intensity = dayData.intensity;
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className="text-center transition-all"
                    >
                      <div
                        className={`rounded-lg p-2 mb-1 ${
                          isSelected 
                            ? 'bg-green-500' 
                            : 'bg-orange-500'
                        }`}
                      >
                        <span className="text-xs font-bold text-white">{day}</span>
                      </div>
                      <span className="text-xs text-gray-600">{intensity}%</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Busy Times for Selected Day */}
              {selectedDay && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fadeIn">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">{selectedDay} - Busy Times</h4>
                  <div className="space-y-2">
                    {(selectedDaySlots.length > 0 ? selectedDaySlots : [
                      { time: '9:00 - 11:00 AM', bookings: 8, percentage: 75 },
                      { time: '11:00 - 1:00 PM', bookings: 6, percentage: 55 },
                      { time: '2:00 - 4:00 PM', bookings: 10, percentage: 85 },
                      { time: '4:00 - 6:00 PM', bookings: 7, percentage: 65 },
                      { time: '6:00 - 8:00 PM', bookings: 5, percentage: 45 },
                    ]).map((slot, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{slot.time}</span>
                          <span className="text-gray-500">{slot.bookings} bookings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                            style={{ width: `${slot.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-semibold text-orange-900 mb-2 text-sm">💡 Recommendations</h4>
              <ul className="space-y-1 text-xs text-orange-800">
                <li>• Mon-Fri 9AM-4PM shows highest bookings</li>
                <li>• Sunday has low demand - ideal rest day</li>
                <li>• Friday peaks at 95% - maximize availability</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Payment History</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading payments...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.$id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{payment.customerName}</h4>
                      <p className="text-xs text-gray-500">ID: {payment.bookingId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusBadge(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total:</span>
                      <p className="font-bold text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Admin 30%:</span>
                      <p className="font-bold text-orange-600">- Rp {payment.adminCommission.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-900 font-semibold">Your Earning:</span>
                      <p className="font-bold text-green-600 text-base">Rp {payment.netEarning.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-gray-500 text-xs">Date:</span>
                      <p className="font-medium text-gray-700 text-xs">{new Date(payment.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
    </TherapistLayout>
  );
};

export default TherapistEarnings;
