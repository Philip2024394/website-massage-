// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  benefits?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * HelpTooltip Component
 * Elite-level contextual help system for therapist dashboard
 * 
 * Features:
 * - Accessible (ARIA labels, keyboard navigation)
 * - Mobile-responsive
 * - Click-outside to close
 * - ESC key to close
 * - Orange theme consistent with brand
 * - Prevents layout shift
 */
const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  title, 
  content, 
  benefits,
  position = 'top',
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Safety check: Don't render if no content provided
  if (!title || !content) {
    console.warn('[HelpTooltip] Missing required props:', { title, content });
    return null;
  }

  // Size variants
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const popoverWidths = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md'
  };

  // Position variants
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  // Arrow position
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white border-y-transparent border-l-transparent'
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close if clicking on mobile overlay background
      if (target.classList.contains('bg-black/50')) {
        setIsOpen(false);
        return;
      }
      
      // Desktop: Close if clicking outside tooltip
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus(); // Return focus to trigger button
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Help Icon Button */}
      <button
        ref={buttonRef}
        onClick={toggleTooltip}
        className={`
          help-button
          ${sizeClasses[size]} 
          text-orange-500 hover:text-orange-600 
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1 rounded-lg
          flex items-center justify-center
          p-2
        `}
        aria-label={`Help: ${title}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        type="button"
      >
        <HelpCircle className="w-full h-full" />
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Mobile: Fixed center overlay */}
          <div className="md:hidden fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div
              ref={tooltipRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-tooltip-title"
              className="help-popup-mobile bg-white rounded-lg shadow-2xl border-2 border-orange-200 overflow-hidden animate-scale-in"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                <h3 
                  id="help-tooltip-title"
                  className="text-white font-bold text-sm flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  {title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  aria-label="Close help"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-4 py-3 space-y-3 max-h-[60vh] ">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content}
                </p>

                {/* Benefits List */}
                {benefits && benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                      Benefits:
                    </p>
                    <ul className="space-y-1.5">
                      {benefits.map((benefit, index) => (
                        <li 
                          key={index}
                          className="text-xs text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-orange-500 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer tip */}
              <div className="bg-orange-50 px-4 py-2 border-t border-orange-100">
                <p className="text-xs text-orange-600 text-center">
                  💡 Tap anywhere outside to close
                </p>
              </div>
            </div>
          </div>

          {/* Desktop: Positioned popover */}
          <div
            className={`
              hidden md:block
              absolute z-[9999]
              ${positionClasses[position]}
              ${popoverWidths[size]}
            `}
            style={{ zIndex: 9999 }}
          >
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
              aria-hidden="true"
            />
            
            {/* Content Card */}
            <div 
              ref={tooltipRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-tooltip-title-desktop"
              className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                <h3 
                  id="help-tooltip-title-desktop"
                  className="text-white font-bold text-sm flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  {title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  aria-label="Close help"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-4 py-3 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content}
                </p>

                {/* Benefits List */}
                {benefits && benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                      Benefits:
                    </p>
                    <ul className="space-y-1.5">
                      {benefits.map((benefit, index) => (
                        <li 
                          key={index}
                          className="text-xs text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-orange-500 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer tip */}
              <div className="bg-orange-50 px-4 py-2 border-t border-orange-100">
                <p className="text-xs text-orange-600 text-center">
                  💡 Tip: Click icon again to close
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HelpTooltip;
