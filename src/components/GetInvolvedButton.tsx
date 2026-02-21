import React from 'react';

const GET_INVOLVED_IMAGE = 'https://ik.imagekit.io/7grri5v7d/get%20involved.png';

export interface GetInvolvedButtonProps {
  /** Link to sign-in (or create account). Default: /signin */
  href?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * "Get Involved" button using the shared image. Links to sign-in so users can post or comment on IndaStreet News.
 */
export function GetInvolvedButton({
  href = '/signin',
  className = '',
  ariaLabel = 'Get involved – sign in to post or comment',
}: GetInvolvedButtonProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${className}`}
    >
      <img
        src={GET_INVOLVED_IMAGE}
        alt=""
        className="w-full h-full max-h-12 object-contain object-center"
      />
    </a>
  );
}
