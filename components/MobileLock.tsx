import React, { useState, useEffect } from 'react';
import './MobileLock.css';

interface MobileLockProps {
  children: React.ReactNode;
}

export default function MobileLock({ children }: MobileLockProps) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Update CSS variable for mobile height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div 
      className="mobile-lock-container"
      style={{
        width: `${windowDimensions.width}px`,
        height: `${windowDimensions.height}px`,
      }}
    >
      {children}
    </div>
  );
}