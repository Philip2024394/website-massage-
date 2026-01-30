import React from 'react';

/**
 * 🚀 INSTANT LOADER - Zero visible delay
 * 
 * Replaces heavy LoadingSpinner with minimal visual loading
 * that renders instantly without blocking UI flow.
 * 
 * Design Principles:
 * - Render time: <10ms
 * - No progress animations
 * - No stage messages
 * - Minimal DOM elements
 * - Instant perceived performance
 */

interface InstantLoaderProps {
  message?: string;
  fullScreen?: boolean;
  minimal?: boolean;
}

export const InstantLoader: React.FC<InstantLoaderProps> = ({ 
  message,
  fullScreen = false,
  minimal = false
}) => {
  // Ultra-minimal mode for navigation transitions
  if (minimal) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const containerClass = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-white z-50" 
    : "flex items-center justify-center py-8";

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Instant brand display - no animation delays */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">Street</span>
          </h1>
        </div>
        
        {/* Simple spinner - no complex animations */}
        <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Optional message */}
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

// Export default for easy replacement
export default InstantLoader;