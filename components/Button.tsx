
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = 'w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50';
    
    const variantClasses = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        outline: 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
