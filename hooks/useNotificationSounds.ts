// React Hook for Notification Sounds
// Easy integration with React components

import { useCallback, useEffect, useRef } from 'react';
import { notificationSoundService, NotificationSound, NotificationTypes } from '../lib/notificationSoundService';

export interface UseNotificationSoundsOptions {
    preloadSounds?: boolean;
    enabledByDefault?: boolean;
    autoRequestPermission?: boolean;
}

export interface NotificationHookReturn {
    playBookingSound: (volume?: number) => Promise<void>;
    playChatSound: (volume?: number) => Promise<void>;
    playCoinSound: (coinsEarned?: number) => Promise<void>;
    playUrgentSound: () => Promise<void>;
    playGeneralSound: (volume?: number) => Promise<void>;
    playAchievementSound: () => Promise<void>;
    playCustomSound: (type: NotificationSound['type'], options?: { volume?: number; customUrl?: string }) => Promise<void>;
    showNotificationWithSound: (
        title: string, 
        options?: NotificationOptions & { 
            soundType?: NotificationSound['type'];
            playSound?: boolean;
        }
    ) => Promise<void>;
    testSound: (type?: NotificationSound['type']) => Promise<void>;
    isAudioSupported: boolean;
    areNotificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
}

export function useNotificationSounds(options: UseNotificationSoundsOptions = {}): NotificationHookReturn {
    const {
        preloadSounds = true,
        enabledByDefault = true,
        autoRequestPermission = true
    } = options;

    const isInitialized = useRef(false);

    // Initialize service on mount
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;

            if (preloadSounds) {
                notificationSoundService.preloadSounds().catch((error: any) => {
                    console.warn('Failed to preload notification sounds:', error);
                });
            }

            if (enabledByDefault) {
                notificationSoundService.setNotificationsEnabled(true);
            }
        }
    }, [preloadSounds, enabledByDefault]);

    // Notification handlers
    const playBookingSound = useCallback(async (volume?: number) => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playBookingSound(volume);
        }
    }, []);

    const playChatSound = useCallback(async (volume?: number) => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playChatSound(volume);
        }
    }, []);

    const playCoinSound = useCallback(async (coinsEarned?: number) => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playCoinSound(coinsEarned);
        }
    }, []);

    const playUrgentSound = useCallback(async () => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playUrgentSound();
        }
    }, []);

    const playGeneralSound = useCallback(async (volume?: number) => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playGeneralSound(volume);
        }
    }, []);

    const playAchievementSound = useCallback(async () => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playNotification('achievement');
        }
    }, []);

    const playCustomSound = useCallback(async (
        type: NotificationSound['type'], 
        options?: { volume?: number; customUrl?: string }
    ) => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.playNotification(type, options);
        }
    }, []);

    const showNotificationWithSound = useCallback(async (
        title: string,
        options?: NotificationOptions & { 
            soundType?: NotificationSound['type'];
            playSound?: boolean;
        }
    ) => {
        if (notificationSoundService.areNotificationsEnabled()) {
            await notificationSoundService.showNotificationWithSound(title, options);
        }
    }, []);

    const testSound = useCallback(async (type: NotificationSound['type'] = 'general') => {
        await notificationSoundService.testSound(type);
    }, []);

    const setNotificationsEnabled = useCallback((enabled: boolean) => {
        notificationSoundService.setNotificationsEnabled(enabled);
    }, []);

    return {
        playBookingSound,
        playChatSound,
        playCoinSound,
        playUrgentSound,
        playGeneralSound,
        playAchievementSound,
        playCustomSound,
        showNotificationWithSound,
        testSound,
        isAudioSupported: notificationSoundService.isAudioSupported(),
        areNotificationsEnabled: notificationSoundService.areNotificationsEnabled(),
        setNotificationsEnabled
    };
}

// Specific notification hooks for different user types
export function useCustomerNotifications() {
    const notifications = useNotificationSounds();

    return {
        ...notifications,
        notifyBookingConfirmed: (bookingId: string) => 
            notifications.showNotificationWithSound(
                'Booking Confirmed!',
                {
                    body: `Your massage booking #${bookingId} has been confirmed.`,
                    soundType: 'success',
                    icon: '/icons/booking-confirmed.png'
                }
            ),
        notifyTherapistAssigned: (therapistName: string) =>
            notifications.showNotificationWithSound(
                'Therapist Assigned',
                {
                    body: `${therapistName} will be your therapist.`,
                    soundType: 'general',
                    icon: '/icons/therapist.png'
                }
            ),
        notifyBookingCancelled: (reason?: string) =>
            notifications.showNotificationWithSound(
                'Booking Cancelled',
                {
                    body: reason || 'Your booking has been cancelled.',
                    soundType: 'urgent',
                    icon: '/icons/booking-cancelled.png'
                }
            )
    };
}

export function useTherapistNotifications() {
    const notifications = useNotificationSounds();

    return {
        ...notifications,
        notifyNewBookingRequest: (customerName: string, location: string) =>
            notifications.showNotificationWithSound(
                'New Booking Request',
                {
                    body: `${customerName} requests massage at ${location}`,
                    soundType: 'booking',
                    icon: '/icons/new-booking.png',
                    requireInteraction: true
                }
            ),
        notifyCoinsEarned: (amount: number, activity: string) => {
            notifications.playCoinSound(amount);
            return notifications.showNotificationWithSound(
                'Coins Earned!',
                {
                    body: `You earned ${amount} coins for ${activity}`,
                    soundType: 'coin',
                    icon: '/icons/coins.png'
                }
            );
        },
        notifyCommissionConfirmed: (amount: number, hotel: string) =>
            notifications.showNotificationWithSound(
                'Commission Confirmed',
                {
                    body: `${hotel} confirmed your ${amount} coin commission`,
                    soundType: 'success',
                    icon: '/icons/commission.png'
                }
            )
    };
}

export function useHotelNotifications() {
    const notifications = useNotificationSounds();

    return {
        ...notifications,
        notifyTherapistAvailable: (therapistName: string, services: string[]) =>
            notifications.showNotificationWithSound(
                'Therapist Available',
                {
                    body: `${therapistName} is available for ${services.join(', ')}`,
                    soundType: 'general',
                    icon: '/icons/therapist-available.png'
                }
            ),
        notifyBookingCompleted: (bookingId: string, earnings: number) => {
            notifications.playCoinSound(earnings);
            return notifications.showNotificationWithSound(
                'Booking Completed',
                {
                    body: `Booking #${bookingId} completed. Earned ${earnings} coins!`,
                    soundType: 'success',
                    icon: '/icons/booking-completed.png'
                }
            );
        },
        notifyCommissionRequest: (therapistName: string, amount: number) =>
            notifications.showNotificationWithSound(
                'Commission Request',
                {
                    body: `${therapistName} requests ${amount} coin commission confirmation`,
                    soundType: 'booking',
                    icon: '/icons/commission-request.png',
                    requireInteraction: true
                }
            )
    };
}

export function useChatNotifications() {
    const notifications = useNotificationSounds();

    return {
        ...notifications,
        notifyNewMessage: (senderName: string, preview: string) => {
            notifications.playChatSound();
            return notifications.showNotificationWithSound(
                `Message from ${senderName}`,
                {
                    body: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
                    soundType: 'chat',
                    icon: '/icons/chat-message.png'
                }
            );
        },
        notifyGroupMessage: (groupName: string, senderName: string, preview: string) => {
            notifications.playChatSound(0.6); // Lower volume for groups
            return notifications.showNotificationWithSound(
                `${groupName}: ${senderName}`,
                {
                    body: preview.length > 40 ? preview.substring(0, 40) + '...' : preview,
                    soundType: 'chat',
                    icon: '/icons/group-chat.png'
                }
            );
        }
    };
}

// Export notification types for convenience
export { NotificationTypes };

export default useNotificationSounds;