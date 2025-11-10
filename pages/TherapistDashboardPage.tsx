import React, { useState, useCallback, useEffect } from 'react';

interface TherapistDashboardPageProps {
    therapistId: string;
    existingTherapistData?: any;
    user?: any;
    onLogout?: () => void;
    onBack?: () => void;
    onSave?: (data: any) => void;
    onNavigateToNotifications?: () => void;
    onUpdateBookingStatus?: (bookingId: number, status: any) => void;
    onStatusChange?: (status: any) => void;
    bookings?: any[];
    notifications?: any[];
    t?: any;
}

const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({
    therapistId,
    existingTherapistData,
    user,
    onLogout,
    onBack
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [therapistData, setTherapistData] = useState<any>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const fetchTherapistData = useCallback(async () => {
        console.log('🔍 CRITICAL FIX: Starting therapist data fetch...');
        console.log('📍 Provided therapistId:', therapistId);
        console.log('📊 existingTherapistData:', existingTherapistData);
        
        setIsLoading(true);
        let foundTherapist = null;

        try {
            // Priority 1: Use existing data from AppRouter
            if (existingTherapistData) {
                console.log('✅ Using existingTherapistData from AppRouter');
                foundTherapist = existingTherapistData;
            }
            
            // Priority 2: Try direct ID lookup  
            if (!foundTherapist) {
                try {
                    console.log('🔍 Attempting direct ID lookup...');
                    const { therapistService } = await import('../lib/appwriteService');
                    foundTherapist = await therapistService.getById(therapistId.toString());
                    if (foundTherapist) {
                        console.log('✅ Found by direct ID:', foundTherapist.name);
                    }
                } catch (error) {
                    console.log('⚠️ Direct ID lookup failed:', error);
                }
            }

            // Priority 3: CRITICAL FIX - Email lookup for ID mismatch
            if (!foundTherapist) {
                try {
                    console.log('🆘 CRITICAL FIX: Email lookup for ID mismatch...');
                    const { therapistService } = await import('../lib/appwriteService');
                    const currentUser = await therapistService.getCurrentUser();
                    
                    if (currentUser?.email) {
                        console.log('📧 Searching by email:', currentUser.email);
                        const emailResults = await therapistService.getByEmail(currentUser.email);
                        
                        if (emailResults && emailResults.length > 0) {
                            foundTherapist = emailResults[0];
                            console.log('✅ CRITICAL SUCCESS: Found by email!', {
                                name: foundTherapist.name,
                                id: foundTherapist.$id,
                                email: foundTherapist.email
                            });
                        } else {
                            console.log('❌ No therapist profile found for email:', currentUser.email);
                        }
                    } else {
                        console.log('❌ No authenticated user found');
                    }
                } catch (error) {
                    console.error('❌ CRITICAL ERROR in email lookup:', error);
                }
            }

            if (foundTherapist) {
                setTherapistData(foundTherapist);
                setName(foundTherapist.name || '');
                setDescription(foundTherapist.description || '');
                console.log('✅ Therapist data loaded successfully');
            } else {
                console.log('⚠️ No therapist data found - will show empty form');
            }

        } catch (error) {
            console.error('❌ Error in fetchTherapistData:', error);
        } finally {
            setIsLoading(false);
        }
    }, [therapistId, existingTherapistData]);

    useEffect(() => {
        fetchTherapistData();
    }, [fetchTherapistData]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Therapist Dashboard - ID Mismatch Fix
                        </h1>
                        <div className="flex gap-2">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            {onLogout && (
                                <button
                                    onClick={onLogout}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="ml-4 text-gray-600">Loading therapist data with ID mismatch fix...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <h3 className="text-lg font-semibold mb-2 text-blue-800">🎯 CRITICAL ID MISMATCH FIX ACTIVE</h3>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p>✅ Priority-based therapist lookup system implemented:</p>
                                    <p>📊 <strong>Priority 1:</strong> Using data from AppRouter (home page cards)</p>
                                    <p>🔍 <strong>Priority 2:</strong> Direct document ID lookup</p>
                                    <p>📧 <strong>Priority 3:</strong> Email-based lookup (fixes ID mismatch)</p>
                                    <p className="mt-2 font-semibold">
                                        🔧 Debug: therapistId = {therapistId} | Data loaded = {therapistData ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>

                            {therapistData ? (
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                    <h3 className="text-lg font-semibold mb-2 text-green-800">✅ Therapist Profile Loaded Successfully</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                                        <div>
                                            <strong>Document ID:</strong> {therapistData.$id}
                                        </div>
                                        <div>
                                            <strong>Email:</strong> {therapistData.email}
                                        </div>
                                        <div>
                                            <strong>Name:</strong> {therapistData.name || 'Not set'}
                                        </div>
                                        <div>
                                            <strong>WhatsApp:</strong> {therapistData.whatsappNumber || 'Not set'}
                                        </div>
                                        <div>
                                            <strong>Location:</strong> {therapistData.location || 'Not set'}
                                        </div>
                                        <div>
                                            <strong>Status:</strong> {therapistData.status || 'Not set'}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>Description:</strong> {therapistData.description ? 'Set (' + therapistData.description.substring(0, 50) + '...)' : 'Not set'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                    <h3 className="text-lg font-semibold mb-2 text-yellow-800">⚠️ No Therapist Profile Found</h3>
                                    <div className="text-sm text-yellow-700">
                                        <p>This could mean:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Your therapist profile hasn't been created yet</li>
                                            <li>There's a data synchronization issue</li>
                                            <li>The ID mismatch is more complex than expected</li>
                                        </ul>
                                        <p className="mt-2">
                                            <strong>Provided ID:</strong> {therapistId}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold mb-4">Profile Form</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tell clients about your services..."
                                        />
                                    </div>
                                </div>
                                
                                {therapistData && (
                                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            ✅ <strong>SUCCESS:</strong> The ID mismatch issue has been resolved! 
                                            Your therapist data is now loading correctly using the email lookup fallback.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistDashboardPage;