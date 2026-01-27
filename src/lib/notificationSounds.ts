// Unified notification sound utility
// Provides lightweight abstraction to play short MP3/WAV sounds for booking lifecycle events.
// Uses in-memory Audio objects; falls back silently if browser blocks autoplay.

type SoundKey = 'bookingCreated' | 'bookingAccepted' | 'bookingDeclined' | 'bookingBroadcast' | 'reminderPing';

// Base64 tiny beep placeholders (replace with real hosted mp3 paths later)
const SOUND_MAP: Record<SoundKey, string> = {
  bookingCreated: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==',
  bookingAccepted: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==',
  bookingDeclined: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==',
  bookingBroadcast: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==',
  reminderPing: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ=='
};

const cache: Partial<Record<SoundKey, HTMLAudioElement>> = {};

export function playSound(key: SoundKey, volume = 0.6) {
  try {
    let audio = cache[key];
    if (!audio) {
      audio = new Audio(SOUND_MAP[key]);
      audio.volume = volume;
      cache[key] = audio;
    } else {
      audio.currentTime = 0; // rewind for immediate replay
    }
    void audio.play().catch(() => {/* autoplay block ignored */});
  } catch (e) {
    // Silent fail
    console.warn('Sound play failed', key, e);
  }
}

// Sequenced notification (e.g., broadcast chain)
export async function playSequence(keys: SoundKey[], gapMs = 250) {
  for (const k of keys) {
    playSound(k);
    await new Promise(r => setTimeout(r, gapMs));
  }
}

// Periodic reminder (caller is responsible for clearing interval)
export function startReminder(intervalMs = 15000) {
  return setInterval(() => playSound('reminderPing', 0.4), intervalMs);
}

export function stopReminder(id: number) {
  clearInterval(id);
}
