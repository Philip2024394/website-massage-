import React, { useState } from 'react';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                IndaStreet Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'Admin'}
              </span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['Dashboard', 'Users', 'Therapists', 'Bookings', 'Analytics'].map((item) => (
              <button
                key={item}
                onClick={() => setCurrentPage(item.toLowerCase())}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentPage === item.toLowerCase()
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            {currentPage === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Total Users', value: '1,234', color: 'bg-blue-500' },
                    { title: 'Active Therapists', value: '567', color: 'bg-green-500' },
                    { title: 'Total Bookings', value: '2,890', color: 'bg-yellow-500' },
                    { title: 'Revenue', value: '$12,345', color: 'bg-purple-500' },
                  ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className={`${stat.color} rounded-md p-3 mr-4`}>
                          <div className="w-6 h-6 bg-white rounded"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentPage !== 'dashboard' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Management
                </h2>
                <p className="text-gray-600">
                  This section is under development. Coming soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;