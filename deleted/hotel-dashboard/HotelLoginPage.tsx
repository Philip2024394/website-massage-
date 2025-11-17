// Archived: HotelLoginPage.tsx (moved from pages/HotelLoginPage.tsx on 2025-11-17)
import React from 'react';

const HotelLoginPage: React.FC = () => {
    React.useEffect(() => {
        try {
            (window as any)?.appSetPage?.('villaLogin');
        } catch {}
    }, []);
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-2">Hotel Login Removed</h1>
                <p className="text-gray-600">Please use the Villa portal instead.</p>
            </div>
        </div>
    );
};

export default HotelLoginPage;
