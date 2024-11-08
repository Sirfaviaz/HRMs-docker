import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
  if (!token) return true;
  const { exp } = jwtDecode(token);
  return Date.now() >= exp * 1000; // Convert expiration time to milliseconds
};
