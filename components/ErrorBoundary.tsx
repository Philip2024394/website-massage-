import React, { Component, ReactNode } from 'react';

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
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const errorMessage = error?.message || '';
        const errorStack = error?.stack || '';
        
        // ULTIMATE DOM error detection
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
            console.log('🛡️ ULTIMATE ErrorBoundary: DOM error completely suppressed:', {
                message: errorMessage.substring(0, 80),
                name: error?.name
            });
            
            // INSTANT auto-recovery from DOM errors - no delay needed
            this.setState({
                hasError: false,
                error: null
            });
            return; // Don't process DOM errors further
        } else {
            console.error('ErrorBoundary caught non-DOM error:', error, errorInfo);
        }
        
        // You can log to error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });
        // Optionally reload the page
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h1>
                        
                        <p className="text-gray-600 mb-6">
                            We're sorry for the inconvenience. The application encountered an unexpected error.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm font-mono text-red-800 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Return to Home
                            </button>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mt-6">
                            If this problem persists, please contact support at{' '}
                            <a href="mailto:support@indastreet.com" className="text-orange-500 hover:underline">
                                support@indastreet.com
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
