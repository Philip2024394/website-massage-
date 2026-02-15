/**
 * Slide-to-confirm verification for signup – helps stop bots.
 * User must drag the slider to the end to confirm they are human.
 */
import React, { useState, useRef, useCallback } from 'react';

export interface SlideToConfirmProps {
    onVerified: () => void;
    label?: string;
    verifiedLabel?: string;
    disabled?: boolean;
    className?: string;
}

const THRESHOLD = 0.85; // 85% of the way to consider "completed"

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({
    onVerified,
    label = 'Slide to confirm sign up',
    verifiedLabel = 'Confirmed',
    disabled = false,
    className = '',
}) => {
    const [position, setPosition] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const getTrackWidth = useCallback(() => {
        return trackRef.current?.offsetWidth ?? 280;
    }, []);

    const handleMove = useCallback(
        (clientX: number) => {
            if (isVerified || disabled) return;
            const el = trackRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = clientX - rect.left;
            const w = rect.width;
            const thumbWidth = 48;
            const max = w - thumbWidth;
            const value = Math.max(0, Math.min(x - thumbWidth / 2, max));
            setPosition(value);
            if (value >= max * THRESHOLD) {
                setPosition(max);
                setIsVerified(true);
                onVerified();
            }
        },
        [isVerified, disabled, onVerified]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isVerified || disabled) return;
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isVerified || disabled) return;
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
    };

    React.useEffect(() => {
        if (!isDragging) return;
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const onMouseUp = () => setIsDragging(false);
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX);
        };
        const onTouchEnd = () => setIsDragging(false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging, handleMove]);

    const trackWidth = getTrackWidth();
    const thumbWidth = 48;
    const maxPos = Math.max(0, trackWidth - thumbWidth);
    const currentPos = isVerified ? maxPos : Math.min(position, maxPos);

    return (
        <div className={className}>
            <p className="text-sm text-gray-600 mb-2 text-center">
                {isVerified ? verifiedLabel : label}
            </p>
            <div
                ref={trackRef}
                role="slider"
                aria-valuenow={isVerified ? 100 : Math.round((currentPos / maxPos) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (disabled || isVerified) return;
                    if (e.key === 'ArrowRight') {
                        const step = maxPos * 0.2;
                        const next = Math.min(position + step, maxPos);
                        setPosition(next);
                        if (next >= maxPos * THRESHOLD) {
                            setPosition(maxPos);
                            setIsVerified(true);
                            onVerified();
                        }
                    }
                }}
                className={`
                    relative w-full h-12 rounded-full border-2 overflow-hidden select-none
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200' : 'cursor-grab active:cursor-grabbing bg-gray-100 border-gray-300'}
                    ${isVerified ? 'border-green-500 bg-green-50' : ''}
                `}
            >
                {/* Progress fill */}
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-orange-500/30 transition-all duration-150"
                    style={{ width: currentPos + thumbWidth }}
                />
                {/* Thumb */}
                <div
                    className="absolute top-1 left-1 w-11 h-10 rounded-full bg-white border-2 border-orange-500 shadow-md flex items-center justify-center transition-all duration-150 flex-shrink-0"
                    style={{
                        left: currentPos,
                        pointerEvents: 'none',
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {isVerified ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    )}
                </div>
                {/* Clickable overlay to capture drag on track */}
                <div
                    className="absolute inset-0"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    style={{ cursor: disabled ? 'not-allowed' : 'inherit' }}
                />
            </div>
        </div>
    );
};

export default SlideToConfirm;
