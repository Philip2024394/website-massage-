import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingCustomerServiceButtonProps {
    onClick: () => void;
}

const FloatingCustomerServiceButton: React.FC<FloatingCustomerServiceButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="
                fixed bottom-6 right-6 z-50 
                bg-black/20 backdrop-blur-md border border-white/10
                text-white rounded-2xl shadow-2xl
                transition-all duration-500 transform 
                hover:scale-110 hover:bg-black/40 hover:border-white/20
                active:scale-95 active:bg-black/60
                w-16 h-16 flex items-center justify-center
                group overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-br 
                before:from-white/5 before:to-transparent before:rounded-2xl
                after:absolute after:inset-0 after:bg-gradient-to-t 
                after:from-black/20 after:to-transparent after:rounded-2xl
            "
            style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
            }}
            aria-label="Open customer service chat"
            title="Chat with Customer Service"
        >
            <MessageCircle className="w-8 h-8 relative z-10 drop-shadow-lg animate-pulse group-hover:animate-none" />
            
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Notification pulse ring */}
            <div className="absolute inset-0 rounded-2xl bg-white/10 animate-ping opacity-20"></div>
            
            {/* Badge with glass effect */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500/90 backdrop-blur-sm border border-red-400/50 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-red-300/30 to-transparent rounded-full"></div>
                <span className="relative z-10 text-white drop-shadow-sm">CS</span>
            </div>
        </button>
    );
};

export default FloatingCustomerServiceButton;
