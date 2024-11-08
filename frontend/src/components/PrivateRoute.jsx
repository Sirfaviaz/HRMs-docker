import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isTokenExpired } from '../utils/checkTokenExpiration';  // Ensure correct path to utility
import Cookies from 'js-cookie';

const PrivateRoute = ({ children }) => {
  const token = Cookies.get('access');  // Get the token from cookies
  
  // Correctly access `isAuthenticated` from the `user` slice
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // If not authenticated or token is expired, redirect to login
  if (!isAuthenticated || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return children;  // Render the protected component if authenticated
};

export default PrivateRoute;
