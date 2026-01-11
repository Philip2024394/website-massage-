/**
 * 🔊 Enhanced Chat Notification System
 * 
 * Handles MP3 sound notifications and badge counters for therapist chat messages
 * Supports both PWA and regular browser notifications
 */

class TherapistNotificationManager {
    private messageAudio: HTMLAudioElement | null = null;
    private bookingAudio: HTMLAudioElement | null = null;
    private soundEnabled: boolean = true;
    
    constructor() {
        this.initializeAudio();
        this.setupServiceWorkerListener();
        this.requestNotificationPermission();
    }
    
    private initializeAudio(): void {
        try {
            // Initialize different audio types
            this.messageAudio = new Audio('/sounds/notification.mp3');
            this.messageAudio.volume = 0.7;
            this.messageAudio.preload = 'auto';
            
            this.bookingAudio = new Audio('/sounds/booking-alert.mp3');
            this.bookingAudio.volume = 0.8;
            this.bookingAudio.preload = 'auto';
            this.bookingAudio.loop = true; // Booking alerts loop until dismissed
            
            console.log('🎵 Audio notifications initialized');
        } catch (error) {
            console.warn('Audio initialization failed, using fallback:', error);
            this.messageAudio = null;
            this.bookingAudio = null;
        }
    }
    
    private async requestNotificationPermission(): Promise<void> {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('🔔 Notification permission:', permission);
        }
    }
    
    private setupServiceWorkerListener(): void {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
                    this.playSound(event.data.soundType, event.data.volume);
                }
            });
        }
    }
    
    async playSound(type: 'message' | 'booking' | 'alert' = 'message', volume: number = 0.7): Promise<void> {
        if (!this.soundEnabled) return;
        
        try {
            let audio: HTMLAudioElement | null = null;
            
            switch (type) {
                case 'message':
                    audio = this.messageAudio;
                    break;
                case 'booking':
                    audio = this.bookingAudio;
                    break;
                case 'alert':
                    audio = this.messageAudio; // Use message sound for alerts
                    break;
            }
            
            if (audio) {
                audio.volume = volume;
                audio.currentTime = 0;
                await audio.play();
                console.log(`🔊 Played ${type} notification sound`);
            } else {
                // Fallback to Web Audio API beep
                this.playBeepSound(type);
            }
        } catch (error) {
            console.log('Audio play failed, trying fallback:', error);
            this.playBeepSound(type);
        }
    }
    
    private playBeepSound(type: string): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different frequencies for different notification types
            const frequency = type === 'booking' ? 1000 : 800;
            const duration = type === 'booking' ? 1.0 : 0.5;
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
            console.log(`🎵 Played fallback beep for ${type}`);
        } catch (error) {
            console.log('Fallback beep also failed:', error);
        }
    }
    
    showChatNotification(message: any, therapistId: string): void {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('💬 New Support Message', {
                body: message.content || message.message || 'You have a new message from admin support',
                icon: '/icons/therapist-icon-192.png',
                badge: '/icons/therapist-icon-96.png',
                tag: 'therapist-chat',
                requireInteraction: false,
                silent: false
            });
            
            notification.onclick = () => {
                // Focus the window and open chat
                window.focus();
                window.dispatchEvent(new CustomEvent('pwa-open-chat', {
                    detail: { messageId: message.$id, therapistId }
                }));
                notification.close();
            };
            
            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
        
        // Play sound notification
        this.playSound('message');
    }
    
    updateBadgeCount(count: number): void {
        // Update app badge (PWA)
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                (navigator as any).setAppBadge(count);
            } else {
                (navigator as any).clearAppBadge();
            }
        }
        
        // Update page title
        if (count > 0) {
            document.title = `(${count}) IndaStreet Therapist`;
        } else {
            document.title = 'IndaStreet Therapist';
        }
        
        console.log(`📛 Badge updated: ${count} notifications`);
    }
    
    setSoundEnabled(enabled: boolean): void {
        this.soundEnabled = enabled;
        localStorage.setItem('therapist_sound_enabled', enabled.toString());
        console.log(`🔊 Sound notifications ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    isSoundEnabled(): boolean {
        const saved = localStorage.getItem('therapist_sound_enabled');
        return saved !== null ? saved === 'true' : true; // Default to enabled
    }
}

// Global instance
const therapistNotificationManager = new TherapistNotificationManager();

// Make available globally for debugging
(window as any).therapistNotificationManager = therapistNotificationManager;

// Export for use in React components
export { therapistNotificationManager };

// Auto-initialize when script loads
console.log('🔔 Therapist notification manager initialized');
console.log('💡 Available methods:');
console.log('   - therapistNotificationManager.playSound(type)');
console.log('   - therapistNotificationManager.showChatNotification(message, therapistId)');
console.log('   - therapistNotificationManager.updateBadgeCount(count)');
console.log('   - therapistNotificationManager.setSoundEnabled(boolean)');