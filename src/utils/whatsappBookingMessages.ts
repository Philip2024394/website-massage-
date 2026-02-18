/**
 * Build WhatsApp pre-filled messages for Book Now and Scheduled booking.
 * Used when user selects Book in menu slider or sends scheduled booking via WhatsApp.
 * Dashboard numbers are stored with country prefix (e.g. +62, +44); Indonesia booking uses admin.
 */

import type { Therapist } from '../types';
import { isBookingUseAdminCountry } from '../config/whatsappCountryPrefix';

function normalizePhone(phone: string | undefined): string {
  if (!phone || !String(phone).trim()) return '';
  return String(phone).replace(/\D/g, '').trim();
}

/**
 * Build WhatsApp URL. Phone should already include country code (e.g. 6281234567890 or 447911123456).
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const num = normalizePhone(phone);
  if (!num) return '';
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/**
 * For booking: Indonesia (ID) → use admin WhatsApp; other countries → use provider's saved number.
 */
export function getBookingWhatsAppNumber(
  provider: { country?: string; countryCode?: string; whatsappNumber?: string; contactNumber?: string },
  adminNumber: string
): string {
  const country = provider.country ?? (provider as any).countryCode ?? '';
  if (isBookingUseAdminCountry(country)) return normalizePhone(adminNumber) || adminNumber.replace(/\D/g, '');
  const raw = provider.whatsappNumber ?? (provider as any).contactNumber ?? '';
  const num = normalizePhone(raw);
  return num || normalizePhone(adminNumber);
}

/**
 * Book Now message: therapist name, ID, massage type, duration (min), price.
 */
export function buildBookNowMessage(opts: {
  therapistName: string;
  therapistId: string;
  massageType: string;
  durationMin: number;
  price: number;
  priceFormatted?: string;
}): string {
  const { therapistName, therapistId, massageType, durationMin, price, priceFormatted } = opts;
  const priceStr = priceFormatted ?? (price >= 1000 ? `IDR ${(price / 1000).toFixed(0)}K` : `IDR ${price}`);
  const lines = [
    `Hi, I would like to book.`,
    `Therapist: ${therapistName}`,
    `ID: ${therapistId}`,
    `Massage type: ${massageType}`,
    `Duration: ${durationMin} min`,
    `Price: ${priceStr}`,
  ];
  return lines.join('\n');
}

/**
 * Scheduled booking message: date, time, duration, therapist name, ID, plus any notes.
 */
export function buildScheduledBookingMessage(opts: {
  therapistName: string;
  therapistId: string;
  date: string;
  time: string;
  durationMin: number;
  massageType?: string;
  price?: number;
  customerName?: string;
  customerWhatsApp?: string;
  roomNumber?: string;
}): string {
  const {
    therapistName,
    therapistId,
    date,
    time,
    durationMin,
    massageType,
    price,
    customerName,
    customerWhatsApp,
    roomNumber,
  } = opts;
  const lines = [
    `Hi, I would like to schedule a booking.`,
    `Therapist: ${therapistName} (ID: ${therapistId})`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Duration: ${durationMin} min`,
  ];
  if (massageType) lines.push(`Service: ${massageType}`);
  if (price != null && price > 0) {
    const priceStr = price >= 1000 ? `IDR ${(price / 1000).toFixed(0)}K` : `IDR ${price}`;
    lines.push(`Price: ${priceStr}`);
  }
  if (customerName) lines.push(`My name: ${customerName}`);
  if (customerWhatsApp) lines.push(`WhatsApp: +62${customerWhatsApp.replace(/\D/g, '')}`);
  if (roomNumber) lines.push(`Room: ${roomNumber}`);
  return lines.join('\n');
}

/**
 * Get provider WhatsApp number as digits (with country code). No default prefix – use dashboard-stored value.
 */
export function getTherapistWhatsApp(therapist: Therapist): string {
  const raw = (therapist as any).whatsappNumber ?? (therapist as any).contactNumber ?? '';
  return normalizePhone(raw);
}

/**
 * Get first massage type from therapist (massageTypes JSON or specialization).
 */
export function getFirstMassageType(therapist: Therapist): string {
  try {
    const mt = (therapist as any).massageTypes;
    if (typeof mt === 'string') {
      const parsed = JSON.parse(mt);
      if (Array.isArray(parsed) && parsed[0]) return String(parsed[0]);
    }
    if (Array.isArray(mt) && mt[0]) return String(mt[0]);
  } catch {}
  return (therapist as any).specialization || 'Massage';
}

/**
 * Get default duration and price (60 min and price60 in IDR).
 */
export function getDefaultDurationAndPrice(therapist: Therapist): { durationMin: number; price: number } {
  const p60 = (therapist as any).price60;
  const price = typeof p60 === 'number' ? p60 * 1000 : (parseInt(String(p60 || '0'), 10) * 1000) || 250000;
  return { durationMin: 60, price };
}
