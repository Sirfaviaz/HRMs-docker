import React, { useState, useEffect } from 'react';
import { Button, Table, TableHead, TableBody, TableCell, TableRow, Modal, Box, Typography } from '@mui/material';
import JobPostingForm from './Jobposting/JobPostingForm';
import api from '../../../services/api';

const JobPostings = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);

  const fetchJobPostings = async () => {
    try {
      const response = await api.get('/jobs/job-postings/');
      console.log("res",response.data)
      setJobPostings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [departmentsResponse, positionsResponse, employeesResponse] = await Promise.all([
        api.get('departments/departments/'),
        api.get('departments/positions/'),
        api.get('employees/employees/'),
      ]);

      setDepartments(departmentsResponse.data);
      setPositions(positionsResponse.data);
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  useEffect(() => {
    fetchJobPostings();
    fetchDropdownData();
  }, []);

  const showModal = (job = null) => {
    setCurrentJob(job);
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setCurrentJob(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (currentJob) {
        await api.put(`/jobs/job-postings/${currentJob.id}/`, values);
      } else {
        await api.post('/jobs/job-postings/', values);
      }
      fetchJobPostings();
      handleClose();
    } catch (error) {
      console.error('Error saving job posting:', error);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await api.delete(`/jobs/job-postings/${jobId}/`);
      fetchJobPostings();
    } catch (error) {
      console.error('Error deleting job posting:', error);
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={() => showModal()}>Create Job Posting</Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Employment Type</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobPostings.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.title}</TableCell>
              <TableCell>{job.department_name || 'N/A'}</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{job.employment_type}</TableCell>
              <TableCell>
                <Button variant="outlined" onClick={() => showModal(job)}>Edit</Button>
                <Button variant="outlined" color="error" onClick={() => handleDelete(job.id)} sx={{ ml: 1 }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal open={isModalVisible} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {currentJob ? 'Edit Job Posting' : 'Create Job Posting'}
          </Typography>
          <JobPostingForm
            initialValues={currentJob}
            onSubmit={handleSubmit}
            departments={departments}
            positions={positions}
            employees={employees}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default JobPostings;
