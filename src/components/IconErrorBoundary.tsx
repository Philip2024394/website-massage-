// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// Component Error Boundary specifically for icon-related errors
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class IconErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if error is related to icon imports
    if (error.message.includes('lucide-react') || 
        error.message.includes('is not a function') ||
        error.message.includes('Cannot read properties of undefined')) {
      return { hasError: true, error };
    }
    return { hasError: false, error: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Icon Error Boundary caught an error:', error, errorInfo);
    
    // Log specific information for debugging
    if (this.props.componentName) {
      logger.error(`Error in component: ${this.props.componentName}`);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Component Load Error
            </h2>
            <p className="text-gray-600 mb-6">
              There was an issue loading this page component. This has been reported to our team.
            </p>
            <div className="text-sm text-gray-500 mb-6">
              {this.props.componentName && (
                <p>Component: {this.props.componentName}</p>
              )}
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-2 font-mono text-xs text-red-600">
                  {this.state.error?.message}
                </p>
              )}
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}