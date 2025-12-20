/**
 * Facial Dashboard Types
 * Exports common types used in the facial dashboard
 */

// Import the enum from root types
import { BookingStatus as RootBookingStatus } from '../../../types';
import type { Booking as RootBooking, Place as RootPlace, Pricing as RootPricing } from '../../../types';

// Re-export the BookingStatus enum (as value, not type)
export { RootBookingStatus as BookingStatus };

// Re-export types from root for easy importing
export type Booking = RootBooking;
export type Place = RootPlace;
export type Pricing = RootPricing;

// Notification type
export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  bookingDate?: string;
  status?: string;
}

// UserLocation type
export interface UserLocation {
  lat: number;
  lng: number;
}
