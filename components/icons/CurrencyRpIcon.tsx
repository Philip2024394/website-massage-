import React from 'react';

const CurrencyRpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h5m2 5H8a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-3l-2 2z" />
    </svg>
);

export default CurrencyRpIcon;