import React, { useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import JobPostings from './Status/JobPostings';
import Onboarding from './Status/Onboarding';
import AcceptedOffers from './Status/AcceptedOffers'; // Import the new component

const Status = () => {
  const [activeComponent, setActiveComponent] = useState('jobPosting'); // Manage the active component to display

  // Handle tile clicks to switch components
  const handleTileClick = (component) => {
    setActiveComponent(component);
  };

  return (
    <Box sx={{ padding: 2 }}>
      {/* Tile navigation */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={4}>
          <Paper
            onClick={() => handleTileClick('jobPosting')}
            sx={{
              padding: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: activeComponent === 'jobPosting' ? '#f0f0f0' : '#fff',
              transition: 'background-color 0.3s',
            }}
          >
            <Typography variant="h6">Job Postings</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            onClick={() => handleTileClick('onboarding')}
            sx={{
              padding: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: activeComponent === 'onboarding' ? '#f0f0f0' : '#fff',
              transition: 'background-color 0.3s',
            }}
          >
            <Typography variant="h6">Onboarding</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            onClick={() => handleTileClick('acceptedOffers')}
            sx={{
              padding: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: activeComponent === 'acceptedOffers' ? '#f0f0f0' : '#fff',
              transition: 'background-color 0.3s',
            }}
          >
            <Typography variant="h6">Accepted Offers</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Render the selected component */}
      {activeComponent === 'jobPosting' && <JobPostings />}
      {activeComponent === 'onboarding' && <Onboarding />}
      {activeComponent === 'acceptedOffers' && <AcceptedOffers />} {/* New component */}
    </Box>
  );
};

export default Status;
