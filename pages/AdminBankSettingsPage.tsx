import React, { useState, useEffect } from 'react';
import { databases, ID } from '../lib/appwrite';
import { Query } from 'appwrite';

interface BankAccount {
    $id?: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
    isJointAccount: boolean;
    primaryHolderId: string;
    secondaryHolderId?: string;
    bankName: string;
    accountName: string;
    isActive: boolean;
    createdAt?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

interface AdminBankSettingsPageProps {
    onBack?: () => void;
    t?: any;
}

const AdminBankSettingsPage: React.FC<AdminBankSettingsPageProps> = ({ onBack: _onBack, t: _t }) => {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
    
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '',
        accountType: 'savings',
        currency: 'IDR',
        balance: 0,
        isJointAccount: false,
        primaryHolderId: 'admin',
        secondaryHolderId: '',
        isActive: true
    });

    const DATABASE_ID = 'indaStreetDB'; // Replace with your database ID
    const COLLECTION_ID = 'bankAccounts'; // Replace with your collection ID

    // Fetch all bank accounts
    const fetchBanks = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.orderDesc('createdAt')]
            );
            setBanks(response.documents as unknown as BankAccount[]);
        } catch (error) {
            console.error('Error fetching banks:', error);
            alert('Failed to load bank accounts. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingBank && editingBank.$id) {
                // Update existing bank
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    editingBank.$id,
                    {
                        bankName: formData.bankName,
                        accountNumber: formData.accountNumber,
                        accountName: formData.accountName,
                        accountType: formData.accountType,
                        currency: formData.currency,
                        balance: formData.balance,
                        isJointAccount: formData.isJointAccount,
                        primaryHolderId: formData.primaryHolderId,
                        secondaryHolderId: formData.secondaryHolderId || null,
                        isActive: formData.isActive
                    }
                );
                alert('Bank account updated successfully!');
            } else {
                // Create new bank
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    {
                        ...formData,
                        secondaryHolderId: formData.secondaryHolderId || null,
                        createdAt: new Date().toISOString()
                    }
                );
                alert('Bank account added successfully!');
            }
            
            // Reset form and refresh list
            setFormData({ 
                bankName: '', 
                accountNumber: '', 
                accountName: '', 
                accountType: 'savings',
                currency: 'IDR',
                balance: 0,
                isJointAccount: false,
                primaryHolderId: 'admin',
                secondaryHolderId: '',
                isActive: true 
            });
            setShowForm(false);
            setEditingBank(null);
            fetchBanks();
        } catch (error) {
            console.error('Error saving bank:', error);
            alert('Failed to save bank account. Please check console for details.');
        }
    };

    const handleEdit = (bank: BankAccount) => {
        setEditingBank(bank);
        setFormData({
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            accountName: bank.accountName,
            accountType: bank.accountType,
            currency: bank.currency,
            balance: bank.balance,
            isJointAccount: bank.isJointAccount,
            primaryHolderId: bank.primaryHolderId,
            secondaryHolderId: bank.secondaryHolderId || '',
            isActive: bank.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (bankId: string) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;
        
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, bankId);
            alert('Bank account deleted successfully!');
            fetchBanks();
        } catch (error) {
            console.error('Error deleting bank:', error);
            alert('Failed to delete bank account.');
        }
    };

    const toggleActive = async (bank: BankAccount) => {
        if (!bank.$id) return;
        
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                bank.$id,
                { isActive: !bank.isActive }
            );
            fetchBanks();
        } catch (error) {
            console.error('Error toggling bank status:', error);
            alert('Failed to update bank status.');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingBank(null);
        setFormData({ 
            bankName: '', 
            accountNumber: '', 
            accountName: '', 
            accountType: 'savings',
            currency: 'IDR',
            balance: 0,
            isJointAccount: false,
            primaryHolderId: 'admin',
            secondaryHolderId: '',
            isActive: true 
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Bank Account Settings</h1>
                            <p className="text-gray-600 mt-1">Manage payment bank accounts for job unlock purchases</p>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Add New Button */}
                {!showForm && (
                    <div className="mb-6">
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Bank Account
                        </button>
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Bank Name *</label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g., Bank Central Asia (BCA)"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Account Number *</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g., 1234567890"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Account Name *</label>
                                <input
                                    type="text"
                                    value={formData.accountName}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g., INDA STREET LTD"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                />
                                <label htmlFor="isActive" className="text-gray-700 font-semibold">
                                    Active (show on payment page)
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
                                >
                                    {editingBank ? 'Update Bank Account' : 'Add Bank Account'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Bank Accounts List */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">Bank Accounts ({banks.length})</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading bank accounts...</p>
                        </div>
                    ) : banks.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No bank accounts added yet</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-orange-600 hover:text-orange-700 font-semibold"
                            >
                                Add your first bank account
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {banks.map((bank) => (
                                <div key={bank.$id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{bank.bankName}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    bank.isActive 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {bank.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2 text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Account Number:</span>
                                                    <span className="font-mono text-lg">{bank.accountNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Account Name:</span>
                                                    <span>{bank.accountName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>Added:</span>
                                                    <span>{bank.$createdAt ? new Date(bank.$createdAt).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    }) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => toggleActive(bank)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                                    bank.isActive
                                                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                                                }`}
                                                title={bank.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {bank.isActive ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleEdit(bank)}
                                                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-all"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            
                                            <button
                                                onClick={() => bank.$id && handleDelete(bank.$id)}
                                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2">Important Information</h3>
                            <ul className="space-y-1 text-blue-800 text-sm">
                                <li>• Only <strong>active</strong> bank accounts will be shown on the payment page</li>
                                <li>• You can add multiple bank accounts for different payment options</li>
                                <li>• Users will be able to choose which bank to transfer to</li>
                                <li>• Make sure account details are accurate before activating</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBankSettingsPage;
