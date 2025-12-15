import React from 'react';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface AdminRouterProps {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    therapists: any[];
    places: any[];
    facialPlaces: any[];
    pendingApprovals: any[];
    onLogin: (email: string, password: string) => Promise<boolean>;
    onLogout: () => Promise<void>;
    onRefreshData: () => Promise<void>;
}

type AdminPage = 'login' | 'dashboard' | 'pending-approvals' | 'therapists' | 'places' | 'facials' | 'settings';

/**
 * Admin Router
 * Handles routing for the standalone admin app
 */
const AdminRouter: React.FC<AdminRouterProps> = ({
    isAuthenticated,
    isLoading,
    user,
    therapists,
    places,
    facialPlaces,
    pendingApprovals,
    onLogin,
    onLogout,
    onRefreshData
}) => {
    const [currentPage, setCurrentPage] = React.useState<AdminPage>('login');

    // Auto-navigate based on auth state
    React.useEffect(() => {
        if (isAuthenticated && currentPage === 'login') {
            console.log('🎯 AdminRouter: User authenticated, navigating to dashboard');
            setCurrentPage('dashboard');
        } else if (!isAuthenticated && currentPage !== 'login') {
            console.log('🎯 AdminRouter: User not authenticated, navigating to login');
            setCurrentPage('login');
        }
    }, [isAuthenticated, currentPage]);

    if (isLoading) {
        return <LoadingSpinner message="Loading admin..." />;
    }

    // Login page (unauthenticated)
    if (!isAuthenticated) {
        return (
            <AdminLoginPage
                onAdminLogin={onLogin}
                onBack={() => {
                    // Redirect to main app
                    window.location.href = '/';
                }}
            />
        );
    }

    // Dashboard (authenticated)
    switch (currentPage) {
        case 'dashboard':
        default:
            return (
                <AdminDashboardPage
                    onLogout={onLogout}
                />
            );
    }
};

export default AdminRouter;
