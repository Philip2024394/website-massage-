/**
 * Chat Notification Service
 * Handles sound notifications and browser notifications for new messages
 */

class ChatNotificationService {
    private audio: HTMLAudioElement | null = null;
    private notificationPermission: NotificationPermission = 'default';

    constructor() {
        // Request notification permission on init
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.notificationPermission = permission;
            });
        }

        // Initialize audio for message sound
        // Using a data URL for a simple notification beep
        // In production, replace with actual MP3 file
        this.initializeAudio();
    }

    private initializeAudio() {
        // Create a simple beep sound using Web Audio API as fallback
        // In production, use: this.audio = new Audio('/sounds/notification.mp3');
        
        // For now, use a base64 encoded short beep sound
        const audioData = this.createBeepSound();
        this.audio = new Audio(audioData);
        this.audio.volume = 0.5;
    }

    private createBeepSound(): string {
        // This creates a simple notification beep using Web Audio API
        // In production, replace with actual MP3 file path
        return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+zPLTgjMGHm7A7+OZTA0PVqzn77RnHAU7k9nwynksBSF5xu/elogIGGS67OWdUQ8LTKPh671sJAQjeMbv24g4BhNpv+7inEwOD1Cq5O+yaiIEOYbU8sl5LQQhd8Tu3pSFChRjuuvmm04QC0uj4u+zaSIEKHbJ79qIOQYSabfr45pLDQ9Pq+PwtGogBDmE1PDKeCwEIXbC7d+Vhw0Raq7t5phOEgtJouHwtGkfBCh1yO/aiDoGE2m36+KZTAwPT6vl77RpIgQ5gdPwyXksAyJxvuzflIYKE2W55+WaSRAJSZ7h7rFhGwQpdMfu2ok4BhJnturhmEkNDU+r5O+1aSEEOYHT8Ml4KwQiccbs35OFCROmve7kmEoPCUic4O6wXxsEKHLH7tmJOgYRZ7bq4JdIDQ1Pq+TwsmpJEw5No+Lws2kjBDl/0fDJeSsFIm7G7N6Thw0RZLfq45lLEAlJnt/urlwcBSdwxe7ajDsGEGS66uGYSQ8NTqvk8LNrIgQ5fdPvyXksAyJsxuzelYYLEWO56eSaSQ8JR5zf77BiHQQmccLm2YdFBANVpunvs2MqBjl/0O/JdS8EIWzD7d+VhQoSY7fq45lHEQlJnN/vtl8fBSV2wu3bkEMFAk+k5O+0aSMFOn/Q78l2LQQhasfz4JCBFxRmuOrimEgPC0mZ3++vXh0FJnPB69qGOwcBTaHh7bFhKwU6fM/vyXYtBCBmxevejYcSEmS1697kl08NDked3++vXRoEJXG/691+MQUCTKLi7q9hLAU5ec3tyHIpBx9kwerZiT4HCkuc3u+tXB0FJG6959d7Lg4BTKDg7a9gLAU4d8ztyHEpBh9hvOnYhz4HCUua3e6sWx4EI2y857p3LQQBSp7f7q5hKgU5dcrpyHElBx9fvurZhz0GCkqZ3u6rWh4DJGu757h1LQMBSJzf7a1iKAU5c8npx3AlBx9dvOnYhjwFCkmY3eyqWR8EI2i457d0LQMBRpve7axhKAQ3ccnqx3AlBh5cvOjYhTwFCUeW3OyoWB8DJGa357d0LQMBRZne7atgKAQ2cMnqxnAkBh1bvOjXhjwFCEWV3Ouw';
    }

    /**
     * Play notification sound
     */
    public playSound(): void {
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(error => {
                console.warn('Failed to play notification sound:', error);
            });
        }
    }

    /**
     * Show browser notification
     */
    public showNotification(title: string, message: string, icon?: string): void {
        if (this.notificationPermission === 'granted' && 'Notification' in window) {
            const notification = new Notification(title, {
                body: message,
                icon: icon || '/logo.png',
                badge: '/logo.png',
                tag: 'chat-message',
                requireInteraction: false,
                silent: false // Will use system notification sound
            });

            // Auto close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    /**
     * Combined notification (sound + browser notification)
     */
    public notifyNewMessage(senderName: string, message: string, icon?: string): void {
        this.playSound();
        this.showNotification(
            `New message from ${senderName}`,
            message.length > 100 ? message.substring(0, 100) + '...' : message,
            icon
        );
    }

    /**
     * Request notification permission if not granted
     */
    public async requestPermission(): Promise<boolean> {
        if ('Notification' in window && this.notificationPermission !== 'granted') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            return permission === 'granted';
        }
        return this.notificationPermission === 'granted';
    }

    /**
     * Check if notifications are supported and permitted
     */
    public isEnabled(): boolean {
        return 'Notification' in window && this.notificationPermission === 'granted';
    }
}

// Export singleton instance
export const chatNotificationService = new ChatNotificationService();
