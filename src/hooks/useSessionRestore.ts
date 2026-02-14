/**
 * useSessionRestore - Handles automatic session restoration on app startup
 * Checks for existing Appwrite sessions and restores user state
 * 🔒 GOLD STANDARD FIX - DO NOT MODIFY
 * Single source of truth session management 
 * Last verified: 2026-02-07
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
            console.log('🔄 [SESSION RESTORE] Starting gold standard session restoration...');
            const sessionUser = await restoreSession();
            
            console.log('🔄 [SESSION RESTORE] Session result:', {
                hasSessionUser: !!sessionUser,
                type: sessionUser?.type,
                email: sessionUser?.email,
                id: sessionUser?.id,
                documentId: sessionUser?.documentId,
                hasData: !!sessionUser?.data
            });
            
            if (!sessionUser) {
                console.log('📭 [SESSION RESTORE] No session to restore - clearing all auth states');
                // 🔒 GOLD STANDARD: Clear all auth states consistently
                setLoggedInProvider(null);
                setLoggedInCustomer(null);
                setLoggedInAgent(null);
                setLoggedInUser(null);
                setIsHotelLoggedIn(false);
                setIsVillaLoggedIn(false);
                return;
            }

            console.log('✅ [SESSION RESTORE] Session restored for:', sessionUser.type, sessionUser.email);

            // 🔒 GOLD STANDARD: Single source of truth for all authentication states
            // Create the user data object ONCE to prevent race conditions
            const userData = {
                id: sessionUser.id,
                type: sessionUser.type,
                email: sessionUser.email,
                name: sessionUser.data?.name,
                data: sessionUser.data
            };

            console.log('🔧 [SESSION RESTORE] Setting auth states with single source of truth:', {
                type: sessionUser.type,
                id: sessionUser.id,
                email: sessionUser.email,
                hasData: !!sessionUser.data
            });

            // Restore state based on user type (but don't auto-navigate to dashboards)
            switch (sessionUser.type) {
                case 'hotel':
                    setIsHotelLoggedIn(true);
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Hotel state set using single source');
                    break;
                
                case 'villa':
                    setIsVillaLoggedIn(true);
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Villa state set using single source');
                    break;
                
                case 'therapist':
                    // 🔒 GOLD STANDARD: Use single data object for both provider and user states
                    const therapistProviderData = {
                        id: sessionUser.id,
                        type: 'therapist',
                        email: sessionUser.email,
                        ...sessionUser.data
                    };
                    setLoggedInProvider(therapistProviderData);
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Therapist state set using gold standard single source');
                    break;
                
                case 'place':
                    const placeProviderData = {
                        id: sessionUser.id,
                        type: 'place',
                        email: sessionUser.email,
                        ...sessionUser.data
                    };
                    setLoggedInProvider(placeProviderData);
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Place state set using single source');
                    break;
                
                case 'agent':
                    const agentData = {
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    };
                    setLoggedInAgent(agentData);
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Agent state set using single source');
                    break;
                
                case 'user':
                    const customerData = {
                        id: sessionUser.id,
                        email: sessionUser.email,
                        ...sessionUser.data
                    };
                    setLoggedInCustomer(customerData);
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Customer state set using single source');
                    break;

                case 'employer':
                    setLoggedInUser(userData);
                    console.log('✅ [SESSION RESTORE] Employer state set');
                    break;
                
                default:
                    console.warn('⚠️ [SESSION RESTORE] Unknown user type:', sessionUser.type);
                    // 🔒 GOLD STANDARD: Still set user data for unknown types
                    setLoggedInUser(userData);
            }
        } catch (error) {
            console.error('❌ [SESSION RESTORE] Gold standard error handling:', error);
            
            // 🔒 GOLD STANDARD: Clear all auth states on any session restoration failure
            setLoggedInProvider(null);
            setLoggedInCustomer(null);
            setLoggedInAgent(null);
            setLoggedInUser(null);
            setIsHotelLoggedIn(false);
            setIsVillaLoggedIn(false);
            
            console.log('🧹 [SESSION RESTORE] All auth states cleared due to restoration failure');
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
                    console.error('❌ [SESSION RESTORE] useEffect error handler:', error);
                    console.log('🔒 GOLD STANDARD: Session restoration failed safely, app remains stable');
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