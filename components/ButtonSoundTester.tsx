import React from 'react';
import { useButtonSounds } from '../hooks/useButtonSounds';
import SoundButton from './SoundButton';

const ButtonSoundTester: React.FC = () => {
    const {
        playToggle,
        testSound,
        setEnabled,
        isEnabled
    } = useButtonSounds();

    const directSoundTests = [
        {
            label: 'Click Sound',
            action: () => testSound('click'),
            description: 'Standard button click - subtle and professional',
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            label: 'Hover Sound',
            action: () => testSound('hover'),
            description: 'Mouse hover feedback - very subtle',
            color: 'bg-gray-500 hover:bg-gray-600'
        },
        {
            label: 'Success Sound',
            action: () => testSound('success'),
            description: 'Positive actions - confirmations, saves',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            label: 'Error/Delete Sound',
            action: () => testSound('error'),
            description: 'Negative actions - errors, deletions',
            color: 'bg-red-500 hover:bg-red-600'
        },
        {
            label: 'Navigation Sound',
            action: () => testSound('navigation'),
            description: 'Menu items, tabs, navigation',
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            label: 'Toggle ON',
            action: () => playToggle(true),
            description: 'Switch/checkbox turned ON',
            color: 'bg-green-600 hover:bg-green-700'
        },
        {
            label: 'Toggle OFF',
            action: () => playToggle(false),
            description: 'Switch/checkbox turned OFF',
            color: 'bg-red-600 hover:bg-red-700'
        },
        {
            label: 'Submit Sound',
            action: () => testSound('submit'),
            description: 'Form submissions, confirmations',
            color: 'bg-blue-600 hover:bg-blue-700'
        }
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                🔊 Button Sound System - Industry Standards
            </h2>
            
            {/* Sound System Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-gray-700 font-medium">
                            Button Sounds: {isEnabled ? '✅ Enabled' : '❌ Disabled'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                            Industry-standard UI feedback sounds for better user experience
                        </p>
                    </div>
                    <button
                        onClick={() => setEnabled(!isEnabled)}
                        className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                            isEnabled 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {isEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>

            {/* Direct Sound Tests */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    🎵 Individual Button Sound Tests
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {directSoundTests.map((test, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <button
                                onClick={test.action}
                                className={`${test.color} text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium w-full mb-2`}
                            >
                                {test.label}
                            </button>
                            <p className="text-xs text-gray-600">{test.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Button Components */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    🎭 Enhanced Button Components with Sounds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SoundButton 
                        variant="primary" 
                        soundType="click"
                        enableHoverSound={true}
                    >
                        Primary Button
                    </SoundButton>

                    <SoundButton 
                        variant="success" 
                        soundType="success"
                        enableHoverSound={true}
                    >
                        Success Action
                    </SoundButton>

                    <SoundButton 
                        variant="danger" 
                        soundType="delete"
                        enableHoverSound={true}
                    >
                        Delete Item
                    </SoundButton>

                    <SoundButton 
                        variant="secondary" 
                        soundType="navigation"
                        enableHoverSound={true}
                    >
                        Navigation
                    </SoundButton>

                    <SoundButton 
                        variant="warning" 
                        soundType="submit"
                        enableHoverSound={true}
                        size="lg"
                    >
                        Submit Form
                    </SoundButton>

                    <SoundButton 
                        variant="primary" 
                        soundType="toggle"
                        enableHoverSound={true}
                        size="sm"
                    >
                        Toggle Setting
                    </SoundButton>
                </div>
            </div>

            {/* Sound Design Principles */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🎨 Sound Design Principles:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• <strong>Subtle Volume:</strong> 0.1-0.3 volume level to avoid annoyance</li>
                    <li>• <strong>Short Duration:</strong> 50-250ms for quick feedback</li>
                    <li>• <strong>Debouncing:</strong> Prevents rapid-fire sound spam</li>
                    <li>• <strong>Context-Aware:</strong> Different sounds for different action types</li>
                    <li>• <strong>Frequency Variation:</strong> Higher pitch for positive, lower for negative</li>
                    <li>• <strong>User Control:</strong> Can be disabled in preferences</li>
                </ul>
            </div>

            {/* Technical Details */}
            <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">⚙️ Technical Implementation:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                        <strong>Primary Sounds (MP3):</strong>
                        <ul className="mt-1 space-y-1">
                            <li>✅ message-notification.mp3 → Click/Hover/Navigation</li>
                            <li>✅ success-notification.mp3 → Success/Submit</li>
                            <li>✅ alert-notification.mp3 → Error/Delete</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Fallback Sounds (Generated):</strong>
                        <ul className="mt-1 space-y-1">
                            <li>🔊 Programmatic click sounds (800Hz, 100ms)</li>
                            <li>🔊 Hover sounds (1000Hz, 50ms)</li>
                            <li>🔊 Toggle sounds (ascending/descending tones)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ButtonSoundTester;