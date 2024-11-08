// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import Redux Provider
import store from './store'; // Import your Redux store
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordReset from './pages/PasswordReset';
import MultiStepForm from './pages/MultiStepForm';
import PrivateRoute from './components/PrivateRoute';
import JobListingPage from './components/RightContent/Recruitment/Joblisting/JobListingPage'; // Import the JobListingPage

// Import the notification permission request function
import { requestNotificationPermission } from './requestNotificationPermission';

function App() {
  useEffect(() => {
    // Request notification permission when the app loads
    requestNotificationPermission();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/password-reset" element={<PasswordResetRequest />} />
          <Route path="/reset-password/:uid/:token" element={<PasswordReset />} />
          <Route path="/jobs" element={<JobListingPage />} /> {/* Add Job Listings Page route */}

          {/* Private Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/fill-info/:uid/:token"
            element={
              <PrivateRoute>
                <MultiStepForm />
              </PrivateRoute>
            }
          />

          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
