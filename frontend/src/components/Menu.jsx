// src/components/Menu.js

import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, Divider } from '@mui/material';

const Menu = ({ handleSelection }) => {
    return (
        <Box sx={{ marginBottom: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#777', marginBottom: 0 }}>
                MENU
            </Typography>
            <Divider sx={{ marginBottom: -1 }} />
            <List>
                <ListItem button onClick={() => handleSelection('dashboard')}>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button onClick={() => handleSelection('mails')}>
                    <ListItemText primary="Message" />
                </ListItem>
                <ListItem button onClick={() => handleSelection('meetings')}>
                    <ListItemText primary="Meetings" />
                </ListItem>
            </List>
        </Box>
    );
};

export default Menu;
