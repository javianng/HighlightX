// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwzi4joETPq3cCrbujilblXhK4DCSERQ0",
  authDomain: "highlightx-5f313.firebaseapp.com",
  projectId: "highlightx-5f313",
  storageBucket: "highlightx-5f313.firebasestorage.app",
  messagingSenderId: "192955660709",
  appId: "1:192955660709:web:dbc8fd871aee896a7c904c",
  measurementId: "G-Q40VETD3B7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
