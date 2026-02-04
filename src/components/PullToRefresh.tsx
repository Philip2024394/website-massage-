// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
  eliteMode?: boolean;
  errorBoundary?: boolean;
  loadingText?: string;
  releaseText?: string;
  pullText?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className = '',
  eliteMode = true,
  errorBoundary = true,
  loadingText = '🔄 Refreshing...',
  releaseText = '↑ Release to refresh',
  pullText = '↓ Pull to refresh'
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [touchId, setTouchId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const isAtTop = useRef<boolean>(true);
  const lastTouchTime = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // Elite error boundary and recovery system
  const safeExecute = useCallback(async (fn: () => Promise<void>) => {
    if (!errorBoundary) {
      return await fn();
    }

    try {
      setHasError(false);
      await fn();
    } catch (error) {
      console.error('PullToRefresh: Error occurred:', error);
      setHasError(true);
      // Auto-recovery after 2 seconds in elite mode
      if (eliteMode) {
        setTimeout(() => setHasError(false), 2000);
      }
    }
  }, [errorBoundary, eliteMode]);

  // Enhanced scroll position checking
  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      // Check both container and window scroll positions
      const containerScrollTop = containerRef.current.scrollTop;
      const windowScrollY = window.scrollY || window.pageYOffset;
      const documentScrollTop = document.documentElement.scrollTop;
      
      isAtTop.current = containerScrollTop <= 1 && windowScrollY <= 1 && documentScrollTop <= 1;
    }
  }, []);

  // Prevent momentum scrolling and over-scroll on iOS
  const preventMomentumScrolling = useCallback((prevent: boolean) => {
    if (eliteMode && 'ontouchstart' in window) {
      const body = document.body;
      const html = document.documentElement;
      
      if (prevent) {
        // REMOVED: body.style.overflow = "hidden" - violates global scroll architecture;
        body.style.touchAction = 'none';
        body.classList.add('elite-pulling');
        html.classList.add('elite-refresh-mode');
      } else {
        body.style.overflow = '';
        body.style.touchAction = '';
        body.classList.remove('elite-pulling');
        html.classList.remove('elite-refresh-mode');
      }
    }
  }, [eliteMode]);

  // Set elite mode on mount
  useEffect(() => {
    if (eliteMode) {
      document.documentElement.classList.add('elite-refresh-mode');
      document.body.classList.add('elite-refresh-mode');
      
      return () => {
        document.documentElement.classList.remove('elite-refresh-mode');
        document.body.classList.remove('elite-refresh-mode');
      };
    }
  }, [eliteMode]);

  // Elite touch start handler with multi-touch protection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || hasError) return;
    
    // Only handle single touch to prevent conflicts
    if (e.touches.length !== 1) return;
    
    checkScrollPosition();
    
    // Only start pull if at top of container
    if (isAtTop.current) {
      const touch = e.touches[0];
      const now = Date.now();
      
      // Store touch identifier for consistency
      setTouchId(touch.identifier);
      lastTouchTime.current = now;
      startY.current = touch.clientY;
      setIsPulling(true);
      
      // Elite mode: Prevent momentum scrolling
      if (eliteMode) {
        preventMomentumScrolling(true);
      }
    }
  }, [disabled, isRefreshing, hasError, eliteMode, checkScrollPosition, preventMomentumScrolling]);

  // Elite touch move handler with performance optimization
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || !isPulling || hasError) return;

    // Ensure we're tracking the same touch
    const touch = Array.from(e.touches).find(t => t.identifier === touchId);
    if (!touch) return;

    const currentY = touch.clientY;
    const deltaY = currentY - startY.current;
    const now = Date.now();

    // Elite mode: Performance optimization with frame throttling
    if (eliteMode) {
      // Throttle to 60fps (16.67ms)
      if (now - lastTouchTime.current < 16) return;
      lastTouchTime.current = now;

      // Recheck scroll position for dynamic content
      if (deltaY > 0) {
        checkScrollPosition();
        if (!isAtTop.current) {
          handleTouchEnd();
          return;
        }
      }
    }

    if (deltaY > 0 && isAtTop.current) {
      // Prevent default browser pull-to-refresh and overscroll
      e.preventDefault();
      e.stopPropagation();
        
      // Elite resistance calculation with smooth curve
      const resistance = eliteMode ? 0.35 : 0.5;
      const maxDistance = threshold * (eliteMode ? 2.5 : 1.5);
      
      // Smooth easing function for elite experience
      const easedDelta = eliteMode ? 
        deltaY * resistance * (1 - Math.pow(deltaY / (maxDistance * 2), 0.5)) :
        deltaY * resistance;
      
      const distance = Math.max(0, Math.min(easedDelta, maxDistance));
      
      // Use RAF for smooth animation
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      rafId.current = requestAnimationFrame(() => {
        setPullDistance(distance);
      });
    }
  }, [disabled, isRefreshing, isPulling, hasError, eliteMode, threshold, touchId, checkScrollPosition]);

  // Elite touch end handler with haptic feedback simulation
  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);
    setTouchId(null);
    
    // Restore scrolling behavior
    if (eliteMode) {
      preventMomentumScrolling(false);
    }

    // Clear any pending animation frames
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    const shouldRefresh = pullDistance >= threshold;

    if (shouldRefresh) {
      // Elite mode: Simulate haptic feedback
      if (eliteMode && 'vibrate' in navigator) {
        navigator.vibrate([10]);
      }

      setIsRefreshing(true);
      
      await safeExecute(async () => {
        await onRefresh();
      });
      
      setIsRefreshing(false);
    }

    // Smooth reset animation
    setPullDistance(0);
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh, safeExecute, eliteMode, preventMomentumScrolling]);

  // Register touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touchStartHandler = (e: TouchEvent) => {
      const reactEvent = e as any;
      reactEvent.persist = () => {};
      handleTouchStart(reactEvent as React.TouchEvent);
    };

    const touchMoveHandler = (e: TouchEvent) => {
      const reactEvent = e as any;
      reactEvent.persist = () => {};
      handleTouchMove(reactEvent as React.TouchEvent);
    };

    const touchEndHandler = (e: TouchEvent) => {
      const reactEvent = e as any;
      reactEvent.persist = () => {};
      handleTouchEnd(reactEvent as React.TouchEvent);
    };

    // Add event listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', touchStartHandler, { passive: false });
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    container.addEventListener('touchend', touchEndHandler, { passive: false });

    return () => {
      container.removeEventListener('touchstart', touchStartHandler);
      container.removeEventListener('touchmove', touchMoveHandler);
      container.removeEventListener('touchend', touchEndHandler);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (eliteMode) {
        preventMomentumScrolling(false);
      }
    };
  }, [eliteMode, preventMomentumScrolling]);

  // Elite status text with enhanced feedback
  const getRefreshText = () => {
    if (hasError) return '⚠️ Refresh failed';
    if (isRefreshing) return loadingText;
    if (pullDistance >= threshold) return releaseText;
    if (pullDistance > 0) return pullText;
    return '';
  };

  // Elite visual calculations
  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const refreshScale = Math.min(0.7 + (pullDistance / threshold) * 0.3, 1);
  const indicatorRotation = isRefreshing ? 0 : (pullDistance / threshold) * 180;
  
  // Elite color scheme based on state
  const getIndicatorColor = () => {
    if (hasError) return 'border-red-500 bg-red-50 text-red-600';
    if (isRefreshing) return 'border-blue-500 bg-blue-50 text-blue-600';
    if (pullDistance >= threshold) return 'border-green-500 bg-green-50 text-green-600';
    return 'border-gray-300 bg-gray-50 text-gray-600';
  };

  const containerTransform = eliteMode ? 
    `translateY(${Math.min(pullDistance * 0.8, threshold * 0.8)}px)` :
    `translateY(${Math.min(pullDistance, threshold)}px)`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: containerTransform,
        transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: eliteMode ? 'none' : 'auto'
      }}
    >
      {/* Elite pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className={`absolute top-0 left-0 right-0 flex items-center justify-center z-50 ${
            eliteMode ? 'py-6' : 'py-4'
          }`}
          style={{
            opacity: refreshOpacity,
            transform: `scale(${refreshScale}) translateY(-${threshold - pullDistance}px)`,
            transition: isPulling ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: eliteMode ? 
              'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)' : 
              'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)'
          }}
        >
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border backdrop-blur-sm ${getIndicatorColor()}`}>
            <div
              className={`w-5 h-5 border-2 rounded-full transition-all duration-300 ${
                isRefreshing 
                  ? 'border-t-transparent animate-spin' 
                  : hasError
                  ? 'border-red-500'
                  : pullDistance >= threshold
                  ? 'border-green-500'
                  : 'border-gray-400'
              }`}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${indicatorRotation}deg)`
              }}
            />
            <span className={`text-sm font-medium transition-colors ${
              eliteMode ? 'font-semibold' : ''
            }`}>
              {getRefreshText()}
            </span>
            {eliteMode && pullDistance > threshold * 0.5 && !isRefreshing && (
              <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Content wrapper with elite spacing */}
      <div style={{ 
        paddingTop: (isPulling || isRefreshing) ? `${Math.max(pullDistance * (eliteMode ? 0.6 : 1), 0)}px` : '0px',
        transition: isPulling ? 'none' : 'padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh'
      }}>
        {children}
      </div>

      {/* Elite mode: Additional visual enhancements */}
      {eliteMode && (isPulling || isRefreshing) && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at center top, rgba(59, 130, 246, ${refreshOpacity * 0.1}) 0%, transparent 50%)`,
            opacity: refreshOpacity * 0.5
          }}
        />
      )}
    </div>
  );
};

export default PullToRefresh;