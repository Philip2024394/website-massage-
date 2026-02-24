import React from 'react';

export interface BookNowButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

/**
 * Book Now button rendered as standard design-system button.
 * Use for all "Book Now" / Book via WhatsApp actions across the app.
 * Pass onClick for button behavior, or href for direct link (e.g. wa.me).
 */
export function BookNowButton({
  onClick,
  href,
  disabled = false,
  className = '',
  ariaLabel = 'Book Now',
  title,
}: BookNowButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70';

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        title={title ?? ariaLabel}
        className={`${baseClass} ${className}`}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
      >
        Book Now
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={`${baseClass} ${className}`}
    >
      Book Now
    </button>
  );
}
