importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBc_62SzCQ0f2F_hDzxxkaj0KsE93m60Ro",
    authDomain: "quranu-cdd15.firebaseapp.com",
    projectId: "quranu-cdd15",
    storageBucket: "quranu-cdd15.firebasestorage.app",
    messagingSenderId: "324006127257",
    appId: "1:324006127257:web:e42f0c5c675495a7183a08",
    measurementId: "G-72YB72VHFV"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
