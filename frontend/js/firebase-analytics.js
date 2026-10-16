import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBscgvb_cPjpYIYTQd2GV2rNxGhzsrGD2U',
  authDomain: 'teju-test-nodejs-backend.firebaseapp.com',
  projectId: 'teju-test-nodejs-backend',
  storageBucket: 'teju-test-nodejs-backend.firebasestorage.app',
  messagingSenderId: '1044740971622',
  appId: '1:1044740971622:web:3d8372541fd63ae502e1a7',
  measurementId: 'G-BHXB1MNRKC'
};

const app = initializeApp(firebaseConfig);

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch((error) => {
    console.warn('Firebase Analytics could not be initialized.', error);
  });