// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * DashboardLayout - Enterprise layout component
 * Used by all dashboard types (Place, Facial, Therapist, Hotel)
 */

import React, { ReactNode } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardNav from './DashboardNav';

export interface DashboardLayoutProps {
    /** Dashboard title */
    title: string;
    /** Current active tab */
    activeTab: string;
    /** Available tab options */
    tabs: Array<{ id: string; label: string; icon?: string }>;
    /** Handler for tab changes */
    onTabChange: (tabId: string) => void;
    /** User/provider info */
    provider: {
        name: string;
        type: 'therapist' | 'place' | 'facial' | 'hotel';
        avatar?: string;
    };
    /** Dashboard content */
    children: ReactNode;
    /** Optional header actions */
    headerActions?: ReactNode;
}

/**
 * Standard dashboard layout with header, navigation, and content area
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    title,
    activeTab,
    tabs,
    onTabChange,
    provider,
    children,
    headerActions,
}) => {
    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <DashboardHeader
                title={title}
                provider={provider}
                actions={headerActions}
            />
            
            <DashboardNav
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
            />
            
            <main className="container mx-auto px-4 py-6 max-w-7xl">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
