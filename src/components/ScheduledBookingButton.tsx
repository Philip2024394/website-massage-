import React from 'react';

export interface ScheduledBookingButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

/**
 * Scheduled booking button rendered as standard design-system button.
 */
export function ScheduledBookingButton({
  onClick,
  onPointerUp,
  disabled = false,
  className = '',
  ariaLabel = 'Scheduled bookings',
  title,
}: ScheduledBookingButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerUp={onPointerUp}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={`${baseClass} ${className}`}
    >
      Scheduled
    </button>
  );
}
