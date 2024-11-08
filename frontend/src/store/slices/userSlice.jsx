//slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Try to load user data and token from localStorage, otherwise default to initial state
const initialState = () => {
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  
  if (savedUser && savedToken) {
    return {
      ...JSON.parse(savedUser),
      token: savedToken,
      isAuthenticated: true,  // Set authenticated if user data and token exist
    };
  }
  
  return {
    user_id: null,
    username: '',
    isAdmin: false,
    isHR: false,
    isManager: false,
    token: null,
    isAuthenticated: false,
  };
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialState(),
  reducers: {
    setUser(state, action) {
      const { user_id, username, isAdmin, isHR, isManager, token } = action.payload;
      
      state.user_id = user_id;
      state.username = username;
      state.isAdmin = isAdmin;
      state.isHR = isHR;
      state.isManager = isManager;
      state.token = token;  // Store the JWT token
      state.isAuthenticated = true;  // Set authentication status
      
      // Save user info and token in localStorage
      localStorage.setItem('user', JSON.stringify({ user_id, username, isAdmin, isHR, isManager }));
      localStorage.setItem('token', token);  // Save the token separately
    },
    clearUser(state) {
      state.user_id = null;
      state.username = '';
      state.isAdmin = false;
      state.isHR = false;
      state.isManager = false;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage on logout
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
