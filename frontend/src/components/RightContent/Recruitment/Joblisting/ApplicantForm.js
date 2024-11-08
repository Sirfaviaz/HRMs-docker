// src/components/ApplicantForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Upload } from '@mui/icons-material';
import api from '../../../../services/api';

const ApplicantForm = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    resume: null,  // File input
    cover_letter: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    setFormData((prev) => ({ ...prev, resume: event.target.files[0] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const submissionData = new FormData();
    for (let key in formData) {
      submissionData.append(key, formData[key]);
    }
    submissionData.append('job_posting', job.id);

    try {
      await api.post('/jobs/applications/', submissionData);
      onClose();  // Close the modal after submission
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <TextField
        label="First Name"
        value={formData.first_name}
        onChange={(e) => handleChange('first_name', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Last Name"
        value={formData.last_name}
        onChange={(e) => handleChange('last_name', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

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
      <Button variant="contained" component="label" startIcon={<Upload />} sx={{ mb: 2 }}>
        Upload Resume
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      {formData.resume && (
        <Typography variant="body2">Selected file: {formData.resume.name}</Typography>
      )}

      <TextField
        label="Cover Letter"
        value={formData.cover_letter}
        onChange={(e) => handleChange('cover_letter', e.target.value)}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary">
          Apply
        </Button>
      </Box>
    </form>
  );
};

export default ApplicantForm;
