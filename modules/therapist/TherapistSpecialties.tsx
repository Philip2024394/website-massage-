/**
 * TherapistSpecialties Component
 * 
 * Extracted from TherapistCard.tsx as part of Phase 2 modularization.
 * Handles the display of therapist massage specializations/areas of expertise.
 * 
 * Shows up to 5 specialties with a "+N" indicator for additional ones.
 */

import React from 'react';
import { parseMassageTypes } from '../../utils/appwriteHelpers';

interface TherapistSpecialtiesProps {
    therapist: any;
    t: any;
}

const TherapistSpecialties: React.FC<TherapistSpecialtiesProps> = ({ therapist, t }) => {
    // Parse massage types from therapist data
    const massageTypes = therapist.massageTypes 
        ? (typeof therapist.massageTypes === 'string' 
            ? parseMassageTypes(therapist.massageTypes) 
            : therapist.massageTypes)
        : [];

    return (
        <div className="px-4">
            {/* Massage Specializations - Centered */}
            <div className="border-t border-gray-100 pt-3">
                <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                        {t.home?.therapistCard?.experiencedArea || 'Areas of Expertise'}
                    </h4>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                    {massageTypes.slice(0, 5).map((type: string) => (
                        <span key={type} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">
                            {type}
                        </span>
                    ))}
                    {massageTypes.length === 0 && (
                        <span className="text-xs text-gray-400">No specialties selected</span>
                    )}
                    {massageTypes.length > 5 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">
                            +{massageTypes.length - 5}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistSpecialties;