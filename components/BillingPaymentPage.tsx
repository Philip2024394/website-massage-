import { useState, useEffect } from 'react';
import { leadBillingService } from '../lib/appwriteService';

interface BillingPageProps {
    providerId: string;
    providerType: 'therapist' | 'place' | 'facial-place';
    providerName: string;
}

interface LeadBilling {
    $id: string;
    month: string;
    year: number;
    totalLeads: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: 'pending' | 'partial' | 'paid';
    dueDate: string;
    leads: Array<{
        $id: string;
        customerName: string;
        customerWhatsApp: string;
        leadCost: number;
        acceptedDate: string;
        bookingDetails?: any;
    }>;
}

/**
 * BillingPaymentPage
 * 
 * Shows provider what they owe for accepted leads
 * - Monthly billing summary
 * - Individual lead breakdown
 * - Payment due dates
 * - Payment status tracking
 */
export default function BillingPaymentPage({
    providerId,
    providerType,
    providerName
}: BillingPageProps) {
    const [currentBilling, setCurrentBilling] = useState<LeadBilling | null>(null);
    const [previousBillings, setPreviousBillings] = useState<LeadBilling[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    useEffect(() => {
        loadBillingData();
    }, [providerId]);

    const loadBillingData = async () => {
        try {
            setLoading(true);

            // Get current month billing
            const now = new Date();
            const currentMonth = now.toLocaleString('default', { month: 'long' });
            const currentYear = now.getFullYear();

            const current = await leadBillingService.getMonthlyBilling(
                providerId,
                providerType,
                currentMonth,
                currentYear
            );
            setCurrentBilling(current);

            // Get previous 6 months
            const previous = await leadBillingService.getBillingHistory(
                providerId,
                providerType,
                6
            );
            setPreviousBillings(previous);

            setLoading(false);
        } catch (error) {
            console.error('Error loading billing:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            case 'pending': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return '✅';
            case 'partial': return '⏳';
            case 'pending': return '⚠️';
            default: return '❓';
        }
    };

    const getDaysUntilDue = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading billing information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Billing & Payments</h1>
                <p className="text-gray-600">Track your lead costs and payment status</p>
            </div>

            {/* Current Month Summary */}
            {currentBilling && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {currentBilling.month} {currentBilling.year}
                            </h2>
                            <p className="text-indigo-200">Current month billing</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${getStatusColor(currentBilling.status)} font-semibold`}>
                            {getStatusIcon(currentBilling.status)} {currentBilling.status.toUpperCase()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <p className="text-indigo-200 text-sm mb-1">Total Leads</p>
                            <p className="text-3xl font-bold">{currentBilling.totalLeads}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <p className="text-indigo-200 text-sm mb-1">Total Amount</p>
                            <p className="text-3xl font-bold">{formatCurrency(currentBilling.totalAmount)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <p className="text-indigo-200 text-sm mb-1">Paid</p>
                            <p className="text-3xl font-bold text-green-300">{formatCurrency(currentBilling.paidAmount)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <p className="text-indigo-200 text-sm mb-1">Pending</p>
                            <p className="text-3xl font-bold text-red-300">{formatCurrency(currentBilling.pendingAmount)}</p>
                        </div>
                    </div>

                    {currentBilling.pendingAmount > 0 && (
                        <div className="mt-6 bg-white/20 backdrop-blur rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-200 mb-1">Payment Due Date</p>
                                <p className="text-xl font-bold">{formatDate(currentBilling.dueDate)}</p>
                                <p className="text-sm text-indigo-200 mt-1">
                                    {getDaysUntilDue(currentBilling.dueDate) > 0 
                                        ? `${getDaysUntilDue(currentBilling.dueDate)} days remaining`
                                        : `⚠️ OVERDUE by ${Math.abs(getDaysUntilDue(currentBilling.dueDate))} days`
                                    }
                                </p>
                            </div>
                            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                                Pay Now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Current Month Leads Breakdown */}
            {currentBilling && currentBilling.leads.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">📋 Current Month Leads</h3>
                        <p className="text-sm text-gray-600">Detailed breakdown of accepted leads</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        WhatsApp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Accepted Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lead Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentBilling.leads.map(lead => (
                                    <tr key={lead.$id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{lead.customerName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={`https://wa.me/${lead.customerWhatsApp.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                {lead.customerWhatsApp}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(lead.acceptedDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(lead.leadCost)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-lg font-bold text-indigo-600">
                                            {formatCurrency(currentBilling.totalAmount)}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Previous Months */}
            {previousBillings.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">📅 Billing History</h3>
                        <p className="text-sm text-gray-600">Previous months' billing records</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {previousBillings.map(billing => (
                            <div
                                key={billing.$id}
                                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => setSelectedMonth(billing.$id === selectedMonth ? null : billing.$id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {billing.month} {billing.year}
                                            </h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(billing.status)}`}>
                                                {getStatusIcon(billing.status)} {billing.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Leads:</span>
                                                <span className="ml-2 font-semibold text-gray-900">{billing.totalLeads}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total:</span>
                                                <span className="ml-2 font-semibold text-gray-900">{formatCurrency(billing.totalAmount)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Pending:</span>
                                                <span className="ml-2 font-semibold text-red-600">{formatCurrency(billing.pendingAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 text-gray-400 transition-transform ${selectedMonth === billing.$id ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {/* Expanded Details */}
                                {selectedMonth === billing.$id && billing.leads.length > 0 && (
                                    <div className="mt-4 pl-4 border-l-2 border-indigo-200">
                                        <div className="space-y-2">
                                            {billing.leads.map(lead => (
                                                <div key={lead.$id} className="flex items-center justify-between py-2 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{lead.customerName}</span>
                                                        <span className="ml-3 text-gray-500">{formatDate(lead.acceptedDate)}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(lead.leadCost)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Billing Data */}
            {!currentBilling && previousBillings.length === 0 && (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No billing records yet</h3>
                    <p className="text-gray-600 mb-6">
                        Start accepting leads to see your billing information here.
                    </p>
                    <p className="text-sm text-gray-500">
                        💡 Each accepted lead costs Rp 50,000 - 100,000 depending on your membership level
                    </p>
                </div>
            )}
        </div>
    );
}
