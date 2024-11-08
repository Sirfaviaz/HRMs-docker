import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Pagination, Box } from '@mui/material';
import EmployeesNavbar from './Employees/EmployeesNavbar'; // Import the updated EmployeesNavbar
import EmployeeCard from './Employees/EmployeeCard'; // Import EmployeeCard component
import CreateEmployeeForm from './Employees/EmployeesNavbar/CreateEmployeeForm'; // Import CreateEmployeeForm
import api from '../../../../services/api'; // Assuming you have an API service set up

const Employees = () => {
  const [employees, setEmployees] = useState([]); // Store employees
  const [loading, setLoading] = useState(true); // Loading state
  const [viewMode, setViewMode] = useState('list'); // View mode for list or grid
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Filtered employees based on search
  const [openModal, setOpenModal] = useState(false); // Modal open state
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Track selected employee for editing

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const employeesPerPage = 9; // Number of employees per page

  // Fetch employees when component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees/employees');
      console.log("employee_cards", response.data);
      setEmployees(response.data);
      setFilteredEmployees(response.data); // Initially, all employees are shown
      setCurrentPage(1); // Reset to first page after fetching new data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  // Handle view change (list or grid)
  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  // Handle search input
  const handleSearchChange = (searchTerm) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = employees.filter((employee) =>
      `${employee.user.first_name} ${employee.user.last_name}`.toLowerCase().includes(lowercasedSearchTerm) ||
      employee.user.email.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  // Handle employee creation (triggered after employee is created)
  const handleEmployeeCreated = () => {
    fetchEmployees(); // Refresh employee list after creation
    setOpenModal(false); // Close modal
    setSelectedEmployee(null); // Reset selected employee after action
  };

  // Handle opening modal for creating or updating an employee
  const handleOpenModal = (employee = null) => {
    setSelectedEmployee(employee); // Set employee for editing or null for creating
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEmployee(null); // Reset selected employee when modal is closed
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return <CircularProgress />; // Show loading spinner while fetching data
  }

  // Pagination calculations
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  return (
    <Box sx={{ maxWidth: '80%', margin: '0 auto', padding: 2 }}> {/* Limit width and center content */}
      {/* Pass necessary props to EmployeesNavbar */}
      <EmployeesNavbar
        onViewChange={handleViewChange}
        onSearchChange={handleSearchChange}
        onEmployeeCreated={handleEmployeeCreated} // Modal close trigger
      />

      {/* Display employees in list or grid view based on viewMode */}
      <Grid container spacing={2}>
        {currentEmployees.length > 0 ? (
          currentEmployees.map((employee) => (
            <Grid item xs={viewMode === 'grid' ? 4 : 12} key={employee.id}>
              <EmployeeCard
                employee={employee} // Pass the entire employee object
                onEdit={() => handleOpenModal(employee)} // Trigger modal open for editing
              />
            </Grid>
          ))
        ) : (
          <p>No employees found</p>
        )}
      </Grid>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
        />
      )}

      {/* Create or Edit Employee Modal */}
      <CreateEmployeeForm
        open={openModal}
        handleClose={handleCloseModal}
        onEmployeeCreated={handleEmployeeCreated}
        employee={selectedEmployee} // Pass employee data to form when editing
      />
    </Box>
  );
};

export default Employees;
