import React from 'react';

interface ValidationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    missingFields: string[];
    type?: 'error' | 'warning' | 'info';
}

export const ValidationPopup: React.FC<ValidationPopupProps> = ({
    isOpen,
    onClose,
    title,
    missingFields,
    type = 'error'
}) => {
    if (!isOpen) return null;

    const getIconAndColors = () => {
        switch (type) {
            case 'error':
                return {
                    icon: '❌',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    titleColor: 'text-red-800',
                    buttonColor: 'bg-red-600 hover:bg-red-700'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    titleColor: 'text-yellow-800',
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
                };
            default:
                return {
                    icon: 'ℹ️',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    titleColor: 'text-blue-800',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700'
                };
        }
    };

    const { icon, bgColor, borderColor, titleColor, buttonColor } = getIconAndColors();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className={`max-w-md w-full ${bgColor} ${borderColor} border-2 rounded-xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto`}>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{icon}</span>
                        <h3 className={`text-lg font-semibold ${titleColor}`}>
                            {title}
                        </h3>
                    </div>
                    
                    {/* Missing Fields List */}
                    <div className="mb-6">
                        <p className={`text-sm ${titleColor} mb-3`}>
                            Please complete the following required fields:
                        </p>
                        <ul className={`text-sm ${titleColor} space-y-1`}>
                            {missingFields.map((field, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>{field.replace('• ', '')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Footer Message */}
                    <div className={`text-xs ${titleColor} mb-4 p-3 bg-white bg-opacity-50 rounded-lg`}>
                        ✅ All fields are required to create a complete professional profile that customers can trust.
                    </div>
                    
                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className={`w-full ${buttonColor} text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                    >
                        Got it, I'll complete the fields
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationPopup;