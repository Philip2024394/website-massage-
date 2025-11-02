/**
 * useSessionRestore - Handles automatic session restoration on app startup
 * Checks for existing Appwrite sessions and restores user state
 */

import { useEffect, useCallback } from 'react';
import { restoreSession } from '../lib/sessionManager';
import type { Page } from '../types/pageTypes';

interface UseSessionRestoreProps {
    setIsAdminLoggedIn: (value: boolean) => void;
    setLoggedInUser: (user: any) => void;
    setLoggedInProvider: (provider: any) => void;
    setLoggedInCustomer: (customer: any) => void;
    setLoggedInAgent: (agent: any) => void;
    setIsHotelLoggedIn: (value: boolean) => void;
    setIsVillaLoggedIn: (value: boolean) => void;
    setPage: (page: Page) => void;
    setAdminDashboardTab: (tab: 'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'confirm-accounts' | 'chat-messages' | 'drawer-buttons' | 'agent-commission' | 'bank-details' | 'payment-transactions' | 'shop-management' | 'membership-pricing') => void;
}

export const useSessionRestore = (props: UseSessionRestoreProps) => {
    const {
        setIsAdminLoggedIn,
        setLoggedInUser,
        setLoggedInProvider,
        setLoggedInCustomer,
        setLoggedInAgent,
        setIsHotelLoggedIn,
        setIsVillaLoggedIn,
        setPage,
        setAdminDashboardTab
    } = props;

    const restoreUserSession = useCallback(async () => {
        try {
            console.log('🔄 Checking for existing Appwrite session...');
            const sessionUser = await restoreSession();
            
            if (!sessionUser) {
                console.log('📭 No session to restore');
                return;
            }

            console.log('✅ Session restored for:', sessionUser.type, sessionUser.email);

            // Restore state based on user type
            switch (sessionUser.type) {
                case 'admin':
                    setIsAdminLoggedIn(true);
                    setLoggedInUser({ id: sessionUser.id, type: 'admin', email: sessionUser.email });
                    setAdminDashboardTab('membership-pricing');
                    setPage('adminDashboard');
                    break;
                
                case 'hotel':
                    setIsHotelLoggedIn(true);
                    setLoggedInUser({ id: sessionUser.id, type: 'hotel', email: sessionUser.email });
                    setPage('hotelDashboard');
                    break;
                
                case 'villa':
                    setIsVillaLoggedIn(true);
                    setLoggedInUser({ id: sessionUser.id, type: 'villa', email: sessionUser.email });
                    setPage('villaDashboard');
                    break;
                
                case 'therapist':
                    setLoggedInProvider({
                        id: sessionUser.id,
                        type: 'therapist',
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setPage('therapistDashboard');
                    break;
                
                case 'place':
                    setLoggedInProvider({
                        id: sessionUser.id,
                        type: 'place',
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setPage('placeDashboard');
                    break;
                
                case 'agent':
                    setLoggedInAgent({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setPage('agentDashboard');
                    break;
                
                case 'user':
                    setLoggedInCustomer({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setPage('customerDashboard');
                    break;
                
                default:
                    console.warn('Unknown user type:', sessionUser.type);
            }
        } catch (error) {
            console.error('❌ Session restoration failed:', error);
        }
    }, [
        setIsAdminLoggedIn,
        setLoggedInUser,
        setLoggedInProvider,
        setLoggedInCustomer,
        setLoggedInAgent,
        setIsHotelLoggedIn,
        setIsVillaLoggedIn,
        setPage,
        setAdminDashboardTab
    ]);

    // Restore session on app startup
    useEffect(() => {
        // Skip session restoration if the user explicitly wants to start fresh
        const startFresh = sessionStorage.getItem('start_fresh');
        if (startFresh) {
            console.log('🔄 Starting fresh - skipping session restoration');
            return;
        }

        restoreUserSession();
    }, [restoreUserSession]);

    return { restoreUserSession };
};