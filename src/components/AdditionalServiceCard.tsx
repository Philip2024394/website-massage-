/**
 * AdditionalServiceCard – Collapsible card for massage place additional services
 * (e.g. hair salon, beautician). Matches CityPlaceCard price-container style.
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, Sparkles, FingerprintPattern, MessageCircle } from 'lucide-react';

const DEFAULT_SERVICE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1766551253328';

/** Stable pseudo-random bookings this month (1–40) per service, so each card shows different but realistic value. */
function getBookingsThisMonth(serviceId: string, serviceName: string): number {
    let hash = 0;
    const str = `${serviceId}-${serviceName}`;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return 1 + (Math.abs(hash) % 40);
}

export interface AdditionalServiceDetail {
    label: string;
    price: string;
    duration?: string;
}

export interface AdditionalService {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    details: AdditionalServiceDetail[];
    bookLabel?: 'Book' | 'Schedule';
}

interface AdditionalServiceCardProps {
    service: AdditionalService;
    placeName: string;
    placeWhatsApp?: string;
    userCountryCode?: string;
    /** When true (e.g. free-plan therapist), booking/schedule always goes to admin until member upgrades. */
    useAdminForBooking?: boolean;
    onBook?: (service: AdditionalService) => void;
}

const ADMIN_WHATSAPP_DIGITS = '6281392000050';

function isBookingUseAdminCountry(code?: string): boolean {
    return code === 'ID' || !code;
}

function normalizeWhatsAppToDigits(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (!digits.startsWith('62')) return '62' + digits;
    return digits;
}

/** True when all details show "Contact for price" (no fixed price). */
function isContactForPrice(service: AdditionalService): boolean {
    if (!service.details?.length) return true;
    return service.details.every(
        (d) => !d?.price || /contact\s*for\s*price/i.test(String(d.price).trim())
    );
}

/** Build one-line or multi-line details string for WhatsApp (type, duration, price for each option). */
function buildBookingDetailsLine(service: AdditionalService): string {
    if (!service.details?.length) return '';
    return service.details
        .map((d) => [d.label || service.name, d.duration, d.price].filter(Boolean).join(' • '))
        .join('\n');
}

const AdditionalServiceCard: React.FC<AdditionalServiceCardProps> = ({
    service,
    placeName,
    placeWhatsApp,
    userCountryCode = 'ID',
    useAdminForBooking = false,
    onBook,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [scheduledTime, setScheduledTime] = useState('10:00');
    /** Selected price option index (single selection). When set, only that container shows fingerprint + heartbeat; Book button gets heartbeat. */
    const [selectedDetailIndex, setSelectedDetailIndex] = useState<number | null>(null);
    const imageUrl = service.imageUrl || DEFAULT_SERVICE_IMAGE;
    const useAdmin = useAdminForBooking || isBookingUseAdminCountry(userCountryCode);

    const detailLabel = service.details[0]?.label || service.name;
    const detailPrice = service.details[0]?.price || 'Contact for price';
    const detailDuration = service.details[0]?.duration;
    const hasMultipleDetails = service.details && service.details.length > 1;
    const bookingDetailsText = buildBookingDetailsLine(service);
    const showInquireOnly = isContactForPrice(service);

    const bookingsThisMonth = useMemo(
        () => getBookingsThisMonth(service.id, service.name),
        [service.id, service.name]
    );

    const openWhatsApp = (text: string) => {
        const waNumber = useAdmin ? ADMIN_WHATSAPP_DIGITS : (placeWhatsApp ? normalizeWhatsAppToDigits(placeWhatsApp) : ADMIN_WHATSAPP_DIGITS);
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleBookNow = () => {
        if (typeof onBook === 'function') {
            onBook(service);
            return;
        }
        const details = bookingDetailsText || [detailLabel, detailPrice, detailDuration ? `${detailDuration}` : ''].filter(Boolean).join(' • ');
        const text = `Hi${useAdmin ? ' IndaStreet Admin' : ''}, I would like to book: ${service.name} at ${placeName}.\n${details ? `Details:\n${details}` : ''}\nThank you.`;
        openWhatsApp(text);
    };

    const handleScheduleClick = () => {
        setShowScheduleForm(true);
    };

    const handleScheduleConfirm = () => {
        if (typeof onBook === 'function') {
            onBook(service);
            setShowScheduleForm(false);
            return;
        }
        const dateStr = new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const details = bookingDetailsText || [detailLabel, detailPrice, detailDuration ? `${detailDuration}` : ''].filter(Boolean).join(' • ');
        const text = `Hi${useAdmin ? ' IndaStreet Admin' : ''}, I would like to schedule: ${service.name} at ${placeName} on ${dateStr} at ${scheduledTime}.\n${details ? `Details:\n${details}` : ''}\nThank you.`;
        openWhatsApp(text);
        setShowScheduleForm(false);
    };

    const handleInquire = () => {
        if (typeof onBook === 'function') {
            onBook(service);
            return;
        }
        const text = `Hi${useAdmin ? ' IndaStreet Admin' : ''}, I would like to inquire about: ${service.name} at ${placeName}. Thank you.`;
        openWhatsApp(text);
    };

    return (
        <div className={`rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-all bg-orange-50/80 ${isOpen ? 'border-orange-400' : 'border-orange-200'}`}>
            {/* Header – always visible, click to expand/collapse */}
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-orange-100/40"
                aria-expanded={isOpen}
            >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_SERVICE_IMAGE;
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" aria-hidden />
                        {service.name}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{service.description}</p>
                </div>
                <span className="flex-shrink-0 text-gray-400" aria-hidden>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
            </button>

            {/* Expanded content – main image, description, one price container (same as profile), Book/Schedule */}
            {isOpen && (
                <div className="border-t border-orange-200 overflow-hidden bg-orange-50/80">
                    {/* Main image of service advertised */}
                    <div className="relative w-full aspect-[21/9] min-h-[140px] max-h-[200px] bg-gray-100">
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_SERVICE_IMAGE;
                            }}
                        />
                    </div>
                    <div className="px-4 pb-4 pt-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#6B2D3C]">What to expect?</h4>
                        <p className="text-sm text-gray-700 mb-4">{service.description}</p>

                        <style>{`
                            @keyframes additional-service-glow-card {
                              0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.35); }
                              50% { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2), 0 0 12px 2px rgba(249, 115, 22, 0.15); }
                            }
                            .additional-service-price-glow {
                              border-color: rgb(249 115 22);
                              box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25), 0 0 16px 4px rgba(249, 115, 22, 0.12);
                              animation: additional-service-glow-card 2.5s ease-in-out infinite;
                            }
                            @keyframes book-now-heartbeat {
                              0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
                              50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.25), 0 0 16px 4px rgba(245, 158, 11, 0.3); }
                            }
                            .additional-service-price-heartbeat {
                              animation: book-now-heartbeat 1.2s ease-in-out infinite;
                            }
                        `}</style>
                        {/* Price container(s) – select one; fingerprint + heartbeat only on selected; Book button heartbeat when selected */}
                        <div className="space-y-2 mb-4">
                            {(service.details?.length > 1 ? service.details : (service.details?.length ? [service.details[0]] : [])).map((d, i) => {
                                const isSelected = selectedDetailIndex === i;
                                const isSelectable = !showInquireOnly;
                                return (
                                    <div
                                        key={i}
                                        role={isSelectable ? 'button' : undefined}
                                        tabIndex={isSelectable ? 0 : undefined}
                                        onClick={() => isSelectable && setSelectedDetailIndex(isSelected ? null : i)}
                                        onKeyDown={(e) => isSelectable && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelectedDetailIndex(isSelected ? null : i))}
                                        className={`additional-service-price-glow w-full text-left rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-orange-50/80 border-orange-400 ${isSelectable ? 'cursor-pointer select-none' : ''} ${isSelected ? 'additional-service-price-heartbeat' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-900 mb-0.5 line-clamp-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" aria-hidden />
                                                {d?.label || service.name}
                                            </h4>
                                            {d?.duration && (
                                                <p className="text-[10px] text-gray-600">Duration: {d.duration}</p>
                                            )}
                                            <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                                {d?.price || 'Contact for price'}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <span className="flex-shrink-0 flex items-center justify-center text-amber-600" aria-hidden>
                                                <FingerprintPattern className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.8} />
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-xs text-gray-600 mb-4 text-center">
                            {bookingsThisMonth} {bookingsThisMonth === 1 ? 'Booking' : 'Bookings'} This Month
                        </p>

                        {/* Contact for price: single "Inquire Of Service" WhatsApp button; otherwise Book Now + Schedule */}
                        {showInquireOnly ? (
                            <div>
                                <button
                                    type="button"
                                    onClick={handleInquire}
                                    className="w-full py-2.5 rounded-lg font-semibold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2"
                                    aria-label="Inquire Of Service"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Inquire Of Service
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleBookNow}
                                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-2 ${selectedDetailIndex !== null ? 'additional-service-price-heartbeat' : ''}`}
                                        aria-label="Book Now"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Book Now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleScheduleClick}
                                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm bg-gray-600 hover:bg-gray-700 text-white transition-colors flex items-center justify-center gap-2 ${selectedDetailIndex !== null ? 'additional-service-price-heartbeat' : ''}`}
                                        aria-label="Schedule"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Schedule
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 mt-2 text-center">Scheduled booking requires 30% booking deposit.</p>
                            </>
                        )}

                        {/* Schedule form: date & time, then Confirm & open WhatsApp */}
                        {!showInquireOnly && showScheduleForm && (
                            <div className="mt-4 p-4 rounded-xl border-2 border-amber-300 bg-amber-50/80 space-y-3">
                                <p className="text-sm font-semibold text-gray-900">Select date & time</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            min={new Date().toISOString().slice(0, 10)}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleScheduleConfirm}
                                        className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        Confirm & open WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowScheduleForm(false)}
                                        className="py-2.5 px-4 rounded-lg font-semibold text-sm border-2 border-gray-300 text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdditionalServiceCard;
