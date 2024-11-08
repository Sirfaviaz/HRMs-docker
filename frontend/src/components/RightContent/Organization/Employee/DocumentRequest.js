import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux'; // Import useSelector
import api from '../../../../services/api'; // Adjust the import path

const DocumentsPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [unapprovedDocuments, setUnapprovedDocuments] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // Get the user from Redux store
  const user = useSelector((state) => state.user);
  console.log('User from Redux:', user);

  // Fetch documents from the updated endpoint
  const fetchDocuments = async () => {
    try {
      const response = await api.get('employees/documents/');
      const documents = response.data;
      // Separate approved and unapproved documents
      const approved = documents.filter((doc) => doc.approved);
      const unapproved = documents.filter((doc) => !doc.approved);
      setApprovedDocuments(approved);
      setUnapprovedDocuments(unapproved);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Fetch document requests
  const fetchDocumentRequests = async () => {
    try {
      const response = await api.get('employees/document-requests/');
      setDocumentRequests(response.data);
    } catch (error) {
      console.error('Error fetching document requests:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchDocumentRequests();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRequestDocument = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchDocumentRequests(); // Refresh the requests list after closing the modal
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Documents</Typography>
        </Grid>
        {/* Show the Add Icon only for admin or HR users */}
        {(user.isAdmin || user.isHr) && (
          <Grid item>
            <IconButton color="primary" onClick={handleRequestDocument}>
              <AddIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mt: 2 }}>
        <Tab label="Approved Documents" />
        <Tab label="Unapproved Documents" />
        <Tab label="Document Requests" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {selectedTab === 0 && (
          <DocumentList
            documents={approvedDocuments}
            user={user}
            onDocumentApproved={fetchDocuments}
          />
        )}
        {selectedTab === 1 && (
          <DocumentList
            documents={unapprovedDocuments}
            user={user}
            onDocumentApproved={fetchDocuments}
          />
        )}
        {selectedTab === 2 && (
          <DocumentRequestList requests={documentRequests} />
        )}
      </Box>

      {/* Document Request Modal */}
      <RequestDocumentModal open={isModalOpen} handleClose={handleCloseModal} />
    </Box>
  );
};

const DocumentList = ({ documents, user, onDocumentApproved }) => {
  if (documents.length === 0) {
    return <Typography>No documents to display.</Typography>;
  }

  // Function to handle approving a document
  const handleApprove = async (documentId) => {
    try {
      await api.patch(`employees/documents/${documentId}/`, { approved: true });
      onDocumentApproved(); // Refresh the document list
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  return (
    <List>
      {documents.map((doc) => (
        <ListItem key={doc.id}>
          <ListItemText
            primary={doc.name}
            secondary={`Uploaded at: ${new Date(doc.uploaded_at).toLocaleString()} | Approved: ${
              doc.approved ? 'Yes' : 'No'
            }`}
          />
          <ListItemSecondaryAction>
            <Button
              variant="outlined"
              onClick={() => window.open(doc.file, '_blank')}
            >
              View
            </Button>
            {/* Show Approve button if user is admin/HR and document is not approved */}
            {!doc.approved && (user.isAdmin || user.isHr) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleApprove(doc.id)}
                sx={{ ml: 1 }}
              >
                Approve
              </Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

const DocumentRequestList = ({ requests }) => {
  if (requests.length === 0) {
    return <Typography>No document requests to display.</Typography>;
  }

  return (
    <List>
      {requests.map((request) => (
        <ListItem key={request.id}>
          <ListItemText
            primary={request.document_name}
            secondary={`Requested by: ${request.requested_by.first_name} ${request.requested_by.last_name} on ${new Date(
              request.requested_at
            ).toLocaleDateString()}`}
          />
          <ListItemSecondaryAction>
            <Typography>{request.status}</Typography>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

const RequestDocumentModal = ({ open, handleClose }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('employees/employees/');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const requests = selectedEmployees.map((employeeId) => {
        const data = {
          employee: employeeId,
          document_name: documentName,
          message: message,
        };
        return api.post('employees/document-requests/', data);
      });
      await Promise.all(requests);
      handleClose();
    } catch (error) {
      console.error('Error requesting document:', error);
    }
  };

  const handleDeleteChip = (idToDelete) => () => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.filter((id) => id !== idToDelete)
    );
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
          width: 500,
        }}
      >
        <Typography variant="h6">Request Document</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            label="Employee"
            multiple
            value={selectedEmployees}
            onChange={(e) => {
              setSelectedEmployees(e.target.value);
            }}
            renderValue={() => null} // Hide the default render
          >
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                <Checkbox checked={selectedEmployees.indexOf(emp.id) > -1} />
                {emp.user.first_name} {emp.user.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Display selected employees as chips */}
        {selectedEmployees.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {selectedEmployees.map((id) => {
              const employee = employees.find((emp) => emp.id === id);
              return (
                employee && (
                  <Chip
                    key={id}
                    label={`${employee.user.first_name} ${employee.user.last_name}`}
                    onDelete={handleDeleteChip(id)}
                  />
                )
              );
            })}
          </Box>
        )}

        <TextField
          fullWidth
          label="Document Name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ mt: 2 }}
          disabled={selectedEmployees.length === 0 || !documentName}
        >
          Send Request
        </Button>
      </Box>
    </Modal>
  );
};



export default DocumentsPage;
