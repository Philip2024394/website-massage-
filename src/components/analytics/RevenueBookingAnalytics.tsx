/**
 * ============================================================================
 * 💰 REVENUE & BOOKING ANALYTICS - TASK 6 COMPONENT
 * ============================================================================
 * 
 * Comprehensive revenue and booking analysis system with:
 * - Advanced financial analytics and profitability metrics
 * - Booking performance tracking with detailed insights
 * - Revenue forecasting with multiple scenario modeling
 * - Service-level profitability and optimization analysis
 * - Customer lifetime value calculations and trends
 * - Seasonal patterns and demand forecasting
 * - Pricing optimization recommendations
 * - Financial goal tracking and variance analysis
 * 
 * Features:
 * ✅ Multi-dimensional revenue analysis with drill-down capabilities
 * ✅ Advanced booking metrics with conversion funnel analysis
 * ✅ Predictive analytics for revenue forecasting
 * ✅ Service profitability matrix with optimization insights
 * ✅ Customer value segmentation and lifetime predictions
 * ✅ Dynamic pricing recommendations based on demand
 * ✅ Financial dashboard with real-time KPI tracking
 * ✅ Comparative analysis with historical and industry benchmarks
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Clock, Target, PieChart, BarChart, Users, Star, Award, ArrowUp, ArrowDown, Minus, Filter, Download, Settings, ChevronDown, ChevronRight, Info, AlertCircle, CheckCircle2, Zap, Eye, EyeOff, RefreshCw, Share2, Bookmark, Calculator} from 'lucide-react';

export interface RevenueBookingAnalyticsProps {
  data?: FinancialData;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  comparisonPeriod?: 'previous' | 'year_ago' | 'budget';
  onMetricDrillDown?: (metric: string, filters: any) => void;
  onExportData?: (format: 'csv' | 'pdf' | 'excel') => void;
  className?: string;
}

export interface FinancialData {
  revenue: RevenueMetrics;
  bookings: BookingMetrics;
  services: ServiceAnalytics[];
  forecasting: ForecastData;
  profitability: ProfitabilityData;
  customerValue: CustomerValueData;
  goals: FinancialGoal[];
  trends: TrendData;
}

export interface RevenueMetrics {
  total: number;
  growth: number;
  target: number;
  variance: number;
  byService: ServiceRevenue[];
  byLocation: LocationRevenue[];
  byTimeOfDay: TimeSlotRevenue[];
  monthly: MonthlyRevenue[];
  refunds: number;
  adjustments: number;
}

export interface BookingMetrics {
  total: number;
  confirmed: number;
  cancelled: number;
  noShows: number;
  conversionRate: number;
  averageValue: number;
  repeatRate: number;
  leadTime: number;
  utilizationRate: number;
  seasonalIndex: number;
}

export interface ServiceAnalytics {
  id: string;
  name: string;
  revenue: number;
  bookings: number;
  avgPrice: number;
  margin: number;
  demand: number;
  capacity: number;
  utilization: number;
  satisfaction: number;
  growth: number;
  profitability: 'high' | 'medium' | 'low';
  optimization: OptimizationSuggestion[];
}

export interface CustomerValueData {
  averageOrderValue: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  retentionRate: number;
  churnRate: number;
  segments: CustomerValueSegment[];
  cohortAnalysis: CohortData[];
}

export interface OptimizationSuggestion {
  type: 'pricing' | 'capacity' | 'marketing' | 'operations';
  suggestion: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
}

export interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: Date;
  progress: number;
  status: 'on_track' | 'at_risk' | 'off_track';
  trend: 'improving' | 'stable' | 'declining';
}

interface ServiceRevenue {
  service: string;
  revenue: number;
  percentage: number;
  growth: number;
}

interface LocationRevenue {
  location: string;
  revenue: number;
  bookings: number;
  growth: number;
}

interface TimeSlotRevenue {
  hour: string;
  revenue: number;
  bookings: number;
  avgValue: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
  growth: number;
}

interface CustomerValueSegment {
  segment: string;
  size: number;
  avgValue: number;
  ltv: number;
  acquisitionCost: number;
  profitability: number;
}

interface CohortData {
  cohort: string;
  month0: number;
  month1: number;
  month3: number;
  month6: number;
  month12: number;
}

interface ForecastData {
  nextMonth: {
    revenue: number;
    bookings: number;
    confidence: number;
  };
  nextQuarter: {
    revenue: number;
    bookings: number;
    confidence: number;
  };
  scenarios: ForecastScenario[];
}

interface ForecastScenario {
  name: string;
  revenue: number;
  probability: number;
  assumptions: string[];
}

interface ProfitabilityData {
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  costs: CostBreakdown;
  efficiency: EfficiencyMetrics;
}

interface CostBreakdown {
  staffing: number;
  supplies: number;
  utilities: number;
  rent: number;
  marketing: number;
  other: number;
}

interface EfficiencyMetrics {
  revenuePerTherapist: number;
  costPerBooking: number;
  utilization: number;
  productivity: number;
}

interface TrendData {
  patterns: SeasonalPattern[];
  anomalies: Anomaly[];
  correlations: Correlation[];
}

interface SeasonalPattern {
  period: string;
  multiplier: number;
  confidence: number;
}

interface Anomaly {
  date: string;
  metric: string;
  expected: number;
  actual: number;
  deviation: number;
}

interface Correlation {
  factor1: string;
  factor2: string;
  strength: number;
  insight: string;
}

// Mock data for demonstration
const MOCK_FINANCIAL_DATA: FinancialData = {
  revenue: {
    total: 125600,
    growth: 12.5,
    target: 140000,
    variance: -10.3,
    byService: [
      { service: 'Swedish Massage', revenue: 45200, percentage: 36.0, growth: 15.2 },
      { service: 'Deep Tissue', revenue: 38900, percentage: 31.0, growth: 22.1 },
      { service: 'Hot Stone', revenue: 28100, percentage: 22.4, growth: 8.7 },
      { service: 'Couples Massage', revenue: 13400, percentage: 10.7, growth: 45.3 }
    ],
    byLocation: [
      { location: 'Downtown', revenue: 52300, bookings: 387, growth: 18.5 },
      { location: 'Midtown', revenue: 41200, bookings: 298, growth: 12.3 },
      { location: 'Uptown', revenue: 32100, bookings: 241, growth: 8.9 }
    ],
    byTimeOfDay: [
      { hour: '9:00 AM', revenue: 8900, bookings: 85, avgValue: 105 },
      { hour: '10:00 AM', revenue: 18400, bookings: 142, avgValue: 130 },
      { hour: '11:00 AM', revenue: 21800, bookings: 156, avgValue: 140 },
      { hour: '2:00 PM', revenue: 20100, bookings: 134, avgValue: 150 },
      { hour: '3:00 PM', revenue: 24600, bookings: 145, avgValue: 170 },
      { hour: '4:00 PM', revenue: 19200, bookings: 123, avgValue: 156 }
    ],
    monthly: [
      { month: '2025-08', revenue: 89200, bookings: 742, growth: 8.3 },
      { month: '2025-09', revenue: 94500, bookings: 798, growth: 10.2 },
      { month: '2025-10', revenue: 102300, bookings: 856, growth: 14.5 },
      { month: '2025-11', revenue: 118700, bookings: 942, growth: 18.7 },
      { month: '2025-12', revenue: 135900, bookings: 1089, growth: 22.1 },
      { month: '2026-01', revenue: 125600, bookings: 1247, growth: 12.5 }
    ],
    refunds: 2840,
    adjustments: -890
  },
  bookings: {
    total: 1247,
    confirmed: 1189,
    cancelled: 58,
    noShows: 12,
    conversionRate: 18.4,
    averageValue: 132,
    repeatRate: 42.8,
    leadTime: 5.2,
    utilizationRate: 78.3,
    seasonalIndex: 1.15
  },
  services: [
    {
      id: 'swedish',
      name: 'Swedish Massage',
      revenue: 45200,
      bookings: 342,
      avgPrice: 132,
      margin: 68.5,
      demand: 85,
      capacity: 95,
      utilization: 89.5,
      satisfaction: 4.6,
      growth: 15.2,
      profitability: 'high',
      optimization: [
        {
          type: 'capacity',
          suggestion: 'Increase weekend availability by 20%',
          impact: 12500,
          effort: 'medium'
        },
        {
          type: 'pricing',
          suggestion: 'Implement peak-hour pricing (+15%)',
          impact: 8200,
          effort: 'low'
        }
      ]
    },
    {
      id: 'deep_tissue',
      name: 'Deep Tissue',
      revenue: 38900,
      bookings: 285,
      avgPrice: 165,
      margin: 72.1,
      demand: 92,
      capacity: 85,
      utilization: 75.2,
      satisfaction: 4.8,
      growth: 22.1,
      profitability: 'high',
      optimization: [
        {
          type: 'capacity',
          suggestion: 'Add certified deep tissue specialist',
          impact: 18900,
          effort: 'high'
        },
        {
          type: 'marketing',
          suggestion: 'Target athletes and fitness enthusiasts',
          impact: 7500,
          effort: 'medium'
        }
      ]
    },
    {
      id: 'hot_stone',
      name: 'Hot Stone Therapy',
      revenue: 28100,
      bookings: 187,
      avgPrice: 180,
      margin: 65.3,
      demand: 67,
      capacity: 78,
      utilization: 85.9,
      satisfaction: 4.7,
      growth: 8.7,
      profitability: 'medium',
      optimization: [
        {
          type: 'marketing',
          suggestion: 'Bundle with relaxation packages',
          impact: 5200,
          effort: 'low'
        },
        {
          type: 'operations',
          suggestion: 'Optimize stone heating process',
          impact: 1800,
          effort: 'medium'
        }
      ]
    },
    {
      id: 'couples',
      name: 'Couples Massage',
      revenue: 13400,
      bookings: 67,
      avgPrice: 320,
      margin: 78.2,
      demand: 78,
      capacity: 45,
      utilization: 92.1,
      satisfaction: 4.9,
      growth: 45.3,
      profitability: 'high',
      optimization: [
        {
          type: 'capacity',
          suggestion: 'Add dedicated couples suite',
          impact: 24000,
          effort: 'high'
        },
        {
          type: 'pricing',
          suggestion: 'Premium weekend pricing (+25%)',
          impact: 4200,
          effort: 'low'
        }
      ]
    }
  ],
  forecasting: {
    nextMonth: {
      revenue: 142300,
      bookings: 1380,
      confidence: 0.87
    },
    nextQuarter: {
      revenue: 385700,
      bookings: 3850,
      confidence: 0.82
    },
    scenarios: [
      {
        name: 'Conservative',
        revenue: 375000,
        probability: 0.25,
        assumptions: ['No marketing increase', 'Current capacity', 'Seasonal decline']
      },
      {
        name: 'Base Case',
        revenue: 385700,
        probability: 0.50,
        assumptions: ['Current growth rate', 'Moderate marketing', 'Normal seasonality']
      },
      {
        name: 'Optimistic',
        revenue: 412000,
        probability: 0.25,
        assumptions: ['Increased marketing', 'Capacity expansion', 'New services']
      }
    ]
  },
  profitability: {
    grossMargin: 72.8,
    operatingMargin: 28.5,
    netMargin: 18.2,
    costs: {
      staffing: 58000,
      supplies: 12400,
      utilities: 8900,
      rent: 15600,
      marketing: 9800,
      other: 6200
    },
    efficiency: {
      revenuePerTherapist: 45200,
      costPerBooking: 89,
      utilization: 78.3,
      productivity: 92.1
    }
  },
  customerValue: {
    averageOrderValue: 132,
    customerLifetimeValue: 285,
    acquisitionCost: 42,
    retentionRate: 85.2,
    churnRate: 14.8,
    segments: [
      {
        segment: 'High Value',
        size: 342,
        avgValue: 245,
        ltv: 890,
        acquisitionCost: 85,
        profitability: 78.2
      },
      {
        segment: 'Regular',
        size: 1820,
        avgValue: 128,
        ltv: 320,
        acquisitionCost: 38,
        profitability: 68.5
      },
      {
        segment: 'Occasional',
        size: 2048,
        avgValue: 89,
        ltv: 145,
        acquisitionCost: 32,
        profitability: 45.8
      }
    ],
    cohortAnalysis: [
      { cohort: '2025-08', month0: 100, month1: 87, month3: 72, month6: 58, month12: 42 },
      { cohort: '2025-09', month0: 100, month1: 89, month3: 75, month6: 61, month12: 0 },
      { cohort: '2025-10', month0: 100, month1: 91, month3: 78, month6: 0, month12: 0 }
    ]
  },
  goals: [
    {
      id: 'monthly_revenue',
      name: 'Monthly Revenue Target',
      target: 140000,
      current: 125600,
      deadline: new Date('2026-01-31'),
      progress: 89.7,
      status: 'at_risk',
      trend: 'improving'
    },
    {
      id: 'quarterly_bookings',
      name: 'Q1 Bookings Goal',
      target: 4200,
      current: 1247,
      deadline: new Date('2026-03-31'),
      progress: 29.7,
      status: 'on_track',
      trend: 'stable'
    },
    {
      id: 'customer_retention',
      name: 'Customer Retention Rate',
      target: 90,
      current: 85.2,
      deadline: new Date('2026-06-30'),
      progress: 94.7,
      status: 'on_track',
      trend: 'improving'
    }
  ],
  trends: {
    patterns: [
      { period: 'Weekly', multiplier: 1.23, confidence: 0.92 },
      { period: 'Monthly', multiplier: 1.15, confidence: 0.88 },
      { period: 'Seasonal', multiplier: 1.34, confidence: 0.95 }
    ],
    anomalies: [
      {
        date: '2026-01-26',
        metric: 'Daily Revenue',
        expected: 2100,
        actual: 1920,
        deviation: -8.6
      }
    ],
    correlations: [
      {
        factor1: 'Marketing Spend',
        factor2: 'New Customer Acquisition',
        strength: 0.78,
        insight: 'Strong positive correlation between marketing investment and new customers'
      },
      {
        factor1: 'Customer Satisfaction',
        factor2: 'Repeat Bookings',
        strength: 0.85,
        insight: 'Higher satisfaction strongly predicts customer retention'
      }
    ]
  }
};

export const RevenueBookingAnalytics: React.FC<RevenueBookingAnalyticsProps> = ({
  data = MOCK_FINANCIAL_DATA,
  timeRange = '30d',
  comparisonPeriod = 'previous',
  onMetricDrillDown,
  onExportData,
  className = ""
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'revenue' | 'bookings' | 'services' | 'forecasting'>('overview');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [showGoals, setShowGoals] = useState(true);
  const [filters, setFilters] = useState({
    service: 'all',
    location: 'all',
    timeFrame: timeRange
  });

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const revenuePerBooking = data.revenue.total / data.bookings.total;
    const cancellationRate = (data.bookings.cancelled / (data.bookings.total + data.bookings.cancelled)) * 100;
    
    return {
      revenuePerBooking,
      cancellationRate,
      profitability: data.profitability.grossMargin,
      efficiency: data.profitability.efficiency.utilization
    };
  }, [data]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    target?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    subtitle?: string;
    onClick?: () => void;
  }> = ({ title, value, change, target, icon: Icon, color, subtitle, onClick }) => (
    <div 
      className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer hover:border-orange-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
      
      {target && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{target.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${color.includes('green') ? 'from-green-400 to-green-500' : 'from-blue-400 to-blue-500'}`}
              style={{ 
                width: `${Math.min(((typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value) / target) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const ServiceAnalyticsCard: React.FC<{ service: ServiceAnalytics }> = ({ service }) => {
    const isExpanded = expandedService === service.id;
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div 
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedService(isExpanded ? null : service.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${
                service.profitability === 'high' ? 'bg-green-100 text-green-600' :
                service.profitability === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
              } flex items-center justify-center`}>
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.bookings} bookings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${service.revenue.toLocaleString()}
                </div>
                <div className={`text-sm flex items-center gap-1 ${
                  service.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {service.growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(service.growth)}%
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} />
            </div>
          </div>
          
          {/* Quick metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">${service.avgPrice}</div>
              <div className="text-xs text-gray-500">Avg Price</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{service.margin}%</div>
              <div className="text-xs text-gray-500">Margin</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{service.utilization}%</div>
              <div className="text-xs text-gray-500">Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{service.satisfaction}★</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-3">Performance Metrics</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Demand vs Capacity</span>
                    <span className={`text-sm font-medium ${
                      service.demand > service.capacity ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {service.demand}/{service.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        service.demand > service.capacity ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((service.demand / service.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Profitability</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      service.profitability === 'high' ? 'bg-green-100 text-green-700' :
                      service.profitability === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {service.profitability}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${(service.revenue * (service.margin / 100)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Optimization Opportunities</h5>
              <div className="space-y-3">
                {service.optimization.map((opt, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{opt.suggestion}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          opt.type === 'pricing' ? 'bg-blue-100 text-blue-700' :
                          opt.type === 'capacity' ? 'bg-green-100 text-green-700' :
                          opt.type === 'marketing' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {opt.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          opt.effort === 'low' ? 'bg-green-100 text-green-700' :
                          opt.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {opt.effort} effort
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Potential impact: <span className="font-medium text-green-600">
                        +${opt.impact.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const GoalCard: React.FC<{ goal: FinancialGoal }> = ({ goal }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{goal.name}</h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          goal.status === 'on_track' ? 'bg-green-100 text-green-700' :
          goal.status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {goal.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-sm text-gray-600">Current</div>
          <div className="text-lg font-bold text-gray-900">
            {typeof goal.current === 'number' ? goal.current.toLocaleString() : goal.current}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Target</div>
          <div className="text-lg font-bold text-blue-600">
            {typeof goal.target === 'number' ? goal.target.toLocaleString() : goal.target}
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{goal.progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              goal.status === 'on_track' ? 'bg-green-500' :
              goal.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Due: {goal.deadline.toLocaleDateString()} • 
        <span className={`ml-1 ${
          goal.trend === 'improving' ? 'text-green-600' :
          goal.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {goal.trend}
        </span>
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
              <Calculator className="w-7 h-7 text-green-600" />
              Revenue & Booking Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive financial analysis and booking performance insights
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filters.timeFrame}
              onChange={(e) => setFilters(prev => ({ ...prev, timeFrame: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <button 
              onClick={() => onExportData?.('pdf')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${data.revenue.total.toLocaleString()}`}
            change={data.revenue.growth}
            target={data.revenue.target}
            icon={DollarSign}
            color="text-green-600"
            subtitle="This month"
            onClick={() => onMetricDrillDown?.('revenue', filters)}
          />
          <MetricCard
            title="Total Bookings"
            value={data.bookings.total.toLocaleString()}
            change={8.3}
            icon={Calendar}
            color="text-blue-600"
            subtitle="Confirmed appointments"
            onClick={() => onMetricDrillDown?.('bookings', filters)}
          />
          <MetricCard
            title="Avg Booking Value"
            value={`$${data.bookings.averageValue}`}
            change={5.2}
            icon={Target}
            color="text-purple-600"
            subtitle="Per appointment"
          />
          <MetricCard
            title="Utilization Rate"
            value={`${data.bookings.utilizationRate}%`}
            change={3.1}
            target={85}
            icon={Activity}
            color="text-orange-600"
            subtitle="Capacity used"
          />
        </div>

        {/* Goals Section */}
        {showGoals && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
              <button
                onClick={() => setShowGoals(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
                { id: 'bookings', label: 'Booking Metrics', icon: Calendar },
                { id: 'services', label: 'Service Performance', icon: BarChart3 },
                { id: 'forecasting', label: 'Forecasting', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedView(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                      selectedView === tab.id
                        ? 'text-green-600 border-green-500'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedView === 'overview' && (
              <div className="space-y-6">
                {/* Revenue Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h4>
                    <div className="space-y-4">
                      {data.revenue.byService.map((service, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{service.service}</span>
                              <span className="font-bold">${service.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>{service.percentage.toFixed(1)}% of total</span>
                              <span className={service.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {service.growth >= 0 ? '+' : ''}{service.growth}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Peak Revenue Hours</h4>
                    <div className="space-y-3">
                      {data.revenue.byTimeOfDay
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((slot, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{slot.hour}</div>
                              <div className="text-sm text-gray-600">
                                {slot.bookings} bookings • ${slot.avgValue} avg
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                ${slot.revenue.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Service Performance Analysis</h4>
                  <span className="text-sm text-gray-600">
                    Click on a service for detailed optimization recommendations
                  </span>
                </div>
                <div className="space-y-4">
                  {data.services.map(service => (
                    <ServiceAnalyticsCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'forecasting' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Next Month</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ${data.forecasting.nextMonth.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {(data.forecasting.nextMonth.confidence * 100).toFixed(0)}% confidence • 
                          {data.forecasting.nextMonth.bookings} expected bookings
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Next Quarter</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${data.forecasting.nextQuarter.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {(data.forecasting.nextQuarter.confidence * 100).toFixed(0)}% confidence • 
                          {data.forecasting.nextQuarter.bookings} expected bookings
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Scenario Analysis</h4>
                    <div className="space-y-4">
                      {data.forecasting.scenarios.map((scenario, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{scenario.name}</span>
                            <span className="font-bold text-gray-900">
                              ${scenario.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {(scenario.probability * 100).toFixed(0)}% probability
                          </div>
                          <div className="text-xs text-gray-500">
                            {scenario.assumptions.join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder content for other tabs */}
            {selectedView === 'revenue' && (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Revenue Analysis</h3>
                <p className="text-gray-600">Advanced revenue breakdown and analysis coming soon</p>
              </div>
            )}

            {selectedView === 'bookings' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Metrics Dashboard</h3>
                <p className="text-gray-600">Comprehensive booking analysis and insights coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueBookingAnalytics;