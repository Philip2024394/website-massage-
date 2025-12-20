
import React from 'react';

interface CustomCheckboxProps {
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

const CustomCheckbox = ({ label, checked, onChange, disabled = false }: CustomCheckboxProps): JSX.Element => (
    <label className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} group`}>
        <div className="relative">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked} 
                onChange={onChange}
                disabled={disabled}
            />
            <div className={`w-6 h-6 rounded-md transition-all duration-200 shadow-sm ${
                disabled 
                    ? 'border-2 border-gray-200 bg-gray-50' 
                    : checked 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-600 shadow-md' 
                        : 'bg-white border-2 border-gray-300 group-hover:border-green-400'
            }`}></div>
            <svg className={`absolute w-4 h-4 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                checked && !disabled ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <span className={`text-sm font-medium transition-colors ${disabled ? 'text-gray-400' : checked ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{label}</span>
    </label>
);

export default CustomCheckbox;
