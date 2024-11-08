// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAdmin, isHR, isManager } = useSelector((state) => state.user);

  const userRoles = {
    isAdmin,
    isHR,
    isManager,
  };

  const hasAccess = allowedRoles.some((role) => userRoles[role]);

  return hasAccess ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
