import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Eye } from 'lucide-react';

interface PlaceEarningsProps {
  placeId: string;
  onBack?: () => void;
}

const PlaceEarnings: React.FC<PlaceEarningsProps> = ({ placeId, onBack }) => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Simulate earnings data
    setEarnings({
      today: 450000,
      thisWeek: 2100000,
      thisMonth: 8500000,
      total: 45200000
    });
    
    // Simulate recent bookings
    setRecentBookings([
      { id: 1, customer: 'Sarah M.', service: '90 min Traditional', amount: 350000, date: '2025-01-02', status: 'completed' },
      { id: 2, customer: 'John D.', service: '60 min Balinese', amount: 250000, date: '2025-01-01', status: 'completed' },
      { id: 3, customer: 'Maria K.', service: '120 min Deep Tissue', amount: 450000, date: '2024-12-31', status: 'completed' }
    ]);
  }, [placeId]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const EarningsCard = ({ title, amount, icon, color = 'orange' }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
          {icon}
        </div>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <h3 className="text-sm text-gray-600 font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              Earnings Overview
            </h1>
            <p className="text-gray-600 mt-1">Track your massage place revenue and bookings</p>
          </div>
          <button
            onClick={() => {/* Export functionality */}}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <EarningsCard
          title="Today"
          amount={earnings.today}
          icon={<Calendar className="w-6 h-6 text-orange-600" />}
        />
        <EarningsCard
          title="This Week"
          amount={earnings.thisWeek}
          icon={<Calendar className="w-6 h-6 text-orange-600" />}
        />
        <EarningsCard
          title="This Month"
          amount={earnings.thisMonth}
          icon={<Calendar className="w-6 h-6 text-orange-600" />}
        />
        <EarningsCard
          title="Total Earned"
          amount={earnings.total}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Completed Bookings</h2>
            <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900">{booking.customer}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{booking.service}</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(booking.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceEarnings;