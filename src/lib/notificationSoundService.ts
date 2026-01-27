// Notification Sound Service
// Handles MP3 playback for all app notifications

export interface NotificationSound {
    type: 'booking' | 'chat' | 'coin' | 'general' | 'urgent' | 'success' | 'achievement';
    file: string;
    volume?: number;
}

class NotificationSoundService {
    private audioContext: AudioContext | null = null;
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private isSupported: boolean = false;
    private sounds: Map<string, NotificationSound> = new Map();

    constructor() {
        this.initializeAudioContext();
        this.loadDefaultSounds();
        this.requestNotificationPermission();
    }

    private initializeAudioContext() {
        try {
            // Create AudioContext for better browser compatibility
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isSupported = true;
            
            // Resume audio context on user interaction (required by browsers)
            document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
            document.addEventListener('touchstart', this.resumeAudioContext.bind(this), { once: true });
        } catch (error) {
            console.warn('AudioContext not supported:', error);
            this.isSupported = false;
        }
    }

    private resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    private loadDefaultSounds() {
        // Define default notification sounds using existing files
        this.sounds.set('booking', {
            type: 'booking',
            file: '/sounds/booking-notification.mp3',
            volume: 0.8
        });

        this.sounds.set('chat', {
            type: 'chat',
            file: '/sounds/message-notification.mp3',
            volume: 0.7
        });

        this.sounds.set('coin', {
            type: 'coin',
            file: '/sounds/success-notification.mp3', // Using success sound for coins
            volume: 0.9
        });

        this.sounds.set('general', {
            type: 'general',
            file: '/sounds/booking-notification.mp3', // Using booking as general
            volume: 0.6
        });

        this.sounds.set('urgent', {
            type: 'urgent',
            file: '/sounds/alert-notification.mp3',
            volume: 1.0
        });

        this.sounds.set('success', {
            type: 'success',
            file: '/sounds/success-notification.mp3',
            volume: 0.8
        });

        this.sounds.set('achievement', {
            type: 'achievement',
            file: '/sounds/success-notification.mp3', // Using success sound for achievements
            volume: 0.9
        });
    }

    private async requestNotificationPermission(): Promise<boolean> {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    private async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
        if (!this.audioContext || !this.isSupported) return null;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.warn('Failed to load audio:', url, error);
            return null;
        }
    }

    private async playAudioBuffer(buffer: AudioBuffer, volume: number = 0.7): Promise<void> {
        if (!this.audioContext || !buffer) return;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        } catch (error) {
            console.warn('Failed to play audio:', error);
        }
    }

    // Fallback method using HTML5 Audio API
    private playAudioFallback(url: string, volume: number = 0.7): void {
        try {
            const audio = new Audio(url);
            audio.volume = volume;
            audio.play().catch(error => {
                console.warn('Fallback audio play failed:', error);
            });
        } catch (error) {
            console.warn('Audio fallback failed:', error);
        }
    }

    /**
     * Play notification sound by type
     */
    async playNotification(
        type: NotificationSound['type'], 
        options?: { 
            volume?: number; 
            customUrl?: string;
            forcePlay?: boolean;
        }
    ): Promise<void> {
        const soundConfig = this.sounds.get(type);
        const url = options?.customUrl || soundConfig?.file || '/sounds/general-notification.mp3';
        const volume = options?.volume ?? soundConfig?.volume ?? 0.7;

        // Check if cached
        let buffer = this.audioBuffers.get(url);
        
        if (!buffer) {
            const loadedBuffer = await this.loadAudioBuffer(url);
            if (loadedBuffer) {
                this.audioBuffers.set(url, loadedBuffer);
                buffer = loadedBuffer;
            }
        }

        if (this.isSupported && buffer) {
            await this.playAudioBuffer(buffer, volume);
        } else {
            // Fallback to HTML5 Audio
            this.playAudioFallback(url, volume);
        }
    }

    /**
     * Play sound for booking notifications
     */
    async playBookingSound(volume?: number): Promise<void> {
        await this.playNotification('booking', { volume });
    }

    /**
     * Play sound for chat messages
     */
    async playChatSound(volume?: number): Promise<void> {
        await this.playNotification('chat', { volume });
    }

    /**
     * Play sound for coin earnings with intensity
     */
    async playCoinSound(coinsEarned: number = 1): Promise<void> {
        let volume = 0.7;
        let type: NotificationSound['type'] = 'coin';

        // Adjust volume and type based on coins earned
        if (coinsEarned >= 100) {
            volume = 1.0;
            type = 'achievement';
        } else if (coinsEarned >= 50) {
            volume = 0.9;
            type = 'success';
        } else if (coinsEarned >= 25) {
            volume = 0.8;
        }

        await this.playNotification(type, { volume });
    }

    /**
     * Play urgent notification sound
     */
    async playUrgentSound(): Promise<void> {
        await this.playNotification('urgent');
    }

    /**
     * Play general notification sound
     */
    async playGeneralSound(volume?: number): Promise<void> {
        await this.playNotification('general', { volume });
    }

    /**
     * Preload all notification sounds for better performance
     */
    async preloadSounds(): Promise<void> {
        const loadPromises = Array.from(this.sounds.values()).map(async (sound) => {
            if (!this.audioBuffers.has(sound.file)) {
                const buffer = await this.loadAudioBuffer(sound.file);
                if (buffer) {
                    this.audioBuffers.set(sound.file, buffer);
                }
            }
        });

        await Promise.all(loadPromises);
    }

    /**
     * Show browser notification with sound
     */
    async showNotificationWithSound(
        title: string,
        options?: NotificationOptions & { 
            soundType?: NotificationSound['type'];
            playSound?: boolean;
        }
    ): Promise<void> {
        // Play sound first
        if (options?.playSound !== false) {
            await this.playNotification(options?.soundType || 'general');
        }

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    icon: '/icons/notification-icon.png',
                    badge: '/icons/badge-icon.png',
                    tag: 'massage-app-notification',
                    requireInteraction: false,
                    silent: true, // We handle sound ourselves
                    ...options
                });

                // Auto close after 5 seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);
            } catch (error) {
                console.warn('Failed to show notification:', error);
            }
        }
    }

    /**
     * Test notification sound
     */
    async testSound(type: NotificationSound['type'] = 'general'): Promise<void> {
        await this.playNotification(type, { forcePlay: true });
    }

    /**
     * Get sound configuration
     */
    getSoundConfig(type: NotificationSound['type']): NotificationSound | undefined {
        return this.sounds.get(type);
    }

    /**
     * Update sound configuration
     */
    updateSoundConfig(type: NotificationSound['type'], config: Partial<NotificationSound>): void {
        const existing = this.sounds.get(type);
        if (existing) {
            this.sounds.set(type, { ...existing, ...config });
        }
    }

    /**
     * Check if audio is supported
     */
    isAudioSupported(): boolean {
        return this.isSupported;
    }

    /**
     * Enable/disable notifications based on user preference
     */
    setNotificationsEnabled(enabled: boolean): void {
        localStorage.setItem('notifications_enabled', enabled.toString());
    }

    /**
     * Check if notifications are enabled
     */
    areNotificationsEnabled(): boolean {
        const stored = localStorage.getItem('notifications_enabled');
        return stored === null ? true : stored === 'true';
    }
}

// Create singleton instance
export const notificationSoundService = new NotificationSoundService();

// Notification types for different events
export const NotificationTypes = {
    BOOKING_CONFIRMED: 'booking',
    BOOKING_CANCELLED: 'urgent', 
    BOOKING_COMPLETED: 'success',
    NEW_BOOKING_REQUEST: 'booking',
    CHAT_MESSAGE: 'chat',
    COIN_EARNED: 'coin',
    ACHIEVEMENT_UNLOCKED: 'achievement',
    PAYMENT_RECEIVED: 'success',
    COMMISSION_CONFIRMED: 'success',
    THERAPIST_AVAILABLE: 'general',
    URGENT_UPDATE: 'urgent',
    GENERAL_NOTIFICATION: 'general'
} as const;

export default notificationSoundService;