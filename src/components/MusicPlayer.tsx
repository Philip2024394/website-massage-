import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

interface MusicPlayerProps {
  autoPlay?: boolean;
  audioSrc?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  autoPlay = true, 
  audioSrc = '/sounds/booking-notification.mp3' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Check if music has already played during this session
    const hasPlayed = sessionStorage.getItem('musicHasPlayed');
    
    if (autoPlay && !hasPlayed && audioRef.current) {
      // Attempt to auto-play (browsers may block this without user interaction)
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            sessionStorage.setItem('musicHasPlayed', 'true');
          })
          .catch((error) => {
            console.log('Auto-play was prevented:', error);
            // Auto-play was prevented, user needs to interact first
          });
      }
    }
  }, [autoPlay]);

  const toggleMusic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            sessionStorage.setItem('musicHasPlayed', 'true');
          })
          .catch((error) => {
            console.error('Failed to play audio:', error);
          });
      }
    }
  };

  return (
    <div 
      className="music-player-container" 
      onClick={toggleMusic}
      title={isPlaying ? 'Click to pause music' : 'Click to play music'}
    >
      <div className={`music-bar bar1 ${isPlaying ? 'playing' : ''}`}></div>
      <div className={`music-bar bar2 ${isPlaying ? 'playing' : ''}`}></div>
      <div className={`music-bar bar3 ${isPlaying ? 'playing' : ''}`}></div>
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        preload="auto"
      />
    </div>
  );
};

export default MusicPlayer;
