/**
 * Beautician profile – 3 selectable treatment containers.
 * Selected container: orange border + subtle glow. Book button flashes when a treatment is selected.
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, FingerprintPattern } from 'lucide-react';
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
    <div className="mb-6">
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
        @keyframes book-now-heartbeat {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.25), 0 0 16px 4px rgba(245, 158, 11, 0.3); }
        }
        .beautician-container-heartbeat {
          animation: book-now-heartbeat 1.2s ease-in-out infinite;
        }
        @keyframes book-button-flash {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(37, 211, 102, 0.45); }
          14% { transform: scale(1.06); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.55); }
          28% { transform: scale(1); box-shadow: 0 4px 14px rgba(37, 211, 102, 0.45); }
          42% { transform: scale(1.04); box-shadow: 0 5px 18px rgba(37, 211, 102, 0.5); }
          70% { transform: scale(1); box-shadow: 0 4px 14px rgba(37, 211, 102, 0.45); }
        }
        .book-button-flash {
          animation: book-button-flash 1.2s ease-in-out infinite;
        }
      `}</style>
      <div className="text-center mb-3">
        <h3 className="text-gray-800 font-bold text-sm tracking-wide inline-flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" aria-hidden />
          Treatments Trending
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Select container and press Book Now</p>
      </div>
      <div className="space-y-2">
        {treatments.map((t, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              type="button"
              key={index}
              onClick={() => handleSelect(index)}
              className={`w-full text-center rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-2 p-3 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 beautician-container-heartbeat ${
                isSelected
                  ? 'beautician-container-selected bg-orange-50/80 border-orange-400'
                  : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={isSelected}
              aria-label={`${t.treatment_name || `Treatment ${index + 1}`}, ${t.estimated_duration_minutes} minutes, ${formatPrice(t)}. ${isSelected ? 'Selected' : 'Select'}`}
            >
              <div className="flex-1 min-w-0 text-center">
                <h4 className="text-xs font-bold text-gray-900 mb-0.5 line-clamp-2">
                  {t.treatment_name || `Treatment ${index + 1}`}
                </h4>
                <p className="text-[10px] text-gray-600">
                  Estimated time: {t.estimated_duration_minutes} minutes
                </p>
                <p className="text-xs font-semibold text-gray-800 mt-0.5">
                  Price: {formatPrice(t)} (fixed)
                </p>
              </div>
              <span className="flex-shrink-0 flex items-center justify-center text-amber-600" aria-hidden>
                <FingerprintPattern className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.8} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BeauticianTreatmentCards;
