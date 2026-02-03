import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'list' | 'therapist-profile' | 'chat-message' | 'booking-card';
  count?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Enterprise-grade skeleton loader following Amazon/Meta UX standards
 * Prevents layout shifts by reserving exact space for content
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  className = '',
  animate = true
}) => {
  const baseClasses = `bg-gray-200 ${animate ? 'animate-pulse' : ''}`;
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return <div className={`${baseClasses} h-4 w-full rounded ${className}`} />;
        
      case 'avatar':
        return <div className={`${baseClasses} h-12 w-12 rounded-full ${className}`} />;
        
      case 'button':
        return <div className={`${baseClasses} h-10 w-24 rounded-md ${className}`} />;
        
      case 'card':
        return (
          <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className={`${baseClasses} h-6 w-3/4 rounded mb-2`} />
            <div className={`${baseClasses} h-4 w-full rounded mb-1`} />
            <div className={`${baseClasses} h-4 w-2/3 rounded`} />
          </div>
        );
        
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`${baseClasses} h-8 w-8 rounded-full`} />
                <div className="space-y-1 flex-1">
                  <div className={`${baseClasses} h-4 w-3/4 rounded`} />
                  <div className={`${baseClasses} h-3 w-1/2 rounded`} />
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'therapist-profile':
        return (
          <div className={`${className}`}>
            {/* Header skeleton */}
            <div className="flex items-start space-x-4 mb-6">
              <div className={`${baseClasses} h-20 w-20 rounded-full`} />
              <div className="flex-1 space-y-2">
                <div className={`${baseClasses} h-6 w-2/3 rounded`} />
                <div className={`${baseClasses} h-4 w-1/2 rounded`} />
                <div className={`${baseClasses} h-4 w-3/4 rounded`} />
              </div>
            </div>
            
            {/* Services skeleton */}
            <div className="space-y-3">
              <div className={`${baseClasses} h-5 w-32 rounded`} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className={`${baseClasses} h-5 w-3/4 rounded mb-2`} />
                  <div className={`${baseClasses} h-4 w-full rounded mb-1`} />
                  <div className={`${baseClasses} h-4 w-1/3 rounded`} />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'chat-message':
        return (
          <div className={`flex space-x-3 ${className}`}>
            <div className={`${baseClasses} h-8 w-8 rounded-full flex-shrink-0`} />
            <div className="flex-1 space-y-1">
              <div className={`${baseClasses} h-4 w-1/4 rounded`} />
              <div className={`${baseClasses} h-16 w-full rounded-lg`} />
            </div>
          </div>
        );
        
      case 'booking-card':
        return (
          <div className={`border border-gray-200 rounded-lg p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${baseClasses} h-6 w-32 rounded`} />
              <div className={`${baseClasses} h-6 w-20 rounded-full`} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className={`${baseClasses} h-4 w-24 rounded`} />
                <div className={`${baseClasses} h-4 w-32 rounded`} />
              </div>
              <div className="flex justify-between">
                <div className={`${baseClasses} h-4 w-20 rounded`} />
                <div className={`${baseClasses} h-4 w-24 rounded`} />
              </div>
              <div className={`${baseClasses} h-10 w-full rounded-md mt-4`} />
            </div>
          </div>
        );
        
      default:
        return <div className={`${baseClasses} h-4 w-full rounded ${className}`} />;
    }
  };

  // For simple variants, handle count directly
  if (['text', 'avatar', 'button'].includes(variant) && count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

/**
 * Page-level skeleton for full page loading
 */
export const PageSkeleton: React.FC<{ variant?: 'therapist-dashboard' | 'home' | 'generic' }> = ({ 
  variant = 'generic' 
}) => {
  switch (variant) {
    case 'therapist-dashboard':
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          {/* Header skeleton */}
          <div className="mb-8">
            <SkeletonLoader variant="text" className="h-8 w-64 mb-4" />
            <SkeletonLoader variant="text" className="h-5 w-96" />
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} variant="booking-card" />
            ))}
          </div>
        </div>
      );
      
    case 'home':
      return (
        <div className="min-h-screen">
          {/* Hero skeleton */}
          <div className="bg-gray-100 h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <SkeletonLoader className="h-12 w-96 mx-auto" />
              <SkeletonLoader className="h-6 w-64 mx-auto" />
              <SkeletonLoader variant="button" className="h-12 w-48 mx-auto" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="container mx-auto px-4 py-12">
            <SkeletonLoader variant="list" count={4} />
          </div>
        </div>
      );
      
    default:
      return (
        <div className="min-h-screen p-6">
          <SkeletonLoader className="h-8 w-64 mb-8" />
          <SkeletonLoader variant="list" count={5} />
        </div>
      );
  }
};