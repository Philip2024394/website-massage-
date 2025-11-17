import type { Page, LoggedInProvider, LoggedInUser } from '../types/pageTypes';
import type { Agent } from '../types';

interface UseFooterNavigationProps {
    setPage: (page: Page) => void;
    loggedInUser: LoggedInUser | null;
    loggedInProvider: LoggedInProvider | null;
    loggedInAgent: Agent | null;
    loggedInCustomer: any | null;
    isHotelLoggedIn: boolean;
}

export const useFooterNavigation = ({
    setPage,
    loggedInUser,
    loggedInProvider,
    loggedInAgent,
    loggedInCustomer,
    isHotelLoggedIn
}: UseFooterNavigationProps) => {
    const handleFooterHome = () => {
        if (loggedInUser) {
            if (loggedInUser.type === 'admin') setPage('adminDashboard');
        } else if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInCustomer) {
            setPage('home');
        } else {
            setPage('home');
        }
    };

    const handleFooterDashboard = () => {
        if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInCustomer) {
            setPage('customerDashboard');
        }
    };

    const handleFooterProfile = () => {
        if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInCustomer) {
            setPage('customerDashboard');
        } else {
            // 🎯 NEW: Show guest profile page for unregistered users
            setPage('profile');
        }
    };

    const handleFooterMenu = () => {
        setPage('home');
    };

    return {
        handleFooterHome,
        handleFooterDashboard,
        handleFooterProfile,
        handleFooterMenu
    };
};
