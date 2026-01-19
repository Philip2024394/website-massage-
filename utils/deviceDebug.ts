/**
 * Device Debug Utilities
 * Comprehensive device information logging and debugging tools
 */

export interface DeviceDebugInfo {
  // Window/Viewport
  windowWidth: number;
  windowHeight: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  
  // Viewport units
  viewportWidth: string;
  viewportHeight: string;
  vhUnit: string;
  vwUnit: string;
  
  // Device capabilities
  touchSupport: boolean;
  maxTouchPoints: number;
  hoverSupport: boolean;
  pointerSupport: boolean;
  
  // User agent info
  userAgent: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
  
  // CSS support
  supportsViewportUnits: boolean;
  supportsSafeArea: boolean;
  supportsGrid: boolean;
  supportsFlex: boolean;
  
  // Mobile-specific
  orientation: string;
  orientationAngle: number;
  isStandalone: boolean;
  visualViewport?: {
    width: number;
    height: number;
    offsetLeft: number;
    offsetTop: number;
    scale: number;
  };
}

/**
 * Get comprehensive device information
 */
export function getDeviceDebugInfo(): DeviceDebugInfo {
  const info: DeviceDebugInfo = {
    // Window/Viewport
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    
    // Viewport units (calculated)
    viewportWidth: `${window.innerWidth}px`,
    viewportHeight: `${window.innerHeight}px`,
    vhUnit: `${window.innerHeight / 100}px`,
    vwUnit: `${window.innerWidth / 100}px`,
    
    // Device capabilities
    touchSupport: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hoverSupport: window.matchMedia('(hover: hover)').matches,
    pointerSupport: 'PointerEvent' in window,
    
    // User agent info
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    
    // CSS support
    supportsViewportUnits: CSS.supports('height', '100vh'),
    supportsSafeArea: CSS.supports('padding', 'env(safe-area-inset-top)'),
    supportsGrid: CSS.supports('display', 'grid'),
    supportsFlex: CSS.supports('display', 'flex'),
    
    // Mobile-specific
    orientation: screen.orientation?.type || 'unknown',
    orientationAngle: screen.orientation?.angle || window.orientation || 0,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches
  };
  
  // Visual Viewport API (modern browsers)
  if ('visualViewport' in window && window.visualViewport) {
    const vp = window.visualViewport;
    info.visualViewport = {
      width: vp.width,
      height: vp.height,
      offsetLeft: vp.offsetLeft,
      offsetTop: vp.offsetTop,
      scale: vp.scale
    };
  }
  
  return info;
}

/**
 * Log comprehensive device debug information to console
 */
export function logDeviceDebugInfo(label: string = '📱 Device Debug Info'): DeviceDebugInfo {
  const info = getDeviceDebugInfo();
  
  console.group(`🔍 ${label}`);
  
  // Basic device info
  console.log('📏 Dimensions:', {
    window: `${info.windowWidth}×${info.windowHeight}`,
    screen: `${info.screenWidth}×${info.screenHeight}`,
    pixelRatio: info.devicePixelRatio,
    orientation: info.orientation,
    angle: info.orientationAngle
  });
  
  // Viewport units
  console.log('📐 Viewport Units:', {
    '1vh': info.vhUnit,
    '1vw': info.vwUnit,
    viewportSize: `${info.viewportWidth} × ${info.viewportHeight}`
  });
  
  // Capabilities
  console.log('👆 Capabilities:', {
    touch: info.touchSupport,
    maxTouchPoints: info.maxTouchPoints,
    hover: info.hoverSupport,
    pointer: info.pointerSupport,
    standalone: info.isStandalone
  });
  
  // CSS Support
  console.log('🎨 CSS Support:', {
    viewportUnits: info.supportsViewportUnits,
    safeArea: info.supportsSafeArea,
    grid: info.supportsGrid,
    flex: info.supportsFlex
  });
  
  // Visual Viewport (if available)
  if (info.visualViewport) {
    console.log('👁️ Visual Viewport:', info.visualViewport);
  }
  
  // Enhanced detection
  if (info.enhancedDetection) {
    console.log('🔬 Enhanced Detection:', {
      mobile: info.enhancedDetection.isMobile,
      mobileUA: info.enhancedDetection.isMobileUA,
      android: info.enhancedDetection.isAndroid,
      iOS: info.enhancedDetection.isIOS,
      browser: {
        safari: info.enhancedDetection.isSafari,
        chrome: info.enhancedDetection.isChrome,
        firefox: info.enhancedDetection.isFirefox
      },
      viewport: {
        small: info.enhancedDetection.isSmallViewport,
        medium: info.enhancedDetection.isMediumViewport,
        large: info.enhancedDetection.isLargeViewport
      },
      retina: info.enhancedDetection.isRetinaDisplay
    });
  }
  
  // System info
  console.log('💻 System:', {
    platform: info.platform,
    language: info.language,
    online: info.onlineStatus,
    cookies: info.cookieEnabled,
    userAgent: info.userAgent
  });
  
  console.groupEnd();
  
  return info;
}

/**
 * Quick debug function - logs basic device info
 */
export function quickDeviceDebug(): void {
  console.log('📱 Quick Device Debug:', {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent,
    touchSupport: 'ontouchstart' in window,
  });
}

/**
 * Monitor viewport changes and log debug info
 */
export function startViewportMonitoring(): () => void {
  console.log('👁️ Starting viewport monitoring...');
  
  const logChange = (event: string) => {
    console.log(`📐 ${event} - Viewport changed:`, {
      window: `${window.innerWidth}×${window.innerHeight}`,
      screen: `${screen.width}×${screen.height}`,
      orientation: screen.orientation?.type || 'unknown',
      timestamp: new Date().toLocaleTimeString()
    });
  };
  
  const handleResize = () => logChange('Resize');
  const handleOrientationChange = () => {
    // Delay to let orientation settle
    setTimeout(() => logChange('Orientation Change'), 100);
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Visual Viewport monitoring (if supported)
  let visualViewportHandler: (() => void) | undefined;
  if ('visualViewport' in window && window.visualViewport) {
    visualViewportHandler = () => {
      const vp = window.visualViewport!;
      console.log('👁️ Visual Viewport changed:', {
        size: `${vp.width}×${vp.height}`,
        offset: `${vp.offsetLeft},${vp.offsetTop}`,
        scale: vp.scale,
        timestamp: new Date().toLocaleTimeString()
      });
    };
    
    window.visualViewport.addEventListener('resize', visualViewportHandler);
    window.visualViewport.addEventListener('scroll', visualViewportHandler);
  }
  
  // Return cleanup function
  return () => {
    console.log('🛑 Stopping viewport monitoring...');
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
    
    if (visualViewportHandler && 'visualViewport' in window && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', visualViewportHandler);
      window.visualViewport.removeEventListener('scroll', visualViewportHandler);
    }
  };
}

/**
 * Create debug overlay showing live device info
 */
export function createDebugOverlay(): () => void {
  const overlay = document.createElement('div');
  overlay.id = 'device-debug-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 300px;
    word-break: break-all;
  `;
  
  const updateOverlay = () => {
    const info = getDeviceDebugInfo();
    overlay.innerHTML = `
      <div><strong>📱 Device Debug</strong></div>
      <div>Window: ${info.windowWidth}×${info.windowHeight}</div>
      <div>Screen: ${info.screenWidth}×${info.screenHeight}</div>
      <div>Ratio: ${info.devicePixelRatio}</div>
      <div>Touch: ${info.touchSupport ? '✅' : '❌'}</div>
      <div>Hover: ${info.hoverSupport ? '✅' : '❌'}</div>
      <div>Orientation: ${info.orientation}</div>
      ${info.visualViewport ? `<div>VV: ${info.visualViewport.width}×${info.visualViewport.height}</div>` : ''}
      <div style="margin-top: 5px; font-size: 10px; opacity: 0.7;">
        ${new Date().toLocaleTimeString()}
      </div>
    `;
  };
  
  updateOverlay();
  document.body.appendChild(overlay);
  
  // Update every 500ms
  const interval = setInterval(updateOverlay, 500);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };
}

// Export the original debug function for backward compatibility
export const debugDeviceInfo = quickDeviceDebug;

// Global debug functions (for console access)
if (typeof window !== 'undefined') {
  (window as any).debugDevice = {
    log: logDeviceDebugInfo,
    quick: quickDeviceDebug,
    monitor: startViewportMonitoring,
    overlay: createDebugOverlay,
    info: getDeviceDebugInfo
  };
  
  console.log('🔍 Device debug tools available: window.debugDevice');
}