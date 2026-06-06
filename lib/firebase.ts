import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZtEX4rgUq-2xw6UIyC7RhPgrex5UuDVE",
  authDomain: "gdvideo-app.firebaseapp.com",
  projectId: "gdvideo-app",
  storageBucket: "gdvideo-app.firebasestorage.app",
  messagingSenderId: "486880486557",
  appId: "1:486880486557:web:5d077327908a2c4d952074",
  measurementId: "G-EW2ZH7G8MM"
};

// Initialize Firebase (safeguarded against duplicate client hot-reloading)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
