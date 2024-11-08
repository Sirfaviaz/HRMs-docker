import React, { useState, useEffect } from 'react';
import api from '../../../../services/api'; // Import the api service you created
import { Grid, Card, CardContent, Typography, Checkbox, Button, FormControlLabel, CircularProgress, Alert, Pagination, TextField } from '@mui/material';

const UserPermissions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);  // Track the current page
  const [searchTerm, setSearchTerm] = useState('');  // Track search term
  const [filters, setFilters] = useState({
    is_admin: false,
    is_hr: false,
    is_manager: false,
    is_staff: false,
  }); // Track permission filters
  const usersPerPage = 4;  // 2 rows * 2 columns = 4 users per page

  // Fetch users with their permissions
  useEffect(() => {
    api.get('/accounts/permissions/')
      .then(response => {
        setUsers(response.data);  // Set the users from the response
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  // Handle permission changes
  const handlePermissionChange = (userId, field, value) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, [field]: value } : user
    );
    setUsers(updatedUsers);
  };

  // Handle submit changes
  const handleSubmit = (userId) => {
    const user = users.find(user => user.id === userId);
    api.put(`/accounts/permissions/${userId}/`, user)
      .then(() => {
        alert('Permissions updated successfully!');
      })
      .catch(() => {
        alert('Failed to update permissions');
      });
  };

  // Handle pagination
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // Handle filter change
  const handleFilterChange = (field) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: !prevFilters[field],
    }));
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearchTerm =
      user.first_name.toLowerCase().includes(searchTerm) ||
      user.last_name.toLowerCase().includes(searchTerm) ||
      (user.email && user.email.toLowerCase().includes(searchTerm));

    // Permission filter
    const matchesPermissionFilter =
      (!filters.is_admin || user.is_admin) &&
      (!filters.is_hr || user.is_hr) &&
      (!filters.is_manager || user.is_manager) &&
      (!filters.is_staff || user.is_staff);

    return matchesSearchTerm && matchesPermissionFilter;
  });

  // Paginate users data
  const indexOfLastUser = page * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  if (loading) return <CircularProgress />;  // Show loading spinner while data is being fetched
  if (error) return <Alert severity="error">Error loading users: {error.message}</Alert>;  // Show error message if any

  return (
    <div>
      <Typography variant="h4" gutterBottom>User Permissions</Typography>

      {/* Search Field */}
      <TextField
        label="Search by name or email"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '20px' }}
      />

      {/* Filters */}
      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.is_admin}
                onChange={() => handleFilterChange('is_admin')}
              />
            }
            label="Admin"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.is_hr}
                onChange={() => handleFilterChange('is_hr')}
              />
            }
            label="HR"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.is_manager}
                onChange={() => handleFilterChange('is_manager')}
              />
            }
            label="Manager"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.is_staff}
                onChange={() => handleFilterChange('is_staff')}
              />
            }
            label="Staff"
          />
        </Grid>
      </Grid>

      {/* User Cards */}
      <Grid container spacing={3} style={{ padding: '16px' }}>
        {currentUsers.length > 0 ? currentUsers.map(user => (
          <Grid item xs={12} sm={6} key={user.id}>
            <Card 
              style={{ 
                minWidth: '250px',    // Set minimum width to control smaller card size
                maxWidth: '300px',    // Set max width to ensure consistent small size
                height: '200px',      // Fixed height for uniform card size
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between' // Ensure content spacing inside card
              }}
            >
              <CardContent>
                <Typography variant="h6">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body2">
                  {user.email || user.username || 'No Email/Username'}
                </Typography>

                {/* Permission checkboxes */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={user.is_admin}
                      onChange={(e) => handlePermissionChange(user.id, 'is_admin', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Is Admin"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={user.is_hr}
                      onChange={(e) => handlePermissionChange(user.id, 'is_hr', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Is HR"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={user.is_manager}
                      onChange={(e) => handlePermissionChange(user.id, 'is_manager', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Is Manager"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={user.is_staff}
                      onChange={(e) => handlePermissionChange(user.id, 'is_staff', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Is Staff"
                />
              </CardContent>

              {/* Submit Button - Positioned at the bottom */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSubmit(user.id)}
                style={{ margin: '0 16px 16px 16px' }} // Ensure consistent button placement
              >
                Update Permissions
              </Button>
            </Card>
          </Grid>
        )) : (
          <Typography variant="body1" style={{ margin: '20px' }}>
            No users match the current search or filter.
          </Typography>
        )}
      </Grid>

      {/* Pagination */}
      <Grid container justifyContent="center" style={{ marginTop: '20px' }}>
        <Pagination
          count={Math.ceil(filteredUsers.length / usersPerPage)}  // Calculate the number of pages based on filtered users
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </Grid>
    </div>
  );
};

export default UserPermissions;
