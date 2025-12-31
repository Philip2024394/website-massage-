import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, Filter, Download, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface PlacePaymentHistoryProps {
  placeId: string;
  onBack?: () => void;
}

const PlacePaymentHistory: React.FC<PlacePaymentHistoryProps> = ({ placeId, onBack }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    // Simulate payment history data
    setPayments([
      {
        id: 1,
        date: '2025-01-02',
        customer: 'Sarah Martinez',
        service: '90 min Traditional Massage',
        amount: 350000,
        method: 'Credit Card',
        status: 'completed',
        transactionId: 'TXN001234'
      },
      {
        id: 2,
        date: '2025-01-01',
        customer: 'John Davidson',
        service: '60 min Balinese Massage',
        amount: 250000,
        method: 'Bank Transfer',
        status: 'completed',
        transactionId: 'TXN001235'
      },
      {
        id: 3,
        date: '2024-12-31',
        customer: 'Maria Kristina',
        service: '120 min Deep Tissue Massage',
        amount: 450000,
        method: 'Digital Wallet',
        status: 'pending',
        transactionId: 'TXN001236'
      },
      {
        id: 4,
        date: '2024-12-30',
        customer: 'Ahmad Rahman',
        service: '90 min Hot Stone Massage',
        amount: 380000,
        method: 'Cash',
        status: 'failed',
        transactionId: 'TXN001237'
      }
    ]);
  }, [placeId]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              Payment History
            </h1>
            <p className="text-gray-600 mt-1">Track all payment transactions for your massage place</p>
          </div>
          <button
            onClick={() => {/* Export functionality */}}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Service</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Method</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-900">{payment.date}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">{payment.customer}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{payment.service}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-orange-600">{formatCurrency(payment.amount)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{payment.method}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs font-mono text-gray-500">{payment.transactionId}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payment transactions found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacePaymentHistory;