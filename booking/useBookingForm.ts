import { useState } from 'react';

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  available: boolean;
}

const AVATAR_OPTIONS = [
    { id: 1, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png', label: 'Avatar 1' },
    { id: 2, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%202.png', label: 'Avatar 2' },
    { id: 3, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%203.png', label: 'Avatar 3' },
    { id: 4, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%204.png', label: 'Avatar 4' },
    { id: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png', label: 'Avatar 6' },
    { id: 6, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%207.png', label: 'Avatar 7' },
    { id: 7, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%208.png', label: 'Avatar 8' },
    { id: 8, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%209.png', label: 'Avatar 9' },
    { id: 9, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2010.png', label: 'Avatar 10' },
    { id: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2011.png', label: 'Avatar 11' },
    { id: 11, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2012.png', label: 'Avatar 12' },
    { id: 12, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2013.png', label: 'Avatar 13' },
    { id: 13, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2014.png', label: 'Avatar 14' },
    { id: 14, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2015.png', label: 'Avatar 15' },
    { id: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2016.png', label: 'Avatar 16' }
];

/**
 * Form state management for booking popup
 * Extracted from ScheduleBookingPopup.tsx lines 101-116
 * RULE: Side-effects in hooks, not JSX files
 */
export function useBookingForm() {
  const [step, setStep] = useState<'duration' | 'time' | 'details'>('duration');
  const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120 | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0].imageUrl);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setStep('duration');
    setSelectedDuration(null);
    setSelectedTime(null);
    setCustomerName('');
    setCustomerWhatsApp('');
    setRoomNumber('');
    setSelectedAvatar(AVATAR_OPTIONS[0].imageUrl);
    setError('');
  };

  return {
    // State
    step,
    selectedDuration,
    selectedTime,
    customerName,
    customerWhatsApp,
    roomNumber,
    selectedAvatar,
    isCreating,
    error,
    
    // Setters
    setStep,
    setSelectedDuration,
    setSelectedTime,
    setCustomerName,
    setCustomerWhatsApp,
    setRoomNumber,
    setSelectedAvatar,
    setIsCreating,
    setError,
    
    // Actions
    resetForm,
    
    // Constants
    AVATAR_OPTIONS
  };
}
