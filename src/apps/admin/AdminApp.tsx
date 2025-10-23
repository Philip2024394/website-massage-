import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import UserManagement from './pages/UserManagement';
import BookingManagement from './pages/BookingManagement';
import ServiceManagement from './pages/ServiceManagement';
import BackgroundsPage from './pages/BackgroundsPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { useAdminAuth } from './hooks/useAdminAuth';

const AdminApp: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<AdminDashboard user={user} onLogout={logout} />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/bookings" element={<BookingManagement />} />
      <Route path="/services" element={<ServiceManagement />} />
      <Route path="/backgrounds" element={<BackgroundsPage />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AdminApp;