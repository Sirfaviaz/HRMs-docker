// src/components/RightContent/Recruitment/Candidates.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Modal, Box } from '@mui/material';
import api from '../../../services/api';
import CandidateForm from './Candidates/CandidateForm'; // Updated form with the new fields

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);  // Fetch job postings for the dropdown
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/jobs/applications/');
      setCandidates(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setLoading(false);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const response = await api.get('/jobs/job-postings/');
      console.log("candi_form",response.data)
      setJobPostings(response.data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobPostings(); // Fetch job postings for candidate form
  }, []);

  const openModal = (candidate = null) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleSubmit = async (formData) => {
    console.log("candi_form",formData)
    try {
      if (selectedCandidate) {
        await api.patch(`/jobs/applications/${selectedCandidate.id}/`, formData);
      } else {
        await api.post('/jobs/applications/', formData);
      }
      fetchCandidates();
      closeModal();
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Candidates</Typography>
      <Button variant="contained" color="primary" onClick={() => openModal()}>
        Create New Candidate
      </Button>

      {/* Candidate Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Resume</TableCell> {/* New column for resume link */}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>{candidate.first_name} {candidate.last_name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.post_title || 'N/A'}</TableCell>
              <TableCell>{candidate.status}</TableCell>
              <TableCell>
                {candidate.resume ? (
                  <a href={candidate.resume} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                ) : (
                  'No Resume'
                )}
              </TableCell>
              <TableCell>
                <Button variant="outlined" onClick={() => openModal(candidate)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for creating/editing candidates */}
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
          <CandidateForm
            initialValues={selectedCandidate}
            onSubmit={handleSubmit}
            onClose={closeModal}
            jobPostings={jobPostings} // Pass job postings to the form
          />
        </Box>
      </Modal>
    </div>
  );
};

export default Candidates;
