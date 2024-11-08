import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';  // Ensure correct path to userSlice

const store = configureStore({
  reducer: {
    user: userReducer,  // Make sure this matches the slice name (in this case, 'user')
  },
});

export default store;
