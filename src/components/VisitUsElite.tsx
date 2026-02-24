/**
 * ELITE "Visit Us" container – Massage Spa Profile Page.
 * Only visible for ELITE (190,000 IDR) plan. Premium trust block: address, location image, hours, live status.
 * Indonesia timezone (Asia/Jakarta). Mobile-first: Image → Address → Status → Get Directions.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { MapPin, Phone, ShieldCheck, Car, Navigation, Sparkles, ShowerHead, Coffee, Wifi, Lock, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';

const INDONESIA_TZ = 'Asia/Jakarta';

/** Haversine formula – returns distance in km between two lat/lng points */
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
const STATIC_MAP_FALLBACK = 'https://ik.imagekit.io/7grri5v7d/map%20google.png';

function getNowInIndonesia(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: INDONESIA_TZ }));
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.trim().split(/[:\s]/).map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Returns open/closed state and message for today based on openingTime, closingTime in Indonesia timezone. */
function useVisitUsHours(openingTime: string, closingTime: string) {
  const [now, setNow] = useState(() => getNowInIndonesia());

  useEffect(() => {
    const t = setInterval(() => setNow(getNowInIndonesia()), 60_000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => {
    const openMins = parseTimeToMinutes(openingTime || '09:00');
    const closeMins = parseTimeToMinutes(closingTime || '21:00');
    const dayMins = now.getHours() * 60 + now.getMinutes();

    const isOpen = dayMins >= openMins && dayMins < closeMins;
    const openStr = formatMinutesToTime(openMins);
    const closeStr = formatMinutesToTime(closeMins);

    let statusLabel: string;
    let statusDetail: string;

    if (isOpen) {
      const remainingMins = closeMins - dayMins;
      const h = Math.floor(remainingMins / 60);
      const m = remainingMins % 60;
      statusLabel = 'Open Now';
      statusDetail = m > 0
        ? `Closes in ${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`
        : `Closes in ${h} hour${h !== 1 ? 's' : ''}`;
    } else {
      if (dayMins < openMins) {
        statusLabel = 'Closed';
        statusDetail = `Opens today at ${openStr}`;
      } else {
        statusLabel = 'Closed';
        statusDetail = `Opens tomorrow at ${openStr}`;
      }
    }

    return {
      isOpen,
      openStr,
      closeStr,
      statusLabel,
      statusDetail,
    };
  }, [now, openingTime, closingTime]);
}

export interface VisitUsEliteProps {
  place: {
    location?: string;
    coordinates?: { lat: number; lng: number } | string | number[];
    openingTime?: string;
    closingTime?: string;
    whatsappNumber?: string;
    contactNumber?: string;
    isVerified?: boolean;
    [key: string]: any;
  };
  language?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export default function VisitUsElite({ place, language = 'id', userLocation }: VisitUsEliteProps) {
  const p = place as any;
  const membershipPlan = p.membershipPlan || p.plan || p.membership;
  if (membershipPlan !== 'elite') return null;

  const coordsRaw = p.coordinates;
  let lat: number | null = null;
  let lng: number | null = null;
  if (coordsRaw) {
    if (Array.isArray(coordsRaw)) {
      if (coordsRaw.length >= 2) {
        lng = Number(coordsRaw[0]);
        lat = Number(coordsRaw[1]);
      }
    } else if (typeof coordsRaw === 'string') {
      try {
        const arr = JSON.parse(coordsRaw);
        if (Array.isArray(arr) && arr.length >= 2) {
          lng = Number(arr[0]);
          lat = Number(arr[1]);
        }
      } catch (_) {}
    } else if (typeof coordsRaw === 'object' && coordsRaw !== null && 'lat' in coordsRaw && 'lng' in coordsRaw) {
      lat = Number((coordsRaw as any).lat);
      lng = Number((coordsRaw as any).lng);
    }
  }

  const mapsUrl =
    lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  // Calculate distance if user location is available, or use place's estimatedDistance
  const distanceKm = useMemo(() => {
    // First try to calculate from user location
    if (userLocation && lat != null && lng != null) {
      return getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
    }
    // Fallback to place's estimated distance if provided
    const estimated = p.estimatedDistance || p.distanceKm || p.distance;
    if (estimated != null && !isNaN(Number(estimated))) {
      return Number(estimated);
    }
    return null;
  }, [userLocation, lat, lng, p.estimatedDistance, p.distanceKm, p.distance]);

  const distanceLabel = distanceKm != null
    ? distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} m`
      : distanceKm < 10
        ? `${distanceKm.toFixed(1)} km`
        : `${Math.round(distanceKm)} km`
    : null;

  const streetAddress = p.streetAddress || p.street_address || '';
  const area = p.area || '';
  const city = p.city || '';
  const province = p.province || p.state || '';
  const postalCode = p.postalCode || p.postal_code || '';
  const fullAddress =
    [streetAddress, area, city, province, postalCode].filter(Boolean).join(', ') ||
    p.location ||
    p.address ||
    (city || 'Indonesia');

  const locationImageUrl = p.visitUsImageUrl || p.locationImageUrl || p.visitUsImage || p.locationImage || '';
  const imageUrl = locationImageUrl.trim() || STATIC_MAP_FALLBACK;

  const openingTime = p.openingTime || p.openingtime || '09:00';
  const closingTime = p.closingTime || p.closingtime || '21:00';
  const hours = useVisitUsHours(openingTime, closingTime);

  const phone = p.whatsappNumber || p.whatsappnumber || p.contactNumber || p.contact_number || p.phone || '';
  const telUrl = phone ? `tel:${phone.replace(/\D/g, '').replace(/^0/, '62')}` : null;
  const isId = language === 'id';
  const isVerified = p.isVerified ?? p.verified ?? false;
  const parking = p.parkingAvailability || p.parking || '';

  const whatsIncludedList = p.whatsIncluded || [
    'Complimentary welcome drink',
    'Hot towel service',
    'Shower facilities',
    'Locker & storage',
    'Aromatherapy oils',
    'Post-massage tea',
  ];
  const amenityConfig = [
    { icon: ShowerHead, label: 'Shower', labelId: 'Shower' },
    { icon: Coffee, label: 'Tea & Coffee', labelId: 'Teh & Kopi' },
    { icon: Wifi, label: 'Free WiFi', labelId: 'WiFi Gratis' },
    { icon: Lock, label: 'Locker', labelId: 'Loker' },
  ];
  const paymentConfig = [
    { icon: CreditCard, label: 'Card', labelId: 'Kartu' },
    { icon: Banknote, label: 'Cash', labelId: 'Tunai' },
    { icon: Smartphone, label: 'QRIS', labelId: 'QRIS' },
    { icon: Building2, label: 'Transfer', labelId: 'Transfer' },
  ];

  return (
    <section className="mt-8 rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" aria-hidden />
            <span>Visit Us</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 ml-7">
            {isId ? 'Klik peta dan ikuti petunjuk arah kami' : 'Click on the map and follow our directions'}
          </p>
        </div>

        {/* 1. Custom Location Image (16:9) – mobile first */}
        <a
          href={mapsUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4 relative group"
          style={{ aspectRatio: '16/9' }}
        >
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-medium drop-shadow-lg">
            {isId ? 'Ketuk untuk Petunjuk Arah' : 'Tap to Get Directions'}
          </span>
        </a>

        {/* 2. Address – clickable */}
        <div className="mb-4">
          {isVerified && (
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-700">{isId ? 'Lokasi Terverifikasi' : 'Verified Location'}</span>
            </div>
          )}
          <a
            href={mapsUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-amber-600 hover:underline text-sm leading-relaxed block"
          >
            {fullAddress}
          </a>
          {parking && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Car className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-hidden />
              {parking}
            </p>
          )}
        </div>

        {/* Your Visit Includes + Spa Amenities – under address */}
        <div className="mb-4 p-4 rounded-xl border-2 bg-orange-50/80 border-orange-400">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden />
            {isId ? 'Termasuk dalam Kunjungan Anda' : 'Your Visit Includes'}
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
            {whatsIncludedList.map((item: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <h4 className="text-sm font-bold text-gray-900 mb-3 pt-2 border-t border-orange-200">
            {isId ? 'Fasilitas Spa' : 'Spa Amenities'}
          </h4>
          <div className="flex flex-nowrap justify-between gap-2">
            {amenityConfig.map(({ icon: Icon, label, labelId }, i: number) => (
              <div key={i} className="flex flex-1 min-w-0 flex-col items-center gap-1">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white border border-amber-200 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] text-gray-600 font-medium text-center">{isId ? labelId : label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* 3. Business Hours + Live Status – styled like price container */}
        <div className="mb-4 p-3 rounded-xl border-2 bg-orange-50/80 border-orange-400">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Hours & Status */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 mb-1">
                {isId ? 'Jam buka hari ini' : "Today's hours"}: {hours.openStr} – {hours.closeStr}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-bold ${hours.isOpen ? 'text-green-700' : 'text-red-700'}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${hours.isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                    aria-hidden
                  />
                  {hours.isOpen ? (isId ? 'Buka Sekarang' : 'Open Now') : (isId ? 'Tutup' : 'Closed')}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 mt-1">{hours.statusDetail}</p>
            </div>
            {/* Right: Distance */}
            {distanceLabel && (
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 text-orange-600">
                  <Navigation className="w-4 h-4" aria-hidden />
                  <span className="text-lg font-bold">{distanceLabel}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{isId ? 'jarak' : 'away'}</p>
              </div>
            )}
          </div>
          {/* Scheduled Booking note */}
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            {isId ? 'Pemesanan Terjadwal Diterima 24/7' : 'Scheduled Booking Accepted 24/7'}
          </p>
        </div>

        {/* 4. Buttons – Get Directions + Call Spa (side by side) */}
        <div className="flex flex-row flex-wrap gap-3">
          <a
            href={mapsUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 active:scale-[0.98] transition-all touch-manipulation"
          >
            <MapPin className="w-5 h-5 flex-shrink-0" />
            {isId ? 'Petunjuk Arah' : 'Get Directions'}
          </a>
          {telUrl && (
            <a
              href={telUrl}
              className="flex-1 min-w-0 min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all touch-manipulation"
            >
              <Phone className="w-5 h-5 flex-shrink-0" />
              {isId ? 'Telepon Spa' : 'Call Spa'}
            </a>
          )}
        </div>

        {/* 5. Payment methods – one line under buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 mb-2 text-center">{isId ? 'Metode pembayaran' : 'Payment methods'}</p>
          <div className="flex flex-nowrap justify-center gap-4">
            {paymentConfig.map(({ icon: Icon, label, labelId }, i: number) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-[10px] text-gray-600 font-medium">{isId ? labelId : label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
