import React from 'react';

interface LoginBurgerIconProps {
    className?: string;
    onClick?: () => void;
}

const LoginBurgerIcon: React.FC<LoginBurgerIconProps> = ({ className = '', onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg hover:bg-brand-orange hover:bg-opacity-10 transition-colors ${className}`}
            aria-label="Open login menu"
        >
            <svg 
                className="w-6 h-6 text-brand-orange" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                />
            </svg>
        </button>
    );
};

export default LoginBurgerIcon;