import React, { useEffect, useState } from 'react';

const FlyingButterfly: React.FC = () => {
    const [position, setPosition] = useState({ x: 10, y: 20 });
    const [wingFlap, setWingFlap] = useState(0);

    useEffect(() => {
        // Wing flapping animation
        const flapInterval = setInterval(() => {
            setWingFlap(prev => (prev + 1) % 60);
        }, 50);

        // Butterfly movement animation
        let time = 0;
        const moveInterval = setInterval(() => {
            time += 0.02;
            const x = 10 + Math.sin(time) * 30 + Math.sin(time * 2) * 10;
            const y = 20 + Math.cos(time * 0.5) * 15 + Math.sin(time * 3) * 5;
            setPosition({ x, y });
        }, 50);

        return () => {
            clearInterval(flapInterval);
            clearInterval(moveInterval);
        };
    }, []);

    // Wing rotation based on flapping
    const leftWingRotation = Math.sin(wingFlap * 0.3) * 25;
    const rightWingRotation = -Math.sin(wingFlap * 0.3) * 25;

    return (
        <div 
            className="fixed pointer-events-none z-50"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transition: 'left 0.05s linear, top 0.05s linear',
            }}
        >
            <svg 
                width="60" 
                height="60" 
                viewBox="0 0 100 100"
                style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
            >
                {/* Left Wing */}
                <g
                    style={{
                        transform: `rotate(${leftWingRotation}deg)`,
                        transformOrigin: '50px 50px',
                        transition: 'transform 0.05s ease-out',
                    }}
                >
                    {/* Upper left wing */}
                    <ellipse
                        cx="30"
                        cy="35"
                        rx="18"
                        ry="25"
                        fill="url(#gradient1)"
                        stroke="#ff6b35"
                        strokeWidth="1"
                    />
                    {/* Lower left wing */}
                    <ellipse
                        cx="32"
                        cy="60"
                        rx="15"
                        ry="20"
                        fill="url(#gradient2)"
                        stroke="#ff8c42"
                        strokeWidth="1"
                    />
                    {/* Wing patterns - left */}
                    <circle cx="28" cy="32" r="4" fill="white" opacity="0.6" />
                    <circle cx="25" cy="40" r="3" fill="white" opacity="0.4" />
                    <circle cx="30" cy="58" r="3" fill="#ff6b35" opacity="0.5" />
                </g>

                {/* Right Wing */}
                <g
                    style={{
                        transform: `rotate(${rightWingRotation}deg)`,
                        transformOrigin: '50px 50px',
                        transition: 'transform 0.05s ease-out',
                    }}
                >
                    {/* Upper right wing */}
                    <ellipse
                        cx="70"
                        cy="35"
                        rx="18"
                        ry="25"
                        fill="url(#gradient1)"
                        stroke="#ff6b35"
                        strokeWidth="1"
                    />
                    {/* Lower right wing */}
                    <ellipse
                        cx="68"
                        cy="60"
                        rx="15"
                        ry="20"
                        fill="url(#gradient2)"
                        stroke="#ff8c42"
                        strokeWidth="1"
                    />
                    {/* Wing patterns - right */}
                    <circle cx="72" cy="32" r="4" fill="white" opacity="0.6" />
                    <circle cx="75" cy="40" r="3" fill="white" opacity="0.4" />
                    <circle cx="70" cy="58" r="3" fill="#ff6b35" opacity="0.5" />
                </g>

                {/* Body */}
                <ellipse
                    cx="50"
                    cy="50"
                    rx="3"
                    ry="20"
                    fill="#4a4a4a"
                    stroke="#2d2d2d"
                    strokeWidth="1"
                />
                
                {/* Head */}
                <circle
                    cx="50"
                    cy="32"
                    r="4"
                    fill="#3d3d3d"
                />
                
                {/* Antennae */}
                <path
                    d="M 48 30 Q 45 25 43 20"
                    stroke="#2d2d2d"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 52 30 Q 55 25 57 20"
                    stroke="#2d2d2d"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
                
                {/* Antenna tips */}
                <circle cx="43" cy="20" r="1.5" fill="#2d2d2d" />
                <circle cx="57" cy="20" r="1.5" fill="#2d2d2d" />

                {/* Gradients */}
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ff9a56', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#ff6b35', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ff4d1a', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ffb366', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#ff8c42', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ff6b35', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default FlyingButterfly;
