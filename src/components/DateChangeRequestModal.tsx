// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { Calendar, Clock, X, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';

interface DateChangeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitRequest: (requestData: DateChangeRequest) => void;
    booking: {
        id: string;
        therapistName: string;
        therapistId: string;
        currentDate: string;
        currentTime: string;
        serviceDuration: number;
        depositAmount: number;
        location: string;
    };
    className?: string;
}

interface DateChangeRequest {
    newDate: string;
    newTime: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
}

const DateChangeRequestModal: React.FC<DateChangeRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmitRequest,
    booking,
    className = ''
}) => {
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get minimum date (today + 1 day for advance notice)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Get minimum time based on current booking time for same-day changes
    const isAdvanceNoticeValid = () => {
        if (!newDate) return true;
        
        const selectedDate = new Date(newDate);
        const currentBookingDate = new Date(booking.currentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // If changing to a future date, it's valid
        if (selectedDate > currentBookingDate) return true;
        
        // If changing within the same date, need at least 24 hours advance notice
        const timeDiff = currentBookingDate.getTime() - today.getTime();
        return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    };

    const handleSubmit = async () => {
        if (!newDate || !newTime || !reason.trim()) return;
        
        setIsSubmitting(true);
        
        const requestData: DateChangeRequest = {
            newDate,
            newTime,
            reason: reason.trim(),
            urgency
        };

        try {
            await onSubmitRequest(requestData);
            onClose();
        } catch (error) {
            logger.error('Error submitting date change request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-[120] p-4 ${className}`}>
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] ">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Request Date Change</h2>
                            </div>
                            <p className="text-blue-100 text-sm">Submit request to therapist for approval</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Booking Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Current Booking Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Therapist:</span>
                                    <span className="font-medium">{booking.therapistName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service:</span>
                                    <span className="font-medium">{booking.serviceDuration} min massage</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium">{booking.location}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Date:</span>
                                    <span className="font-medium text-red-600">{formatDate(booking.currentDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Time:</span>
                                    <span className="font-medium text-red-600">{booking.currentTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Deposit Paid:</span>
                                    <span className="font-medium text-green-600">{formatCurrency(booking.depositAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-blue-900 mb-2">Date Change Policy</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Requests must be made at least 24 hours in advance</li>
                                    <li>• Therapist has the right to approve or decline requests</li>
                                    <li>• Your deposit will transfer to the new date if approved</li>
                                    <li>• Time slots outside calendar window are available</li>
                                    <li>• You will receive notification about request status</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* New Date Selection */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Requested New Schedule</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    min={getMinDate()}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Time <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select time</option>
                                    <option value="07:00">07:00 (Early Morning)</option>
                                    <option value="08:00">08:00</option>
                                    <option value="09:00">09:00</option>
                                    <option value="10:00">10:00</option>
                                    <option value="11:00">11:00</option>
                                    <option value="12:00">12:00</option>
                                    <option value="13:00">13:00</option>
                                    <option value="14:00">14:00</option>
                                    <option value="15:00">15:00</option>
                                    <option value="16:00">16:00</option>
                                    <option value="17:00">17:00</option>
                                    <option value="18:00">18:00</option>
                                    <option value="19:00">19:00</option>
                                    <option value="20:00">20:00</option>
                                    <option value="21:00">21:00 (Late Evening)</option>
                                    <option value="22:00">22:00 (Late Evening)</option>
                                </select>
                            </div>
                        </div>

                        {/* Advance Notice Warning */}
                        {!isAdvanceNoticeValid() && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">
                                    <strong>⚠️ Notice:</strong> Changes require at least 24 hours advance notice. 
                                    Your selected date may not meet this requirement.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Request Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Request Urgency
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['low', 'medium', 'high'].map((level) => (
                                <label
                                    key={level}
                                    className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                        urgency === level 
                                            ? getUrgencyColor(level) 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="urgency"
                                        value={level}
                                        checked={urgency === level}
                                        onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="font-medium capitalize">{level}</div>
                                        <div className="text-xs mt-1">
                                            {level === 'low' && 'Flexible timing'}
                                            {level === 'medium' && 'Preferred change'}
                                            {level === 'high' && 'Urgent request'}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Change <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you need to change the date/time..."
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            A clear reason helps the therapist understand and approve your request
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!newDate || !newTime || !reason.trim() || isSubmitting}
                            className="flex-1 py-3 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <MessageSquare className="w-5 h-5" />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-green-800">
                                <p className="font-medium mb-1">What happens next:</p>
                                <ul className="space-y-1">
                                    <li>• Your request will be sent to {booking.therapistName}</li>
                                    <li>• You'll receive notification within 24 hours</li>
                                    <li>• If approved, your deposit transfers to the new date</li>
                                    <li>• If declined, you can submit a different request</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateChangeRequestModal;