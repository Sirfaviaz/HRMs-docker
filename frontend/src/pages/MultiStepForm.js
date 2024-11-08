import React, { useState, useEffect } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, TextField, Grid, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Assuming you have an API service for making requests

const steps = ['Personal Details', 'Upload Documents', 'Review & Confirm'];

const MultiStepForm = () => {
  const { uid, token } = useParams(); // Get uid and token from the URL
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    country: '',
    city: '',
    experience: '',
    adhaarName: '',   // New field for Aadhaar name
    adhaar: null,     // Aadhaar file upload
    pan: null,        // PAN file upload
  });
  const [tokenValid, setTokenValid] = useState(false); // Track token validity
  const [loading, setLoading] = useState(true); // Loading state for employee data

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Validate the token
        const tokenResponse = await api.get(`employees/validate-token/${uid}/${token}`);
        if (tokenResponse.status === 200) {
          const { first_name, last_name } = tokenResponse.data;

          // Pre-fill form data with first_name and last_name
          setFormData((prevData) => ({
            ...prevData,
            firstName: first_name,
            lastName: last_name,
          }));

          setTokenValid(true);
        }
      } catch (error) {
        alert('Invalid or expired token.');
        navigate('/'); // Redirect if token is invalid
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [uid, token, navigate]);

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name } = event.target;
    const file = event.target.files[0];
    setFormData((prevData) => ({ ...prevData, [name]: file }));
  };

  const handleSubmit = async () => {
    if (!formData.adhaar || !formData.pan) {
      alert('Please upload both Aadhaar and PAN documents.');
      return;
    }
    
    const form = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        form.append(key, formData[key]);
      }
    }
  
    // Log the form data to inspect the content before submission
    for (let pair of form.entries()) {
      console.log(pair[0]+ ', ' + pair[1]); 
    }
  
    try {
      await api.post(`employees/submit-info/${uid}/${token}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Data submitted successfully!');
      navigate('/'); // Redirect to home after submission
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      {tokenValid && (
        <>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Typography variant="h6">Form completed!</Typography>
          ) : (
            <Box sx={{ mt: 4 }}>
              {activeStep === 0 && (
                <PersonalDetailsForm formData={formData} handleInputChange={handleInputChange} />
              )}
              {activeStep === 1 && (
                <DocumentsUploadForm formData={formData} handleFileChange={handleFileChange} />
              )}
              {activeStep === 2 && <ReviewForm formData={formData} />}
              <Box sx={{ mt: 2 }}>
                <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" onClick={handleSubmit}>
                    Submit
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

// Personal Details Form Component
const PersonalDetailsForm = ({ formData, handleInputChange }) => (
  <Box>
    <Typography variant="h6">Personal Details</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={formData.firstName}
          disabled // Make this field non-editable
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          disabled // Make this field non-editable
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          select
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Aadhaar Name"
          name="adhaarName"  // New field for Aadhaar name
          value={formData.adhaarName}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="City"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
        />
      </Grid>
    </Grid>
  </Box>
);

// Document Upload Form Component
const DocumentsUploadForm = ({ formData, handleFileChange }) => (
  <Box>
    <Typography variant="h6">Upload Documents</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Button variant="contained" component="label">
          Upload Aadhaar
          <input
            hidden
            accept="image/*,application/pdf"  // Only accept .pdf or image files
            type="file"
            name="adhaar"
            onChange={handleFileChange}
          />
        </Button>
        {formData.adhaar && (
          <Typography variant="body2" sx={{ mt: 2 }}>{formData.adhaar.name}</Typography>
        )}
      </Grid>
      <Grid item xs={12} md={6}>
        <Button variant="contained" component="label">
          Upload PAN
          <input
            hidden
            accept="image/*,application/pdf"  // Only accept .pdf or image files
            type="file"
            name="pan"
            onChange={handleFileChange}
          />
        </Button>
        {formData.pan && (
          <Typography variant="body2" sx={{ mt: 2 }}>{formData.pan.name}</Typography>
        )}
      </Grid>
    </Grid>
  </Box>
);

// Review & Confirm Component
const ReviewForm = ({ formData }) => (
  <Box>
    <Typography variant="h6">Review & Confirm</Typography>
    <Typography variant="body1">
      <strong>First Name:</strong> {formData.firstName}
    </Typography>
    <Typography variant="body1">
      <strong>Last Name:</strong> {formData.lastName}
    </Typography>
    <Typography variant="body1">
      <strong>Aadhaar Name:</strong> {formData.adhaarName}
    </Typography>
    <Typography variant="body1">
      <strong>Documents:</strong> Aadhaar - {formData.adhaar?.name}, PAN - {formData.pan?.name}
    </Typography>
    {/* Display other fields similarly */}
  </Box>
);

export default MultiStepForm;
