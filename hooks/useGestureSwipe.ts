/**
 * Gesture Swipe Hook
 * Enables swipe-to-open/close for drawers and modals
 * Facebook app style gesture navigation
 */

import { useState, useEffect, useRef, TouchEvent } from 'react';

interface SwipeConfig {
  threshold?: number; // Minimum distance to trigger (default: 50px)
  velocity?: number;  // Minimum velocity to trigger (default: 0.3)
  direction?: 'horizontal' | 'vertical' | 'both';
}

interface SwipeState {
  isSwiping: boolean;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export function useGestureSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    direction = 'horizontal'
  } = config;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    deltaX: 0,
    deltaY: 0,
    direction: null
  });

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEnd.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    setSwipeState({
      isSwiping: true,
      deltaX,
      deltaY,
      direction: Math.abs(deltaX) > Math.abs(deltaY)
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up')
    });

    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) {
      setSwipeState({
        isSwiping: false,
        deltaX: 0,
        deltaY: 0,
        direction: null
      });
      return;
    }

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Horizontal swipes
    if ((direction === 'horizontal' || direction === 'both') && Math.abs(deltaX) > threshold && velocityX > velocity) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Vertical swipes
    if ((direction === 'vertical' || direction === 'both') && Math.abs(deltaY) > threshold && velocityY > velocity) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
    setSwipeState({
      isSwiping: false,
      deltaX: 0,
      deltaY: 0,
      direction: null
    });
  };

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}
