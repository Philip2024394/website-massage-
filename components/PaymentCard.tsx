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
 */
const PaymentCard: React.FC<PaymentCardProps> = ({ 
    bankName, 
    accountHolderName, 
    accountNumber,
    size = 'medium'
}) => {
    // Format account number with spaces for readability
    const formatAccountNumber = (number: string) => {
        // Remove all spaces and non-digits
        const cleaned = number.replace(/\D/g, '');
        // Add space every 4 digits
        return cleaned.replace(/(\d{4})/g, '$1 ').trim();
    };

    const sizeClasses = {
        small: {
            container: 'w-72 h-44',
            logo: 'text-xl',
            chip: 'w-10 h-8',
            bankName: 'text-base',
            accountNumber: 'text-lg',
            holderName: 'text-sm',
            label: 'text-xs'
        },
        medium: {
            container: 'w-96 h-56',
            logo: 'text-2xl',
            chip: 'w-12 h-10',
            bankName: 'text-lg',
            accountNumber: 'text-2xl',
            holderName: 'text-base',
            label: 'text-xs'
        },
        large: {
            container: 'w-[28rem] h-64',
            logo: 'text-3xl',
            chip: 'w-14 h-12',
            bankName: 'text-xl',
            accountNumber: 'text-3xl',
            holderName: 'text-lg',
            label: 'text-sm'
        }
    };

    const classes = sizeClasses[size];

    return (
        <div className={`${classes.container} relative rounded-2xl overflow-hidden shadow-2xl`}>
            {/* Gradient Background with Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600">
                {/* Abstract Pattern Overlay */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
                </div>
            </div>

            {/* Card Content */}
            <div className="relative h-full p-6 flex flex-col justify-between text-white">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                    {/* Logo */}
                    <div className="flex flex-col">
                        <h1 className={`${classes.logo} font-bold tracking-tight`}>
                            <span className="text-white">Inda</span>
                            <span className="text-black">Street</span>
                        </h1>
                        <p className="text-xs text-white/80 mt-0.5">Payment Details</p>
                    </div>

                    {/* EMV Chip */}
                    <div className={`${classes.chip} rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 shadow-md`}>
                        <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0.5 p-1">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className="bg-yellow-600 rounded-sm opacity-30"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bank Name */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-white/90" />
                        <span className={`${classes.label} text-white/70 uppercase tracking-wider font-semibold`}>
                            Bank
                        </span>
                    </div>
                    <p className={`${classes.bankName} font-bold tracking-wide`}>
                        {bankName}
                    </p>
                </div>

                {/* Account Number */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-white/90" />
                        <span className={`${classes.label} text-white/70 uppercase tracking-wider font-semibold`}>
                            Account Number
                        </span>
                    </div>
                    <p className={`${classes.accountNumber} font-mono font-bold tracking-widest`}>
                        {formatAccountNumber(accountNumber)}
                    </p>
                </div>

                {/* Account Holder */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-white/90" />
                        <span className={`${classes.label} text-white/70 uppercase tracking-wider font-semibold`}>
                            Account Holder
                        </span>
                    </div>
                    <p className={`${classes.holderName} font-bold tracking-wide uppercase`}>
                        {accountHolderName}
                    </p>
                </div>

                {/* Security Features */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/20">
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-white/40"></div>
                        ))}
                    </div>
                    <div className="text-xs text-white/60 font-mono">
                        VALID FOR TRANSFERS
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;
