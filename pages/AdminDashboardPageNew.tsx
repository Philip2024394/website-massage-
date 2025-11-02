import React from 'react';
import LiveAdminDashboard from './LiveAdminDashboard';

interface AdminDashboardPageProps {
    onLogout: () => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onLogout }) => {
  return <LiveAdminDashboard onLogout={onLogout} />;
};

export default AdminDashboardPage;