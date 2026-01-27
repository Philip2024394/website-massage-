/**
 * 🏥 THERAPIST SCHEDULED BOOKINGS MANAGER
 * 
 * Enhanced component for managing scheduled bookings with:
 * - Deposit approval workflow
 * - Automatic payout to bank account
 * - 5-hour reminder notifications
 * - No-show reporting
 * - Dashboard integration
 */

import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Calendar, User, MapPin, Phone, CheckCircle, XCircle, AlertTriangle, Bell, CreditCard, Eye } from 'lucide-react';
import { scheduledBookingPaymentService } from '../../../../src/lib/services/scheduledBookingPaymentService';

interface ScheduledBooking {
  $id: string;
  bookingId: string;
  customerName: string;
  serviceType: string;
  duration: number;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  depositStatus: 'pending' | 'paid' | 'approved' | 'rejected';
  payoutStatus: 'pending' | 'processed' | 'completed';
  paymentProofUrl?: string;
  paidAt?: string;
  noShowStatus: 'none' | 'reported' | 'confirmed';
  remindersSent: string[];
}

interface TherapistScheduledBookingsProps {
  therapistId: string;
  therapistName: string;
  language?: 'en' | 'id';
}

const TherapistScheduledBookings: React.FC<TherapistScheduledBookingsProps> = ({
  therapistId,
  therapistName,
  language = 'id'
}) => {
  const [bookings, setBookings] = useState<ScheduledBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ScheduledBooking | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [upcomingNotifications, setUpcomingNotifications] = useState<ScheduledBooking[]>([]);

  useEffect(() => {
    loadScheduledBookings();
    checkUpcomingNotifications();
    
    // Check for upcoming notifications every 5 minutes
    const interval = setInterval(checkUpcomingNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [therapistId]);

  const loadScheduledBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await scheduledBookingPaymentService.getScheduledBookingsForDashboard(
        therapistId
      );
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to load scheduled bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingNotifications = async () => {
    try {
      const upcoming = await scheduledBookingPaymentService.getUpcomingBookingsForReminders();
      setUpcomingNotifications(upcoming.filter(b => b.therapistId === therapistId));
    } catch (error) {
      console.error('Failed to check upcoming notifications:', error);
    }
  };

  const handleApproveDeposit = async (booking: ScheduledBooking) => {
    try {
      setProcessingApproval(booking.$id);
      
      await scheduledBookingPaymentService.approveDepositAndPayout(
        booking.$id,
        therapistId
      );
      
      // Reload bookings
      await loadScheduledBookings();
      
      alert(language === 'en' 
        ? `Deposit approved! ${formatPrice(booking.depositAmount)} has been sent to your bank account.`
        : `Deposit disetujui! ${formatPrice(booking.depositAmount)} telah dikirim ke rekening bank Anda.`
      );
    } catch (error) {
      console.error('Failed to approve deposit:', error);
      alert(language === 'en' 
        ? 'Failed to approve deposit. Please try again.'
        : 'Gagal menyetujui deposit. Silakan coba lagi.'
      );
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleReportNoShow = async (booking: ScheduledBooking) => {
    const confirmed = confirm(
      language === 'en'
        ? `Report ${booking.customerName} as no-show? This will forfeit their deposit.`
        : `Laporkan ${booking.customerName} tidak datang? Ini akan menghanguskan deposit mereka.`
    );
    
    if (!confirmed) return;

    try {
      await scheduledBookingPaymentService.reportNoShow(
        booking.$id,
        'therapist',
        'Customer did not show up for scheduled appointment'
      );
      
      await loadScheduledBookings();
      
      alert(language === 'en'
        ? 'No-show reported. Customer deposit has been forfeited.'
        : 'Tidak datang dilaporkan. Deposit pelanggan telah hangus.'
      );
    } catch (error) {
      console.error('Failed to report no-show:', error);
      alert(language === 'en'
        ? 'Failed to report no-show. Please try again.'
        : 'Gagal melaporkan tidak datang. Silakan coba lagi.'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-blue-100 text-blue-800 border-blue-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isUpcomingSoon = (booking: ScheduledBooking) => {
    const bookingTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
    const hoursUntil = (bookingTime.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil <= 5 && hoursUntil > 0;
  };

  const formatPrice = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

  const labels = {
    en: {
      title: 'Scheduled Bookings',
      subtitle: 'Manage your scheduled appointments and deposits',
      upcomingReminders: 'Upcoming Reminders',
      noBookings: 'No scheduled bookings',
      noBookingsDesc: 'Scheduled bookings with deposits will appear here',
      approveDeposit: 'Approve Deposit',
      rejectDeposit: 'Reject Deposit',
      reportNoShow: 'Report No-Show',
      viewProof: 'View Payment Proof',
      depositApproved: 'Deposit Approved',
      payoutSent: 'Payout Sent',
      customer: 'Customer',
      service: 'Service',
      scheduled: 'Scheduled',
      location: 'Location',
      deposit: 'Deposit',
      remaining: 'Remaining',
      status: 'Status'
    },
    id: {
      title: 'Booking Terjadwal',
      subtitle: 'Kelola janji temu terjadwal dan deposit Anda',
      upcomingReminders: 'Pengingat Mendatang',
      noBookings: 'Tidak ada booking terjadwal',
      noBookingsDesc: 'Booking terjadwal dengan deposit akan muncul di sini',
      approveDeposit: 'Setujui Deposit',
      rejectDeposit: 'Tolak Deposit',
      reportNoShow: 'Laporkan Tidak Datang',
      viewProof: 'Lihat Bukti Pembayaran',
      depositApproved: 'Deposit Disetujui',
      payoutSent: 'Pembayaran Dikirim',
      customer: 'Pelanggan',
      service: 'Layanan',
      scheduled: 'Dijadwalkan',
      location: 'Lokasi',
      deposit: 'Deposit',
      remaining: 'Sisa',
      status: 'Status'
    }
  };

  const currentLabels = labels[language];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading scheduled bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{currentLabels.title}</h2>
        <p className="text-blue-100">{currentLabels.subtitle}</p>
      </div>

      {/* Upcoming Reminders */}
      {upcomingNotifications.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">
              {currentLabels.upcomingReminders}
            </h3>
          </div>
          <div className="space-y-3">
            {upcomingNotifications.map((booking) => (
              <div key={booking.$id} className="bg-white rounded-lg p-4 border border-yellow-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-600">
                      {booking.scheduledDate} at {booking.scheduledTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-700">In 5 hours</p>
                    <p className="text-xs text-gray-500">Reminder will be sent</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentLabels.noBookings}
          </h3>
          <p className="text-gray-600">{currentLabels.noBookingsDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.$id}
              className={`bg-white rounded-xl border-2 p-6 transition-all ${
                isUpcomingSoon(booking)
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.customerName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        booking.depositStatus
                      )}`}
                    >
                      {getStatusIcon(booking.depositStatus)}
                      <span className="ml-1">{booking.depositStatus.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
                
                {/* Upcoming indicator */}
                {isUpcomingSoon(booking) && (
                  <div className="bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>In 5 hours</span>
                  </div>
                )}
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{currentLabels.service}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {booking.serviceType} ({booking.duration} min)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{currentLabels.scheduled}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {booking.scheduledDate} at {booking.scheduledTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{currentLabels.location}:</span>
                    <span className="text-sm font-medium text-gray-900">{booking.location}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">{currentLabels.deposit} (30%):</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatPrice(booking.depositAmount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{currentLabels.remaining}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(booking.remainingAmount)}
                    </span>
                  </div>
                  
                  {booking.paidAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Paid:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(booking.paidAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {booking.depositStatus === 'paid' && (
                  <>
                    <button
                      onClick={() => handleApproveDeposit(booking)}
                      disabled={processingApproval === booking.$id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingApproval === booking.$id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {currentLabels.approveDeposit}
                    </button>
                    
                    {booking.paymentProofUrl && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowPaymentProof(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {currentLabels.viewProof}
                      </button>
                    )}
                  </>
                )}
                
                {booking.depositStatus === 'approved' && 
                 new Date(`${booking.scheduledDate}T${booking.scheduledTime}`) < new Date() &&
                 booking.noShowStatus === 'none' && (
                  <button
                    onClick={() => handleReportNoShow(booking)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {currentLabels.reportNoShow}
                  </button>
                )}
              </div>

              {/* Status Messages */}
              {booking.depositStatus === 'approved' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ {currentLabels.depositApproved} - {currentLabels.payoutSent} {formatPrice(booking.depositAmount)}
                  </p>
                </div>
              )}
              
              {booking.noShowStatus === 'confirmed' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ❌ Customer no-show - Deposit forfeited
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Proof Modal */}
      {showPaymentProof && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Payment Proof</h2>
              <button
                onClick={() => setShowPaymentProof(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedBooking.paymentProofUrl}
                alt="Payment proof"
                className="w-full rounded-lg shadow-lg"
              />
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {selectedBooking.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> {formatPrice(selectedBooking.depositAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Paid at:</strong> {selectedBooking.paidAt ? new Date(selectedBooking.paidAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistScheduledBookings;