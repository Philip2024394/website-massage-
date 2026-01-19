/**
 * Mobile Viewport Lock Hook
 * Dynamically locks viewport height on mobile devices
 * Prevents mobile browser UI from affecting layout
 */
import { useEffect } from 'react';

export function useMobileLock() {
  useEffect(() => {
    // Lock viewport height on mobile to prevent browser UI interference
    const lockHeight = () => {
      const vh = window.innerHeight;
      document.documentElement.style.height = `${vh}px`;
      document.body.style.height = `${vh}px`;
      
      // Set CSS custom property for vh units that respect browser UI
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
      
      console.log(`🔒 Mobile viewport locked to ${vh}px`);
    };
    
    // Initial lock
    lockHeight();
    
    // Re-lock on resize and orientation changes
    window.addEventListener('resize', lockHeight);
    window.addEventListener('orientationchange', lockHeight);
    
    // iOS Safari specific - handle visual viewport changes
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', lockHeight);
    }
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('resize', lockHeight);
      window.removeEventListener('orientationchange', lockHeight);
      
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', lockHeight);
      }
    };
  }, []);
}