import React from 'react';

const TestLandingPage = () => {
  console.log('🧪 TestLandingPage rendering');
  
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">TEST LANDING PAGE</h1>
        <p className="text-xl">If you see this, the routing is working!</p>
        <p className="text-sm mt-2">Current time: {new Date().toISOString()}</p>
      </div>
    </div>
  );
};

export default TestLandingPage;