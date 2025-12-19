// Firebase initialization and exports
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDuX0tV3Xv0iPexFU3vB13OnRK4JZhckWI",
  authDomain: "smart-campus-platform-1800e.firebaseapp.com",
  projectId: "smart-campus-platform-1800e",
  storageBucket: "smart-campus-platform-1800e.firebasestorage.app",
  messagingSenderId: "673065425954",
  appId: "1:673065425954:web:fd553863161976b4c03e7b",
  measurementId: "G-BPM2TV9NX6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
