/**
 * ============================================================================
 * � STEP 12 FROZEN - STABLE REFERENCE POINT - NO MODIFICATIONS  
 * ============================================================================
 * 
 * ⚠️  CRITICAL: THIS FILE IS FROZEN AS OF STEP 12 COMPLETION
 * 
 * ALLOWED CHANGES:
 * ✅ Critical bug fixes only (with documentation)
 * ❌ NO refactors, redesigns, or feature additions
 * 
 * ============================================================================
 * �🛡️ THERAPIST DASHBOARD ERROR BOUNDARY - STEP 11 STABILIZATION
 * ============================================================================
 * 
 * Comprehensive error handling for the therapist dashboard feature.
 * Ensures graceful degradation and prevents crashes.
 * 
 * FEATURES:
 * - React error boundary for component crashes
 * - API error handling and retry logic  
 * - Fallback UI with recovery options
 * - Error reporting to core services
 * - User-friendly error messages
 * - Legacy fallback capability
 * 
 * ============================================================================
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  language?: 'en' | 'id';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  retryCount: number;
}

export class TherapistDashboardErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [THERAPIST DASHBOARD] Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to parent
    this.props.onError?.(error, errorInfo);

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo);
  }

  private logErrorDetails = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      feature: 'therapist-dashboard'
    };

    console.error('📊 [ERROR DETAILS]', JSON.stringify(errorDetails, null, 2));
    
    // TODO: Send to error reporting service via core
    // await ErrorReportingService.reportError(errorDetails);
  };

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1 
    });

    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });

      console.log(`🔄 [DASHBOARD] Retry attempt ${this.state.retryCount}/${this.maxRetries}`);
    } catch (error) {
      console.error('❌ [DASHBOARD] Retry failed:', error);
      this.setState({ isRetrying: false });
    }
  };

  private handleFallbackToLegacy = () => {
    console.log('🔙 [DASHBOARD] Falling back to legacy version');
    
    // Remove V2 feature flag to trigger legacy fallback
    localStorage.removeItem('enableV2Dashboard');
    
    // Reload page to trigger legacy mode
    window.location.reload();
  };

  private getErrorMessage = () => {
    const { language = 'id' } = this.props;
    const { error } = this.state;

    if (!error) return '';

    // Common error patterns
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return language === 'id' ? 
        'Gagal terhubung ke server. Periksa koneksi internet Anda.' :
        'Failed to connect to server. Please check your internet connection.';
    }

    if (error.message.includes('ChunkLoadError')) {
      return language === 'id' ?
        'Gagal memuat komponen. Halaman akan dimuat ulang.' :
        'Failed to load components. Page will be refreshed.';
    }

    if (error.name === 'TypeError') {
      return language === 'id' ?
        'Terjadi kesalahan pada data. Coba refresh halaman.' :
        'Data error occurred. Please refresh the page.';
    }

    // Generic error message
    return language === 'id' ?
      'Terjadi kesalahan tidak terduga pada dashboard.' :
      'An unexpected error occurred in the dashboard.';
  };

  private getTechnicalDetails = () => {
    const { error, errorInfo } = this.state;
    
    return {
      errorName: error?.name || 'Unknown Error',
      errorMessage: error?.message || 'No message',
      componentStack: errorInfo?.componentStack || 'No stack trace',
      timestamp: new Date().toLocaleString(),
      retryCount: this.state.retryCount,
      maxRetries: this.maxRetries
    };
  };

  render() {
    const { language = 'id', fallback } = this.props;
    const { hasError, isRetrying, retryCount } = this.state;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const canRetry = retryCount < this.maxRetries;
      const errorMessage = this.getErrorMessage();
      const technicalDetails = this.getTechnicalDetails();

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 max-w-md w-full">
            {/* Error Header */}
            <div className="bg-red-50 border-b border-red-200 p-6 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    {language === 'id' ? 'Terjadi Kesalahan' : 'Error Occurred'}
                  </h3>
                  <p className="text-sm text-red-700">
                    {language === 'id' ? 'Dashboard mengalami gangguan' : 'Dashboard encountered an issue'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-sm">
                {errorMessage}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    disabled={isRetrying}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 
                      (language === 'id' ? 'Mencoba ulang...' : 'Retrying...') :
                      (language === 'id' ? `Coba Lagi (${retryCount}/${this.maxRetries})` : `Retry (${retryCount}/${this.maxRetries})`)
                    }
                  </button>
                )}

                <button
                  onClick={this.handleFallbackToLegacy}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'id' ? 'Kembali ke Versi Lama' : 'Use Legacy Version'}
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {language === 'id' ? 'Muat Ulang Halaman' : 'Reload Page'}
                </button>
              </div>

              {/* Technical Details (Collapsible) */}
              <details className="mt-4">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  <Bug className="w-4 h-4" />
                  {language === 'id' ? 'Detail Teknis' : 'Technical Details'}
                </summary>
                <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 space-y-2">
                  <div><strong>Error:</strong> {technicalDetails.errorName}</div>
                  <div><strong>Message:</strong> {technicalDetails.errorMessage}</div>
                  <div><strong>Time:</strong> {technicalDetails.timestamp}</div>
                  <div><strong>Retries:</strong> {technicalDetails.retryCount}/{technicalDetails.maxRetries}</div>
                  {process.env.NODE_ENV === 'development' && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {technicalDetails.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <TherapistDashboardErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </TherapistDashboardErrorBoundary>
  ));
};

export default TherapistDashboardErrorBoundary;