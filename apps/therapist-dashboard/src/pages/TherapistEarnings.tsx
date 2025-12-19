// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Banknote, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Crown, BarChart3 } from 'lucide-react';

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
  const membershipTier = therapist?.membershipTier || 'free'; // 'free' or 'plus'
  const commissionRate = membershipTier === 'plus' ? 0 : 0.30; // Premium: 0%, Pro: 30%

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-sm mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
              <p className="text-sm text-gray-600">Track your income and payment history</p>
            </div>
          </div>
          {membershipTier === 'plus' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">PREMIUM</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6">
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Banknote className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Your Earnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              Rp {stats.totalDue.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500">Pending payment</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Due to Admin</span>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              Rp {stats.adminDue.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500">
              {membershipTier === 'plus' ? '0%' : '30%'} commission
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Paid</span>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              Rp {stats.totalPaid.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500">Total received</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">This Month</span>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              Rp {stats.monthlyEarnings.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500">Monthly total</p>
          </div>
        </div>

        {/* Payment Info Banner */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Banknote className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Schedule</h3>
              <p className="text-sm text-gray-600 mb-4">
                {membershipTier === 'elite' ? 'Elite Member: Lowest 5% commission!' :
                 membershipTier === 'premium' ? 'Premium Member: Only 10% commission - Save 20%!' :
                 'Payments processed weekly. Upgrade to save on commission!'}
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">You receive: <span className="font-medium">
                    {membershipTier === 'elite' ? '95%' : membershipTier === 'premium' ? '90%' : '70%'}
                  </span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Commission: <span className="font-medium">
                    {membershipTier === 'elite' ? '5%' : membershipTier === 'premium' ? '10%' : '30%'}
                  </span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Bank transfer or cash</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Analytics Upsell */}
        {membershipTier === 'free' && (
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Best Times Analytics</h3>
                <p className="text-sm text-gray-600">Premium Feature - Rp 250.000/MONTH</p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">What You'll Get:</h4>
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600"><span className="font-medium">Peak Hours Chart:</span> Know exactly when customers book most</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600"><span className="font-medium">Busy Days Heatmap:</span> See which weekdays bring the most bookings</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600"><span className="font-medium">Optimal Schedule:</span> Recommended times for max earnings</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600"><span className="font-medium">Customer Demographics:</span> Location and booking patterns</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600"><span className="font-medium">Premium Benefits:</span> Verified badge and priority placement</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
              Upgrade to Premium - 250k/MONTH
            </button>
          </div>
        )}

        {/* Premium/Elite Analytics */}
        {(membershipTier === 'premium' || membershipTier === 'elite') && (
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Best Times Analytics</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">PREMIUM</span>
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Peak Booking Hours</h3>
              <div className="space-y-3">
                {[
                  { hour: '9:00 - 11:00 AM', bookings: 12, percentage: 85 },
                  { hour: '2:00 - 4:00 PM', bookings: 10, percentage: 70 },
                  { hour: '5:00 - 7:00 PM', bookings: 8, percentage: 55 },
                  { hour: '11:00 - 1:00 PM', bookings: 5, percentage: 35 },
                ].map((slot, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">{slot.hour}</span>
                      <span className="text-gray-500">{slot.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
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
                  <div className="grid grid-cols-1 gap-3 text-sm">
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
      </main>
    </div>
  );
};

export default TherapistEarnings;
