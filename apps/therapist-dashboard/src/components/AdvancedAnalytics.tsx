// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react';
import { showToast } from '../lib/toastUtils';

interface AnalyticsData {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    trend: 'up' | 'down';
    growth: number;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    completionRate: number;
    trend: 'up' | 'down';
    growth: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retentionRate: number;
  };
  performance: {
    rating: number;
    reviewCount: number;
    responseTime: number;
    onlineHours: number;
    peakHours: string[];
  };
  insights: {
    bestDay: string;
    bestTime: string;
    popularService: string;
    averageBookingValue: number;
    seasonalTrend: string;
  };
}

interface AdvancedAnalyticsProps {
  therapist: any;
  language?: 'en' | 'id';
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ 
  therapist, 
  language = 'id' 
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'performance'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [therapist]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual analytics service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - replace with real analytics
      const mockData: AnalyticsData = {
        revenue: {
          thisMonth: 2850000,
          lastMonth: 2400000,
          thisWeek: 720000,
          trend: 'up',
          growth: 18.75
        },
        bookings: {
          total: 45,
          completed: 38,
          cancelled: 3,
          pending: 4,
          completionRate: 84.4,
          trend: 'up',
          growth: 12.5
        },
        customers: {
          total: 32,
          new: 8,
          returning: 24,
          retentionRate: 75.0
        },
        performance: {
          rating: 4.8,
          reviewCount: 24,
          responseTime: 12,
          onlineHours: 156,
          peakHours: ['19:00', '20:00', '21:00']
        },
        insights: {
          bestDay: 'Saturday',
          bestTime: '19:00-21:00',
          popularService: 'Traditional Massage',
          averageBookingValue: 175000,
          seasonalTrend: 'increasing'
        }
      };
      
      setData(mockData);
    } catch (error) {
      showToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth: number, trend: 'up' | 'down') => {
    if (trend === 'up' && growth > 0) return 'text-green-600';
    if (trend === 'down' || growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    growth, 
    color = 'orange' 
  }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {growth !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${getGrowthColor(growth, trend)}`}>
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(growth)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const InsightCard = ({ icon: Icon, title, value, description }: any) => (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-500 rounded-lg">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-lg font-bold text-orange-600 mt-1">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Elite</h1>
        <p className="text-orange-100 text-sm">Advanced Business Intelligence</p>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 -mt-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'customers', label: 'Clients', icon: Users },
            { id: 'performance', label: 'Rating', icon: Star }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-2 py-2 rounded-lg font-semibold text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Revenue Bulan Ini"
                value={formatCurrency(data.revenue.thisMonth)}
                trend={data.revenue.trend}
                growth={data.revenue.growth}
                icon={DollarSign}
              />
              <StatCard
                title="Total Booking"
                value={data.bookings.total}
                subtitle={`${data.bookings.completed} selesai`}
                trend={data.bookings.trend}
                growth={data.bookings.growth}
                icon={Calendar}
                color="blue"
              />
              <StatCard
                title="Rating"
                value={data.performance.rating.toFixed(1)}
                subtitle={`${data.performance.reviewCount} reviews`}
                icon={Star}
                color="yellow"
              />
              <StatCard
                title="Jam Online"
                value={`${data.performance.onlineHours}h`}
                subtitle="Bulan ini"
                icon={Clock}
                color="green"
              />
            </div>

            {/* Business Insights */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 Business Insights</h3>
              <div className="space-y-3">
                <InsightCard
                  icon={Calendar}
                  title="Hari Terbaik"
                  value={data.insights.bestDay}
                  description="Hari dengan pendapatan tertinggi"
                />
                <InsightCard
                  icon={Clock}
                  title="Waktu Prime Time"
                  value={data.insights.bestTime}
                  description="Jam sibuk dengan booking terbanyak"
                />
                <InsightCard
                  icon={Award}
                  title="Layanan Populer"
                  value={data.insights.popularService}
                  description="Service dengan permintaan tertinggi"
                />
                <InsightCard
                  icon={TrendingUp}
                  title="Rata-rata per Booking"
                  value={formatCurrency(data.insights.averageBookingValue)}
                  description="Nilai rata-rata setiap sesi"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'revenue' && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">📊 Revenue Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Bulan Ini</span>
                  <span className="font-bold text-green-600">{formatCurrency(data.revenue.thisMonth)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Bulan Lalu</span>
                  <span className="font-bold">{formatCurrency(data.revenue.lastMonth)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Minggu Ini</span>
                  <span className="font-bold text-blue-600">{formatCurrency(data.revenue.thisWeek)}</span>
                </div>
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold">Growth: +{data.revenue.growth}%</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Pendapatan naik {formatCurrency(data.revenue.thisMonth - data.revenue.lastMonth)} dari bulan lalu
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'customers' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Klien"
                value={data.customers.total}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Klien Baru"
                value={data.customers.new}
                subtitle="Bulan ini"
                icon={Eye}
                color="green"
              />
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">👥 Customer Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Retention Rate</span>
                  <span className="font-bold text-orange-600">{data.customers.retentionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${data.customers.retentionRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data.customers.new}</p>
                    <p className="text-sm text-blue-800">Klien Baru</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{data.customers.returning}</p>
                    <p className="text-sm text-orange-800">Returning</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">⭐ Performance Metrics</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">
                    {data.performance.rating.toFixed(1)}
                  </div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-6 h-6 ${
                          star <= Math.floor(data.performance.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on {data.performance.reviewCount} reviews
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-bold text-green-600">{data.performance.responseTime} min</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Online Hours</span>
                    <span className="font-bold">{data.performance.onlineHours}h</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-orange-600">{data.bookings.completionRate}%</span>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Peak Hours</h4>
                  <div className="flex gap-2">
                    {data.performance.peakHours.map(hour => (
                      <div key={hour} className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-medium">
                        {hour}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-orange-700 mt-2">
                    Waktu dengan aktivitas booking tertinggi
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">💡 Recommendations</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus on {data.insights.bestDay} promotions</li>
                <li>• Optimize {data.insights.bestTime} availability</li>
                <li>• Promote {data.insights.popularService} service</li>
                <li>• Target {data.customers.retentionRate < 80 ? 'retention' : 'new customer'} campaigns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default AdvancedAnalytics;