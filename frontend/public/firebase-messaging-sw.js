// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCY7fI2HPPMQU0a1ShvdSa2UzWWVg7ILds",
    authDomain: "hrms-30b51.firebaseapp.com",
    projectId: "hrms-30b51",
    storageBucket: "hrms-30b51.appspot.com",
    messagingSenderId: "403800628135",
    appId: "1:403800628135:web:324718ab2639c6b4cdb482",
    measurementId: "G-C9R872ZLKY"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: '/firebase-logo.png' // Optional: Add an icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
