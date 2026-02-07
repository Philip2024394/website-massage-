/**
 * Place SafePass Application Wrapper
 * Integrates with place authentication and data
 */

import React, { useEffect, useState } from 'react';
import PlaceSafePassApplication from './PlaceSafePassApplication';

const PlaceSafePassWrapper: React.FC = () => {
    const [placeId, setPlaceId] = useState<string>('');
    const [placeName, setPlaceName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlace();
    }, []);

    const loadPlace = async () => {
        try {
            // Get place ID and name from localStorage or session
            const id = localStorage.getItem('placeId');
            const name = localStorage.getItem('placeName');
            
            if (!id || !name) {
                console.error('No place information found');
                setLoading(false);
                return;
            }

            setPlaceId(id);
            setPlaceName(name);
        } catch (error) {
            console.error('Error loading place:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!placeId || !placeName) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Place Not Found</h2>
                    <p className="text-gray-600">Please log in to access SafePass application.</p>
                </div>
            </div>
        );
    }

    return (
        <PlaceSafePassApplication
            placeId={placeId}
            placeName={placeName}
        />
    );
};

export default PlaceSafePassWrapper;
