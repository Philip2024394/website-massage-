import React from 'react';

const VIEW_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/view%20profile.png';

export interface ViewProfileButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  /** Accessibility label (e.g. "View profile"). Default: "View Profile" */
  ariaLabel?: string;
  /** Optional label for screen readers when image is used; same as ariaLabel if not set. */
  title?: string;
}

/**
 * View Profile button that displays the shared button image.
 * Use across the app for all "View profile" actions.
 */
export function ViewProfileButton({
  onClick,
  disabled = false,
  className = '',
  ariaLabel = 'View Profile',
  title,
}: ViewProfileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={`inline-flex items-center justify-center overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      <img
        src={VIEW_PROFILE_IMAGE}
        alt=""
        className="w-full h-full max-h-12 object-contain object-center"
      />
    </button>
  );
}
