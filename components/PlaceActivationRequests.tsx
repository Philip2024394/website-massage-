import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, Mail, Calendar } from 'lucide-react';
import { notificationService } from '../lib/appwriteService';

interface PlaceActivationNotification {
    $id: string;
    type: string;
    title: string;
    message: string;
    data: {
        placeId: string;
        placeName: string;
        email: string;
        location: string;
        submittedAt: string;
    };
    isRead: boolean;
    createdAt: string;
}

interface PlaceActivationRequestsProps {
    onRefresh?: () => void;
}

const PlaceActivationRequests: React.FC<PlaceActivationRequestsProps> = ({ onRefresh }) => {
    const [notifications, setNotifications] = useState<PlaceActivationNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const allNotifications = await notificationService.getAll();
            
            // Filter for place profile pending notifications
            const placeRequests = allNotifications.filter(
                (notif: any) => notif.type === 'place_profile_pending'
            ) as PlaceActivationNotification[];
            
            // Sort by creation date (newest first)
            placeRequests.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            setNotifications(placeRequests);
            console.log('📬 Loaded place activation requests:', placeRequests.length);
        } catch (error) {
            console.error('❌ Failed to load place activation requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleApprove = async (notification: PlaceActivationNotification) => {
        try {
            setProcessing(notification.$id);
            
            // Update the notification as read and mark as approved
            await notificationService.update(notification.$id, {
                isRead: true,
                status: 'approved',
                processedAt: new Date().toISOString()
            });
            
            // Remove from the list
            setNotifications(prev => prev.filter(n => n.$id !== notification.$id));
            
            console.log('✅ Approved massage place:', notification.data.placeName);
            
            // Create a success notification for the place owner
            await notificationService.create({
                type: 'place_profile_approved',
                title: 'Profile Approved!',
                message: 'Your massage place profile has been reviewed and approved by our admin team.',
                recipientType: 'place',
                recipientId: notification.data.placeId,
                data: {
                    approvedAt: new Date().toISOString()
                },
                priority: 'high',
                isRead: false
            });
            
            onRefresh?.();
        } catch (error) {
            console.error('❌ Failed to approve place:', error);
            alert('Failed to approve place. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (notification: PlaceActivationNotification) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            setProcessing(notification.$id);
            
            // Update the notification as read and mark as rejected
            await notificationService.update(notification.$id, {
                isRead: true,
                status: 'rejected',
                rejectionReason: reason,
                processedAt: new Date().toISOString()
            });
            
            // Remove from the list
            setNotifications(prev => prev.filter(n => n.$id !== notification.$id));
            
            console.log('❌ Rejected massage place:', notification.data.placeName);
            
            // Create a notification for the place owner
            await notificationService.create({
                type: 'place_profile_rejected',
                title: 'Profile Needs Updates',
                message: `Your massage place profile needs some updates before approval. Reason: ${reason}`,
                recipientType: 'place',
                recipientId: notification.data.placeId,
                data: {
                    rejectionReason: reason,
                    rejectedAt: new Date().toISOString()
                },
                priority: 'medium',
                isRead: false
            });
            
            onRefresh?.();
        } catch (error) {
            console.error('❌ Failed to reject place:', error);
            alert('Failed to reject place. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading review requests...</span>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No massage place profiles need review at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Live Massage Place Review Requests
                </h2>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {notifications.length} for review
                </span>
            </div>

            {notifications.map((notification) => (
                <div
                    key={notification.$id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {notification.data.placeName}
                                </h3>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Live - Under Review
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{notification.data.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{notification.data.location || 'Location not specified'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">
                                        Submitted: {formatDate(notification.data.submittedAt)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-700 text-sm mb-4">
                                {notification.message}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handleApprove(notification)}
                            disabled={processing === notification.$id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {processing === notification.$id ? 'Confirming...' : 'Mark as Reviewed'}
                        </button>
                        <button
                            onClick={() => handleReject(notification)}
                            disabled={processing === notification.$id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <XCircle className="w-4 h-4" />
                            {processing === notification.$id ? 'Processing...' : 'Request Changes'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlaceActivationRequests;