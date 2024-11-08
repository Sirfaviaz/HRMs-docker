import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert } from 'antd';
import api from '../../../../../services/api';  // Import the API service

const ClockInStatus = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [hoursOnline, setHoursOnline] = useState(0);
  const [minutesOnline, setMinutesOnline] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch clock-in status
    api.get('/attendance/clock-in-status')  // Ensure this matches your endpoint
      .then(response => {
        const data = response.data;
        if (data.clocked_in) {
          setClockedIn(true);
          setHoursOnline(data.hours_online);
          setMinutesOnline(data.minutes_online);
        } else {
          setClockedIn(false);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching clock-in status:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading clock-in status...</p>;
  }

  return (
    <Card style={{ width: '400px', margin: '20px auto', textAlign: 'center' }}>
      {clockedIn ? (
        <>
          <Typography.Title level={3}>You are Clocked In</Typography.Title>
          <Typography.Paragraph>
            You have been online for {hoursOnline} hours and {minutesOnline} minutes.
          </Typography.Paragraph>

          {/* Display a reminder if the employee has been clocked in for more than 8 hours */}
          {hoursOnline >= 8 && (
            <Alert
              message="Reminder"
              description="You have been online for more than 8 hours. Please remember to clock out."
              type="warning"
              showIcon
            />
          )}
        </>
      ) : (
        <Alert
          message="Not Clocked In"
          description="You haven't clocked in yet. Please clock in to start tracking your time."
          type="warning"
          showIcon
        />
      )}
    </Card>
  );
};

export default ClockInStatus;
