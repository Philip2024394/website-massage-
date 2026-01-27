import { useCallback } from 'react';

// Type declaration for legacy webkit audio context
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const useBookingAudio = () => {
  const playNotification = useCallback(async () => {
    try {
      const audio = new Audio('/sounds/booking-notification.mp3');
      audio.volume = 0.7;
      await audio.play();
    } catch (error) {
      console.log('Main audio failed, trying fallback:', error);
      // Fallback to a generated beep sound
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }
      } catch (fallbackError) {
        console.log('Fallback audio also failed:', fallbackError);
      }
    }
  }, []);

  const playSuccess = useCallback(async () => {
    try {
      const audio = new Audio('/sounds/booking-notification.mp3');
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.log('Success audio failed:', error);
      // Generate a success sound
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          const oscillator1 = audioContext.createOscillator();
          const oscillator2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator1.start(audioContext.currentTime);
          oscillator2.start(audioContext.currentTime);
          oscillator1.stop(audioContext.currentTime + 0.5);
          oscillator2.stop(audioContext.currentTime + 0.5);
        }
      } catch (fallbackError) {
        console.log('Success fallback audio also failed:', fallbackError);
      }
    }
  }, []);

  const playError = useCallback(async () => {
    try {
      const audio = new Audio('/sounds/booking-notification.mp3');
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.log('Error audio failed:', error);
      // Generate an error sound
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
          
          // Second beep
          setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.setValueAtTime(220, audioContext.currentTime);
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.2);
          }, 300);
        }
      } catch (fallbackError) {
        console.log('Error fallback audio also failed:', fallbackError);
      }
    }
  }, []);

  return {
    playNotification,
    playSuccess,
    playError
  };
};

export default useBookingAudio;