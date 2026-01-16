/**
 * UnreadBadge Component
 * Facebook Messenger style badge for unread counts
 */

import React from 'react';

interface UnreadBadgeProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  count,
  max = 99,
  size = 'md',
  className = ''
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-red-500 text-white rounded-full
        flex items-center justify-center
        font-bold
        animate-pulse
        ${className}
      `}
    >
      {displayCount}
    </div>
  );
};

/**
 * Floating Badge (absolute positioned for overlays)
 */
export const FloatingUnreadBadge: React.FC<UnreadBadgeProps> = (props) => {
  return (
    <div className="absolute -top-1 -right-1 z-10">
      <UnreadBadge {...props} />
    </div>
  );
};
