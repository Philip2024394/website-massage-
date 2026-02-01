// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { useCityContext } from '../context/CityContext';

export const DiagnosticTest: React.FC = () => {
    const { hasSelectedCity, isLoading, city } = useCityContext();
    
    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-red-100 p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">🔧 Diagnostic Test Component</h1>
            <div className="bg-white p-4 rounded mb-4">
                <p><strong>hasSelectedCity:</strong> {String(hasSelectedCity)}</p>
                <p><strong>isLoading:</strong> {String(isLoading)}</p>
                <p><strong>city:</strong> {city || 'null'}</p>
            </div>
            <p className="text-sm text-gray-600">If you see this, React is rendering but CityGate is not working properly.</p>
        </div>
    );
};