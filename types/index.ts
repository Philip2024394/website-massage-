/**
 * Type definitions for therapist and booking data
 * Replacing `any` types with proper interfaces
 */

export interface TherapistPricing {
  '60': number;
  '90': number;
  '120': number;
}

export interface TherapistData {
  id: string;
  $id?: string;
  name: string;
  rating?: number;
  isVerified?: boolean;
  pricing: TherapistPricing;
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  city?: string;
  location?: string;
  locationId?: string;
  coordinates?: [number, number] | { lat: number; lng: number };
  bookedUntil?: string | Date;
  profilePicture?: string;
  mainImage?: string;
  whatsappNumber?: string;
  languages?: string[];
  specialties?: string[];
}

export interface BookingData {
  id?: string;
  $id?: string;
  customerId: string;
  customerName: string;
  customerWhatsApp: string;
  providerId: string;
  providerName: string;
  providerType: 'therapist' | 'place';
  duration: '60' | '90' | '120';
  price: number;
  startTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  coordinates?: [number, number];
  roomNumber?: string;
  service?: string;
}

export interface ChatMessage {
  id: string;
  $id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  messageType?: 'text' | 'system' | 'booking' | 'status-update';
}

export interface Coordinates {
  lat: number | null;
  lng: number | null;
  location: string | null;
}

export interface LocationData {
  locationId: string;
  coordinates: [number, number] | null;
}

export interface TranslationObject {
  [key: string]: string | TranslationObject;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}
