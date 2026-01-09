/**
 * 🎁 SEND DISCOUNT PAGE
 * 
 * Allows therapists to send promotional discount codes to past customers.
 * Lists recent customers with chat history for easy selection.
 */

import React, { useState, useEffect } from 'react';
import { Gift, Search, User, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { databases, Query } from '../../../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../../../lib/appwrite.config';
import SendDiscountModal from '../../../../components/SendDiscountModal';

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
    },
  };

  const labels = t[language] || t.id;

  useEffect(() => {
    loadCustomers();
  }, [therapist?.id]);

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

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{labels.title}</h1>
            <p className="text-sm text-pink-100">{labels.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">{labels.recentCustomers}</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">{labels.loading}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{labels.noCustomers}</p>
            <p className="text-sm text-gray-400 mt-1">{labels.noCustomersSubtext}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-orange-600">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                      {customer.hasActiveDiscount && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {labels.hasDiscount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {labels.lastBooking}: {formatDate(customer.lastBookingDate)}
                      </span>
                      <span>•</span>
                      <span>{customer.totalBookings} {labels.totalBookings}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectCustomer(customer)}
                    disabled={customer.hasActiveDiscount}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      customer.hasActiveDiscount
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span className="hidden sm:inline">{labels.sendDiscount}</span>
                    <ArrowRight className="w-4 h-4 sm:hidden" />
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
            // Refresh the customer list to show active discount badge
            loadCustomers();
          }}
        />
      )}
    </div>
  );
};

export default SendDiscountPage;
