/**
 * ELITE Bottom Sheet Booking – Pull-up drawer for booking details.
 * Premium booking experience with treatment selection, date/time picker.
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Star, ChevronRight, MessageCircle } from 'lucide-react';

export interface Treatment {
  id: string;
  name: string;
  duration: number;
  price: number;
  originalPrice?: number;
  isMostPopular?: boolean;
  isCouples?: boolean;
}

export interface EliteBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  placeId: string;
  treatments?: Treatment[];
  whatsappNumber?: string;
  language?: string;
  onBook?: (treatment: Treatment, date: string, time: string, isCouples: boolean) => void;
}

const DEFAULT_TREATMENTS: Treatment[] = [
  { id: '60', name: 'Relaxation Massage', duration: 60, price: 250000, isMostPopular: false },
  { id: '90', name: 'Traditional Balinese', duration: 90, price: 350000, originalPrice: 400000, isMostPopular: true },
  { id: '120', name: 'Premium Deep Tissue', duration: 120, price: 450000, isCouples: true },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

function formatPrice(price: number): string {
  return `IDR ${(price / 1000).toFixed(0)}K`;
}

function getNextDays(count: number): { date: string; label: string; dayName: string }[] {
  const days = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesId = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.getDate().toString(),
      dayName: dayNames[d.getDay()],
    });
  }
  return days;
}

export default function EliteBookingSheet({
  isOpen,
  onClose,
  placeName,
  placeId,
  treatments = DEFAULT_TREATMENTS,
  whatsappNumber,
  language = 'id',
  onBook,
}: EliteBookingSheetProps) {
  const isId = language === 'id';
  const [step, setStep] = useState<'treatment' | 'datetime' | 'confirm'>('treatment');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isCouplesBooking, setIsCouplesBooking] = useState(false);

  const dates = getNextDays(7);

  const handleTreatmentSelect = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep('confirm');
    }
  };

  const handleBookNow = () => {
    if (!selectedTreatment || !whatsappNumber) return;

    const cleanNumber = whatsappNumber.replace(/\D/g, '').replace(/^0/, '62');
    const couplesText = isCouplesBooking ? (isId ? ' (Pasangan)' : ' (Couples)') : '';
    const message = isId
      ? `Halo, saya ingin booking di ${placeName}:\n\n📋 Perawatan: ${selectedTreatment.name}${couplesText}\n📅 Tanggal: ${selectedDate}\n⏰ Waktu: ${selectedTime}\n💰 Harga: ${formatPrice(selectedTreatment.price)}\n\nMohon konfirmasi ketersediaan. Terima kasih!`
      : `Hi, I'd like to book at ${placeName}:\n\n📋 Treatment: ${selectedTreatment.name}${couplesText}\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTime}\n💰 Price: ${formatPrice(selectedTreatment.price)}\n\nPlease confirm availability. Thank you!`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    onBook?.(selectedTreatment, selectedDate, selectedTime, isCouplesBooking);
    onClose();
    setStep('treatment');
    setSelectedTreatment(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleBack = () => {
    if (step === 'datetime') setStep('treatment');
    else if (step === 'confirm') setStep('datetime');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {step === 'treatment' && (isId ? 'Pilih Perawatan' : 'Select Treatment')}
              {step === 'datetime' && (isId ? 'Pilih Tanggal & Waktu' : 'Select Date & Time')}
              {step === 'confirm' && (isId ? 'Konfirmasi Booking' : 'Confirm Booking')}
            </h3>
            <p className="text-xs text-gray-500">{placeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Treatment Selection */}
          {step === 'treatment' && (
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <button
                  key={treatment.id}
                  type="button"
                  onClick={() => handleTreatmentSelect(treatment)}
                  className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-amber-300 bg-white text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{treatment.name}</span>
                      {treatment.isMostPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {isId ? 'Terlaris' : 'Most Popular'}
                        </span>
                      )}
                      {treatment.isCouples && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-medium">
                          {isId ? 'Pasangan' : 'Couples'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{treatment.duration} {isId ? 'menit' : 'minutes'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(treatment.price)}</span>
                      {treatment.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(treatment.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                </button>
              ))}

              {/* Couples Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50 border border-pink-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {isId ? 'Booking untuk Pasangan' : "Couple's Booking"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCouplesBooking(!isCouplesBooking)}
                  className={`w-12 h-6 rounded-full transition-all ${isCouplesBooking ? 'bg-pink-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${isCouplesBooking ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 'datetime' && (
            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  {isId ? 'Pilih Tanggal' : 'Select Date'}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((d, i) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex-shrink-0 w-14 py-2 rounded-xl border-2 text-center transition-all ${
                        selectedDate === d.date
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      <p className="text-[10px] text-gray-500">{d.dayName}</p>
                      <p className={`text-lg font-bold ${selectedDate === d.date ? 'text-amber-600' : 'text-gray-900'}`}>
                        {d.label}
                      </p>
                      {i === 0 && <p className="text-[10px] text-amber-600">{isId ? 'Hari ini' : 'Today'}</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {isId ? 'Pilih Waktu' : 'Select Time'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-100 text-gray-700 hover:border-amber-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleDateTimeConfirm}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
              >
                {isId ? 'Lanjutkan' : 'Continue'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {isId ? '← Kembali' : '← Back'}
              </button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedTreatment && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  {isId ? 'Ringkasan Booking' : 'Booking Summary'}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isId ? 'Perawatan' : 'Treatment'}</span>
                    <span className="font-medium text-gray-900">{selectedTreatment.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isId ? 'Durasi' : 'Duration'}</span>
                    <span className="font-medium text-gray-900">{selectedTreatment.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isId ? 'Tanggal' : 'Date'}</span>
                    <span className="font-medium text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isId ? 'Waktu' : 'Time'}</span>
                    <span className="font-medium text-gray-900">{selectedTime}</span>
                  </div>
                  {isCouplesBooking && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{isId ? 'Tipe' : 'Type'}</span>
                      <span className="font-medium text-pink-600">{isId ? 'Pasangan' : 'Couples'}</span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">{isId ? 'Total' : 'Total'}</span>
                    <div className="text-right">
                      <span className="font-bold text-lg text-amber-600">
                        {formatPrice(isCouplesBooking ? selectedTreatment.price * 2 : selectedTreatment.price)}
                      </span>
                      {selectedTreatment.originalPrice && (
                        <span className="block text-xs text-gray-400 line-through">
                          {formatPrice(isCouplesBooking ? selectedTreatment.originalPrice * 2 : selectedTreatment.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {isId ? 'Book via WhatsApp' : 'Book via WhatsApp'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {isId ? '← Ubah Tanggal/Waktu' : '← Change Date/Time'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
