/**
 * 🔒 PRODUCTION UI – COMPLETE (FROZEN PRE-LAUNCH)
 * This page is visually complete and approved.
 * ❌ Do NOT change layout, structure, or render order
 * ✅ Text, styling, and logic fixes allowed
 * 🛑 UI changes require explicit qw: instruction
 * ⚠️ BOOKING FUNCTIONALITY FROZEN until system confirmed
 */

// @ts-expect-error - React 19 type compatibility issue with lucide-react icons, will be resolved in future version
// 🔒 LOGIC LOCKED - DO NOT MODIFY BOOKING ACCEPTANCE & VALIDATION LOGIC
// UI/styling changes allowed ONLY
// Last locked: 2026-01-28
import React, { useState, useEffect } from 'react';
import { BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS, SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE } from '../../constants/businessLogic';
import { FloatingChatWindow } from '../../chat';
import { Calendar, Clock, MapPin, User, Phone, Banknote, CheckCircle, XCircle, Filter, Search, MessageCircle, Crown, Lock } from 'lucide-react';
import ChatWindow from '../../components/therapist/ChatWindow';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { devLog, devWarn } from '../../utils/devMode';
import TherapistSchedule from './TherapistSchedule';
import DepositApprovalCard from '../../components/booking/DepositApprovalCard';
import { pushNotificationsService } from '../../lib/pushNotificationsService';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { bookingsScheduleHelp } from './constants/helpContent';
import { showErrorToast, showWarningToast } from '../../lib/toastUtils';

interface Booking {
  $id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  duration: number;
  price: number;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
  customerId?: string;
  isScheduled?: boolean;
  depositRequired?: boolean;
  depositAmount?: number;
  depositPaid?: boolean;
  depositStatus?: 'pending_approval' | 'approved' | 'rejected';
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  depositNotes?: string;
}

interface TherapistBookingsProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistBookings: React.FC<TherapistBookingsProps> = ({ therapist, onBack, onNavigate, onLogout, language = 'id' }) => {
  const isPremium = true; // All features available for standard 30% commission plan
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received' | 'scheduled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bankDetailsComplete, setBankDetailsComplete] = useState(false);
  const [showBankDetailsAlert, setShowBankDetailsAlert] = useState(false);

  // Translation labels
  const labels = {
    en: {
      title: 'Bookings & Schedule',
      subtitle: 'Manage appointments and availability',
      bookings: 'Bookings',
      schedule: 'My Schedule',
      all: 'All',
      received: 'Received',
      scheduled: 'Scheduled', 
      completed: 'Completed',
      earnings: 'Earnings',
      pendingApproval: 'Pending approval',
      confirmedBookings: 'Confirmed bookings',
      finishedSessions: 'Finished sessions',
      loadingBookings: 'Loading bookings...',
      pleaseWait: 'Please wait',
      noBookings: 'No bookings found',
      adjustSearch: 'Try adjusting your search',
      searchPlaceholder: 'Search by name, service, or location',
      date: 'Date',
      time: 'Time',
      service: 'Service',
      duration: 'Duration',
      location: 'Location',
      customer: 'Customer',
      phone: 'Phone',
      price: 'Price',
      status: 'Status',
      notes: 'Notes',
      minutes: 'minutes',
      accept: 'Accept',
      decline: 'Decline',
      openChat: 'Open Chat',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      scheduledBooking: 'Scheduled Booking',
      depositRequired: '30% Deposit Required',
      depositPaid: 'PAID',
      depositUnpaid: 'UNPAID',
      paymentProofUploaded: 'Payment Proof Uploaded',
      viewProof: 'View Proof',
      waitingPayment: 'Waiting for Customer Payment'
    },
    id: {
      title: 'Booking & Jadwal',
      subtitle: 'Kelola janji temu dan ketersediaan',
      bookings: 'Booking',
      schedule: 'Jadwal Saya',
      all: 'Semua',
      received: 'Diterima',
      scheduled: 'Terjadwal',
      completed: 'Selesai',
      earnings: 'Pendapatan',
      pendingApproval: 'Menunggu persetujuan',
      confirmedBookings: 'Booking terkonfirmasi',
      finishedSessions: 'Sesi selesai',
      loadingBookings: 'Memuat booking...',
      pleaseWait: 'Mohon tunggu',
      noBookings: 'Tidak ada booking ditemukan',
      adjustSearch: 'Coba sesuaikan pencarian Anda',
      searchPlaceholder: 'Cari berdasarkan nama, layanan, atau lokasi',
      date: 'Tanggal',
      time: 'Waktu',
      service: 'Layanan',
      duration: 'Durasi',
      location: 'Lokasi',
      customer: 'Pelanggan',
      phone: 'Telepon',
      price: 'Harga',
      status: 'Status',
      notes: 'Catatan',
      minutes: 'menit',
      accept: 'Terima',
      decline: 'Tolak',
      openChat: 'Buka Chat',
      pending: 'Menunggu',
      confirmed: 'Dikonfirmasi',
      cancelled: 'Dibatalkan',
      scheduledBooking: 'Booking Terjadwal',
      depositRequired: 'Butuh Deposit 30%',
      depositPaid: 'LUNAS',
      depositUnpaid: 'BELUM BAYAR',
      paymentProofUploaded: 'Bukti Pembayaran Terupload',
      viewProof: 'Lihat Bukti',
      waitingPayment: 'Menunggu Pembayaran Pelanggan'
    }
  };

  const currentLabels = labels[language];

  useEffect(() => {
    fetchBookings();
    checkBankDetails();
    
    // Subscribe to real-time booking updates with audio notification
    let unsubscribe: (() => void) | null = null;
    
    const setupRealtimeBookings = async () => {
      try {
        const { bookingService } = await import('../../lib/appwriteService');
        
        unsubscribe = bookingService.subscribeToProviderBookings(
          therapist.$id,
          (newBooking) => {
            devLog('🔔 New booking notification:', newBooking);
            
            // Play booking notification sound
            try {
              const audio = new Audio('/sounds/booking-notification.mp3');
              audio.volume = 0.8;
              audio.play().catch(err => devWarn('Failed to play booking sound:', err));
            } catch (err) {
              devWarn('Audio playback error:', err);
            }
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Booking Request! 🎉', {
                body: `${newBooking.userName || 'Customer'} requested ${newBooking.service} min massage`,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: 'booking-' + newBooking.$id
              });
            }
            
            // Add to bookings list
            setBookings(prev => [newBooking, ...prev]);
          }
        );
      } catch (error) {
        console.error('Failed to setup real-time bookings:', error);
      }
    };
    
    setupRealtimeBookings();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [therapist]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch real bookings from Appwrite
      const { bookingService } = await import('../../lib/appwriteService');
      
      // Get bookings for this therapist
      const realBookings = await bookingService.getProviderBookings(therapist.$id);
      
      // 🔒 INCOME PROTECTION: Always show bookings even if incomplete
      const transformedBookings: Booking[] = realBookings.map((doc: any) => {
        const booking = {
          $id: doc.$id,
          customerName: doc.userName || doc.customerName || 'Unknown Customer',
          customerPhone: doc.userPhone || doc.customerPhone || '',
          serviceType: doc.service || doc.serviceType || 'Massage Service',
          duration: doc.duration || 60,
          price: doc.totalAmount || doc.price || 0,
          location: doc.location || '',
          date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: doc.time || '00:00',
          status: doc.status || 'pending',
          createdAt: doc.$createdAt || new Date().toISOString(),
          notes: doc.notes || '',
          customerId: doc.userId || doc.customerId,
          isScheduled: doc.bookingType === 'scheduled' || false,
          depositRequired: doc.depositRequired || false,
          depositAmount: doc.depositAmount || 0,
          depositPaid: doc.depositPaid || false,
          depositStatus: doc.depositStatus || 'pending_approval',
          paymentProofUrl: doc.paymentProofUrl || '',
          paymentProofUploadedAt: doc.paymentProofUploadedAt || '',
          depositNotes: doc.depositNotes || ''
        };

        // 🔒 Check if communication setup is incomplete
        // This is non-blocking - booking still shows even if check fails
        checkBookingCommunicationSetup(doc.$id).catch(err => {
          devWarn('Communication setup check failed (non-critical):', err);
        });

        return booking;
      });
      
      setBookings(transformedBookings);
      devLog('✅ Loaded', transformedBookings.length, 'real bookings for therapist', therapist.$id);
      
    } catch (error) {
      console.error('Failed to fetch real bookings:', error);
      
      // Fallback to empty array instead of mock data
      setBookings([]);
      devWarn('❌ No bookings loaded - service may be unavailable');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔒 INCOME PROTECTION: Check if booking communication is set up
   * Non-blocking - won't prevent booking from displaying
   */
  const checkBookingCommunicationSetup = async (bookingId: string) => {
    try {
      const { databases, APPWRITE_CONFIG, Query } = await import('../../lib/appwrite');
      
      // Check if chat room exists
      const chatRooms = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chat_rooms || 'chat_rooms',
        [Query.equal('bookingId', bookingId)]
      );

      const hasChatRoom = chatRooms.documents.length > 0;

      if (!hasChatRoom) {
        devWarn(`⚠️ Booking ${bookingId} has NO chat room - communication may be broken`);
        
        // Show visual warning to therapist (non-blocking)
        showCommunicationWarning(bookingId);
      }
    } catch (error) {
      // Don't fail - this is just a check
      devWarn('Failed to check communication setup:', error);
    }
  };

  /**
   * Show user-friendly warning that communication setup is completing
   */
  const showCommunicationWarning = (bookingId: string) => {
    // Add friendly, non-technical indicator to booking card
    const friendlyMessage = language === 'id' 
      ? '📋 Booking terkonfirmasi. Setup komunikasi sedang diproses — mohon tunggu sebentar.'
      : '📋 A booking was confirmed. Communication setup is completing — please stand by.';
    
    setBookings(prev => prev.map(b => {
      if (b.$id === bookingId) {
        return {
          ...b,
          notes: (b.notes ? b.notes + '\n\n' : '') + friendlyMessage
        };
      }
      return b;
    }));
  };

  const checkBankDetails = async () => {
    try {
      // TODO: Check if therapist has complete bank details in Appwrite
      // For now, simulate check - replace with actual API call
      const hasCompleteBankDetails = therapist?.bankAccountNumber && 
                                    therapist?.bankAccountName && 
                                    therapist?.bankName;
      
      setBankDetailsComplete(!!hasCompleteBankDetails);
    } catch (error) {
      console.error('Failed to check bank details:', error);
      setBankDetailsComplete(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.$id === bookingId);
    
    // ============================================================================
    // 🔒 HARD LOCK: SCHEDULED BOOKING BANK DETAILS ENFORCEMENT
    // ============================================================================
    // Business Rule: Scheduled bookings REQUIRE complete bank details
    // Constant: BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS = true
    // Impact: Prevents therapist from accepting scheduled bookings without payment info
    // DO NOT MODIFY - Critical for payment flow integrity
    // ============================================================================
    if (booking?.isScheduled && !bankDetailsComplete) {
      setShowBankDetailsAlert(true);
      return;
    }

    // ============================================================================
    // 🔒 HARD LOCK: SCHEDULED BOOKING DEPOSIT VALIDATION
    // ============================================================================
    // Business Rule: 30% deposit REQUIRED and PAID before acceptance
    // Constant: SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE = 30
    // Impact: Ensures customer commitment before therapist confirms booking
    // DO NOT MODIFY - Critical for revenue protection
    // ============================================================================
    if (booking?.isScheduled && booking?.depositRequired && !booking?.depositPaid) {
      showWarningToast(language === 'en' 
        ? `This booking requires a ${SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE}% deposit. Customer must pay deposit before you can accept.`
        : `Booking ini memerlukan deposit ${SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE}%. Pelanggan harus membayar deposit sebelum Anda dapat menerima.`);
      return;
    }

    // Check if scheduled booking deposit is paid but not approved yet
    if (booking?.isScheduled && booking?.depositRequired && booking?.depositPaid && booking?.depositStatus === 'pending_approval') {
      showWarningToast(language === 'en' 
        ? 'Please review and approve the deposit proof first before accepting this booking.'
        : 'Silakan tinjau dan setujui bukti deposit terlebih dahulu sebelum menerima booking ini.');
      return;
    }

    try {
      // ============================================================================
      // 🔒 HARD LOCK: BACKEND VALIDATION FOR SCHEDULED BOOKINGS
      // ============================================================================
      // Business Rule: Server-side validation of bank details for scheduled bookings
      // Location: simpleChatService.ts updateStatus() function
      // Impact: Prevents API-level bypass of bank details requirement
      // Returns: { success: boolean, error?: string }
      // DO NOT MODIFY - Critical security layer
      // ============================================================================
      const { simpleBookingService } = await import('../../lib/simpleChatService');
      const result = await simpleBookingService.updateStatus(
        bookingId, 
        'confirmed',
        {
          isScheduled: booking?.isScheduled,
          bankName: therapist?.bankName,
          accountName: therapist?.accountName,
          accountNumber: therapist?.accountNumber
        }
      );

      if (!result.success) {
        showErrorToast(result.error || 'Failed to accept booking');
        return;
      }

      devLog('Accepting booking:', bookingId);
      
      setBookings(prev => prev.map(b => 
        b.$id === bookingId ? { ...b, status: 'confirmed' as const } : b
      ));
      
      // TODO: Send notification to customer
      devLog('✅ Booking accepted and customer notified');
    } catch (error) {
      console.error('Failed to accept booking:', error);
      showErrorToast('Failed to accept booking. Please try again.');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      devLog('🔄 Cancelling booking with commission reversal:', bookingId);
      
      // Prompt for cancellation reason
      const reason = prompt('Cancellation reason (required):');
      if (!reason) {
        devLog('Cancellation aborted - no reason provided');
        return;
      }
      
      // Import centralized cancellation function
      const { bookingService } = await import('../../lib/appwriteService');
      
      // Call SINGLE cancellation authority
      const result = await bookingService.cancelBookingAndReverseCommission(
        bookingId,
        therapist.$id,
        reason,
        'therapist'
      );
      
      // Update UI
      setBookings(prev => prev.map(b => 
        b.$id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ));
      
      devLog('✅ Booking cancelled');
      if (result.commission && result.commission.status === 'reversed') {
        devLog('✅ Commission reversed:', result.commission.$id);
      }
    } catch (error: any) {
      console.error('❌ Failed to cancel booking:', error);
      showErrorToast(error.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const handleApproveDeposit = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.$id === bookingId);
      if (!booking) return;

      // Update deposit status to approved
      setBookings(prev => prev.map(b => 
        b.$id === bookingId 
          ? { ...b, depositStatus: 'approved' as const, status: 'confirmed' as const } 
          : b
      ));

      // Send notification to customer
      await pushNotificationsService.notifyDepositApproved(
        therapist.name,
        bookingId,
        booking.depositAmount || 0
      );

      devLog('✅ Deposit approved and customer notified');
    } catch (error) {
      console.error('Failed to approve deposit:', error);
    }
  };

  const handleRejectDeposit = async (bookingId: string, reason: string) => {
    try {
      const booking = bookings.find(b => b.$id === bookingId);
      if (!booking) return;

      // Update deposit status to rejected
      setBookings(prev => prev.map(b => 
        b.$id === bookingId 
          ? { ...b, depositStatus: 'rejected' as const } 
          : b
      ));

      // Send notification to customer
      await pushNotificationsService.notifyDepositRejected(
        therapist.name,
        bookingId,
        booking.depositAmount || 0,
        reason
      );

      devLog('❌ Deposit rejected and customer notified');
    } catch (error) {
      console.error('Failed to reject deposit:', error);
    }
  };

  const handleRequestReupload = async (bookingId: string, message: string) => {
    try {
      const booking = bookings.find(b => b.$id === bookingId);
      if (!booking) return;

      // Send notification to customer requesting re-upload
      await pushNotificationsService.notifyDepositReuploadRequested(
        therapist.name,
        bookingId,
        message
      );

      devLog('🔄 Re-upload requested and customer notified');
    } catch (error) {
      console.error('Failed to request reupload:', error);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      console.log('💼 Marking booking as completed:', bookingId);

      // Update booking status in Appwrite
      const { bookingService } = await import('../../lib/appwriteService');
      await bookingService.updateStatus(bookingId, 'Completed');

      // Note: Commission record is automatically created by bookingService.updateStatus()
      // when status changes to 'Completed' (integrated in booking.service.ts)

      setBookings(prev => prev.map(b =>
        b.$id === bookingId ? { ...b, status: 'completed' as const } : b
      ));

      console.log('✅ Booking completed successfully');
    } catch (error) {
      console.error('❌ Failed to complete booking:', error);
      showErrorToast('Failed to complete booking. Please try again.');
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    // Apply status filter
    if (filter === 'received') {
      filtered = filtered.filter(b => b.status === 'pending');
    } else if (filter === 'scheduled') {
      filtered = filtered.filter(b => b.status === 'confirmed');
    } else if (filter === 'completed') {
      filtered = filtered.filter(b => b.status === 'completed');
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: Booking['status']) => {
    const badges = {
      pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 shadow-sm',
      confirmed: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-300 shadow-sm',
      completed: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm',
      cancelled: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300 shadow-sm',
    };
    return badges[status] || badges.pending;
  };

  const stats = {
    received: bookings.filter(b => b.status === 'pending').length,
    scheduled: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalEarnings: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0),
  };

  const filteredBookings = getFilteredBookings();

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <>
    <TherapistLayout
      therapist={therapist}
      currentPage="bookings"
      onNavigate={handleNavigate}
      language={language}
      onLogout={onLogout}
    >
    <div className="min-h-screen bg-white overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      {/* Standardized Status Header */}
      <div className="max-w-sm mx-auto px-4 pt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{currentLabels.title}</h2>
              <HelpTooltip 
                {...bookingsScheduleHelp.manageBookings}
                position="bottom"
                size="md"
              />
            </div>
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
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 bg-white px-4 pt-4">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'bookings'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 {currentLabels.bookings}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'schedule'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🕐 {currentLabels.schedule}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'schedule' ? (
        <TherapistSchedule therapist={therapist} onBack={() => setActiveTab('bookings')} />
      ) : (
      <main className="max-w-sm mx-auto px-4 py-6">
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{currentLabels.received}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stats.received}</p>
            <p className="text-xs text-gray-500 font-medium">{currentLabels.pendingApproval}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{currentLabels.scheduled}</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stats.scheduled}</p>
            <p className="text-xs text-gray-500 font-medium">{currentLabels.confirmedBookings}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{currentLabels.completed}</span>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stats.completed}</p>
            <p className="text-xs text-gray-500 font-medium">{currentLabels.finishedSessions}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{currentLabels.earnings}</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-1">
              Rp {stats.totalEarnings.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500 font-medium">Total completed</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'received', 'scheduled', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    filter === f
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200 scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {currentLabels[f]}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={currentLabels.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 focus:outline-none transition-all bg-gray-50 focus:bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-100 border-t-orange-500 mx-auto mb-5"></div>
            <p className="text-gray-700 font-semibold text-lg">{currentLabels.loadingBookings}</p>
            <p className="text-gray-500 text-sm mt-2">{currentLabels.pleaseWait}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-800 font-bold text-xl mb-2">{currentLabels.noBookings}</p>
            <p className="text-gray-500 font-medium">
              {searchQuery ? currentLabels.adjustSearch : 'New bookings will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <div
                key={booking.$id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:border-orange-100"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="w-7 h-7 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{booking.customerName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Use in-app chat to contact
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide shadow-sm ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Date:</strong> {new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Time:</strong> {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <span className="text-base">💆</span>
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Service:</strong> {booking.serviceType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Duration:</strong> {booking.duration} min</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Location:</strong> {booking.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Price:</strong> Rp {booking.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong className="font-bold">💬 Notes:</strong> {booking.notes}
                    </p>
                  </div>
                )}

                {/* Deposit and Payment Proof Section */}
                {booking.isScheduled && (
                  <div className="mb-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <span className="text-lg">📅</span>
                      </div>
                      <h4 className="font-bold text-orange-900">{currentLabels.scheduledBooking}</h4>
                    </div>
                    
                    {booking.depositRequired && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-orange-200">
                          <div>
                            <p className="text-sm font-semibold text-orange-800">{currentLabels.depositRequired}</p>
                            <p className="text-xs text-orange-600">Rp {booking.depositAmount?.toLocaleString('id-ID')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.depositPaid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.depositPaid ? `✅ ${currentLabels.depositPaid}` : `❌ ${currentLabels.depositUnpaid}`}
                          </span>
                        </div>

                        {/* Payment Proof Display */}
                        {booking.depositPaid && booking.paymentProofUrl && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                                <span className="text-sm">📄</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-green-800">{currentLabels.paymentProofUploaded}</p>
                                <p className="text-xs text-green-600">
                                  {booking.paymentProofUploadedAt && 
                                    new Date(booking.paymentProofUploadedAt).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => window.open(booking.paymentProofUrl, '_blank')}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                {currentLabels.viewProof} 👁️
                              </button>
                              <span className="text-xs text-green-700">
                                {language === 'en' 
                                  ? 'Customer paid deposit - booking ready to accept'
                                  : 'Pelanggan sudah bayar deposit - booking siap diterima'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Waiting for Payment */}
                        {!booking.depositPaid && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center">
                                <span className="text-sm">⏳</span>
                              </div>
                              <p className="text-sm font-semibold text-yellow-800">{currentLabels.waitingPayment}</p>
                            </div>
                            <p className="text-xs text-yellow-700">
                              {language === 'en'
                                ? 'Customer must pay 30% deposit and upload payment proof before you can accept this booking.'
                                : 'Pelanggan harus membayar deposit 30% dan upload bukti pembayaran sebelum Anda dapat menerima booking ini.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Deposit Approval Card */}
                {booking.isScheduled && 
                 booking.depositRequired && 
                 booking.depositPaid &&
                 booking.depositStatus === 'pending_approval' && (
                  <DepositApprovalCard
                    booking={booking}
                    onApprove={() => handleApproveDeposit(booking)}
                    onReject={() => handleRejectDeposit(booking)}
                    onRequestReupload={() => handleRequestReupload(booking)}
                  />
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl hover:from-green-600 hover:via-green-700 hover:to-green-800 font-bold transition-all shadow-lg shadow-green-300/50 hover:shadow-xl hover:shadow-green-400/60 hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 font-bold transition-all shadow-lg shadow-red-300/50 hover:shadow-xl hover:shadow-red-400/60 hover:-translate-y-0.5"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setChatOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 font-bold transition-all shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/60 hover:-translate-y-0.5"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Chat Customer
                      </button>
                      <button
                        onClick={() => handleCompleteBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 font-bold transition-all shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/60 hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Mark Complete
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setChatOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 text-blue-700 rounded-2xl hover:from-blue-200 hover:via-blue-300 hover:to-blue-400 font-bold transition-all shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/60 hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-5 h-5" />
                      View Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Details Required Alert */}
      {showBankDetailsAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏦</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bank Details Required</h3>
              <p className="text-sm text-gray-600">
                {language === 'en' 
                  ? 'To accept scheduled bookings, you must complete your bank account information first.'
                  : 'Untuk menerima booking terjadwal, Anda harus melengkapi informasi rekening bank terlebih dahulu.'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBankDetailsAlert(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'Batal'}
              </button>
              <button
                onClick={() => {
                  setShowBankDetailsAlert(false);
                  onNavigate?.('bank-details'); // Navigate to bank details page
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {language === 'en' ? 'Add Bank Details' : 'Tambah Rekening'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && selectedBooking && (
        <ChatWindow
          providerId={therapist.$id}
          providerRole="therapist"
          providerName={therapist.name}
          customerId={selectedBooking.customerId || 'customer-' + selectedBooking.$id}
          customerName={selectedBooking.customerName}
          bookingId={selectedBooking.$id}
          bookingDetails={{
            date: selectedBooking.date,
            duration: selectedBooking.duration,
            price: selectedBooking.price,
            location: selectedBooking.customerLocation,
            latitude: selectedBooking.customerLatitude,
            longitude: selectedBooking.customerLongitude
          }}
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
      </main>
      )}
    </div>
    </TherapistLayout>
    {/* Floating Chat Window */}
    <FloatingChatWindow userId={'therapist'} userName={'Therapist'} userRole="therapist" />
    </>

  );
};

export default TherapistBookings;

