/**
 * Navigation Hook - Provides URL-aware navigation
 * Use this hook in components to navigate between pages while keeping URLs in sync
 */

import { useCallback } from 'react';
import type { Page } from '../types/pageTypes';
import { updateBrowserUrl } from './urlMapper';

export function useNavigation(setPageFn: (page: Page) => void) {
    const navigate = useCallback((page: Page, params?: Record<string, string>) => {
        // Update page state
        setPageFn(page);
        
        // Update browser URL
        updateBrowserUrl(page, params, false);
    }, [setPageFn]);
    
    const replace = useCallback((page: Page, params?: Record<string, string>) => {
        // Update page state
        setPageFn(page);
        
        // Replace browser URL (don't add to history)
        updateBrowserUrl(page, params, true);
    }, [setPageFn]);
    
    return {
        navigate,
        replace
    };
}
