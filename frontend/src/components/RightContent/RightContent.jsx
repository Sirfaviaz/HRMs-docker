import React from 'react';
import { Box } from '@mui/material';
import Dashboard from './Menu/DashboardPage';
import Mails from './Menu/Messaging';
import Meetings from './Menu/Meetings';
import JobPostings from './Recruitment/JobPostings';
import Candidates from './Recruitment/Candidates';
import StageSetList from './Recruitment/StageSetList';
import Employee from './Organization/Employee';
import AttendanceCalendar from './Organization/AttendanceCalendar';
import Report from './Organization/Report';
import Employees from './Organization/Employee/Employees';
import Profile from './Organization/Employee/Profile';
import Settings from './Organization/Settings'
import DocumentRequest from './Organization/Employee/DocumentRequest';
import Status from './Recruitment/Status'

const RightContent = ({ selectedOption }) => {
  let content;
  switch (selectedOption) {
    case 'dashboard':
      content = <Dashboard />;
      break;
    case 'mails':
      content = <Mails />;
      break;
    case 'meetings':
      content = <Meetings />;
      break;
    case 'jobs':
      content = <JobPostings />;
      break;
    case 'candidates':
      content = <Candidates />;
      break;
    case 'referrals':
      content = <StageSetList />;
      break;
    case 'status':
        content = <Status />; 
        break;
    case 'employee':
      content = <Employee />; // New case for "Employees"
      break;
    case 'employees':
        content = <Employees />; // New case for "Employees"
        break;
    
    case 'profile':
      content = <Profile />; // New case for "Profile"
      break;
    case 'document-request':
      content = <DocumentRequest />; // New case for "Document Request"
      break;
    case 'structure':
      content = <AttendanceCalendar />;
      break;
    case 'report':
      content = <Report />;
      break;
    case 'settings':
      content = <Settings />;
      break;
    default:
      content = <Dashboard />; // Default to Dashboard
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, height: '100%', overflowY: 'auto', width:'100%' }}>
      {content}
    </Box>
  );
};

export default RightContent;
