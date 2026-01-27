/**
 * 🎁 SEND DISCOUNT PAGE
 * 
 * Allows therapists to send promotional discount codes to past customers.
 * Lists recent customers with chat history for easy selection.
 */

import React, { useState, useEffect } from 'react';
import { Gift, Search, User, MessageCircle, Clock, Plus, TrendingUp, Users, Percent, CheckCircle, Filter, SortAsc } from 'lucide-react';
import { databases, Query } from '../../../../src/lib/appwrite';
import { APPWRITE_CONFIG } from '../../../../src/lib/appwrite.config';
import SendDiscountModal from '../../../../src/components/SendDiscountModal';

interface Customer {
  id: string;
  name: string;
  lastBookingDate: string;
  totalBookings: number;
  hasActiveDiscount?: boolean;
}

interface SendDiscountPageProps {
  therapist: any;
  language: 'en' | 'id';
}

const SendDiscountPage: React.FC<SendDiscountPageProps> = ({ therapist, language }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    totalDiscountsSent: 0,
    activeDiscounts: 0,
    usedDiscounts: 0,
    successRate: 0
  });
  
  // Filter & Sort state
  const [filterType, setFilterType] = useState<'all' | 'active' | 'no-discount'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'bookings'>('recent');

  const t = {
    en: {
      title: 'Send Discount',
      subtitle: 'Reward your customers with promotional discounts',
      searchPlaceholder: 'Search customers...',
      recentCustomers: 'Recent Customers',
      noCustomers: 'No customers found',
      noCustomersSubtext: 'Customers from your bookings will appear here',
      lastBooking: 'Last booking',
      totalBookings: 'bookings',
      sendDiscount: 'Send Discount',
      hasDiscount: 'Has active discount',
      loading: 'Loading customers...',
      // Stats
      totalSent: 'Total Sent',
      activeNow: 'Active Now',
      usedDiscounts: 'Used',
      successRate: 'Success Rate',
      // Filters
      allCustomers: 'All Customers',
      withDiscount: 'Has Discount',
      noDiscount: 'No Discount',
      sortRecent: 'Recent First',
      sortBookings: 'Most Bookings',
      filterBy: 'Filter',
      sortBy: 'Sort'
    },
    id: {
      title: 'Kirim Diskon',
      subtitle: 'Berikan diskon promosi kepada pelanggan Anda',
      searchPlaceholder: 'Cari pelanggan...',
      recentCustomers: 'Pelanggan Terbaru',
      noCustomers: 'Tidak ada pelanggan',
      noCustomersSubtext: 'Pelanggan dari booking Anda akan muncul di sini',
      lastBooking: 'Booking terakhir',
      totalBookings: 'booking',
      sendDiscount: 'Kirim Diskon',
      hasDiscount: 'Ada diskon aktif',
      loading: 'Memuat pelanggan...',
      // Stats
      totalSent: 'Total Terkirim',
      activeNow: 'Aktif Sekarang',
      usedDiscounts: 'Terpakai',
      successRate: 'Tingkat Sukses',
      // Filters
      allCustomers: 'Semua Pelanggan',
      withDiscount: 'Ada Diskon',
      noDiscount: 'Tanpa Diskon',
      sortRecent: 'Terbaru',
      sortBookings: 'Paling Banyak Booking',
      filterBy: 'Filter',
      sortBy: 'Urutkan'
    },
  };

  const labels = t[language] || t.id;

  useEffect(() => {
    loadCustomers();
    loadDiscountStats();
  }, [therapist?.id]);

  const loadDiscountStats = async () => {
    if (!therapist?.id) return;
    
    try {
      // Fetch all discount codes sent by this therapist
      const discountsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'discount_codes',
        [
          Query.equal('providerId', therapist.id),
          Query.limit(1000)
        ]
      );
      
      const totalSent = discountsResponse.documents.length;
      const active = discountsResponse.documents.filter((d: any) => 
        !d.isUsed && new Date(d.expiresAt) > new Date()
      ).length;
      const used = discountsResponse.documents.filter((d: any) => d.isUsed).length;
      const successRate = totalSent > 0 ? Math.round((used / totalSent) * 100) : 0;
      
      setStats({
        totalDiscountsSent: totalSent,
        activeDiscounts: active,
        usedDiscounts: used,
        successRate
      });
    } catch (error) {
      console.error('Failed to load discount stats:', error);
    }
  };

  const loadCustomers = async () => {
    if (!therapist?.id) return;
    
    setLoading(true);
    try {
      // Fetch bookings for this therapist
      const bookingsCollection = APPWRITE_CONFIG.collections.bookings;
      if (!bookingsCollection) {
        setCustomers([]);
        return;
      }

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        bookingsCollection,
        [
          Query.equal('therapistId', therapist.id),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      // Group by customer and get unique customers
      const customerMap = new Map<string, Customer>();
      
      for (const booking of response.documents) {
        const customerId = (booking as any).customerId || (booking as any).userId;
        const customerName = (booking as any).customerName || (booking as any).userName || 'Unknown';
        
        if (!customerId) continue;
        
        if (customerMap.has(customerId)) {
          const existing = customerMap.get(customerId)!;
          existing.totalBookings++;
        } else {
          customerMap.set(customerId, {
            id: customerId,
            name: customerName,
            lastBookingDate: (booking as any).$createdAt || new Date().toISOString(),
            totalBookings: 1,
            hasActiveDiscount: false
          });
        }
      }

      // Check for active discounts
      try {
        const discountsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'discount_codes',
          [
            Query.equal('providerId', therapist.id),
            Query.equal('isUsed', false),
            Query.greaterThan('expiresAt', new Date().toISOString())
          ]
        );
        
        for (const discount of discountsResponse.documents) {
          const userId = (discount as any).userId;
          if (customerMap.has(userId)) {
            customerMap.get(userId)!.hasActiveDiscount = true;
          }
        }
      } catch (e) {
        console.log('Could not check discounts:', e);
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      // Search filter
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType === 'active' && !c.hasActiveDiscount) return false;
      if (filterType === 'no-discount' && c.hasActiveDiscount) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'bookings') {
        return b.totalBookings - a.totalBookings;
      }
      // Default: recent first
      return new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDiscountModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Enhanced Status Header */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 px-4 pt-6 pb-8 text-white">
        {/* Title Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <Gift className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{labels.title}</h1>
            <p className="text-sm text-orange-100 mt-0.5">{labels.subtitle}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Sent */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-100" />
              <span className="text-xs text-orange-100 font-medium">{labels.totalSent}</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalDiscountsSent}</p>
          </div>

          {/* Active Now */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-xs text-orange-100 font-medium">{labels.activeNow}</span>
            </div>
            <p className="text-3xl font-bold text-green-300">{stats.activeDiscounts}</p>
          </div>

          {/* Used Discounts */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-blue-300" />
              <span className="text-xs text-orange-100 font-medium">{labels.usedDiscounts}</span>
            </div>
            <p className="text-3xl font-bold text-blue-300">{stats.usedDiscounts}</p>
          </div>

          {/* Success Rate */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-yellow-300" />
              <span className="text-xs text-orange-100 font-medium">{labels.successRate}</span>
            </div>
            <p className="text-3xl font-bold text-yellow-300">{stats.successRate}%</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Filter & Sort Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Filter Buttons */}
          <button
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
            }`}
          >
            <Users className="w-4 h-4" />
            {labels.allCustomers}
          </button>
          
          <button
            onClick={() => setFilterType('active')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              filterType === 'active'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {labels.withDiscount}
          </button>
          
          <button
            onClick={() => setFilterType('no-discount')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              filterType === 'no-discount'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
            }`}
          >
            <Gift className="w-4 h-4" />
            {labels.noDiscount}
          </button>

          {/* Sort Divider */}
          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Sort Buttons */}
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              sortBy === 'recent'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            {labels.sortRecent}
          </button>
          
          <button
            onClick={() => setSortBy('bookings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              sortBy === 'bookings'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
            }`}
          >
            <SortAsc className="w-4 h-4" />
            {labels.sortBookings}
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-600">{labels.recentCustomers}</h2>
          <span className="text-sm text-gray-500">{filteredCustomers.length} pelanggan</span>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{labels.loading}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{labels.noCustomers}</p>
            <p className="text-sm text-gray-400 mt-1">{labels.noCustomersSubtext}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-orange-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-lg font-bold text-white">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                      {customer.hasActiveDiscount && (
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">
                          ✓ {labels.hasDiscount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {labels.lastBooking}: {formatDate(customer.lastBookingDate)}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-orange-600">{customer.totalBookings} {labels.totalBookings}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectCustomer(customer)}
                    disabled={customer.hasActiveDiscount}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      customer.hasActiveDiscount
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg active:scale-95'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span className="hidden sm:inline">{labels.sendDiscount}</span>
                    <Plus className="w-4 h-4 sm:hidden" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Discount Modal */}
      {selectedCustomer && (
        <SendDiscountModal
          isOpen={showDiscountModal}
          onClose={() => {
            setShowDiscountModal(false);
            setSelectedCustomer(null);
          }}
          providerId={therapist?.id || ''}
          providerType="therapist"
          providerName={therapist?.name || 'Therapist'}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          onSuccess={(code, percentage) => {
            console.log(`✅ Discount ${percentage}% sent: ${code}`);
            // Refresh data
            loadCustomers();
            loadDiscountStats();
          }}
        />
      )}
    </div>
  );
};

export default SendDiscountPage;
