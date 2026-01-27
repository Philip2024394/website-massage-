// Notification Provider for Global Notification Management
// Integrates sound notifications with background notifications

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useNotificationSounds } from '../hooks/useNotificationSounds';
import { backgroundNotificationService } from '../lib/backgroundNotificationService';
// Note: Coin system has been disabled and moved to deleted folder
// import { trackBookingCompletion } from '../lib/coinHooks';

interface NotificationContextType {
    // Booking notifications
    notifyBookingConfirmed: (bookingId: string, therapistName?: string) => Promise<void>;
    notifyBookingCancelled: (bookingId: string, reason?: string) => Promise<void>;
    notifyBookingCompleted: (bookingId: string, userId?: string, totalBookings?: number, earnings?: number) => Promise<void>;
    notifyNewBookingRequest: (customerName: string, location?: string) => Promise<void>;
    
    // Chat notifications
    notifyChatMessage: (senderName: string, message: string, chatId: string, isGroup?: boolean, groupName?: string) => Promise<void>;
    
    // Coin notifications
    notifyCoinsEarned: (amount: number, activity: string, userType?: 'customer' | 'therapist' | 'hotel' | 'villa') => Promise<void>;
    notifyAchievementUnlocked: (achievementName: string, coinsReward: number) => Promise<void>;
    
    // Commission notifications
    notifyCommissionRequest: (therapistName: string, amount: number, commissionId: string) => Promise<void>;
    notifyCommissionConfirmed: (amount: number, hotelName: string, commissionId: string) => Promise<void>;
    notifyCommissionPaid: (amount: number, commissionId: string) => Promise<void>;
    
    // General notifications
    notifyGeneral: (title: string, message: string, urgent?: boolean) => Promise<void>;
    notifyPaymentReceived: (amount: number, from: string) => Promise<void>;
    notifyTherapistAvailable: (therapistName: string, services: string[]) => Promise<void>;
    
    // Settings
    setNotificationsEnabled: (enabled: boolean) => void;
    areNotificationsEnabled: boolean;
    isAudioSupported: boolean;
    testNotificationSound: (type?: 'booking' | 'chat' | 'coin' | 'general' | 'urgent' | 'success' | 'achievement') => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
    userType?: 'customer' | 'therapist' | 'hotel' | 'villa';
    userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    userType: _userType = 'customer',
    userId: _userId
}) => {
    const sounds = useNotificationSounds({
        preloadSounds: true,
        enabledByDefault: true,
        autoRequestPermission: true
    });
    
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        // Check and request notification permission on mount
        backgroundNotificationService.requestPermission().then((permission) => {
            setPermissionGranted(permission === 'granted');
        });
    }, []);

    // Use permissionGranted in a development console check (this suppresses unused variable warning)
    if (process.env.NODE_ENV === 'development') {
        console.debug('Notification permission granted:', permissionGranted);
    }

    // Booking Notifications
    const notifyBookingConfirmed = useCallback(async (bookingId: string, therapistName?: string) => {
        await sounds.playBookingSound();
        await backgroundNotificationService.showBookingNotification('confirmed', {
            bookingId,
            therapistName
        });
    }, [sounds]);

    const notifyBookingCancelled = useCallback(async (bookingId: string, reason?: string) => {
        await sounds.playUrgentSound();
        await backgroundNotificationService.showBookingNotification('cancelled', {
            bookingId,
            reason
        });
    }, [sounds]);

    const notifyBookingCompleted = useCallback(async (bookingId: string, userId?: string, totalBookings?: number, earnings?: number) => {
        await sounds.playCustomSound('success');
        if (earnings && earnings > 0) {
            await sounds.playCoinSound(earnings);
        }
        
        // Note: Booking completion coin reward tracking has been disabled (coin system removed)
        
        await backgroundNotificationService.showBookingNotification('completed', {
            bookingId
        });
    }, [sounds]);

    const notifyNewBookingRequest = useCallback(async (customerName: string, location?: string) => {
        await sounds.playBookingSound();
        await backgroundNotificationService.showBookingNotification('new_request', {
            bookingId: `temp-${Date.now()}`,
            customerName,
            location
        });
    }, [sounds]);

    // Chat Notifications
    const notifyChatMessage = useCallback(async (
        senderName: string, 
        message: string, 
        chatId: string, 
        isGroup: boolean = false, 
        groupName?: string
    ) => {
        await sounds.playChatSound(isGroup ? 0.6 : 0.8);
        await backgroundNotificationService.showChatNotification(
            senderName,
            message,
            chatId,
            isGroup,
            groupName
        );
    }, [sounds]);

    // Coin Notifications
    const notifyCoinsEarned = useCallback(async (
        amount: number, 
        activity: string, 
        userType: 'customer' | 'therapist' | 'hotel' | 'villa' = 'customer'
    ) => {
        await sounds.playCoinSound(amount);
        await backgroundNotificationService.showCoinNotification(amount, activity, userType);
    }, [sounds]);

    const notifyAchievementUnlocked = useCallback(async (achievementName: string, coinsReward: number) => {
        await sounds.playAchievementSound();
        await backgroundNotificationService.showGeneralNotification(
            '🏆 Achievement Unlocked!',
            `${achievementName} - Earned ${coinsReward} coins!`,
            {
                icon: '/icons/achievement.png',
                action: 'view_coins'
            }
        );
    }, [sounds]);

    // Commission Notifications
    const notifyCommissionRequest = useCallback(async (therapistName: string, amount: number, commissionId: string) => {
        await sounds.playBookingSound();
        await backgroundNotificationService.showCommissionNotification('request', {
            amount,
            therapistName,
            hotelName: 'Your Hotel', // This should come from user context
            commissionId
        });
    }, [sounds]);

    const notifyCommissionConfirmed = useCallback(async (amount: number, hotelName: string, commissionId: string) => {
        await sounds.playCustomSound('success');
        await backgroundNotificationService.showCommissionNotification('confirmed', {
            amount,
            therapistName: 'You', // This should come from user context
            hotelName,
            commissionId
        });
    }, [sounds]);

    const notifyCommissionPaid = useCallback(async (amount: number, commissionId: string) => {
        await sounds.playCoinSound(amount);
        await backgroundNotificationService.showCommissionNotification('paid', {
            amount,
            therapistName: 'You',
            hotelName: 'System',
            commissionId
        });
    }, [sounds]);

    // General Notifications
    const notifyGeneral = useCallback(async (title: string, message: string, urgent: boolean = false) => {
        if (urgent) {
            await sounds.playUrgentSound();
        } else {
            await sounds.playGeneralSound();
        }
        await backgroundNotificationService.showGeneralNotification(title, message, {
            urgent
        });
    }, [sounds]);

    const notifyPaymentReceived = useCallback(async (amount: number, from: string) => {
        await sounds.playCustomSound('success');
        await backgroundNotificationService.showGeneralNotification(
            '💳 Payment Received',
            `Received $${amount} from ${from}`,
            {
                icon: '/icons/payment.png',
                action: 'view_payments'
            }
        );
    }, [sounds]);

    const notifyTherapistAvailable = useCallback(async (therapistName: string, services: string[]) => {
        await sounds.playGeneralSound();
        await backgroundNotificationService.showGeneralNotification(
            '👋 Therapist Available',
            `${therapistName} is now available for ${services.join(', ')}`,
            {
                icon: '/icons/therapist-available.png'
            }
        );
    }, [sounds]);

    // Settings and utilities
    const testNotificationSound = useCallback(async (type: 'booking' | 'chat' | 'coin' | 'general' | 'urgent' | 'success' | 'achievement' = 'general') => {
        await sounds.testSound(type);
        
        // Also show a test notification
        await backgroundNotificationService.showGeneralNotification(
            '🔊 Test Notification',
            `Testing ${type} notification sound`,
            {
                icon: '/icons/test.png'
            }
        );
    }, [sounds]);

    const contextValue: NotificationContextType = {
        // Booking notifications
        notifyBookingConfirmed,
        notifyBookingCancelled,
        notifyBookingCompleted,
        notifyNewBookingRequest,
        
        // Chat notifications
        notifyChatMessage,
        
        // Coin notifications
        notifyCoinsEarned,
        notifyAchievementUnlocked,
        
        // Commission notifications
        notifyCommissionRequest,
        notifyCommissionConfirmed,
        notifyCommissionPaid,
        
        // General notifications
        notifyGeneral,
        notifyPaymentReceived,
        notifyTherapistAvailable,
        
        // Settings
        setNotificationsEnabled: sounds.setNotificationsEnabled,
        areNotificationsEnabled: sounds.areNotificationsEnabled,
        isAudioSupported: sounds.isAudioSupported,
        testNotificationSound
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;