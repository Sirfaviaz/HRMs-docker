import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import api from '../../../services/api';
import './ClockInOutButton.css'; // Import the CSS file for animations

const ClockInOutButtons = () => {
  const [loading, setLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false); // Track clock-in state
  const [isClockedOut, setIsClockedOut] = useState(false); // Track clock-out state

  // Fetch the clock-in and clock-out status when the component mounts
  useEffect(() => {
    const fetchClockInStatus = async () => {
      try {
        setLoading(true);
        // Make an API call to check current clock-in and clock-out status
        const response = await api.get('/attendance/status/');
        setIsClockedIn(response.data.is_clocked_in); // Set clock-in status
        setIsClockedOut(response.data.is_clocked_out); // Set clock-out status
       console.log('cc-in', response.data.is_clocked_in) 
        console.log("cc-out", response.data.is_clocked_out)
      } catch (error) {
        message.error('Error fetching clock-in status.');
      } finally {
        setLoading(false);
      }
    };

    fetchClockInStatus(); // Call the function on component mount
  }, []); // Empty dependency array to only run on mount

  const handleToggle = async () => {
    try {
      setLoading(true);
      if (!isClockedIn) {
        // If not clocked in, clock in
        await api.post('/attendance/clock-in/');
        message.success('Clock-in successful!');
        setIsClockedIn(true);
        setIsClockedOut(false); // Reset clock-out status
      } else if (!isClockedOut) {
        // If clocked in but not clocked out, clock out
        await api.post('/attendance/clock-out/');
        message.success('Clock-out successful!');
        setIsClockedOut(true);
      }
    } catch (error) {
      message.error(isClockedIn && !isClockedOut ? 'Error clocking out.' : 'Error clocking in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={`futuristic-btn ${isClockedIn && !isClockedOut ? 'clocked-out' : 'clocked-in'}`}
      onClick={handleToggle}
      loading={loading}
    >
      {isClockedIn && !isClockedOut ? 'Check Out' : 'Check In'}
    </Button>
  );
};

export default ClockInOutButtons;
