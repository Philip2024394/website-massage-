/**
 * 🚀 LAZY IMAGE COMPONENT
 * ============================================================================
 * Optimized for Indonesia network conditions (3G/weak 4G)
 * 
 * Features:
 * - Intersection Observer (loads when visible)
 * - Blur-up placeholder
 * - Progressive loading
 * - Low-quality placeholder (LQIP)
 * - Retry mechanism for failed loads
 * - Bandwidth-aware loading
 * 
 * Usage:
 * ```tsx
 * <LazyImage
 *   src="https://example.com/image.jpg"
 *   alt="Description"
 *   className="w-full h-64"
 *   placeholder="blur" // or "shimmer"
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: 'blur' | 'shimmer' | 'none';
  lowQualitySrc?: string; // Optional LQIP (Low Quality Image Placeholder)
  rootMargin?: string; // When to start loading (default: 50px before visible)
  threshold?: number; // Intersection threshold (0-1)
  onLoad?: () => void;
  onError?: () => void;
  retryCount?: number; // Number of retry attempts on error
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'shimmer',
  lowQualitySrc,
  rootMargin = '50px',
  threshold = 0.01,
  onLoad,
  onError,
  retryCount = 2,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up Intersection Observer
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Stop observing once image is in view
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, threshold]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setError(false);
      onLoad?.();
    };

    img.onerror = () => {
      if (retries < retryCount) {
        // Retry loading after delay
        setTimeout(() => {
          setRetries(retries + 1);
        }, 1000 * (retries + 1)); // Exponential backoff
      } else {
        setError(true);
        onError?.();
      }
    };

    img.src = src;
  }, [isInView, src, retries, retryCount, onLoad, onError]);

  // Placeholder shimmer animation
  const shimmerClasses = placeholder === 'shimmer' 
    ? 'animate-pulse bg-gray-200'
    : '';

  // Blur effect for LQIP
  const blurClasses = placeholder === 'blur' && lowQualitySrc && !isLoaded
    ? 'filter blur-sm'
    : '';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Low Quality Placeholder (if provided) */}
      {lowQualitySrc && !isLoaded && !error && (
        <img
          src={lowQualitySrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${blurClasses}`}
          aria-hidden="true"
        />
      )}

      {/* Shimmer Placeholder */}
      {!isLoaded && !error && !lowQualitySrc && placeholder === 'shimmer' && (
        <div className={`absolute inset-0 w-full h-full ${shimmerClasses}`} />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? src : lowQualitySrc || ''}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${error ? 'hidden' : ''}
        `}
        loading="lazy" // Native browser lazy loading as fallback
        {...props}
      />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500 px-4">
            <svg 
              className="w-12 h-12 mx-auto mb-2 opacity-40" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 🌐 NETWORK-AWARE LAZY IMAGE
 * Adjusts loading strategy based on connection speed
 */
export const NetworkAwareLazyImage: React.FC<LazyImageProps> = (props) => {
  // Check connection type (Safari/older browsers won't have this)
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  // Adjust root margin based on connection speed
  let adjustedRootMargin = '50px';
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      // Very slow connection - load only when almost visible
      adjustedRootMargin = '10px';
    } else if (effectiveType === '3g') {
      // Slow connection - load shortly before visible
      adjustedRootMargin = '50px';
    } else if (effectiveType === '4g') {
      // Fast connection - preload generously
      adjustedRootMargin = '200px';
    }
  }

  return <LazyImage {...props} rootMargin={adjustedRootMargin} />;
};

/**
 * 🎨 LAZY BACKGROUND IMAGE
 * For div backgrounds instead of img tags
 */
interface LazyBackgroundProps {
  src: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: 'blur' | 'shimmer' | 'none';
  rootMargin?: string;
}

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  children,
  className = '',
  placeholder = 'shimmer',
  rootMargin = '50px',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [isInView, src]);

  const shimmerClasses = placeholder === 'shimmer' && !isLoaded
    ? 'animate-pulse bg-gray-200'
    : '';

  return (
    <div
      ref={divRef}
      className={`${className} ${shimmerClasses}`}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  );
};

export default LazyImage;
