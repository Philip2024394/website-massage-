import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface BusyCountdownTimerProps {
    endTime: string | Date;
    onExpired?: () => void;
    className?: string;
}

const BusyCountdownTimer: React.FC<BusyCountdownTimerProps> = ({ endTime, onExpired, className = '' }) => {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const difference = end - now;

            if (difference > 0) {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                return { hours, minutes, seconds, total: difference };
            } else {
                return { hours: 0, minutes: 0, seconds: 0, total: 0 };
            }
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Set up interval to update every second
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // Check if timer has expired
            if (newTimeLeft.total <= 0) {
                clearInterval(timer);
                onExpired?.();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, onExpired]);

    // Don't render if no time left
    if (timeLeft.total <= 0) {
        return null;
    }

    const formatTime = () => {
        if (timeLeft.hours > 0) {
            return `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
        } else {
            return `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`;
        }
    };

    return (
        <div className={`inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
            <Clock className="w-3 h-3" />
            <span>{formatTime()}</span>
        </div>
    );
};

export default BusyCountdownTimer;