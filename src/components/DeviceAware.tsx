/**
 * Device-Aware Component HOC
 * Automatically applies device-specific optimizations to React components
 */

import React, { useEffect, useState } from 'react';
import { deviceService, DeviceInfo, DeviceOptimizations } from '../services/deviceService';

interface DeviceAwareProps {
  device: DeviceInfo;
  optimizations: DeviceOptimizations;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  isOnline: boolean;
  cssClasses: string[];
}

/**
 * HOC to make any component device-aware
 */
export function withDeviceAwareness<P extends object>(
  WrappedComponent: React.ComponentType<P & DeviceAwareProps>
) {
  return function DeviceAwareComponent(props: P) {
    const [device, setDevice] = useState<DeviceInfo>(deviceService.getDeviceInfo());
    const [optimizations, setOptimizations] = useState<DeviceOptimizations>(
      deviceService.getOptimizations()
    );

    useEffect(() => {
      const handleDeviceChange = () => {
        setDevice(deviceService.getDeviceInfo());
        setOptimizations(deviceService.getOptimizations());
      };

      window.addEventListener('devicechange', handleDeviceChange);
      return () => window.removeEventListener('devicechange', handleDeviceChange);
    }, []);

    const deviceProps: DeviceAwareProps = {
      device,
      optimizations,
      isAndroid: device.platform === 'android',
      isIOS: device.platform === 'ios',
      isMobile: device.type === 'mobile',
      isTablet: device.type === 'tablet',
      isDesktop: device.type === 'desktop',
      hasTouch: device.hasTouch,
      isOnline: device.isOnline,
      cssClasses: deviceService.getDeviceCSSClasses()
    };

    return <WrappedComponent {...props} {...deviceProps} />;
  };
}

/**
 * Hook for device information in functional components
 */
export function useDevice() {
  const [device, setDevice] = useState<DeviceInfo>(deviceService.getDeviceInfo());
  const [optimizations, setOptimizations] = useState<DeviceOptimizations>(
    deviceService.getOptimizations()
  );

  useEffect(() => {
    const handleDeviceChange = () => {
      setDevice(deviceService.getDeviceInfo());
      setOptimizations(deviceService.getOptimizations());
    };

    window.addEventListener('devicechange', handleDeviceChange);
    return () => window.removeEventListener('devicechange', handleDeviceChange);
  }, []);

  return {
    device,
    optimizations,
    isAndroid: device.platform === 'android',
    isIOS: device.platform === 'ios',
    isMobile: device.type === 'mobile',
    isTablet: device.type === 'tablet',
    isDesktop: device.type === 'desktop',
    hasTouch: device.hasTouch,
    isOnline: device.isOnline,
    cssClasses: deviceService.getDeviceCSSClasses(),
    androidOptimizations: deviceService.getAndroidOptimizations(),
    iosOptimizations: deviceService.getIOSOptimizations(),
    performanceMetrics: deviceService.getPerformanceMetrics()
  };
}

/**
 * Device-specific CSS injection component
 */
export const DeviceStylesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cssClasses, device, optimizations } = useDevice();

  useEffect(() => {
    // Apply device classes to body
    document.body.className = document.body.className
      .replace(/device-\w+|platform-\w+|browser-\w+|screen-\w+|orientation-\w+/g, '')
      .trim();
    
    document.body.classList.add(...cssClasses);

    // Apply device-specific CSS variables
    const root = document.documentElement;
    root.style.setProperty('--device-type', device.type);
    root.style.setProperty('--screen-size', device.screenSize);
    root.style.setProperty('--animation-level', optimizations.animationLevel);
    root.style.setProperty('--image-quality', optimizations.imageQuality);

    // Cleanup on unmount
    return () => {
      cssClasses.forEach(cls => document.body.classList.remove(cls));
    };
  }, [cssClasses, device, optimizations]);

  return <>{children}</>;
};

/**
 * Conditional rendering based on device type
 */
export const DeviceOnly: React.FC<{
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  android?: React.ReactNode;
  ios?: React.ReactNode;
  online?: React.ReactNode;
  offline?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ mobile, tablet, desktop, android, ios, online, offline, children }) => {
  const { device } = useDevice();

  // Platform-specific rendering
  if (android && device.platform === 'android') return <>{android}</>;
  if (ios && device.platform === 'ios') return <>{ios}</>;

  // Device type rendering
  if (mobile && device.type === 'mobile') return <>{mobile}</>;
  if (tablet && device.type === 'tablet') return <>{tablet}</>;
  if (desktop && device.type === 'desktop') return <>{desktop}</>;

  // Connection-specific rendering
  if (online && device.isOnline) return <>{online}</>;
  if (offline && !device.isOnline) return <>{offline}</>;

  // Default fallback
  return <>{children}</>;
};

/**
 * Performance-aware image component
 */
export const DeviceImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
  mediumQualitySrc?: string;
  highQualitySrc?: string;
}> = ({ src, alt, className, lowQualitySrc, mediumQualitySrc, highQualitySrc }) => {
  const { optimizations, device } = useDevice();

  const getSrc = () => {
    switch (optimizations.imageQuality) {
      case 'low':
        return lowQualitySrc || src;
      case 'medium':
        return mediumQualitySrc || src;
      case 'high':
        return highQualitySrc || src;
      default:
        return src;
    }
  };

  const getLoading = () => {
    return optimizations.preloadStrategy === 'none' ? 'lazy' : 'eager';
  };

  return (
    <img
      src={getSrc()}
      alt={alt}
      className={className}
      loading={getLoading()}
      decoding={device.type === 'desktop' ? 'sync' : 'async'}
    />
  );
};

/**
 * Touch-optimized button component
 */
export const DeviceButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  const { hasTouch, device } = useDevice();

  const touchClasses = hasTouch
    ? 'min-h-[44px] min-w-[44px] active:scale-95 touch-manipulation'
    : 'hover:scale-105';

  const sizeClasses = device.type === 'mobile' ? 'text-base py-3 px-4' : 'text-sm py-2 px-3';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${touchClasses}
        ${sizeClasses}
        ${className}
        transition-transform duration-150
        disabled:opacity-50 disabled:transform-none
      `}
    >
      {children}
    </button>
  );
};

/**
 * Adaptive loading component
 */
export const AdaptiveLoader: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}> = ({ loading, children, skeleton }) => {
  const { optimizations } = useDevice();

  if (!loading) return <>{children}</>;

  // Show skeleton on fast connections, simple spinner on slow
  if (optimizations.preloadStrategy === 'aggressive' && skeleton) {
    return <>{skeleton}</>;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
};

export default {
  withDeviceAwareness,
  useDevice,
  DeviceStylesProvider,
  DeviceOnly,
  DeviceImage,
  DeviceButton,
  AdaptiveLoader
};