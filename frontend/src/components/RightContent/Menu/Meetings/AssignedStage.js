import React, { useState, useEffect } from 'react';
import api from '../../../../services/api'; // Adjust the import path as needed
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const AssignedStages = () => {
  const [assignedStages, setAssignedStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    fetchAssignedStages();
  }, []);

  const fetchAssignedStages = async () => {
    try {
      const response = await api.get('/jobs/candidate-stages/assigned-stages/');
      console.log(response.data);
      setAssignedStages(response.data);
    } catch (error) {
      console.error('Error fetching assigned stages:', error);
    }
  };

  const handleEditDialogOpen = (stage) => {
    setSelectedStage(stage);
    setResult(stage.result);
    setShowEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setSelectedStage(null);
  };

  const handleResultChange = (e) => {
    setResult(e.target.value);
  };

  const handleEditResultSubmit = async () => {
    if (!selectedStage) return;

    try {
      await api.patch(`/jobs/candidate-stages/${selectedStage.id}/`, {
        result,
      });
      fetchAssignedStages(); // Refresh the list after editing
      handleEditDialogClose();
    } catch (error) {
      console.error('Error updating stage result:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Stages Assigned to Me
      </Typography>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Stage Name</TableCell>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Job Posting</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Assigned At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignedStages.length > 0 ? (
              assignedStages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>{stage?.stage?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {stage?.candidate_application?.first_name} {stage?.candidate_application?.last_name}
                  </TableCell>
                  <TableCell>
                    {stage?.candidate_application?.job_posting?.title || 'N/A'}
                  </TableCell>
                  <TableCell>{stage?.result || 'Pending'}</TableCell>
                  <TableCell>
                    {stage?.assigned_at ? new Date(stage.assigned_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditDialogOpen(stage)}
                    >
                      Edit Result
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography>No stages assigned to you.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Result Dialog */}
      <Dialog open={showEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Stage Result</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="result-label">Result</InputLabel>
            <Select
              labelId="result-label"
              value={result}
              onChange={handleResultChange}
              fullWidth
            >
              <MenuItem value="Pass">Pass</MenuItem>
              <MenuItem value="Fail">Fail</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditResultSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AssignedStages;
