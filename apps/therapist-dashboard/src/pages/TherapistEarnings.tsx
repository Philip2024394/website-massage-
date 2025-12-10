import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Crown, BarChart3 } from 'lucide-react';

interface Payment {
  $id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  adminCommission: number;
  netEarning: number;
  status: 'pending' | 'paid' | 'processing';
  date: string;
  paymentMethod: string;
}

interface TherapistEarningsProps {
  therapist: any;
  onBack: () => void;
}

const TherapistEarnings: React.FC<TherapistEarningsProps> = ({ therapist, onBack }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const membershipTier = therapist?.membershipTier || 'free';
  const commissionRate = 
    membershipTier === 'elite' ? 0.05 : 
    membershipTier === 'premium' ? 0.10 : 
    0.30;

  useEffect(() => {
    fetchPayments();
  }, [therapist]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from Appwrite payments collection
      // Filter by therapistId === therapist.$id
      
      // Mock data
      const mockPayments: Payment[] = [
        {
          $id: '1',
          bookingId: 'BK001',
          customerName: 'John Doe',
          amount: 150000,
          adminCommission: Math.round(150000 * commissionRate),
          netEarning: Math.round(150000 * (1 - commissionRate)),
          status: 'pending',
          date: '2024-12-15',
          paymentMethod: 'Bank Transfer'
        },
        {
          $id: '2',
          bookingId: 'BK002',
          customerName: 'Sarah Johnson',
          amount: 100000,
          adminCommission: 15000,
          netEarning: 85000,
          status: 'pending',
          date: '2024-12-16',
          paymentMethod: 'Cash'
        },
        {
          $id: '3',
          bookingId: 'BK003',
          customerName: 'Michael Chen',
          amount: 200000,
          adminCommission: 30000,
          netEarning: 170000,
          status: 'paid',
          date: '2024-12-10',
          paymentMethod: 'Bank Transfer'
        },
        {
          $id: '4',
          bookingId: 'BK004',
          customerName: 'Emily Wong',
          amount: 150000,
          adminCommission: 22500,
          netEarning: 127500,
          status: 'paid',
          date: '2024-12-08',
          paymentMethod: 'Bank Transfer'
        },
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalDue: payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.netEarning, 0),
    adminDue: payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.adminCommission, 0),
    totalPaid: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.netEarning, 0),
    monthlyEarnings: payments
      .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.netEarning, 0),
  };

  const getStatusBadge = (status: Payment['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
    };
    return badges[status];
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <TrendingUp className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Earnings & Payments</h1>
              <p className="text-xs text-gray-500">Track your income</p>
            </div>
          </div>
          {membershipTier === 'elite' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">ELITE</span>
            </div>
          )}
          {membershipTier === 'premium' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">PREMIUM</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Your Earnings</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {(stats.totalDue / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500">Pending payment</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Due to Admin</span>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {(stats.adminDue / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500">
              {membershipTier === 'elite' ? '5%' : membershipTier === 'premium' ? '10%' : '30%'} commission
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Paid</span>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {(stats.totalPaid / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500">Total received</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">This Month</span>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {(stats.monthlyEarnings / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500">Monthly total</p>
          </div>
        </div>

        {/* Payment Info Banner */}
        <div className={`rounded-xl shadow-lg p-6 text-white ${
          membershipTier === 'elite' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
          membershipTier === 'premium' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
          'bg-gradient-to-r from-orange-500 to-amber-500'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">💰 Payment Schedule</h3>
              <p className={`text-sm mb-4 ${
                membershipTier === 'elite' ? 'text-purple-100' :
                membershipTier === 'premium' ? 'text-blue-100' :
                'text-orange-100'
              }`}>
                {membershipTier === 'elite' ? '🎉 Elite Member: Lowest 5% commission!' :
                 membershipTier === 'premium' ? '⭐ Premium Member: Only 10% commission - Save 20%!' :
                 'Payments processed weekly. Upgrade to save on commission!'}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">You receive: <strong>
                    {membershipTier === 'elite' ? '95%' : membershipTier === 'premium' ? '90%' : '70%'} of booking amount
                  </strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Admin commission: <strong>
                    {membershipTier === 'elite' ? '5%' : membershipTier === 'premium' ? '10%' : '30%'}
                  </strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Payment method: <strong>Bank transfer or cash</strong></span>
                </div>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 opacity-20" />
          </div>
        </div>

        {/* Premium/Elite Upsell (for free tier) */}
        {membershipTier === 'free' && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Unlock Best Times Analytics</h3>
                  <p className="text-sm text-gray-600">Premium Feature - 200k IDR/month</p>
                </div>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3">📊 What You'll Get:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Peak Hours Chart:</strong> Know exactly when customers book most (9am-11am, 2pm-4pm, etc.)</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Busy Days Heatmap:</strong> See which weekdays bring the most bookings</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Optimal Schedule:</strong> Recommended times to be available for max earnings</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Customer Demographics:</strong> Location, service preferences, booking patterns</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Plus:</strong> Verified badge, discount badges, priority search placement</span>
                </li>
              </ul>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
              Upgrade to Premium - 200k/month
            </button>
          </div>
        )}

        {/* Premium/Elite Analytics */}
        {(membershipTier === 'premium' || membershipTier === 'elite') && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">📊 Best Times Analytics</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-bold text-yellow-700">PREMIUM</span>
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">🕐 Peak Booking Hours</h3>
              <div className="space-y-2">
                {[
                  { hour: '9:00 - 11:00 AM', bookings: 12, percentage: 85 },
                  { hour: '2:00 - 4:00 PM', bookings: 10, percentage: 70 },
                  { hour: '5:00 - 7:00 PM', bookings: 8, percentage: 55 },
                  { hour: '11:00 - 1:00 PM', bookings: 5, percentage: 35 },
                ].map((slot, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{slot.hour}</span>
                      <span className="text-gray-600">{slot.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                        style={{ width: `${slot.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Busy Days */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">📅 Busiest Days</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const intensity = [90, 75, 80, 85, 95, 60, 40][index];
                  return (
                    <div key={day} className="text-center">
                      <div
                        className="rounded-lg p-3 mb-1"
                        style={{
                          backgroundColor: `rgba(249, 115, 22, ${intensity / 100})`,
                        }}
                      >
                        <span className="text-xs font-bold text-white">{day}</span>
                      </div>
                      <span className="text-xs text-gray-600">{intensity}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Optimization Recommendations</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• <strong>Best availability:</strong> Mon-Fri 9AM-4PM (highest booking rate)</li>
                <li>• <strong>Rest days:</strong> Sunday shows low demand, ideal for time off</li>
                <li>• <strong>Peak season:</strong> Friday shows 95% activity - maximize availability</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment History</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.$id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{payment.customerName}</h4>
                      <p className="text-xs text-gray-500">Booking ID: {payment.bookingId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusBadge(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-bold text-gray-800">Rp {payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Commission (15%):</span>
                      <p className="font-bold text-orange-600">- Rp {payment.adminCommission.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Your Earning:</span>
                      <p className="font-bold text-green-600">Rp {payment.netEarning.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium text-gray-800">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistEarnings;
