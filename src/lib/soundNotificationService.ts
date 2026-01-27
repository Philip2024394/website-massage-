/**
 * SOUND NOTIFICATION SERVICE
 * Production-grade audio notification system for booking state changes
 * 
 * FEATURES:
 * - Respects browser autoplay rules
 * - Prevents duplicate sounds (tracks last played state)
 * - Volume control ready
 * - Mute option support
 * 
 * USAGE:
 * import { playSound } from './soundNotificationService'
 * playSound('success', 'booking_accepted')
 */

export type SoundType = 'info' | 'success' | 'warning' | 'error' | 'critical';

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
}

// Track last played sound to prevent duplicates
const lastPlayedSound: Map<string, number> = new Map();

// Minimum time between same sound (ms)
const SOUND_COOLDOWN = 2000;

// Check if user has muted notifications (localStorage)
const isMuted = (): boolean => {
  try {
    return localStorage.getItem('chat_sounds_muted') === 'true';
  } catch {
    return false;
  }
};

// Sound configurations for each type
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  info: {
    frequency: 600,
    duration: 150,
    volume: 0.3
  },
  success: {
    frequency: 800,
    duration: 200,
    volume: 0.4
  },
  warning: {
    frequency: 400,
    duration: 250,
    volume: 0.5
  },
  error: {
    frequency: 300,
    duration: 300,
    volume: 0.5
  },
  critical: {
    frequency: 200,
    duration: 400,
    volume: 0.6
  }
};

/**
 * Play notification sound using Web Audio API
 * Respects browser autoplay policies
 */
export const playSound = (type: SoundType, eventId: string): void => {
  // Check mute setting
  if (isMuted()) {
    console.log('🔇 Sounds muted by user');
    return;
  }

  // Check cooldown to prevent spam
  const lastPlayed = lastPlayedSound.get(eventId);
  if (lastPlayed && Date.now() - lastPlayed < SOUND_COOLDOWN) {
    console.log('🔇 Sound cooldown active for:', eventId);
    return;
  }

  try {
    const config = SOUND_CONFIGS[type];
    
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.frequency.value = config.frequency;
    oscillator.type = 'sine';
    
    // Volume envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + config.duration / 1000);
    
    // Play
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration / 1000);
    
    // Track last played
    lastPlayedSound.set(eventId, Date.now());
    
    console.log(`🔊 Played ${type} sound for:`, eventId);
    
    // Cleanup
    oscillator.onended = () => {
      audioContext.close();
    };
    
  } catch (error) {
    console.warn('⚠️ Failed to play sound (browser may block autoplay):', error);
  }
};

/**
 * Toggle mute setting
 */
export const toggleMute = (): boolean => {
  try {
    const currentMute = isMuted();
    const newMute = !currentMute;
    localStorage.setItem('chat_sounds_muted', String(newMute));
    console.log(`🔊 Sounds ${newMute ? 'muted' : 'unmuted'}`);
    return newMute;
  } catch {
    return false;
  }
};

/**
 * Get current mute state
 */
export const getMuteState = (): boolean => {
  return isMuted();
};

/**
 * Play sound for booking status changes
 * Maps booking statuses to appropriate sound types
 */
export const playBookingStatusSound = (
  status: string,
  userType: 'customer' | 'therapist'
): void => {
  const soundMap: Record<string, { type: SoundType; playFor: 'customer' | 'therapist' | 'both' }> = {
    'waiting_for_location': { type: 'warning', playFor: 'customer' },
    'location_shared': { type: 'info', playFor: 'both' },
    'therapist_accepted': { type: 'success', playFor: 'customer' },
    'on_the_way': { type: 'success', playFor: 'customer' },
    'cancelled_no_location': { type: 'error', playFor: 'customer' },
    'rejected_location': { type: 'error', playFor: 'both' },
    'cancelled_by_user': { type: 'info', playFor: 'therapist' },
    'cancelled_by_admin': { type: 'critical', playFor: 'both' },
    'completed': { type: 'success', playFor: 'both' }
  };

  const soundConfig = soundMap[status];
  
  if (!soundConfig) {
    return;
  }

  // Check if sound should play for this user type
  if (soundConfig.playFor === 'both' || soundConfig.playFor === userType) {
    playSound(soundConfig.type, `booking_${status}`);
  }
};
