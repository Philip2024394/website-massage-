import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, LogOut, Clock, MapPin, DollarSign } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';
import { showToast } from '../utils/showToastPortal';
import { FACIAL_TYPES_CATEGORIZED } from '../constants/rootConstants';

interface Booking {
  $id: string;
  facialPlaceName: string;
  facialService: string;
  duration: number;
  price: number;
  bookingDate: string;
  bookingTime: string;
  status: string;
  address?: string;
  createdAt: string;
  facialType?: string;
}

interface FacialMemberDashboardProps {
  userId: string;
  userEmail: string;
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

const FacialMemberDashboard: React.FC<FacialMemberDashboardProps> = ({
  userId,
  userEmail,
  onNavigateHome,
  onLogout
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedFacialTypes, setSelectedFacialTypes] = useState<string[]>([]);
  const [showFacialTypesModal, setShowFacialTypesModal] = useState(false);

  // Get all facial types from categorized data
  const allFacialTypes = FACIAL_TYPES_CATEGORIZED.flatMap(category => category.types);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Try to fetch bookings from facial_bookings collection
      try {
        const collectionId = (APPWRITE_CONFIG.collections as any).facial_bookings || 'facial_bookings';
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          collectionId,
          [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
          ]
        );
        
        setBookings(response.documents as unknown as Booking[]);
      } catch (collectionError: any) {
        // Collection might not exist yet
        console.log('No bookings collection found yet:', collectionError.message);
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      showToast('Could not load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate >= new Date() && booking.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate < new Date() || booking.status === 'cancelled';
  });

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>
            <h1 className="text-2xl font-bold">
              <span className="text-black">Facial Spa</span>
              <span className="text-orange-500"> Dashboard</span>
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-600">{userEmail}</p>
            </div>
            <button
              onClick={() => setShowFacialTypesModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-medium hover:from-orange-500 hover:to-pink-500 transition-all shadow-md flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Facial Preferences
            </button>
          </div>
          
          {/* Selected Facial Types Display */}
          {selectedFacialTypes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Preferred Facial Types:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFacialTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 text-sm font-medium rounded-full border border-orange-200"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{bookings.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-green-500 mt-1">{upcomingBookings.length}</p>
              </div>
              <Clock className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-blue-500 mt-1">
                  {pastBookings.filter(b => b.status.toLowerCase() === 'completed').length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-6 font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 px-6 font-medium transition-all ${
                activeTab === 'past'
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Past ({pastBookings.length})
            </button>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : currentBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {activeTab === 'upcoming' 
                    ? 'No upcoming bookings' 
                    : 'No past bookings'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Book your first facial treatment to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentBookings.map((booking) => (
                  <div
                    key={booking.$id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.facialPlaceName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {booking.facialService}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{booking.bookingTime} • {booking.duration} min</span>
                      </div>

                      {booking.address && (
                        <div className="flex items-center gap-2 col-span-full">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="truncate">{booking.address}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">
                          Rp {booking.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facial Types Modal */}
      {showFacialTypesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowFacialTypesModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Select Your Preferred Facial Types</h3>
                <button
                  onClick={() => setShowFacialTypesModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Choose the facial treatments you're interested in</p>
            </div>

            <div className="p-6">
              {FACIAL_TYPES_CATEGORIZED.map((category) => (
                <div key={category.category} className="mb-6 last:mb-0">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">
                      {category.category.includes('Anti-Aging') ? '✨' : 
                       category.category.includes('Skin Care') ? '🌸' :
                       category.category.includes('Specialty') ? '💎' : '🌿'}
                    </span>
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.types.map((type) => {
                      const isSelected = selectedFacialTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedFacialTypes(prev =>
                              isSelected
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            );
                          }}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{type}</span>
                            {isSelected && (
                              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  {selectedFacialTypes.length} {selectedFacialTypes.length === 1 ? 'type' : 'types'} selected
                </p>
                <button
                  onClick={() => {
                    setShowFacialTypesModal(false);
                    showToast(`${selectedFacialTypes.length} facial type${selectedFacialTypes.length === 1 ? '' : 's'} saved`, 'success');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacialMemberDashboard;
