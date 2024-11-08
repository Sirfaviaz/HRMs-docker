import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, MenuItem, Select, FormControl, InputLabel, Typography, Link } from '@mui/material';
import { Upload } from '@mui/icons-material';

const CandidateForm = ({ initialValues = {}, onSubmit, onClose, jobPostings }) => {
  console.log("init_val", initialValues);
  
  // Set initial form data
  const [formData, setFormData] = useState({
    job_posting: initialValues?.job_posting || '', // Assuming job_posting is an ID
    first_name: initialValues?.first_name || '',
    last_name: initialValues?.last_name || '',
    email: initialValues?.email || '',
    resume: null,
    cover_letter: initialValues?.cover_letter || '',
    status: initialValues?.status || 'Applied',
  });

  // Update formData when initialValues change (e.g., when switching to edit mode)
  useEffect(() => {
    setFormData({
      job_posting: initialValues?.job_posting || '', // Set job_posting as ID, not an object
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      email: initialValues?.email || '',
      resume: null,
      cover_letter: initialValues?.cover_letter || '',
      status: initialValues?.status || 'Applied',
    });
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, resume: file }));
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const submissionData = new FormData();

    // Append non-file fields to FormData
    submissionData.append('job_posting', formData.job_posting);
    submissionData.append('first_name', formData.first_name);
    submissionData.append('last_name', formData.last_name);
    submissionData.append('email', formData.email);
    submissionData.append('cover_letter', formData.cover_letter);
    submissionData.append('status', formData.status);

    // Append file field only if a new file is selected
    if (formData.resume && formData.resume instanceof File) {
      submissionData.append('resume', formData.resume);
    }

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleFormSubmit} encType="multipart/form-data">
      {/* Job Posting Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel>Job Posting</InputLabel>
        <Select
          value={formData.job_posting}
          onChange={(e) => handleChange('job_posting', e.target.value)}
          label="Job Posting"
        >
          {jobPostings.map((job) => (
            <MenuItem key={job.id} value={job.id}>
              {job.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* First Name */}
      <TextField
        label="First Name"
        value={formData.first_name}
        onChange={(e) => handleChange('first_name', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      {/* Last Name */}
      <TextField
        label="Last Name"
        value={formData.last_name}
        onChange={(e) => handleChange('last_name', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      {/* Email */}
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      {/* Resume File Upload */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" component="label" startIcon={<Upload />}>
          Upload Resume
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {formData.resume && formData.resume instanceof File && (
          <Typography variant="body2">Selected file: {formData.resume.name}</Typography>
        )}
        {initialValues?.resume && !(formData.resume instanceof File) && (
          <Box sx={{ mt: 1 }}>
            <Link href={initialValues.resume} target="_blank" rel="noopener" variant="body2">
              View Existing Resume
            </Link>
          </Box>
        )}
      </Box>

      {/* Cover Letter */}
      <TextField
        label="Cover Letter"
        value={formData.cover_letter}
        onChange={(e) => handleChange('cover_letter', e.target.value)}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      {/* Status Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel>Status</InputLabel>
        <Select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          label="Status"
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </Select>
      </FormControl>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          {initialValues?.id ? 'Update' : 'Create'}
        </Button>
        <Button onClick={onClose} variant="outlined" sx={{ ml: 2 }}>
          Cancel
        </Button>
      </Box>
    </form>
  );
};

export default CandidateForm;
