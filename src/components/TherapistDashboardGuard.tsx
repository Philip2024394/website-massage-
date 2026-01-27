/**
 * 🏢 ENTERPRISE THERAPIST DASHBOARD GUARD
 * Prevents dashboard breaking from import/routing errors
 * Airbnb/Uber-level stability guarantee
 */

import React, { Component, ReactNode } from 'react';
import { authService } from '../lib/appwriteService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

class TherapistDashboardGuard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [THERAPIST DASHBOARD GUARD] Critical error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo,
    });

    // Log to monitoring service
    this.logToMonitoring(error, errorInfo);
  }

  private logToMonitoring = (error: Error, errorInfo: React.ErrorInfo) => {
    // Enterprise monitoring integration
    try {
      const errorData = {
        type: 'therapist_dashboard_crash',
        message: error.message,
        stack: error.stack,
        component: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      console.log('📊 [MONITORING] Logging dashboard crash:', errorData);
      // Future: Send to actual monitoring service (Sentry, LogRocket, etc.)
    } catch (monitoringError) {
      console.warn('⚠️ Failed to log to monitoring service:', monitoringError);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReload = () => {
    // Soft reload - preserve authentication
    window.location.reload();
  };

  private handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
      // Force navigation anyway
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard Temporarily Unavailable
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've detected an issue with your therapist dashboard. Our system is designed to recover automatically.
            </p>

            {this.state.retryCount < 3 && (
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🔄 Try Again ({3 - this.state.retryCount} attempts left)
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🔄 Reload Dashboard
                </button>
              </div>
            )}

            {this.state.retryCount >= 3 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Multiple recovery attempts failed. This may be a temporary system issue.
                </p>
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🔄 Force Reload
                </button>
                
                <button
                  onClick={this.handleLogout}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🚪 Return to Login
                </button>
              </div>
            )}

            <div className="mt-6 text-xs text-gray-400">
              Error Code: THDG-{Date.now().toString(36).toUpperCase()}
              <br />
              Retry #{this.state.retryCount + 1}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TherapistDashboardGuard;