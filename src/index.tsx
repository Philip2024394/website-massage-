
import ReactDOM from 'react-dom/client';
// Force cache bust: 2024-11-03-21:25:00
import OptimizedApp from './OptimizedApp';
import { SimpleLanguageProvider } from './context/SimpleLanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import '../index.css';

// Performance monitoring
performance.mark('app-start');

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

// Temporarily disable concurrent features to debug removeChild error
const root = ReactDOM.createRoot(rootElement, {
    onRecoverableError: (error) => {
        console.error('React Recoverable Error:', error);
    },
});

// Mark when React starts rendering
performance.mark('react-start');

root.render(
    <ErrorBoundary>
        <SimpleLanguageProvider>
            <OptimizedApp />
        </SimpleLanguageProvider>
    </ErrorBoundary>
);

// Mark when React finishes initial render
setTimeout(() => {
    performance.mark('react-complete');
    
    // Measure loading performance
    try {
        const appStartToReactStart = performance.measure('app-to-react', 'app-start', 'react-start');
        const reactStartToComplete = performance.measure('react-render', 'react-start', 'react-complete');
        const totalLoadTime = performance.measure('total-load', 'app-start', 'react-complete');
        
        console.log('🚀 [PERFORMANCE] Loading metrics:');
        console.log('  App start to React: ', Math.round(appStartToReactStart.duration), 'ms');
        console.log('  React render time: ', Math.round(reactStartToComplete.duration), 'ms');
        console.log('  Total load time: ', Math.round(totalLoadTime.duration), 'ms');
    } catch (error) {
        console.log('Performance measurement not available');
    }
}, 100);
