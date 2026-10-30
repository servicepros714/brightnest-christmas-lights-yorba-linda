import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/booking.css';

// Enable entrance animations only when the visitor hasn't asked for reduced motion.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('anim-on');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <BookingProvider>
          <App />
        </BookingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
