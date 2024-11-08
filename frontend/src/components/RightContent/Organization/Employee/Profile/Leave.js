import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, List, ListItem, ListItemText, CircularProgress, Modal } from '@mui/material';
import api from '../../../../../services/api';  // Import the API instance

const EmployeeLeaveRequest = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Fetch leave requests for the logged-in employee
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('attendance/leave-requests/');
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Handle leave request form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { start_date: startDate, end_date: endDate, reason: reason };
      console.log("data", data);
      await api.post('attendance/leave-requests/', data);  // Use the API instance for POST request
      fetchLeaveRequests();  // Refresh leave requests after submitting
      setStartDate('');
      setEndDate('');
      setReason('');
      handleCloseModal();  // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Your Leave Requests</Typography>
      <Button variant="contained" onClick={handleOpenModal} sx={{ mt: 2 }}>
        Apply for Leave
      </Button>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
          }}
        >
          <Typography variant="h5">Apply for Leave</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Submit Request
            </Button>
          </form>
        </Box>
      </Modal>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Your Leave Requests</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {leaveRequests.map((request) => (
              <ListItem key={request.id}>
                <ListItemText
                  primary={`From ${request.start_date} to ${request.end_date}`}
                  secondary={`Reason: ${request.reason} | Status: ${request.status}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeLeaveRequest;
