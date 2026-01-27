/**
 * Universal hook for handling shared profile pages
 * Works for therapists, places, and facial places
 * Supports both long IDs and short URLs (#12345)
 */

import { useState, useEffect, useMemo } from 'react';
import { extractProviderIdFromURL } from '../utils/shareUrlBuilder';
import { extractShortIdentifier, resolveShortUrl } from '../utils/shortUrlResolver';
import type { Therapist, Place } from '../../../types';

interface UseSharedProfileProps<T> {
    providers: T[];
    providerType: 'therapist' | 'place' | 'facial';
    selectedProvider?: T | null;
}

interface UseSharedProfileResult<T> {
    provider: T | null;
    loading: boolean;
    error: string | null;
    providerId: string;
}

export function useSharedProfile<T extends (Therapist | Place)>({
    providers,
    providerType,
    selectedProvider
}: UseSharedProfileProps<T>): UseSharedProfileResult<T> {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedProvider, setResolvedProvider] = useState<T | null>(null);

    // Extract ID from URL - support both long IDs and short format
    const { id: providerId, type: urlType, isShortUrl } = useMemo(() => {
        const shortId = extractShortIdentifier(window.location.href);
        
        // If it's a short numeric ID or slug, mark as short URL
        if (shortId && (!/^[a-f0-9]{20,}$/i.test(shortId) || shortId.includes('-'))) {
            return { id: shortId, type: null, isShortUrl: true };
        }
        
        // Otherwise use the old method for long IDs
        const result = extractProviderIdFromURL(window.location.href);
        return { ...result, isShortUrl: false };
    }, []);

    // Resolve short URL if needed
    useEffect(() => {
        if (isShortUrl && providerId && providers && providers.length > 0) {
            resolveShortUrl(providerId, providers)
                .then(({ entity }) => {
                    setResolvedProvider(entity);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to resolve short URL:', err);
                    setError('Share link not found');
                    setLoading(false);
                });
        }
    }, [isShortUrl, providerId, providers]);

    // Find provider by ID
    const provider = useMemo(() => {
        // If provider is already selected, use it
        if (selectedProvider) return selectedProvider;

        // If resolved from short URL, use that
        if (resolvedProvider) return resolvedProvider;

        // Skip resolution if waiting for short URL lookup
        if (isShortUrl) {
            return null;
        }

        // Validate URL type matches expected type
        if (urlType && urlType !== providerType) {
            console.warn(`URL type (${urlType}) doesn't match expected type (${providerType})`);
            setError(`Invalid provider type in URL`);
            return null;
        }

        if (!providerId || !providers || providers.length === 0) {
            console.warn('No provider ID or providers list available');
            setError('Provider not found');
            return null;
        }

        // Find by ID (try multiple ID field names)
        const found = providers.find((p) => {
            const pId = (p as any).id ?? (p as any).$id ?? '';
            const pIdStr = pId.toString();
            
            // Try exact match
            if (pIdStr === providerId) return true;
            
            // Try without dashes/special chars
            const normalizedPId = pIdStr.replace(/[-_]/g, '');
            const normalizedProviderId = providerId.replace(/[-_]/g, '');
            if (normalizedPId === normalizedProviderId) return true;
            
            return false;
        });

        if (!found) {
            console.warn(`Provider not found with ID: ${providerId}`);
            console.log('Available IDs:', providers.map(p => ({
                id: (p as any).id ?? (p as any).$id,
                name: (p as any).name
            })));
            setError('Provider not found');
        }

        return found || null;
    }, [selectedProvider, resolvedProvider, providers, providerId, providerType, urlType, isShortUrl]);

    useEffect(() => {
        setLoading(false);
    }, [provider]);

    return {
        provider,
        loading,
        error,
        providerId
    };
}
