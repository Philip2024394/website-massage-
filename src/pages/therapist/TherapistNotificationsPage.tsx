// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { 
  Bell, Calendar, MessageCircle, AlertCircle, CheckCircle, Clock, X, ExternalLink, 
  TrendingUp, User, DollarSign, Eye, Star, Settings, Zap, Target, BarChart3,
  CreditCard, Heart, Shield, Award, Flame, Activity, Users, MapPin, Camera,
  Edit3, Globe, Phone, Mail, FileText, Image, Sparkles, Timer, Home, Briefcase
} from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import ChatWindow from '../../components/therapist/ChatWindow';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { notificationsHelp } from './constants/helpContent';
import { databases, Query } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';

interface Notification {
  $id: string;
  type: 'booking' | 'message' | 'system' | 'payment' | 'reminder' | 'overdue_payment' | 'missed_booking' | 'account_health' | 'traffic' | 'profile_incomplete' | 'online_time';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  relatedId?: string;
  amount?: number;
  daysOverdue?: number;
  trafficIncrease?: number;
  profileCompleteness?: number;
  onlineHoursNeeded?: number;
  bookingsMissed?: number;
}

interface AccountHealth {
  score: number;
  profileCompleteness: number;
  responseRate: number;
  averageRating: number;
  monthlyBookings: number;
  onlineHoursThisMonth: number;
  overduePayments: number;
  missedBookings: number;
  trafficViews: number;
  trafficIncrease: number;
}

interface TherapistNotificationsProps {
  therapist: any;
  onBack: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToChat?: () => void;
}

const TherapistNotificationsPage: React.FC<TherapistNotificationsProps> = ({ 
  therapist, 
  onBack,
  onNavigateToBookings,
  onNavigateToChat
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'message' | 'system' | 'critical'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get therapist ID (Appwrite uses $id)
  const therapistId = therapist?.$id || therapist?.id;
  
  // Real data from therapist profile - no fake hardcoded values
  const [accountHealth, setAccountHealth] = useState<AccountHealth>({
    score: 0,
    profileCompleteness: 0,
    responseRate: 0,
    averageRating: 0,
    monthlyBookings: 0,
    onlineHoursThisMonth: 0,
    overduePayments: 0,
    missedBookings: 0,
    trafficViews: 0,
    trafficIncrease: 0
  });
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    customerId: string;
    customerName: string;
    bookingId?: string;
  } | null>(null);

  // Load real account health data from Appwrite
  useEffect(() => {
    const loadAccountHealth = async () => {
      if (!therapistId) return;
      
      try {
        // Calculate profile completeness from therapist data
        let completeness = 0;
        if (therapist?.name) completeness += 15;
        if (therapist?.profilePicture) completeness += 20;
        if (therapist?.description && therapist.description.length > 50) completeness += 15;
        if (therapist?.whatsapp) completeness += 15;
        if (therapist?.massageTypes && therapist.massageTypes.length > 0) completeness += 15;
        if (therapist?.price) completeness += 10;
        if (therapist?.locationId || therapist?.city) completeness += 10;
        
        // Fetch pending bookings (not yet accepted/rejected)
        let pendingBookings = 0;
        try {
          const pendingResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings,
            [
              Query.equal('therapistId', therapistId),
              Query.equal('status', 'pending'),
              Query.limit(100)
            ]
          );
          pendingBookings = pendingResponse.total;
        } catch (e) {
          console.log('Could not fetch pending bookings');
        }
        
        // Fetch monthly bookings
        let monthlyBookings = 0;
        try {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          const bookingsResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings,
            [
              Query.equal('therapistId', therapistId),
              Query.greaterThanEqual('$createdAt', startOfMonth.toISOString()),
              Query.limit(1000)
            ]
          );
          monthlyBookings = bookingsResponse.total;
        } catch (e) {
          console.log('Could not fetch monthly bookings');
        }
        
        // Use real data from therapist profile
        setAccountHealth({
          score: Math.min(100, completeness + (therapist?.rating ? 10 : 0)),
          profileCompleteness: completeness,
          responseRate: therapist?.responseRate || 0,
          averageRating: therapist?.rating || 0,
          monthlyBookings: monthlyBookings,
          onlineHoursThisMonth: therapist?.onlineHoursThisMonth || 0,
          overduePayments: therapist?.overduePayments || 0,
          missedBookings: pendingBookings, // Pending bookings need attention
          trafficViews: therapist?.profileViews || 0,
          trafficIncrease: therapist?.trafficIncrease || 0
        });
      } catch (error) {
        console.error('Failed to load account health:', error);
      }
    };
    
    loadAccountHealth();
  }, [therapistId, therapist]);

  // Generate comprehensive notifications including all critical business areas
  useEffect(() => {
    const generateComprehensiveNotifications = (): Notification[] => {
      const now = new Date();
      const notifications: Notification[] = [];
      
      // Critical: Overdue Payments to Admin
      if (accountHealth.overduePayments > 0) {
        notifications.push({
          $id: 'overdue-payment-1',
          type: 'overdue_payment',
          title: '🚨 Pembayaran Komisi Terlambat',
          message: `Anda memiliki ${accountHealth.overduePayments} pembayaran komisi yang terlambat ${accountHealth.overduePayments * 7} hari. Segera lakukan pembayaran untuk menghindari penangguhan akun.`,
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'critical',
          actionUrl: '/payment',
          actionLabel: 'Bayar Sekarang',
          amount: 450000,
          daysOverdue: accountHealth.overduePayments * 7
        });
      }
      
      // Critical: Missed Accept/Reject Bookings
      if (accountHealth.missedBookings > 0) {
        notifications.push({
          $id: 'missed-booking-1',
          type: 'missed_booking',
          title: '⏰ Booking Tidak Direspons',
          message: `Anda melewatkan ${accountHealth.missedBookings} permintaan booking tanpa respons. Ini mempengaruhi rating Anda dan dapat menurunkan visibilitas profil.`,
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'critical',
          actionUrl: '/bookings',
          actionLabel: 'Lihat Booking',
          bookingsMissed: accountHealth.missedBookings
        });
      }
      
      // High Priority: Account Health Issues
      if (accountHealth.score < 80) {
        notifications.push({
          $id: 'account-health-1',
          type: 'account_health',
          title: '📊 Kesehatan Akun Perlu Perhatian',
          message: `Skor kesehatan akun Anda ${accountHealth.score}/100. Lengkapi profil (${accountHealth.profileCompleteness}%) dan tingkatkan response rate untuk meningkatkan performa.`,
          timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'high',
          actionUrl: '/profile',
          actionLabel: 'Perbaiki Profil'
        });
      }
      
      // Traffic & Performance Analytics
      if (accountHealth.trafficIncrease > 0) {
        notifications.push({
          $id: 'traffic-increase-1',
          type: 'traffic',
          title: '📈 Traffic Profil Meningkat!',
          message: `Traffic profil Anda naik ${accountHealth.trafficIncrease}% minggu ini (${accountHealth.trafficViews} views). Turunkan harga untuk meningkatkan booking rate!`,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          actionUrl: '/profile',
          actionLabel: 'Sesuaikan Harga',
          trafficIncrease: accountHealth.trafficIncrease
        });
      }
      
      // Profile Completion
      if (accountHealth.profileCompleteness < 90) {
        const missingItems = [];
        if (accountHealth.profileCompleteness < 60) missingItems.push('foto profil');
        if (accountHealth.profileCompleteness < 70) missingItems.push('deskripsi lengkap');
        if (accountHealth.profileCompleteness < 80) missingItems.push('nomor WhatsApp');
        if (accountHealth.profileCompleteness < 90) missingItems.push('foto sertifikat');
        
        notifications.push({
          $id: 'profile-incomplete-1',
          type: 'profile_incomplete',
          title: '✨ Lengkapi Profil Anda',
          message: `Profil ${accountHealth.profileCompleteness}% lengkap. Tambahkan ${missingItems.join(', ')} untuk meningkatkan kepercayaan pelanggan dan mendapat lebih banyak booking.`,
          timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          actionUrl: '/profile',
          actionLabel: 'Lengkapi Profil',
          profileCompleteness: accountHealth.profileCompleteness
        });
      }
      
      // Online Time Management
      const requiredHours = 60; // Target 60 hours per month
      if (accountHealth.onlineHoursThisMonth < requiredHours) {
        const hoursNeeded = requiredHours - accountHealth.onlineHoursThisMonth;
        notifications.push({
          $id: 'online-time-1',
          type: 'online_time',
          title: '⏱️ Target Waktu Online',
          message: `Anda perlu ${hoursNeeded.toFixed(1)} jam lagi untuk mencapai target 60 jam bulan ini. Waktu online yang konsisten meningkatkan ranking profil.`,
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          actionUrl: '/schedule',
          actionLabel: 'Atur Jadwal',
          onlineHoursNeeded: hoursNeeded
        });
      }

      // Standard Notifications
      notifications.push({
        $id: 'booking-new-1',
        type: 'booking',
        title: '📅 Booking Baru dari Sarah',
        message: 'Permintaan booking massage 90 menit untuk besok jam 14:00. Segera konfirmasi dalam 2 jam untuk mempertahankan response rate yang baik.',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/bookings',
        actionLabel: 'Konfirmasi Booking'
      });
      
      notifications.push({
        $id: 'message-new-1',
        type: 'message',
        title: '💬 Pesan dari Pelanggan',
        message: 'Lisa: "Apakah bisa datang 30 menit lebih awal? Terima kasih." - Balas pesan untuk memberikan layanan terbaik.',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        actionUrl: '/chat',
        actionLabel: 'Balas Pesan'
      });
      
      notifications.push({
        $id: 'reminder-1',
        type: 'reminder',
        title: '🔔 Reminder: Sesi dalam 3 Jam',
        message: 'Massage dengan Budi (90 menit) dijadwalkan jam 15:00 hari ini. Persiapkan peralatan dan pastikan lokasi sudah siap.',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/schedule',
        actionLabel: 'Lihat Detail'
      });
      
      notifications.push({
        $id: 'payment-received-1',
        type: 'payment',
        title: '💰 Pembayaran Diterima',
        message: 'Pembayaran IDR 180,000 dari booking dengan Maria telah diterima. Komisi 30% akan dipotong sesuai ketentuan.',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium',
        actionUrl: '/earnings',
        actionLabel: 'Lihat Pendapatan'
      });
      
      notifications.push({
        $id: 'system-update-1',
        type: 'system',
        title: '🆕 Update Sistem',
        message: 'Fitur baru: Sekarang Anda bisa mengatur buffer time antar booking untuk persiapan yang lebih baik. Coba fitur ini di pengaturan jadwal.',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        actionUrl: '/schedule',
        actionLabel: 'Coba Fitur'
      });
      
      return notifications.sort((a, b) => {
        // Sort by priority first (critical > high > medium > low)
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Then by read status (unread first)
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        // Finally by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    };

    const comprehensiveNotifications = generateComprehensiveNotifications();
    setNotifications(comprehensiveNotifications);
    setLoading(false);
  }, [accountHealth, therapist]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // TODO: Update in Appwrite
      console.log('Marking notification as read:', notificationId);

      setNotifications(prev =>
        prev.map(n => n.$id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Batch update in Appwrite
      console.log('Marking all notifications as read');

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // TODO: Delete from Appwrite
      console.log('Deleting notification:', notificationId);

      setNotifications(prev => prev.filter(n => n.$id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    // Mark as read
    handleMarkAsRead(notification.$id);

    // Navigate based on type
    if (notification.type === 'booking' && onNavigateToBookings) {
      onNavigateToBookings();
    } else if (notification.type === 'message') {
      // Open chat window with customer details
      // TODO: Fetch actual customer ID from notification/booking
      setSelectedChat({
        customerId: notification.relatedId || 'customer-001',
        customerName: notification.message.split(' ')[0] || 'Customer', // Extract name from message
        bookingId: notification.relatedId
      });
      setShowChatWindow(true);
    } else if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.read);
      case 'critical': return notifications.filter(n => n.priority === 'critical');
      case 'booking': return notifications.filter(n => ['booking', 'missed_booking', 'reminder'].includes(n.type));
      case 'message': return notifications.filter(n => n.type === 'message');
      case 'system': return notifications.filter(n => ['system', 'account_health', 'traffic', 'profile_incomplete', 'online_time', 'overdue_payment'].includes(n.type));
      default: return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue_payment': return <CreditCard className="w-5 h-5 text-red-600" />;
      case 'missed_booking': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'account_health': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'traffic': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'profile_incomplete': return <User className="w-5 h-5 text-yellow-500" />;
      case 'online_time': return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'booking': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'system': return <Bell className="w-5 h-5 text-gray-500" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'reminder': return <Zap className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getNotificationPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-400 bg-red-50';
      case 'high': return 'border-orange-400 bg-orange-50';
      case 'medium': return 'border-blue-400 bg-blue-50';
      case 'low': return 'border-gray-300 bg-white';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getNotificationBadge = (priority?: string) => {
    if (priority === 'high') {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">High</span>;
    } else if (priority === 'medium') {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">Medium</span>;
    }
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();

  const dict = {
    therapistDashboard: {
      thisMonth: 'this month'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      {/* Page Header */}
      <TherapistPageHeader
        title="Notifications"
        subtitle="Pantau kesehatan akun, booking, dan performa bisnis Anda"
        onBackToStatus={onBack}
        icon={<Bell className="w-6 h-6 text-orange-600" />}
        actions={
          <div className="flex items-center gap-3">
            <HelpTooltip {...notificationsHelp.overview} position="left" size="md" />
            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount} unread
              </div>
            )}
            {/* Online Time */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{accountHealth.onlineHoursThisMonth.toFixed(1)}h</span>
              <span className="text-xs text-gray-500">{dict.therapistDashboard.thisMonth}</span>
            </div>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Account Health Score Card */}
        <div className="bg-gradient-to-r from-white to-orange-50 rounded-xl border border-gray-200 p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className={`w-6 h-6 ${
                  accountHealth.score >= 90 ? 'text-white' :
                  accountHealth.score >= 70 ? 'text-white' : 'text-white'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Account Health Score</h3>
                <p className="text-sm text-gray-600">Overall performance rating</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{accountHealth.score}%</p>
              <p className={`text-sm font-semibold ${
                accountHealth.score >= 90 ? 'text-green-600' :
                accountHealth.score >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {accountHealth.score >= 90 ? 'Excellent' : accountHealth.score >= 70 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-600">Traffic</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{accountHealth.trafficViews}</p>
              <p className="text-xs text-green-600">+{accountHealth.trafficIncrease}% this week</p>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">Rating</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{accountHealth.averageRating}</p>
              <p className="text-xs text-gray-600">from {accountHealth.monthlyBookings} bookings</p>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-600">Profile</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{accountHealth.profileCompleteness}%</p>
              <p className="text-xs text-gray-600">complete</p>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">Response</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{accountHealth.responseRate}%</p>
              <p className="text-xs text-gray-600">rate</p>
            </div>
          </div>
        </div>
        
        {/* Critical Alerts Banner */}
        {notifications.filter(n => n.priority === 'critical' && !n.read).length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="text-sm font-bold text-red-800">⚠️ Immediate Attention Required!</h4>
                <p className="text-xs text-red-700 mt-1">
                  {notifications.filter(n => n.priority === 'critical' && !n.read).length} critical issues need immediate action
                </p>
              </div>
              <button 
                onClick={() => setFilter('critical')}
                className="ml-auto px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                View Now
              </button>
            </div>
          </div>
        )}
        
        {/* Notifications Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Yang Akan Muncul di Halaman Ini:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Booking Baru:</strong> Notifikasi saat pelanggan membuat booking dengan Anda</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                <span><strong>Pesan Pelanggan:</strong> Chat dari pelanggan tentang booking mereka</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong>Reminder:</strong> Pengingat 3 jam sebelum sesi dimulai</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Pembayaran:</strong> Konfirmasi pembayaran dari pelanggan</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span><strong>Sistem:</strong> Update penting dari admin dan sistem</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Status Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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
              <X className={`w-6 h-6 mx-auto mb-2 ${
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
      
      {/* Filter Buttons */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { value: 'all', label: 'All', count: notifications.length, color: 'gray', icon: Bell },
              { value: 'critical', label: 'Critical', count: notifications.filter(n => n.priority === 'critical').length, color: 'red', icon: AlertCircle },
              { value: 'unread', label: 'Unread', count: unreadCount, color: 'orange', icon: Flame },
              { value: 'booking', label: 'Bookings', count: notifications.filter(n => ['booking', 'missed_booking', 'reminder'].includes(n.type)).length, color: 'blue', icon: Calendar },
              { value: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length, color: 'purple', icon: MessageCircle },
              { value: 'system', label: 'Business', count: notifications.filter(n => ['system', 'account_health', 'traffic', 'profile_incomplete', 'online_time', 'overdue_payment'].includes(n.type)).length, color: 'green', icon: TrendingUp }
            ].map(f => {
              const IconComponent = f.icon;
              const isActive = filter === f.value;
              const isUrgent = f.value === 'critical' && f.count > 0;
              
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all shadow-sm ${
                    isActive
                      ? f.value === 'all' ? 'bg-gray-500 text-white shadow-md' :
                        f.value === 'critical' ? 'bg-red-500 text-white shadow-md' :
                        f.value === 'unread' ? 'bg-orange-500 text-white shadow-md' :
                        f.value === 'booking' ? 'bg-blue-500 text-white shadow-md' :
                        f.value === 'message' ? 'bg-purple-500 text-white shadow-md' :
                        'bg-green-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  } ${
                    isUrgent ? 'animate-pulse ring-2 ring-red-400' : ''
                  }`}
                >
                  <IconComponent className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${
                    isActive ? 'text-white' : 
                      f.value === 'all' ? 'text-gray-500' :
                      f.value === 'critical' ? 'text-red-500' :
                      f.value === 'unread' ? 'text-orange-500' :
                      f.value === 'booking' ? 'text-blue-500' :
                      f.value === 'message' ? 'text-purple-500' :
                      'text-green-500'
                  }`} />
                  <span className="hidden xs:inline sm:inline">{f.label}</span>
                  <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white'
                      : f.count > 0 
                        ? f.value === 'critical' ? 'bg-red-100 text-red-700' :
                          f.value === 'unread' ? 'bg-orange-100 text-orange-700' :
                          f.value === 'booking' ? 'bg-blue-100 text-blue-700' :
                          f.value === 'message' ? 'bg-purple-100 text-purple-700' :
                          f.value === 'system' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold">Tidak Ada Notifikasi</p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === 'unread' 
                ? "Semua sudah dibaca!" 
                : 'Notifikasi baru akan muncul di sini'}
            </p>
          </div>
        ) : (
          <>
            {/* Stats Summary - Enhanced with gradients and details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {/* Total Notifications */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full">Semua</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{notifications.length}</p>
                <p className="text-xs text-gray-600 font-medium">Total Notifikasi</p>
              </div>

              {/* Unread Notifications */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm relative">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-orange-700 bg-white px-2 py-0.5 rounded-full">Baru</span>
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">{unreadCount}</p>
                <p className="text-xs text-orange-700 font-medium">Belum Dibaca</p>
              </div>

              {/* Booking Notifications */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">{notifications.filter(n => n.type === 'booking').length}</p>
                <p className="text-xs text-blue-700 font-medium">Booking Update</p>
              </div>

              {/* Message Notifications */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <MessageCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <User className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">{notifications.filter(n => n.type === 'message').length}</p>
                <p className="text-xs text-purple-700 font-medium">Pesan Pelanggan</p>
              </div>
            </div>

            {/* Notifications - Enhanced Cards */}
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.$id}
                  className={`bg-white rounded-xl border-2 transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                    notification.read 
                      ? 'border-gray-200' 
                      : 'border-orange-300 shadow-md bg-gradient-to-r from-orange-50/30 to-white'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon with Enhanced Styling */}
                      <div className={`flex-shrink-0 p-3 rounded-xl shadow-sm ${
                        notification.read 
                          ? 'bg-gray-50 border border-gray-200' 
                          : 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg">{notification.title}</h3>
                            {!notification.read && (
                              <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">NEW</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getNotificationBadge(notification.priority)}
                            <button
                              onClick={() => handleDeleteNotification(notification.$id)}
                              className="text-gray-400 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-lg hover:scale-110"
                              title="Delete notification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-gray-700 text-sm sm:text-base mb-4 leading-relaxed">{notification.message}</p>

                        {/* Metadata Bar */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          {/* Related ID Badge */}
                          {notification.relatedId && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                              <span className="text-gray-500">ID:</span>
                              <span className="font-mono font-bold">#{notification.relatedId}</span>
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-xs font-medium text-blue-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>

                          {/* Type Badge */}
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize ${
                            notification.type === 'booking' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            notification.type === 'message' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            notification.type === 'payment' ? 'bg-green-50 border-green-200 text-green-700' :
                            notification.type === 'reminder' ? 'bg-red-50 border-red-200 text-red-700' :
                            'bg-gray-50 border-gray-200 text-gray-700'
                          }`}>
                            {notification.type}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.$id)}
                              className="text-sm text-gray-700 hover:text-gray-900 font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1.5" />
                              Tandai Dibaca
                            </button>
                          )}
                          {notification.actionLabel && (
                            <button
                              onClick={() => handleNotificationAction(notification)}
                              className="text-sm px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-105"
                            >
                              {notification.actionLabel}
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Read Status Indicator Bar */}
                  {!notification.read && (
                    <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Action Recommendations */}
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Rekomendasi Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountHealth.overduePayments > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Pembayaran Tertunggak</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Segera bayar komisi untuk menghindari penangguhan akun
                </p>
                <button className="w-full px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                  Bayar Sekarang
                </button>
              </div>
            )}
            
            {accountHealth.profileCompleteness < 90 && (
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-700">Lengkapi Profil</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Profil lengkap meningkatkan kepercayaan pelanggan
                </p>
                <button className="w-full px-3 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors">
                  Edit Profil
                </button>
              </div>
            )}
            
            {accountHealth.trafficIncrease > 0 && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700">Optimasi Harga</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Traffic naik! Pertimbangkan turunkan harga untuk booking lebih banyak
                </p>
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Sesuaikan Harga
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window Modal */}
      {showChatWindow && selectedChat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Chat dengan {selectedChat.customerName}</h3>
                  <p className="text-sm text-gray-500">Percakapan real-time</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChatWindow(false);
                  setSelectedChat(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Chat Window Component */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                providerId={therapist.$id}
                providerRole="therapist"
                providerName={therapist.name}
                customerId={selectedChat.customerId}
                customerName={selectedChat.customerName}
                bookingId={selectedChat.bookingId}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TherapistNotificationsPage;
