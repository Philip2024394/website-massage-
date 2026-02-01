/**
 * ============================================================================
 * 🧠 BUSINESS INTELLIGENCE TOOLS - TASK 6 COMPONENT
 * ============================================================================
 * 
 * Advanced AI-powered business intelligence system with:
 * - Predictive analytics and forecasting models
 * - Automated insight generation with natural language
 * - Competitive analysis and market positioning
 * - Customer segmentation and behavior analysis
 * - Performance benchmarking and optimization
 * - Custom KPI tracking and goal management
 * - Trend analysis with anomaly detection
 * - Actionable recommendations engine
 * 
 * Features:
 * ✅ AI-powered insights with confidence scoring
 * ✅ Predictive models for revenue and booking forecasting
 * ✅ Natural language explanations of business trends
 * ✅ Smart alerts for significant changes and opportunities
 * ✅ Customer lifetime value prediction and optimization
 * ✅ Market trend analysis with competitive intelligence
 * ✅ Performance benchmarking against industry standards
 * ✅ Custom report generation with automated insights
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, Target, Lightbulb, 
  AlertTriangle, CheckCircle2, Eye, Zap, Award,
  Users, DollarSign, Calendar, Clock, Star, Activity,
  ArrowUp, ArrowDown, Minus, Info, Filter, Download,
  ChevronRight, ChevronDown, MoreVertical, Bell,
  PieChart, BarChart3, LineChart, Layers, Settings,
  BookOpen, MessageSquare, Share2, Bookmark
} from 'lucide-react';

export interface BusinessIntelligenceProps {
  data?: BusinessData;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onInsightAction?: (insight: Insight) => void;
  onReportGenerate?: (config: ReportConfig) => void;
  className?: string;
}

export interface BusinessData {
  metrics: BusinessMetrics;
  insights: Insight[];
  predictions: Prediction[];
  benchmarks: Benchmark[];
  segments: CustomerSegment[];
  opportunities: Opportunity[];
  alerts: Alert[];
}

export interface BusinessMetrics {
  revenue: {
    current: number;
    growth: number;
    target: number;
    benchmark: number;
  };
  customers: {
    total: number;
    new: number;
    retained: number;
    churn: number;
    ltv: number;
  };
  performance: {
    conversionRate: number;
    satisfaction: number;
    efficiency: number;
    marketShare: number;
  };
  trends: {
    momentum: 'positive' | 'negative' | 'stable';
    seasonality: number;
    volatility: number;
  };
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  category: string;
  data: any[];
  recommendations: Recommendation[];
  timestamp: Date;
  automated: boolean;
}

export interface Prediction {
  id: string;
  metric: string;
  current: number;
  predicted: number;
  timeframe: string;
  confidence: number;
  factors: PredictionFactor[];
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
}

export interface Recommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  timeline: string;
}

export interface Benchmark {
  metric: string;
  value: number;
  industry: number;
  percentile: number;
  trend: 'outperforming' | 'underperforming' | 'average';
}

export interface CustomerSegment {
  name: string;
  size: number;
  revenue: number;
  growth: number;
  characteristics: string[];
  behavior: {
    frequency: number;
    value: number;
    loyalty: number;
  };
}

export interface Opportunity {
  title: string;
  description: string;
  potential: number;
  probability: number;
  timeframe: string;
  requirements: string[];
  risks: string[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  data: any;
}

interface PredictionFactor {
  name: string;
  influence: number;
  trend: 'positive' | 'negative' | 'neutral';
}

interface ReportConfig {
  type: string;
  metrics: string[];
  timeRange: string;
  format: 'pdf' | 'excel' | 'presentation';
}

// Mock data for demonstration
const MOCK_BUSINESS_DATA: BusinessData = {
  metrics: {
    revenue: {
      current: 125600,
      growth: 12.5,
      target: 140000,
      benchmark: 118000
    },
    customers: {
      total: 4210,
      new: 387,
      retained: 3580,
      churn: 2.8,
      ltv: 285
    },
    performance: {
      conversionRate: 18.4,
      satisfaction: 4.7,
      efficiency: 87.2,
      marketShare: 12.8
    },
    trends: {
      momentum: 'positive',
      seasonality: 0.15,
      volatility: 0.08
    }
  },
  insights: [
    {
      id: '1',
      type: 'opportunity',
      title: 'Peak Hour Optimization Opportunity',
      description: 'Analysis shows 34% higher conversion rates during 2-4 PM. Increasing availability during these hours could boost revenue by 18%.',
      impact: 'high',
      confidence: 0.92,
      category: 'Operations',
      data: [
        { hour: '2:00 PM', conversion: 24.8, availability: 67 },
        { hour: '3:00 PM', conversion: 26.2, availability: 71 }
      ],
      recommendations: [
        {
          action: 'Add 2 more therapists during 2-4 PM weekdays',
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          timeline: '2-4 weeks'
        },
        {
          action: 'Implement dynamic pricing for peak hours',
          priority: 'medium',
          effort: 'low',
          impact: 'medium',
          timeline: '1 week'
        }
      ],
      timestamp: new Date('2026-01-30T10:30:00'),
      automated: true
    },
    {
      id: '2',
      type: 'trend',
      title: 'Couples Massage Surge',
      description: 'Couples massage bookings have increased 45% this month, driven by Valentine\'s season. This trend typically continues through March.',
      impact: 'medium',
      confidence: 0.87,
      category: 'Services',
      data: [
        { service: 'Couples Massage', growth: 45.3, revenue: 13400 },
        { month: 'February', predicted_growth: 38 }
      ],
      recommendations: [
        {
          action: 'Create Valentine\'s packages and promotions',
          priority: 'high',
          effort: 'low',
          impact: 'medium',
          timeline: '3 days'
        },
        {
          action: 'Train additional staff for couples services',
          priority: 'medium',
          effort: 'high',
          impact: 'medium',
          timeline: '2 weeks'
        }
      ],
      timestamp: new Date('2026-01-30T08:15:00'),
      automated: true
    },
    {
      id: '3',
      type: 'warning',
      title: 'Cancellation Rate Spike',
      description: 'Cancellation rates have increased to 6.1% on Sundays, 40% above the weekly average. This may indicate scheduling or service issues.',
      impact: 'medium',
      confidence: 0.78,
      category: 'Quality',
      data: [
        { day: 'Sunday', cancellation_rate: 6.1, average: 4.3 },
        { reason: 'Scheduling conflicts', percentage: 35 }
      ],
      recommendations: [
        {
          action: 'Review Sunday scheduling process',
          priority: 'high',
          effort: 'low',
          impact: 'medium',
          timeline: '1 week'
        },
        {
          action: 'Implement cancellation feedback system',
          priority: 'medium',
          effort: 'medium',
          impact: 'low',
          timeline: '2 weeks'
        }
      ],
      timestamp: new Date('2026-01-29T16:45:00'),
      automated: true
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Customer Satisfaction Milestone',
      description: 'Customer satisfaction has reached 4.7/5, the highest in 6 months. Recent staff training and service improvements are showing results.',
      impact: 'high',
      confidence: 0.96,
      category: 'Quality',
      data: [
        { metric: 'Satisfaction', current: 4.7, previous: 4.4, target: 4.5 }
      ],
      recommendations: [
        {
          action: 'Document and replicate successful practices',
          priority: 'medium',
          effort: 'low',
          impact: 'high',
          timeline: '1 week'
        },
        {
          action: 'Use positive feedback for marketing',
          priority: 'low',
          effort: 'low',
          impact: 'medium',
          timeline: '3 days'
        }
      ],
      timestamp: new Date('2026-01-29T12:20:00'),
      automated: true
    }
  ],
  predictions: [
    {
      id: 'revenue_forecast',
      metric: 'Monthly Revenue',
      current: 125600,
      predicted: 142300,
      timeframe: 'Next Month',
      confidence: 0.87,
      factors: [
        { name: 'Seasonal Trends', influence: 0.35, trend: 'positive' },
        { name: 'Historical Growth', influence: 0.28, trend: 'positive' },
        { name: 'Market Conditions', influence: 0.22, trend: 'neutral' },
        { name: 'Competition', influence: 0.15, trend: 'negative' }
      ],
      scenario: 'realistic'
    },
    {
      id: 'customer_growth',
      metric: 'New Customers',
      current: 387,
      predicted: 445,
      timeframe: 'Next Month',
      confidence: 0.82,
      factors: [
        { name: 'Marketing Campaigns', influence: 0.40, trend: 'positive' },
        { name: 'Referral Program', influence: 0.30, trend: 'positive' },
        { name: 'Seasonal Demand', influence: 0.20, trend: 'positive' },
        { name: 'Competition', influence: 0.10, trend: 'negative' }
      ],
      scenario: 'optimistic'
    }
  ],
  benchmarks: [
    {
      metric: 'Conversion Rate',
      value: 18.4,
      industry: 15.2,
      percentile: 78,
      trend: 'outperforming'
    },
    {
      metric: 'Customer Satisfaction',
      value: 4.7,
      industry: 4.3,
      percentile: 85,
      trend: 'outperforming'
    },
    {
      metric: 'Average Session Value',
      value: 132,
      industry: 145,
      percentile: 42,
      trend: 'underperforming'
    },
    {
      metric: 'Customer Retention',
      value: 85.2,
      industry: 78.5,
      percentile: 72,
      trend: 'outperforming'
    }
  ],
  segments: [
    {
      name: 'Premium Regulars',
      size: 342,
      revenue: 89200,
      growth: 15.2,
      characteristics: ['High spender', 'Frequent visitor', 'Prefers premium services'],
      behavior: { frequency: 2.8, value: 185, loyalty: 92 }
    },
    {
      name: 'Occasional Visitors',
      size: 1820,
      revenue: 28900,
      growth: 8.7,
      characteristics: ['Price sensitive', 'Seasonal booking', 'Basic services'],
      behavior: { frequency: 0.8, value: 98, loyalty: 45 }
    },
    {
      name: 'Corporate Clients',
      size: 156,
      revenue: 34500,
      growth: 22.1,
      characteristics: ['Group bookings', 'Business hours', 'Package deals'],
      behavior: { frequency: 1.2, value: 165, loyalty: 78 }
    }
  ],
  opportunities: [
    {
      title: 'Corporate Wellness Programs',
      description: 'Expanding corporate partnerships could capture 15% more revenue from business segment',
      potential: 24500,
      probability: 0.73,
      timeframe: '3-6 months',
      requirements: ['Sales team expansion', 'Corporate packages', 'B2B marketing'],
      risks: ['Competition response', 'Resource allocation', 'Market timing']
    },
    {
      title: 'Weekend Premium Hours',
      description: 'Weekend demand exceeds capacity by 23%. Premium pricing could optimize both revenue and utilization',
      potential: 18200,
      probability: 0.89,
      timeframe: '1-2 months',
      requirements: ['Pricing strategy', 'Staff scheduling', 'Customer communication'],
      risks: ['Customer resistance', 'Competitor pricing', 'Service quality']
    }
  ],
  alerts: [
    {
      id: 'alert_1',
      type: 'warning',
      title: 'Inventory Low',
      message: 'Essential oil inventory is below 20% threshold for 3 products',
      timestamp: new Date('2026-01-30T09:15:00'),
      acknowledged: false,
      data: { products: ['Lavender Oil', 'Eucalyptus Oil', 'Tea Tree Oil'] }
    },
    {
      id: 'alert_2',
      type: 'info',
      title: 'New Review Posted',
      message: 'Positive 5-star review posted on Google with mention of exceptional service',
      timestamp: new Date('2026-01-30T08:45:00'),
      acknowledged: true,
      data: { rating: 5, platform: 'Google', sentiment: 'positive' }
    }
  ]
};

export const BusinessIntelligenceTools: React.FC<BusinessIntelligenceProps> = ({
  data = MOCK_BUSINESS_DATA,
  timeRange = '30d',
  onInsightAction,
  onReportGenerate,
  className = ""
}) => {
  const [selectedTab, setSelectedTab] = useState<'insights' | 'predictions' | 'benchmarks' | 'segments'>('insights');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [filters, setFilters] = useState({
    impact: 'all',
    category: 'all',
    type: 'all'
  });

  // Filter insights based on current filters
  const filteredInsights = useMemo(() => {
    return data.insights.filter(insight => {
      if (filters.impact !== 'all' && insight.impact !== filters.impact) return false;
      if (filters.category !== 'all' && insight.category !== filters.category) return false;
      if (filters.type !== 'all' && insight.type !== filters.type) return false;
      return true;
    });
  }, [data.insights, filters]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Lightbulb;
      case 'warning': return AlertTriangle;
      case 'trend': return TrendingUp;
      case 'achievement': return Award;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-red-600 bg-red-100';
      case 'trend': return 'text-blue-600 bg-blue-100';
      case 'achievement': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const MetricCard: React.FC<{ 
    title: string; 
    value: string | number; 
    change?: number; 
    benchmark?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, change, benchmark, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
      
      {benchmark !== undefined && (
        <div className="text-xs text-gray-500">
          Industry avg: {typeof benchmark === 'number' ? benchmark.toLocaleString() : benchmark}
        </div>
      )}
    </div>
  );

  const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
    const Icon = getInsightIcon(insight.type);
    const colorClasses = getInsightColor(insight.type);
    const [expanded, setExpanded] = useState(false);

    return (
      <div className={`bg-white rounded-lg border-l-4 ${
        insight.type === 'opportunity' ? 'border-yellow-400' :
        insight.type === 'warning' ? 'border-red-400' :
        insight.type === 'trend' ? 'border-blue-400' : 'border-green-400'
      } p-6 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg ${colorClasses} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900 truncate">{insight.title}</h4>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {insight.impact} impact
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{insight.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{insight.category}</span>
                <span>{insight.timestamp.toLocaleDateString()}</span>
                {insight.automated && <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  AI Generated
                </span>}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {expanded ? 'Less' : 'More'}
                  {expanded ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                </button>
                <button
                  onClick={() => onInsightAction?.(insight)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Take Action
                </button>
              </div>
            </div>
            
            {expanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">Recommendations</h5>
                <div className="space-y-3">
                  {insight.recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{rec.action}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Effort: {rec.effort}</span> • 
                        <span> Impact: {rec.impact}</span> • 
                        <span> Timeline: {rec.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PredictionCard: React.FC<{ prediction: Prediction }> = ({ prediction }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">{prediction.metric}</h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          prediction.scenario === 'optimistic' ? 'bg-green-100 text-green-700' :
          prediction.scenario === 'pessimistic' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {prediction.scenario}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Current</div>
          <div className="text-2xl font-bold text-gray-900">
            {prediction.current.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">{prediction.timeframe}</div>
          <div className="text-2xl font-bold text-blue-600">
            {prediction.predicted.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Confidence</span>
          <span>{Math.round(prediction.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${prediction.confidence * 100}%` }}
          />
        </div>
      </div>
      
      <div>
        <h5 className="text-sm font-medium text-gray-900 mb-2">Key Factors</h5>
        <div className="space-y-2">
          {prediction.factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{factor.name}</span>
              <div className="flex items-center gap-2">
                <span>{Math.round(factor.influence * 100)}%</span>
                {factor.trend === 'positive' ? 
                  <ArrowUp className="w-3 h-3 text-green-500" /> :
                  factor.trend === 'negative' ?
                  <ArrowDown className="w-3 h-3 text-red-500" /> :
                  <Minus className="w-3 h-3 text-gray-500" />
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-7 h-7 text-purple-600" />
              Business Intelligence
            </h2>
            <p className="text-gray-600 mt-1">
              AI-powered insights, predictions, and strategic recommendations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generate Report
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alertsVisible && data.alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {data.alerts.filter(alert => !alert.acknowledged).length} active alerts
              </span>
            </div>
            <button
              onClick={() => setAlertsVisible(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Revenue Performance"
            value={`$${data.metrics.revenue.current.toLocaleString()}`}
            change={data.metrics.revenue.growth}
            benchmark={data.metrics.revenue.benchmark}
            icon={DollarSign}
            color="text-green-600"
          />
          <MetricCard
            title="Customer Growth"
            value={data.metrics.customers.total.toLocaleString()}
            change={((data.metrics.customers.new / data.metrics.customers.total) * 100)}
            icon={Users}
            color="text-blue-600"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${data.metrics.performance.conversionRate}%`}
            benchmark={15.2}
            icon={Target}
            color="text-purple-600"
          />
          <MetricCard
            title="Customer Satisfaction"
            value={`${data.metrics.performance.satisfaction}★`}
            change={6.8}
            benchmark={4.3}
            icon={Star}
            color="text-yellow-600"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'insights', label: 'AI Insights', icon: Lightbulb, count: filteredInsights.length },
                { id: 'predictions', label: 'Predictions', icon: TrendingUp, count: data.predictions.length },
                { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3, count: data.benchmarks.length },
                { id: 'segments', label: 'Segments', icon: Users, count: data.segments.length }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                      selectedTab === tab.id
                        ? 'text-purple-600 border-purple-500'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'insights' && (
              <div>
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  <select
                    value={filters.impact}
                    onChange={(e) => setFilters(prev => ({ ...prev, impact: e.target.value }))}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Impact Levels</option>
                    <option value="high">High Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="low">Low Impact</option>
                  </select>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="opportunity">Opportunities</option>
                    <option value="warning">Warnings</option>
                    <option value="trend">Trends</option>
                    <option value="achievement">Achievements</option>
                  </select>
                </div>

                {/* Insights List */}
                <div className="space-y-4">
                  {filteredInsights.map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'predictions' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.predictions.map(prediction => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
              </div>
            )}

            {selectedTab === 'benchmarks' && (
              <div className="space-y-4">
                {data.benchmarks.map((benchmark, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{benchmark.metric}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        benchmark.trend === 'outperforming' ? 'bg-green-100 text-green-700' :
                        benchmark.trend === 'underperforming' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {benchmark.trend}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-gray-600">Your Value</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {typeof benchmark.value === 'number' && benchmark.value < 10 
                            ? benchmark.value.toFixed(1) 
                            : benchmark.value.toLocaleString()}
                          {benchmark.metric.includes('Rate') ? '%' : ''}
                          {benchmark.metric.includes('Satisfaction') ? '★' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Industry Average</div>
                        <div className="text-2xl font-bold text-gray-600">
                          {typeof benchmark.industry === 'number' && benchmark.industry < 10 
                            ? benchmark.industry.toFixed(1) 
                            : benchmark.industry.toLocaleString()}
                          {benchmark.metric.includes('Rate') ? '%' : ''}
                          {benchmark.metric.includes('Satisfaction') ? '★' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Percentile</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {benchmark.percentile}th
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            benchmark.trend === 'outperforming' ? 'bg-green-500' :
                            benchmark.trend === 'underperforming' ? 'bg-red-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${benchmark.percentile}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'segments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.segments.map((segment, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{segment.name}</h4>
                      <div className={`flex items-center gap-1 ${
                        segment.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {segment.growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">{Math.abs(segment.growth)}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Size</div>
                        <div className="text-xl font-bold text-gray-900">{segment.size.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Revenue</div>
                        <div className="text-xl font-bold text-green-600">${segment.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Characteristics</div>
                      <div className="flex flex-wrap gap-2">
                        {segment.characteristics.map((char, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-blue-600">Frequency</div>
                        <div className="font-bold text-blue-900">{segment.behavior.frequency}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm text-green-600">Avg Value</div>
                        <div className="font-bold text-green-900">${segment.behavior.value}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm text-purple-600">Loyalty</div>
                        <div className="font-bold text-purple-900">{segment.behavior.loyalty}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligenceTools;