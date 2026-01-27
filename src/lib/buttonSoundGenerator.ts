// Button Sound Generator - Creates subtle UI sounds
// Generates industry-standard button click sounds programmatically

export class ButtonSoundGenerator {
    private audioContext: AudioContext | null = null;

    constructor() {
        this.initializeAudioContext();
    }

    private initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.warn('AudioContext not supported for sound generation:', error);
        }
    }

    /**
     * Generate a subtle click sound programmatically
     */
    async generateClickSound(
        frequency: number = 800,
        duration: number = 0.1,
        volume: number = 0.3
    ): Promise<void> {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Create a subtle click with quick fade
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // Quick attack and decay for click sound
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to generate click sound:', error);
        }
    }

    /**
     * Generate a hover sound - even more subtle
     */
    async generateHoverSound(): Promise<void> {
        await this.generateClickSound(1000, 0.05, 0.15);
    }

    /**
     * Generate a success sound - two tone
     */
    async generateSuccessSound(): Promise<void> {
        if (!this.audioContext) return;

        // First tone
        await this.generateClickSound(600, 0.1, 0.3);
        
        // Second tone after small delay
        setTimeout(() => {
            this.generateClickSound(800, 0.1, 0.25);
        }, 80);
    }

    /**
     * Generate an error sound - lower frequency
     */
    async generateErrorSound(): Promise<void> {
        await this.generateClickSound(300, 0.15, 0.4);
    }

    /**
     * Generate a toggle sound - ascending or descending
     */
    async generateToggleSound(isOn: boolean): Promise<void> {
        const startFreq = isOn ? 600 : 800;
        const endFreq = isOn ? 800 : 600;
        
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.12);
        } catch (error) {
            console.warn('Failed to generate toggle sound:', error);
        }
    }
}

// Create singleton instance
export const buttonSoundGenerator = new ButtonSoundGenerator();

export default buttonSoundGenerator;