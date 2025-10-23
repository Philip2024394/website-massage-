import React from 'react';
import { Link } from 'react-router-dom';
import { useBackground } from '../hooks/useBackground';

const LandingPage: React.FC = () => {
  const { backgroundStyle, backgroundClass } = useBackground('landing');
  const apps = [
    {
      name: 'Admin Portal',
      path: '/admin',
      description: 'System administration and management',
      color: 'bg-blue-500',
      icon: '⚙️'
    },
    {
      name: 'Agent Portal',
      path: '/agent',
      description: 'Sales agents and referral management',
      color: 'bg-green-500',
      icon: '💼'
    },
    {
      name: 'Client App',
      path: '/client',
      description: 'Book and manage massage services',
      color: 'bg-purple-500',
      icon: '👤'
    },
    {
      name: 'Therapist Portal',
      path: '/therapist',
      description: 'Manage bookings and schedule',
      color: 'bg-pink-500',
      icon: '💆'
    },
    {
      name: 'Place Portal',
      path: '/place',
      description: 'Massage business management',
      color: 'bg-yellow-500',
      icon: '🏢'
    },
    {
      name: 'Hotel Portal',
      path: '/hotel',
      description: 'Hotel guest services',
      color: 'bg-indigo-500',
      icon: '🏨'
    },
    {
      name: 'Villa Portal',
      path: '/villa',
      description: 'Private villa services',
      color: 'bg-red-500',
      icon: '🏡'
    }
  ];

  return (
    <div 
      className={`min-h-screen ${backgroundClass}`}
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-white">Indo</span>
            <span className="text-orange-400">Street</span>
          </h1>
          <p className="text-xl text-white/80 mb-2">Massage Booking Platform</p>
          <p className="text-lg text-white/60">Modular Architecture • Mobile Ready • Scalable</p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {apps.map((app) => (
            <Link
              key={app.path}
              to={app.path}
              className="group bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className={`${app.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {app.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{app.name}</h3>
                <p className="text-white/70 text-sm">{app.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Modular Architecture</h3>
              <p className="text-white/70">Separate apps for each user type with shared components</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile Ready</h3>
              <p className="text-white/70">Built for React Native integration and mobile apps</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Scalable</h3>
              <p className="text-white/70">Easy to add new features and user types</p>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-white text-center mb-4">Demo Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-white/80">
              <strong>Admin:</strong> admin123 / indostreet2024
            </div>
            <div className="text-white/80">
              <strong>Hotel:</strong> hotel123 / indostreet2024
            </div>
            <div className="text-white/80">
              <strong>Villa:</strong> villa123 / indostreet2024
            </div>
            <div className="text-white/80">
              <strong>Others:</strong> user@example.com / password123
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-white/60">
            Built with React 19, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;