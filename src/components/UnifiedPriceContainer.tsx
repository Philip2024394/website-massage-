import React from 'react';
import { Info, FingerprintPattern, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export type DurationKey = '60' | '90' | '120';

export interface UnifiedPriceContainerProps {
  /** Main container classes (rounded, borders, bg, etc). */
  className?: string;
  /** Whether the container is clickable/selectable. */
  interactive?: boolean;
  role?: React.AriaRole;
  tabIndex?: number;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;

  /** Left thumbnail. */
  thumbnailUrl: string;
  thumbnailAlt?: string;
  thumbnailFallbackUrl?: string;
  /** Optional slight left pull on mobile to align to edge. */
  thumbnailPullLeft?: boolean;

  /** Header text (service name). */
  title: string;
  /** Badge shown next to title (e.g. Popular Choice). */
  badgeLabel?: string;
  /** Whether to show Sparkles icon inside the badge. */
  showBadgeSparkles?: boolean;

  /** Optional rating badge (typically only for first card). */
  rating?: string | number | null;
  showRatingBadge?: boolean;
  ratingBadgeClassName?: string;

  /** 3-column pricing grid. */
  renderPrice: (key: DurationKey) => React.ReactNode;

  /** Optional fingerprint indicator (only show when selected). */
  showFingerprint?: boolean;
  fingerprintClassName?: string;

  /** Optional info button (description). */
  onInfoClick?: () => void;
  infoAriaLabel?: string;
  infoTitle?: string;
  /** If true, move info button to lower right and shrink. */
  infoButtonCompact?: boolean;
}

const DURATION_LABELS: { key: DurationKey; label: string }[] = [
  { key: '60', label: '60min' },
  { key: '90', label: '90min' },
  { key: '120', label: '120min' },
];

export default function UnifiedPriceContainer(props: UnifiedPriceContainerProps) {
  const {
    className,
    interactive,
    role,
    tabIndex,
    onClick,
    onKeyDown,
    thumbnailUrl,
    thumbnailAlt = '',
    thumbnailFallbackUrl,
    thumbnailPullLeft = false,
    title,
    badgeLabel,
    showBadgeSparkles = true,
    rating,
    showRatingBadge = false,
    ratingBadgeClassName,
    renderPrice,
    showFingerprint = false,
    fingerprintClassName,
    onInfoClick,
    infoAriaLabel,
    infoTitle,
    infoButtonCompact = true,
  } = props;

  const showInfo = typeof onInfoClick === 'function';

  return (
    <div
      role={interactive ? (role ?? 'button') : role}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={clsx('relative', className, interactive && 'cursor-pointer select-none')}
    >
      {/* Layout: thumbnail left, content right */}
      <div className="flex flex-row items-start gap-3">
        <div
          className={clsx(
            'flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-amber-200',
            thumbnailPullLeft && '-ml-2 sm:ml-0'
          )}
        >
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (!thumbnailFallbackUrl) return;
              (e.target as HTMLImageElement).src = thumbnailFallbackUrl;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {showRatingBadge && rating ? (
            <div
              className={clsx(
                'absolute -top-2.5 left-[3.75rem] sm:left-[4.5rem] bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-10',
                ratingBadgeClassName
              )}
            >
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20" aria-hidden>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating}
            </div>
          ) : null}

          <div className="flex items-center gap-2 mb-1 flex-nowrap">
            <h4 className="text-xs font-bold text-gray-900 truncate" title={title}>
              {title}
            </h4>
            {badgeLabel ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex-shrink-0">
                {showBadgeSparkles ? <Sparkles className="w-2.5 h-2.5" aria-hidden /> : null}
                {badgeLabel}
              </span>
            ) : null}
          </div>

          <div className="grid min-w-0 w-full grid-cols-3 grid-rows-2 gap-x-1 gap-y-0 items-start justify-items-center text-center">
            {DURATION_LABELS.map(({ key, label }) => (
              <span key={key} className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">
                {label}
              </span>
            ))}
            {DURATION_LABELS.map(({ key }) => (
              <div key={key} className="text-[10px] sm:text-xs font-semibold text-gray-800 whitespace-nowrap min-w-0">
                {renderPrice(key)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFingerprint ? (
        <div className={clsx('w-full flex justify-center items-center text-orange-700', fingerprintClassName)} aria-hidden>
          <FingerprintPattern className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.5} />
        </div>
      ) : null}

      {showInfo ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onInfoClick?.();
          }}
          className={clsx(
            'absolute bg-amber-200 text-amber-800 flex items-center justify-center hover:bg-amber-300 transition-colors shadow-sm rounded-full',
            infoButtonCompact
              ? 'bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6'
              : 'top-2 right-2 w-6 h-6 sm:w-7 sm:h-7'
          )}
          aria-label={infoAriaLabel}
          title={infoTitle}
        >
          <Info className={clsx(infoButtonCompact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4')} strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}

