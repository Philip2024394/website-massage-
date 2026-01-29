import { logger } from './enterpriseLogger';
interface SoundOptions {
  loop?: boolean;
  volume?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  fadeIn?: boolean;
  fadeOut?: boolean;
}

class BookingSoundService {
  private audioContext: AudioContext | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private activeSounds: Map<string, AudioBufferSourceNode> = new Map();
  private masterVolume: number = 0.7;
  
  // Active booking alerts tracking (for continuous notification integration)
  private activeAlerts: Map<string, { status: string; intervalId: NodeJS.Timeout | null }> = new Map();
  private autoplayEnabled: boolean = false;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      logger.warn('Audio context not available:', error);
    }
  }

  /**
   * Load and cache audio files with fallback tone generation
   */
  private async loadSound(url: string): Promise<AudioBuffer | null> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      this.audioCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      logger.warn(`Sound file not found: ${url}, using generated tone fallback`);
      
      // Generate fallback tone based on sound type
      const soundName = url.split('/').pop()?.replace('.mp3', '') || '';
      return this.generateFallbackTone(soundName);
    }
  }

  /**
   * Generate fallback tone when MP3 files are not available
   */
  private generateFallbackTone(soundName: string): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    let frequency = 440;
    let duration = 0.3;
    let type: OscillatorType = 'sine';

    // Map sound names to appropriate frequencies and durations
    switch (soundName) {
      case 'booking-request':
        frequency = 800;
        duration = 0.5;
        type = 'square';
        break;
      case 'therapist-alert':
        frequency = 750;
        duration = 0.4;
        type = 'sine';
        break;
      case 'user-success':
        frequency = 523; // C5
        duration = 0.6;
        type = 'sine';
        break;
      case 'user-alert':
        frequency = 600;
        duration = 0.5;
        type = 'sawtooth';
        break;
      case 'notification':
        frequency = 440; // A4
        duration = 0.2;
        type = 'sine';
        break;
      case 'booking-cancelled':
        frequency = 300;
        duration = 0.4;
        type = 'triangle';
        break;
      default:
        frequency = 440;
        duration = 0.3;
        type = 'sine';
    }

    const length = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let amplitude = 0.3;
      
      // Add envelope (fade in/out)
      if (i < sampleRate * 0.05) {
        amplitude *= i / (sampleRate * 0.05);
      } else if (i > length - sampleRate * 0.1) {
        amplitude *= (length - i) / (sampleRate * 0.1);
      }
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    }

    this.audioCache.set(`/sounds/${soundName}.mp3`, buffer);
    return buffer;
  }

  /**
   * Play a sound with options
   */
  private async playSound(soundName: string, options: SoundOptions = {}): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
      if (!this.audioContext) return;
    }

    try {
      const soundUrl = `/sounds/${soundName}.mp3`;
      const audioBuffer = await this.loadSound(soundUrl);
      if (!audioBuffer) return;

      // Stop existing sound if not looping
      if (!options.loop && this.activeSounds.has(soundName)) {
        this.activeSounds.get(soundName)?.stop();
        this.activeSounds.delete(soundName);
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      source.loop = options.loop || false;
      
      // Set volume based on priority and master volume
      const priorityMultiplier = {
        low: 0.3,
        normal: 0.7,
        high: 1.0,
        urgent: 1.2
      }[options.priority || 'normal'];
      
      const finalVolume = (options.volume || 0.8) * this.masterVolume * priorityMultiplier;
      
      if (options.fadeIn) {
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, this.audioContext.currentTime + 0.5);
      } else {
        gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
      }

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Handle sound ending
      source.onended = () => {
        this.activeSounds.delete(soundName);
      };

      this.activeSounds.set(soundName, source);
      source.start();

    } catch (error) {
      logger.error(`Error playing sound ${soundName}:`, error);
    }
  }

  /**
   * Stop a specific sound
   */
  stopSound(soundName: string): void {
    const sound = this.activeSounds.get(soundName);
    if (sound) {
      sound.stop();
      this.activeSounds.delete(soundName);
    }
  }

  /**
   * Stop all sounds
   */
  stopAllSounds(): void {
    this.activeSounds.forEach((sound, name) => {
      sound.stop();
    });
    this.activeSounds.clear();
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // ============================================================================
  // CONTINUOUS BOOKING ALERT METHODS
  // Used by continuousNotificationService for persistent booking notifications
  // ============================================================================

  /**
   * Enable autoplay for sounds (call after user interaction)
   */
  enableAutoplay(): void {
    this.autoplayEnabled = true;
    // Resume audio context if suspended
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(err => logger.warn('Failed to resume audio context:', err));
    }
    logger.info('🔊 Autoplay enabled for booking sounds');
  }

  /**
   * Start a continuous booking alert for a specific booking
   * @param bookingId The booking ID to track
   * @param status The booking status (e.g., 'pending', 'confirmed')
   */
  startBookingAlert(bookingId: string, status: string): void {
    // Don't start if already active
    if (this.activeAlerts.has(bookingId)) {
      logger.info(`🔔 Booking alert already active for: ${bookingId}`);
      return;
    }

    // Store alert info (no interval needed - continuous service handles timing)
    this.activeAlerts.set(bookingId, { status, intervalId: null });
    logger.info(`🔔 Started booking alert for: ${bookingId} (status: ${status})`);
    
    // Play initial alert sound
    this.playBookingRequest().catch(err => logger.warn('Failed to play booking alert:', err));
  }

  /**
   * Stop a continuous booking alert for a specific booking
   * @param bookingId The booking ID to stop tracking
   */
  stopBookingAlert(bookingId: string): void {
    const alert = this.activeAlerts.get(bookingId);
    if (alert) {
      if (alert.intervalId) {
        clearInterval(alert.intervalId);
      }
      this.activeAlerts.delete(bookingId);
      logger.info(`🔕 Stopped booking alert for: ${bookingId}`);
    }
  }

  /**
   * Stop all active booking alerts
   */
  stopAllAlerts(): void {
    this.activeAlerts.forEach((alert, bookingId) => {
      if (alert.intervalId) {
        clearInterval(alert.intervalId);
      }
    });
    this.activeAlerts.clear();
    logger.info('🔕 Stopped all booking alerts');
  }

  /**
   * Check if a booking alert is currently active
   * @param bookingId The booking ID to check
   */
  isAlertActive(bookingId: string): boolean {
    return this.activeAlerts.has(bookingId);
  }

  /**
   * Get the count of currently active booking alerts
   */
  getActiveAlertCount(): number {
    return this.activeAlerts.size;
  }

  // Booking-specific sound methods

  /**
   * Play booking request sound for therapist
   */
  async playBookingRequest(): Promise<void> {
    try {
      await this.playSound('booking-request', {
        loop: false,
        priority: 'high',
        fadeIn: true
      });
      
      logger.info('🔔 Playing booking request sound for therapist');
      
    } catch (error) {
      logger.error('❌ Failed to play booking request:', error);
    }
  }

  /**
   * Play booking confirmation sound
   */
  async playBookingConfirmation(): Promise<void> {
    try {
      await this.playSound('booking-confirmed', {
        loop: false,
        priority: 'normal',
        fadeIn: false
      });
      
      logger.info('✅ Playing booking confirmation sound');
      
    } catch (error) {
      logger.error('❌ Failed to play booking confirmation:', error);
    }
  }

  /**
   * Play cancellation sound
   */
  async playBookingCancellation(): Promise<void> {
    try {
      await this.playSound('booking-cancelled', {
        loop: false,
        priority: 'normal',
        fadeIn: false
      });
      
      logger.info('❌ Playing booking cancellation sound');
      
    } catch (error) {
      logger.error('❌ Failed to play booking cancellation:', error);
    }
  }

  /**
   * Play countdown sound (5, 4, 3, 2, 1)
   */
  async playCountdown(): Promise<void> {
    try {
      const counts = [5, 4, 3, 2, 1];
      for (let i = 0; i < counts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 1000));
        await this.playSound(`countdown-${counts[i]}`, {
          loop: false,
          priority: 'high',
          fadeIn: false
        });
      }
      
      logger.info('⏰ Playing countdown sequence');
      
    } catch (error) {
      logger.error('❌ Failed to play countdown:', error);
    }
  }

  /**
   * Play notification sound
   */
  async playNotification(): Promise<void> {
    try {
      await this.playSound('notification', {
        loop: false,
        priority: 'normal',
        fadeIn: false
      });
      
      logger.info('🔔 Playing notification sound');
      
    } catch (error) {
      logger.error('❌ Failed to play notification:', error);
    }
  }

  /**
   * Play welcome chime for new users
   */
  async playWelcomeChime(): Promise<void> {
    try {
      // Create a pleasant chime sequence
      if (!this.audioContext) await this.initializeAudioContext();
      if (!this.audioContext) return;

      const audioContext = this.audioContext;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C octave

      for (let i = 0; i < notes.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(notes[i], audioContext.currentTime + i * 0.2);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.2 + 0.4);
        
        oscillator.start(audioContext.currentTime + i * 0.2);
        oscillator.stop(audioContext.currentTime + i * 0.2 + 0.4);
      }
      
    } catch (error) {
      logger.warn('⚠️ Failed to play welcome chime:', error);
    }
  }

  /**
   * Play user success sound (booking accepted)
   */
  async playUserSuccess(): Promise<void> {
    try {
      await this.playSound('user-success', {
        loop: false,
        priority: 'normal',
        fadeIn: false
      });
      
      logger.info('✅ Playing user success sound');
      
    } catch (error) {
      logger.error('❌ Failed to play user success:', error);
    }
  }

  /**
   * Play user alert sound (important notification)
   */
  async playUserAlert(): Promise<void> {
    try {
      await this.playSound('user-alert', {
        loop: false,
        priority: 'high',
        fadeIn: false
      });
      
      logger.info('🚨 Playing user alert sound');
      
    } catch (error) {
      logger.error('❌ Failed to play user alert:', error);
    }
  }

  /**
   * Play therapist alert sound (urgent notification)
   */
  async playTherapistAlert(): Promise<void> {
    try {
      await this.playSound('therapist-alert', {
        loop: false,
        priority: 'urgent',
        fadeIn: false
      });
      
      logger.info('🔔 Playing therapist alert sound');
      
    } catch (error) {
      logger.error('❌ Failed to play therapist alert:', error);
    }
  }

  /**
   * Play place alert sound (location notification)
   */
  async playPlaceAlert(): Promise<void> {
    try {
      await this.playSound('place-alert', {
        loop: false,
        priority: 'normal',
        fadeIn: false
      });
      
      logger.info('🏢 Playing place alert sound');
      
    } catch (error) {
      logger.error('❌ Failed to play place alert:', error);
    }
  }

  /**
   * Play reminder sound (scheduled booking reminder)
   */
  async playReminder(): Promise<void> {
    try {
      await this.playSound('reminder', {
        loop: false,
        priority: 'high',
        fadeIn: true
      });
      
      logger.info('⏰ Playing reminder sound');
      
    } catch (error) {
      logger.error('❌ Failed to play reminder:', error);
    }
  }

  // Enhanced Scheduled Booking Sounds

  /**
   * Play scheduled reminder alert (for therapist reminders)
   */
  async playScheduledReminderAlert(): Promise<void> {
    try {
      // Play a sequence: attention tone + reminder + fade out
      await this.playSound('attention-tone', {
        loop: false,
        priority: 'urgent',
        fadeIn: false
      });
      
      // Wait 1 second then play reminder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.playSound('scheduled-reminder', {
        loop: false,
        priority: 'high',
        fadeIn: true,
        fadeOut: true
      });
      
      logger.info('📅 Playing scheduled reminder alert for therapist');
      
    } catch (error) {
      logger.error('❌ Failed to play scheduled reminder alert:', error);
    }
  }

  /**
   * Play scheduled booking sequence (countdown + booking sound)
   */
  async playScheduledBookingSequence(): Promise<void> {
    try {
      // Play preparation tone
      await this.playSound('preparation-tone', {
        loop: false,
        priority: 'high',
        fadeIn: false
      });
      
      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Play 3-2-1 countdown
      const countdownSounds = ['three', 'two', 'one'];
      for (const count of countdownSounds) {
        await this.playSound(`countdown-${count}`, {
          loop: false,
          priority: 'urgent',
          fadeIn: false
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Final booking notification
      await this.playSound('scheduled-booking-ready', {
        loop: false,
        priority: 'urgent',
        fadeIn: false
      });
      
      logger.info('🎯 Playing scheduled booking sequence');
      
    } catch (error) {
      logger.error('❌ Failed to play scheduled booking sequence:', error);
    }
  }

  /**
   * Play hourly reminder chimes (for 5,4,3,2,1 hour reminders)
   */
  async playHourlyReminderChime(hoursRemaining: number): Promise<void> {
    try {
      if (!this.audioContext) await this.initializeAudioContext();
      if (!this.audioContext) return;

      const audioContext = this.audioContext;
      
      // Different frequencies for different hour marks
      const baseFreq = 440; // A note
      const frequencies = {
        5: baseFreq * 0.5, // Lower for earlier reminders
        4: baseFreq * 0.6,
        3: baseFreq * 0.75,
        2: baseFreq * 0.9,
        1: baseFreq * 1.2  // Higher for final hour
      };
      
      const freq = frequencies[hoursRemaining as keyof typeof frequencies] || baseFreq;
      
      // Play the specified number of chimes equal to hours remaining
      for (let i = 0; i < hoursRemaining; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.8);
        oscillator.type = 'sine';
        
        // Fade in and out for each chime
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.8);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + i * 0.8 + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + i * 0.8 + 0.6);
        
        oscillator.start(audioContext.currentTime + i * 0.8);
        oscillator.stop(audioContext.currentTime + i * 0.8 + 0.6);
      }
      
      logger.info(`🔔 Playing ${hoursRemaining} hour reminder chime`);
      
    } catch (error) {
      logger.error(`❌ Failed to play ${hoursRemaining} hour reminder chime:`, error);
    }
  }

  /**
   * Play customer app download prompt sound
   */
  async playAppDownloadPrompt(): Promise<void> {
    try {
      await this.playSound('app-download-prompt', {
        loop: false,
        priority: 'normal',
        fadeIn: true
      });
      
      logger.info('📱 Playing app download prompt sound');
      
    } catch (error) {
      logger.error('❌ Failed to play app download prompt:', error);
    }
  }

  /**
   * Play enterprise connection sound (WebSocket connected)
   */
  async playEnterpriseConnection(): Promise<void> {
    try {
      if (!this.audioContext) await this.initializeAudioContext();
      if (!this.audioContext) return;

      const audioContext = this.audioContext;
      
      // Create a "connection established" sound - rising tone sequence
      const frequencies = [220, 277, 330, 440]; // A, C#, E, A
      
      for (let i = 0; i < frequencies.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[i], audioContext.currentTime + i * 0.15);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
        
        oscillator.start(audioContext.currentTime + i * 0.15);
        oscillator.stop(audioContext.currentTime + i * 0.15 + 0.3);
      }
      
      logger.info('🔗 Playing enterprise connection sound');
      
    } catch (error) {
      logger.error('❌ Failed to play enterprise connection sound:', error);
    }
  }

  /**
   * Play enterprise disconnection sound (WebSocket disconnected)
   */
  async playEnterpriseDisconnection(): Promise<void> {
    try {
      if (!this.audioContext) await this.initializeAudioContext();
      if (!this.audioContext) return;

      const audioContext = this.audioContext;
      
      // Create a "connection lost" sound - falling tone sequence
      const frequencies = [440, 330, 277, 220]; // A, E, C#, A (descending)
      
      for (let i = 0; i < frequencies.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[i], audioContext.currentTime + i * 0.2);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + i * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.2 + 0.4);
        
        oscillator.start(audioContext.currentTime + i * 0.2);
        oscillator.stop(audioContext.currentTime + i * 0.2 + 0.4);
      }
      
      logger.info('🔌 Playing enterprise disconnection sound');
      
    } catch (error) {
      logger.error('❌ Failed to play enterprise disconnection sound:', error);
    }
  }
}

// Create and export singleton instance
export const bookingSoundService = new BookingSoundService();
export default bookingSoundService;