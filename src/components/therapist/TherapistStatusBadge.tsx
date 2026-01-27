import type { Therapist, AvailabilityStatus } from '../types';
import BusyCountdownTimer from '../BusyCountdownTimer';

interface TherapistStatusBadgeProps {
  displayStatus: AvailabilityStatus;
  therapist: Therapist;
  countdown?: string;
  isOvertime: boolean;
  statusStyles: {
    [key in AvailabilityStatus]: { text: string; bg: string; dot: string };
  };
}

const TherapistStatusBadge = ({
  displayStatus,
  therapist,
  countdown,
  isOvertime,
  statusStyles
}: TherapistStatusBadgeProps): JSX.Element => {
  const style = statusStyles[displayStatus];

  return (
    <div className="overflow-visible">
      <div
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
          isOvertime ? 'bg-red-100 text-red-800' : style.bg
        } ${isOvertime ? '' : style.text}`}
      >
        <span className="relative mr-1.5">
          {displayStatus === 'Available' && (
            <>
              {/* Static ring glow effect for Available status */}
              <span className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-green-300 opacity-40"></span>
              <span className="absolute inset-0 w-3 h-3 -left-0.5 -top-0.5 rounded-full bg-green-400 opacity-30"></span>
            </>
          )}
          <span className={`w-2 h-2 rounded-full block status-indicator relative ${isOvertime ? 'bg-red-500' : style.dot}`}>
            {!isOvertime && (displayStatus === 'Available' || displayStatus === 'Busy') && (
              <span
                className={`absolute inset-0 rounded-full animate-ping ${
                  displayStatus === 'Available' ? 'bg-green-400' : 'bg-yellow-400'
                }`}
              ></span>
            )}
          </span>
        </span>
        {displayStatus === 'Busy' ? (
          therapist.busyUntil ? (
            <div className="flex items-center gap-1">
              <span>Busy</span>
              <BusyCountdownTimer
                endTime={therapist.busyUntil}
                onExpired={() => {
                  console.log('Busy period ended – therapist should be available.');
                }}
              />
            </div>
          ) : countdown ? (
            <span>
              {isOvertime ? 'Busy - Extra Time ' : 'Busy - Free in '} {countdown}
            </span>
          ) : (
            <span>Busy</span>
          )
        ) : (
          displayStatus
        )}
      </div>
    </div>
  );
};

export default TherapistStatusBadge;
