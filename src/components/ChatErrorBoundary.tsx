import React, { Component, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { chatTranslationService } from '../services/chatTranslationService';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: string;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: string) => void;
}

class ChatErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const errorMessage = `Chat Error: ${error.message}\nComponent Stack: ${errorInfo.componentStack}`;
        
        console.error('🚨 ChatWindow Error Boundary caught an error:', error);
        console.error('Error Info:', errorInfo);
        
        this.setState({
            errorInfo: errorMessage
        });

        // Call the error callback if provided
        if (this.props.onError) {
            this.props.onError(error, errorMessage);
        }

        // You could also log this to an error reporting service
        // errorReportingService.captureException(error, { extra: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const errorMessage = this.state.error?.message || 'Unknown error';

            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-red-600 text-lg">⚠️</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800">Chat Service Error</h2>
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                            The chat service encountered an unexpected error. This might be due to:
                        </p>
                        
                        <ul className="text-sm text-gray-500 mb-3 list-disc list-inside space-y-1">
                            <li>Network connectivity issues</li>
                            <li>Server maintenance</li>
                            <li>Browser compatibility issues</li>
                        </ul>

                        {/* Show actual error so user/support can act on it */}
                        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4 break-words">
                            {errorMessage}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                                }}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                            
                            <button
                                onClick={async () => {
                                    try {
                                        const { softRecover } = await import('../utils/softNavigation');
                                        softRecover();
                                    } catch {
                                        window.location.reload();
                                    }
                                }}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="mt-4">
                                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                    Technical Details (Dev Mode)
                                </summary>
                                <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-32">
                                    {this.state.errorInfo}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChatErrorBoundary;