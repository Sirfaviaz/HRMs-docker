import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Checkbox,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../../../../../services/api'; // Assuming api is an Axios instance

// Validation schema
const MeetingSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  start_time: Yup.date().required('Required'),
  end_time: Yup.date()
    .required('Required')
    .min(Yup.ref('start_time'), 'End time must be after start time'),
  participants: Yup.array().min(1, 'Select at least one participant'),
});

const MeetingForm = ({ onClose, initialValues, isEditing }) => {
  const [users, setUsers] = useState([]); // Initialize users as an empty array
  const [loading, setLoading] = useState(true); // Loading state for the API call
  const [error, setError] = useState(null); // Error state for handling issues

  // Fetch available users
  const loadUsers = () => {
    api
      .get('/employees/employees/') // Adjust this to the correct endpoint
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data); // Ensure data is an array before setting state
        } else {
          setUsers([]); // Set an empty array if the response is not what you expect
        }
        setLoading(false); // End loading once data is fetched
      })
      .catch((error) => {
        setError('Error fetching users');
        setLoading(false); // End loading if there's an error
      });
  };

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Format initial values
  const formatInitialValues = (values) => {
    return {
      ...values,
      start_time: values?.start_time ? new Date(values.start_time) : new Date(),
      end_time: values?.end_time ? new Date(values.end_time) : new Date(),
      participants: values?.participants || [], // participants is an array of user IDs
    };
  };

  if (loading) {
    return <Typography>Loading users...</Typography>; // Display loading indicator
  }

  if (error) {
    return <Typography color="error">{error}</Typography>; // Display error message
  }

  return (
    <Formik
      initialValues={formatInitialValues(initialValues)}
      validationSchema={MeetingSchema}
      enableReinitialize // Ensure the form updates when initialValues change
      onSubmit={(values, { setSubmitting, setErrors }) => {
        const participant_ids = values.participants; // participants is an array of user IDs

        const meetingData = {
          ...values,
          participant_ids, // Send participant IDs to the backend
        };

        const apiCall = isEditing
          ? api.put(`/meetings/meetings/${values.id}/`, meetingData)
          : api.post('/meetings/meetings/', meetingData);

        apiCall
          .then(() => {
            setSubmitting(false);
            onClose();
          })
          .catch((error) => {
            setSubmitting(false);
            if (error.response && error.response.data) {
              setErrors(error.response.data);
            } else {
              console.error('Error creating or updating meeting:', error);
            }
          });
      }}
    >
      {({ values, isSubmitting, errors, touched, setFieldValue }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form>
            <Typography variant="h6" gutterBottom>
              {isEditing ? 'Edit Meeting' : 'Schedule a New Meeting'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="title"
                  label="Meeting Title"
                  fullWidth
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <DateTimePicker
                  label="Start Time"
                  value={values.start_time}
                  onChange={(value) => setFieldValue('start_time', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={touched.start_time && !!errors.start_time}
                      helperText={touched.start_time && errors.start_time}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <DateTimePicker
                  label="End Time"
                  value={values.end_time}
                  onChange={(value) => setFieldValue('end_time', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={touched.end_time && !!errors.end_time}
                      helperText={touched.end_time && errors.end_time}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={touched.participants && !!errors.participants}>
                  <InputLabel id="participants-label">Participants</InputLabel>
                  <Select
                    labelId="participants-label"
                    multiple
                    value={values.participants}
                    onChange={(event) => {
                      const selectedIds = event.target.value;
                      setFieldValue('participants', selectedIds);
                    }}
                    input={<OutlinedInput label="Participants" />}
                  >
                    {users.length > 0 ? (
                      users.map((user) => (
                        <MenuItem key={user.user.id} value={user.user.id}>
                          <Checkbox checked={values.participants.includes(user.user.id)} />
                          <Typography>{`${user.user.first_name || ''} ${user.user.last_name || ''} (${user.user.email})`}</Typography>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No users available</MenuItem>
                    )}
                  </Select>
                  {touched.participants && errors.participants && (
                    <Typography color="error" variant="caption">
                      {errors.participants}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Selected Participants Box */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {values.participants.map((participantId) => {
                    const selectedUser = users.find(user => user.user.id === participantId);
                    return selectedUser ? (
                      <Chip
                        key={selectedUser.user.id}
                        label={`${selectedUser.user.first_name || ''} ${selectedUser.user.last_name || ''} (${selectedUser.user.email || ''})`}
                        onDelete={() => {
                          setFieldValue(
                            'participants',
                            values.participants.filter((id) => id !== selectedUser.user.id)
                          );
                        }}
                      />
                    ) : null;
                  })}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Field as={TextField} name="location" label="Location" fullWidth />
              </Grid>

              {errors.error && (
                <Grid item xs={12}>
                  <Typography color="error">{errors.error}</Typography>
                </Grid>
              )}

              <Grid item xs={12} container justifyContent="flex-end">
                <Button onClick={onClose} sx={{ marginRight: 2 }}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {isEditing ? 'Update' : 'Schedule'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        </LocalizationProvider>
      )}
    </Formik>
  );
};

export default MeetingForm;
