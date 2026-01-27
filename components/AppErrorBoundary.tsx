import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary for App Component
 * Catches React render errors and shows friendly fallback UI
 */
class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details with clear prefix for debugging
    console.error('🚨 [APP ERROR BOUNDARY] React component crashed:', error);
    console.error('🚨 [APP ERROR BOUNDARY] Component stack:', errorInfo.componentStack);
    
    // Store error info in state
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: errorTrackingService.logError(error, errorInfo);
  }

  handleReload = async () => {
    // Clear error state and use soft recovery
    try {
      const { softRecover } = await import('../utils/softNavigation');
      softRecover();
    } catch {
      // Fallback to hard reload only if soft recovery fails
      window.location.reload();
    }
  };

  handleReset = () => {
    // Clear error state and try to recover
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Friendly error fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <svg 
                  className="w-16 h-16 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Don't worry - your data is safe.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-gray-50 rounded-lg p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Technical Details (Dev Only)
                </summary>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-red-600">Error:</span>
                    <pre className="text-xs text-gray-700 mt-1 overflow-x-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <span className="font-semibold text-red-600">Component Stack:</span>
                      <pre className="text-xs text-gray-700 mt-1 overflow-x-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-300 transition-all"
              >
                Try Again
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-6">
              If this problem persists, please contact support or try clearing your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
