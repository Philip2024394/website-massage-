import React, { useState, useMemo } from 'react';
import type { Therapist, Place, Booking } from '../types';
import { BookingStatus, ProviderResponseStatus } from '../types';
import Button from '../components/Button';

interface HotelVillaGuestBookingPageProps {
    provider: Therapist | Place;
    providerType: 'therapist' | 'place';
    hotelVillaId: number;
    hotelVillaName: string;
    selectedLanguage: string;
    onBookingSubmit: (bookingData: Partial<Booking>) => Promise<void>;
    onBack: () => void;
}

const LANGUAGES: Record<string, any> = {
    en: {
        bookAppointment: 'Book Appointment',
        guestDetails: 'Guest Details',
        guestName: 'Guest Name',
        guestNamePlaceholder: 'Enter your name',
        roomNumber: 'Room Number',
        roomNumberPlaceholder: 'e.g. 201',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        selectDuration: 'Select Service Duration',
        min60: '60 Minutes',
        min90: '90 Minutes',
        min120: '120 Minutes',
        chargeToRoom: 'Charge to my room',
        confirmBooking: 'Confirm Booking',
        back: 'Back',
        fillAllFields: 'Please fill in all required fields',
        oneHourNotice: 'Bookings require at least 1 hour advance notice',
        noAvailableSlots: 'No available time slots for selected date',
        providerDetails: 'Provider Details',
        bookingWith: 'Booking with'
    },
    id: {
        bookAppointment: 'Pesan Janji Temu',
        guestDetails: 'Detail Tamu',
        guestName: 'Nama Tamu',
        guestNamePlaceholder: 'Masukkan nama Anda',
        roomNumber: 'Nomor Kamar',
        roomNumberPlaceholder: 'mis. 201',
        selectDate: 'Pilih Tanggal',
        selectTime: 'Pilih Waktu',
        selectDuration: 'Pilih Durasi Layanan',
        min60: '60 Menit',
        min90: '90 Menit',
        min120: '120 Menit',
        chargeToRoom: 'Tagih ke kamar saya',
        confirmBooking: 'Konfirmasi Pemesanan',
        back: 'Kembali',
        fillAllFields: 'Harap isi semua kolom yang diperlukan',
        oneHourNotice: 'Pemesanan memerlukan pemberitahuan minimal 1 jam',
        noAvailableSlots: 'Tidak ada slot waktu tersedia untuk tanggal yang dipilih',
        providerDetails: 'Detail Penyedia',
        bookingWith: 'Booking dengan'
    },
    zh: {
        bookAppointment: '预约',
        guestDetails: '客人详情',
        guestName: '客人姓名',
        guestNamePlaceholder: '输入您的姓名',
        roomNumber: '房间号',
        roomNumberPlaceholder: '例如 201',
        selectDate: '选择日期',
        selectTime: '选择时间',
        selectDuration: '选择服务时长',
        min60: '60分钟',
        min90: '90分钟',
        min120: '120分钟',
        chargeToRoom: '记账到房间',
        confirmBooking: '确认预订',
        back: '返回',
        fillAllFields: '请填写所有必填字段',
        oneHourNotice: '预订需要至少提前1小时',
        noAvailableSlots: '所选日期没有可用时段',
        providerDetails: '服务提供者详情',
        bookingWith: '预订'
    },
    // Add other languages as needed (ja, ko, ru, fr, de)
};

const HotelVillaGuestBookingPage: React.FC<HotelVillaGuestBookingPageProps> = ({
    provider,
    providerType,
    hotelVillaId,
    hotelVillaName,
    selectedLanguage,
    onBookingSubmit,
    onBack
}) => {
    const t = LANGUAGES[selectedLanguage] || LANGUAGES.en;
    
    const [guestName, setGuestName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120'>('60');
    const [chargeToRoom, setChargeToRoom] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate minimum booking time (current time + 1 hour)
    const minimumBookingTime = useMemo(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now;
    }, []);

    // Generate available time slots (hourly from 8 AM to 10 PM)
    const availableTimeSlots = useMemo(() => {
        const slots: string[] = [];
        const selectedDateMidnight = new Date(selectedDate);
        selectedDateMidnight.setHours(0, 0, 0, 0);
        
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        
        const isToday = selectedDateMidnight.getTime() === todayMidnight.getTime();
        
        for (let hour = 8; hour <= 22; hour++) {
            const slotTime = new Date(selectedDate);
            slotTime.setHours(hour, 0, 0, 0);
            
            // Only show slots that are at least 1 hour in the future
            if (slotTime >= minimumBookingTime) {
                const timeString = slotTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: false 
                });
                slots.push(timeString);
            }
        }
        
        return slots;
    }, [selectedDate, minimumBookingTime]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + timezoneOffset);
        setSelectedDate(adjustedDate);
        setSelectedTime(null); // Reset time when date changes
    };

    const handleSubmit = async () => {
        // Validation
        if (!guestName.trim() || !roomNumber.trim() || !selectedTime) {
            setError(t.fillAllFields);
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const [hour, minute] = selectedTime.split(':').map(Number);
            const bookingStartTime = new Date(selectedDate);
            bookingStartTime.setHours(hour, minute, 0, 0);

            // Calculate confirmation deadline (25 minutes from now)
            const confirmationDeadline = new Date();
            confirmationDeadline.setMinutes(confirmationDeadline.getMinutes() + 25);

            const bookingData: Partial<Booking> = {
                providerId: typeof provider.id === 'number' ? provider.id : parseInt(String(provider.id)),
                providerType,
                providerName: provider.name,
                service: selectedDuration,
                startTime: bookingStartTime.toISOString(),
                status: BookingStatus.Pending,
                
                // Hotel/Villa guest fields
                guestName: guestName.trim(),
                roomNumber: roomNumber.trim(),
                hotelVillaId,
                hotelVillaName,
                guestLanguage: selectedLanguage,
                chargeToRoom,
                
                // Provider response tracking
                providerResponseStatus: ProviderResponseStatus.AwaitingResponse,
                confirmationDeadline: confirmationDeadline.toISOString(),
                
                // Fallback system
                isReassigned: false,
                fallbackProviderIds: [],
                
                createdAt: new Date().toISOString()
            };

            await onBookingSubmit(bookingData);
        } catch (err) {
            console.error('Booking submission error:', err);
            setError('Failed to submit booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow bookings up to 30 days ahead
    const maxDateString = maxDate.toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4 shadow-lg">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>{t.back}</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold">{t.bookAppointment}</h1>
                    <p className="text-blue-100 mt-2">{hotelVillaName}</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
                {/* Provider Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
                    <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        {t.bookingWith}
                    </h2>
                    <h3 className="text-2xl font-bold text-gray-800">{provider.name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{provider.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span>{provider.reviewCount} reviews</span>
                    </div>
                </div>

                {/* Guest Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">{t.guestDetails}</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="guestName" className="block text-sm font-semibold text-gray-700 mb-2">
                                {t.guestName} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="guestName"
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder={t.guestNamePlaceholder}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="roomNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                {t.roomNumber} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="roomNumber"
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                placeholder={t.roomNumberPlaceholder}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <label htmlFor="bookingDate" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.selectDate} <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="bookingDate"
                        type="date"
                        min={today}
                        max={maxDateString}
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                    />
                </div>

                {/* Time Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        {t.selectTime} <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-blue-600 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.oneHourNotice}
                    </p>
                    
                    {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableTimeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all ${
                                        selectedTime === time
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                            {t.noAvailableSlots}
                        </p>
                    )}
                </div>

                {/* Duration Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        {t.selectDuration} <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {(['60', '90', '120'] as const).map(duration => (
                            <button
                                key={duration}
                                onClick={() => setSelectedDuration(duration)}
                                className={`py-4 px-4 rounded-xl text-center font-bold transition-all ${
                                    selectedDuration === duration
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <div className="text-2xl">{duration}</div>
                                <div className="text-xs mt-1 opacity-90">minutes</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Room Billing */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={chargeToRoom}
                            onChange={(e) => setChargeToRoom(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700 font-medium">{t.chargeToRoom}</span>
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedTime || !guestName.trim() || !roomNumber.trim()}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                        isSubmitting || !selectedTime || !guestName.trim() || !roomNumber.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]'
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        t.confirmBooking
                    )}
                </button>
            </main>
        </div>
    );
};

export default HotelVillaGuestBookingPage;
