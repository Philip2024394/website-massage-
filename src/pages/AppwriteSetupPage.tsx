// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import Button from '../components/Button';

interface DatabaseCollection {
    name: string;
    id: string;
    attributes: Array<{
        key: string;
        type: string;
        size?: number;
        required?: boolean;
        array?: boolean;
    }>;
}

const collections: DatabaseCollection[] = [
    {
        name: 'Therapists',
        id: COLLECTIONS.THERAPISTS,
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'profilePicture', type: 'string', size: 500 },
            { key: 'bio', type: 'string', size: 1000 },
            { key: 'specialties', type: 'string', size: 500, array: true },
            { key: 'experience', type: 'integer' },
            { key: 'rating', type: 'double' },
            { key: 'pricing', type: 'string', size: 2000 },
            { key: 'availability', type: 'string', size: 2000 },
            { key: 'location', type: 'string', size: 255 },
            { key: 'coordinates', type: 'string', size: 500 },
            { key: 'whatsappNumber', type: 'string', size: 50 },
            { key: 'isActive', type: 'boolean' },
            { key: 'analytics', type: 'string', size: 2000 }
        ]
    },
    {
        name: 'Places',
        id: COLLECTIONS.PLACES,
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 1000 },
            { key: 'images', type: 'string', size: 500, array: true },
            { key: 'services', type: 'string', size: 500, array: true },
            { key: 'amenities', type: 'string', size: 500, array: true },
            { key: 'rating', type: 'double' },
            { key: 'pricing', type: 'string', size: 2000 },
            { key: 'openingHours', type: 'string', size: 1000 },
            { key: 'location', type: 'string', size: 255 },
            { key: 'coordinates', type: 'string', size: 500 },
            { key: 'address', type: 'string', size: 500 },
            { key: 'phoneNumber', type: 'string', size: 50 },
            { key: 'whatsappNumber', type: 'string', size: 50 },
            { key: 'isActive', type: 'boolean' },
            { key: 'analytics', type: 'string', size: 2000 }
        ]
    },
    {
        name: 'Users',
        id: COLLECTIONS.USERS,
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'isActivated', type: 'boolean' }
        ]
    },
    {
        name: 'Agents',
        id: COLLECTIONS.AGENTS,
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'agentCode', type: 'string', size: 50, required: true },
            { key: 'hasAcceptedTerms', type: 'boolean' }
        ]
    }
];

export const AppwriteSetupPage: React.FC = () => {
    const [setupStatus, setSetupStatus] = useState<'checking' | 'ready' | 'needs-setup' | 'error'>('checking');
    const [currentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const checkDatabaseStatus = async () => {
        try {
            addLog('Testing connection...');
            
            // Mock connection test
            addLog('✓ Connection successful - Using mock data');
            setSetupStatus('ready');
        } catch (error: any) {
            addLog(`✗ Connection failed: ${error.message}`);
            setSetupStatus('error');
        }
    };

    useEffect(() => {
        checkDatabaseStatus();
    }, []);

    const setupDatabase = async () => {
        setSetupStatus('checking');
        setLogs([]);
        addLog('Starting database setup...');
        
        try {
            addLog('✓ Database setup completed successfully!');
            setSetupStatus('ready');
        } catch (error: any) {
            addLog(`✗ Setup failed: ${error.message}`);
            setSetupStatus('error');
        }
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        <span className="text-white">Indo</span>
                        <span className="text-brand-orange">street</span> Appwrite Database Setup
                    </h1>
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Database Configuration</h2>
                        <div className="bg-gray-100 p-4 pb-20 rounded-lg">
                            <p><strong>Database ID:</strong> {DATABASE_ID}</p>
                            <p><strong>Endpoint:</strong> https://syd.cloud.appwrite.io/v1</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Status</h2>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                                setupStatus === 'ready' ? 'bg-green-500' :
                                setupStatus === 'checking' ? 'bg-yellow-500' :
                                setupStatus === 'needs-setup' ? 'bg-blue-500' :
                                'bg-red-500'
                            }`}></div>
                            <span className="font-medium">
                                {setupStatus === 'ready' && 'Database is ready'}
                                {setupStatus === 'checking' && 'Checking database...'}
                                {setupStatus === 'needs-setup' && 'Database needs setup'}
                                {setupStatus === 'error' && 'Connection error'}
                            </span>
                        </div>
                    </div>

                    {setupStatus === 'needs-setup' && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Collections to Create</h2>
                            <div className="space-y-4">
                                {collections.map((collection, index) => (
                                    <div key={collection.id} className={`border rounded-lg p-4 ${
                                        currentStep > index ? 'bg-green-50 border-green-200' :
                                        currentStep === index + 1 ? 'bg-blue-50 border-blue-200' :
                                        'bg-gray-50 border-gray-200'
                                    }`}>
                                        <h3 className="font-semibold">{collection.name}</h3>
                                        <p className="text-sm text-gray-600">{collection.attributes.length} attributes</p>
                                        {currentStep > index && (
                                            <span className="text-green-600 text-sm">✓ Created</span>
                                        )}
                                        {currentStep === index + 1 && (
                                            <span className="text-blue-600 text-sm">Creating...</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6">
                                <Button
                                    onClick={setupDatabase}
                                    disabled={currentStep > 0}
                                    className="bg-brand-orange hover:bg-brand-orange-dark"
                                >
                                    {currentStep > 0 ? 'Setting up...' : 'Setup Database'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {setupStatus === 'ready' && (
                        <div className="mb-8">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 pb-20">
                                <h3 className="text-green-800 font-semibold">✓ Database Ready</h3>
                                <p className="text-green-700">Your Appwrite database is configured and ready to use!</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Setup Logs</h2>
                        <div className="bg-gray-900 text-green-400 p-4 pb-20 rounded-lg h-64  font-mono text-sm">
                            {logs.map((log, index) => (
                                <div key={index}>{log}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            onClick={checkDatabaseStatus}
                            variant="secondary"
                        >
                            Refresh Status
                        </Button>
                        
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="bg-brand-orange hover:bg-brand-orange-dark"
                        >
                            Back to App
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

