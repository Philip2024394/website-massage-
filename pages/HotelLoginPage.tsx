import React from 'react';

// This page has been deprecated and removed. Redirect to villa login.
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
