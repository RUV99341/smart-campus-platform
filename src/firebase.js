// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVQwBwdFoapoGIGhgSB6qzDOyeap_GN40",
  authDomain: "smartcampusplatform-ce718.firebaseapp.com",
  projectId: "smartcampusplatform-ce718",
  storageBucket: "smartcampusplatform-ce718.firebasestorage.app",
  messagingSenderId: "688341377206",
  appId: "1:688341377206:web:8f294c8536416978e6c617"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;