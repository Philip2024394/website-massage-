// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React from 'react';
import PullToRefresh from '../PullToRefresh';

interface AppLayoutProps {
    isFullScreen: boolean;
    children: React.ReactNode;
    onRefresh?: () => Promise<void> | void;
    enablePullToRefresh?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
    isFullScreen, 
    children, 
    onRefresh,
    enablePullToRefresh = true 
}) => {
    const handleRefresh = async () => {
        if (onRefresh) {
            await onRefresh();
        } else {
            // Default refresh behavior - reload current page data
            window.location.reload();
        }
    };
    
    const content = (
        <div className={isFullScreen ? "w-full min-h-screen mobile-optimized" : "max-w-md mx-auto min-h-screen bg-white shadow-lg mobile-optimized container-mobile"}>
            <div className="content-landscape">
                {children}
            </div>
        </div>
    );

    // Elite pull-to-refresh wrapper for mobile experience
    if (enablePullToRefresh && 'ontouchstart' in window) {
        return (
            <PullToRefresh 
                onRefresh={handleRefresh}
                eliteMode={true}
                errorBoundary={true}
                threshold={90}
                className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
                loadingText="🔄 Refreshing..."
                releaseText="↑ Release to refresh"
                pullText="↓ Pull to refresh"
            >
                {content}
            </PullToRefresh>
        );
    }

    return content;
};
