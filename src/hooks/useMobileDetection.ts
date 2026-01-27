import { useState, useEffect } from 'react';
import { isMobile, isTablet, isBrowser, isDesktop, browserName, osName } from 'react-device-detect';
import { useMediaQuery } from 'react-responsive';
import { logDeviceDebugInfo } from '../utils/deviceDebug';

interface MobileDetectionState {
  // Device type detection
  isMobileDevice: boolean;
  isTabletDevice: boolean;
  isDesktopDevice: boolean;
  isTouchDevice: boolean;
  
  // Screen size detection
  isMobileScreen: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  
  // Orientation detection
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Device capabilities
  hasTouch: boolean;
  hasHover: boolean;
  supportsViewportUnits: boolean;
  
  // Device info
  deviceInfo: {
    browser: string;
    os: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
  };
  
  // Debug methods
  debug: {
    log: (label?: string) => void;
    logOnChange: boolean;
    setLogOnChange: (enabled: boolean) => void;
  };
}

export function useMobileDetection(): MobileDetectionState {
  // Media query hooks for responsive breakpoints (using query strings for react-responsive)
  const isMobileScreen = useMediaQuery({ query: '(max-width: 768px)' });
  const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });
  const isMediumScreen = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1024px)' });
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1025px)' });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });
  const hasHover = useMediaQuery({ query: '(hover: hover)' });
  
  // Debug state
  const [logOnChange, setLogOnChange] = useState(false);
  
  const [deviceState, setDeviceState] = useState<MobileDetectionState>(() => ({
    // Device type detection (from react-device-detect)
    isMobileDevice: isMobile,
    isTabletDevice: isTablet,
    isDesktopDevice: isDesktop,
    isTouchDevice: 'ontouchstart' in window,
    
    // Screen size detection (from react-responsive)
    isMobileScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Device capabilities
    hasTouch: 'ontouchstart' in window,
    hasHover,
    supportsViewportUnits: CSS.supports('height', '100vh'),
    
    // Device info
    deviceInfo: {
      browser: browserName,
      os: osName,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    },
    
    // Debug methods
    debug: {
      log: (label?: string) => logDeviceDebugInfo(label),
      logOnChange,
      setLogOnChange
    }
  }));

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceState(prev => ({
        ...prev,
        isMobileScreen,
        isSmallScreen,
        isMediumScreen,
        isLargeScreen,
        isPortrait,
        isLandscape,
        hasHover,
        deviceInfo: {
          ...prev.deviceInfo,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        },
        debug: {
          ...prev.debug,
          logOnChange,
          setLogOnChange
        }
      }));
      
      // Auto-log on changes if enabled
      if (logOnChange) {
        logDeviceDebugInfo('📱 Device State Changed');
      }
    };

    // Update on resize and orientation change
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Apply mobile-specific body classes
    const applyMobileClasses = () => {
      const body = document.body;
      
      // Remove all mobile classes first
      body.classList.remove(
        'mobile-device', 'tablet-device', 'desktop-device',
        'mobile-screen', 'small-screen', 'medium-screen', 'large-screen',
        'portrait', 'landscape', 'has-touch', 'has-hover'
      );
      
      // Apply current device classes
      if (isMobile) body.classList.add('mobile-device');
      if (isTablet) body.classList.add('tablet-device');
      if (isDesktop) body.classList.add('desktop-device');
      
      if (isMobileScreen) body.classList.add('mobile-screen');
      if (isSmallScreen) body.classList.add('small-screen');
      if (isMediumScreen) body.classList.add('medium-screen');
      if (isLargeScreen) body.classList.add('large-screen');
      
      if (isPortrait) body.classList.add('portrait');
      if (isLandscape) body.classList.add('landscape');
      
      if ('ontouchstart' in window) body.classList.add('has-touch');
      if (hasHover) body.classList.add('has-hover');
      
      // Apply mobile lock if needed
      if (isMobileScreen || isMobile) {
        body.classList.add('mobile-lock');
        console.log('🔒 Mobile lock applied:', { isMobileScreen, isMobile });
      } else {
        body.classList.remove('mobile-lock');
      }
    };

    applyMobileClasses();
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, [isMobileScreen, isSmallScreen, isMediumScreen, isLargeScreen, isPortrait, isLandscape, hasHover, logOnChange]);

  return deviceState;
}

// Utility function for conditional rendering based on device
export function isMobileContext(): boolean {
  return isMobile || window.innerWidth <= 768;
}

// Utility function for getting device-specific CSS classes
export function getDeviceClasses(): string {
  const classes = [];
  
  if (isMobile) classes.push('mobile-device');
  if (isTablet) classes.push('tablet-device');
  if (isDesktop) classes.push('desktop-device');
  if (isBrowser) classes.push('browser');
  
  return classes.join(' ');
}

// Enhanced mobile detection with user agent fallback
export function getEnhancedMobileDetection() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  return {
    // Primary detection (react-device-detect)
    isMobile,
    isTablet,
    isDesktop,
    
    // Fallback detection
    isMobileUA: /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
    isAndroid: /android/i.test(userAgent),
    isIOS: /iphone|ipad|ipod/i.test(userAgent),
    isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
    isChrome: /chrome/i.test(userAgent),
    isFirefox: /firefox/i.test(userAgent),
    
    // Screen characteristics
    isSmallViewport: window.innerWidth <= 480,
    isMediumViewport: window.innerWidth > 480 && window.innerWidth <= 768,
    isLargeViewport: window.innerWidth > 768,
    
    // Touch capabilities
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Device pixel ratio
    isRetinaDisplay: window.devicePixelRatio > 1.5
  };
}