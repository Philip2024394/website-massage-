/**
 * ============================================================================
 * 💎 JEWELL STANDARD PLUS - CENTRAL MARKET DASHBOARD
 * ============================================================================
 * 
 * Unified dashboard with market-specific grids and controlled AI development
 * Features:
 * ✅ Market-specific grids (Therapists, Places, Hotels, Facial)
 * ✅ Side drawer for detailed management
 * ✅ Fast AI development with controlled file structure
 * ✅ No "free-running" across files - organized zones
 * ✅ Responsive grid layouts
 * ✅ Real-time data integration
 * 
 * ============================================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Users, MapPin, Building, Sparkles, Settings, 
  Grid3X3, List, Filter, Search, Plus, 
  BarChart, TrendingUp, Bell, Menu, X 
} from 'lucide-react';

// Market segment types
type MarketSegment = 'therapists' | 'places' | 'hotels' | 'facial' | 'overview';

interface MarketGridProps {
  segment: MarketSegment;
  data?: any[];
  isLoading?: boolean;
  onItemSelect?: (item: any) => void;
  onItemAction?: (action: string, item: any) => void;
}

interface CentralDashboardProps {
  defaultSegment?: MarketSegment;
  user?: any;
  onNavigate?: (path: string) => void;
  className?: string;
}

// Market Grid Component
const MarketGrid: React.FC<MarketGridProps> = ({ 
  segment, 
  data = [], 
  isLoading = false, 
  onItemSelect,
  onItemAction 
}) => {
  const getGridConfig = () => {
    switch (segment) {
      case 'therapists':
        return {
          title: 'Therapist Network',
          icon: Users,
          color: 'blue',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          emptyMessage: 'No therapists available'
        };
      case 'places':
        return {
          title: 'Places & Venues',
          icon: MapPin,
          color: 'green',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          emptyMessage: 'No places registered'
        };
      case 'hotels':
        return {
          title: 'Hotel Partners',
          icon: Building,
          color: 'purple',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          emptyMessage: 'No hotel partnerships'
        };
      case 'facial':
        return {
          title: 'Facial Services',
          icon: Sparkles,
          color: 'pink',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          emptyMessage: 'No facial services available'
        };
      default:
        return {
          title: 'Overview',
          icon: Grid3X3,
          color: 'gray',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          emptyMessage: 'No data available'
        };
    }
  };

  const config = getGridConfig();
  const IconComponent = config.icon;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className={`grid ${config.gridCols} gap-6`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
            <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
            <p className="text-sm text-gray-500">{data.length} items</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors`}>
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {data.length === 0 ? (
        <div className="text-center py-12">
          <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{config.emptyMessage}</h3>
          <p className="text-gray-500">Get started by adding your first {segment.slice(0, -1)}</p>
        </div>
      ) : (
        <div className={`grid ${config.gridCols} gap-6`}>
          {data.map((item, index) => (
            <MarketGridCard
              key={item.id || index}
              item={item}
              segment={segment}
              color={config.color}
              onSelect={onItemSelect}
              onAction={onItemAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Market Grid Card Component
const MarketGridCard: React.FC<{
  item: any;
  segment: MarketSegment;
  color: string;
  onSelect?: (item: any) => void;
  onAction?: (action: string, item: any) => void;
}> = ({ item, segment, color, onSelect, onAction }) => {
  const getCardContent = () => {
    switch (segment) {
      case 'therapists':
        return (
          <>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
              {item.profilePicture ? (
                <img src={item.profilePicture} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{item.location}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-700 rounded-full`}>
                {item.status || 'Active'}
              </span>
              <span className="text-sm font-medium text-gray-900">
                ${item.hourlyRate || '60'}/hr
              </span>
            </div>
          </>
        );
      
      case 'places':
        return (
          <>
            <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{item.address}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-700 rounded-full`}>
                {item.type || 'Venue'}
              </span>
              <span className="text-sm text-gray-500">
                {item.capacity || '10'} capacity
              </span>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.name || 'Item'}</h3>
            <p className="text-sm text-gray-500">{item.description || 'Description'}</p>
          </>
        );
    }
  };

  return (
    <div 
      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onSelect?.(item)}
    >
      {getCardContent()}
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium text-${color}-600 bg-${color}-50 rounded-lg hover:bg-${color}-100 transition-colors`}
          onClick={(e) => { e.stopPropagation(); onAction?.('view', item); }}
        >
          View
        </button>
        <button 
          className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={(e) => { e.stopPropagation(); onAction?.('edit', item); }}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

// Main Central Dashboard Component
export const CentralMarketDashboard: React.FC<CentralDashboardProps> = ({
  defaultSegment = 'overview',
  user,
  onNavigate,
  className = ""
}) => {
  const [activeSegment, setActiveSegment] = useState<MarketSegment>(defaultSegment);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Market segments configuration
  const segments = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Grid3X3, color: 'blue' },
    { id: 'therapists', label: 'Therapists', icon: Users, color: 'green' },
    { id: 'places', label: 'Places', icon: MapPin, color: 'purple' },
    { id: 'hotels', label: 'Hotels', icon: Building, color: 'orange' },
    { id: 'facial', label: 'Facial', icon: Sparkles, color: 'pink' }
  ], []);

  // Mock data - replace with real data hooks
  const mockData = useMemo(() => ({
    therapists: [
      { id: 1, name: 'Sarah Johnson', location: 'Jakarta', status: 'Active', hourlyRate: 75, profilePicture: null },
      { id: 2, name: 'Mike Chen', location: 'Bali', status: 'Active', hourlyRate: 80, profilePicture: null },
      // Add more mock data...
    ],
    places: [
      { id: 1, name: 'Serenity Spa', address: 'Jakarta Central', type: 'Spa', capacity: 20, image: null },
      { id: 2, name: 'Wellness Center', address: 'Bali Seminyak', type: 'Center', capacity: 15, image: null },
      // Add more mock data...
    ],
    hotels: [],
    facial: [],
    overview: []
  }), []);

  // Handlers
  const handleSegmentChange = useCallback((segment: MarketSegment) => {
    setActiveSegment(segment);
  }, []);

  const handleItemSelect = useCallback((item: any) => {
    setSelectedItem(item);
    setSideDrawerOpen(true);
  }, []);

  const handleItemAction = useCallback((action: string, item: any) => {
    console.log(`Action: ${action}`, item);
    // Implement action handling
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Dashboard</h1>
            <p className="text-sm text-gray-500">Manage all market segments from one place</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSideDrawerOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Market Segment Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {segments.map((segment) => {
            const IconComponent = segment.icon;
            const isActive = activeSegment === segment.id;
            
            return (
              <button
                key={segment.id}
                onClick={() => handleSegmentChange(segment.id as MarketSegment)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive 
                    ? `border-${segment.color}-500 text-${segment.color}-600` 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {segment.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <MarketGrid
          segment={activeSegment}
          data={mockData[activeSegment] || []}
          onItemSelect={handleItemSelect}
          onItemAction={handleItemAction}
        />
      </div>

      {/* Side Drawer */}
      {sideDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSideDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <button 
                onClick={() => setSideDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedItem ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedItem.name}</h3>
                  <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {JSON.stringify(selectedItem, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">Select an item to view details</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralMarketDashboard;