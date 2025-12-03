import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Trash2, Edit, Plus, AlertCircle, Check, X } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  accountType: 'checking' | 'savings';
  isDefault: boolean;
  isVerified: boolean;
  dateAdded: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  dateAdded: string;
}

const AdminBankSettingsPage: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    accountType: 'checking' as 'checking' | 'savings'
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: ''
  });

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      // Mock data - in real app, fetch from API
      setBankAccounts([
        {
          id: '1',
          bankName: 'Chase Bank',
          accountNumber: '****1234',
          routingNumber: '021000021',
          accountHolderName: 'Admin Account',
          accountType: 'checking',
          isDefault: true,
          isVerified: true,
          dateAdded: '2024-01-15'
        },
        {
          id: '2',
          bankName: 'Bank of America',
          accountNumber: '****5678',
          routingNumber: '026009593',
          accountHolderName: 'Backup Account',
          accountType: 'savings',
          isDefault: false,
          isVerified: false,
          dateAdded: '2024-02-20'
        }
      ]);

      setPaymentMethods([
        {
          id: '1',
          type: 'credit',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2026,
          isDefault: true,
          dateAdded: '2024-01-10'
        },
        {
          id: '2',
          type: 'credit',
          last4: '8888',
          brand: 'Mastercard',
          expiryMonth: 8,
          expiryYear: 2025,
          isDefault: false,
          dateAdded: '2024-03-05'
        }
      ]);
    } catch (error) {
      console.error('Failed to load banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        ...bankForm,
        accountNumber: `****${bankForm.accountNumber.slice(-4)}`,
        isDefault: bankAccounts.length === 0,
        isVerified: false,
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setBankAccounts([...bankAccounts, newAccount]);
      setBankForm({
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        accountType: 'checking'
      });
      setShowAddBank(false);
    } catch (error) {
      console.error('Failed to add bank account:', error);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCard: PaymentMethod = {
        id: Date.now().toString(),
        type: cardForm.cardNumber.startsWith('4') ? 'credit' : 'credit',
        last4: cardForm.cardNumber.slice(-4),
        brand: getBrandFromCardNumber(cardForm.cardNumber),
        expiryMonth: parseInt(cardForm.expiryMonth),
        expiryYear: parseInt(cardForm.expiryYear),
        isDefault: paymentMethods.length === 0,
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setPaymentMethods([...paymentMethods, newCard]);
      setCardForm({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardHolderName: ''
      });
      setShowAddCard(false);
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const getBrandFromCardNumber = (cardNumber: string): string => {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    if (cardNumber.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      setBankAccounts(bankAccounts.filter(account => account.id !== id));
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  const handleSetDefaultBank = async (id: string) => {
    setBankAccounts(accounts =>
      accounts.map(account => ({
        ...account,
        isDefault: account.id === id
      }))
    );
  };

  const handleSetDefaultCard = async (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bank & Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your bank accounts and payment methods for receiving payouts and processing payments.
          </p>
        </div>

        {/* Bank Accounts Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Landmark className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
                  <p className="text-sm text-gray-600">For receiving payouts and transfers</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBank(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bank Account
              </button>
            </div>
          </div>

          <div className="p-6">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Landmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bank accounts added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Landmark className="w-8 h-8 text-gray-400 mr-4" />
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-900">{account.bankName}</h3>
                            {account.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Default
                              </span>
                            )}
                            {account.isVerified ? (
                              <Check className="w-4 h-4 text-green-500 ml-2" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-500 ml-2" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {account.accountNumber} • {account.accountType}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Added {new Date(account.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!account.isDefault && (
                          <button
                            onClick={() => handleSetDefaultBank(account.id)}
                            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBankAccount(account.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                  <p className="text-sm text-gray-600">For processing platform fees and charges</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </button>
            </div>
          </div>

          <div className="p-6">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payment methods added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-8 h-8 text-gray-400 mr-4" />
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-900">
                              {method.brand} •••• {method.last4}
                            </h3>
                            {method.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Added {new Date(method.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultCard(method.id)}
                            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Bank Account Modal */}
        {showAddBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Bank Account</h3>
                <button
                  onClick={() => setShowAddBank(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBankAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Chase Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name on account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.routingNumber}
                    onChange={(e) => setBankForm({...bankForm, routingNumber: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9-digit routing number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm({...bankForm, accountType: e.target.value as 'checking' | 'savings'})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {showAddCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Payment Method</h3>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value.replace(/\s/g, '')})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardForm.cardHolderName}
                    onChange={(e) => setCardForm({...cardForm, cardHolderName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name on card"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      required
                      value={cardForm.expiryMonth}
                      onChange={(e) => setCardForm({...cardForm, expiryMonth: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      required
                      value={cardForm.expiryYear}
                      onChange={(e) => setCardForm({...cardForm, expiryYear: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">YYYY</option>
                      {Array.from({length: 10}, (_, i) => (
                        <option key={i} value={new Date().getFullYear() + i}>
                          {new Date().getFullYear() + i}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBankSettingsPage;