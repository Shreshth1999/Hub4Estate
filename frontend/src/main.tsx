import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { AuthProvider } from './components/AuthProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LiveAnnouncerProvider } from './components/LiveAnnouncer';
import { initAnalytics } from './lib/analytics';
import { initSentry } from './lib/sentry';
import { queryClient } from './lib/queryClient';
import './index.css';

initSentry();
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <LanguageProvider>
                <LiveAnnouncerProvider>
                  <App />
                </LiveAnnouncerProvider>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
