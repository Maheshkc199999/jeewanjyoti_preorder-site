import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, isSupported, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration (provided)
const firebaseConfig = {
  apiKey: "AIzaSyCRqXlc15nLSb_yWwpgcMIpc3BwoMFuR4E",
  authDomain: "jeewan-jyoti-digital-care.firebaseapp.com",
  projectId: "jeewan-jyoti-digital-care",
  storageBucket: "jeewan-jyoti-digital-care.firebasestorage.app",
  messagingSenderId: "851998918583",
  appId: "1:851998918583:web:dab7664a8ebc3ba531ca32",
  measurementId: "G-LDMV7W4EFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environments)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (err) {
  // noop: analytics not available (e.g., in SSR/tests)
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Firebase Cloud Messaging (FCM)
let messagingPromise = null;
if (typeof window !== 'undefined') {
  messagingPromise = isSupported().then(async (supported) => {
    if (!supported) return null;

    // Ensure service worker is registered at the app root
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        return getMessaging(app);
      } catch (e) {
        return getMessaging(app);
      }
    }
    return getMessaging(app);
  }).catch(() => null);
}

export async function getFcmToken(vapidKey) {
  console.log('🔧 getFcmToken called with VAPID key:', vapidKey ? 'Present' : 'Missing')
  if (!messagingPromise) {
    console.warn('⚠️ messagingPromise is null - FCM not initialized')
    return null;
  }
  const messaging = await messagingPromise;
  if (!messaging) {
    console.warn('⚠️ messaging is null - FCM not supported or failed to initialize')
    return null;
  }
  console.log('✅ Messaging service initialized, requesting token...')
  try {
    // You must pass your Web Push certificate key (VAPID key) from Firebase console
    const token = await getToken(messaging, { vapidKey });
    console.log('🎫 Token retrieved from Firebase:', token ? 'Success' : 'Failed')
    if (token) {
      console.log('📋 Full FCM Token:', token)
    }
    return token || null;
  } catch (e) {
    console.error('❌ Error getting FCM token:', e)
    console.error('❌ Error message:', e.message)
    console.error('❌ Error code:', e.code)
    return null;
  }
}

export async function onFcmMessage(callback) {
  if (!messagingPromise) return () => {};
  const messaging = await messagingPromise;
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export { app, analytics };
export default app;
