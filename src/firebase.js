// firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVQwBwdFoapoGIGhgSB6qzDOyeap_GN40",
  authDomain: "smartcampusplatform-ce718.firebaseapp.com",
  projectId: "smartcampusplatform-ce718",
  storageBucket: "smartcampusplatform-ce718.appspot.com",
  messagingSenderId: "688341377206",
  appId: "1:688341377206:web:8f294c8536416978e6c617"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const provider = new GoogleAuthProvider();

// Environment-specific behavior
if (process.env.NODE_ENV === "development") {
  if (window.location.hostname.includes("cloudworkstations.dev")) {
    console.log(
      "Firebase Studio detected → Using REAL Firebase services in browser (avoids Mixed Content issues)."
    );

    // ❌ DO NOT connect Firestore/Auth emulators here
    // Browser apps served over HTTPS cannot talk to HTTP emulators

  } else {
    console.log(
      "Local development detected → Emulator connections may be enabled if needed."
    );

    // OPTIONAL: Enable ONLY when running on http://localhost
    /*
    import { connectAuthEmulator } from "firebase/auth";
    import { connectFirestoreEmulator } from "firebase/firestore";

    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    */
  }
}

export default app;
