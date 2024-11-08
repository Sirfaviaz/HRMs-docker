// EmployeeJobDetailsStep.js
import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EmployeeJobDetailsStep = ({ formData, handleNestedChange }) => {
  return (
    <Grid container spacing={2}>
      {/* Shift */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Shift"
          value={formData.jobDetails.shift}
          onChange={(e) => handleNestedChange('jobDetails', 'shift', e.target.value)}
          required
        />
      </Grid>

      {/* Work Type */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Work Type"
          value={formData.jobDetails.workType}
          onChange={(e) => handleNestedChange('jobDetails', 'workType', e.target.value)}
          required
        />
      </Grid>

      {/* Employee Type */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Employee Type</InputLabel>
          <Select
            value={formData.jobDetails.employeeType || ''}
            onChange={(e) => handleNestedChange('jobDetails', 'employeeType', e.target.value)}
            required
          >
            <MenuItem value="Permanent">Permanent</MenuItem>
            <MenuItem value="Contract">Contract</MenuItem>
            <MenuItem value="Intern">Intern</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Salary */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Salary"
          type="number"
          inputProps={{ step: '0.01' }}
          value={formData.jobDetails.salary}
          onChange={(e) => handleNestedChange('jobDetails', 'salary', e.target.value)}
          required
        />
      </Grid>
    </Grid>
  );
};

export default EmployeeJobDetailsStep;
