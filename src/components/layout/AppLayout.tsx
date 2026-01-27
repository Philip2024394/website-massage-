import React from 'react';
// Disabled custom PullToRefresh - using native browser pull-to-refresh instead
// import PullToRefresh from '../PullToRefresh';

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
    // Native browser pull-to-refresh is now enabled via CSS (overscroll-behavior: auto)
    // No custom component needed - mobile browsers handle this natively
    
    const content = (
        <div className={isFullScreen ? "min-h-screen flex flex-col mobile-optimized" : "max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col mobile-optimized container-mobile"}>
            <div className="flex-1 content-landscape overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </div>
    );

    // Return content directly - native pull-to-refresh is handled by browser
    return content;
};
