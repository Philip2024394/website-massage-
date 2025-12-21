/**
 * DashboardHeader - Enterprise header component
 */

import React, { ReactNode } from 'react';

export interface DashboardHeaderProps {
    title: string;
    provider: {
        name: string;
        type: string;
        avatar?: string;
    };
    actions?: ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title,
    provider,
    actions,
}) => {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {provider.avatar && (
                            <img
                                src={provider.avatar}
                                alt={provider.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-600">{provider.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {actions}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
