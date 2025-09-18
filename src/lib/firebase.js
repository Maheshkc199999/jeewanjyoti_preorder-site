import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvGwygt6nT5XTwLJZDPxfvLp2mIx6jCzM",
  authDomain: "jeewan-jyoti-digital-care.firebaseapp.com",
  projectId: "jeewan-jyoti-digital-care",
  storageBucket: "jeewan-jyoti-digital-care.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
