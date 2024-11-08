import React, { useState } from 'react';
import { List, ListItem, ListItemText, Typography, Box, Divider, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Organization = ({ isAdmin, isHR, handleSelection }) => {
  const [openEmployee, setOpenEmployee] = useState(false);

  const handleEmployeeClick = () => {
    setOpenEmployee(!openEmployee);
  };

  return (
    <Box sx={{ marginBottom: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#777', marginBottom: 0 }}>
        ORGANIZATION
      </Typography>
      <Divider sx={{ marginBottom: -1 }} />
      <List>
        {/** Always show Employee dropdown for all users */} 
        <ListItem button onClick={handleEmployeeClick}>
          <ListItemText primary="Employee" />
          {openEmployee ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openEmployee} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/** Always show the 'Profile' option for all users */}
            <ListItem button onClick={() => handleSelection('profile')} sx={{ pl: 4 }}>
              <ListItemText primary="Profile" />
            </ListItem>

            {/** Show 'Employees' and 'Document Request' options only for Admin or HR */}
            {(isAdmin || isHR) && (
              <>
                <ListItem button onClick={() => handleSelection('employees')} sx={{ pl: 4 }}>
                  <ListItemText primary="Employees" />
                </ListItem>
                <ListItem button onClick={() => handleSelection('document-request')} sx={{ pl: 4 }}>
                  <ListItemText primary="Document Request" />
                </ListItem>
              </>
            )}
          </List>
        </Collapse>

        <ListItem button onClick={() => handleSelection('structure')}>
          <ListItemText primary="Structure" />
        </ListItem>
        <ListItem button onClick={() => handleSelection('report')}>
          <ListItemText primary="Report" />
        </ListItem>
        <ListItem button onClick={() => handleSelection('settings')}>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Organization;
