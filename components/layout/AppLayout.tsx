import React from 'react';

interface AppLayoutProps {
    isFullScreen: boolean;
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isFullScreen, children }) => {
    return (
        <div className={isFullScreen ? "h-full flex flex-col mobile-optimized" : "max-w-md mx-auto h-full bg-white shadow-lg flex flex-col mobile-optimized container-mobile"}>
            <div className="flex-1 content-landscape overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </div>
    );
};
