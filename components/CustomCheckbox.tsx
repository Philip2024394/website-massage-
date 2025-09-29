
import React from 'react';

const CustomCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-brand-green peer-checked:border-brand-green transition-colors"></div>
            <svg className="absolute w-3 h-3 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4.5L4.33333 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
    </label>
);

export default CustomCheckbox;
