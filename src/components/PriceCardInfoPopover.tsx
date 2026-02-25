/**
 * PriceCardInfoPopover – small popup explaining what to expect for a massage duration.
 * Used on massage home service and massage city places price cards (60/90/120 min).
 * When serviceName matches a directory entry (Appwrite or static), shows full "What to Expect" content.
 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getDirectoryMassageTypeByName } from '../lib/appwrite/services/directoryMassageTypes.service';
import { getTraditionalMassagePopupContent } from '../constants/massageDirectoryTraditional';
import { getSportsMassagePopupContent } from '../constants/massageDirectorySports';
import { getTherapeuticMassagePopupContent } from '../constants/massageDirectoryTherapeutic';
import { getWellnessMassagePopupContent } from '../constants/massageDirectoryWellness';
import { getCouplesMassagePopupContent } from '../constants/massageDirectoryCouples';
import { getBodyScrubMassagePopupContent } from '../constants/massageDirectoryBodyScrub';
import { getPrenatalMassagePopupContent } from '../constants/massageDirectoryPrenatal';
import { getHeadScalpMassagePopupContent } from '../constants/massageDirectoryHeadScalp';

export interface PriceCardInfoPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    /** Duration in minutes (60 | 90 | 120). */
    duration: 60 | 90 | 120;
    /** Massage type / service name (e.g. "Traditional Massage", "Office Relief Massage"). */
    serviceName: string;
    /** When true, show Indonesian copy. */
    isId?: boolean;
    /** Optional thumbnail image URL shown in the popup (e.g. therapist or place main image). */
    thumbnailImageUrl?: string | null;
}

const WHAT_TO_EXPECT: Record<60 | 90 | 120, { en: string; id: string }> = {
    60: {
        en: 'Quick relaxation session. Ideal for a lunch break or when time is limited. Full-body relaxation and stress relief.',
        id: 'Sesi relaksasi singkat. Cocok untuk istirahat makan siang atau saat waktu terbatas. Relaksasi seluruh tubuh dan pereda stres.',
    },
    90: {
        en: 'Most popular. Full session with time for deeper work on problem areas. Best balance of relaxation and therapeutic focus.',
        id: 'Paling populer. Sesi penuh dengan waktu untuk penanganan lebih dalam pada area bermasalah. Keseimbangan terbaik antara relaksasi dan fokus terapeutik.',
    },
    120: {
        en: 'Extended session. Maximum relaxation and thorough work on back, neck, and legs. Ideal for deep tissue or full-body focus.',
        id: 'Sesi extended. Relaksasi maksimal dan penanganan menyeluruh pada punggung, leher, dan kaki. Ideal untuk deep tissue atau fokus seluruh tubuh.',
    },
};

const PriceCardInfoPopover: React.FC<PriceCardInfoPopoverProps> = ({
    isOpen,
    onClose,
    duration,
    serviceName,
    isId = false,
    thumbnailImageUrl,
}) => {
    const [appwriteContent, setAppwriteContent] = useState<string | null>(null);

    const directoryContent = getTraditionalMassagePopupContent(serviceName) ?? getSportsMassagePopupContent(serviceName) ?? getTherapeuticMassagePopupContent(serviceName) ?? getWellnessMassagePopupContent(serviceName) ?? getCouplesMassagePopupContent(serviceName) ?? getBodyScrubMassagePopupContent(serviceName) ?? getPrenatalMassagePopupContent(serviceName) ?? getHeadScalpMassagePopupContent(serviceName);
    const copy = WHAT_TO_EXPECT[duration];
    const fallbackText = isId ? copy.id : copy.en;
    const text = appwriteContent ?? directoryContent ?? fallbackText;
    const defaultThumb = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';
    const thumbSrc = thumbnailImageUrl || defaultThumb;

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !serviceName?.trim()) {
            setAppwriteContent(null);
            return;
        }
        getDirectoryMassageTypeByName(serviceName.trim())
            .then((entry) => {
                if (!entry) {
                    setAppwriteContent(null);
                    return;
                }
                const parts: string[] = [
                    'What to Expect:',
                    entry.whatToExpect || entry.shortDescription,
                    '',
                    `Recommended Duration: ${entry.recommendedDuration || '—'}`,
                    `Pressure Level: ${entry.pressureLevel || '—'}`,
                    `Focus Areas: ${entry.focusAreas || '—'}`,
                    `Ideal For: ${entry.idealFor || '—'}`,
                    `Suggested Frequency: ${entry.suggestedFrequency || '—'}`,
                    `Technique Style: ${entry.techniqueStyle || '—'}`,
                    `Post-Treatment Notes: ${entry.postTreatmentNotes || '—'}`,
                    `Recommended Add-Ons: ${entry.recommendedAddOns || '—'}`,
                ];
                setAppwriteContent(parts.join('\n'));
            })
            .catch(() => setAppwriteContent(null));
    }, [isOpen, serviceName]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[100] bg-black/30"
                aria-hidden
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-labelledby="price-info-title"
                aria-describedby="price-info-desc"
                className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-amber-200 bg-white overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Thumbnail image */}
                <div className="w-full aspect-[21/9] min-h-[80px] max-h-[120px] bg-gray-100">
                    <img
                        src={thumbSrc}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultThumb; }}
                    />
                </div>
                <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 id="price-info-title" className="text-sm font-bold text-gray-900">
                        {serviceName} · {duration} min
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label={isId ? 'Tutup' : 'Close'}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p id="price-info-desc" className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {text}
                </p>
                </div>
            </div>
        </>
    );
};

export default PriceCardInfoPopover;
