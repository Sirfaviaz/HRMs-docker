// EmployeePersonalDetailsStep.js
import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EmployeePersonalDetailsStep = ({ formData, handleNestedChange }) => {
  return (
    <Grid container spacing={2}>
      {/* Date of Birth */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={formData.personalDetails.dateOfBirth}
          onChange={(e) => handleNestedChange('personalDetails', 'dateOfBirth', e.target.value)}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>

      {/* Gender */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select
            value={formData.personalDetails.gender || ''}
            onChange={(e) => handleNestedChange('personalDetails', 'gender', e.target.value)}
            required
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Address */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={formData.personalDetails.address}
          onChange={(e) => handleNestedChange('personalDetails', 'address', e.target.value)}
          required
          multiline
          rows={2}
        />
      </Grid>

      {/* Country */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Country"
          value={formData.personalDetails.country}
          onChange={(e) => handleNestedChange('personalDetails', 'country', e.target.value)}
          required
        />
      </Grid>

      {/* City */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.personalDetails.city}
          onChange={(e) => handleNestedChange('personalDetails', 'city', e.target.value)}
          required
        />
      </Grid>

      {/* Experience */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Experience (years)"
          type="number"
          inputProps={{ step: '0.1' }}
          value={formData.personalDetails.experience}
          onChange={(e) => handleNestedChange('personalDetails', 'experience', e.target.value)}
          required
        />
      </Grid>
    </Grid>
  );
};

export default EmployeePersonalDetailsStep;
