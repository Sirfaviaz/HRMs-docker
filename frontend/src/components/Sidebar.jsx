import React from 'react';
import Menu from './Menu';
import Recruitment from './Recruitment';
import Organization from './Organization';
import { Box, Typography } from '@mui/material';

const Sidebar = ({ isAdmin, isHR, handleSelection }) => {
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#f8f9fa',
        height: '100%',
        padding: 2,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px', // Smaller width for the scrollbar
        },
        '&::-webkit-scrollbar-track': {
          background: '#e9ecef', // Background of the scrollbar track
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#007bff', // Color of the scrollbar thumb
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#0056b3', // Darker color on hover
        },
        '&:hover::-webkit-scrollbar-thumb': {
          background: '#007bff', // Show thumb on hover
        },
        '&::-webkit-scrollbar-thumb:vertical': {
          display: 'none', // Hide thumb by default
        },
        '&:hover::-webkit-scrollbar-thumb:vertical': {
          display: 'block', // Show thumb when hovered
        },
      }}
    >
      <Box sx={{ marginBottom: 1 }}>
        <Typography variant="h5">HRM</Typography>
      </Box>
      {/* Pass handleSelection to Menu and Recruitment components */}
      <Menu handleSelection={handleSelection} />
      
      {/* Pass isAdmin and isHR to Recruitment and Organization */}
      <Recruitment isAdmin={isAdmin} isHR={isHR} handleSelection={handleSelection} />
      
      {/* Pass isAdmin and isHR to Organization and handleSelection for employee dropdown */}
      <Organization isAdmin={isAdmin} isHR={isHR} handleSelection={handleSelection} />
    </Box>
  );
};

export default Sidebar;
