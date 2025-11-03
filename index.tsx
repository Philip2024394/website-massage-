
import ReactDOM from 'react-dom/client';
// Force cache bust: 2024-11-03-21:25:00
import App from './App';
import { SimpleLanguageProvider } from './context/SimpleLanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <ErrorBoundary>
        <SimpleLanguageProvider>
            <App />
        </SimpleLanguageProvider>
    </ErrorBoundary>
);
