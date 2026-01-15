/**
 * NotificationsTab - Shared notifications display tab
 */

import React from 'react';
import NotificationCard from '../cards/NotificationCard';
import type { Notification } from '../../../types';

export interface NotificationsTabProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: number) => Promise<void>;
    onDismiss?: (notificationId: number) => Promise<void>;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
    notifications,
    onMarkAsRead,
    onDismiss,
}) => {
    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
    
    const filteredNotifications = React.useMemo(() => {
        if (filter === 'all') return notifications;
        return notifications.filter(n => !n.isRead);
    }, [notifications, filter]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h2>
                
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${
                            filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg ${
                            filter === 'unread'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Unread
                    </button>
                </div>
            </div>
            
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            id={notification.id}
                            title={notification.title}
                            message={notification.body}
                            timestamp={new Date(notification.createdAt).toLocaleString()}
                            isRead={notification.isRead}
                            type={notification.type as any}
                            onMarkAsRead={() => onMarkAsRead(notification.id as number)}
                            onDismiss={onDismiss ? () => onDismiss(notification.id as number) : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsTab;


