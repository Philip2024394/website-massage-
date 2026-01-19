/**
 * Prevent Scroll Hook
 * Prevents unwanted scrolling on mobile devices
 * Allows specific elements with 'scrollable' class to remain scrollable
 */
import { useEffect } from 'react';

export function usePreventScroll() {
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      // Allow scrolling on elements with 'scrollable' class
      if ((e.target as Element)?.classList?.contains('scrollable')) {
        return;
      }
      
      // Prevent default touch behavior on all other elements
      e.preventDefault();
    };
    
    // Prevent touchmove on non-scrollable elements
    // passive: false allows us to call preventDefault
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    console.log('🚫 Scroll prevention enabled (except .scrollable elements)');
    
    return () => {
      document.removeEventListener('touchmove', preventDefault);
      console.log('✅ Scroll prevention cleaned up');
    };
  }, []);
}