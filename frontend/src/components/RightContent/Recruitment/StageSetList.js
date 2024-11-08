import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Adjust the import path as needed
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Box,
  MenuItem
} from '@mui/material';

const StageSetList = () => {
  const [stageSets, setStageSets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedStageSet, setSelectedStageSet] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showStageSetDialog, setShowStageSetDialog] = useState(false);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showEditStageDialog, setShowEditStageDialog] = useState(false);
  const [isEditingStageSet, setIsEditingStageSet] = useState(false);
  const [stageSetFormData, setStageSetFormData] = useState({ name: '', description: '' });
  const [stageFormData, setStageFormData] = useState({ name: '', description: '', order: 0, employeeId: '' });

  // Fetch all StageSets on component mount
  useEffect(() => {
    fetchStageSets();
  }, []);

  const fetchStageSets = async () => {
    try {
      const response = await api.get('/jobs/stage-sets/');
      setStageSets(response.data);
    } catch (error) {
      console.error('Error fetching stage sets:', error);
    }
  };

  // Fetch all employees when opening Stage Dialog
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/employees/');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Handle StageSet Dialog
  const handleStageSetDialogOpen = (stageSet = null) => {
    if (stageSet) {
      setIsEditingStageSet(true);
      setStageSetFormData({ name: stageSet.name, description: stageSet.description });
      setSelectedStageSet(stageSet);
    } else {
      setIsEditingStageSet(false);
      setStageSetFormData({ name: '', description: '' });
    }
    setShowStageSetDialog(true);
  };

  const handleStageSetDialogClose = () => {
    setShowStageSetDialog(false);
    setSelectedStageSet(null);
  };

  const handleStageSetFormChange = (e) => {
    setStageSetFormData({ ...stageSetFormData, [e.target.name]: e.target.value });
  };

  const handleStageSetFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingStageSet && selectedStageSet) {
        // Update existing StageSet
        await api.put(`/jobs/stage-sets/${selectedStageSet.id}/`, stageSetFormData);
      } else {
        // Create new StageSet
        await api.post('/jobs/stage-sets/', stageSetFormData);
      }
      fetchStageSets();
      handleStageSetDialogClose();
    } catch (error) {
      console.error('Error saving stage set:', error);
    }
  };

  // Handle Stage Dialog
  const handleStageDialogOpen = (stageSet) => {
    setSelectedStageSet(stageSet);
    setStageFormData({ name: '', description: '', order: 0, employeeId: '' });
    fetchEmployees(); // Fetch employees when opening the dialog
    setShowStageDialog(true);
  };

  const handleStageDialogClose = () => {
    setShowStageDialog(false);
    setSelectedStageSet(null);
  };

  const handleStageFormChange = (e) => {
    setStageFormData({ ...stageFormData, [e.target.name]: e.target.value });
  };

  const handleStageFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const stageData = {
        name: stageFormData.name,
        description: stageFormData.description,
        order: stageFormData.order,
        stage_set: selectedStageSet.id,
        employee: stageFormData.employeeId,
      };
      await api.post('/jobs/stages/', stageData);
      fetchStageSets();
      handleStageDialogClose();
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  // Handle Stage Edit Dialog
  const handleEditStageDialogOpen = (stage) => {
    setSelectedStage(stage);
    setStageFormData({
      name: stage.name,
      description: stage.description,
      order: stage.order,
      employeeId: stage.employee || '',
    });
    fetchEmployees();
    setShowEditStageDialog(true);
  };

  const handleEditStageDialogClose = () => {
    setShowEditStageDialog(false);
    setSelectedStage(null);
  };

  const handleEditStageFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const stageData = {
        name: stageFormData.name,
        description: stageFormData.description,
        order: stageFormData.order,
        employee: stageFormData.employeeId,
      };
      await api.put(`/jobs/stages/${selectedStage.id}/`, stageData);
      fetchStageSets();
      handleEditStageDialogClose();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  // Delete an existing Stage
  const deleteStage = async (id) => {
    if (window.confirm('Are you sure you want to delete this Stage?')) {
      try {
        await api.delete(`/jobs/stages/${id}/`);
        fetchStageSets();
      } catch (error) {
        console.error('Error deleting stage:', error);
      }
    }
  };

  // Delete an existing Stage Set
  const deleteStageSet = async (id) => {
    if (window.confirm('Are you sure you want to delete this Stage Set?')) {
      try {
        await api.delete(`/jobs/stage-sets/${id}/`);
        fetchStageSets();
      } catch (error) {
        console.error('Error deleting stage set:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Stage Sets
      </Typography>
      <Button variant="contained" color="primary" onClick={() => handleStageSetDialogOpen()}>
        Create Stage Set
      </Button>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Stages</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stageSets.map((stageSet) => (
              <TableRow key={stageSet.id}>
                <TableCell>{stageSet.name}</TableCell>
                <TableCell>{stageSet.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {stageSet.stages && stageSet.stages.length > 0 ? (
                      stageSet.stages.map((stage) => (
                        <Chip
                          key={stage.id}
                          label={`${stage.order}. ${stage.name}`}
                          onClick={() => handleEditStageDialogOpen(stage)}
                          color="primary"
                          style={{ cursor: 'pointer' }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2">No stages available</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleStageDialogOpen(stageSet)}
                    style={{ marginRight: '8px' }}
                  >
                    Add Stage
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => handleStageSetDialogOpen(stageSet)}
                    style={{ marginRight: '8px' }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => deleteStageSet(stageSet.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* StageSet Dialog */}
      <Dialog open={showStageSetDialog} onClose={handleStageSetDialogClose}>
        <DialogTitle>{isEditingStageSet ? 'Edit Stage Set' : 'Create Stage Set'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={stageSetFormData.name}
            onChange={handleStageSetFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={stageSetFormData.description}
            onChange={handleStageSetFormChange}
            fullWidth
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStageSetDialogClose}>Cancel</Button>
          <Button onClick={handleStageSetFormSubmit} variant="contained" color="primary">
            {isEditingStageSet ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stage Dialog */}
      <Dialog open={showStageDialog} onClose={handleStageDialogClose}>
        <DialogTitle>Create Stage for {selectedStageSet?.name}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={stageFormData.name}
            onChange={handleStageFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={stageFormData.description}
            onChange={handleStageFormChange}
            fullWidth
            multiline
          />
          <TextField
            margin="dense"
            label="Order"
            name="order"
            type="number"
            value={stageFormData.order}
            onChange={handleStageFormChange}
            fullWidth
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="employee-label">Assign Employee</InputLabel>
            <Select
              labelId="employee-label"
              name="employeeId"
              value={stageFormData.employeeId}
              onChange={handleStageFormChange}
              fullWidth
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.user.first_name} {employee.user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStageDialogClose}>Cancel</Button>
          <Button onClick={handleStageFormSubmit} variant="contained" color="primary">
            Create Stage
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={showEditStageDialog} onClose={handleEditStageDialogClose}>
        <DialogTitle>Edit Stage</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={stageFormData.name}
            onChange={handleStageFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={stageFormData.description}
            onChange={handleStageFormChange}
            fullWidth
            multiline
          />
          <TextField
            margin="dense"
            label="Order"
            name="order"
            type="number"
            value={stageFormData.order}
            onChange={handleStageFormChange}
            fullWidth
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="employee-label">Assign Employee</InputLabel>
            <Select
              labelId="employee-label"
              name="employeeId"
              value={stageFormData.employeeId}
              onChange={handleStageFormChange}
              fullWidth
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.user.first_name} {employee.user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditStageDialogClose}>Cancel</Button>
          <Button onClick={handleEditStageFormSubmit} variant="contained" color="primary">
            Update Stage
          </Button>
          <Button onClick={() => deleteStage(selectedStage.id)} variant="outlined" color="error">
            Delete Stage
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StageSetList;
