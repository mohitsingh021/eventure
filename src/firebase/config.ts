import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7znuGUwhYKouZv6upubuwcVlt4GaVB0M",
  authDomain: "eventure-8fa50.firebaseapp.com",
  projectId: "eventure-8fa50",
  storageBucket: "eventure-8fa50.appspot.com",
  messagingSenderId: "414835684787",
  appId: "1:414835684787:web:47a8aeb5cbb1f6769ac7c6",
  measurementId: "G-G1MQVSJ5TN",
  databaseURL: "https://eventure-8fa50-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Export for backward compatibility
const db = firestore;
const rtdb = database;

// Export all services
export { app, analytics, auth, firestore, database, storage };
export { db, rtdb }; // Aliases for compatibility

export default app; 