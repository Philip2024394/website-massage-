import React, { useMemo } from 'react';

// Badge types with their display properties
export const BADGE_TYPES = {
  NEW: {
    label: 'New',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    textColor: 'text-white',
    borderColor: 'border-orange-400',
    shadow: 'shadow-orange-200'
  },
  POPULAR: {
    label: 'Popular',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    textColor: 'text-white',  
    borderColor: 'border-blue-400',
    shadow: 'shadow-blue-200'
  },
  JUST_SCHEDULED: {
    label: 'Just Scheduled',
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    textColor: 'text-white',
    borderColor: 'border-purple-400',
    shadow: 'shadow-purple-200'
  },
  BEST_PRICE: {
    label: 'Best Price',
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-400',
    shadow: 'shadow-green-200'
  }
} as const;

export type BadgeType = keyof typeof BADGE_TYPES;

interface ServiceBadgesProps {
  serviceId: string;
  serviceName: string;
  className?: string;
  animate?: boolean;
  maxBadges?: 1 | 2;
  refreshKey?: string; // For dynamic updates per session
}

// Randomization logic with weighted probabilities
function generateBadgesForService(serviceId: string, serviceName: string, maxBadges: 1 | 2 = 2, refreshKey?: string): BadgeType[] {
  // Create a consistent seed based on service ID and refresh key for consistent results per session
  const seed = serviceId + (refreshKey || 'default');
  
  // Simple hash function for consistent randomization
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to generate pseudo-random numbers
  const random1 = Math.abs(hash % 1000) / 1000;
  const random2 = Math.abs((hash >> 8) % 1000) / 1000;
  const random3 = Math.abs((hash >> 16) % 1000) / 1000;
  
  // Probability distribution:
  // 30% chance of 0 badges
  // 50% chance of 1 badge  
  // 20% chance of 2 badges (only if maxBadges = 2)
  
  if (random1 < 0.3) {
    return []; // No badges (30%)
  }
  
  const availableBadges: BadgeType[] = ['NEW', 'POPULAR', 'JUST_SCHEDULED', 'BEST_PRICE'];
  
  if (maxBadges === 1 || random1 < 0.8) {
    // Single badge (50% overall)
    const badgeIndex = Math.floor(random2 * availableBadges.length);
    return [availableBadges[badgeIndex]];
  }
  
  // Two badges (20% overall)
  const firstBadgeIndex = Math.floor(random2 * availableBadges.length);
  let secondBadgeIndex = Math.floor(random3 * availableBadges.length);
  
  // Ensure different badges
  while (secondBadgeIndex === firstBadgeIndex) {
    secondBadgeIndex = (secondBadgeIndex + 1) % availableBadges.length;
  }
  
  return [availableBadges[firstBadgeIndex], availableBadges[secondBadgeIndex]];
}

const ServiceBadges: React.FC<ServiceBadgesProps> = ({
  serviceId,
  serviceName,
  className = '',
  animate = true,
  maxBadges = 2,
  refreshKey
}) => {
  // Generate badges - memoized for performance and consistency
  const badges = useMemo(() => 
    generateBadgesForService(serviceId, serviceName, maxBadges, refreshKey),
    [serviceId, serviceName, maxBadges, refreshKey]
  );

  if (badges.length === 0) {
    return null; // No badges to display
  }

  return (
    <div className={`absolute -top-2 -right-2 z-10 flex flex-col gap-1 ${className}`}>
      {badges.map((badgeType, index) => {
        const badge = BADGE_TYPES[badgeType];
        
        return (
          <div
            key={`${badgeType}-${index}`}
            className={`
              relative px-2 py-1 rounded-full text-xs font-semibold
              border-2 shadow-lg backdrop-blur-sm
              ${badge.color} ${badge.textColor} ${badge.borderColor} ${badge.shadow}
              ${animate ? 'animate-badge-slide-in' : ''}
              transform transition-all duration-300 hover:scale-105
              whitespace-nowrap
            `}
            style={{
              animationDelay: animate ? `${index * 100}ms` : '0ms'
            }}
          >
            {/* Badge ribbon effect */}
            <div className="absolute inset-0 bg-white opacity-20 rounded-full transform -rotate-12 scale-x-150"></div>
            
            {/* Badge text */}
            <span className="relative z-10 drop-shadow-sm">
              {badge.label}
            </span>
            
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-full animate-shine"></div>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceBadges;