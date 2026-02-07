import React, { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { ID } from 'appwrite';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

interface BankDetail {
    $id: string;
    // Required fields
    accountNumber: string;
    bankName: string;
    currency: string;
    // Optional fields
    branchName?: string;
    accountType?: string;
    balance?: number;
    swiftCode?: string;
    isActive: boolean;
    $createdAt: string;
    $updatedAt: string;
}

const BankDetailsManagementPage: React.FC = () => {
    const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        currency: 'IDR',
        branchName: '',
        accountType: '',
        balance: 0,
        swiftCode: '',
        isActive: true,
    });

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.bankDetails
            );
            setBankDetails(response.documents as unknown as BankDetail[]);
        } catch (error) {
            console.error('Error fetching bank details:', error);
            alert('Failed to load bank details. The collection may not exist yet.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingId) {
                // Update existing
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.bankDetails,
                    editingId,
                    formData
                );
                alert('Bank details updated successfully!');
            } else {
                // Create new
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.bankDetails,
                    ID.unique(),
                    formData
                );
                alert('Bank details added successfully!');
            }
            
            // Reset form
            setFormData({
                bankName: '',
                accountNumber: '',
                currency: 'IDR',
                branchName: '',
                accountType: '',
                balance: 0,
                swiftCode: '',
                isActive: true,
            });
            setIsAdding(false);
            setEditingId(null);
            fetchBankDetails();
        } catch (error) {
            console.error('Error saving bank details:', error);
            alert('Failed to save bank details. Please ensure the collection exists in Appwrite.');
        }
    };

    const handleEdit = (bank: BankDetail) => {
        setFormData({
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            currency: bank.currency,
            branchName: bank.branchName || '',
            accountType: bank.accountType || '',
            balance: bank.balance || 0,
            swiftCode: bank.swiftCode || '',
            isActive: bank.isActive,
        });
        setEditingId(bank.$id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;
        
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.bankDetails, id);
            alert('Bank details deleted successfully!');
            fetchBankDetails();
        } catch (error) {
            console.error('Error deleting bank details:', error);
            alert('Failed to delete bank details.');
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.bankDetails,
                id,
                { isActive: !currentStatus }
            );
            fetchBankDetails();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Bank Account Management</h2>
                        <p className="text-gray-500 mt-1">Manage bank accounts for membership payments</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setEditingId(null);
                            setFormData({
                                bankName: '',
                                accountNumber: '',
                                currency: 'IDR',
                                branchName: '',
                                accountType: '',
                                balance: 0,
                                swiftCode: '',
                                isActive: true,
                            });
                        }}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {isAdding ? 'Cancel' : 'Add Bank Account'}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit Bank Account' : 'Add New Bank Account'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bank Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="e.g., Bank BCA, Bank Mandiri"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency *
                                </label>
                                <select
                                    required
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="IDR">IDR (Indonesian Rupiah)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                    <option value="SGD">SGD (Singapore Dollar)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder="e.g., 1234567890"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Branch Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.branchName}
                                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                                    placeholder="e.g., Jakarta Pusat"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Type (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.accountType}
                                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                    placeholder="e.g., Savings, Current, Business"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Balance (Optional)
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.balance === 0 ? '' : formData.balance.toString()}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        const numValue = value === '' ? 0 : parseFloat(value);
                                        if (!isNaN(numValue)) {
                                            setFormData({ ...formData, balance: numValue });
                                        }
                                    }}
                                    placeholder="e.g., 1000000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SWIFT Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.swiftCode}
                                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                                    placeholder="e.g., CENAIDJA"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active (Show to users)</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                {editingId ? 'Update Bank Account' : 'Add Bank Account'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                }}
                                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bank Accounts List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Active Bank Accounts</h3>
                
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <p className="text-gray-500 mt-2">Loading bank accounts...</p>
                    </div>
                ) : bankDetails.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <p className="text-gray-500">No bank accounts added yet</p>
                        <p className="text-gray-400 text-sm mt-1">Add your first bank account to start accepting payments</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bankDetails.map((bank) => (
                            <div
                                key={bank.$id}
                                className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h4 className="text-lg font-bold text-gray-900">{bank.bankName}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                bank.isActive 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {bank.isActive ? '✓ Active' : '✗ Inactive'}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Account Number:</span>
                                                <p className="font-mono font-bold text-orange-600 text-lg">{bank.accountNumber}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Currency:</span>
                                                <p className="font-semibold text-gray-900">{bank.currency}</p>
                                            </div>
                                            {bank.accountType && (
                                                <div>
                                                    <span className="text-gray-500">Account Type:</span>
                                                    <p className="font-semibold text-gray-900">{bank.accountType}</p>
                                                </div>
                                            )}
                                            {bank.balance !== undefined && bank.balance !== null && (
                                                <div>
                                                    <span className="text-gray-500">Balance:</span>
                                                    <p className="font-semibold text-gray-900">{bank.currency} {bank.balance.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {bank.branchName && (
                                                <div>
                                                    <span className="text-gray-500">Branch:</span>
                                                    <p className="font-semibold text-gray-900">{bank.branchName}</p>
                                                </div>
                                            )}
                                            {bank.swiftCode && (
                                                <div>
                                                    <span className="text-gray-500">SWIFT Code:</span>
                                                    <p className="font-semibold text-gray-900">{bank.swiftCode}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => toggleActive(bank.$id, bank.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                bank.isActive
                                                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                                            }`}
                                            title={bank.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {bank.isActive ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                )}
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(bank)}
                                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bank.$id)}
                                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
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

            {/* Setup Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mt-6">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Setup Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Create the <code className="bg-blue-100 px-2 py-0.5 rounded">bank_details</code> collection in Appwrite</li>
                    <li>Add attributes: bankName, accountName, accountNumber, branchName, swiftCode, isActive (boolean)</li>
                    <li>Add at least one active bank account for members to make payments</li>
                    <li>Members will see active bank accounts when purchasing membership packages</li>
                </ol>
            </div>
        </div>
    );
};

export default BankDetailsManagementPage;

