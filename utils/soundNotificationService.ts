/**
 * Sound Notification Service
 * 
 * Manages audio and desktop notification alerts for providers
 * in their dashboards. Providers can toggle sounds on/off,
 * adjust volume, and test notification sounds.
 * 
 * Features:
 * - Customizable notification sounds
 * - Volume control (0-100%)
 * - Desktop notifications with sound
 * - User preference persistence
 * - Different sounds for different event types
 */

export type NotificationSoundType = 'booking' | 'message' | 'alert' | 'success';

export const soundNotificationService = {
    /**
     * Get sound notification preference from localStorage
     * @returns true if sounds are enabled, false otherwise
     */
    getSoundPreference(): boolean {
        const pref = localStorage.getItem('notification_sound_enabled');
        return pref === null ? true : pref === 'true'; // Default: enabled
    },

    /**
     * Set sound notification preference
     * @param enabled true to enable sounds, false to disable
     */
    setSoundPreference(enabled: boolean): void {
        localStorage.setItem('notification_sound_enabled', enabled.toString());
        console.log(`🔊 Sound notifications ${enabled ? 'enabled' : 'disabled'}`);
    },

    /**
     * Get volume level (0.0 to 1.0)
     * @returns Volume level as decimal (0.0-1.0)
     */
    getVolume(): number {
        const vol = localStorage.getItem('notification_volume');
        return vol ? parseFloat(vol) : 0.7; // Default: 70%
    },

    /**
     * Set volume level
     * @param volume Volume as decimal (0.0-1.0) or percentage (0-100)
     */
    setVolume(volume: number): void {
        // Normalize to 0-1 range if percentage given
        const normalizedVolume = volume > 1 ? volume / 100 : volume;
        localStorage.setItem('notification_volume', normalizedVolume.toString());
        console.log(`🔊 Volume set to ${Math.round(normalizedVolume * 100)}%`);
    },

    /**
     * Play notification sound
     * @param type Type of notification sound to play
     */
    async playSound(type: NotificationSoundType): Promise<void> {
        // Check if sounds are enabled
        if (!this.getSoundPreference()) {
            console.log('🔇 Sound notifications disabled by user');
            return;
        }

        try {
            // Sound file URLs (stored in public/sounds/)
            const soundUrls: Record<NotificationSoundType, string> = {
                booking: '/sounds/booking-notification.mp3',
                message: '/sounds/message-notification.mp3',
                alert: '/sounds/alert-notification.mp3',
                success: '/sounds/success-notification.mp3'
            };

            const audio = new Audio(soundUrls[type]);
            audio.volume = this.getVolume();
            
            // Play sound
            await audio.play();
            console.log(`🔊 Played ${type} notification sound`);
        } catch (error) {
            console.error('❌ Error playing notification sound:', error);
            
            // Fallback: system beep if sound file not available
            if ('AudioContext' in window) {
                const context = new AudioContext();
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                
                gainNode.gain.value = this.getVolume() * 0.3; // Lower volume for beep
                oscillator.frequency.value = 800; // 800 Hz beep
                oscillator.type = 'sine';
                
                oscillator.start();
                setTimeout(() => oscillator.stop(), 200); // 200ms beep
            }
        }
    },

    /**
     * Request desktop notification permission
     * @returns Promise that resolves when permission is granted/denied
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.log('⚠️ This browser does not support desktop notifications');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        // Request permission
        const permission = await Notification.requestPermission();
        console.log(`🔔 Notification permission: ${permission}`);
        return permission;
    },

    /**
     * Show desktop notification with sound
     * @param title Notification title
     * @param options Notification options
     * @param soundType Type of sound to play
     */
    async showNotification(
        title: string,
        options: NotificationOptions,
        soundType: NotificationSoundType = 'alert'
    ): Promise<void> {
        // Request permission if needed
        const permission = await this.requestPermission();

        if (permission !== 'granted') {
            console.log('⚠️ Notification permission not granted');
            // Still play sound even if notification permission denied
            await this.playSound(soundType);
            return;
        }

        try {
            // Create notification
            const notificationOptions: NotificationOptions = {
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                requireInteraction: true, // Stays until user clicks
                tag: `indastreet-${soundType}-${Date.now()}`, // Unique tag
                ...options
            };

            const notification = new Notification(title, notificationOptions);

            // Play sound
            await this.playSound(soundType);

            // Click handler - focus app window
            notification.onclick = () => {
                window.focus();
                notification.close();
                
                // Navigate to notifications page if URL provided
                if (options.data?.url) {
                    window.location.href = options.data.url;
                }
            };

            // Auto-close after 10 seconds if not clicked
            setTimeout(() => {
                notification.close();
            }, 10000);

        } catch (error) {
            console.error('❌ Error showing desktop notification:', error);
        }
    },

    /**
     * Show booking notification
     * @param clientName Name of client who booked
     * @param service Service duration
     * @param bookingId Booking ID for navigation
     */
    async showBookingNotification(
        clientName: string,
        service: string,
        bookingId: string
    ): Promise<void> {
        await this.showNotification(
            '🔔 New Booking Request!',
            {
                body: `${clientName} booked ${service} minutes`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                data: {
                    url: `/bookings/${bookingId}`,
                    type: 'booking'
                }
            },
            'booking'
        );
    },

    /**
     * Show message notification
     * @param senderName Name of message sender
     * @param messagePreview Short preview of message
     */
    async showMessageNotification(
        senderName: string,
        messagePreview: string
    ): Promise<void> {
        await this.showNotification(
            `💬 New Message from ${senderName}`,
            {
                body: messagePreview,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                data: {
                    url: '/messages',
                    type: 'message'
                }
            },
            'message'
        );
    },

    /**
     * Show WhatsApp contact notification
     * When someone clicks "Chat Now" button on therapist/place card
     */
    async showWhatsAppContactNotification(): Promise<void> {
        await this.showNotification(
            '📱 New WhatsApp Contact!',
            {
                body: 'Someone clicked "Chat Now" to contact you on WhatsApp. Check your WhatsApp messages!',
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'whatsapp-contact',
                requireInteraction: true, // Keep notification visible
                data: {
                    type: 'whatsapp_contact'
                }
            },
            'message' // Use message sound
        );
    },

    /**
     * Show alert notification
     * @param title Alert title
     * @param message Alert message
     */
    async showAlertNotification(
        title: string,
        message: string
    ): Promise<void> {
        await this.showNotification(
            title,
            {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png'
            },
            'alert'
        );
    },

    /**
     * Get provider's WhatsApp number from localStorage
     * @returns WhatsApp number or empty string
     */
    getWhatsAppNumber(): string {
        return localStorage.getItem('providerWhatsApp') || '';
    },

    /**
     * Check if notifications are supported
     * @returns true if browser supports notifications
     */
    isSupported(): boolean {
        return 'Notification' in window;
    }
};
