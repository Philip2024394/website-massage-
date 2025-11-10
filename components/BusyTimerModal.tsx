import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';

interface BusyTimerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (minutes: number) => void;
    t: any;
}

const BusyTimerModal: React.FC<BusyTimerModalProps> = ({ isOpen, onClose, onConfirm, t }) => {
    const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
    
    if (!isOpen) return null;

    // Predefined time options with journey time included
    const timeOptions = [
        { display: '60 min session + 30 min journey', minutes: 90, sessionTime: 60 },
        { display: '90 min session + 30 min journey', minutes: 120, sessionTime: 90 },
        { display: '120 min session + 30 min journey', minutes: 150, sessionTime: 120 },
    ];

    const handleConfirm = () => {
        if (selectedMinutes) {
            onConfirm(selectedMinutes);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Set Busy Duration</h3>
                            <p className="text-sm text-gray-600">How long will you be busy?</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Time Options */}
                <div className="space-y-3 mb-6">
                    {timeOptions.map((option) => (
                        <button
                            key={option.minutes}
                            onClick={() => setSelectedMinutes(option.minutes)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                selectedMinutes === option.minutes
                                    ? 'border-yellow-300 bg-yellow-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-yellow-200 hover:bg-yellow-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">{option.display}</p>
                                    <p className="text-sm text-gray-600">
                                        Total: {Math.floor(option.minutes / 60)}h {option.minutes % 60}m
                                    </p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    selectedMinutes === option.minutes
                                        ? 'border-yellow-500 bg-yellow-500'
                                        : 'border-gray-300'
                                }`}>
                                    {selectedMinutes === option.minutes && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedMinutes}
                        className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-colors ${
                            selectedMinutes
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Start Timer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusyTimerModal;