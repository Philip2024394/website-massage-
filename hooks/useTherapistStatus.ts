import type { Therapist, AvailabilityStatus } from '../types';

export const useTherapistStatus = (therapist: Therapist) => {
  const getDisplayStatus = (): AvailabilityStatus => {
    // Check if therapist has a busyUntil timestamp and is still busy
    if (therapist.busyUntil) {
      const busyUntil = new Date(therapist.busyUntil);
      if (!isNaN(busyUntil.getTime()) && busyUntil > new Date()) {
        return 'Busy' as AvailabilityStatus;
      }
    }

    // Legacy: If therapist has an explicit bookedUntil timestamp in the future, show Busy
    try {
      const bookedUntil: any = (therapist as any).bookedUntil;
      if (bookedUntil) {
        const until = new Date(bookedUntil);
        if (!isNaN(until.getTime()) && until > new Date()) {
          return 'Busy' as AvailabilityStatus;
        }
      }
    } catch {
      // ignore parsing errors
    }

    // Use availability field (has proper default) or status as fallback
    const currentStatus = (therapist as any).availability || therapist.status || ('Offline' as AvailabilityStatus);

    return currentStatus;
  };

  const displayStatus = getDisplayStatus();

  const statusStyles: { [key in AvailabilityStatus]: { text: string; bg: string; dot: string } } = {
    Available: { text: 'text-green-800', bg: 'bg-green-100', dot: 'bg-green-500' },
    Busy: { text: 'text-yellow-800', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
    Offline: { text: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  };

  return {
    displayStatus,
    statusStyles,
  };
};
