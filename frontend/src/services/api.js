// import axios from 'axios';
// import Cookies from 'js-cookie';

// const api = axios.create({
//   baseURL: 'http://localhost:8000', // Replace with your backend URL
// });

// // Add a request interceptor to include the access token in headers
// api.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get('access');
//     if (token) {
//       config.headers['Authorization'] = 'Bearer ' + token;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor to handle token refreshing
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // If the error is 401 and the request has not been retried yet
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Get the refresh token from cookies
//         const refreshToken = Cookies.get('refresh');

//         // If refresh token is available, try to refresh the access token
//         if (refreshToken) {
//           const response = await axios.post('http://localhost:8000/api/token/refresh/', {
//             refresh: refreshToken,
//           });

//           // Save the new access token
//           Cookies.set('access', response.data.access);

//           // Update the Authorization header and retry the original request
//           originalRequest.headers['Authorization'] = 'Bearer ' + response.data.access;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         // If refreshing fails, remove the tokens and optionally redirect to login
//         Cookies.remove('access');
//         Cookies.remove('refresh');
//         console.error('Token refresh failed, redirecting to login.');
//         // Optionally: Redirect to login page
//         window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

//src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const backendHost = 'localhost:8000'; // Define the backend host here

const api = axios.create({
  baseURL: `http://${backendHost}`, // Use the backendHost to create the baseURL
});

// Add a request interceptor to include the access token in headers
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refreshing
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and the request has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get the refresh token from cookies
        const refreshToken = Cookies.get('refresh');

        // If refresh token is available, try to refresh the access token
        if (refreshToken) {
          const response = await axios.post(`http://${backendHost}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          // Save the new access token
          Cookies.set('access', response.data.access);

          // Update the Authorization header and retry the original request
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.access;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refreshing fails, remove the tokens and optionally redirect to login
        Cookies.remove('access');
        Cookies.remove('refresh');
        console.error('Token refresh failed, redirecting to login.');
        // Optionally: Redirect to login page
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export { backendHost }; // Export backendHost for reuse
export default api;
