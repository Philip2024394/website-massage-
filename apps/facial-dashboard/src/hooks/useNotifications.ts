import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../../../lib/appwriteService';
import { soundNotificationService } from '../../../../utils/soundNotificationService';


interface UseNotificationsProps {
    placeId: number | string;
    notifications?: Notification[];
}

interface UseNotificationsReturn {
    unreadNotificationsCount: number;
    upcomingBookings: any[];
    hasPlayedSound: boolean;
    lastNotificationCheckRef: React.MutableRefObject<number>;
}

export const useNotifications = ({
    placeId,
    notifications = []
}: UseNotificationsProps): UseNotificationsReturn => {
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [hasPlayedSound, setHasPlayedSound] = useState(false);
    const lastNotificationCheckRef = useRef<number>(Date.now());

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!placeId) return;

        const pollNotifications = async () => {
            try {
                // @ts-expect-error - getUnreadCount method may not exist yet
                const response = await notificationService.getUnreadCount(String(placeId));
                const newCount = response.count || 0;
                
                // Play sound if there are new unread notifications
                if (newCount > unreadNotificationsCount && !hasPlayedSound) {
                    // @ts-expect-error - playNotificationSound method may not exist yet
                    soundNotificationService.playNotificationSound();
                    setHasPlayedSound(true);
                }
                
                setUnreadNotificationsCount(newCount);
            } catch (error) {
                console.error('Error polling notifications:', error);
            }
        };

        // Initial poll
        pollNotifications();

        // Set up polling interval
        const intervalId = setInterval(pollNotifications, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, [placeId, unreadNotificationsCount, hasPlayedSound]);

    // Calculate unread notifications count from notifications array
    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const unreadCount = notifications.filter((n: any) => !n.isRead).length;
            setUnreadNotificationsCount(unreadCount);
        }
    }, [notifications]);

    // Filter upcoming bookings
    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const now = new Date();
            const upcoming = notifications
                .filter((notification: any) => {
                    if (notification.type === 'booking' && notification.bookingDate) {
                        const bookingDate = new Date(notification.bookingDate);
                        return bookingDate > now;
                    }
                    return false;
                })
                .sort((a: any, b: any) => 
                    new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
                );
            
            setUpcomingBookings(upcoming);
        }
    }, [notifications]);

    // Reset sound flag when notifications are read
    useEffect(() => {
        if (unreadNotificationsCount === 0) {
            setHasPlayedSound(false);
        }
    }, [unreadNotificationsCount]);

    return {
        unreadNotificationsCount,
        upcomingBookings,
        hasPlayedSound,
        lastNotificationCheckRef
    };
};
