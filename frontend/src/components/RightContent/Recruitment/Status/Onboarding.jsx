import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, IconButton, Menu, MenuItem, Dialog, 
  DialogTitle, DialogContent, TextField, Button, Select, InputLabel, FormControl 
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';  // Three-dot icon
import api from '../../../../services/api'; // Assuming you have an API service for making requests

const Onboarding = () => {
  const [candidates, setCandidates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);  // State to control which card's menu is open
  const [selectedCandidate, setSelectedCandidate] = useState(null);  // Candidate whose contract we are filling
  const [openDialog, setOpenDialog] = useState(false);  // State to control dialog visibility
  const [contractDetails, setContractDetails] = useState({
    salary: '',
    workshift: '',
    worktype: '',
    employee_type: '',
    contract_start_date: '',
    contract_end_date: '',
  });

  // Workshift options as per the backend choices
  const workshiftOptions = [
    { value: 'Day', label: 'Day Shift' },
    { value: 'Night', label: 'Night Shift' },
    { value: 'Rotating', label: 'Rotating Shift' },
  ];

  // Worktype options as per the backend choices
  const worktypeOptions = [
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'Contract', label: 'Contract' },
  ];

  // Employee type options as per the backend choices
  const employeeTypeOptions = [
    { value: 'Permanent', label: 'Permanent' },
    { value: 'Temporary', label: 'Temporary' },
    { value: 'Intern', label: 'Intern' },
  ];

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get('jobs/candidates/for-onboarding/');  // Custom endpoint to fetch passed candidates
        setCandidates(response.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
    fetchCandidates();
  }, []);

  const handleMenuClick = async (event, candidate) => {
    setAnchorEl(event.currentTarget);  // Open the menu for the clicked candidate
    setSelectedCandidate(candidate);

    // Fetch the contract details if already present
    try {
      const response = await api.get(`/jobs/contracts/${candidate.id}/`);
      setContractDetails({
        salary: response.data.salary || '',
        workshift: response.data.workshift || '',
        worktype: response.data.worktype || '',
        employee_type: response.data.employee_type || '',
        contract_start_date: response.data.contract_start_date || '',
        contract_end_date: response.data.contract_end_date || '',
      });
      // Update the selected candidate with contract_id if present
      setSelectedCandidate((prev) => ({
        ...prev,
        contract_id: response.data.id,  // Store the contract ID
      }));
    } catch (error) {
      // If no contract exists, reset the form
      setContractDetails({
        salary: '',
        workshift: '',
        worktype: '',
        employee_type: '',
        contract_start_date: '',
        contract_end_date: '',
      });
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
    handleMenuClose();  // Close the menu when opening the modal
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    // Reset contract details to avoid any data persistence in the form
    setContractDetails({
      salary: '',
      workshift: '',
      worktype: '',
      employee_type: '',
      contract_start_date: '',
      contract_end_date: '',
    });
  };

  const handleContractChange = (field, value) => {
    setContractDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Save contract details without sending the email
  const handleSaveContract = async () => {
    if (!selectedCandidate) return; // Ensure a candidate is selected

    try {
      const response = await api.post('/jobs/contracts/', {
        ...contractDetails,
        candidate_application: selectedCandidate.id,  // Send the candidate application ID
      });
      alert('Contract saved successfully!');
      // Update selected candidate with the new contract ID
      setSelectedCandidate((prev) => ({
        ...prev,
        contract_id: response.data.id,
      }));
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Failed to save contract.');
    }
  };

  // Save contract and send email
  const handleSendOffer = async () => {
    if (!selectedCandidate || !selectedCandidate.contract_id) {
      alert('Please save the contract first.');
      return;
    }

    try {
      const response = await api.post(`/jobs/contracts/${selectedCandidate.contract_id}/generate-offer-letter/`);
    
      alert('Offer letter sent successfully!');
    } catch (error) {
      console.error('Error sending offer letter:', error);
      alert('Failed to send offer letter.');
    }
    handleDialogClose();
  };

  return (
    <Box>
      <Typography variant="h5">Onboarding Candidates</Typography>
      {candidates.length === 0 ? (
        <Typography>No candidates ready for onboarding.</Typography>
      ) : (
        <Grid container spacing={2}>
          {candidates.map((candidate) => (
            <Grid item xs={12} sm={6} key={candidate.id}>
              <Paper sx={{ padding: 2, position: 'relative' }}>
                <Typography variant="h6">
                  {candidate.first_name} {candidate.last_name}
                </Typography>
                <Typography>Email: {candidate.email}</Typography>
                <Typography>Job Title: {candidate.job_posting_title}</Typography>

                {/* Three-Dot Menu */}
                <IconButton
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                  onClick={(event) => handleMenuClick(event, candidate)}
                >
                  <MoreVertIcon />
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleDialogOpen}>Fill Contract</MenuItem>
                </Menu>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog for Filling Contract Details */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Fill Contract Details</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              label="Salary"
              fullWidth
              margin="normal"
              value={contractDetails.salary}
              onChange={(e) => handleContractChange('salary', e.target.value)}
            />
            
            {/* Workshift Dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Workshift</InputLabel>
              <Select
                value={contractDetails.workshift}
                onChange={(e) => handleContractChange('workshift', e.target.value)}
              >
                {workshiftOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Worktype Dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Work Type</InputLabel>
              <Select
                value={contractDetails.worktype}
                onChange={(e) => handleContractChange('worktype', e.target.value)}
              >
                {worktypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Employee Type Dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee Type</InputLabel>
              <Select
                value={contractDetails.employee_type}
                onChange={(e) => handleContractChange('employee_type', e.target.value)}
              >
                {employeeTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Contract Start Date */}
            <TextField
              label="Start Date"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={contractDetails.contract_start_date}
              onChange={(e) => handleContractChange('contract_start_date', e.target.value)}
            />

            {/* Contract End Date */}
            <TextField
              label="End Date"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={contractDetails.contract_end_date}
              onChange={(e) => handleContractChange('contract_end_date', e.target.value)}
            />
          </Box>
        </DialogContent>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          {/* Save Contract Button */}
          <Button onClick={handleSaveContract} color="secondary" variant="contained">
            Save Contract
          </Button>

          {/* Send Offer Email Button */}
          <Button onClick={handleSendOffer} color="primary" variant="contained">
            Send Offer Email
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Onboarding;
