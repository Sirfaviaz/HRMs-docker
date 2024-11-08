// EmployeeBasicInfoStep.js
import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';

const EmployeeBasicInfoStep = ({
  formData,
  handleChange,
  departments,
  positions,
  handleProfilePictureChange,
}) => {
  console.log("basic_formdata", formData, "hc",handleChange, departments,positions)
  return (
    <Grid container spacing={2}>
      {/* Profile Picture */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="profile-picture-upload"
          type="file"
          onChange={handleProfilePictureChange}
        />
        <label htmlFor="profile-picture-upload">
          <Avatar
            src={formData.preview || '/placeholder.jpg'}
            sx={{ width: 100, height: 100, cursor: 'pointer' }}
          />
        </label>
      </Grid>

      {/* First Name */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName || ''}  
          onChange={(e) => handleChange('firstName', e.target.value)}
          required
        />
      </Grid>

      {/* Last Name */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName || ''}  
          onChange={(e) => handleChange('lastName', e.target.value)}
          required
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email"
          value={formData.email || ''}  
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />
      </Grid>

      {/* Department Dropdown */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Department</InputLabel>
          <Select
            value={formData.department || ''} 
            onChange={(e) => handleChange('department', e.target.value)}
            required
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Position Dropdown */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Position</InputLabel>
          <Select
            value={formData.position || ''}  
            onChange={(e) => handleChange('position', e.target.value)}
            required
          >
            {positions.map((pos) => (
              <MenuItem key={pos.id} value={pos.id}>
                {pos.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Date Joined */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date Joined"
          type="date"
          value={formData.dateJoined || ''}  
          onChange={(e) => handleChange('dateJoined', e.target.value)}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default EmployeeBasicInfoStep;
