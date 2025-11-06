/**
 * Comprehensive Device Detection & Optimization Service
 * Provides device-specific features and optimizations for all platforms
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'samsung' | 'opera' | 'unknown';
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  isHighDPI: boolean;
  supportsGPS: boolean;
  supportsCamera: boolean;
  supportsPWA: boolean;
  connectionType: 'slow' | 'fast' | 'unknown';
  isOnline: boolean;
}

export interface DeviceOptimizations {
  imageQuality: 'low' | 'medium' | 'high';
  animationLevel: 'none' | 'reduced' | 'full';
  preloadStrategy: 'none' | 'minimal' | 'aggressive';
  renderingMode: 'simple' | 'enhanced';
  locationAccuracy: 'low' | 'medium' | 'high';
  cacheStrategy: 'minimal' | 'standard' | 'aggressive';
}

class DeviceService {
  private static instance: DeviceService;
  private deviceInfo: DeviceInfo | null = null;
  private optimizations: DeviceOptimizations | null = null;

  public static getInstance(): DeviceService {
    if (!DeviceService.instance) {
      DeviceService.instance = new DeviceService();
    }
    return DeviceService.instance;
  }

  /**
   * Get comprehensive device information
   */
  public getDeviceInfo(): DeviceInfo {
    if (this.deviceInfo) return this.deviceInfo;

    this.deviceInfo = {
      type: this.detectDeviceType(),
      platform: this.detectPlatform(),
      browser: this.detectBrowser(),
      screenSize: this.detectScreenSize(),
      orientation: this.getOrientation(),
      hasTouch: this.hasTouchSupport(),
      isHighDPI: this.isHighDPI(),
      supportsGPS: this.supportsGPS(),
      supportsCamera: this.supportsCamera(),
      supportsPWA: this.supportsPWA(),
      connectionType: this.getConnectionType(),
      isOnline: navigator.onLine
    };

    return this.deviceInfo;
  }

  /**
   * Get device-specific optimizations
   */
  public getOptimizations(): DeviceOptimizations {
    if (this.optimizations) return this.optimizations;

    const device = this.getDeviceInfo();
    
    this.optimizations = {
      imageQuality: this.getOptimalImageQuality(device),
      animationLevel: this.getOptimalAnimationLevel(device),
      preloadStrategy: this.getOptimalPreloadStrategy(device),
      renderingMode: this.getOptimalRenderingMode(device),
      locationAccuracy: this.getOptimalLocationAccuracy(device),
      cacheStrategy: this.getOptimalCacheStrategy(device)
    };

    return this.optimizations;
  }

  /**
   * Device Type Detection
   */
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;

    // Mobile devices
    if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return screenWidth < 768 ? 'mobile' : 'tablet';
    }

    // iPad detection (tablets)
    if (/ipad/i.test(userAgent) || (userAgent.includes('mac') && 'ontouchend' in document)) {
      return 'tablet';
    }

    // Screen size based detection
    if (screenWidth < 768) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Platform Detection
   */
  private detectPlatform(): 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (userAgent.includes('android')) return 'android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (userAgent.includes('win') || platform.includes('win')) return 'windows';
    if (userAgent.includes('mac') || platform.includes('mac')) return 'macos';
    if (userAgent.includes('linux') || platform.includes('linux')) return 'linux';
    return 'unknown';
  }

  /**
   * Browser Detection
   */
  private detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'samsung' | 'opera' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('samsungbrowser')) return 'samsung';
    if (userAgent.includes('opera') || userAgent.includes('opr')) return 'opera';
    if (userAgent.includes('edg')) return 'edge';
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    return 'unknown';
  }

  /**
   * Screen Size Classification
   */
  private detectScreenSize(): 'small' | 'medium' | 'large' | 'xlarge' {
    const width = window.innerWidth;
    if (width < 640) return 'small';
    if (width < 1024) return 'medium';
    if (width < 1280) return 'large';
    return 'xlarge';
  }

  /**
   * Device Orientation
   */
  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Touch Support Detection
   */
  private hasTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * High DPI Display Detection
   */
  private isHighDPI(): boolean {
    return window.devicePixelRatio > 1.5;
  }

  /**
   * GPS Support Detection
   */
  private supportsGPS(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Camera Support Detection
   */
  private supportsCamera(): boolean {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }

  /**
   * PWA Support Detection
   */
  private supportsPWA(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Connection Speed Detection
   */
  private getConnectionType(): 'slow' | 'fast' | 'unknown' {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
      if (effectiveType === '3g' || effectiveType === '4g') return 'fast';
    }
    
    return 'unknown';
  }

  /**
   * Optimization Strategies
   */
  private getOptimalImageQuality(device: DeviceInfo): 'low' | 'medium' | 'high' {
    if (device.connectionType === 'slow') return 'low';
    if (device.type === 'mobile' && !device.isHighDPI) return 'medium';
    return 'high';
  }

  private getOptimalAnimationLevel(device: DeviceInfo): 'none' | 'reduced' | 'full' {
    if (device.type === 'mobile' && device.connectionType === 'slow') return 'reduced';
    if (device.platform === 'android' && device.type === 'mobile') return 'reduced';
    return 'full';
  }

  private getOptimalPreloadStrategy(device: DeviceInfo): 'none' | 'minimal' | 'aggressive' {
    if (device.connectionType === 'slow') return 'none';
    if (device.type === 'mobile') return 'minimal';
    return 'aggressive';
  }

  private getOptimalRenderingMode(device: DeviceInfo): 'simple' | 'enhanced' {
    if (device.type === 'mobile' && device.connectionType === 'slow') return 'simple';
    return 'enhanced';
  }

  private getOptimalLocationAccuracy(device: DeviceInfo): 'low' | 'medium' | 'high' {
    if (!device.supportsGPS) return 'low';
    if (device.platform === 'android') return 'high';
    if (device.type === 'mobile') return 'medium';
    return 'low';
  }

  private getOptimalCacheStrategy(device: DeviceInfo): 'minimal' | 'standard' | 'aggressive' {
    if (device.type === 'mobile') return 'standard';
    if (device.type === 'desktop') return 'aggressive';
    return 'standard';
  }

  /**
   * Android-Specific Optimizations
   */
  public getAndroidOptimizations(): Record<string, any> {
    const device = this.getDeviceInfo();
    if (device.platform !== 'android') return {};

    return {
      gps: {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      },
      performance: {
        reduceAnimations: device.type === 'mobile',
        optimizeImages: true,
        enableHardwareAcceleration: true
      },
      ui: {
        largerTouchTargets: true,
        reducedMotion: device.connectionType === 'slow',
        adaptiveLoading: true
      }
    };
  }

  /**
   * iOS-Specific Optimizations
   */
  public getIOSOptimizations(): Record<string, any> {
    const device = this.getDeviceInfo();
    if (device.platform !== 'ios') return {};

    return {
      safari: {
        preventZoom: true,
        optimizeScrolling: true,
        handleViewportChanges: true
      },
      performance: {
        limitParallax: true,
        optimizeAnimations: true,
        manageMemory: true
      }
    };
  }

  /**
   * Real-time Device Monitoring
   */
  public setupDeviceMonitoring(): void {
    // Monitor orientation changes
    window.addEventListener('orientationchange', () => {
      this.deviceInfo = null; // Reset cache
      this.optimizations = null;
      this.notifyDeviceChange('orientation');
    });

    // Monitor network changes
    window.addEventListener('online', () => {
      this.notifyDeviceChange('network');
    });

    window.addEventListener('offline', () => {
      this.notifyDeviceChange('network');
    });

    // Monitor resize changes
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.deviceInfo = null; // Reset cache
        this.optimizations = null;
        this.notifyDeviceChange('screen');
      }, 250);
    });
  }

  /**
   * Device Change Notifications
   */
  private notifyDeviceChange(type: 'orientation' | 'network' | 'screen'): void {
    window.dispatchEvent(new CustomEvent('devicechange', {
      detail: { type, deviceInfo: this.getDeviceInfo() }
    }));
  }

  /**
   * Performance Metrics
   */
  public getPerformanceMetrics(): Record<string, any> {
    const device = this.getDeviceInfo();
    
    return {
      device: device.type,
      platform: device.platform,
      browser: device.browser,
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576)
      } : null,
      connection: device.connectionType,
      online: device.isOnline,
      timestamp: Date.now()
    };
  }

  /**
   * Device-Specific CSS Classes
   */
  public getDeviceCSSClasses(): string[] {
    const device = this.getDeviceInfo();
    const optimizations = this.getOptimizations();
    
    const classes = [
      `device-${device.type}`,
      `platform-${device.platform}`,
      `browser-${device.browser}`,
      `screen-${device.screenSize}`,
      `orientation-${device.orientation}`,
      `quality-${optimizations.imageQuality}`,
      `animations-${optimizations.animationLevel}`,
      `rendering-${optimizations.renderingMode}`
    ];

    if (device.hasTouch) classes.push('has-touch');
    if (device.isHighDPI) classes.push('high-dpi');
    if (device.supportsGPS) classes.push('has-gps');
    if (device.supportsCamera) classes.push('has-camera');
    if (device.supportsPWA) classes.push('pwa-capable');
    if (!device.isOnline) classes.push('offline');

    return classes;
  }
}

// Export singleton instance
export const deviceService = DeviceService.getInstance();

// Setup automatic monitoring
if (typeof window !== 'undefined') {
  deviceService.setupDeviceMonitoring();
}