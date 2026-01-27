// Enhanced Button Component with Sound Effects
// Industry-standard UI feedback sounds

import React, { useCallback } from 'react';
import { useButtonSounds } from '../hooks/useButtonSounds';
import { ButtonSoundType } from '../lib/buttonSoundService';

export interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    soundType?: ButtonSoundType['type'];
    enableHoverSound?: boolean;
    volume?: number;
    pitch?: number;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    size?: 'sm' | 'md' | 'lg';
}

export const SoundButton: React.FC<SoundButtonProps> = ({
    children,
    soundType = 'click',
    enableHoverSound = false,
    volume,
    pitch,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    onMouseEnter,
    disabled,
    ...props
}) => {
    const { 
        playClick, 
        playHover, 
        playSuccess, 
        playNavigation, 
        playToggle, 
        playDelete, 
        playSubmit 
    } = useButtonSounds();

    const handleClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        
        // Play appropriate sound based on type
        switch (soundType) {
            case 'success':
                await playSuccess();
                break;
            case 'error':
            case 'delete':
                await playDelete();
                break;
            case 'navigation':
                await playNavigation();
                break;
            case 'submit':
                await playSubmit();
                break;
            case 'toggle':
                await playToggle(true); // Default to ON
                break;
            default:
                await playClick(volume, pitch);
        }
        
        onClick?.(event);
    }, [disabled, soundType, volume, pitch, onClick, playClick, playSuccess, playDelete, playNavigation, playSubmit, playToggle]);

    const handleMouseEnter = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (enableHoverSound && !disabled) {
            await playHover();
        }
        onMouseEnter?.(event);
    }, [enableHoverSound, disabled, onMouseEnter, playHover]);

    // Button styling based on variant
    const getVariantClasses = () => {
        const base = 'transition-all duration-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
        
        switch (variant) {
            case 'primary':
                return `${base} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
            case 'secondary':
                return `${base} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`;
            case 'success':
                return `${base} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
            case 'danger':
                return `${base} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
            case 'warning':
                return `${base} bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500`;
            default:
                return `${base} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm';
            case 'lg':
                return 'px-6 py-3 text-lg';
            default:
                return 'px-4 py-2 text-base';
        }
    };

    const buttonClasses = `${getVariantClasses()} ${getSizeClasses()} ${className}`;

    return (
        <button
            className={buttonClasses}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default SoundButton;