/**
 * useSessionRestore - Handles automatic session restoration on app startup
 * Checks for existing Appwrite sessions and restores user state
 */

import { useEffect, useCallback } from 'react';
import { restoreSession } from '../lib/sessionManager';

interface UseSessionRestoreProps {
    setLoggedInProvider: (provider: any) => void;
    setLoggedInCustomer: (customer: any) => void;
    setLoggedInAgent: (agent: any) => void;
    setIsHotelLoggedIn: (value: boolean) => void;
    setIsVillaLoggedIn: (value: boolean) => void;
}

export const useSessionRestore = (props: UseSessionRestoreProps) => {
    const {
        setLoggedInProvider,
        setLoggedInCustomer,
        setLoggedInAgent,
        setIsHotelLoggedIn,
        setIsVillaLoggedIn
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

            // Restore state based on user type (but don't auto-navigate to dashboards)
            switch (sessionUser.type) {
                case 'hotel':
                    setIsHotelLoggedIn(true);
                    // Don't auto-navigate to hotel dashboard - let user manually access it
                    break;
                
                case 'villa':
                    setIsVillaLoggedIn(true);
                    // Don't auto-navigate to villa dashboard - let user manually access it
                    break;
                
                case 'therapist':
                    setLoggedInProvider({
                        id: sessionUser.id,
                        type: 'therapist',
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    // Don't auto-navigate to therapist dashboard - let user manually access it
                    break;
                
                case 'place':
                    setLoggedInProvider({
                        id: sessionUser.id,
                        type: 'place',
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    // Don't auto-navigate to place dashboard - let user manually access it
                    break;
                
                case 'agent':
                    setLoggedInAgent({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    // Don't auto-navigate to agent dashboard - let user manually access it
                    break;
                
                case 'user':
                    setLoggedInCustomer({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    // Don't auto-navigate to customer dashboard - let user manually access it
                    break;
                
                default:
                    console.warn('Unknown user type:', sessionUser.type);
            }
        } catch (error) {
            console.error('❌ Session restoration failed:', error);
        }
    }, [
        setLoggedInProvider,
        setLoggedInCustomer,
        setLoggedInAgent,
        setIsHotelLoggedIn,
        setIsVillaLoggedIn
    ]);

    // Restore session on app startup - ALWAYS call this hook in the same order
    useEffect(() => {
        let isMounted = true;
        
        const runSessionRestore = async () => {
            try {
                // Skip session restoration if the user explicitly wants to start fresh
                const startFresh = sessionStorage.getItem('start_fresh');
                if (startFresh) {
                    console.log('🔄 Starting fresh - skipping session restoration');
                    return;
                }

                if (isMounted) {
                    await restoreUserSession();
                }
            } catch (error) {
                if (isMounted) {
                    console.error('❌ Session restoration error:', error);
                }
            }
        };

        runSessionRestore();
        
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array to run only once

    return { restoreUserSession };
};