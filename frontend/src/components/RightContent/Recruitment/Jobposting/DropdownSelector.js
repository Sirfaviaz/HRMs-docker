import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const DropdownSelector = ({ label, value, options, handleChange }) => {
  return (
    <FormControl fullWidth required>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={handleChange} label={label}>
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.title|| option.name || (option.user && `${option.user.first_name} ${option.user.last_name}`) || 'Unknown'} {/* Adjust for employee names safely */}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DropdownSelector;

