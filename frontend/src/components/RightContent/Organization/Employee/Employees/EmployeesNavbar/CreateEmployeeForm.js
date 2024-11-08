import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import api from '../../../../../../services/api';

// Import step components
import EmployeeBasicInfoStep from './Create/EmployeeBasicInfoStep';
import EmployeePersonalDetailsStep from './Create/EmployeePersonalDetailsStep';
import EmployeeJobDetailsStep from './Create/EmployeeJobDetailsStep.js';
import EmployeeDocumentUploadStep from './Create/EmployeeDocumentUploadStep';

const CreateEmployeeForm = ({ open, handleClose, onEmployeeCreated, employee }) => {
  const [activeStep, setActiveStep] = useState(0); // Stepper state
  const steps = ['Basic Info', 'Personal Details', 'Job Details', 'Document Upload'];

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  // Combined form data state
  const [formData, setFormData] = useState({
    // Employee model fields
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    dateJoined: '',
    profilePicture: null,
    preview: '',

    // EmployeePersonalDetails model fields
    personalDetails: {
      dateOfBirth: '',
      gender: '',
      address: '',
      country: '',
      city: '',
      experience: '',
    },

    // EmployeeJobDetails model fields
    jobDetails: {
      shift: '',
      workType: '',
      employeeType: '',
      salary: '',
    },

    // Documents
    documents: {
      aadhaar: null,
      passport: null,
    },
  });

  // Fetch departments and positions when the component is mounted
  useEffect(() => {
    const fetchDepartmentsAndPositions = async () => {
      try {
        const departmentResponse = await api.get('/departments/departments/');
        setDepartments(departmentResponse.data);

        const positionResponse = await api.get('/departments/positions/');
        setPositions(positionResponse.data);
      } catch (error) {
        console.error('Error fetching departments or positions:', error);
      }
    };
    fetchDepartmentsAndPositions();

    if (employee) {
      console.log("empl_create",employee)
      setFormData((prevData) => ({
        ...prevData,
        firstName: employee.user.first_name,
        lastName: employee.user.last_name,
        email: employee.user.email,
        department: employee.department || '',
        position: employee.position || '',
        dateJoined: employee.date_joined,
        preview: employee.image || '',

        // Populate personalDetails and jobDetails if available
        personalDetails: {
          dateOfBirth: employee.personal_details?.date_of_birth || '',
          gender: employee.personal_details?.gender || '',
          address: employee.personal_details?.address || '',
          country: employee.personal_details?.country || '',
          city: employee.personal_details?.city || '',
          experience: employee.personal_details?.experience || '',
        },
        jobDetails: {
          shift: employee.job_details?.shift || '',
          workType: employee.job_details?.work_type || '',
          employeeType: employee.job_details?.employee_type || '',
          salary: employee.job_details?.salary || '',
        },
      }));
      
    } else {
      // Reset form data
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        position: '',
        dateJoined: '',
        profilePicture: null,
        preview: '',
        personalDetails: {
          dateOfBirth: '',
          gender: '',
          address: '',
          country: '',
          city: '',
          experience: '',
        },
        jobDetails: {
          shift: '',
          workType: '',
          employeeType: '',
          salary: '',
        },
        documents: {
          aadhaar: null,
          passport: null,
        },
      });
    }
  }, [employee]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  // Handle nested form input changes
  const handleNestedChange = (section, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: { ...prevData[section], [field]: value },
    }));
  };

  // Handle profile picture change and preview
  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleChange('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('preview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document uploads
  const handleDocumentChange = (field, file) => {
    setFormData((prevData) => ({
      ...prevData,
      documents: { ...prevData.documents, [field]: file },
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('first_name', formData.firstName);
    submitData.append('last_name', formData.lastName);
    submitData.append('email', formData.email);
    submitData.append('username', formData.email);
    submitData.append('department', formData.department);
    submitData.append('position', formData.position);
    submitData.append('date_joined', formData.dateJoined);

    // Append personalDetails fields
    for (const key in formData.personalDetails) {
      submitData.append(`personal_details.${key}`, formData.personalDetails[key]);
    }

    // Append jobDetails fields
    for (const key in formData.jobDetails) {
      submitData.append(`job_details.${key}`, formData.jobDetails[key]);
    }

    // Append documents
    if (formData.documents.aadhaar) {
      submitData.append('aadhaar', formData.documents.aadhaar);
    }
    if (formData.documents.passport) {
      submitData.append('passport', formData.documents.passport);
    }

    if (formData.profilePicture) {
      submitData.append('profile_picture', formData.profilePicture);
    }

    // Logging FormData entries for debugging
    for (let pair of submitData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      if (employee) {
        await api.put(`employees/employees/${employee.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Employee updated successfully');
      } else {
        await api.post('employees/employees/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Employee created successfully');
      }
      onEmployeeCreated();
      handleClose();
      setActiveStep(0); // Reset to first step after submission
    } catch (error) {
      console.error('Error submitting employee form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  console.log("create_empl_finalform:",formData)
  // Step content rendering
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <EmployeeBasicInfoStep
            formData={formData}
            handleChange={handleChange}
            departments={departments}
            positions={positions}
            handleProfilePictureChange={handleProfilePictureChange}
          />
        );
      case 1:
        return (
          <EmployeePersonalDetailsStep
            formData={formData}
            handleNestedChange={handleNestedChange}
          />
        );
      case 2:
        return (
          <EmployeeJobDetailsStep
            formData={formData}
            handleNestedChange={handleNestedChange}
          />
        );
      case 3:
        return (
          <EmployeeDocumentUploadStep
            formData={formData}
            handleDocumentChange={handleDocumentChange}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 4,
          width: 700,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2>{employee ? 'Edit Employee' : 'Create Employee'}</h2>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mt: 2 }}>{getStepContent(activeStep)}</Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="contained"
            color="secondary"
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : employee ? 'Update Employee' : 'Create Employee'}
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateEmployeeForm;
