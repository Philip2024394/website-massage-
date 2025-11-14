import React from 'react';
import AppRouter from './AppRouter';
import { DeviceStylesProvider } from './components/DeviceAware';
import './lib/globalErrorHandler'; // Initialize global error handling

/**
 * Main App Component - Simplified Modular Architecture
 * 
 * This replaces the monolithic app structure with a clean modular approach.
 * Each user type (therapist, place, hotel, villa, admin) gets its own isolated app.
 * 
 * Benefits:
 * - No more section confusion between user types
 * - Isolated authentication contexts
 * - Better performance with code splitting
 * - Cleaner development experience
 * - Proper separation of concerns
 */
const App: React.FC = () => {
    console.log('🏗️ App.tsx: Modular App component rendering...');
    
    return (
        <DeviceStylesProvider>
            <div className="App">
                <AppRouter />
            </div>
        </DeviceStylesProvider>
    );
};

export default App;