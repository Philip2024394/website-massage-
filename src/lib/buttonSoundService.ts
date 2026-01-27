// Button Sound Service - Industry Standard UI Sounds
// Provides subtle, non-intrusive button click sounds

import { buttonSoundGenerator } from './buttonSoundGenerator';

export interface ButtonSoundType {
    type: 'click' | 'hover' | 'success' | 'error' | 'navigation' | 'toggle' | 'delete' | 'submit';
    file: string;
    volume: number;
    duration: number;
}

class ButtonSoundService {
    private audioContext: AudioContext | null = null;
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private isEnabled: boolean = true;
    private isSupported: boolean = false;
    private sounds: Map<string, ButtonSoundType> = new Map();
    private lastPlayTime: Map<string, number> = new Map();
    private debounceDelay: number = 50; // Prevent rapid-fire sounds

    constructor() {
        this.initializeAudioContext();
        this.loadButtonSounds();
        this.loadUserPreferences();
    }

    private initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isSupported = true;
            
            // Resume audio context on user interaction
            document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
            document.addEventListener('touchstart', this.resumeAudioContext.bind(this), { once: true });
        } catch (error) {
            console.warn('AudioContext not supported for button sounds:', error);
            this.isSupported = false;
        }
    }

    private resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    private loadButtonSounds() {
        // Industry standard button sounds - subtle and professional
        // Try to use existing MP3 files, fallback to generated sounds
        this.sounds.set('click', {
            type: 'click',
            file: '/sounds/booking-notification.mp3', // Use existing subtle sound
            volume: 0.2, // Very subtle
            duration: 150
        });

        this.sounds.set('hover', {
            type: 'hover',
            file: '/sounds/booking-notification.mp3', // Use existing subtle sound
            volume: 0.1, // Even more subtle
            duration: 100
        });

        this.sounds.set('success', {
            type: 'success',
            file: '/sounds/booking-notification.mp3', // Use existing
            volume: 0.3,
            duration: 200
        });

        this.sounds.set('error', {
            type: 'error',
            file: '/sounds/booking-notification.mp3', // Use existing
            volume: 0.3,
            duration: 200
        });

        this.sounds.set('navigation', {
            type: 'navigation',
            file: '/sounds/booking-notification.mp3', // Use existing subtle sound
            volume: 0.15,
            duration: 120
        });

        this.sounds.set('toggle', {
            type: 'toggle',
            file: '/sounds/booking-notification.mp3', // Use existing subtle sound
            volume: 0.2,
            duration: 150
        });

        this.sounds.set('delete', {
            type: 'delete',
            file: '/sounds/booking-notification.mp3', // Use existing
            volume: 0.25,
            duration: 180
        });

        this.sounds.set('submit', {
            type: 'submit',
            file: '/sounds/success-notification.mp3', // Use existing
            volume: 0.3,
            duration: 250
        });
    }

    private loadUserPreferences() {
        const saved = localStorage.getItem('button_sounds_enabled');
        this.isEnabled = saved === null ? true : saved === 'true';
    }

    private async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
        if (!this.audioContext || !this.isSupported) return null;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.warn('Failed to load button sound:', url, error);
            return null;
        }
    }

    private async playAudioBuffer(buffer: AudioBuffer, volume: number = 0.3, pitch: number = 1): Promise<void> {
        if (!this.audioContext || !buffer || !this.isEnabled) return;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.playbackRate.value = pitch; // Allows pitch variation
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
            
            // Auto-stop after duration
            source.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Failed to play button sound:', error);
        }
    }

    private canPlay(soundType: string): boolean {
        if (!this.isEnabled || !this.isSupported) return false;
        
        const now = Date.now();
        const lastPlay = this.lastPlayTime.get(soundType) || 0;
        
        if (now - lastPlay < this.debounceDelay) {
            return false; // Prevent rapid-fire clicks
        }
        
        this.lastPlayTime.set(soundType, now);
        return true;
    }

    /**
     * Play button click sound - most common UI interaction
     */
    async playClick(volume?: number, pitch?: number): Promise<void> {
        if (!this.canPlay('click')) return;
        
        const sound = this.sounds.get('click');
        if (!sound) return;
        
        let buffer = this.audioBuffers.get(sound.file);
        if (!buffer) {
            const loadedBuffer = await this.loadAudioBuffer(sound.file);
            if (loadedBuffer) {
                this.audioBuffers.set(sound.file, loadedBuffer);
                buffer = loadedBuffer;
            } else {
                // Fallback to generated sound
                await buttonSoundGenerator.generateClickSound(800, 0.1, volume ?? sound.volume);
                return;
            }
        }
        
        if (buffer) {
            await this.playAudioBuffer(
                buffer, 
                volume ?? sound.volume, 
                pitch ?? 1.0
            );
        }
    }

    /**
     * Play hover sound - subtle feedback on hover
     */
    async playHover(): Promise<void> {
        if (!this.canPlay('hover')) return;
        
        const sound = this.sounds.get('hover');
        if (!sound) return;
        
        let buffer = this.audioBuffers.get(sound.file);
        if (!buffer) {
            const loadedBuffer = await this.loadAudioBuffer(sound.file);
            if (loadedBuffer) {
                this.audioBuffers.set(sound.file, loadedBuffer);
                buffer = loadedBuffer;
            } else {
                // Fallback to generated hover sound
                await buttonSoundGenerator.generateHoverSound();
                return;
            }
        }
        
        if (buffer) {
            await this.playAudioBuffer(buffer, sound.volume, 1.1); // Slightly higher pitch
        }
    }

    /**
     * Play success sound for positive actions
     */
    async playSuccess(): Promise<void> {
        if (!this.canPlay('success')) return;
        await this.playButtonSound('success');
    }

    /**
     * Play error sound for negative actions or validation errors
     */
    async playError(): Promise<void> {
        if (!this.canPlay('error')) return;
        await this.playButtonSound('error', undefined, 0.9); // Lower pitch for errors
    }

    /**
     * Play navigation sound for menu items, tabs, navigation
     */
    async playNavigation(): Promise<void> {
        if (!this.canPlay('navigation')) return;
        await this.playButtonSound('navigation', undefined, 1.05);
    }

    /**
     * Play toggle sound for switches, checkboxes, toggles
     */
    async playToggle(isOn: boolean): Promise<void> {
        if (!this.canPlay('toggle')) return;
        
        // Try generated sound first for toggles (more appropriate)
        try {
            await buttonSoundGenerator.generateToggleSound(isOn);
        } catch {
            // Fallback to file-based sound
            const pitch = isOn ? 1.1 : 0.95; // Higher pitch for ON, lower for OFF
            await this.playButtonSound('toggle', undefined, pitch);
        }
    }

    /**
     * Play delete sound for destructive actions
     */
    async playDelete(): Promise<void> {
        if (!this.canPlay('delete')) return;
        await this.playButtonSound('delete', undefined, 0.85); // Lower pitch for danger
    }

    /**
     * Play submit sound for form submissions, confirmations
     */
    async playSubmit(): Promise<void> {
        if (!this.canPlay('submit')) return;
        await this.playButtonSound('submit');
    }

    /**
     * Generic button sound player
     */
    private async playButtonSound(
        type: ButtonSoundType['type'], 
        volume?: number, 
        pitch: number = 1.0
    ): Promise<void> {
        const sound = this.sounds.get(type);
        if (!sound) return;
        
        let buffer = this.audioBuffers.get(sound.file);
        if (!buffer) {
            const loadedBuffer = await this.loadAudioBuffer(sound.file);
            if (loadedBuffer) {
                this.audioBuffers.set(sound.file, loadedBuffer);
                buffer = loadedBuffer;
            }
        }
        
        if (buffer) {
            await this.playAudioBuffer(
                buffer, 
                volume ?? sound.volume, 
                pitch
            );
        }
    }

    /**
     * Enable/disable button sounds
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        localStorage.setItem('button_sounds_enabled', enabled.toString());
    }

    /**
     * Check if button sounds are enabled
     */
    isButtonSoundsEnabled(): boolean {
        return this.isEnabled;
    }

    /**
     * Set global volume for button sounds
     */
    setGlobalVolume(volume: number): void {
        // Update all sound volumes
        this.sounds.forEach((sound, key) => {
            sound.volume = Math.max(0, Math.min(1, volume * 0.5)); // Cap at 50% of original
            this.sounds.set(key, sound);
        });
    }

    /**
     * Preload button sounds for better performance
     */
    async preloadButtonSounds(): Promise<void> {
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
     * Test button sound
     */
    async testButtonSound(type: ButtonSoundType['type'] = 'click'): Promise<void> {
        // Temporarily enable for testing
        const wasEnabled = this.isEnabled;
        this.isEnabled = true;
        
        await this.playButtonSound(type);
        
        // Restore original state
        this.isEnabled = wasEnabled;
    }

    /**
     * Get available button sound types
     */
    getAvailableSoundTypes(): ButtonSoundType['type'][] {
        return Array.from(this.sounds.keys()) as ButtonSoundType['type'][];
    }
}

// Create singleton instance
export const buttonSoundService = new ButtonSoundService();

export default buttonSoundService;