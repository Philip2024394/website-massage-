/**
 * NotificationCard - Shared notification display component
 */

import React from 'react';

export interface NotificationCardProps {
    id: string | number;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
    onMarkAsRead?: () => void;
    onDismiss?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    title,
    message,
    timestamp,
    isRead,
    type = 'info',
    onMarkAsRead,
    onDismiss,
}) => {
    const typeColors = {
        info: 'bg-blue-50 border-blue-200',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200',
        error: 'bg-red-50 border-red-200',
    };

    const iconColors = {
        info: 'text-blue-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
    };

    return (
        <div className={`border rounded-lg p-4 ${typeColors[type]} ${!isRead ? 'font-semibold' : ''}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={iconColors[type]}>🔔</span>
                        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{message}</p>
                    <p className="text-xs text-gray-500">{timestamp}</p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                    {!isRead && onMarkAsRead && (
                        <button
                            onClick={onMarkAsRead}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                            Mark as read
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCard;
