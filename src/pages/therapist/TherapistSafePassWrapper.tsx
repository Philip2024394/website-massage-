/**
 * Therapist SafePass Application Wrapper
 * Integrates with therapist authentication and data
 */

import React, { useEffect, useState } from 'react';
import TherapistSafePassApplication from './TherapistSafePassApplication';
import { therapistService } from '../../lib/appwriteService';
import type { Therapist } from '../../types';

const TherapistSafePassWrapper: React.FC = () => {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTherapist();
    }, []);

    const loadTherapist = async () => {
        try {
            // Get therapist ID from localStorage or session
            const therapistId = localStorage.getItem('therapistId');
            
            if (!therapistId) {
                console.error('No therapist ID found');
                setLoading(false);
                return;
            }

            const therapistData = await therapistService.getById(therapistId);
            setTherapist(therapistData);
        } catch (error) {
            console.error('Error loading therapist:', error);
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

    if (!therapist) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist Not Found</h2>
                    <p className="text-gray-600">Please log in to access SafePass application.</p>
                </div>
            </div>
        );
    }

    return (
        <TherapistSafePassApplication
            therapistId={therapist.$id || therapist.id.toString()}
            therapistName={therapist.name}
        />
    );
};

export default TherapistSafePassWrapper;
