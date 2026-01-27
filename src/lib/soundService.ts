/**
 * Sound Service for Chat Notifications
 * Manages sound playback for different chat events
 * 
 * Sound files should be placed in: /public/sounds/
 */

interface SoundConfig {
    name: string;
    path: string;
    volume: number;
}

const SOUNDS: Record<string, SoundConfig> = {
    whatsappSent: {
        name: 'WhatsApp Sent',
        path: '/sounds/whatsapp-sent.mp3',
        volume: 0.6
    },
    chatOpened: {
        name: 'Chat Opened',
        path: '/sounds/chat-opened.mp3',
        volume: 0.5
    },
    messageReceived: {
        name: 'Message Received',
        path: '/sounds/message-received.mp3',
        volume: 0.5
    },
    messageSent: {
        name: 'Message Sent',
        path: '/sounds/message-sent.mp3',
        volume: 0.4
    },
    bookingAccepted: {
        name: 'Booking Accepted',
        path: '/sounds/booking-accepted.mp3',
        volume: 0.7
    },
    bookingDeclined: {
        name: 'Booking Declined',
        path: '/sounds/booking-declined.mp3',
        volume: 0.6
    },
    timeoutWarning: {
        name: 'Timeout Warning',
        path: '/sounds/timeout-warning.mp3',
        volume: 0.7
    },
    chatExpired: {
        name: 'Chat Expired',
        path: '/sounds/chat-expired.mp3',
        volume: 0.5
    }
};

class SoundService {
    private audioElements: Map<string, HTMLAudioElement> = new Map();
    private isMuted: boolean = false;

    constructor() {
        // Preload all sounds
        this.preloadSounds();
    }

    /**
     * Preload all sound files
     */
    private preloadSounds() {
        Object.entries(SOUNDS).forEach(([key, config]) => {
            try {
                const audio = new Audio(config.path);
                audio.preload = 'auto';
                audio.volume = config.volume;
                this.audioElements.set(key, audio);
            } catch (error) {
                console.warn(`Failed to preload sound: ${config.name}`, error);
            }
        });
    }

    /**
     * Play a sound by key
     */
    async play(soundKey: keyof typeof SOUNDS, customVolume?: number): Promise<void> {
        if (this.isMuted) return;

        const audio = this.audioElements.get(soundKey);
        if (!audio) {
            console.warn(`Sound not found: ${soundKey}`);
            return;
        }

        try {
            // Reset audio to start
            audio.currentTime = 0;
            
            // Set custom volume if provided
            if (customVolume !== undefined) {
                audio.volume = Math.max(0, Math.min(1, customVolume));
            }

            await audio.play();
        } catch (error) {
            console.warn(`Failed to play sound: ${soundKey}`, error);
            // User interaction might be required for autoplay
        }
    }

    /**
     * Play a sequence of sounds with delays
     */
    async playSequence(
        sequence: Array<{
            soundKey: keyof typeof SOUNDS;
            delay: number;
            volume?: number;
        }>
    ): Promise<void> {
        for (const item of sequence) {
            await new Promise(resolve => setTimeout(resolve, item.delay));
            await this.play(item.soundKey, item.volume);
        }
    }

    /**
     * Mute all sounds
     */
    mute() {
        this.isMuted = true;
    }

    /**
     * Unmute all sounds
     */
    unmute() {
        this.isMuted = false;
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    /**
     * Check if muted
     */
    isSoundMuted(): boolean {
        return this.isMuted;
    }

    /**
     * Set global volume for all sounds
     */
    setGlobalVolume(volume: number) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.audioElements.forEach(audio => {
            audio.volume = clampedVolume;
        });
    }
}

// Export singleton instance
export const soundService = new SoundService();

// Export sound keys for type safety
export type SoundKey = keyof typeof SOUNDS;

/**
 * Helper function to play booking notification sequence
 * WhatsApp sent → Chat window opens
 */
export async function playBookingNotificationSequence() {
    await soundService.playSequence([
        { soundKey: 'whatsappSent', delay: 0, volume: 0.6 },
        { soundKey: 'chatOpened', delay: 800, volume: 0.5 }
    ]);
}
