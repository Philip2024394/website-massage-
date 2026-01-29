import React from 'react';
import { Building2, User, CreditCard } from 'lucide-react';

interface PaymentCardProps {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    size?: 'small' | 'medium' | 'large';
}

/**
 * Credit Card Style Payment Information Display
 * Shows bank details in a beautiful credit card format with IndaStreet branding
 * Mobile-first responsive design
 */
const PaymentCard: React.FC<PaymentCardProps> = ({ 
    bankName, 
    accountHolderName, 
    accountNumber,
    size = 'medium'
}) => {
    // Format account number with spaces for readability
    const formatAccountNumber = (number: string) => {
        // Remove all spaces and non-digits for display
        const cleaned = number.replace(/\s/g, '');
        // Add space every 4 characters
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Card Container - Responsive width, aspect ratio like credit card */}
            <div className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl">
                {/* Gradient Background with Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600">
                    {/* Abstract Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full blur-3xl translate-y-12 -translate-x-12"></div>
                    </div>
                </div>

                {/* Card Content */}
                <div className="relative h-full p-4 sm:p-5 flex flex-col justify-between text-white">
                    {/* Header Row - Logo and Chip */}
                    <div className="flex items-start justify-between">
                        {/* Logo */}
                        <div className="flex flex-col">
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                                <span className="text-white">Inda</span>
                                <span className="text-black">Street</span>
                            </h1>
                        </div>

                        {/* EMV Chip */}
                        <div className="w-8 h-6 sm:w-10 sm:h-7 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 shadow-md">
                            <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-0.5 p-0.5">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="bg-yellow-600 rounded-sm opacity-30"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bank Name */}
                    <div className="mt-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Building2 className="w-3 h-3 text-white/80" />
                            <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-medium">
                                Bank
                            </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold tracking-wide truncate">
                            {bankName || 'Nama Bank'}
                        </p>
                    </div>

                    {/* Account Number */}
                    <div className="mt-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <CreditCard className="w-3 h-3 text-white/80" />
                            <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-medium">
                                Nomor Rekening
                            </span>
                        </div>
                        <p className="text-base sm:text-lg font-mono font-bold tracking-widest">
                            {formatAccountNumber(accountNumber) || '0000 0000 0000'}
                        </p>
                    </div>

                    {/* Account Holder Name */}
                    <div className="mt-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <User className="w-3 h-3 text-white/80" />
                            <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-medium">
                                Nama Pemilik
                            </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold tracking-wide uppercase truncate">
                            {accountHolderName || 'Nama Pemilik Rekening'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;
