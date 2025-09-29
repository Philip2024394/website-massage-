
import React from 'react';

interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    labelOn: string;
    labelOff: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, labelOn, labelOff }) => {
    return (
        <label htmlFor={id} className="flex items-center cursor-pointer">
            <div className="relative">
                <input
                    id={id}
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`block ${checked ? 'bg-brand-green' : 'bg-gray-300'} w-14 h-8 rounded-full transition`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium text-sm">
                {checked ? labelOn : labelOff}
            </div>
        </label>
    );
};

export default ToggleSwitch;
