import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
    progress?: number; // 0-100
    stage?: 'initializing' | 'loading' | 'authenticating' | 'finalizing';
}

/**
 * Elite Loading System - Progressive reveal with stage indicators
 * Provides immediate feedback and perceived performance boost
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message, 
    fullScreen = true,
    progress = 0,
    stage = 'loading'
}) => {
    const containerClass = fullScreen 
        ? "fixed inset-0 flex flex-col items-center justify-center z-50" 
        : "flex flex-col items-center justify-center py-12";

    const stageMessages = {
        initializing: 'Ready',
        loading: 'Ready',
        authenticating: 'Ready',
        finalizing: 'Ready'
    };

    const stageColors = {
        initializing: 'from-blue-500 to-blue-600',
        loading: 'from-orange-500 to-orange-600',
        authenticating: 'from-green-500 to-green-600', 
        finalizing: 'from-purple-500 to-purple-600'
    };

    return (
        <div 
            className={containerClass}
            id="react-loading-spinner"
            data-loading-state={stage}
            style={{ 
                background: '#f97316', /* Solid orange - no gradient to prevent transition artifacts */
                transition: 'none' /* Remove transition to prevent intermediate colors */
            }}
        >
            {/* Elite Brand Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
                    IndaStreet
                </h1>
                <p className="text-white/90 text-lg font-medium">
                    Professional Massage Services
                </p>
            </div>
            
            {/* Progress Ring */}
            <div className="relative w-20 h-20 mb-6">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background ring */}
                    <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                        className="transition-all duration-300 ease-out"
                    />
                </svg>
                
                {/* Simple dot indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
            </div>
            
            {/* Stage Message */}
            <p className="text-white/90 text-base font-medium mb-4 animate-pulse">
                {message || stageMessages[stage]}
            </p>
            
            {/* Elite Dots Animation */}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            
            {/* Stage Indicator Bar */}
            <div className="mt-8 w-64 max-w-full">
                <div className="flex justify-between text-white/70 text-xs mb-2">
                    <span>Initializing</span>
                    <span>Loading</span>
                    <span>Ready</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1">
                    <div 
                        className={`h-1 rounded-full bg-gradient-to-r ${stageColors[stage]} transition-all duration-500`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
