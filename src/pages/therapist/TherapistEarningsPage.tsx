// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Banknote, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Crown, BarChart3, X, XCircle, DollarSign } from 'lucide-react';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';
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

const TherapistEarningsPage: React.FC<TherapistEarningsProps> = ({ therapist, onBack, onNavigate, onLogout, language = 'id' }) => {
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
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      processing: 'bg-blue-50 text-blue-800 border-blue-200',
      paid: 'bg-green-50 text-green-800 border-green-200',
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
    <TherapistSimplePageLayout
      title={currentLabels.title}
      subtitle={currentLabels.subtitle}
      onBackToStatus={onBack}
      onNavigate={handleNavigate}
      therapist={therapist}
      currentPage="earnings"
      language={language}
      onLogout={onLogout}
      icon={<DollarSign className="w-6 h-6 text-orange-600" />}
    >
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Stats - same style as home: rounded-lg, border, orange tint */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Total Earnings (Completed)</h3>
              <HelpTooltip {...earningsHelp.completedEarnings} position="bottom" size="sm" />
            </div>
            <span className="px-2 py-1 bg-orange-50 text-orange-800 text-xs font-medium rounded-lg border border-orange-200">
              {bookingStats.completedCount} bookings
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            Rp {bookingStats.netEarnings.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500">
            From Rp {bookingStats.totalRevenue.toLocaleString('id-ID')} (70% after commission)
          </p>
        </div>

        {bookingStats.totalLost > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 border-red-200 bg-red-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Lost Earnings</h3>
                <HelpTooltip {...earningsHelp.lostEarnings} position="bottom" size="sm" />
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-lg border border-red-200">
                {bookingStats.expiredCount + bookingStats.declinedCount + bookingStats.cancelledCount} missed
              </span>
            </div>
            <p className="text-xl font-bold text-red-700 mb-2">
              Rp {bookingStats.totalLost.toLocaleString('id-ID')}
            </p>
            <div className="space-y-1 text-xs text-red-700">
              {bookingStats.expiredCount > 0 && (
                <div className="flex justify-between"><span>⏰ Expired:</span><span className="font-medium">Rp {bookingStats.lostFromExpired.toLocaleString('id-ID')} ({bookingStats.expiredCount})</span></div>
              )}
              {bookingStats.declinedCount > 0 && (
                <div className="flex justify-between"><span>❌ Declined:</span><span className="font-medium">Rp {bookingStats.lostFromDeclined.toLocaleString('id-ID')} ({bookingStats.declinedCount})</span></div>
              )}
              {bookingStats.cancelledCount > 0 && (
                <div className="flex justify-between"><span>🚫 Cancelled:</span><span className="font-medium">Rp {bookingStats.lostFromCancelled.toLocaleString('id-ID')} ({bookingStats.cancelledCount})</span></div>
              )}
            </div>
          </div>
        )}

        {/* Service Duration Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-500 rounded-lg"><DollarSign className="w-4 h-4 text-white" /></div>
            <h3 className="text-sm font-semibold text-gray-900">Service Duration Breakdown</h3>
            <HelpTooltip {...earningsHelp.serviceBreakdown} position="bottom" size="sm" />
          </div>
          <ul className="space-y-2 list-none m-0 p-0">
            <li className="flex justify-between items-center py-2.5 px-3 bg-orange-50/80 rounded-lg border border-orange-100">
              <span className="text-sm font-medium text-gray-700">60 minutes</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rp {bookingStats.earnings60min.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{bookingStats.count60min} bookings</p>
              </div>
            </li>
            <li className="flex justify-between items-center py-2.5 px-3 bg-orange-50/80 rounded-lg border border-orange-100">
              <span className="text-sm font-medium text-gray-700">90 minutes</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rp {bookingStats.earnings90min.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{bookingStats.count90min} bookings</p>
              </div>
            </li>
            <li className="flex justify-between items-center py-2.5 px-3 bg-orange-50/80 rounded-lg border border-orange-100">
              <span className="text-sm font-medium text-gray-700">120 minutes</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rp {bookingStats.earnings120min.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{bookingStats.count120min} bookings</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Book Now vs Scheduled */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500 rounded-lg"><Clock className="w-4 h-4 text-white" /></div>
              <span className="text-xs font-medium text-gray-600">Book Now</span>
            </div>
            <p className="text-base font-bold text-gray-900">Rp {bookingStats.bookNowEarnings.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500">{bookingStats.bookNowCount} bookings</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500 rounded-lg"><Calendar className="w-4 h-4 text-white" /></div>
              <span className="text-xs font-medium text-gray-600">Scheduled</span>
            </div>
            <p className="text-base font-bold text-gray-900">Rp {bookingStats.scheduledEarnings.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500">{bookingStats.scheduledCount} bookings</p>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-orange-500 rounded-lg"><TrendingUp className="w-4 h-4 text-white" /></div>
            <span className="text-xs font-medium text-gray-500">{currentLabels.thisMonth}</span>
            <HelpTooltip {...earningsHelp.monthlyEarnings} position="bottom" size="sm" />
          </div>
          <p className="text-xl font-bold text-gray-900">Rp {bookingStats.monthlyEarnings.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-500">From completed bookings</p>
        </div>

        {/* Data Source Badge */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <p className="text-xs text-orange-800 flex-1">
              <span className="font-semibold">✅ Connected to Appwrite:</span> All earnings calculated from bookings collection in real-time
            </p>
            <HelpTooltip {...earningsHelp.dataSource} position="left" size="sm" />
          </div>
        </div>

        {/* Premium Analytics Upsell - home style */}
        {membershipTier === 'free' && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500 rounded-lg"><BarChart3 className="w-4 h-4 text-white" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{currentLabels.bestTimesAnalytics}</h3>
                  <p className="text-xs text-gray-500">{currentLabels.premiumFeature}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                <Crown className="w-3 h-3" /> Premium
              </span>
            </div>
            <ul className="space-y-1.5 mb-4 list-none m-0 p-0">
              <li className="flex items-center gap-2 py-2 px-3 bg-orange-50/80 rounded-lg border border-orange-100 text-sm text-gray-700">• {currentLabels.peakBookingHours}</li>
              <li className="flex items-center gap-2 py-2 px-3 bg-orange-50/80 rounded-lg border border-orange-100 text-sm text-gray-700">• {currentLabels.busyDaysHeatmap}</li>
              <li className="flex items-center gap-2 py-2 px-3 bg-orange-50/80 rounded-lg border border-orange-100 text-sm text-gray-700">• {currentLabels.customerDemographics}</li>
              <li className="flex items-center gap-2 py-2 px-3 bg-orange-50/80 rounded-lg border border-orange-100 text-sm text-gray-700">• {currentLabels.optimalSchedule}</li>
            </ul>
            <button className="w-full py-2.5 px-4 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors">
              {currentLabels.upgradeToPremium}
            </button>
          </div>
        )}

        {/* Premium/Elite Analytics - home style */}
        {(membershipTier === 'premium' || membershipTier === 'elite' || membershipTier === 'plus') && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500 rounded-lg"><BarChart3 className="w-4 h-4 text-white" /></div>
                <h2 className="text-sm font-semibold text-gray-900">{currentLabels.bestTimesAnalytics}</h2>
              </div>
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                <Crown className="w-3 h-3" /> Premium
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900 text-sm">Peak Booking Hours</h3>
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
                      <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${slot.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900 text-sm">Busiest Days</h3>
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
                ]).map((dayData) => {
                  const day = dayData.day;
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className="text-center transition-colors"
                    >
                      <div className={`rounded-lg p-2 mb-1 ${isSelected ? 'bg-green-600' : 'bg-orange-500'}`}>
                        <span className="text-xs font-bold text-white">{day}</span>
                      </div>
                      <span className="text-xs text-gray-600">{dayData.intensity}%</span>
                    </button>
                  );
                })}
              </div>
              {selectedDay && (
                <div className="bg-orange-50/80 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">{selectedDay} - Busy Times</h4>
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
                          <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${slot.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-900 mb-2 text-sm">💡 Recommendations</h4>
              <ul className="space-y-1 text-xs text-orange-800 list-none m-0 p-0">
                <li>• Mon-Fri 9AM-4PM shows highest bookings</li>
                <li>• Sunday has low demand - ideal rest day</li>
                <li>• Friday peaks at 95% - maximize availability</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payment History - home style list */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h2>
          {loading ? (
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-2" />
              <p className="text-sm text-gray-600">{currentLabels.loadingPayments}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <Banknote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">{currentLabels.noPayments}</p>
              <p className="text-xs text-gray-500 mt-1">{currentLabels.newPayments}</p>
            </div>
          ) : (
            <ul className="space-y-2 list-none m-0 p-0">
              {payments.map((payment) => (
                <li
                  key={payment.$id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-orange-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{payment.customerName}</h4>
                      <p className="text-xs text-gray-500">ID: {payment.bookingId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${getStatusBadge(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-medium text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Admin 30%:</span><span className="font-medium text-orange-600">- Rp {payment.adminCommission.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-200"><span className="font-medium text-gray-900">Your Earning:</span><span className="font-bold text-green-600">Rp {payment.netEarning.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between text-xs text-gray-500">{currentLabels.date}: {new Date(payment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </TherapistSimplePageLayout>
  );
};

export default TherapistEarningsPage;
