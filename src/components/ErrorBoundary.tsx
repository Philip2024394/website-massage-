// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * 🛡️ PROFESSIONAL ERROR BOUNDARY
 * Catches React errors and displays user-friendly fallback
 * Logs all errors silently to admin dashboard
 */

import React, { Component, ReactNode } from 'react';
import { errorLogger } from '../services/errorLoggingService';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        const errorMessage = error?.message || '';
        const errorStack = error?.stack || '';
        
        // DOM errors are handled silently - don't show UI
        const isDOMError = errorMessage.includes('removeChild') || 
                          errorMessage.includes('The node to be removed is not a child') ||
                          errorMessage.includes('insertBefore') ||
                          errorMessage.includes('replaceChild') ||
                          errorMessage.includes('appendChild') ||
                          errorMessage.includes('NotFoundError') ||
                          errorMessage.includes('Failed to execute') ||
                          error?.name === 'NotFoundError' ||
                          errorStack.includes('removeChild') ||
                          errorStack.includes('insertBefore') ||
                          errorStack.includes('commitDeletionEffectsOnFiber') ||
                          errorStack.includes('react-dom');
        
        if (isDOMError) {
            return {
                hasError: false,
                error: null
            };
        }
        
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const errorMessage = error?.message || '';
        const errorStack = error?.stack || '';
        
        // Check if DOM error
        const isDOMError = errorMessage.includes('removeChild') || 
                          errorMessage.includes('The node to be removed is not a child') ||
                          errorMessage.includes('insertBefore') ||
                          errorMessage.includes('replaceChild') ||
                          errorMessage.includes('appendChild') ||
                          errorMessage.includes('NotFoundError') ||
                          errorMessage.includes('Failed to execute') ||
                          error?.name === 'NotFoundError' ||
                          errorStack.includes('removeChild') ||
                          errorStack.includes('insertBefore') ||
                          errorStack.includes('commitDeletionEffectsOnFiber') ||
                          errorStack.includes('react-dom');
        
        if (isDOMError) {
            // Log DOM errors silently (low severity)
            errorLogger.logError(error, {
                errorType: 'runtime',
                severity: 'low',
                context: {
                    type: 'DOM manipulation error',
                    componentStack: errorInfo.componentStack
                }
            });
            return;
        }
        
        // Log non-DOM errors to admin dashboard
        errorLogger.logError(error, {
            errorType: 'runtime',
            severity: 'high',
            context: {
                componentStack: errorInfo.componentStack,
                errorInfo: errorInfo
            }
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            const errAny = this.state.error as { code?: number | string; message?: string } | null;
            const is536870904 = errAny && (errAny.code === 536870904 || errAny.code === '536870904' || (typeof errAny.message === 'string' && errAny.message.includes('536870904')));
            const title = is536870904 ? 'Connection issue' : 'Something went wrong';
            const message = is536870904
                ? 'Connection or service error. Please try again or return to the homepage.'
                : "This page ran into a problem. Use \"Try again\" to reload, or go to the homepage. If it keeps happening, try another browser or clear your cache.";

            // Professional user-friendly error display - NEVER show raw errors
            return (
                <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-12 h-12 text-orange-600" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
                            {title}
                        </h1>

                        {/* User-friendly message */}
                        <p className="text-gray-600 text-center mb-8 leading-relaxed">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Go to Homepage
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-gray-500 text-center mt-6">
                            Our technical team has been automatically notified of this issue.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
