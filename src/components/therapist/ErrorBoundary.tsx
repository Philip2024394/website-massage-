/**
 * 🛡️ THERAPIST PROFESSIONAL ERROR BOUNDARY
 * Catches React errors and displays user-friendly fallback
 * Logs all errors silently to admin dashboard
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { errorLogger } from '../../services/errorLoggingService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error silently to admin dashboard
    errorLogger.logError(error, {
      errorType: 'runtime',
      severity: 'high',
      userRole: 'therapist',
      context: {
        componentStack: errorInfo.componentStack,
        errorInfo: errorInfo
      }
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = async () => {
    try {
      const { softRecover } = await import('../utils/softNavigation');
      softRecover();
    } catch {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Fitur Sementara Tidak Tersedia
            </h1>

            {/* Error Message - Indonesian for therapists - NEVER show raw errors */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Kami sedang memperbarui fitur ini untuk melayani Anda lebih baik. 
              Silakan coba lagi sebentar lagi atau kembali ke halaman utama.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Coba Lagi
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Ke Halaman Utama
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Tim teknis kami telah otomatis diberitahu tentang masalah ini.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
