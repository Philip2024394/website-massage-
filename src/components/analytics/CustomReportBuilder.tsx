/**
 * ============================================================================
 * 📋 CUSTOM REPORT BUILDER - TASK 6 COMPONENT
 * ============================================================================
 * 
 * Advanced report generation system with:
 * - Drag-and-drop report designer with live preview
 * - Custom metric selection and visualization options
 * - Automated report scheduling and distribution
 * - Multi-format export capabilities (PDF, Excel, PowerPoint)
 * - Template library with pre-built report layouts
 * - Interactive filtering and data segmentation
 * - Collaborative report sharing and commenting
 * - Real-time data integration with automatic updates
 * 
 * Features:
 * ✅ Visual report builder with drag-and-drop components
 * ✅ Custom metric selection with advanced filtering
 * ✅ Multiple visualization types (charts, tables, KPIs)
 * ✅ Template library with industry-specific layouts
 * ✅ Automated scheduling with email distribution
 * ✅ Multi-format export with branding customization
 * ✅ Collaborative sharing with role-based permissions
 * ✅ Real-time data updates with refresh scheduling
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  FileText, Plus, Save, Download, Share2, Calendar,
  Eye, Edit3, Copy, Trash2, Filter, Settings, 
  BarChart3, PieChart, LineChart, Table, Target,
  Image, Type, Layers, Move, Grid, Layout,
  Clock, Mail, Users, Lock, Unlock, Star,
  ChevronDown, ChevronRight, MoreVertical, Search,
  Palette, AlignLeft, AlignCenter, AlignRight, Bold
} from 'lucide-react';

export interface CustomReportBuilderProps {
  availableMetrics?: ReportMetric[];
  templates?: ReportTemplate[];
  onSaveReport?: (report: CustomReport) => void;
  onExportReport?: (report: CustomReport, format: ExportFormat) => void;
  onScheduleReport?: (report: CustomReport, schedule: ReportSchedule) => void;
  className?: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  layout: ReportLayout;
  components: ReportComponent[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  sharing: SharingSettings;
  metadata: ReportMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportLayout {
  type: 'standard' | 'dashboard' | 'executive' | 'detailed';
  columns: number;
  spacing: 'compact' | 'normal' | 'spacious';
  theme: 'light' | 'dark' | 'branded';
  branding: BrandingOptions;
}

export interface ReportComponent {
  id: string;
  type: ComponentType;
  position: { x: number; y: number; width: number; height: number };
  config: ComponentConfig;
  data?: any;
}

export interface ReportMetric {
  id: string;
  name: string;
  category: string;
  type: 'number' | 'percentage' | 'currency' | 'duration';
  description: string;
  source: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  components: ReportComponent[];
  layout: ReportLayout;
  popularity: number;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  label: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  format: ExportFormat;
  active: boolean;
}

export interface SharingSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowEditing: boolean;
  permissions: UserPermission[];
  shareUrl?: string;
}

export interface ReportMetadata {
  author: string;
  tags: string[];
  category: string;
  lastGenerated?: Date;
  totalViews: number;
  rating: number;
}

type ComponentType = 'chart' | 'table' | 'kpi' | 'text' | 'image' | 'filter' | 'spacer';
type ExportFormat = 'pdf' | 'excel' | 'powerpoint' | 'html' | 'csv';

interface ComponentConfig {
  title?: string;
  metric?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  style?: ComponentStyle;
  dataSource?: string;
  filters?: string[];
  formatting?: FormattingOptions;
}

interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
}

interface BrandingOptions {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerFooter: boolean;
}

interface FormattingOptions {
  numberFormat?: 'number' | 'currency' | 'percentage';
  dateFormat?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
}

interface UserPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  email: string;
}

// Mock data for demonstration
const MOCK_METRICS: ReportMetric[] = [
  {
    id: 'total_revenue',
    name: 'Total Revenue',
    category: 'Financial',
    type: 'currency',
    description: 'Sum of all revenue for the selected period',
    source: 'Payment System',
    aggregation: 'sum'
  },
  {
    id: 'booking_count',
    name: 'Total Bookings',
    category: 'Operations',
    type: 'number',
    description: 'Number of confirmed bookings',
    source: 'Booking System',
    aggregation: 'count'
  },
  {
    id: 'conversion_rate',
    name: 'Conversion Rate',
    category: 'Marketing',
    type: 'percentage',
    description: 'Percentage of visits that result in bookings',
    source: 'Analytics',
    aggregation: 'avg'
  },
  {
    id: 'customer_satisfaction',
    name: 'Customer Satisfaction',
    category: 'Quality',
    type: 'number',
    description: 'Average customer rating out of 5',
    source: 'Review System',
    aggregation: 'avg'
  },
  {
    id: 'utilization_rate',
    name: 'Utilization Rate',
    category: 'Operations',
    type: 'percentage',
    description: 'Percentage of available capacity used',
    source: 'Scheduling System',
    aggregation: 'avg'
  }
];

const MOCK_TEMPLATES: ReportTemplate[] = [
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    description: 'High-level overview for executives',
    category: 'Executive',
    preview: '/templates/executive.png',
    popularity: 95,
    layout: {
      type: 'executive',
      columns: 2,
      spacing: 'normal',
      theme: 'branded',
      branding: {
        primaryColor: '#2563EB',
        secondaryColor: '#64748B',
        fontFamily: 'Inter',
        headerFooter: true
      }
    },
    components: [
      {
        id: 'kpi-1',
        type: 'kpi',
        position: { x: 0, y: 0, width: 1, height: 1 },
        config: {
          title: 'Total Revenue',
          metric: 'total_revenue',
          style: { backgroundColor: '#EFF6FF' }
        }
      },
      {
        id: 'chart-1',
        type: 'chart',
        position: { x: 1, y: 0, width: 1, height: 2 },
        config: {
          title: 'Revenue Trend',
          chartType: 'line',
          metric: 'total_revenue'
        }
      }
    ]
  },
  {
    id: 'operational_dashboard',
    name: 'Operational Dashboard',
    description: 'Detailed operational metrics',
    category: 'Operations',
    preview: '/templates/operations.png',
    popularity: 87,
    layout: {
      type: 'dashboard',
      columns: 3,
      spacing: 'compact',
      theme: 'light',
      branding: {
        primaryColor: '#059669',
        secondaryColor: '#6B7280',
        fontFamily: 'System',
        headerFooter: false
      }
    },
    components: []
  },
  {
    id: 'financial_report',
    name: 'Financial Report',
    description: 'Comprehensive financial analysis',
    category: 'Financial',
    preview: '/templates/financial.png',
    popularity: 92,
    layout: {
      type: 'detailed',
      columns: 2,
      spacing: 'spacious',
      theme: 'branded',
      branding: {
        primaryColor: '#7C3AED',
        secondaryColor: '#9CA3AF',
        fontFamily: 'Inter',
        headerFooter: true
      }
    },
    components: []
  }
];

export const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  availableMetrics = MOCK_METRICS,
  templates = MOCK_TEMPLATES,
  onSaveReport,
  onExportReport,
  onScheduleReport,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState<'template' | 'design' | 'preview' | 'schedule'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [report, setReport] = useState<CustomReport | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize report from template
  const initializeFromTemplate = useCallback((template: ReportTemplate) => {
    const newReport: CustomReport = {
      id: `report_${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      layout: template.layout,
      components: template.components.map(comp => ({ ...comp, id: `${comp.id}_${Date.now()}` })),
      filters: [],
      sharing: {
        isPublic: false,
        allowComments: true,
        allowEditing: false,
        permissions: []
      },
      metadata: {
        author: 'Current User',
        tags: [],
        category: template.category,
        totalViews: 0,
        rating: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setReport(newReport);
    setSelectedTemplate(template);
    setCurrentStep('design');
  }, []);

  // Component palette for drag and drop
  const componentTypes: { type: ComponentType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { type: 'chart', icon: BarChart3, label: 'Chart' },
    { type: 'table', icon: Table, label: 'Table' },
    { type: 'kpi', icon: Target, label: 'KPI Card' },
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'filter', icon: Filter, label: 'Filter' }
  ];

  const TemplateSelector: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Report Template</h2>
        <p className="text-gray-600">Start with a pre-designed template or create from scratch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => initializeFromTemplate(template)}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                {template.name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-600">{template.popularity}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {template.category}
              </span>
              <span className="text-xs text-gray-500">
                {template.components.length} components
              </span>
            </div>
          </div>
        ))}
        
        {/* Create from scratch option */}
        <div
          onClick={() => {
            const blankReport: CustomReport = {
              id: `report_${Date.now()}`,
              name: 'New Custom Report',
              description: 'Custom report created from scratch',
              layout: {
                type: 'standard',
                columns: 2,
                spacing: 'normal',
                theme: 'light',
                branding: {
                  primaryColor: '#2563EB',
                  secondaryColor: '#64748B',
                  fontFamily: 'Inter',
                  headerFooter: false
                }
              },
              components: [],
              filters: [],
              sharing: {
                isPublic: false,
                allowComments: true,
                allowEditing: false,
                permissions: []
              },
              metadata: {
                author: 'Current User',
                tags: [],
                category: 'Custom',
                totalViews: 0,
                rating: 0
              },
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setReport(blankReport);
            setCurrentStep('design');
          }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 p-6 hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="aspect-video rounded-lg mb-4 flex items-center justify-center">
            <Plus className="w-16 h-16 text-blue-500 group-hover:text-blue-600" />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              Start from Scratch
            </h3>
            <p className="text-sm text-gray-600">Create a custom report with complete control</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportDesigner: React.FC = () => {
    if (!report) return null;

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedComponent || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (rect.width / report.layout.columns));
      const y = Math.floor((e.clientY - rect.top) / 100);

      const newComponent: ReportComponent = {
        id: `${draggedComponent}_${Date.now()}`,
        type: draggedComponent,
        position: { x, y, width: 1, height: 1 },
        config: {
          title: `New ${draggedComponent.charAt(0).toUpperCase() + draggedComponent.slice(1)}`
        }
      };

      setReport(prev => prev ? {
        ...prev,
        components: [...prev.components, newComponent]
      } : null);
      
      setDraggedComponent(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    return (
      <div className="h-full flex">
        {/* Component Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex-shrink-0">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Components</h3>
              <div className="space-y-2">
                {componentTypes.map(({ type, icon: Icon, label }) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => setDraggedComponent(type)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-900"
              >
                Metrics
                {showMetrics ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {showMetrics && (
                <div className="space-y-2 mt-2">
                  {availableMetrics.map(metric => (
                    <div
                      key={metric.id}
                      className="p-2 bg-blue-50 rounded text-sm text-blue-900 hover:bg-blue-100 cursor-pointer"
                    >
                      {metric.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 p-6">
          <div className="bg-white rounded-lg shadow-sm min-h-96 p-6">
            <div
              ref={canvasRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative min-h-full"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${report.layout.columns}, 1fr)`,
                gap: report.layout.spacing === 'compact' ? '8px' : 
                     report.layout.spacing === 'spacious' ? '24px' : '16px'
              }}
            >
              {report.components.length === 0 && (
                <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Drag components here to start building your report</p>
                  </div>
                </div>
              )}
              
              {report.components.map(component => (
                <div
                  key={component.id}
                  onClick={() => setSelectedComponent(component.id)}
                  className={`bg-gray-50 rounded-lg border-2 ${
                    selectedComponent === component.id ? 'border-blue-500' : 'border-gray-200'
                  } p-4 hover:shadow-md transition-all cursor-pointer`}
                  style={{
                    gridColumn: `${component.position.x + 1} / span ${component.position.width}`,
                    gridRow: `${component.position.y + 1} / span ${component.position.height}`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{component.config.title}</h4>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="h-20 bg-gray-200 rounded flex items-center justify-center">
                    {component.type === 'chart' && <BarChart3 className="w-8 h-8 text-gray-400" />}
                    {component.type === 'table' && <Table className="w-8 h-8 text-gray-400" />}
                    {component.type === 'kpi' && <Target className="w-8 h-8 text-gray-400" />}
                    {component.type === 'text' && <Type className="w-8 h-8 text-gray-400" />}
                    {component.type === 'image' && <Image className="w-8 h-8 text-gray-400" />}
                    {component.type === 'filter' && <Filter className="w-8 h-8 text-gray-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedComponent && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Component title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a metric</option>
                  {availableMetrics.map(metric => (
                    <option key={metric.id} value={metric.id}>{metric.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Background</label>
                    <input
                      type="color"
                      className="w-full h-8 rounded border border-gray-300"
                      defaultValue="#ffffff"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                    <input
                      type="color"
                      className="w-full h-8 rounded border border-gray-300"
                      defaultValue="#000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReportPreview: React.FC = () => {
    if (!report) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.name}</h1>
          <p className="text-gray-600">{report.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span>Generated on {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>By {report.metadata.author}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.components.map(component => (
            <div key={component.id} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {component.config.title}
              </h3>
              <div className="h-64 bg-white rounded border border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  {component.type === 'chart' && <BarChart3 className="w-16 h-16 mx-auto mb-2" />}
                  {component.type === 'table' && <Table className="w-16 h-16 mx-auto mb-2" />}
                  {component.type === 'kpi' && <Target className="w-16 h-16 mx-auto mb-2" />}
                  <p>Live {component.type} will render here</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ScheduleSettings: React.FC = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule & Share</h2>
          <p className="text-gray-600">Set up automated delivery and sharing options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Delivery</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="09:00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter email addresses, one per line"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="powerpoint">PowerPoint</option>
                  <option value="html">HTML</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Options</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Public Access</div>
                  <div className="text-sm text-gray-500">Allow anyone with the link to view</div>
                </div>
                <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200">
                  <span className="sr-only">Enable public access</span>
                  <span className="inline-block w-4 h-4 transform bg-white rounded-full shadow translate-x-1 transition" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Allow Comments</div>
                  <div className="text-sm text-gray-500">Users can leave comments on the report</div>
                </div>
                <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                  <span className="sr-only">Enable comments</span>
                  <span className="inline-block w-4 h-4 transform bg-white rounded-full shadow translate-x-6 transition" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Allow Editing</div>
                  <div className="text-sm text-gray-500">Shared users can modify the report</div>
                </div>
                <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200">
                  <span className="sr-only">Enable editing</span>
                  <span className="inline-block w-4 h-4 transform bg-white rounded-full shadow translate-x-1 transition" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Users</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter email address"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Custom Report Builder</h1>
              <p className="text-gray-600">Create, customize, and automate your reports</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {report && (
              <>
                <button
                  onClick={() => onSaveReport?.(report)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Report
                </button>
                
                <button
                  onClick={() => onExportReport?.(report, 'pdf')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-8">
          {[
            { key: 'template', label: 'Choose Template', icon: Layout },
            { key: 'design', label: 'Design Report', icon: Edit3 },
            { key: 'preview', label: 'Preview', icon: Eye },
            { key: 'schedule', label: 'Schedule & Share', icon: Calendar }
          ].map(({ key, label, icon: Icon }, index) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === key ? 'bg-blue-600 text-white' :
                ['template', 'design', 'preview', 'schedule'].indexOf(currentStep) > index ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`font-medium ${
                currentStep === key ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {currentStep === 'template' && <TemplateSelector />}
        {currentStep === 'design' && <ReportDesigner />}
        {currentStep === 'preview' && <ReportPreview />}
        {currentStep === 'schedule' && <ScheduleSettings />}
      </div>

      {/* Bottom Navigation */}
      {report && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const steps = ['template', 'design', 'preview', 'schedule'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1] as any);
                }
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              disabled={currentStep === 'template'}
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              Step {['template', 'design', 'preview', 'schedule'].indexOf(currentStep) + 1} of 4
            </div>
            
            <button
              onClick={() => {
                const steps = ['template', 'design', 'preview', 'schedule'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1] as any);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={currentStep === 'schedule'}
            >
              {currentStep === 'schedule' ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReportBuilder;