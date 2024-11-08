import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Badge,
  Button, // Import Button for 'Clear All'
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import ClockInOutButtons from './RightContent/Navbar/ClockInOutButtons';
import logo from './logo.png';
import api from '../services/api';
import Cookies from 'js-cookie';

const Navbar = ({ selectedOption, toggleSidebar, handleLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null); // State to control avatar dropdown
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State to control search box visibility in mobile
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null); // State to control notifications dropdown
  const [notifications, setNotifications] = useState([]); // State to store notifications
  const [unreadCount, setUnreadCount] = useState(0); // State to store unread notifications count
  const [socket, setSocket] = useState(null); // State for WebSocket connection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const open = Boolean(anchorEl); // Determine if the avatar menu is open
  const notificationOpen = Boolean(notificationAnchorEl); // Notification menu state

  // Handle click on the avatar to open the dropdown
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the dropdown menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle search toggle in mobile view
  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen); // Toggle search visibility
  };

  // Handle notifications menu
  const handleNotificationsClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchNotifications(); // Fetch notifications whenever the notifications menu is opened
  };

  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
  };

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/notifications/');
      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/notifications/${id}/mark-as-read/`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Clear all notifications
  const handleClearAllNotifications = async () => {
    try {
      // Assuming you have an API endpoint that clears or marks all notifications as read
      await api.delete('/notifications/notifications/clear-all/');
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0); // Reset unread count
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Establish WebSocket connection on mount
  useEffect(() => {
    const token = Cookies.get('access');
    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
    const webSocket = new WebSocket(wsUrl);

    webSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    webSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    webSocket.onmessage = (message) => {
      console.log('New notification:', message.data);
      const notification = JSON.parse(message.data);
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      if (!notification.read) {
        setUnreadCount((prevUnreadCount) => prevUnreadCount + 1);
      }
    };

    setSocket(webSocket);
    return () => {
      webSocket.close();
    };
  }, []);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {/* Left section with clickable logo to toggle sidebar */}
        <Box display="flex" alignItems="center">
          <Box
            onClick={toggleSidebar}
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#e0e0e0',
              borderRadius: '50%',
              marginRight: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 'bold', ml: 2, display: { xs: isSearchOpen ? 'none' : 'block', md: 'block' } }}
          >
            {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}
          </Typography>
        </Box>

        {/* Search bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: { xs: isSearchOpen ? '100%' : 'auto', md: '400px' },
            ml: 'auto',
            justifyContent: 'flex-end',
          }}
        >
          {isSearchOpen || !isMobile ? (
            <>
              <InputBase
                autoFocus={isMobile && isSearchOpen} // Autofocus only on mobile when open
                placeholder="Search by anything"
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0 12px',
                  height: 40,
                  width: '100%',
                  display: { xs: 'block', md: 'block' }, // Always show on desktop
                }}
              />
              {isMobile && (
                <IconButton
                  onClick={handleSearchToggle} // Close the search bar on mobile when close button clicked
                  sx={{
                    height: 40,
                    borderRadius: 0,
                    color: '#333',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </>
          ) : (
            <IconButton
              onClick={handleSearchToggle} // Open search bar on mobile
              sx={{
                color: '#007bff',
                display: { xs: 'block', md: 'none' }, // Only show search button on mobile
              }}
            >
              <SearchIcon />
            </IconButton>
          )}
        </Box>

        {/* Right section with icons */}
        <Box display="flex" alignItems="center">
          {!isMobile && (
            <>
              <IconButton onClick={handleNotificationsClick} sx={{ mr: 2 }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchorEl}
                open={notificationOpen}
                onClose={handleNotificationsClose}
                PaperProps={{
                  elevation: 1,
                  sx: {
                    overflow: 'visible',
                    mt: 1.5,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Notifications
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleClearAllNotifications}
                    sx={{ color: 'red', fontSize: '0.8rem', textTransform: 'none' }}
                  >
                    Clear All
                  </Button>
                </Box>
                <Divider />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <MenuItem
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ backgroundColor: notification.read ? 'inherit' : '#f5f5f5' }}
                    >
                      {notification.message}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem>
                    <Typography variant="body2">No new notifications</Typography>
                  </MenuItem>
                )}
              </Menu>

              <IconButton sx={{ mr: 2 }}>
                <HelpOutlineIcon />
              </IconButton>
              <ClockInOutButtons />
              <IconButton onClick={handleLogout} title="Logout" sx={{ mr: 2 }}>
                <LogoutIcon />
              </IconButton>
            </>
          )}
        </Box>

        {/* Avatar dropdown button */}
        <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
          <Avatar sx={{ bgcolor: '#007bff' }}>A</Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
