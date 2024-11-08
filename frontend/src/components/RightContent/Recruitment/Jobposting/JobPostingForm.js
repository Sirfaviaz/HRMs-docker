import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../../../../services/api'; // Assuming you have an API service for making requests

// Align employment types with back-end choices
const employmentTypeOptions = [
  { id: 'full_time', label: 'Full Time' },
  { id: 'part_time', label: 'Part Time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
];

const JobPostingForm = ({ initialValues = {}, onSubmit, departments, positions, employees }) => {
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    department: '',
    position: '',
    location: '',
    employment_type: '',
    closing_date: null,
    is_active: true,
    incharge_employee: '',
    stage_set: '', // New field for stage_set selection
  });

  const [stages, setStages] = useState([]); // State to store stages

  useEffect(() => {
    // Fetch stageset when component mounts
    const fetchStages = async () => {
      try {
        const response = await api.get('/jobs/stage-sets/'); // Adjust API endpoint as needed
        setStages(response.data);

        // Set form values based on initialValues when editing
        if (initialValues) {
          setFormValues({
            title: initialValues?.title || '',
            description: initialValues?.description || '',
            department: initialValues?.department || '',  // Ensure department is properly set
            position: initialValues?.position || '',  // Ensure position is properly set
            location: initialValues?.location || '',
            employment_type: initialValues?.employment_type || '',
            closing_date: initialValues?.closing_date ? dayjs(initialValues.closing_date) : null,
            is_active: initialValues?.is_active ?? true,
            incharge_employee: initialValues?.incharge_employee || '',  // Ensure employee is properly set
            stage_set: initialValues?.stage_set?.id || '', // Initialize stage_set with the previously selected value
          });
        }
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };

    fetchStages();
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    // Build the submission object
    const submissionValues = {
      ...formValues,
      closing_date: formValues.closing_date ? formValues.closing_date.format('YYYY-MM-DD') : null,
    };

    onSubmit(submissionValues);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleFormSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Job Title"
              value={formValues.title}
              onChange={(e) => handleChange('title', e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Job Description"
              value={formValues.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Department Dropdown */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formValues.department}
                onChange={(e) => handleChange('department', e.target.value)}
                label="Department"
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
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={formValues.position}
                onChange={(e) => handleChange('position', e.target.value)}
                label="Position"
              >
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location TextField */}
          <Grid item xs={6}>
            <TextField
              label="Location"
              value={formValues.location}
              onChange={(e) => handleChange('location', e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Incharge Employee Dropdown */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Incharge Employee</InputLabel>
              <Select
                value={formValues.incharge_employee}
                onChange={(e) => handleChange('incharge_employee', e.target.value)}
                label="Incharge Employee"
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.user.first_name + ' ' + emp.user.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Employment Type Dropdown */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={formValues.employment_type}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                label="Employment Type"
              >
                {employmentTypeOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Closing Date DatePicker */}
          <Grid item xs={6}>
            <DatePicker
              label="Closing Date"
              value={formValues.closing_date}
              onChange={(newValue) => handleChange('closing_date', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          {/* Stage Set Dropdown */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Stage Set</InputLabel>
              <Select
                value={formValues.stage_set}
                onChange={(e) => handleChange('stage_set', e.target.value)}
                label="Stage Set"
              >
                {stages.map((stage) => (
                  <MenuItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary">
            {initialValues?.id ? 'Update' : 'Create'}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default JobPostingForm;
