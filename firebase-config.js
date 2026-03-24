// Firebase configuration and initialization
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZEw0qsoK_aoDOntyel2ldeC5wnzIHLS4",
  authDomain: "dearest-mide.firebaseapp.com",
  projectId: "dearest-mide",
  storageBucket: "dearest-mide.firebasestorage.app",
  messagingSenderId: "390124927912",
  appId: "1:390124927912:web:1d15acc93646333c237b9d",
  measurementId: "G-26R9GPWJNW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export Firebase services for use in other modules
export { app, analytics, db, auth, storage, onAuthStateChanged };

// Global state for current user
let currentUser = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  // Dispatch custom event for auth state changes
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
});

// Utility function to get current user
export const getCurrentUser = () => currentUser;

// Utility function to check if user is authenticated
export const isAuthenticated = () => !!currentUser;

// Utility function to format dates for Firestore
export const formatDateForFirestore = (date) => {
  return date.toISOString();
};

// Utility function to format Firestore timestamp
export const formatFirestoreDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

console.log('Firebase initialized successfully');