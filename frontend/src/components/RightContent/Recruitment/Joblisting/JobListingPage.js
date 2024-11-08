// src/components/JobListingPage.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Modal } from '@mui/material';
import api from '../../../../services/api';
import ApplicantForm from './ApplicantForm';  // This is the form for applying for a job

const JobListingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/job-postings/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Job Openings
      </Typography>
      <TextField
        label="Search for Jobs"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Employment Type</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.title}</TableCell>
              <TableCell>{job.department?.name || 'N/A'}</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{job.employment_type}</TableCell>
              <TableCell>
                <Button variant="contained" onClick={() => handleApplyClick(job)}>
                  Apply
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for the Applicant Form */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Apply for {selectedJob?.title}
          </Typography>
          <ApplicantForm job={selectedJob} onClose={closeModal} />
        </Box>
      </Modal>
    </Box>
  );
};

export default JobListingPage;
