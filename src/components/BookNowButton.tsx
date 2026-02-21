import React from 'react';

const BOOK_NOW_IMAGE = 'https://ik.imagekit.io/7grri5v7d/book%20now.png?updatedAt=1771703410098';

export interface BookNowButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

/**
 * Book Now button that displays the shared button image (no container/frame).
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
  const image = (
    <img
      src={BOOK_NOW_IMAGE}
      alt=""
      className="w-full h-full min-h-0 object-contain object-center"
    />
  );
  const baseClass = 'inline-flex items-center justify-center overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70';

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        title={title ?? ariaLabel}
        className={`${baseClass} ${className}`}
      >
        {image}
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
      {image}
    </button>
  );
}
