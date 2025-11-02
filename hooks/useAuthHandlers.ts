/**
 * useAuthHandlers Hook
 * Handles authentication operations like logout
 */

import { useCallback } from 'react';
import type { Page } from '../types/pageTypes';
import { logout as sessionLogout } from '../lib/sessionManager';

interface UseAuthHandlersProps {
    setPage: (page: Page) => void;
    setIsAdminLoggedIn: (value: boolean) => void;
    setIsHotelLoggedIn: (value: boolean) => void;
    setIsVillaLoggedIn: (value: boolean) => void;
    setLoggedInUser: React.Dispatch<React.SetStateAction<any>>;
    setLoggedInCustomer: React.Dispatch<React.SetStateAction<any>>;
    setLoggedInAgent: React.Dispatch<React.SetStateAction<any>>;
    setLoggedInProvider: React.Dispatch<React.SetStateAction<any>>;
    setImpersonatedAgent?: React.Dispatch<React.SetStateAction<any>>;
}

export const useAuthHandlers = ({
    setPage,
    setIsAdminLoggedIn,
    setIsHotelLoggedIn,
    setIsVillaLoggedIn,
    setLoggedInUser,
    setLoggedInCustomer,
    setLoggedInAgent,
    setLoggedInProvider,
    setImpersonatedAgent
}: UseAuthHandlersProps) => {

    const handleProviderLogout = useCallback(async () => {
        await sessionLogout();
        setLoggedInProvider(null);
        setPage('home');
    }, [setLoggedInProvider, setPage]);

    const handleHotelLogout = useCallback(async () => {
        await sessionLogout();
        setIsHotelLoggedIn(false);
        setLoggedInUser(null);
        setPage('home');
        console.log('✅ Hotel logout successful');
    }, [setIsHotelLoggedIn, setLoggedInUser, setPage]);

    const handleVillaLogout = useCallback(async () => {
        await sessionLogout();
        setIsVillaLoggedIn(false);
        setLoggedInUser(null);
        setPage('home');
        console.log('✅ Villa logout successful');
    }, [setIsVillaLoggedIn, setLoggedInUser, setPage]);

    const handleAdminLogout = useCallback(async () => {
        await sessionLogout();
        setIsAdminLoggedIn(false);
        setLoggedInUser(null);
        if (setImpersonatedAgent) {
            setImpersonatedAgent(null);
        }
        setPage('home');
        console.log('✅ Admin logout successful');
    }, [setIsAdminLoggedIn, setLoggedInUser, setImpersonatedAgent, setPage]);

    const handleCustomerLogout = useCallback(async () => {
        await sessionLogout();
        setLoggedInCustomer(null);
        setPage('home');
    }, [setLoggedInCustomer, setPage]);

    const handleAgentLogout = useCallback(async () => {
        await sessionLogout();
        setLoggedInAgent(null);
        setPage('home');
    }, [setLoggedInAgent, setPage]);

    const handleAdminLogin = useCallback(() => {
        console.log('🎯 handleAdminLogin called - navigating to admin dashboard');
        setIsAdminLoggedIn(true);
        setPage('adminDashboard');
    }, [setIsAdminLoggedIn, setPage]);

    return {
        handleProviderLogout,
        handleHotelLogout,
        handleVillaLogout,
        handleAdminLogout,
        handleCustomerLogout,
        handleAgentLogout,
        handleAdminLogin,
    };
};
