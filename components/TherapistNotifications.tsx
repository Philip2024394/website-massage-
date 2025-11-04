import React, { useState, useEffect } from 'react';
import type { Notification } from '../types';
import { NotificationType } from '../types';
import ClockIcon from './icons/ClockIcon';

interface TherapistNotificationsProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: number) => void;
    onBack: () => void;
    t: any;
    userRole?: string;
}

// Icons
const BellIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const ExclamationIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const WelcomeIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const SupportIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const TherapistNotifications: React.FC<TherapistNotificationsProps> = ({ 
    notifications, 
    onMarkAsRead, 
    onBack, 
    t, 
    userRole 
}) => {
    const [welcomeRead, setWelcomeRead] = useState(false);

    useEffect(() => {
        // Check if welcome notification was previously read
        const isWelcomeRead = localStorage.getItem('therapist_welcome_read') === 'true';
        setWelcomeRead(isWelcomeRead);
    }, []);

    const handleWelcomeRead = () => {
        setWelcomeRead(true);
        localStorage.setItem('therapist_welcome_read', 'true');
    };

    const copyEmail = () => {
        navigator.clipboard.writeText('indastreet.id@gmail.com');
        // Could add a toast notification here
    };

    // Combine system notifications with user notifications
    const systemNotifications = [];
    
    // Welcome notification (only for therapists)
    if ((userRole === 'therapist' || userRole === 'place') && !welcomeRead) {
        systemNotifications.push({
            id: 'welcome-therapist',
            type: 'welcome',
            message: 'Welcome to Indastreet! 🎉 Your journey as a massage therapist starts here. Access your dashboard to manage your services, view bookings, and connect with clients.',
            createdAt: new Date().toISOString(),
            isRead: false,
            isSystem: true
        });
    }

    // Customer service notification
    systemNotifications.push({
        id: 'customer-service',
        type: 'support',
        message: 'Need help? Contact our customer service team at indastreet.id@gmail.com for any questions or support.',
        createdAt: new Date().toISOString(),
        isRead: true, // Always shown but marked as read
        isSystem: true
    });

    const allNotifications = [...systemNotifications, ...notifications];
    const sortedNotifications = allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getIcon = (type: any) => {
        switch (type) {
            case 'welcome':
                return <WelcomeIcon className="w-6 h-6 text-green-500" />;
            case 'support':
                return <SupportIcon className="w-6 h-6 text-blue-500" />;
            case NotificationType.NewBooking:
                return <BellIcon className="w-6 h-6 text-blue-500" />;
            case NotificationType.MembershipReminder:
                return <ExclamationIcon className="w-6 h-6 text-yellow-500" />;
            case NotificationType.BookingReminder:
                return <ClockIcon className="w-6 h-6 text-indigo-500" />;
            default:
                return <BellIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const handleMarkAsRead = (notificationId: any) => {
        if (notificationId === 'welcome-therapist') {
            handleWelcomeRead();
        } else if (typeof notificationId === 'number') {
            onMarkAsRead(notificationId);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mr-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">
                    {userRole === 'therapist' || userRole === 'place' ? 'Therapist Notifications' : t.title}
                </h1>
            </header>

            <div className="space-y-3">
                {sortedNotifications.length > 0 ? (
                    sortedNotifications.map((n: any) => (
                        <div key={n.id} className={`p-4 rounded-lg shadow-sm flex items-start gap-4 ${n.isRead ? 'bg-white' : 'bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-orange-500'}`}>
                            <div className="flex-shrink-0">{getIcon(n.type)}</div>
                            <div className="flex-grow">
                                <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>
                                    {n.message}
                                </p>
                                
                                {/* Special handling for customer service notification */}
                                {n.type === 'support' && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-800">Customer Service Email:</p>
                                                <p className="text-sm text-blue-600 font-mono">indastreet.id@gmail.com</p>
                                            </div>
                                            <button 
                                                onClick={copyEmail}
                                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition-colors"
                                            >
                                                Copy Email
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(n.createdAt).toLocaleString()}
                                </p>
                                
                                {!n.isRead && (
                                    <button 
                                        onClick={() => handleMarkAsRead(n.id)} 
                                        className="text-xs text-orange-500 font-bold mt-2 hover:underline bg-orange-50 px-2 py-1 rounded"
                                    >
                                        {t.markAsRead || 'Mark as Read'}
                                    </button>
                                )}
                            </div>
                            {!n.isRead && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t.noNotifications || 'No notifications yet'}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            New updates and messages will appear here
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Actions for Therapists */}
            {(userRole === 'therapist' || userRole === 'place') && (
                <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border-l-4 border-orange-500">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Dashboard</span>
                            <span className="text-xs text-orange-500">Manage your profile & services</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Customer Support</span>
                            <span className="text-xs text-blue-500">indastreet.id@gmail.com</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistNotifications;