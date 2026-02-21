import React from 'react';

const PRICES_IMAGE = 'https://ik.imagekit.io/7grri5v7d/book%20nows.png';

export interface PricesButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

/**
 * Prices button that displays the shared "prices" button image.
 * Use for all "Menu Prices" / "Prices" / price list actions across the app.
 */
export function PricesButton({
  onClick,
  href,
  disabled = false,
  className = '',
  ariaLabel = 'Menu Prices',
  title,
}: PricesButtonProps) {
  const image = (
    <img
      src={PRICES_IMAGE}
      alt=""
      className="w-full h-full min-h-0 object-contain object-center"
    />
  );
  const baseClass = 'inline-flex items-center justify-center overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70';

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
