/**
 * Popup shown when user taps "Book Now" / "Book via WhatsApp" but therapist is busy.
 * Message: therapist is now in service, please wait until [time] becomes active to book.
 */

import React from 'react';

export interface TherapistBusyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  /** ISO date string or display string when therapist becomes available */
  busyUntil?: string | null;
  /** Optional therapist/place name */
  providerName?: string;
}

function formatBusyUntil(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    if (d <= now) return 'shortly';
    const mins = Math.ceil((d.getTime() - now.getTime()) / 60000);
    if (mins < 60) return `in ${mins} min`;
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `in ${hours} h`;
    return `in ${hours} h ${m} min`;
  } catch {
    return '';
  }
}

export const TherapistBusyPopup: React.FC<TherapistBusyPopupProps> = ({
  isOpen,
  onClose,
  busyUntil,
  providerName,
}) => {
  if (!isOpen) return null;

  const timeText = busyUntil ? formatBusyUntil(busyUntil) : '';
  const message = timeText
    ? `${providerName ? providerName + ' is' : 'Therapist is'} now in service. Please wait until ${timeText} to book.`
    : `${providerName ? providerName + ' is' : 'Therapist is'} now in service. Please wait until they become active to book.`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-400 text-xl">⏱</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {providerName ? `${providerName} is busy` : 'Therapist is busy'}
          </h3>
        </div>
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default TherapistBusyPopup;
