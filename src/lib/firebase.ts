import { initializeApp } from 'firebase/app';

// Public web config (safe to ship in the browser). Data is protected by firestore.rules, not by hiding this.
export const firebaseConfig = {
  apiKey: 'AIzaSyBMh8tqNlOydX51ln-T6PFSYD5ODMOyb-8',
  authDomain: 'stevenimanzi-46e0f.firebaseapp.com',
  projectId: 'stevenimanzi-46e0f',
  storageBucket: 'stevenimanzi-46e0f.firebasestorage.app',
  messagingSenderId: '751692212377',
  appId: '1:751692212377:web:33abcfcd977a3359bbb008',
  measurementId: 'G-LZVVD07YCY'
};

// Authorized admin accounts allowed into /admin.
export const ADMIN_EMAIL = 'info@stevenimanzi.info';
export const ADMIN_EMAILS = ['info@stevenimanzi.info', 'stivenimanzi1@gmail.com'];

export const app = initializeApp(firebaseConfig);
