import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Avatar, IconButton, Menu, MenuItem, Alert } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CircleIcon from '@mui/icons-material/Circle';
import api from '../../../../../services/api'; // Assuming you have an API service for making requests

const EmployeeCard = ({ employee = {}, onEdit }) => {
  const [anchorEl, setAnchorEl] = useState(null); // State for the menu
  const [alert, setAlert] = useState(null); // State for alert messages
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSendPasswordLink = async () => {
    try {
      await api.post('/accounts/send-password-reset/', { email: employee?.user?.email || '' }); // Backend endpoint
      setAlert({ message: 'Password reset link sent successfully!', severity: 'success' });
    } catch (error) {
      setAlert({ message: 'Failed to send password reset link.', severity: 'error' });
    }
    handleMenuClose(); // Close the menu after the action
  };

  const handleSendInfoLink = async () => {
    try {
      await api.post('/employees/send-info-link/', { email: employee?.user?.email || '' });
      setAlert({ message: 'Information link sent successfully!', severity: 'success' });
    } catch (error) {
      setAlert({ message: 'Failed to send information link.', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(employee); // Trigger the edit action in parent component
    handleMenuClose();
  };

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        marginBottom: 2,
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)', // Slight shadow for the card
        borderRadius: '12px', // Rounded corners
        maxWidth: 400, // Optional width adjustment
        position: 'relative', // For absolute positioning of alerts
      }}
    >
      {/* Avatar Section */}
      <Avatar
        src={employee?.profilePicture || '/placeholder.jpg'}
        sx={{ width: 56, height: 56, marginRight: 2 }}
      />

      {/* Employee Info */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {`${employee?.user?.first_name || 'No'} ${employee?.user?.last_name || 'Name'}`} {/* Fallback if name is undefined */}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {employee?.user?.email || 'No Email Available'} {/* Fallback if email is undefined */}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'gray' }}>
          {employee?.position_title || 'No Title'} - {employee?.department_name || 'No Department'} {/* Fixed rendering of position */}
        </Typography>

        {/* Status - Display online/offline */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
          <CircleIcon
            sx={{
              fontSize: '10px',
              color: employee?.status ? 'green' : 'gray', // Green for online, gray for offline
              marginRight: 1,
            }}
          />
          <Typography variant="body2">
            {employee?.status ? 'Online' : 'Offline'} {/* Display "Online" if status is true, otherwise "Offline" */}
          </Typography>
        </Box>
      </CardContent>

      {/* More Icon */}
      <IconButton onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>

      {/* Menu with options */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleSendPasswordLink}>Send Password Link</MenuItem>
        <MenuItem onClick={handleSendInfoLink}>Fill Additional Info</MenuItem> {/* New dropdown option */}
      </Menu>

      {/* Alert for success or failure */}
      {alert && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert(null)} // Close the alert when clicked
          sx={{ position: 'absolute', bottom: 16, right: 16, width: 300 }}
        >
          {alert.message}
        </Alert>
      )}
    </Card>
  );
};

export default EmployeeCard;
