import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard'; // Admin dashboard component
import ManagerDashboard from './ManagerDashboard'; // Manager dashboard component
import HRDashboard from './HRDashboard'; // HR dashboard component
import GenericWelcome from './GenericWelcome'; // Fallback component for non-admin, non-manager, non-HR users

const RoleBasedDashboard = () => {
  // Get user state from Redux store
  const { isAdmin, isManager, isHR } = useSelector((state) => state.user);

  // Render different components based on the role of the user
  if (isAdmin) {
    return <AdminDashboard />;
  } else if (isManager) {
    return <ManagerDashboard />;
  } else if (isHR) {
    return <HRDashboard />;
  } else {
    // Render fallback component if the user doesn't have any specific role
    return <GenericWelcome />;
  }
};

export default RoleBasedDashboard;
