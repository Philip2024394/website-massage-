import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingCustomerServiceButtonProps {
    onClick: () => void;
}

const FloatingCustomerServiceButton: React.FC<FloatingCustomerServiceButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
            aria-label="Open customer service chat"
            title="Chat with Customer Service"
        >
            <MessageCircle className="w-8 h-8 animate-pulse group-hover:animate-none" />
            
            {/* Notification pulse ring */}
            <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20"></div>
            
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                CS
            </div>
        </button>
    );
};

export default FloatingCustomerServiceButton;
