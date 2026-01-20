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
    setLoggedInUser: (user: any) => void;
}

export const useSessionRestore = (props: UseSessionRestoreProps) => {
    const {
        setLoggedInProvider,
        setLoggedInCustomer,
        setLoggedInAgent,
        setIsHotelLoggedIn,
        setIsVillaLoggedIn,
        setLoggedInUser
    } = props;

    const restoreUserSession = useCallback(async () => {
        try {
            console.log('🔄 [SESSION RESTORE] Checking for existing Appwrite session...');
            const sessionUser = await restoreSession();
            
            console.log('🔄 [SESSION RESTORE] restoreSession() result:', {
                hasSessionUser: !!sessionUser,
                type: sessionUser?.type,
                email: sessionUser?.email,
                id: sessionUser?.id,
                documentId: sessionUser?.documentId,
                hasData: !!sessionUser?.data
            });
            
            if (!sessionUser) {
                console.log('📭 [SESSION RESTORE] No session to restore');
                return;
            }

            console.log('✅ [SESSION RESTORE] Session restored for:', sessionUser.type, sessionUser.email);

            // Restore state based on user type (but don't auto-navigate to dashboards)
            switch (sessionUser.type) {
                case 'hotel':
                    setIsHotelLoggedIn(true);
                    setLoggedInUser({
                        id: sessionUser.id,
                        type: 'hotel',
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        data: sessionUser.data
                    });
                    // Don't auto-navigate to hotel dashboard - let user manually access it
                    break;
                
                case 'villa':
                    setIsVillaLoggedIn(true);
                    setLoggedInUser({
                        id: sessionUser.id,
                        type: 'villa',
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        data: sessionUser.data
                    });
                    // Don't auto-navigate to villa dashboard - let user manually access it
                    break;
                
                case 'therapist':
                    console.log('🔧 [SESSION RESTORE] Setting therapist state:', {
                        id: sessionUser.id,
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        hasData: !!sessionUser.data
                    });
                    setLoggedInProvider({
                        id: sessionUser.id,
                        type: 'therapist',
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setLoggedInUser({
                        id: sessionUser.id,
                        type: 'therapist',
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        data: sessionUser.data
                    });
                    console.log('✅ [SESSION RESTORE] Therapist state set successfully');
                    // Don't auto-navigate to therapist dashboard - let user manually access it
                    break;
                
                case 'place':
                    setLoggedInProvider({
                        id: sessionUser.id,
                        type: 'place',
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setLoggedInUser({
                        id: sessionUser.id,
                        type: 'place',
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        data: sessionUser.data
                    });
                    // Don't auto-navigate to place dashboard - let user manually access it
                    break;
                
                case 'agent':
                    setLoggedInAgent({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setLoggedInUser({
                        id: sessionUser.id,
                        type: 'agent',
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        data: sessionUser.data
                    });
                    // Don't auto-navigate to agent dashboard - let user manually access it
                    break;
                
                case 'user':
                    setLoggedInCustomer({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    });
                    setLoggedInUser({
                        id: sessionUser.id,
                        type: 'user',
                        email: sessionUser.email,
                        name: sessionUser.data?.name,
                        data: sessionUser.data
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
        setIsVillaLoggedIn,
        setLoggedInUser
    ]);

    // Restore session on app startup - ALWAYS call this hook in the same order
    useEffect(() => {
        let isMounted = true;
        
        console.log('🚀 [SESSION RESTORE] useEffect triggered - will attempt restoration');
        
        const runSessionRestore = async () => {
            try {
                // Skip session restoration if the user explicitly wants to start fresh
                const startFresh = sessionStorage.getItem('start_fresh');
                if (startFresh) {
                    console.log('🔄 [SESSION RESTORE] Starting fresh - skipping session restoration');
                    return;
                }

                console.log('🚀 [SESSION RESTORE] Calling restoreUserSession()');
                if (isMounted) {
                    await restoreUserSession();
                }
                console.log('🚀 [SESSION RESTORE] restoreUserSession() completed');
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