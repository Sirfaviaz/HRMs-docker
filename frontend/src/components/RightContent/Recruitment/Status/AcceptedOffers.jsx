import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button } from '@mui/material';
import api from '../../../../services/api'; // Adjust the path as needed

const AcceptedOffers = () => {
  const [acceptedCandidates, setAcceptedCandidates] = useState([]);

  useEffect(() => {
    fetchAcceptedCandidates();
  }, []);

  const fetchAcceptedCandidates = async () => {
    try {
      const response = await api.get('/jobs/candidates/accepted/'); // Assuming an endpoint to fetch accepted candidates
      setAcceptedCandidates(response.data);
    } catch (error) {
      console.error('Error fetching accepted candidates:', error);
    }
  };

  // Convert candidate to employee
  const handleConvertToEmployee = async (candidateId) => {
    try {
      await api.post(`/jobs/applications/${candidateId}/convert-to-employee/`);
      alert('Candidate successfully converted to employee');
      fetchAcceptedCandidates(); // Refresh the list after conversion
    } catch (error) {
      console.error('Error converting candidate to employee:', error);
      alert('Failed to convert candidate to employee');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Candidates Who Accepted Offers
      </Typography>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Accepted Date</TableCell>
              <TableCell>Contract</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {acceptedCandidates.map((job) => (
              <React.Fragment key={job.job_posting_id}>
                <TableRow>
                  <TableCell colSpan={7} style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    {job.job_posting_title}
                  </TableCell>
                </TableRow>
                {job.candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>{job.job_posting_title}</TableCell>
                    <TableCell>{candidate.first_name} {candidate.last_name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    {/* Accessing the salary from contract */}
                    <TableCell>{candidate.contract.salary}</TableCell>
                    {/* Accessing the accepted date from contract */}
                    <TableCell>{new Date(candidate.contract.date_accepted).toLocaleDateString()}</TableCell>
                    {/* Link to the signed contract */}
                    <TableCell>
                      {candidate.contract.signed_contract ? (
                        <Link href={candidate.contract.signed_contract} target="_blank" rel="noopener">
                          View Contract
                        </Link>
                      ) : (
                        "No Contract"
                      )}
                    </TableCell>
                    {/* Convert to Employee Button */}
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleConvertToEmployee(candidate.id)}
                      >
                        Convert to Employee
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AcceptedOffers;
