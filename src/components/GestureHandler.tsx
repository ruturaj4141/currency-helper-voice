
import React, { useRef, useEffect, useState } from 'react';

type GestureHandlerProps = {
  onDoubleTap?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const GestureHandler: React.FC<GestureHandlerProps> = ({
  onDoubleTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  children,
  className,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Constants for gesture detection
  const DOUBLE_TAP_DELAY = 300; // milliseconds
  const SWIPE_THRESHOLD = 50; // pixels

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
      setTouchStartY(touch.clientY);

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;
      
      if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
        // Double tap detected
        onDoubleTap?.();
        e.preventDefault();
      }
      
      lastTapTimeRef.current = now;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null || touchStartY === null) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Check if the touch movement was a swipe
      if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
        e.preventDefault();
      }

      setTouchStartX(null);
      setTouchStartY(null);
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Clean up
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    touchStartX, 
    touchStartY, 
    onDoubleTap, 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown,
    disabled
  ]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default GestureHandler;
