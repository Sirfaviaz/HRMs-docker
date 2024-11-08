// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated for React 18
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import './styles.css'; 
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // Optional: Use React.StrictMode for highlighting potential problems
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Register the service worker for Firebase Cloud Messaging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then(function (registration) {
        console.log('Service Worker registration successful with scope: ', registration.scope);
      })
      .catch(function (err) {
        console.error('Service Worker registration failed:', err);
      });
  });
}
