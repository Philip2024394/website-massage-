import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  className = ''
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    
    // Only start pull if we're at the top of the page
    const isAtTop = window.scrollY === 0;
    if (isAtTop) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;

    const touch = e.touches[0];
    currentY.current = touch.clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Calculate pull distance with diminishing returns
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  // Handle mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshing) return;
    startY.current = e.clientY;
    setIsPulling(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    const deltaY = e.clientY - startY.current;
    if (deltaY > 0) {
      const distance = Math.min(deltaY * 0.3, threshold * 1.5);
      setPullDistance(distance);
    }
  };

  const handleMouseUp = async () => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPulling) {
        handleMouseMove(e as any);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isPulling) {
        handleMouseUp();
      }
    };

    if (isPulling) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPulling, pullDistance]);

  const getRefreshText = () => {
    if (isRefreshing) return '🔄 Refreshing...';
    if (pullDistance >= threshold) return '↑ Release to refresh';
    if (pullDistance > 0) return '↓ Pull to refresh';
    return '';
  };

  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const refreshScale = Math.min(0.8 + (pullDistance / threshold) * 0.2, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-gradient-to-b from-blue-50 to-transparent z-10"
          style={{
            opacity: refreshOpacity,
            transform: `scale(${refreshScale}) translateY(-${threshold - pullDistance}px)`,
            transition: isPulling ? 'none' : 'all 0.3s ease-out'
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-lg border border-blue-200">
            <div
              className={`w-4 h-4 border-2 border-blue-500 rounded-full ${
                isRefreshing ? 'border-t-transparent animate-spin' : ''
              }`}
            />
            <span className="text-sm font-medium text-blue-600">
              {getRefreshText()}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ 
        minHeight: '100vh',
        paddingTop: isPulling || isRefreshing ? `${Math.max(pullDistance, 0)}px` : '0px',
        transition: isPulling ? 'none' : 'padding-top 0.3s ease-out'
      }}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;