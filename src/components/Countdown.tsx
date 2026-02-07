/**
 * 🕐 COUNTDOWN COMPONENT
 * 
 * Reusable countdown timer component with professional styling
 * - Updates every second until reaching 00:00
 * - Displays minutes:seconds format with leading zeros
 * - Includes customizable styling and icon
 * - Integrated with existing design system
 */

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  secondsRemaining: number;
  onComplete?: () => void;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

const Countdown: React.FC<CountdownProps> = ({
  secondsRemaining,
  onComplete,
  className = '',
  showIcon = true,
  size = 'md',
  variant = 'default'
}) => {
  const [timeLeft, setTimeLeft] = useState(secondsRemaining);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  // Format time display
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  // Dynamic styling based on props
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2', 
    lg: 'text-base gap-2'
  };

  const variantClasses = {
    default: 'text-gray-700',
    warning: 'text-orange-600',
    danger: 'text-red-600',
    success: 'text-green-600'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Auto-switch to warning/danger based on time remaining
  const getVariantByTime = () => {
    if (variant !== 'default') return variant;
    if (timeLeft <= 30) return 'danger';
    if (timeLeft <= 120) return 'warning';
    return 'default';
  };

  const currentVariant = getVariantByTime();

  return (
    <div className={`
      arrival-countdown flex items-center font-medium
      ${sizeClasses[size]}
      ${variantClasses[currentVariant]}
      ${className}
    `}>
      {showIcon && (
        <Clock className={`${iconSizes[size]} ${variantClasses[currentVariant]}`} />
      )}
      <span className="font-mono tabular-nums">
        {minutes}:{seconds}
      </span>
      {timeLeft <= 0 && (
        <span className="ml-1 text-red-500 font-bold animate-pulse">
          ⏰
        </span>
      )}
    </div>
  );
};

export default Countdown;