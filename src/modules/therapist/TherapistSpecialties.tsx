/**
 * TherapistSpecialties Component
 *
 * Same layout as Massage City Places card: "Treatments: Traditional, Deep Tissue, Aromatherapy, Hot Stone"
 */

import React from 'react';
import { parseMassageTypes } from '../../utils/appwriteHelpers';

interface TherapistSpecialtiesProps {
    therapist: any;
    t: any;
}

const DEFAULT_TREATMENTS = 'Traditional, Deep Tissue, Aromatherapy, Hot Stone';

function TherapistSpecialties({ therapist, t }: TherapistSpecialtiesProps) {
    const massageTypes = therapist.massageTypes
        ? (typeof therapist.massageTypes === 'string'
            ? parseMassageTypes(therapist.massageTypes)
            : therapist.massageTypes)
        : [];

    const treatmentsLabel =
        Array.isArray(massageTypes) && massageTypes.length > 0
            ? massageTypes.join(', ')
            : DEFAULT_TREATMENTS;

    return (
        <div className="mx-4 mb-2">
            <div className="flex justify-between items-center">
                <p className="text-xs text-gray-800 flex-shrink-0 font-medium">
                    <span className="font-bold text-gray-900">Treatments:</span> {treatmentsLabel}
                </p>
            </div>
        </div>
    );
}

export default TherapistSpecialties;