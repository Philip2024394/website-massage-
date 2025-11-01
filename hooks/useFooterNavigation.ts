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
            switch(loggedInUser.type) {
                case 'admin': setPage('adminDashboard'); break;
                case 'hotel': setPage('home'); break;
                case 'villa': setPage('home'); break;
                case 'agent': setPage('agentDashboard'); break;
            }
        } else if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInAgent) {
            setPage('agentDashboard');
        } else if (loggedInCustomer) {
            setPage('home');
        } else if (isHotelLoggedIn) {
            setPage('hotelDashboard');
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
        } else if (loggedInAgent) {
            setPage('agentDashboard');
        } else if (loggedInCustomer) {
            setPage('customerDashboard');
        } else if (isHotelLoggedIn) {
            setPage('hotelDashboard');
        }
    };

    const handleFooterProfile = () => {
        if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInAgent) {
            setPage('agentDashboard');
        } else if (loggedInCustomer) {
            setPage('customerDashboard');
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
