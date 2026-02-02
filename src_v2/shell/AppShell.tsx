/**
 * ============================================================================
 * 🚫 AI-PROTECTED ZONE - NEVER TOUCH
 * ============================================================================
 * 
 * APP SHELL - Single layout authority for entire application
 * 
 * RULES:
 * - ALL scroll behavior controlled HERE
 * - ALL layout structure controlled HERE  
 * - Features render INSIDE shell containers
 * - NO feature can break shell structure
 * 
 * STABILITY GUARANTEE:
 * If this file works → layout + scroll works
 * 
 * ============================================================================
 */

import React, { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  layout?: 'default' | 'dashboard' | 'minimal';
  className?: string;
}

// PROTECTED: Scroll container - fixes all mobile scroll issues
const ScrollContainer: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div 
    className="min-h-[100dvh] overflow-y-auto overflow-x-hidden"
    style={{
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: '-ms-autohiding-scrollbar',
    }}
  >
    {children}
  </div>
);

// PROTECTED: Default layout structure
const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold text-gray-900">
            Massage Platform
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/booking" className="text-gray-600 hover:text-gray-900">Book</a>
          </nav>
        </div>
      </div>
    </header>

    {/* Main content */}
    <main className="flex-1">
      {children}
    </main>

    {/* Footer */}
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          © 2026 Massage Platform. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
);

// PROTECTED: Dashboard layout structure
const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {/* Dashboard header */}
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            Dashboard
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>

    {/* Dashboard content */}
    <main className="flex-1 p-6">
      {children}
    </main>
  </div>
);

// PROTECTED: Minimal layout structure (for flows like booking/chat)
const MinimalLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white">
    {children}
  </div>
);

// PROTECTED: Main shell component
export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  layout = 'default',
  className = '' 
}) => {
  // Feature flag debugging in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const flags = {
        USE_V2_THERAPIST_DASHBOARD: process.env.NODE_ENV === 'development' || 
                                   localStorage?.getItem('enableV2Dashboard') === 'true'
      };
      console.log('🎛️ Feature Flags:', flags);
      console.log('🏠 Shell Layout:', layout);
    }
  }, [layout]);

  const renderLayout = () => {
    switch (layout) {
      case 'dashboard':
        return (
          <DashboardLayout>
            {children}
          </DashboardLayout>
        );
      case 'minimal':
        return (
          <MinimalLayout>
            {children}
          </MinimalLayout>
        );
      case 'default':
      default:
        return (
          <DefaultLayout>
            {children}
          </DefaultLayout>
        );
    }
  };

  return (
    <ScrollContainer>
      <div className={className}>
        {/* Feature flag status for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="dev-feature-flags" style={{
            position: 'fixed',
            top: 0,
            right: 0,
            background: '#000',
            color: '#fff',
            padding: '5px 10px',
            fontSize: '10px',
            zIndex: 9999,
            borderBottomLeftRadius: '4px'
          }}>
            V2 Dashboard: {(process.env.NODE_ENV === 'development' || 
                          localStorage?.getItem('enableV2Dashboard') === 'true') ? '✅' : '❌'}
          </div>
        )}
        {renderLayout()}
      </div>
    </ScrollContainer>
  );
};

// PROTECTED: Error boundary for shell
export class ShellErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Shell Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              The application encountered an error. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppShell;