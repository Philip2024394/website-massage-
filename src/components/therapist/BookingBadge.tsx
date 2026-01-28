// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';

interface BookingBadgeProps {
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BookingBadge: React.FC<BookingBadgeProps> = ({
  className = '',
  showCount = true,
  size = 'md'
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update badge when booking badges change
    const handleBadgeUpdate = (event: CustomEvent) => {
      const { count } = event.detail;
      setPendingCount(count);
      setIsVisible(count > 0);
    };

    // Listen for badge updates
    window.addEventListener('bookingBadgeUpdate', handleBadgeUpdate as EventListener);

    // Initial load
    updateBadgeCount();

    // Update every 30 seconds
    const interval = setInterval(updateBadgeCount, 30000);

    return () => {
      window.removeEventListener('bookingBadgeUpdate', handleBadgeUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  const updateBadgeCount = () => {
    try {
      const alerts = JSON.parse(localStorage.getItem('persistent_booking_alerts') || '[]');
      const pendingAlerts = alerts.filter((alert: any) => 
        !alert.acknowledged && alert.booking?.status === 'pending'
      );
      const count = pendingAlerts.length;
      
      setPendingCount(count);
      setIsVisible(count > 0);
    } catch (error) {
      console.warn('Failed to update booking badge count:', error);
    }
  };

  if (!isVisible) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  const badgeClass = `
    ${sizeClasses[size]}
    bg-red-500 text-white rounded-full flex items-center justify-center
    font-bold min-w-max px-1 animate-pulse border-2 border-white shadow-lg
    ${className}
  `.trim();

  return (
    <span className={badgeClass}>
      {showCount ? (pendingCount > 99 ? '99+' : pendingCount) : ''}
    </span>
  );
};

export default BookingBadge;