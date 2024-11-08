import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';  // For accessing user state from Redux
import Calendar from 'react-calendar';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../../../services/api';  // Adjust the path as necessary
import 'react-calendar/dist/Calendar.css';  // Include calendar CSS

const AttendanceCalendar = () => {
  const user = useSelector((state) => state.user);  // Access user details from Redux store
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);  // To store all employee attendance
  const [employees, setEmployees] = useState([]);  // Store the list of employees
  const [selectedEmployee, setSelectedEmployee] = useState(user.user_id);  // Set the selected employee to the logged-in user by default
  const [loading, setLoading] = useState(false);

  // Fetch the list of employees for HR/Admin users
  const fetchEmployees = async () => {
    try {
      const response = await api.get('employees/employees');  // Assuming an endpoint to fetch employees
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch all attendance records for the selected employee
  const fetchAllAttendanceLogs = async (employeeId) => {
    setLoading(true);
    try {
      const response = await api.get(`attendance/attendance/records/?employee_id=${employeeId}`);
      setAllAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed attendance for the selected date
  const fetchDetailedAttendance = async (date, employeeId) => {
    setLoading(true);
    try {
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const response = await api.get(`attendance/attendance/records/`, {
        params: {
          date: formattedDate,
          employee_id: employeeId,
        },
      });
      setAttendanceLogs(response.data);
    } catch (error) {
      console.error('Error fetching attendance logs for the date:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.isHR || user.isAdmin) {
      fetchEmployees();  // Fetch the list of employees if the user is HR or Admin
    }
    fetchAllAttendanceLogs(selectedEmployee);  // Fetch attendance for the logged-in user (or selected employee)
  }, [selectedEmployee]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchDetailedAttendance(date, selectedEmployee);  // Fetch logs for the selected date and employee
  };

  // Get log for a specific date from all attendance logs
  const getLogForDate = (date) => {
    return allAttendance.find(
      (log) => new Date(log.date).toDateString() === date.toDateString()
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Calendar
      </Typography>

      {/* Show employee dropdown only if the user is HR or Admin */}
      {(user.isHR || user.isAdmin) && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="employee-select-label">Select Employee</InputLabel>
          <Select
            labelId="employee-select-label"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.user.first_name} {employee.user.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileContent={({ date, view }) => {
          if (view === 'month') {
            const log = getLogForDate(date);
            if (log && log.clock_in_time && log.clock_out_time) {
              return (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'green',
                    opacity: 0.3,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    borderRadius: '50%',
                  }}
                />
              );
            }
          }
          return null;
        }}
        showNeighboringMonth={false}
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Logs for {selectedDate.toDateString()}
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {attendanceLogs.length > 0 ? (
              attendanceLogs.map((log, index) => (
                <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={`Clock In: ${new Date(log.clock_in_time).toLocaleTimeString() || 'N/A'}, Clock Out: ${new Date(log.clock_out_time).toLocaleTimeString() || 'N/A'}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography>No logs available for this date.</Typography>
            )}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default AttendanceCalendar;
