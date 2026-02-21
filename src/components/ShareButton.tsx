import React from 'react';

const SHARE_BUTTON_IMAGE = 'https://ik.imagekit.io/7grri5v7d/share%20button.png';

export interface ShareButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Accessibility label (e.g. "Share"). Default: "Share" */
  ariaLabel?: string;
  title?: string;
}

/**
 * Share button that displays the shared share-button image.
 * Used on IndaStreet News page and articles.
 */
export function ShareButton({
  onClick,
  className = '',
  ariaLabel = 'Share',
  title,
}: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={`inline-flex items-center justify-center overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${className}`}
    >
      <img
        src={SHARE_BUTTON_IMAGE}
        alt=""
        className="w-full h-full max-h-10 object-contain object-center"
      />
    </button>
  );
}
