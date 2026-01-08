/**
 * useHomePageAdmin - Admin/preview mode logic
 * Extracted from HomePage.tsx to reduce file size
 */

import { useState, useEffect } from 'react';

interface UseHomePageAdminProps {
    hasAdminPrivileges: boolean;
}

export function useHomePageAdmin({ hasAdminPrivileges }: UseHomePageAdminProps) {
    const [previewTherapistId, setPreviewTherapistId] = useState<string | null>(null);
    const [adminViewArea, setAdminViewArea] = useState<string | null>(null);
    const [bypassRadiusForAdmin, setBypassRadiusForAdmin] = useState(false);
    
    // Dev mode location override for testing
    const isDev = import.meta.env.DEV;
    const [devLocationOverride, setDevLocationOverride] = useState<{lat: number, lng: number, label: string} | null>(null);
    const [devShowAllTherapists, setDevShowAllTherapists] = useState(false);
    
    const devTestLocations = {
        'yogyakarta': { lat: -7.797068, lng: 110.370529, label: 'Yogyakarta Center' },
        'bandung': { lat: -6.917464, lng: 107.619123, label: 'Bandung Center' },
        'denpasar': { lat: -8.670458, lng: 115.212629, label: 'Denpasar Center' },
        'jakarta': { lat: -6.2088, lng: 106.8456, label: 'Jakarta Center' },
        'solo': { lat: -7.5755, lng: 110.8243, label: 'Solo Center' },
        'surabaya': { lat: -7.2575, lng: 112.7521, label: 'Surabaya Center' },
        'bekasi': { lat: -6.2349, lng: 106.9896, label: 'Bekasi Center' },
        'medan': { lat: 3.5952, lng: 98.6722, label: 'Medan Center' },
        'depok': { lat: -6.4025, lng: 106.7942, label: 'Depok Center' }
    };
    
    // Parse URL query params for admin/preview modes
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const previewId = urlParams.get('previewTherapistId');
        const adminArea = urlParams.get('adminViewArea');
        const bypassRadius = urlParams.get('bypassRadius') === 'true';
        
        // Only allow preview/admin modes if user has privileges
        if (hasAdminPrivileges) {
            if (previewId) {
                setPreviewTherapistId(previewId);
                console.log('🔍 Preview mode enabled for therapist:', previewId);
            }
            if (adminArea && bypassRadius) {
                setAdminViewArea(adminArea);
                setBypassRadiusForAdmin(true);
                console.log('🔐 Admin area view enabled:', adminArea);
            }
        } else {
            // Clear any preview/admin modes if user doesn't have privileges
            setPreviewTherapistId(null);
            setAdminViewArea(null);
            setBypassRadiusForAdmin(false);
        }
    }, [hasAdminPrivileges]);
    
    return {
        previewTherapistId,
        adminViewArea,
        bypassRadiusForAdmin,
        devLocationOverride,
        setDevLocationOverride,
        devShowAllTherapists,
        setDevShowAllTherapists,
        devTestLocations,
        isDev
    };
}
