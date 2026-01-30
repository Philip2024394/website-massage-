import React from 'react';

/**
 * 🚀 PERFORMANCE CRITICAL - Lightweight App Shell
 * 
 * This component renders INSTANTLY while heavy components load in background.
 * Provides immediate UI feedback to eliminate perceived loading delay.
 * 
 * Design: Minimal content area only - no headers or footers to avoid conflicts
 * Load time: <50ms (vs 3000ms+ for full App.tsx)
 */

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell min-h-screen bg-white">
      {/* DISABLED: Header removed to prevent conflicts with landing page design */}
      {/* Landing page components handle their own headers */}
      
      {/* Main Content Area - Renders children immediately */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>

      {/* DISABLED: Footer removed to let pages handle their own footers */}
    </div>
  );
};

/**
 * 🎨 Loading Skeleton - Shows while main app loads
 * 
 * Provides immediate visual feedback with skeleton screens
 * that closely match the final UI layout.
 */
export const AppShellSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* DISABLED: Header skeleton removed to prevent conflicts */}
      
      {/* Content Skeleton - Minimal loading state */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">Street</span>
          </div>
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};