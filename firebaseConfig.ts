// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC16yWGG9Ci01Y3wglVLWS43xVLWzX2wrU",
  authDomain: "reportaya2.firebaseapp.com",
  projectId: "reportaya2",
  storageBucket: "reportaya2.firebasestorage.app",
  messagingSenderId: "288155175827",
  appId: "1:288155175827:web:d4f7ac482e2fc552767666",
  measurementId: "G-0D0PJQ149G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Inicializar Firestore
const db = getFirestore(app);

export { auth, googleProvider, facebookProvider, db };