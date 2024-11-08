import React, { useEffect, useState } from 'react';
import { Card, Typography, List } from 'antd';
import api from '../../../../../services/api';  // Import the api service
import './UserMeetings.css'; // Import custom CSS for scrollbar

const UserMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch meetings assigned to the user using the custom api service
    api.get('/meetings/meetings')
      .then(response => {
        const currentDateTime = new Date();
        // Filter to show only upcoming meetings
        const upcomingMeetings = response.data.filter(meeting => new Date(meeting.start_time) > currentDateTime);
        setMeetings(upcomingMeetings);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching meetings:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading meetings...</p>;
  }

  return (
    <Card
      style={{
        width: '350px',   // Slightly wider for better spacing
        height: '450px',  // Increased height for more content
        overflowY: 'auto', // Enable vertical scrolling if content overflows
        margin: '0 auto', 
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Add subtle shadow for elegance
        borderRadius: '8px',  // Rounded corners for a softer look
      }}
      className="custom-scroll" // Apply custom scrollbar styles
    >
      <Typography.Title level={3} style={{ marginBottom: '20px' }}>Upcoming Meetings</Typography.Title>
      {meetings.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={meetings}
          renderItem={meeting => (
            <List.Item key={meeting.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Typography.Title level={4} style={{ marginBottom: '5px' }}>{meeting.title}</Typography.Title>
              <Typography.Paragraph style={{ fontSize: '14px', color: '#555' }}>
                <strong>Start:</strong> {new Date(meeting.start_time).toLocaleString()}<br />
                <strong>End:</strong> {new Date(meeting.end_time).toLocaleString()}<br />
                <strong>Location:</strong> {meeting.location}
              </Typography.Paragraph>
            </List.Item>
          )}
        />
      ) : (
        <Typography.Paragraph>No upcoming meetings.</Typography.Paragraph>
      )}
    </Card>
  );
};

export default UserMeetings;
