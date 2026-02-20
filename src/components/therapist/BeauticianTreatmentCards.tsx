/**
 * Beautician profile – 3 selectable treatment containers.
 * Selected container: orange border + subtle glow. Book button flashes when a treatment is selected.
 */

import React, { useState, useCallback } from 'react';
import { parseBeauticianTreatments } from '../../constants/beauticianTreatments';
import type { Therapist } from '../../types';
import type { BeauticianTreatment } from '../../types';

function formatPrice(t: BeauticianTreatment): string {
  const currency = t.currency ?? 'EUR';
  if (currency === 'IDR') {
    const p = t.fixed_price;
    return p >= 1000 ? `IDR ${(p / 1000).toFixed(0)}K` : `IDR ${p}`;
  }
  return `€${t.fixed_price}`;
}

interface BeauticianTreatmentCardsProps {
  therapist: Therapist;
  /** Called when user selects or deselects a container (index, treatment | null). */
  onSelectionChange?: (index: number | null, treatment: BeauticianTreatment | null) => void;
}

const BeauticianTreatmentCards: React.FC<BeauticianTreatmentCardsProps> = ({ therapist, onSelectionChange }) => {
  const raw = (therapist as any).beauticianTreatments;
  const treatments = parseBeauticianTreatments(raw);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = useCallback(
    (index: number) => {
      const next = selectedIndex === index ? null : index;
      setSelectedIndex(next);
      onSelectionChange?.(next, next !== null ? treatments[next] ?? null : null);
    },
    [selectedIndex, treatments, onSelectionChange]
  );

  if (treatments.length === 0) return null;

  return (
    <div className="mb-8">
      <style>{`
        @keyframes beautician-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.35); }
          50% { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2), 0 0 12px 2px rgba(249, 115, 22, 0.15); }
        }
        .beautician-container-selected {
          border-color: rgb(249 115 22);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25), 0 0 16px 4px rgba(249, 115, 22, 0.12);
          animation: beautician-glow 2.5s ease-in-out infinite;
        }
        @keyframes book-button-flash {
          0%, 100% { opacity: 1; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4); }
          50% { opacity: 0.92; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.6); }
        }
        .book-button-flash {
          animation: book-button-flash 1.4s ease-in-out infinite;
        }
      `}</style>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Treatments</h3>
        <p className="text-xs text-gray-500 mt-1">Select Container And Press Book Now</p>
      </div>
      <div className="space-y-4">
        {treatments.map((t, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              type="button"
              key={index}
              onClick={() => handleSelect(index)}
              className={`w-full text-left rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'beautician-container-selected bg-orange-50/80 border-orange-400'
                  : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={isSelected}
              aria-label={`${t.treatment_name || `Treatment ${index + 1}`}, ${t.estimated_duration_minutes} minutes, ${formatPrice(t)}. ${isSelected ? 'Selected' : 'Select'}`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  {t.treatment_name || `Treatment ${index + 1}`}
                </h4>
                <p className="text-sm text-gray-600">
                  Estimated time: {t.estimated_duration_minutes} minutes
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  Price: {formatPrice(t)} (fixed)
                </p>
              </div>
              {isSelected && (
                <span className="flex-shrink-0 text-orange-600 text-xs font-semibold uppercase tracking-wide">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BeauticianTreatmentCards;
