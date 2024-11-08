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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const JobPosting = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJobPosting, setSelectedJobPosting] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showEditStageDialog, setShowEditStageDialog] = useState(false);
  const [stageFormData, setStageFormData] = useState({ stage: '', assigned_employee: '', result: '' });
  const [stages, setStages] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch all JobPostings on component mount
  useEffect(() => {
    fetchJobPostings();
    fetchEmployees();
  }, []);

  const fetchJobPostings = async () => {
    try {
      const response = await api.get('/jobs/job-postings/');
      setJobPostings(response.data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const fetchCandidates = async (jobPostingId) => {
    try {
      const response = await api.get(`/jobs/job-postings/${jobPostingId}/applications/`);
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchStages = async (jobPostingId) => {
    try {
      const response = await api.get(`/jobs/stages/?job_posting=${jobPostingId}`);
      return response.data;  // Return stages for further filtering
    } catch (error) {
      console.error('Error fetching stages:', error);
      return [];  // Return an empty array in case of error
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/employees/');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleViewCandidates = (jobPosting) => {
    setSelectedJobPosting(jobPosting);
    fetchCandidates(jobPosting.id);
    setShowCandidateDialog(true);
  };

  const handleCloseCandidateDialog = () => {
    setShowCandidateDialog(false);
    setSelectedJobPosting(null);
    setCandidates([]);
  };

  const handleAssignStageDialogOpen = (candidate) => {
    setSelectedCandidate(candidate);
    setStageFormData({ stage: '', assigned_employee: '', result: '' });
    fetchStages(selectedJobPosting.id).then((allStages) => {
      // Filter out stages that have already been assigned to the candidate
      const assignedStageIds = candidate.stages.map(stage => stage.stage.id);
      const availableStages = allStages.filter(stage => !assignedStageIds.includes(stage.id));
      setStages(availableStages);  // Set only available stages
    });
    setShowStageDialog(true);
  };

  const handleAssignStageDialogClose = () => {
    setShowStageDialog(false);
    setSelectedCandidate(null);
  };

  const handleEditStageDialogOpen = (stage) => {
    setSelectedStage(stage);
    setStageFormData({
      stage: stage.stage.id,
      assigned_employee: stage.assigned_employee?.id || '',
      result: stage.result || '',
    });
    setShowEditStageDialog(true);
  };

  const handleEditStageDialogClose = () => {
    setShowEditStageDialog(false);
    setSelectedStage(null);
  };

  const handleStageFormChange = (e) => {
    setStageFormData({ ...stageFormData, [e.target.name]: e.target.value });
  };

  const handleAssignStageSubmit = async (e) => {
    e.preventDefault();
    try {
      const stageData = {
        candidate_application: selectedCandidate.id,
        stage_id: stageFormData.stage,
        assigned_employee_id: stageFormData.assigned_employee,
        result: stageFormData.result,
      };
      await api.post('/jobs/candidate-stages/', stageData);
      fetchCandidates(selectedJobPosting.id);
      handleAssignStageDialogClose();
    } catch (error) {
      console.error('Error assigning stage:', error);
    }
  };

  const handleEditStageSubmit = async (e) => {
    e.preventDefault();
    try {
      const stageData = {
        stage_id: stageFormData.stage,
        assigned_employee_id: stageFormData.assigned_employee,
        result: stageFormData.result,
      };
      await api.put(`/jobs/candidate-stages/${selectedStage.id}/`, stageData);
      fetchCandidates(selectedJobPosting.id);
      handleEditStageDialogClose();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleDeleteStage = async () => {
    if (window.confirm('Are you sure you want to delete this stage assignment?')) {
      try {
        await api.delete(`/jobs/candidate-stages/${selectedStage.id}/`);
        fetchCandidates(selectedJobPosting.id);
        handleEditStageDialogClose();
      } catch (error) {
        console.error('Error deleting stage assignment:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Job Postings
      </Typography>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobPostings.map((jobPosting) => (
              <TableRow key={jobPosting.id}>
                <TableCell>{jobPosting.title}</TableCell>
                <TableCell>{jobPosting.description}</TableCell>
                <TableCell>{jobPosting.location}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewCandidates(jobPosting)}
                  >
                    View Candidates
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Candidates Dialog */}
      <Dialog open={showCandidateDialog} onClose={handleCloseCandidateDialog} fullWidth maxWidth="md">
        <DialogTitle>Candidates for {selectedJobPosting?.title}</DialogTitle>
        <DialogContent>
          {candidates.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Current Stage</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>{candidate.first_name}</TableCell>
                      <TableCell>{candidate.last_name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        {candidate.stages && candidate.stages.length > 0 ? (
                          candidate.stages.map((stage) => (
                            <Chip
                              key={stage.id}
                              label={`${stage.stage.name} - ${stage.assigned_employee}`}
                              color="primary"
                              style={{ marginRight: '5px', cursor: 'pointer' }}
                              onClick={() => handleEditStageDialogOpen(stage)}
                            />
                          ))
                        ) : (
                          <Typography variant="body2">No stages assigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.stages && candidate.stages.length > 0 ? (
                          candidate.stages.map((stage) => (
                            <Typography key={stage.id} variant="body2">
                              {stage.result}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2">No result</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleAssignStageDialogOpen(candidate)}
                          style={{ marginRight: '5px' }}
                        >
                          Assign Stage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No candidates available for this job posting.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCandidateDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Stage Dialog */}
      <Dialog open={showStageDialog} onClose={handleAssignStageDialogClose}>
        <DialogTitle>Assign Stage to {selectedCandidate?.first_name} {selectedCandidate?.last_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="stage-label">Stage</InputLabel>
            <Select
              labelId="stage-label"
              name="stage"
              value={stageFormData.stage}
              onChange={handleStageFormChange}
              fullWidth
            >
              {stages.map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="employee-label">Assign Employee</InputLabel>
            <Select
              labelId="employee-label"
              name="assigned_employee"
              value={stageFormData.assigned_employee}
              onChange={handleStageFormChange}
              fullWidth
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.user.first_name} {employee.user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="result-label">Result</InputLabel>
            <Select
              labelId="result-label"
              name="result"
              value={stageFormData.result}
              onChange={handleStageFormChange}
              fullWidth
            >
              <MenuItem value="Pass">Pass</MenuItem>
              <MenuItem value="Fail">Fail</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignStageDialogClose}>Cancel</Button>
          <Button onClick={handleAssignStageSubmit} variant="contained" color="primary">
            Assign Stage
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={showEditStageDialog} onClose={handleEditStageDialogClose}>
        <DialogTitle>Edit Stage for {selectedCandidate?.first_name} {selectedCandidate?.last_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-stage-label">Stage</InputLabel>
            <Select
              labelId="edit-stage-label"
              name="stage"
              value={stageFormData.stage}
              onChange={handleStageFormChange}
              fullWidth
            >
              {stages.map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-employee-label">Assign Employee</InputLabel>
            <Select
              labelId="edit-employee-label"
              name="assigned_employee"
              value={stageFormData.assigned_employee}
              onChange={handleStageFormChange}
              fullWidth
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.user.first_name} {employee.user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-result-label">Result</InputLabel>
            <Select
              labelId="edit-result-label"
              name="result"
              value={stageFormData.result}
              onChange={handleStageFormChange}
              fullWidth
            >
              <MenuItem value="Pass">Pass</MenuItem>
              <MenuItem value="Fail">Fail</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditStageDialogClose}>Cancel</Button>
          <Button onClick={handleEditStageSubmit} variant="contained" color="primary">
            Update Stage
          </Button>
          <Button onClick={handleDeleteStage} variant="outlined" color="error">
            Delete Stage
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobPosting;
