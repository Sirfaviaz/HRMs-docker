// src/requestNotificationPermission.js
import { messaging } from './firebase';
import { getToken } from 'firebase/messaging';
import  api  from './services/api';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');

       // Get the registration token
       const token = await getToken(messaging, {
        vapidKey: 'BNG5vt-4PQzzNfOe5vHpgF38Z-OlH5IRSV8y3ObsTBLcfIw3HYukND0YQ-1JDGxxoDycjjrwqqmnPcwAs7L8mV0',
      });

      console.log('Device token:', token);
      // Send the token to your backend via an API
      await sendTokenToServer(token);
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
};

const sendTokenToServer = async (token) => {
    try {
      const response = await api.post('/notifications/register-device-token/', {
        device_token: token,
      });
  
      if (response.status === 200 || response.status === 201) {
        console.log('Token sent to server successfully.');
      } else {
        console.error('Failed to send token to server.');
      }
    } catch (error) {
      console.error('An error occurred while sending token to server:', error);
    }
  };
