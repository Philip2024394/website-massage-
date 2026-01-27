// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MessageCircle, AlertCircle, CheckCircle, Clock, X, ExternalLink, TrendingUp, User } from 'lucide-react';
import TherapistPageHeader from '../components/TherapistPageHeader';
import ChatWindow from '../components/ChatWindow';

interface Notification {
  $id: string;
  type: 'booking' | 'message' | 'system' | 'payment' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'high' | 'medium' | 'low';
  relatedId?: string; // booking ID, message ID, etc.
}

interface TherapistNotificationsProps {
  therapist: any;
  onBack: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToChat?: () => void;
}

const TherapistNotifications: React.FC<TherapistNotificationsProps> = ({ 
  therapist, 
  onBack,
  onNavigateToBookings,
  onNavigateToChat
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'message' | 'system'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    customerId: string;
    customerName: string;
    bookingId?: string;
  } | null>(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [therapist]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Import notification service
      const { notificationService } = await import('@lib/appwriteService');
      
      // Fetch real notifications from Appwrite
      const realNotifications = await notificationService.getByTherapist(therapist.$id);
      
      // Transform Appwrite notification documents to match interface
      const transformedNotifications: Notification[] = realNotifications.map((doc: any) => ({
        $id: doc.$id,
        type: doc.type || 'system',
        title: doc.title || 'Notification',
        message: doc.message || '',
        timestamp: doc.$createdAt || new Date().toISOString(),
        read: doc.read || false,
        actionUrl: doc.actionUrl || undefined,
        actionLabel: doc.actionLabel || undefined,
        priority: doc.priority || 'medium',
        relatedId: doc.relatedId || undefined
      }));
      
      setNotifications(transformedNotifications);
      console.log('✅ Loaded', transformedNotifications.length, 'real notifications for therapist', therapist.$id);
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      
      // Fallback to empty array instead of mock data
      setNotifications([]);
      console.warn('❌ No notifications loaded - service may be unavailable');
    } finally {
      setLoading(false);
    }
  };

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
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Standardized Status Header */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
              <p className="text-xs text-gray-600 mt-1">Semua pembaruan booking, pesan pelanggan, dan reminder Anda</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
              <span className="text-xs text-gray-500">bulan ini</span>
            </div>
          </div>
          
          {/* Info Box - What appears here */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
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
      
      {/* Minimalistic Header */}
      <TherapistPageHeader
        title=""
        subtitle={unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
        onBackToStatus={onBack}
        icon={
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        }
        actions={
          unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium px-2 py-1 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Tandai Semua Dibaca
            </button>
          )
        }
      />

      {/* Filter Buttons */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 horizontal-scroll-safe pb-1">
            {[
              { value: 'all', label: 'Semua', count: notifications.length },
              { value: 'unread', label: 'Belum Dibaca', count: unreadCount },
              { value: 'booking', label: 'Booking', count: notifications.filter(n => n.type === 'booking').length },
              { value: 'message', label: 'Pesan', count: notifications.filter(n => n.type === 'message').length },
              { value: 'system', label: 'Sistem', count: notifications.filter(n => n.type === 'system').length }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label} <span className="opacity-75">({f.count})</span>
              </button>
            ))}
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

export default TherapistNotifications;
