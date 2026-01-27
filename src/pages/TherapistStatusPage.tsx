import React, { useState, useEffect } from 'react';
import type { Therapist } from '../types';
import { AvailabilityStatus } from '../types';
import { therapistService } from '../lib/appwriteService';
import { showToast } from '../utils/showToastPortal';

interface TherapistStatusPageProps {
    therapist: Therapist | null;
    onStatusChange: (status: AvailabilityStatus) => void;
    onNavigateToDashboard: () => void;
    onNavigateToHome?: () => void;
    onLogout?: () => Promise<void>;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const TherapistStatusPage: React.FC<TherapistStatusPageProps> = ({ therapist, onStatusChange, onNavigateToDashboard, onNavigateToHome, onLogout, t: _t }) => {
    const [currentStatus, setCurrentStatus] = useState<AvailabilityStatus>(therapist?.status || AvailabilityStatus.Offline);
    const [discountPercent, setDiscountPercent] = useState<number | null>(therapist?.discountPercentage || null);
    const [discountHours, setDiscountHours] = useState<number | null>(therapist?.discountDuration || null);
    const [savingDiscount, setSavingDiscount] = useState(false);
    const [busyMinutes, setBusyMinutes] = useState<number>(120); // default 120 (legacy)
    const [busyCountdown, setBusyCountdown] = useState<string | null>(null);
    const [discountCountdown, setDiscountCountdown] = useState<string | null>(null);

    // Update countdown every 30s if busy
    useEffect(() => {
        const compute = () => {
            if (!therapist || therapist.status !== AvailabilityStatus.Busy || !therapist.busyUntil) { setBusyCountdown(null); return; }
            const end = new Date(therapist.busyUntil).getTime();
            const now = Date.now();
            const diff = end - now;
            if (diff <= 0) { setBusyCountdown('00m'); return; }
            const mins = Math.ceil(diff / 60000);
            const hours = Math.floor(mins / 60);
            const remMins = mins % 60;
            setBusyCountdown(hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`);
        };
        compute();
        const id = setInterval(compute, 30000);
        return () => clearInterval(id);
    }, [therapist]);

    // Discount countdown
    useEffect(() => {
        const tick = () => {
            if (!therapist?.isDiscountActive || !therapist.discountEndTime) { setDiscountCountdown(null); return; }
            const endTs = new Date(therapist.discountEndTime).getTime();
            const now = Date.now();
            const diff = endTs - now;
            if (diff <= 0) { setDiscountCountdown('expired'); return; }
            const mins = Math.ceil(diff / 60000);
            const hours = Math.floor(mins / 60);
            const remMins = mins % 60;
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;
            if (days > 0) {
                setDiscountCountdown(`${days}d ${remHours}h`);
            } else if (hours > 0) {
                setDiscountCountdown(`${hours}h ${remMins}m`);
            } else {
                setDiscountCountdown(`${remMins}m`);
            }
        };
        tick();
        const id = setInterval(tick, 60000); // update every minute
        return () => clearInterval(id);
    }, [therapist?.isDiscountActive, therapist?.discountEndTime]);

    useEffect(() => {
        if (therapist) {
            setCurrentStatus(therapist.status);
        }
    }, [therapist]);

    const handleStatusChange = async (status: AvailabilityStatus) => {
        setCurrentStatus(status);
        try {
            // Update both status and availability fields
            const update: any = { 
                status: status.toLowerCase(),
                availability: status  // Use proper case for availability enum
            };
            if (status === AvailabilityStatus.Busy) {
                const duration = busyMinutes || 120;
                const bookedUntil = new Date(Date.now() + duration * 60 * 1000).toISOString();
                update.bookedUntil = bookedUntil;
                update.busyDuration = duration;
                update.busy = bookedUntil;
                update.available = '';
            } else if (status === AvailabilityStatus.Available) {
                update.available = new Date().toISOString();
                update.busy = '';
                update.bookedUntil = null;
                update.busyDuration = null;
            } else {
                // Offline
                update.available = '';
                update.busy = '';
                update.bookedUntil = null;
                update.busyDuration = null;
            }
            if (therapist) {
                const resp = await therapistService.update(String((therapist as any).$id || therapist.id), update);
                console.log('✅ Status updated (status page):', resp.status, resp.availability);
                showToast(`Status set: ${status}`, 'success');
                
                // 🔄 Trigger data refresh for HomePage and ChatWindow
                console.log('🔄 Triggering data refresh after status change...');
                window.dispatchEvent(new CustomEvent('refreshData', {
                    detail: { 
                        source: 'therapist-status-update',
                        therapistId: therapist.id,
                        newStatus: status
                    }
                }));
            }
        } catch (e) {
            console.error('❌ Failed status update from status page', e);
            showToast('Status update failed', 'error');
        }
        onStatusChange(status);
    };

    const applyDiscount = async () => {
        if (!therapist || discountPercent == null || discountHours == null) return;
        setSavingDiscount(true);
        try {
            const endTime = new Date(Date.now() + discountHours * 60 * 60 * 1000).toISOString();
            const resp = await therapistService.update(String((therapist as any).$id || therapist.id), {
                discountPercentage: discountPercent,
                discountDuration: discountHours,
                discountEndTime: endTime,
                isDiscountActive: true
            });
            console.log('✅ Discount applied (status page):', resp.discountPercentage, resp.discountEndTime);
            showToast('Discount applied', 'success');
        } catch (e) {
            console.error('❌ Failed to apply discount (status page)', e);
            showToast('Discount failed', 'error');
        } finally {
            setSavingDiscount(false);
        }
    };

    const clearDiscount = async () => {
        if (!therapist) return;
        setSavingDiscount(true);
        try {
            await therapistService.update(String((therapist as any).$id || therapist.id), {
                discountPercentage: 0,
                discountDuration: 0,
                discountEndTime: null,
                isDiscountActive: false
            });
            setDiscountPercent(null);
            setDiscountHours(null);
            showToast('Discount cleared', 'success');
        } catch (e) {
            console.error('❌ Failed clearing discount (status page)', e);
            showToast('Clear failed', 'error');
        } finally {
            setSavingDiscount(false);
        }
    };

    const statusConfig = {
        [AvailabilityStatus.Available]: {
            bg: 'bg-green-500',
            hoverBg: 'hover:bg-green-600',
            text: 'text-white',
            label: 'Available',
            icon: '🛏️',
            description: 'Ready to accept bookings'
        },
        [AvailabilityStatus.Busy]: {
            bg: 'bg-yellow-500',
            hoverBg: 'hover:bg-yellow-600',
            text: 'text-white',
            label: 'Busy',
            icon: '⏳',
            description: 'Currently with a client'
        },
        [AvailabilityStatus.Offline]: {
            bg: 'bg-red-500',
            hoverBg: 'hover:bg-red-600',
            text: 'text-white',
            label: 'Offline',
            icon: '☕',
            description: 'Not accepting bookings'
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <div className="w-full bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">I</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Status Dashboard</h1>
                            <p className="text-xs text-gray-500">Manage your availability & promotions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onNavigateToDashboard} className="text-xs px-3 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium">
                            Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex items-center justify-center p-4 py-8">
                <div className="w-full max-w-4xl space-y-6">
                    {/* Online Status Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                            <h2 className="text-white text-lg font-bold">🟢 Online Status</h2>
                            <p className="text-green-100 text-sm">Set your availability for customers</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Status Buttons - 3 Square Buttons */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Available */}
                                <button
                                    onClick={() => handleStatusChange(AvailabilityStatus.Available)}
                                    className={`relative aspect-square rounded-2xl border-4 transition-all transform hover:scale-105 ${
                                        currentStatus === AvailabilityStatus.Available
                                            ? 'bg-green-500 border-green-600 shadow-lg'
                                            : 'bg-white border-gray-300 hover:border-green-400'
                                    }`}
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                        <div className={`text-5xl mb-2 ${currentStatus === AvailabilityStatus.Available ? 'animate-bounce' : ''}`}>
                                            ✅
                                        </div>
                                        <div className={`text-lg font-bold ${currentStatus === AvailabilityStatus.Available ? 'text-white' : 'text-gray-700'}`}>
                                            Available
                                        </div>
                                        <div className={`text-xs mt-1 ${currentStatus === AvailabilityStatus.Available ? 'text-green-100' : 'text-gray-500'}`}>
                                            Ready for bookings
                                        </div>
                                    </div>
                                    {currentStatus === AvailabilityStatus.Available && (
                                        <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </button>

                                {/* Busy */}
                                <button
                                    onClick={() => handleStatusChange(AvailabilityStatus.Busy)}
                                    className={`relative aspect-square rounded-2xl border-4 transition-all transform hover:scale-105 ${
                                        currentStatus === AvailabilityStatus.Busy
                                            ? 'bg-yellow-500 border-yellow-600 shadow-lg'
                                            : 'bg-white border-gray-300 hover:border-yellow-400'
                                    }`}
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                        <div className="text-5xl mb-2">⏳</div>
                                        <div className={`text-lg font-bold ${currentStatus === AvailabilityStatus.Busy ? 'text-white' : 'text-gray-700'}`}>
                                            Busy
                                        </div>
                                        <div className={`text-xs mt-1 ${currentStatus === AvailabilityStatus.Busy ? 'text-yellow-100' : 'text-gray-500'}`}>
                                            With a client
                                        </div>
                                    </div>
                                    {currentStatus === AvailabilityStatus.Busy && busyCountdown && (
                                        <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded px-2 py-1 text-xs font-semibold text-yellow-700 text-center">
                                            {busyCountdown}
                                        </div>
                                    )}
                                </button>

                                {/* Offline */}
                                <button
                                    onClick={() => handleStatusChange(AvailabilityStatus.Offline)}
                                    className={`relative aspect-square rounded-2xl border-4 transition-all transform hover:scale-105 ${
                                        currentStatus === AvailabilityStatus.Offline
                                            ? 'bg-red-500 border-red-600 shadow-lg'
                                            : 'bg-white border-gray-300 hover:border-red-400'
                                    }`}
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                        <div className="text-5xl mb-2">🔴</div>
                                        <div className={`text-lg font-bold ${currentStatus === AvailabilityStatus.Offline ? 'text-white' : 'text-gray-700'}`}>
                                            Offline
                                        </div>
                                        <div className={`text-xs mt-1 ${currentStatus === AvailabilityStatus.Offline ? 'text-red-100' : 'text-gray-500'}`}>
                                            Not available
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Current Status Display */}
                            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            currentStatus === AvailabilityStatus.Available ? 'bg-green-500 animate-pulse' :
                                            currentStatus === AvailabilityStatus.Busy ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}></div>
                                        <span className="text-sm font-semibold text-gray-700">Current Status:</span>
                                        <span className={`text-sm font-bold ${
                                            currentStatus === AvailabilityStatus.Available ? 'text-green-600' :
                                            currentStatus === AvailabilityStatus.Busy ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {statusConfig[currentStatus].label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discount Badge Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                            <h2 className="text-white text-lg font-bold">🎯 Discount Badge</h2>
                            <p className="text-orange-100 text-sm">Add a promotion badge to your profile card</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Discount Percentage - 4 Large Buttons */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Discount Percentage:</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[10, 15, 20, 30].map(percent => (
                                        <button
                                            key={percent}
                                            onClick={() => setDiscountPercent(percent)}
                                            className={`aspect-square rounded-xl border-3 transition-all transform hover:scale-105 ${
                                                discountPercent === percent
                                                    ? 'bg-orange-500 border-orange-600 text-white shadow-lg'
                                                    : 'bg-white border-gray-300 hover:border-orange-400 text-gray-700'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <div className={`text-3xl font-bold ${discountPercent === percent ? 'text-white' : 'text-orange-600'}`}>
                                                    {percent}%
                                                </div>
                                                <div className={`text-xs mt-1 ${discountPercent === percent ? 'text-orange-100' : 'text-gray-500'}`}>
                                                    OFF
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration - 3 Buttons */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Duration:</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[4, 8, 12].map(hours => (
                                        <button
                                            key={hours}
                                            onClick={() => setDiscountHours(hours)}
                                            className={`py-4 rounded-xl border-3 transition-all transform hover:scale-105 ${
                                                discountHours === hours
                                                    ? 'bg-amber-500 border-amber-600 text-white shadow-lg'
                                                    : 'bg-white border-gray-300 hover:border-amber-400 text-gray-700'
                                            }`}
                                        >
                                            <div className={`text-2xl font-bold ${discountHours === hours ? 'text-white' : 'text-amber-600'}`}>
                                                {hours}h
                                            </div>
                                            <div className={`text-xs mt-1 ${discountHours === hours ? 'text-amber-100' : 'text-gray-500'}`}>
                                                {hours} hours
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Current Discount Status */}
                            {therapist?.isDiscountActive && (
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-semibold text-orange-900">Active Discount: </span>
                                            <span className="text-lg font-bold text-orange-600">{therapist.discountPercentage}% OFF</span>
                                        </div>
                                        {discountCountdown && discountCountdown !== 'expired' && (
                                            <div className="text-sm text-orange-700">
                                                Ends in: <span className="font-bold">{discountCountdown}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    disabled={savingDiscount || discountPercent == null || discountHours == null}
                                    onClick={applyDiscount}
                                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-lg hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                                >
                                    {savingDiscount ? '⏳ Activating...' : '🚀 Activate Discount'}
                                </button>
                                <button
                                    disabled={savingDiscount || !therapist?.isDiscountActive}
                                    onClick={clearDiscount}
                                    className="px-6 py-4 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Clear
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                                <p className="font-semibold mb-2">💡 How it works:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Select discount percentage (10-30%)</li>
                                    <li>• Choose how long it runs (4-12 hours)</li>
                                    <li>• Click "Activate Discount" to publish</li>
                                    <li>• Badge appears instantly on your profile card</li>
                                    <li>• Discount ends automatically after time expires</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TherapistStatusPage;

