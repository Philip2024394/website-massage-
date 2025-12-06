import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
}

/**
 * IndaStreet Massage branded loading spinner with smooth animation
 * Used for page transitions and data loading states
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = 'Loading...', 
    fullScreen = true 
}) => {
    const containerClass = fullScreen 
        ? "fixed inset-0 flex flex-col items-center justify-center bg-white z-50" 
        : "flex flex-col items-center justify-center py-12";

    return (
        <div className={containerClass}>
            {/* IndaStreet Logo Spinner */}
            <div className="relative w-24 h-24 mb-6">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-spin border-t-orange-500"></div>
                
                {/* Inner pulsing ring */}
                <div className="absolute inset-2 rounded-full border-4 border-orange-100 animate-pulse"></div>
                
                {/* Center logo/icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg 
                            className="w-7 h-7 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Loading text with fade animation */}
            <div className="text-center">
                <p className="text-lg font-semibold text-gray-800 mb-2 animate-pulse">
                    {message}
                </p>
                <div className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </div>

            {/* IndaStreet branding */}
            <p className="mt-6 text-sm text-gray-500 font-medium">IndaStreet Massage</p>
        </div>
    );
};

export default LoadingSpinner;
