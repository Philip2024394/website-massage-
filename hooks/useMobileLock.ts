/**
 * Mobile Viewport Lock Hook
 * Dynamically locks viewport height on mobile devices
 * Prevents mobile browser UI from affecting layout
 */
import { useEffect } from 'react';

export function useMobileLock() {
  useEffect(() => {
    // Check if this is a page that needs scrolling (landing or home page)
    const isScrollablePage = window.location.pathname === '/' || 
                            window.location.hash === '' || 
                            window.location.hash === '#/' ||
                            window.location.pathname === '/home' ||
                            window.location.hash === '#/home';
    
    if (isScrollablePage) {
      // For scrollable pages, ONLY add the body class and set CSS custom property
      // DO NOT lock height or add any viewport restrictions
      const pageClass = window.location.pathname === '/' || window.location.hash === '' || window.location.hash === '#/' ? 'landing-page' : 'home-page';
      document.body.classList.add(pageClass);
      
      // Only set CSS custom property for responsive units
      const setVhProperty = () => {
        const vh = window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
        
        // Ensure scrolling is enabled
        document.documentElement.style.removeProperty('height');
        document.body.style.removeProperty('height');
        document.documentElement.style.overflow = 'visible';
        document.body.style.overflow = 'visible';
        
        console.log(`📱 Mobile scrolling enabled for ${pageClass} - vh: ${vh}px`);
      };
      
      setVhProperty();
      window.addEventListener('resize', setVhProperty);
      window.addEventListener('orientationchange', setVhProperty);
      
      if ('visualViewport' in window) {
        window.visualViewport?.addEventListener('resize', setVhProperty);
      }
      
      return () => {
        document.body.classList.remove(pageClass);
        window.removeEventListener('resize', setVhProperty);
        window.removeEventListener('orientationchange', setVhProperty);
        
        if ('visualViewport' in window) {
          window.visualViewport?.removeEventListener('resize', setVhProperty);
        }
      };
    }
    
    // For other pages, use original mobile lock behavior
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