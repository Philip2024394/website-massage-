import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Note: Admin/Hotel/Villa apps removed - features deprecated
// import AdminApp from './apps/admin/AdminApp';
// import AgentApp from './apps/agent/AgentApp'; // Removed - file doesn't exist
import ClientApp from './apps/client/ClientApp';
import TherapistApp from './apps/therapist/TherapistApp';
import PlaceApp from './apps/place/PlaceApp';
// import HotelApp from './apps/hotel/HotelApp';
// import VillaApp from './apps/villa/VillaApp';
import LandingPage from './shared/components/LandingPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin app - deprecated */}
        {/* <Route path="/admin/*" element={<AdminApp />} /> */}
        
        {/* Agent app - deprecated */}
        {/* <Route path="/agent/*" element={<AgentApp />} /> */}
        
        {/* Client app */}
        <Route path="/client/*" element={<ClientApp />} />
        
        {/* Therapist app */}
        <Route path="/therapist/*" element={<TherapistApp />} />
        
        {/* Place app */}
        <Route path="/place/*" element={<PlaceApp />} />
        
        {/* Hotel app - deprecated */}
        {/* <Route path="/hotel/*" element={<HotelApp />} /> */}
        
        {/* Villa app - deprecated */}
        {/* <Route path="/villa/*" element={<VillaApp />} /> */}
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;