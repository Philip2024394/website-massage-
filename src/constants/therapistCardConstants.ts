import { AvailabilityStatus } from '../types';

export const statusStyles: { [key in AvailabilityStatus]: { text: string; bg: string; dot: string; isAvailable: boolean } } = {
    [AvailabilityStatus.Available]: { text: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500', isAvailable: true },
    [AvailabilityStatus.Busy]: { text: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500', isAvailable: false },
    [AvailabilityStatus.Offline]: { text: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500', isAvailable: false },
};
