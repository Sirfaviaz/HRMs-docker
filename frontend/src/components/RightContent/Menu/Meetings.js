import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import MeetingScheduler from './Meetings/MeetingScheduler';  // Import the MeetingScheduler component
import AssignedStages from './Meetings/AssignedStage';  // Import the AssignedStages component

// TabPanel component to handle rendering the content of each tab
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Meetings = () => {
  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>Meetings Management</Typography>
      
      {/* Tabs Component */}
      <Tabs value={value} onChange={handleTabChange} aria-label="Meetings Tabs">
        <Tab label="Meeting Scheduler" />
        <Tab label="Assigned Stages" />
      </Tabs>
      
      {/* TabPanels */}
      <TabPanel value={value} index={0}>
        <MeetingScheduler />  {/* Meeting Scheduler Content */}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AssignedStages />  {/* Assigned Stages Content */}
      </TabPanel>
    </Box>
  );
};

export default Meetings;
