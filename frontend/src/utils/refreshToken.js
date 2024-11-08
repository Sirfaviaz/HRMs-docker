// utils/refreshToken.js
import Cookies from 'js-cookie';
import api from '../services/api'; // Assuming you have an API service for requests

export const refreshAccessToken = async () => {
  const refreshToken = Cookies.get('refresh');
  
  if (!refreshToken) return null;

  try {
    const response = await api.post('/accounts/token/refresh/', { refresh: refreshToken });
    Cookies.set('access', response.data.access, { expires: 1 });
    return response.data.access;
  } catch (err) {
    console.error('Failed to refresh token:', err);
    return null;
  }
};
