// src/components/Recruitment.js

import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, Divider } from '@mui/material';

const Recruitment = ({ isAdmin, isHR, handleSelection }) => {
  // Conditional rendering based on user permissions
  if (!isAdmin && !isHR) return null;

  return (
    <Box sx={{ marginBottom: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#777', marginBottom: 0 }}>
        RECRUITMENT
      </Typography>
      <Divider sx={{ marginBottom: -1 }} />
      <List>
        <ListItem button onClick={() => handleSelection('jobs')}>
          <ListItemText primary="Jobs" />
        </ListItem>
        <ListItem button onClick={() => handleSelection('candidates')}>
          <ListItemText primary="Candidates" />
        </ListItem>
        <ListItem button onClick={() => handleSelection('referrals')}>
          <ListItemText primary="Stages" />
        </ListItem>
        <ListItem button onClick={() => handleSelection('status')}>
          <ListItemText primary="Status" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Recruitment;
