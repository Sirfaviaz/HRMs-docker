// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyCY7fI2HPPMQU0a1ShvdSa2UzWWVg7ILds",
    authDomain: "hrms-30b51.firebaseapp.com",
    projectId: "hrms-30b51",
    storageBucket: "hrms-30b51.appspot.com",
    messagingSenderId: "403800628135",
    appId: "1:403800628135:web:324718ab2639c6b4cdb482",
    measurementId: "G-C9R872ZLKY"
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export { messaging };
