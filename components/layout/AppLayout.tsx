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
        console.log('🔄 Pull to refresh triggered');
        
        // Default refresh behavior - reload current data
        if (onRefresh) {
            await onRefresh();
        } else {
            // Fallback: trigger a soft reload by dispatching a refresh event
            window.dispatchEvent(new CustomEvent('app-refresh', { 
                detail: { 
                    timestamp: Date.now(),
                    source: 'pull-to-refresh'
                }
            }));
            
            // Show user feedback
            if ('navigator' in window && 'vibrate' in navigator) {
                navigator.vibrate(50); // Gentle feedback
            }
            
            // Wait a moment for visual feedback
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const content = (
        <div className={isFullScreen ? "h-full flex flex-col mobile-optimized" : "max-w-md mx-auto h-full bg-white shadow-lg flex flex-col mobile-optimized container-mobile"}>
            <div className="flex-1 content-landscape overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </div>
    );

    // Only wrap with pull-to-refresh on mobile devices or if explicitly enabled
    if (enablePullToRefresh && typeof window !== 'undefined') {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile || window.innerWidth <= 768) {
            return (
                <PullToRefresh onRefresh={handleRefresh}>
                    {content}
                </PullToRefresh>
            );
        }
    }

    return content;
};
