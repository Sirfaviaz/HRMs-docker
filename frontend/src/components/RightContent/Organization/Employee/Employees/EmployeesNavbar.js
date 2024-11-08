import React, { useState } from 'react';
import { Box, Button, IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AddIcon from '@mui/icons-material/Add';
import CreateEmployeeForm from './EmployeesNavbar/CreateEmployeeForm'; // Import the create employee form

const EmployeesNavbar = ({ onViewChange, onSearchChange, onEmployeeCreated }) => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false); // Track modal open/close
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Track the employee to edit

  const handleViewChange = (mode) => {
    setViewMode(mode);
    onViewChange(mode); // Call the parent function to update the view in Employees component
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    onSearchChange(searchValue); // Call parent function to handle search term filtering
    console.log('Search term:', searchValue); // Console log the search term for debugging
  };

  const handleOpenModal = () => {
    setSelectedEmployee(null); // Ensure no employee is selected (create mode)
    setOpenModal(true); // Open modal
  };

  const handleCloseModal = () => setOpenModal(false); // Close modal

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee); // Set the employee to be edited
    setOpenModal(true); // Open modal in edit mode
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      {/* Search Bar */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearchChange} // Trigger search on input change
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
        sx={{ width: '200px' }}
      />

      {/* Filter, Group By, View Mode */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<FilterListIcon />}>
          Filter
        </Button>
        <Button variant="outlined" startIcon={<GroupWorkIcon />}>
          Group by
        </Button>
        <IconButton onClick={() => handleViewChange('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
          <ViewListIcon />
        </IconButton>
        <IconButton onClick={() => handleViewChange('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
          <ViewModuleIcon />
        </IconButton>
      </Box>

      {/* Create Button */}
      <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={handleOpenModal}>
         Create
      </Button>

      {/* Create/Edit Employee Modal */}
      <CreateEmployeeForm
        open={openModal}
        handleClose={handleCloseModal}
        onEmployeeCreated={onEmployeeCreated}
        employee={selectedEmployee} // Pass selectedEmployee to form if editing
      />
    </Box>
  );
};

export default EmployeesNavbar;
