import React from 'react';
import { Typography, Box } from '@mui/material';

const UnauthorizedPage = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4">Unauthorized</Typography>
      <Typography variant="body1">
        You do not have permission to view this page.
      </Typography>
    </Box>
  );
};

export default UnauthorizedPage;
