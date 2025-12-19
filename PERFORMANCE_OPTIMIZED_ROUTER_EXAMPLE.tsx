import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ⚡ Lazy load heavy components for better performance
// NOTE: This is an example file. Uncomment and update paths when components are available.
// const LandingPage = React.lazy(() => import('./shared/components/LandingPage'));
// const MembershipPage = React.lazy(() => import('./pages/MembershipPage'));
// const PackagesPage = React.lazy(() => import('./pages/PackagesPage'));

// Admin routes
// const AdminApp = React.lazy(() => import('./apps/admin/AdminApp'));

// Therapist routes  
// const TherapistApp = React.lazy(() => import('./apps/therapist/TherapistApp'));

// Place routes
// const PlaceApp = React.lazy(() => import('./apps/place/PlaceApp'));

// Client routes
// const ClientApp = React.lazy(() => import('./apps/client/ClientApp'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes - Uncomment when components are available */}
          {/* <Route path="/" element={<LandingPage />} /> */}
          {/* <Route path="/membership" element={<MembershipPage onPackageSelect={() => {}} onBack={() => {}} t={{}} />} /> */}
          {/* <Route path="/packages" element={<PackagesPage />} /> */}

          {/* App Routes - Uncomment when apps are available */}
          {/* <Route path="/admin/*" element={<AdminApp />} /> */}
          {/* <Route path="/therapist/*" element={<TherapistApp />} /> */}
          {/* <Route path="/place/*" element={<PlaceApp />} /> */}
          {/* <Route path="/client/*" element={<ClientApp />} /> */}
          
          <Route path="/" element={<div>Example Router - Update paths to match your components</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
