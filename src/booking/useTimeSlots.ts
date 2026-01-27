import { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  available: boolean;
}

/**
 * Time slot generation and scheduling logic
 * Extracted from ScheduleBookingPopup.tsx lines 156-276
 * RULE: Side-effects in hooks, not JSX files
 */
export function useTimeSlots(
  isOpen: boolean,
  therapistId: string,
  therapistType: string,
  step: string,
  selectedDuration: number | null
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [lastBookingTime, setLastBookingTime] = useState<string>('22:00');
  const [openingTime, setOpeningTime] = useState<string>('09:00');
  const [closingTime, setClosingTime] = useState<string>('21:00');

  // Generate time slots from opening to closing/last booking time
  const generateTimeSlots = async () => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Parse last booking time (format: "HH:MM")
    const [lastHour, lastMinute] = lastBookingTime.split(':').map(Number);
    const [openH, openM] = openingTime.split(':').map(Number);
    const [closeH, closeM] = closingTime.split(':').map(Number);

    // Get today's bookings to mark unavailable slots
    let todayBookings: any[] = [];
    
    if (APPWRITE_CONFIG.collections.bookings && APPWRITE_CONFIG.collections.bookings !== '') {
      const bookingsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        []
      );

      todayBookings = bookingsResponse.documents.filter((booking: any) => {
        const bookingDate = new Date(booking.scheduledTime || booking.createdAt);
        return (
          booking.therapistId === therapistId &&
          bookingDate.toDateString() === today.toDateString() &&
          (booking.status === 'confirmed' || booking.status === 'pending')
        );
      });
    } else {
      console.warn('⚠️ Bookings collection disabled - no schedule conflicts will be checked');
    }

    // Generate slots: for places, use opening/closing; for therapists, 8AM to last booking time
    const isPlace = therapistType === 'place';
    const startHour = isPlace ? openH : 8;
    const endHour = isPlace ? closeH : lastHour;
    for (let hour = startHour; hour <= endHour; hour++) {
      const startMinute = isPlace ? (hour === openH ? openM : 0) : 0;
      const endMinute = hour === endHour ? (isPlace ? closeM : lastMinute) : 45;

      for (let minute = startMinute; minute <= endMinute; minute += 15) {
        // Skip past times
        if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
          continue;
        }

        const slotTime = new Date(today);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if this slot conflicts with existing bookings (including 30min buffer)
        const isBooked = todayBookings.some((booking: any) => {
          const bookingStart = new Date(booking.scheduledTime || booking.createdAt);
          const buffer = therapistType === 'place' ? 0 : 30; // no travel buffer for places
          const bookingEnd = new Date(bookingStart.getTime() + (booking.duration + buffer) * 60000);
          return slotTime >= bookingStart && slotTime < bookingEnd;
        });

        slots.push({
          hour,
          minute,
          label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: !isBooked
        });
      }
    }

    setTimeSlots(slots);
  };

  // Fetch therapist's last booking time
  useEffect(() => {
    if (isOpen && therapistId) {
      const fetchTherapistSchedule = async () => {
        try {
          const collectionId = therapistType === 'therapist' 
            ? APPWRITE_CONFIG.collections.therapists 
            : APPWRITE_CONFIG.collections.places;
            
          if (!collectionId || collectionId === '') {
            console.warn('⚠️ Collection disabled for therapist type:', therapistType);
            setTimeSlots([]);
            return;
          }
          
          // Try to fetch schedule info, but don't fail if document not found
          try {
            const therapist = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              collectionId,
              therapistId
            );
            if (therapistType === 'place') {
              if ((therapist as any).openingTime) setOpeningTime((therapist as any).openingTime);
              if ((therapist as any).closingTime) setClosingTime((therapist as any).closingTime);
            } else {
              if (therapist.lastBookingTime) {
                setLastBookingTime(therapist.lastBookingTime);
              }
            }
          } catch (docError: any) {
            // Document not found is OK - we can still create bookings without schedule info
            if (docError?.code === 404) {
              console.log('ℹ️ Therapist document not found, using default schedule');
            } else {
              console.warn('⚠️ Could not fetch therapist schedule:', docError?.message);
            }
          }
        } catch (error) {
          console.error('Error in schedule fetch:', error);
        }
      };

      fetchTherapistSchedule();
    }
  }, [isOpen, therapistId, therapistType]);

  // Generate slots when duration is selected
  useEffect(() => {
    if (step === 'time' && selectedDuration) {
      generateTimeSlots();
    }
  }, [step, selectedDuration]);

  return {
    timeSlots,
    lastBookingTime,
    openingTime,
    closingTime
  };
}
