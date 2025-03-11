// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Double-check these values from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAOAkfRltxOQ-vmDLzXysiCqEIOdH_74Hg",
  authDomain: "cookie-consent-tracker.firebaseapp.com",
  projectId: "cookie-consent-tracker",
  storageBucket: "cookie-consent-tracker.firebasestorage.app",
  messagingSenderId: "1017704573141",
  appId: "1:1017704573141:web:9844ae5d8c2d8c6ce65a5c",
  measurementId: "G-PGKQ586SM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
//if (typeof window !== 'undefined') {
  //getAnalytics(app);
//}

// Initialize Firestore
export const db = getFirestore(app);