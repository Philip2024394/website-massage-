// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Banknote, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Crown, BarChart3 } from 'lucide-react';
import TherapistLayout from '../components/TherapistLayout';
import { analyticsService } from '../../../../src/lib/services/analyticsService';

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
      thisMonth: 'Bulan ini',
      processed: 'Pembayaran diproses',
      awaitingPayout: 'Menunggu pembayaran',
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
      // Attempt to load analytics data with better error handling
      const { analyticsService } = await import('../../../../src/lib/services/analyticsService');
      
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
    setLoading(true);
    try {
      // Import paymentService
      const { paymentService } = await import('../../../../src/lib/appwriteService');
      
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
    } finally {
      setLoading(false);
    }
  };

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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{currentLabels.title}</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}h</span>
            <span className="text-xs text-gray-500">{currentLabels.thisMonth}</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">{currentLabels.pending}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              Rp {stats.totalDue.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">{currentLabels.paid}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              Rp {stats.totalPaid.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">Admin Fee</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              Rp {stats.adminDue.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-400 mt-1">30% commission</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">{currentLabels.thisMonth}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              Rp {stats.monthlyEarnings.toLocaleString('id-ID')}
            </p>
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
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Peak Booking Hours</h3>
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
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Busiest Days</h3>
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
