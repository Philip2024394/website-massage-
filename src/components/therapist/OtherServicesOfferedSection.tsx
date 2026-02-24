/**
 * Massage Home Service Dashboard – "Other Services Offered" section.
 * Same UI as Massage City Places service listing: selectable chips, same highlight/hover/rounded/spacing.
 * Free: 3, Middle: 8, Premium: unlimited. At limit show upgrade modal (same style as existing upgrade prompts).
 */

import React, { useState } from 'react';
import {
  OTHER_SERVICES_OFFERED_MASTER,
  getOtherServicesLimit,
  getTherapistPlanTier,
} from '../../constants/otherServicesOffered';

const UPGRADE_MESSAGE_EN = "You've reached the 3 service limit. Upgrade your membership to list more services and increase visibility.";
const UPGRADE_MESSAGE_ID = "Anda telah mencapai batas 3 layanan. Naikkan keanggotaan Anda untuk menampilkan lebih banyak layanan dan meningkatkan visibilitas.";

interface OtherServicesOfferedSectionProps {
  therapist: { $id?: string; id?: string; plan?: string; membershipPlan?: string; membershipTier?: string } & Record<string, unknown>;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  language?: 'en' | 'id';
  onNavigate?: (page: string) => void;
}

function parseSelectedIds(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x: unknown): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

const OtherServicesOfferedSection: React.FC<OtherServicesOfferedSectionProps> = ({
  therapist,
  selectedIds,
  onChange,
  language = 'id',
  onNavigate,
}) => {
  const limit = getOtherServicesLimit(getTherapistPlanTier(therapist));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const toggle = (id: string) => {
    const selected = selectedIds.includes(id);
    if (selected) {
      onChange(selectedIds.filter((x) => x !== id));
      setShowUpgradeModal(false);
      return;
    }
    if (selectedIds.length >= limit) {
      setShowUpgradeModal(true);
      return;
    }
    onChange([...selectedIds, id]);
  };

  const label = (en: string, id: string) => (language === 'id' ? id : en);
  const upgradeMessage = language === 'id' ? UPGRADE_MESSAGE_ID : UPGRADE_MESSAGE_EN;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          {label('Other Services Offered', 'Layanan Lain yang Ditawarkan')}
        </label>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {selectedIds.length}/{limit === 999 ? '∞' : limit} {label('selected', 'dipilih')}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        {label(
          'Select services you offer (e.g. Facial, Kerokan, Lulur). Same selection style as Massage City Places.',
          'Pilih layanan yang Anda tawarkan (mis. Facial, Kerokan, Lulur). Gaya pilihan sama seperti Massage City Places.'
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {OTHER_SERVICES_OFFERED_MASTER.map((item) => {
          const selected = selectedIds.includes(item.id);
          const atLimit = selectedIds.length >= limit && !selected;
          const displayLabel = language === 'id' ? item.labelId : item.labelEn;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              disabled={atLimit}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selected
                  ? 'bg-orange-500 text-white border-orange-500'
                  : atLimit
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* Upgrade modal – same style as existing upgrade prompts */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {label('Service Limit Reached', 'Batas Layanan Tercapai')}
            </h4>
            <p className="text-sm text-gray-600 mb-4">{upgradeMessage}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                {label('OK', 'OK')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  onNavigate?.('therapist-premium-upgrade');
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
              >
                {label('Upgrade', 'Upgrade')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherServicesOfferedSection;
export { parseSelectedIds };
