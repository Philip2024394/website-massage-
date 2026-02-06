/**
 * ============================================================================
 * 🆘 THERAPIST HELP MODAL - CONTEXTUAL HELP POP-UPS
 * ============================================================================
 * 
 * PURPOSE:
 * - Explain features without interrupting workflow
 * - Reduce mistakes (missed bookings, payment errors)
 * - Bahasa Indonesia first, English optional
 * - Never auto-open repeatedly
 * 
 * UX STANDARDS:
 * - ⓘ icon trigger
 * - Small modal (desktop) / bottom sheet (mobile)
 * - Dismissible (X or tap outside)
 * - One topic per popup
 * - Store "seen" state locally
 * 
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { X, Info } from 'lucide-react';

export interface HelpContent {
  title: string;
  content: string;
  bullets?: string[];
  icon?: React.ReactNode;
}

interface TherapistHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  helpKey: string;
  content: HelpContent;
  language?: 'id' | 'en';
}

/**
 * TherapistHelpModal Component
 * 
 * Responsive help modal that adapts to mobile/desktop:
 * - Mobile: Bottom sheet that slides up
 * - Desktop: Centered modal
 * 
 * Features:
 * - Dismissible with X button or backdrop click
 * - ESC key support
 * - Prevents body scroll when open
 * - Smooth animations
 * - WCAG accessible
 */
export const TherapistHelpModal: React.FC<TherapistHelpModalProps> = ({
  isOpen,
  onClose,
  helpKey,
  content,
  language = 'id'
}) => {
  // Mark help as seen in localStorage
  useEffect(() => {
    if (isOpen) {
      const seenHelps = JSON.parse(localStorage.getItem('therapist_help_seen') || '{}');
      seenHelps[helpKey] = {
        timestamp: Date.now(),
        count: (seenHelps[helpKey]?.count || 0) + 1
      };
      localStorage.setItem('therapist_help_seen', JSON.stringify(seenHelps));
    }
  }, [isOpen, helpKey]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md max-h-[80vh] md:max-h-[70vh] overflow-hidden flex flex-col pointer-events-auto animate-slideUp md:animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-3 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                {content.icon || <Info className="w-6 h-6 text-orange-600" />}
              </div>
              
              {/* Title */}
              <div className="flex-1">
                <h3 
                  id="help-modal-title"
                  className="text-lg font-bold text-gray-900 leading-tight"
                >
                  {content.title}
                </h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors -mt-1 -mr-1"
              aria-label="Tutup bantuan"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {/* Main Content */}
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {content.content}
            </p>

            {/* Bullet Points */}
            {content.bullets && content.bullets.length > 0 && (
              <ul className="space-y-2">
                {content.bullets.map((bullet, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                    <span className="flex-1">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

/**
 * Help Icon Trigger Component
 * 
 * Standard ⓘ icon button that opens help modal
 */
interface HelpIconProps {
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}

export const HelpIcon: React.FC<HelpIconProps> = ({ 
  onClick, 
  className = '',
  'aria-label': ariaLabel = 'Bantuan'
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors flex-shrink-0 ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      <Info className="w-4 h-4" />
    </button>
  );
};

export default TherapistHelpModal;
