import React, { useState, useMemo } from 'react';
import type { Therapist, Place, Booking } from '../types';
import Button from '../components/Button';

interface BookingPageProps {
    provider: Therapist | Place;
    providerType: 'therapist' | 'place';
    onBook: (bookingData: Omit<Booking, 'id' | 'status' | 'userId' | 'userName'>) => void;
    onCreateBooking?: (bookingData: any) => Promise<void>;
    onBack: () => void;
    bookings: Booking[];
    contactNumber?: string;
    t: any;
}

const BookingPage: React.FC<BookingPageProps> = ({ provider, providerType, onBook, onBack, bookings, t }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<'60' | '90' | '120'>('60');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const availableTimeSlots = useMemo(() => {
        const slots = [];
        const startHour = providerType === 'place' ? parseInt((provider as Place).openingTime.split(':')[0]) : 9;
        const endHour = providerType === 'place' ? parseInt((provider as Place).closingTime.split(':')[0]) : 21;

        for (let hour = startHour; hour < endHour; hour++) {
            const slotTime = new Date(selectedDate);
            slotTime.setHours(hour, 0, 0, 0);

            const isBooked = bookings.some(booking => {
                const bookingStart = new Date(booking.startTime);
                return bookingStart.getFullYear() === slotTime.getFullYear() &&
                       bookingStart.getMonth() === slotTime.getMonth() &&
                       bookingStart.getDate() === slotTime.getDate() &&
                       bookingStart.getHours() === slotTime.getHours();
            });

            if (!isBooked) {
                slots.push(slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            }
        }
        return slots;
    }, [selectedDate, bookings, providerType, provider]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + timezoneOffset);
        setSelectedDate(adjustedDate);
        setSelectedTime(null);
    };

    const handleBookNowClick = () => {
        if (!selectedTime) return;
        setShowConfirmDialog(true);
    };

    const handleConfirmBooking = () => {
        if (!selectedTime) return;
        
        const [hour, minute] = selectedTime.split(':').map(Number);
        const bookingStartTime = new Date(selectedDate);
        bookingStartTime.setHours(hour, minute, 0, 0);

        const providerIdNumber = typeof provider.id === 'number' ? provider.id : (parseInt(String(provider.id), 10) || 0);
        
        console.log('📅 Booking confirmed, creating chat room...');
        
        onBook({
            providerId: providerIdNumber,
            providerType,
            providerName: provider.name,
            service: selectedService,
            startTime: bookingStartTime.toISOString(),
        });
        
        setShowConfirmDialog(false);
    };
    
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mr-4">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800 truncate">{t.title.replace('{name}', provider.name)}</h1>
            </header>

            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <label htmlFor="booking-date" className="block text-sm font-semibold text-gray-700 mb-2">{t.selectDate}</label>
                    <input
                        id="booking-date"
                        type="date"
                        min={today}
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.selectTime}</h3>
                    {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {availableTimeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`p-2 rounded-md text-sm font-medium transition-colors ${selectedTime === time ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">{t.noSlots}</p>
                    )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.selectService}</h3>
                    <div className="flex bg-gray-200 rounded-full p-1">
                        {(['60', '90', '120'] as const).map(duration => (
                            <button
                                key={duration}
                                onClick={() => setSelectedService(duration)}
                                className={`w-1/3 py-2 px-2 rounded-full text-sm font-semibold transition-colors duration-300 ${selectedService === duration ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}
                            >
                                {duration} min
                            </button>
                        ))}
                    </div>
                </div>

                <Button onClick={handleBookNowClick} disabled={!selectedTime}>
                    Book Now
                </Button>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Booking</h3>
                        <div className="space-y-3 mb-6">
                            <p className="text-gray-700">
                                <span className="font-semibold">Provider:</span> {provider.name}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Date:</span> {selectedDate.toLocaleDateString()}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Time:</span> {selectedTime}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Duration:</span> {selectedService} minutes
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                                <p className="text-sm text-blue-800">
                                    💬 After confirming, a chat window will open where you can communicate with the provider in real-time. The provider has 25 minutes to accept or decline your booking.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;
