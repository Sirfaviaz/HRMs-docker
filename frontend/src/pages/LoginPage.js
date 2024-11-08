import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import Cookies from 'js-cookie';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/accounts/login/', {
        identifier,
        password,
      });
  
      // Store tokens in cookies
      Cookies.set('access', response.data.access, { expires: 1 });
      Cookies.set('refresh', response.data.refresh, { expires: 7 });
  
      // Decode JWT to get user info
      const tokenPayload = JSON.parse(atob(response.data.access.split('.')[1]));
      const user_id = tokenPayload.user_id;
      const username = tokenPayload.username;
      const isAdmin = tokenPayload.is_admin;
      const isHR = tokenPayload.is_hr;
      const isManager = tokenPayload.is_manager;
  
      // Dispatch to Redux store
      dispatch(setUser({ user_id, username, isAdmin, isHR, isManager }));
  
      // Save user info in localStorage
      localStorage.setItem('user', JSON.stringify({ user_id, username, isAdmin, isHR, isManager }));
  
      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: '#fff',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="identifier"
            label="Email or Username"
            name="identifier"
            autoComplete="identifier"
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;
