import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: string;
    velocityX: number;
    velocityY: number;
    rotationSpeed: number;
    shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiAnimationProps {
    isActive: boolean;
    duration?: number;
    intensity?: 'low' | 'medium' | 'high' | 'explosive';
    onComplete?: () => void;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
    isActive,
    duration = 3000,
    intensity = 'explosive',
    onComplete
}) => {
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const [animationFrame, setAnimationFrame] = useState<number | null>(null);

    const colors = [
        '#FFD700', // Gold
        '#FFA500', // Orange
        '#FF6347', // Tomato
        '#32CD32', // Lime Green
        '#1E90FF', // Dodger Blue
        '#FF69B4', // Hot Pink
        '#9370DB', // Medium Purple
        '#00CED1', // Dark Turquoise
        '#FFB6C1', // Light Pink
        '#98FB98'  // Pale Green
    ];

    const getIntensitySettings = (intensity: string) => {
        switch (intensity) {
            case 'low':
                return { count: 30, spread: 60, force: 0.3 };
            case 'medium':
                return { count: 60, spread: 80, force: 0.5 };
            case 'high':
                return { count: 100, spread: 100, force: 0.7 };
            case 'explosive':
                return { count: 150, spread: 120, force: 1.0 };
            default:
                return { count: 150, spread: 120, force: 1.0 };
        }
    };

    const createConfettiPiece = (index: number, settings: any): ConfettiPiece => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const angle = (Math.PI * 2 * index) / settings.count + (Math.random() - 0.5) * 0.5;
        const velocity = (Math.random() * 8 + 4) * settings.force;
        
        return {
            id: index,
            x: centerX,
            y: centerY,
            rotation: Math.random() * 360,
            scale: Math.random() * 0.8 + 0.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocityX: Math.cos(angle) * velocity,
            velocityY: Math.sin(angle) * velocity - Math.random() * 3,
            rotationSpeed: (Math.random() - 0.5) * 10,
            shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
        };
    };

    const updateConfetti = (pieces: ConfettiPiece[]): ConfettiPiece[] => {
        return pieces.map(piece => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + piece.rotationSpeed,
            velocityY: piece.velocityY + 0.3, // Gravity
            velocityX: piece.velocityX * 0.99, // Air resistance
        })).filter(piece => 
            piece.x > -50 && 
            piece.x < window.innerWidth + 50 && 
            piece.y < window.innerHeight + 50
        );
    };

    const animate = () => {
        setConfetti(prev => updateConfetti(prev));
        const frame = requestAnimationFrame(animate);
        setAnimationFrame(frame);
    };

    useEffect(() => {
        if (isActive) {
            const settings = getIntensitySettings(intensity);
            const newConfetti = Array.from({ length: settings.count }, (_, i) => 
                createConfettiPiece(i, settings)
            );
            setConfetti(newConfetti);
            
            const frame = requestAnimationFrame(animate);
            setAnimationFrame(frame);

            const timer = setTimeout(() => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                setConfetti([]);
                onComplete?.();
            }, duration);

            return () => {
                clearTimeout(timer);
                if (frame) {
                    cancelAnimationFrame(frame);
                }
            };
        } else {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                setAnimationFrame(null);
            }
            setConfetti([]);
        }
    }, [isActive, intensity, duration]);

    const renderShape = (piece: ConfettiPiece) => {
        const style = {
            position: 'absolute' as const,
            left: piece.x,
            top: piece.y,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            backgroundColor: piece.color,
            pointerEvents: 'none' as const,
            zIndex: 9999,
        };

        switch (piece.shape) {
            case 'circle':
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...style,
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                        }}
                    />
                );
            case 'square':
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...style,
                            width: '6px',
                            height: '6px',
                        }}
                    />
                );
            case 'triangle':
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...style,
                            width: 0,
                            height: 0,
                            backgroundColor: 'transparent',
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderBottom: `8px solid ${piece.color}`,
                        }}
                    />
                );
            default:
                return null;
        }
    };

    if (!isActive || confetti.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        >
            {confetti.map(renderShape)}
        </div>
    );
};

export default ConfettiAnimation;