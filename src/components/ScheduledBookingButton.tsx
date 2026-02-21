import React from 'react';

const SCHEDULED_BOOKING_IMAGE = 'https://ik.imagekit.io/7grri5v7d/ytr.png';

export interface ScheduledBookingButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

/**
 * Scheduled booking button – displays the shared scheduled bookings image only (no container frame).
 */
export function ScheduledBookingButton({
  onClick,
  onPointerUp,
  disabled = false,
  className = '',
  ariaLabel = 'Scheduled bookings',
  title,
}: ScheduledBookingButtonProps) {
  const image = (
    <img
      src={SCHEDULED_BOOKING_IMAGE}
      alt=""
      className="w-full h-full min-h-0 object-contain object-center pointer-events-none"
    />
  );
  const baseClass =
    'inline-flex items-center justify-center overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70 border-0 bg-transparent shadow-none p-0';

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
      {image}
    </button>
  );
}
