// EmployeeDocumentUploadStep.js
import React from 'react';
import { Grid, Button, Typography } from '@mui/material';

const EmployeeDocumentUploadStep = ({ formData, handleDocumentChange }) => {
  return (
    <Grid container spacing={2}>
      {/* Aadhaar Upload */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1">Upload Aadhaar</Typography>
        <input
          accept="application/pdf,image/*"
          style={{ display: 'none' }}
          id="aadhaar-upload"
          type="file"
          onChange={(e) => handleDocumentChange('aadhaar', e.target.files[0])}
        />
        <label htmlFor="aadhaar-upload">
          <Button variant="contained" component="span">
            Choose File
          </Button>
        </label>
        {formData.documents.aadhaar && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {formData.documents.aadhaar.name}
          </Typography>
        )}
      </Grid>

      {/* Passport Upload */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1">Upload Passport</Typography>
        <input
          accept="application/pdf,image/*"
          style={{ display: 'none' }}
          id="passport-upload"
          type="file"
          onChange={(e) => handleDocumentChange('passport', e.target.files[0])}
        />
        <label htmlFor="passport-upload">
          <Button variant="contained" component="span">
            Choose File
          </Button>
        </label>
        {formData.documents.passport && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {formData.documents.passport.name}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default EmployeeDocumentUploadStep;
