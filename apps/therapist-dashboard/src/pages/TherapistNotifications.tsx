// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertCircle, CheckCircle, Clock, X, ExternalLink } from 'lucide-react';
import FloatingChatButton from '../components/FloatingChatButton';

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
      // TODO: Fetch from Appwrite notifications collection
      // Filter by therapistId === therapist.$id
      // Order by timestamp DESC

      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          $id: '1',
          type: 'booking',
          title: 'New Booking Request',
          message: 'John Doe requested a 90-minute Balinese Massage for Dec 15, 2024 at 3:00 PM',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          read: false,
          priority: 'high',
          actionLabel: 'View Booking',
          relatedId: 'BK001'
        },
        {
          $id: '2',
          type: 'message',
          title: 'New Message from Customer',
          message: 'Sarah Johnson sent you a message about booking availability',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
          read: false,
          priority: 'medium',
          actionLabel: 'View Chat',
          relatedId: 'MSG001'
        },
        {
          $id: '3',
          type: 'reminder',
          title: 'Upcoming Booking Reminder',
          message: 'You have a booking with Mike Wilson in 3 hours (6:00 PM today)',
          timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 hour ago
          read: false,
          priority: 'high',
          actionLabel: 'View Details'
        },
        {
          $id: '4',
          type: 'system',
          title: 'Welcome to Indastreet!',
          message: 'Your therapist profile is now live. Start receiving bookings from customers in your area.',
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
          read: true,
          priority: 'low'
        },
        {
          $id: '5',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received Rp 127,500 for booking BK001. Admin commission (Rp 22,500) has been deducted.',
          timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), // 2 days ago
          read: true,
          priority: 'medium'
        },
        {
          $id: '6',
          type: 'system',
          title: 'Premium Membership Benefits',
          message: 'Upgrade to Premium to unlock verified badge, best times analytics, and 24/7 customer support chat.',
          timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), // 3 days ago
          read: true,
          priority: 'low',
          actionLabel: 'View Plans'
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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
    } else if (notification.type === 'message' && onNavigateToChat) {
      onNavigateToChat();
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All', count: notifications.length },
              { value: 'unread', label: 'Unread', count: unreadCount },
              { value: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
              { value: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
              { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? 'bg-white text-orange-500'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-sm mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No notifications</p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : 'New notifications will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.$id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-100' 
                    : 'border-orange-200 bg-orange-50/50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-full ${
                      notification.read ? 'bg-gray-100' : 'bg-white'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {getNotificationBadge(notification.priority)}
                          {!notification.read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notification.$id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-gray-700 text-sm mb-2">{notification.message}</p>

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.$id)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                          {notification.actionLabel && (
                            <button
                              onClick={() => handleNotificationAction(notification)}
                              className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center gap-1"
                            >
                              {notification.actionLabel}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Panel */}
      {unreadCount > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border-2 border-orange-200 p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{unreadCount} Unread</p>
              <p className="text-xs text-gray-600">You have pending notifications</p>
            </div>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm"
          >
            Mark All as Read
          </button>
        </div>
      )}
      <FloatingChatButton 
        onNavigate={onNavigateToChat || (() => {})} 
        therapistId={therapist?.$id} 
      />
    </div>
  );
};

export default TherapistNotifications;
