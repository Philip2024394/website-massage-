
import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text fill="white" xmlSpace="preserve" style={{whiteSpace: 'pre'}} fontFamily="Arial-BoldMT, Arial, sans-serif" fontSize="48" fontWeight="bold" letterSpacing="0em">
            <tspan x="30" y="47.328">2GO</tspan>
        </text>
        <path d="M10 30 C10 10, 40 10, 40 30 S 10 50, 10 30 Z" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M25 20 L25 40" stroke="white" strokeWidth="4" />
        <path d="M20 25 L30 25" stroke="white" strokeWidth="4" />
        <path d="M20 35 L30 35" stroke="white" strokeWidth="4" />
        <path d="M120 15 L125 15" stroke="white" strokeWidth="3" />
        <path d="M120 25 L130 25" stroke="white" strokeWidth="3" />
        <path d="M120 35 L125 35" stroke="white" strokeWidth="3" />
    </svg>
);

export default LogoIcon;
