import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Tabs,
  Tab,
  Modal,
  TextField,
} from '@mui/material';
import api from '../../../../../services/api'; // Adjust the path as necessary

const DocumentsList = ({ employeeId }) => {
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch documents function
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/employees/document-list/${employeeId}/documents/`);
      const documents = response.data || [];

      // Separate documents into pending and approved
      const pendingDocs = documents.filter((doc) => !doc.approved);
      const approvedDocs = documents.filter((doc) => doc.approved);

      setPendingDocuments(pendingDocs);
      setApprovedDocuments(approvedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Documents</Typography>
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mt: 2 }}>
        <Tab label="Pending Documents" />
        <Tab label="Approved Documents" />
      </Tabs>

      {selectedTab === 0 && (
        <>
          <Button variant="contained" onClick={handleOpenModal} sx={{ mt: 2 }}>
            Upload Document
          </Button>
          {pendingDocuments.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No pending documents.</Typography>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {pendingDocuments.map((document) => (
                <Grid item xs={12} md={6} key={document.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
                    <Typography variant="body1">{document.name}</Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 1 }}
                      href={document.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View/Download
                    </Button>
                    {/* <Button
              variant="outlined"
              onClick={() => window.open(document.file, '_blank')}
            >
              View
            </Button> */}

                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Upload Document Modal */}
          <UploadDocumentModal
            open={isModalOpen}
            handleClose={handleCloseModal}
            onUploadSuccess={fetchDocuments}
            employeeId={employeeId}
          />
        </>
      )}

      {selectedTab === 1 && (
        <>
          {approvedDocuments.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No approved documents.</Typography>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {approvedDocuments.map((document) => (
                <Grid item xs={12} md={6} key={document.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
                    <Typography variant="body1">{document.name}</Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 1 }}
                      href={document.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View/Download
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

const UploadDocumentModal = ({ open, handleClose, onUploadSuccess, employeeId }) => {
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !documentName) return;

    const formData = new FormData();
    formData.append('name', documentName);
    formData.append('file', file);
    formData.append('employee', employeeId);

    setUploading(true);

    try {
      // Send POST request to upload the document
      await api.post('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Call onUploadSuccess to refresh the documents
      onUploadSuccess();

      handleClose();
      // Reset form fields
      setDocumentName('');
      setFile(null);
    } catch (error) {
      console.error('Error uploading document:', error);
      // Handle error (e.g., show error message)
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
        }}
      >
        <Typography variant="h6">Upload Document</Typography>
        <TextField
          fullWidth
          label="Document Name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Choose File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
        <Button
          variant="contained"
          onClick={handleUpload}
          sx={{ mt: 2 }}
          disabled={!file || !documentName || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
    </Modal>
  );
};

export default DocumentsList;
