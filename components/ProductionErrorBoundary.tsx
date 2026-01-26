/**
 * 🔒 PRODUCTION-GRADE ERROR BOUNDARY
 * Prevents white screens by catching React errors
 * 
 * CRITICAL: This must wrap the entire app to catch all errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { smartReload, isRecoverable } from '../utils/softNavigation';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    buildHash: string;
    isRecoverable: boolean;
}

export class ProductionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            buildHash: import.meta.env.VITE_BUILD_HASH || 'unknown',
            isRecoverable: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return { 
            hasError: true, 
            error,
            isRecoverable: isRecoverable(error)
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console for debugging
        console.error('🔴 PRODUCTION ERROR BOUNDARY CAUGHT:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
            isRecoverable: isRecoverable(error)
        });

        // Send to error tracking service (if configured)
        if (typeof window !== 'undefined' && (window as any).errorTracker) {
            (window as any).errorTracker.captureException(error, {
                errorInfo,
                buildHash: this.state.buildHash,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        }
    }

    handleReload = () => {
        // 🔒 MOBILE-FIRST: Try soft recovery first (preserves user data)
        smartReload();
    };

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env.DEV;
            
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                            {isDev ? 'Development Error' : 'Something went wrong'}
                        </h1>
                        
                        <p className="text-gray-600 text-center mb-6">
                            {isDev 
                                ? 'The application encountered an error. Check the console for details.'
                                : this.state.isRecoverable
                                    ? 'We detected a temporary issue. Click below to try recovering without losing your data.'
                                    : 'We apologize for the inconvenience. Please refresh the page.'}
                        </p>

                        {/* Error Details (Dev Only) */}
                        {isDev && this.state.error && (
                            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
                                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                                <pre className="text-sm text-red-900 overflow-x-auto whitespace-pre-wrap break-words">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-red-800 font-medium hover:text-red-900">
                                            Component Stack
                                        </summary>
                                        <pre className="text-xs text-red-800 mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Build Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
                            <div className="flex justify-between items-center">
                                <span>Build Hash:</span>
                                <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                                    {this.state.buildHash}
                                </code>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span>Time:</span>
                                <span className="text-xs">{new Date().toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg"
                            >
                                {this.state.isRecoverable ? 'Try Recovery' : 'Reload Application'}
                            </button>
                            
                            {isDev && (
                                <button
                                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>

                        {/* Helpful tip for users */}
                        {!isDev && this.state.isRecoverable && (
                            <p className="text-xs text-gray-500 text-center mt-4">
                                💡 Recovery will attempt to restore the app without refreshing the entire page
                            </p>
                        )}

                        {/* Help Text */}
                        <p className="text-center text-sm text-gray-500 mt-6">
                            If this problem persists, please{' '}
                            <a href="/support" className="text-orange-500 hover:text-orange-600 underline">
                                contact support
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
