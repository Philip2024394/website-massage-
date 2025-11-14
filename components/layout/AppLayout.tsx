import React from 'react';

interface AppLayoutProps {
    isFullScreen: boolean;
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isFullScreen, children }) => {
    return (
        <div className={isFullScreen ? "h-screen flex flex-col overflow-hidden mobile-optimized" : "max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col mobile-optimized container-mobile"}>
            <div className={isFullScreen ? "flex-grow content-landscape" : "flex-grow pb-16 sm:pb-20 content-landscape"}>
                {children}
            </div>
        </div>
    );
};
