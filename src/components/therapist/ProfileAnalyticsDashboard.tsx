/**
 * ============================================================================
 * 📊 PROFILE ANALYTICS DASHBOARD - PERFORMANCE INSIGHTS
 * ============================================================================
 * 
 * Comprehensive profile performance analytics with:
 * - Profile views and engagement tracking
 * - Booking conversion rates and trends
 * - Service performance comparison
 * - Profile completion impact analysis
 * - Competitive positioning insights
 * - Optimization recommendations
 * - Visual charts and trend analysis
 * 
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Eye, Calendar, Users, 
  DollarSign, Star, Target, BarChart3, PieChart,
  Activity, Zap, Award, AlertCircle, CheckCircle2,
  ArrowUp, ArrowDown, Minus, Info, Lightbulb,
  Filter, Download, RefreshCw, Clock
} from 'lucide-react';
import { TherapistProfile, ProfileAnalytics, ProfileService } from './EnhancedProfileEditor';

interface ProfileAnalyticsDashboardProps {
  profile: TherapistProfile;
  historicalData?: AnalyticsHistory;
  competitorData?: CompetitorInsights;
  className?: string;
}

interface AnalyticsHistory {
  views: DataPoint[];
  bookings: DataPoint[];
  ratings: DataPoint[];
  revenue: DataPoint[];
}

interface DataPoint {
  date: string;
  value: number;
}

interface CompetitorInsights {
  averageRating: number;
  averagePrice: number;
  averageResponseTime: number;
  totalCompetitors: number;
  yourRanking: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

interface OptimizationTip {
  id: string;
  category: 'profile' | 'pricing' | 'services' | 'availability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionRequired: boolean;
}

const MOCK_HISTORICAL_DATA: AnalyticsHistory = {
  views: [
    { date: '2026-01-01', value: 45 },
    { date: '2026-01-08', value: 52 },
    { date: '2026-01-15', value: 61 },
    { date: '2026-01-22', value: 58 },
    { date: '2026-01-29', value: 73 }
  ],
  bookings: [
    { date: '2026-01-01', value: 8 },
    { date: '2026-01-08', value: 12 },
    { date: '2026-01-15', value: 15 },
    { date: '2026-01-22', value: 11 },
    { date: '2026-01-29', value: 18 }
  ],
  ratings: [
    { date: '2026-01-01', value: 4.2 },
    { date: '2026-01-08', value: 4.3 },
    { date: '2026-01-15', value: 4.5 },
    { date: '2026-01-22', value: 4.4 },
    { date: '2026-01-29', value: 4.6 }
  ],
  revenue: [
    { date: '2026-01-01', value: 640 },
    { date: '2026-01-08', value: 960 },
    { date: '2026-01-15', value: 1200 },
    { date: '2026-01-22', value: 880 },
    { date: '2026-01-29', value: 1440 }
  ]
};

const MOCK_COMPETITOR_DATA: CompetitorInsights = {
  averageRating: 4.2,
  averagePrice: 85,
  averageResponseTime: 45,
  totalCompetitors: 127,
  yourRanking: 23
};

export const ProfileAnalyticsDashboard: React.FC<ProfileAnalyticsDashboardProps> = ({
  profile,
  historicalData = MOCK_HISTORICAL_DATA,
  competitorData = MOCK_COMPETITOR_DATA,
  className = ""
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'optimization'>('overview');

  // Calculate metrics with trends
  const metrics = useMemo((): MetricCard[] => {
    const currentViews = profile.analytics.viewsThisMonth;
    const currentBookings = profile.analytics.bookingsThisMonth;
    const conversionRate = profile.analytics.conversionRate;
    const averageRating = profile.analytics.averageRating;
    const profileCompleteness = profile.analytics.profileCompleteness;

    return [
      {
        title: 'Profile Views',
        value: currentViews,
        change: 15.3,
        trend: 'up',
        icon: Eye,
        color: 'text-blue-600',
        description: 'Total profile views this month'
      },
      {
        title: 'Bookings',
        value: currentBookings,
        change: 8.7,
        trend: 'up',
        icon: Calendar,
        color: 'text-green-600',
        description: 'Confirmed bookings this month'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: -2.1,
        trend: 'down',
        icon: Target,
        color: 'text-orange-600',
        description: 'Views that convert to bookings'
      },
      {
        title: 'Average Rating',
        value: `${averageRating.toFixed(1)}★`,
        change: 0.3,
        trend: 'up',
        icon: Star,
        color: 'text-yellow-600',
        description: 'Your overall rating from clients'
      },
      {
        title: 'Profile Score',
        value: `${profileCompleteness}%`,
        change: 12,
        trend: 'up',
        icon: Award,
        color: 'text-purple-600',
        description: 'Profile completion and optimization'
      },
      {
        title: 'Competitive Rank',
        value: `#${profile.analytics.competitorRanking}`,
        change: -3,
        trend: 'up',
        icon: TrendingUp,
        color: 'text-indigo-600',
        description: 'Your ranking among local therapists'
      }
    ];
  }, [profile]);

  // Generate optimization tips
  const optimizationTips = useMemo((): OptimizationTip[] => {
    const tips: OptimizationTip[] = [];

    if (profile.analytics.profileCompleteness < 80) {
      tips.push({
        id: 'profile_completion',
        category: 'profile',
        priority: 'high',
        title: 'Complete Your Profile',
        description: 'Add more details to your profile to increase visibility and trust.',
        impact: 'Could increase bookings by 25-40%',
        actionRequired: true
      });
    }

    if (profile.analytics.conversionRate < 15) {
      tips.push({
        id: 'low_conversion',
        category: 'pricing',
        priority: 'high',
        title: 'Optimize Pricing Strategy',
        description: 'Your prices may be higher than market average, affecting bookings.',
        impact: 'Could improve conversion by 10-15%',
        actionRequired: true
      });
    }

    if (profile.services.length < 3) {
      tips.push({
        id: 'more_services',
        category: 'services',
        priority: 'medium',
        title: 'Add More Services',
        description: 'Offer diverse services to attract different client needs.',
        impact: 'Could increase bookings by 15-25%',
        actionRequired: false
      });
    }

    if (profile.socialProof.responseTime > 30) {
      tips.push({
        id: 'response_time',
        category: 'availability',
        priority: 'medium',
        title: 'Improve Response Time',
        description: 'Faster responses lead to higher booking rates.',
        impact: 'Could improve client satisfaction by 20%',
        actionRequired: true
      });
    }

    return tips;
  }, [profile]);

  // Service performance analysis
  const servicePerformance = useMemo(() => {
    return profile.services.map(service => ({
      ...service,
      popularity: Math.random() * 100, // Mock data
      revenue: service.price * Math.floor(Math.random() * 20),
      bookingRate: Math.random() * 0.3
    })).sort((a, b) => b.popularity - a.popularity);
  }, [profile.services]);

  const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => {
    const Icon = metric.icon;
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${metric.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendIcon trend={metric.trend} />
            <span className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
              {Math.abs(metric.change)}%
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metric.value}
          </div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            {metric.title}
          </div>
          {metric.description && (
            <div className="text-xs text-gray-500">
              {metric.description}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SimpleChart: React.FC<{ data: DataPoint[]; color: string; title: string }> = ({ 
    data, 
    color, 
    title 
  }) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-end gap-2 h-32">
          {data.map((point, index) => {
            const height = ((point.value - min) / (max - min)) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full ${color} rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${point.value} on ${point.date}`}
                />
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>Min: {min}</span>
          <span>Max: {max}</span>
        </div>
      </div>
    );
  };

  const OptimizationTipCard: React.FC<{ tip: OptimizationTip }> = ({ tip }) => (
    <div className={`bg-white border-l-4 rounded-lg p-4 ${
      tip.priority === 'high' 
        ? 'border-red-500 bg-red-50' 
        : tip.priority === 'medium'
        ? 'border-yellow-500 bg-yellow-50'
        : 'border-blue-500 bg-blue-50'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          tip.priority === 'high' 
            ? 'bg-red-100 text-red-600' 
            : tip.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-blue-100 text-blue-600'
        }`}>
          <Lightbulb className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{tip.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              tip.priority === 'high' 
                ? 'bg-red-200 text-red-700' 
                : tip.priority === 'medium'
                ? 'bg-yellow-200 text-yellow-700'
                : 'bg-blue-200 text-blue-700'
            }`}>
              {tip.priority}
            </span>
            {tip.actionRequired && (
              <span className="bg-orange-200 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                Action Required
              </span>
            )}
          </div>
          
          <p className="text-gray-700 text-sm mb-2">{tip.description}</p>
          
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">{tip.impact}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewTab: React.FC = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart 
          data={historicalData.views} 
          color="bg-blue-500" 
          title="Profile Views Trend"
        />
        <SimpleChart 
          data={historicalData.bookings} 
          color="bg-green-500" 
          title="Bookings Trend"
        />
      </div>

      {/* Competitive Analysis */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Position</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">#{competitorData.yourRanking}</div>
            <div className="text-sm text-gray-600">Your Ranking</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {profile.socialProof.rating.toFixed(1)} / {competitorData.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Rating vs Avg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${profile.pricing.basePrice} / ${competitorData.averagePrice}
            </div>
            <div className="text-sm text-gray-600">Price vs Avg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile.socialProof.responseTime}m / {competitorData.averageResponseTime}m
            </div>
            <div className="text-sm text-gray-600">Response vs Avg</div>
          </div>
        </div>
      </div>
    </div>
  );

  const PerformanceTab: React.FC = () => (
    <div className="space-y-6">
      {/* Service Performance */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
        <div className="space-y-4">
          {servicePerformance.map((service, index) => (
            <div key={service.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
                #{index + 1}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>${service.price}</span>
                  <span>{service.duration}min</span>
                  <span>{(service.bookingRate * 100).toFixed(1)}% booking rate</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">${service.revenue}</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
              
              <div className="w-20">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${service.popularity}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {service.popularity.toFixed(0)}% popular
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart 
          data={historicalData.revenue} 
          color="bg-green-500" 
          title="Revenue Trend"
        />
        <SimpleChart 
          data={historicalData.ratings} 
          color="bg-yellow-500" 
          title="Rating Trend"
        />
      </div>
    </div>
  );

  const OptimizationTab: React.FC = () => (
    <div className="space-y-6">
      {/* Optimization Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Optimization Score</h3>
            <p className="text-gray-600">Based on profile completeness, performance, and market data</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              {profile.analytics.optimizationScore}/100
            </div>
            <div className="text-sm text-gray-600">Current Score</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
            style={{ width: `${profile.analytics.optimizationScore}%` }}
          />
        </div>
      </div>

      {/* Optimization Tips */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-4">
          {optimizationTips.map(tip => (
            <OptimizationTipCard key={tip.id} tip={tip} />
          ))}
        </div>
        
        {optimizationTips.length === 0 && (
          <div className="text-center py-12 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Great Job!</h3>
            <p className="text-gray-600">Your profile is well-optimized. Keep up the excellent work!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-50 rounded-xl ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-t-xl p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Analytics & Insights
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track your performance and optimize for better results
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'performance', label: 'Performance' },
            { id: 'optimization', label: 'Optimization' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'optimization' && <OptimizationTab />}
      </div>
    </div>
  );
};

export default ProfileAnalyticsDashboard;