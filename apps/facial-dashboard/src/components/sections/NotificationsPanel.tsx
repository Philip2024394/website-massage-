import React from 'react';
import { Bell, Home } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  bookingDate?: string;
  status?: string;
}

interface NotificationsPanelProps {
    notifications: Notification[];
    upcomingBookings: any[];
    onNavigate?: (page: any) => void;
    t: any;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    notifications,
    upcomingBookings,
    onNavigate,
    t: _t
}): JSX.Element => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Bookings & Notifications</h2>
                <button
                    onClick={() => onNavigate && onNavigate('home')}
                    className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                    title="Go to Home"
                    aria-label="Go to Home"
                >
                    {/* @ts-ignore - Lucide React 19 compat */}
                    <Home className="w-6 h-6" />
                </button>
            </div>
            
            {/* Upcoming Bookings Section */}
            {upcomingBookings.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        Upcoming Bookings
                    </h3>
                    <div className="space-y-3">
                        {upcomingBookings.map((booking: any) => (
                            <div key={booking.$id} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.customerName || 'Customer'}</p>
                                        <p className="text-sm text-gray-600">
                                            {booking.duration} min - {booking.massageType}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Notifications Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🔔</span>
                    Notifications
                </h3>
                <div className="space-y-3">
                    {(notifications || []).length > 0 ? (
                        (notifications || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((notification: any) => (
                            <div 
                                key={notification.id} 
                                className={`p-4 rounded-lg shadow-sm flex items-start gap-4 ${
                                    notification.isRead ? 'bg-white border border-gray-200' : 'bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-orange-500'
                                }`}
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        {/* @ts-ignore - Lucide React 19 compat */}
                                        <Bell className="w-5 h-5 text-orange-600" />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className={`text-sm ${
                                        notification.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'
                                    }`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            {/* @ts-ignore - Lucide React 19 compat */}
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No notifications yet</p>
                            <p className="text-xs text-gray-400 mt-2">
                                New updates and messages will appear here
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* No bookings message */}
            {upcomingBookings.length === 0 && (notifications || []).length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-600 font-medium">No upcoming bookings or notifications</p>
                    <p className="text-sm text-gray-400 mt-2">Check back later for updates</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;
