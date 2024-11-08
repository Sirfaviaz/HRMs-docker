import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion'; // For animations
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    
    // Basic password strength validation
    if (password.length < 6) {
      setPasswordStrength('Weak');
    } else if (password.length < 8) {
      setPasswordStrength('Medium');
    } else if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[@$!%*?&#]/.test(password)) {
      setPasswordStrength('Strong');
    } else {
      setPasswordStrength('Medium');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/accounts/reset-password/', {
        uidb64: uid,
        token: token,
        new_password: newPassword,
      });
      setMessage('Password reset successful.');
      setErrorMessage('');
      setLoading(false);
    } catch (error) {
      setErrorMessage('Error resetting password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f6f8',
        padding: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 3,
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Please enter your new password below.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={handlePasswordChange}
            helperText={`Password strength: ${passwordStrength}`}
            error={newPassword.length < 6}
          />

          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={newPassword !== confirmPassword && confirmPassword !== ''}
            helperText={
              confirmPassword !== '' && newPassword !== confirmPassword
                ? 'Passwords do not match'
                : ''
            }
          />

          <Box mt={2} display="flex" justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ padding: '12px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        </form>

        <Collapse in={!!message || !!errorMessage}>
          {message && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              sx={{ marginTop: 2 }}
            >
              {message}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Collapse>
      </Box>
    </Box>
  );
};

export default ResetPassword;
