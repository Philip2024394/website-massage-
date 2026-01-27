/**
 * useRouteConfig - Enterprise routing hook
 * Provides type-safe navigation and route management
 */

import { useState, useCallback } from 'react';
import type { Page } from '../types/pageTypes';

export interface RouteNavigator {
    currentPage: Page;
    navigate: (page: Page) => void;
    goBack: () => void;
    canGoBack: boolean;
}

/**
 * Hook for managing route navigation with history
 */
export const useRouteConfig = (initialPage: Page = 'landing'): RouteNavigator => {
    const [currentPage, setCurrentPage] = useState<Page>(initialPage);
    const [history, setHistory] = useState<Page[]>([initialPage]);
    
    const navigate = useCallback((page: Page) => {
        setCurrentPage(page);
        setHistory(prev => [...prev, page]);
    }, []);
    
    const goBack = useCallback(() => {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1);
            setHistory(newHistory);
            setCurrentPage(newHistory[newHistory.length - 1]);
        }
    }, [history]);
    
    return {
        currentPage,
        navigate,
        goBack,
        canGoBack: history.length > 1,
    };
};
