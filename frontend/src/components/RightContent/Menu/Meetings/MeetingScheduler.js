import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Button, Modal } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../../../services/api'; // Assuming api is an Axios instance
import MeetingForm from '../Meetings/Meetingscheduler/MeetingForm'; // Import the MeetingForm component

const localizer = momentLocalizer(moment);

const MeetingScheduler = () => {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]); // Add users state here
  const [openModal, setOpenModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Fetch users for participants selection
  const loadUsers = () => {
    api
      .get('/employees/employees/')
      .then((response) => {
        console.log('Users:', response.data); // Log users fetched from API
        setUsers(response.data); // Store users data
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  };

  // Fetch meetings from the API
  const loadMeetings = () => {
    api
      .get('/meetings/meetings/')
      .then((response) => {
        const events = response.data.map((meeting) => ({
          id: meeting.id,
          title: meeting.title,
          start: new Date(meeting.start_time),
          end: new Date(meeting.end_time),
          allDay: false,
          participants: meeting.participants, // Add participants for editing
        }));
        console.log('Meetings:', events); // Log fetched meetings
        setMeetings(events);
      })
      .catch((error) => {
        console.error('Error fetching meetings:', error);
      });
  };

  useEffect(() => {
    loadMeetings();
    loadUsers(); // Fetch users when component mounts
  }, []);

  const handleEditMeeting = (meeting) => {
    console.log('Meeting data:', meeting); // Log the meeting object to check the structure

    // Map participant emails to user IDs
    const participantsMapped = meeting.participants.map((email) => {
      const user = users.find((user) => user.user.email === email); // Find user by email
      return user ? user.user.id : null; // Return user ID or null if not found
    }).filter(id => id !== null); // Remove nulls in case some emails don't match

    const formattedMeeting = {
      ...meeting,
      start_time: new Date(meeting.start), // Ensure start time is a Date object
      end_time: new Date(meeting.end), // Ensure end time is a Date object
      participants: participantsMapped, // Use the array of user IDs
    };

    console.log('Formatted Meeting:', formattedMeeting); // Log the final formatted meeting
    setSelectedMeeting(formattedMeeting);
    setOpenModal(true);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
        <Typography variant="h4">Meeting Scheduler</Typography>
        <Button variant="contained" color="primary" onClick={() => { setSelectedMeeting(null); setOpenModal(true); }}>
          Schedule New Meeting
        </Button>
      </Grid>

      <Calendar
        localizer={localizer}
        events={meetings}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleEditMeeting} // Select event to trigger edit
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <MeetingForm
            onClose={() => {
              setOpenModal(false);
              loadMeetings(); // Reload meetings after scheduling or editing
            }}
            initialValues={selectedMeeting || {}} // Pass selected meeting data for editing
            isEditing={!!selectedMeeting} // Pass flag to indicate editing mode
            users={users} // Pass users to MeetingForm if needed
          />
        </Box>
      </Modal>
    </Box>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default MeetingScheduler;
