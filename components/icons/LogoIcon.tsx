
import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 9C8 7.34315 6.65685 6 5 6C3.34315 6 2 7.34315 2 9C2 10.6569 3.34315 12 5 12C6.65685 12 8 10.6569 8 9Z" />
        <path d="M13 14H3C2.44772 14 2 14.4477 2 15V16C2 16.5523 2.44772 17 3 17H21C21.5523 17 22 16.5523 22 16V15C22 14.4477 21.5523 14 21 14H18.2634C18.6853 13.4146 18.9996 12.7381 18.9996 12C18.9996 9.79086 17.2087 8 14.9996 8C13.5229 8 12.2346 8.84631 11.5352 10.0518L10.5 12L11 14H13Z" />
        <circle cx="14.5" cy="11.5" r="1.5" />
        <circle cx="11.5" cy="11.5" r="1.5" />
    </svg>
);

export default LogoIcon;
