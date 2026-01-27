import React, { useState, useEffect } from 'react';

interface ActivatedDiscountButtonProps {
    endTime: Date;
    percentage: number;
    onExpire: () => void;
}

const ActivatedDiscountButton: React.FC<ActivatedDiscountButtonProps> = ({ 
    endTime, 
    percentage: _percentage, 
    onExpire 
}) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                onExpire();
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    return (
        <div className="flex flex-col items-center">
            <span className="text-lg">✅ Activated</span>
            <span className="text-sm font-mono opacity-90">⏰ {timeLeft}</span>
        </div>
    );
};

interface LiveDiscountCountdownProps {
    endTime: Date;
    percentage: number;
    onExpire: () => void;
}

const LiveDiscountCountdown: React.FC<LiveDiscountCountdownProps> = ({ 
    endTime, 
    percentage, 
    onExpire 
}) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                setIsExpired(true);
                setTimeLeft('EXPIRED');
                onExpire();
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    if (isExpired) return null;

    return (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-orange-50 border-2 border-green-300 rounded-xl">
            <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-lg font-bold text-green-800">
                        🎊 {percentage}% Discount LIVE!
                    </p>
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600">Time Remaining:</p>
                    <p className="text-xl font-mono font-bold text-orange-600">
                        ⏰ {timeLeft}
                    </p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                    Your pricing containers are flashing to attract customers!
                </p>
            </div>
        </div>
    );
};

export { ActivatedDiscountButton, LiveDiscountCountdown };