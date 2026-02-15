// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fix)
/**
 * TherapistCustomersPage - Display booking history grouped by customers
 * Clicking a customer navigates to Banner Discount page to send gift vouchers
 */
import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Gift, Search, X } from 'lucide-react';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';
import { bookingService } from '../../lib/bookingService';
import { showToast } from '../../utils/showToastPortal';

interface CustomerData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalBookings: number;
  lastBookingDate: string;
  lastMassageType: string;
  totalSpent: number;
  status: string;
}

interface TherapistCustomersPageProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string, data?: any) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistCustomersPage: React.FC<TherapistCustomersPageProps> = ({
  therapist,
  onBack,
  onNavigate,
  onLogout,
  language = 'id'
}) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('✅ Customers page mounted');
    loadCustomerData();
  }, [therapist]);

  const loadCustomerData = async () => {
    if (!therapist?.$id) {
      console.error('No therapist ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all bookings for this therapist
      const allBookings = await bookingService.getProviderBookings(therapist.$id);
      
      // Group bookings by customer
      const customerMap = new Map<string, CustomerData>();
      
      allBookings.forEach((booking: any) => {
        const customerId = booking.customerId || booking.customerPhone || 'unknown';
        const customerName = booking.customerName || 'Unknown Customer';
        const customerPhone = booking.customerPhone || '';
        
        if (customerMap.has(customerId)) {
          const existing = customerMap.get(customerId)!;
          existing.totalBookings += 1;
          existing.totalSpent += booking.price || 0;
          
          // Update if this booking is more recent
          const existingDate = new Date(existing.lastBookingDate);
          const bookingDate = new Date(booking.createdAt || booking.date);
          if (bookingDate > existingDate) {
            existing.lastBookingDate = booking.createdAt || booking.date;
            existing.lastMassageType = booking.serviceType || booking.massageType;
          }
        } else {
          customerMap.set(customerId, {
            customerId,
            customerName,
            customerPhone,
            totalBookings: 1,
            lastBookingDate: booking.createdAt || booking.date,
            lastMassageType: booking.serviceType || booking.massageType,
            totalSpent: booking.price || 0,
            status: booking.status || 'completed'
          });
        }
      });
      
      // Convert map to array and sort by total bookings (most loyal customers first)
      const customerList = Array.from(customerMap.values())
        .sort((a, b) => b.totalBookings - a.totalBookings);
      
      setCustomers(customerList);
      console.log(`📊 Loaded ${customerList.length} unique customers`);
    } catch (error) {
      console.error('Error loading customer data:', error);
      showToast('Failed to load customer data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customer: CustomerData) => {
    console.log('📤 Navigating to send discount for customer:', customer.customerName);
    
    // Navigate to send-discount page (which has banner selection)
    if (onNavigate) {
      onNavigate('send-discount');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.lastMassageType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <TherapistSimplePageLayout
      title={language === 'id' ? 'Pelanggan Saya' : 'My Customers'}
      subtitle={`${customers.length} ${language === 'id' ? 'Total Pelanggan' : 'Total Customers'}`}
      onBackToStatus={onBack || (() => onNavigate?.('therapist-status'))}
      onNavigate={onNavigate}
      therapist={therapist}
      currentPage="customers"
      language={language}
      onLogout={onLogout}
      icon={<Users className="w-6 h-6 text-white" />}
    >
      <div className="bg-gray-50 px-6 pt-4 pb-6" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari nama atau jenis massage...' : 'Search name or massage type...'}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Customer List */}
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {language === 'id' ? 'Memuat data pelanggan...' : 'Loading customers...'}
                </p>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'id' ? 'Belum Ada Pelanggan' : 'No Customers Yet'}
              </h3>
              <p className="text-gray-600">
                {language === 'id' 
                  ? 'Data pelanggan akan muncul setelah Anda menyelesaikan booking pertama' 
                  : 'Customer data will appear after your first completed booking'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.customerId}
                  onClick={() => handleCustomerClick(customer)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Customer Name & Phone */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {customer.customerName}
                          </h3>
                          <p className="text-sm text-gray-600">{customer.customerPhone}</p>
                        </div>
                      </div>

                      {/* Booking Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">
                              {language === 'id' ? 'Total Booking' : 'Total Bookings'}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {customer.totalBookings}x
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs">
                              {language === 'id' ? 'Total Belanja' : 'Total Spent'}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(customer.totalSpent)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Gift className="w-4 h-4" />
                            <span className="text-xs">
                              {language === 'id' ? 'Terakhir' : 'Last'}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {customer.lastMassageType}
                          </div>
                        </div>
                      </div>

                      {/* Last Booking Date */}
                      <div className="mt-3 text-sm text-gray-500">
                        {language === 'id' ? 'Booking terakhir: ' : 'Last booking: '}
                        <span className="font-medium">{formatDate(customer.lastBookingDate)}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <X className="w-6 h-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Send Gift CTA */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                      <Gift className="w-4 h-4" />
                      <span>
                        {language === 'id' ? 'Kirim Voucher Diskon' : 'Send Discount Voucher'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </TherapistSimplePageLayout>
  );
};

export default TherapistCustomersPage;
