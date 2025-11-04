
import React from 'react';

interface CustomCheckboxProps {
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange, disabled = false }) => (
    <label className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <div className="relative">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked} 
                onChange={onChange}
                disabled={disabled}
            />
            <div className={`w-5 h-5 bg-white border-2 rounded transition-colors ${
                disabled 
                    ? 'border-gray-200 bg-gray-50' 
                    : checked 
                        ? 'bg-brand-green border-brand-green' 
                        : 'border-gray-300 peer-checked:bg-brand-green peer-checked:border-brand-green'
            }`}></div>
            <svg className={`absolute w-3 h-3 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ${
                checked && !disabled ? 'opacity-100' : 'opacity-0'
            }`} viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4.5L4.33333 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{label}</span>
    </label>
);

export default CustomCheckbox;
