/**
 * Countdown Timer Component
 * 25-minute countdown for booking response
 * Plays warning sound at 5 minutes remaining
 */

import React, { useState, useEffect } from 'react';
import { soundService } from '../lib/soundService';

interface CountdownTimerProps {
    expiresAt: string; // ISO timestamp
    onExpire?: () => void;
    onWarning?: () => void; // Callback at 5 minutes
    language?: 'en' | 'id';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    expiresAt,
    onExpire,
    onWarning,
    language = 'en'
}) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isWarning, setIsWarning] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [hasPlayedWarning, setHasPlayedWarning] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const expiryTime = new Date(expiresAt).getTime();
            const remaining = expiryTime - now;

            if (remaining <= 0) {
                setTimeLeft('EXPIRED');
                setIsExpired(true);
                
                if (!isExpired && onExpire) {
                    soundService.play('chatExpired');
                    onExpire();
                }
                
                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

            // Warning at 5 minutes
            if (minutes === 5 && seconds === 0 && !hasPlayedWarning) {
                setIsWarning(true);
                setHasPlayedWarning(true);
                soundService.play('timeoutWarning', 0.7);
                onWarning?.();
            }

            // Warning threshold is <= 5 minutes
            setIsWarning(minutes < 5);
        };

        // Update immediately
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, onExpire, onWarning, hasPlayedWarning, isExpired]);

    const translations = {
        en: {
            expired: 'EXPIRED',
            remaining: 'remaining'
        },
        id: {
            expired: 'HABIS',
            remaining: 'tersisa'
        }
    };

    const t = translations[language];

    return (
        <div className="flex items-center gap-2">
            <div
                className={`
                    font-mono font-bold text-sm px-3 py-1 rounded-full
                    transition-all duration-300
                    ${isExpired 
                        ? 'bg-red-500 text-white' 
                        : isWarning 
                            ? 'bg-yellow-500 text-white animate-pulse' 
                            : 'bg-white/20 text-white'
                    }
                `}
            >
                ⏱️ {timeLeft === 'EXPIRED' ? t.expired : timeLeft}
            </div>
            {!isExpired && (
                <span className="text-xs text-white/80 hidden sm:inline">
                    {t.remaining}
                </span>
            )}
        </div>
    );
};

export default CountdownTimer;
