import React from 'react';

interface AppLayoutProps {
    isFullScreen: boolean;
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isFullScreen, children }) => {
    return (
        <div className={isFullScreen ? "h-screen flex flex-col overflow-hidden" : "max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col"}>
            <div className={isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                {children}
            </div>
        </div>
    );
};
