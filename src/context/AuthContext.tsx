import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, Agent } from '../types';
import { restoreSession, logout as sessionLogout, saveSessionCache } from '../lib/sessionManager';

type LoggedInProvider = { id: number | string; type: 'therapist' | 'place' };
type LoggedInUser = { id: string; type: 'admin' | 'hotel' | 'villa' | 'agent' };

interface AuthContextType {
    // Users
    user: User | null;
    setUser: (user: User | null) => void;
    
    // Admin
    isAdminLoggedIn: boolean;
    setIsAdminLoggedIn: (value: boolean) => void;
    
    // Logged in users (admin, hotel, villa, agent)
    loggedInUser: LoggedInUser | null;
    setLoggedInUser: (user: LoggedInUser | null) => void;
    
    // Customer
    loggedInCustomer: any | null;
    setLoggedInCustomer: (customer: any | null) => void;
    
    // Provider (therapist/place)
    loggedInProvider: LoggedInProvider | null;
    setLoggedInProvider: (provider: LoggedInProvider | null) => void;
    
    // Agent
    loggedInAgent: Agent | null;
    setLoggedInAgent: (agent: Agent | null) => void;
    
    impersonatedAgent: Agent | null;
    setImpersonatedAgent: (agent: Agent | null) => void;
    
    // Hotel/Villa
    isHotelLoggedIn: boolean;
    setIsHotelLoggedIn: (value: boolean) => void;
    
    isVillaLoggedIn: boolean;
    setIsVillaLoggedIn: (value: boolean) => void;
    
    // Auth actions
    logout: () => void;
    restoreUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [loggedInUser, _setLoggedInUser] = useState<LoggedInUser | null>(null);
    const [loggedInCustomer, setLoggedInCustomer] = useState<any | null>(null);
    const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);
    const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);
    const [impersonatedAgent, setImpersonatedAgent] = useState<Agent | null>(null);
    const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false);
    const [isVillaLoggedIn, setIsVillaLoggedIn] = useState(false);

    const setLoggedInUser = useCallback((newUser: LoggedInUser | null) => {
        _setLoggedInUser(newUser);
        if (newUser) {
            saveSessionCache({ user: newUser });
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAdminLoggedIn(false);
        setLoggedInUser(null);
        setLoggedInCustomer(null);
        setLoggedInProvider(null);
        setLoggedInAgent(null);
        setImpersonatedAgent(null);
        setIsHotelLoggedIn(false);
        setIsVillaLoggedIn(false);
        sessionLogout();
    }, []);

    const restoreUserSession = useCallback(async () => {
        try {
            const session = await restoreSession();
            if (session?.user) {
                setLoggedInUser(session.user as LoggedInUser);
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
        }
    }, []);

    const value: AuthContextType = {
        user,
        setUser,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        loggedInUser,
        setLoggedInUser,
        loggedInCustomer,
        setLoggedInCustomer,
        loggedInProvider,
        setLoggedInProvider,
        loggedInAgent,
        setLoggedInAgent,
        impersonatedAgent,
        setImpersonatedAgent,
        isHotelLoggedIn,
        setIsHotelLoggedIn,
        isVillaLoggedIn,
        setIsVillaLoggedIn,
        logout,
        restoreUserSession
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
