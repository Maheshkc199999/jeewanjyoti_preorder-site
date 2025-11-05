/* eslint-disable no-undef */
// Firebase Messaging service worker (uses compat SDK as recommended for SW)

importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCRqXlc15nLSb_yWwpgcMIpc3BwoMFuR4E',
  authDomain: 'jeewan-jyoti-digital-care.firebaseapp.com',
  projectId: 'jeewan-jyoti-digital-care',
  storageBucket: 'jeewan-jyoti-digital-care.firebasestorage.app',
  messagingSenderId: '851998918583',
  appId: '1:851998918583:web:dab7664a8ebc3ba531ca32',
  measurementId: 'G-LDMV7W4EFV'
});

const messaging = firebase.messaging();

// Optional: display notifications when app is in background
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload?.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload?.notification?.body || '',
    icon: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});


