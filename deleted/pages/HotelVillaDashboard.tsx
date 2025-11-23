import React, { useState, useEffect, useCallback } from 'react';
import { coinService } from '../lib/appwriteService';
import CommissionConfirmation from '../components/CommissionConfirmation';

interface PendingCommission {
    bookingId: string;
    therapistId: string;
    therapistName: string;
    commissionAmount: number;
    serviceDate: string;
    customerName: string;
}

interface HotelVillaDashboardProps {
    hotelVillaId: string;
    hotelVillaType: 'hotel' | 'villa';
    hotelVillaName: string;
    userId: string;
}

const HotelVillaDashboard: React.FC<HotelVillaDashboardProps> = ({
    hotelVillaId,
    hotelVillaType,
    hotelVillaName,
    userId
}) => {
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([]);
    const [loading, setLoading] = useState(true);
    const [coinBalance, setCoinBalance] = useState(0);

    const loadPendingCommissions = useCallback(async () => {
        try {
            // This would need to be implemented in appwriteService
            // For now, using mock data
            const mockCommissions: PendingCommission[] = [
                {
                    bookingId: 'book_001',
                    therapistId: 'ther_001',
                    therapistName: 'Sarah Johnson',
                    commissionAmount: 25,
                    serviceDate: '2024-01-15',
                    customerName: 'John Doe'
                },
                {
                    bookingId: 'book_002',
                    therapistId: 'ther_002',
                    therapistName: 'Mike Chen',
                    commissionAmount: 30,
                    serviceDate: '2024-01-16',
                    customerName: 'Jane Smith'
                }
            ];
            setPendingCommissions(mockCommissions);
        } catch (error) {
            console.error('Failed to load pending commissions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCoinBalance = useCallback(async () => {
        try {
            const userCoins = await coinService.getUserCoins(userId);
            setCoinBalance(userCoins?.totalCoins || 0);
        } catch (error) {
            console.error('Failed to load coin balance:', error);
        }
    }, [userId]);

    useEffect(() => {
        loadPendingCommissions();
        loadCoinBalance();
    }, [loadPendingCommissions, loadCoinBalance]);

    const handleConfirmationComplete = (success: boolean, message: string, bookingId: string) => {
        if (success) {
            // Remove confirmed commission from list
            setPendingCommissions(prev => prev.filter(c => c.bookingId !== bookingId));
            // Reload coin balance
            loadCoinBalance();
            // Show success message
            alert('Commission confirmed successfully! +5 coins earned');
        } else {
            alert(`Error: ${message}`);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {hotelVillaType === 'hotel' ? '🏨' : '🏖️'} {hotelVillaName} Dashboard
                </h1>
                <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
                        <span className="text-yellow-700 font-bold">🪙 {coinBalance} Coins</span>
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2">
                        <span className="text-blue-700 font-bold">
                            📋 {pendingCommissions.length} Pending Confirmations
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        📋 Pending Commission Confirmations
                    </h2>
                    
                    {pendingCommissions.length === 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <span className="text-green-500 text-3xl">✅</span>
                            <h3 className="font-bold text-green-800 mt-2">All caught up!</h3>
                            <p className="text-green-600">No pending commission confirmations.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingCommissions.map((commission) => (
                                <div key={commission.bookingId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-gray-800">
                                            Booking #{commission.bookingId}
                                        </h3>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <div><strong>Date:</strong> {commission.serviceDate}</div>
                                            <div><strong>Customer:</strong> {commission.customerName}</div>
                                        </div>
                                    </div>
                                    
                                    <CommissionConfirmation
                                        bookingId={commission.bookingId}
                                        hotelVillaId={hotelVillaId}
                                        hotelVillaType={hotelVillaType}
                                        hotelVillaName={hotelVillaName}
                                        therapistId={commission.therapistId}
                                        therapistName={commission.therapistName}
                                        commissionAmount={commission.commissionAmount}
                                        confirmedBy={userId}
                                        onConfirmationComplete={(success, message) => 
                                            handleConfirmationComplete(success, message, commission.bookingId)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">📊 Commission Management Guide</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                        <div><strong>1. Service Completion:</strong> Customer completes massage service</div>
                        <div><strong>2. Commission Collection:</strong> Therapist pays you the agreed commission</div>
                        <div><strong>3. Payment Confirmation:</strong> You confirm payment received here</div>
                        <div><strong>4. Therapist Released:</strong> Therapist becomes available for new bookings</div>
                        <div><strong>5. Reward Earned:</strong> You earn 5 coins for each confirmation</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelVillaDashboard;
